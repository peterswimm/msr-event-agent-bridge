# Phase 4: Frontend Deployment Separation

**Status**: Implementation Guide  
**Target Timeline**: Weeks 4-5 of refactoring  
**Objective**: Deploy Webchat independently to CDN, configure cross-origin support, and separate frontend/backend deployment pipelines

## Overview

Phase 4 enables deploying the Webchat component independently from the Bridge backend:

1. **Deploy Webchat library** to CDN (AWS CloudFront, Azure CDN, or similar)
2. **Configure CORS** in Bridge to accept requests from multiple origins
3. **Update deployment pipelines** for independent frontend/backend versioning
4. **Optimize costs** by separating compute resources

## Architecture Pattern

```
┌─────────────────────────────────────────┐
│      Various Frontend Applications       │
│    (Webapp A, Webapp B, Webapp C)        │
└───────────┬────────────┬────────────┬───┘
            │            │            │
    ┌───────▼─┐  ┌──────▼──┐  ┌──────▼──┐
    │  CDN    │  │  CDN    │  │  CDN    │
    │(Region1)│  │(Region2)│  │(Region3)│
    │@msr/    │  │@msr/    │  │@msr/    │
    │webchat  │  │webchat  │  │webchat  │
    └────┬────┘  └────┬────┘  └────┬────┘
         │            │            │
    ┌────▼────────────▼────────────▼────┐
    │      Bridge API Gateway           │
    │  (Single origin, all environments) │
    │  - CORS enabled                   │
    │  - Auth/validation                │
    │  - Business logic                 │
    └────┬─────────────────────────────┘
         │
    ┌────▼──────────────┐
    │  Backend Services │
    │  - Data layer     │
    │  - PostgreSQL     │
    │  - Neo4j          │
    │  - Azure SDK      │
    └───────────────────┘
```

## 1. CORS Configuration in Bridge

### 1.1 Update Express CORS Setup

**File**: [msr-event-agent-bridge/src/index.ts](../../src/index.ts)

**Current Setup**:
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

**Production Setup** (Week 1 - Phase 4):
```typescript
import cors from 'cors';

const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:5173',
  
  // Production
  'https://app.example.com',
  'https://webchat.example.com',
  
  // CDN deployments
  'https://cdn.example.com',
  'https://d1234.cloudfront.net',
  'https://myapp.azurewebsites.net',
  
  // Customer deployments (dynamic)
  ...(process.env.ADDITIONAL_ORIGINS?.split(',') || [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without origin (like mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Preflight response
app.options('*', cors());
```

### 1.2 Environment Configuration

**File**: `.env` (Bridge root)

```env
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://app.example.com
ADDITIONAL_ORIGINS=https://customer1.com,https://customer2.com

# CDN Deployment
WEBCHAT_CDN_URL=https://cdn.example.com/msr-webchat/latest
WEBCHAT_VERSION=1.0.0

# Backend
BACKEND_URL=https://api.example.com
JWT_SECRET=your-secret-here

# Logging
LOG_LEVEL=info
ENVIRONMENT=production
```

### 1.3 Testing CORS Configuration

```bash
# Test preflight request
curl -i -X OPTIONS \
  -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:3000

# Expected response headers:
# Access-Control-Allow-Origin: https://app.example.com
# Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
# Access-Control-Allow-Credentials: true
# Access-Control-Max-Age: 86400

# Test actual request
curl -X POST \
  -H "Origin: https://app.example.com" \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}' \
  http://localhost:3000/v1/chat
```

## 2. Webchat CDN Deployment

### 2.1 Build Configuration for CDN

**File**: [msr-event-agent-chat/web/chat/vite.config.ts](../../vite.config.ts)

**Update for CDN deployment**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const isCdnBuild = process.env.BUILD_MODE === 'cdn';
  
  return {
    plugins: [react()],
    build: {
      lib: isCdnBuild ? {
        entry: path.resolve(__dirname, 'src/lib/index.ts'),
        name: 'MSRWebchat',
        fileName: (format) => {
          if (format === 'umd') return 'msr-webchat.umd.js';
          if (format === 'es') return 'msr-webchat.es.js';
          return 'msr-webchat.js';
        },
        formats: ['umd', 'es']
      } : undefined,
      
      outDir: isCdnBuild ? 'dist-cdn' : 'dist-lib',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          }
        }
      }
    },
    
    server: {
      proxy: {
        '/v1': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  };
});
```

**Update package.json** (scripts section):

```json
{
  "scripts": {
    "build": "vite build",
    "build:lib": "BUILD_MODE=lib vite build",
    "build:cdn": "BUILD_MODE=cdn vite build",
    "build:all": "npm run build && npm run build:lib && npm run build:cdn",
    "preview": "vite preview"
  },
  "exports": {
    "./": "./dist-lib/index.es.js",
    "./cdn": "./dist-cdn/msr-webchat.umd.js",
    "./css": "./dist-cdn/style.css"
  }
}
```

### 2.2 Build Output Structure

After running `npm run build:cdn`:

```
msr-event-agent-chat/web/chat/dist-cdn/
├── msr-webchat.umd.js          # Universal Module Definition (~45KB)
├── msr-webchat.umd.js.map      # Source map
├── msr-webchat.es.js           # ES Module (~38KB)
├── msr-webchat.es.js.map       # Source map
├── style.css                   # Component styles (~12KB)
├── index.html                  # Standalone demo
└── README.md                   # CDN usage instructions
```

### 2.3 CDN Deployment Scripts

**File**: [scripts/deploy-cdn.sh](../../scripts/deploy-cdn.sh)

```bash
#!/bin/bash

set -e

# Configuration
CDN_BUCKET="msr-event-agent-webchat"
REGION="us-east-1"
DISTRIBUTION_ID="E1234ABCD5678"  # CloudFront distribution ID
VERSION=$(jq -r '.version' package.json)

echo "🚀 Deploying MSR Webchat v${VERSION} to CDN..."

# 1. Build for CDN
echo "📦 Building for CDN..."
npm run build:cdn

# 2. Upload to S3
echo "📤 Uploading to S3..."
aws s3 sync dist-cdn/ "s3://${CDN_BUCKET}/v${VERSION}/" \
  --region ${REGION} \
  --delete \
  --cache-control "public, immutable, max-age=31536000" \
  --exclude "*.map" \
  --exclude "*.html"

# Cache shorter for HTML and source maps
aws s3 cp dist-cdn/index.html "s3://${CDN_BUCKET}/v${VERSION}/index.html" \
  --region ${REGION} \
  --cache-control "public, max-age=3600"

aws s3 cp "dist-cdn/msr-webchat.umd.js.map" \
  "s3://${CDN_BUCKET}/v${VERSION}/msr-webchat.umd.js.map" \
  --region ${REGION} \
  --cache-control "public, max-age=3600"

# 3. Also upload to "latest" folder
echo "📌 Updating latest version..."
aws s3 sync dist-cdn/ "s3://${CDN_BUCKET}/latest/" \
  --region ${REGION} \
  --cache-control "public, max-age=300"

# 4. Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"

echo "✅ Deployment complete!"
echo "📍 URL: https://cdn.example.com/msr-webchat/v${VERSION}/msr-webchat.umd.js"
echo "📍 Latest: https://cdn.example.com/msr-webchat/latest/msr-webchat.umd.js"
```

**File**: [scripts/deploy-cdn-azure.sh](../../scripts/deploy-cdn-azure.sh)

```bash
#!/bin/bash

set -e

# Configuration
STORAGE_ACCOUNT="msr-webchat"
CONTAINER="cdn"
RESOURCE_GROUP="msr-event-agent-rg"
VERSION=$(jq -r '.version' package.json)

echo "🚀 Deploying MSR Webchat v${VERSION} to Azure CDN..."

# 1. Build for CDN
npm run build:cdn

# 2. Upload to Azure Blob Storage
echo "📤 Uploading to Azure Blob Storage..."
az storage blob upload-batch \
  --account-name ${STORAGE_ACCOUNT} \
  --destination ${CONTAINER}/v${VERSION} \
  --source ./dist-cdn \
  --resource-group ${RESOURCE_GROUP}

# 3. Set cache headers
az storage blob update \
  --account-name ${STORAGE_ACCOUNT} \
  --container-name ${CONTAINER} \
  --name "v${VERSION}/msr-webchat.umd.js" \
  --cache-control "public, immutable, max-age=31536000"

# 4. Purge CDN
echo "🔄 Purging Azure CDN cache..."
az cdn endpoint purge \
  --resource-group ${RESOURCE_GROUP} \
  --profile-name "msr-webchat-cdn" \
  --name "msr-webchat" \
  --content-paths "/*"

echo "✅ Deployment complete!"
```

## 3. Webchat Embedded Usage

### 3.1 CDN Script Loading

**HTML Integration Example**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App with MSR Webchat</title>
  
  <!-- React dependencies (peer dependencies) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <!-- MSR Webchat styles -->
  <link rel="stylesheet" href="https://cdn.example.com/msr-webchat/latest/style.css">
</head>
<body>
  <div id="app"></div>
  
  <!-- MSR Webchat component -->
  <script src="https://cdn.example.com/msr-webchat/latest/msr-webchat.umd.js"></script>
  
  <script>
    const { MSREventChat } = window.MSRWebchat;
    
    ReactDOM.createRoot(document.getElementById('app')).render(
      React.createElement(MSREventChat, {
        backendUrl: 'https://api.example.com',
        siteTitle: 'Research Event Assistant',
        theme: {
          primaryColor: '#0078d4',
          accentColor: '#50e6ff'
        },
        systemPrompt: 'You are a helpful research event assistant...',
        onMessageSent: (message) => {
          console.log('Message sent:', message);
        }
      })
    );
  </script>
</body>
</html>
```

### 3.2 NPM Package Integration

**For teams using npm**:

```javascript
import { MSREventChat } from '@msr/webchat';
import '@msr/webchat/css';

export default function MyApp() {
  return (
    <MSREventChat
      backendUrl="https://api.example.com"
      siteTitle="Research Assistant"
      onMessageSent={(message) => console.log('Sent:', message)}
    />
  );
}
```

## 4. Deployment Pipelines

### 4.1 Frontend CI/CD Pipeline

**File**: [.github/workflows/deploy-webchat.yml](../../.github/workflows/deploy-webchat.yml)

```yaml
name: Deploy Webchat to CDN

on:
  push:
    branches: [main]
    paths:
      - 'web/chat/**'
      - '.github/workflows/deploy-webchat.yml'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'web/chat/package-lock.json'
      
      - name: Install dependencies
        working-directory: web/chat
        run: npm ci
      
      - name: Run tests
        working-directory: web/chat
        run: npm test
      
      - name: Build for CDN
        working-directory: web/chat
        run: npm run build:cdn
      
      - name: Deploy to S3
        working-directory: web/chat
        run: |
          VERSION=$(jq -r '.version' package.json)
          aws s3 sync dist-cdn/ "s3://msr-webchat/v${VERSION}/" \
            --region us-east-1 \
            --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id E1234ABCD5678 \
            --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Create deployment annotation
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.repos.createDeployment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.sha,
              environment: 'cdn',
              description: 'Deployed webchat to CDN'
            });
```

### 4.2 Backend CI/CD Pipeline

**File**: [.github/workflows/deploy-bridge.yml](../../.github/workflows/deploy-bridge.yml)

```yaml
name: Deploy Bridge to Production

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
      - '.github/workflows/deploy-bridge.yml'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Build Docker image
        run: |
          docker build -t msr-event-bridge:${{ github.sha }} .
          docker tag msr-event-bridge:${{ github.sha }} msr-event-bridge:latest
      
      - name: Push to container registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push msr-event-bridge:${{ github.sha }}
          docker push msr-event-bridge:latest
      
      - name: Deploy to Azure Container Instances
        run: |
          az container create \
            --resource-group msr-event-agent-rg \
            --name event-bridge \
            --image msr-event-bridge:${{ github.sha }} \
            --ports 3000 \
            --environment-variables \
              ALLOWED_ORIGINS="${{ secrets.ALLOWED_ORIGINS }}" \
              JWT_SECRET="${{ secrets.JWT_SECRET }}" \
              BACKEND_URL="${{ secrets.BACKEND_URL }}"
        env:
          AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          AZURE_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
```

## 5. Version Management

### 5.1 Semantic Versioning

**Webchat versions**: Follow [semver.org](https://semver.org/)

```json
{
  "version": "1.2.3"
}
```

Where:
- `1` = Major version (breaking API changes)
- `2` = Minor version (new features, backward compatible)
- `3` = Patch version (bug fixes)

**Bridge versions** (separate):

```json
{
  "version": "2.1.0"
}
```

### 5.2 CDN URL Strategy

```
https://cdn.example.com/msr-webchat/v{MAJOR}.{MINOR}.{PATCH}/msr-webchat.umd.js

Examples:
https://cdn.example.com/msr-webchat/v1.0.0/msr-webchat.umd.js  # Specific version
https://cdn.example.com/msr-webchat/v1.0/msr-webchat.umd.js    # Latest patch in 1.0
https://cdn.example.com/msr-webchat/v1/msr-webchat.umd.js      # Latest minor in v1
https://cdn.example.com/msr-webchat/latest/msr-webchat.umd.js  # Bleeding edge
```

## 6. Monitoring & Analytics

### 6.1 CDN Metrics

**CloudWatch Metrics for S3 + CloudFront**:

```typescript
// Monitor successful downloads
{
  MetricName: "DownloadCount",
  Namespace: "MSR/Webchat",
  Statistic: "Sum",
  Period: 300,
  Dimensions: [
    { Name: "Version", Value: "1.0.0" },
    { Name: "FileType", Value: "umd" }
  ]
}

// Monitor request latency
{
  MetricName: "DownloadLatency",
  Namespace: "MSR/Webchat",
  Statistic: "Average",
  Period: 300,
  Unit: "Milliseconds"
}
```

### 6.2 Frontend Error Tracking

**Sentry Integration** (in Webchat component):

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/...",
  environment: "production",
  tracesSampleRate: 0.1,
  release: "1.0.0"
});

export const MSREventChat = Sentry.withErrorBoundary(
  (props: MSREventChatProps) => {
    return <ChatComponent {...props} />;
  },
  { fallback: <div>Error loading chat</div> }
);
```

## 7. Implementation Checklist

- [ ] Update Bridge CORS configuration
- [ ] Test CORS with multiple origins
- [ ] Update Vite config for CDN builds
- [ ] Create CDN deployment scripts (AWS/Azure)
- [ ] Set up GitHub Actions workflows
- [ ] Deploy Webchat v1.0.0 to CDN
- [ ] Test CDN script loading in HTML
- [ ] Update NPM package exports
- [ ] Set up analytics and monitoring
- [ ] Create deployment documentation
- [ ] Test versioning strategy
- [ ] Performance optimization review
- [ ] Cost analysis and optimization
- [ ] Team review and approval

## 8. Cost Optimization

### Estimated Monthly Costs

| Component | Quantity | Cost |
|-----------|----------|------|
| CDN (CloudFront) | 10GB/month | $0.85 |
| Storage (S3) | 100MB | $0.25 |
| API Gateway (Bridge) | 1M requests | $3.50 |
| Compute | t3.small instances | $30-50 |
| Database | PostgreSQL 2vCPU | $50-100 |
| **Total Estimated** | | **$85-155/month** |

**Optimization opportunities**:
1. Use CloudFront caching to reduce origin requests
2. Compress assets (gzip, brotli)
3. Use spot instances for non-critical workloads
4. Enable PostgreSQL auto-scaling
5. Set appropriate cache headers

## 9. Rollback Strategy

If deployment fails:

```bash
# Rollback to previous version
aws s3 sync s3://msr-webchat/v1.0.0/ dist-cdn/
git checkout v1.0.0
npm run build:cdn

# Or redirect latest to previous version
aws s3 sync s3://msr-webchat/v0.9.9/ s3://msr-webchat/latest/
```

## 10. Success Criteria

✅ Webchat deployed to CDN with multiple origin support  
✅ Bridge CORS properly configured for all origins  
✅ Frontend and backend deployments independent  
✅ Versioning strategy documented and tested  
✅ Monitoring and alerting configured  
✅ CI/CD pipelines automated  
✅ Rollback procedures documented  
✅ Performance metrics baseline established  
✅ Cost analysis complete  

---

**Related Files**:
- [PHASE3_BACKEND_RESTRUCTURING.md](./PHASE3_BACKEND_RESTRUCTURING.md) - Phase 3 details
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment guide

