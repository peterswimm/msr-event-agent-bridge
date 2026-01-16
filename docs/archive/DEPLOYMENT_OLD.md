# Deployment Guide

## Local Development

### 1. Start MSR Event Hub Backend

```bash
cd D:\code\event-agent-example\msr-event-hub
python run_server.py --port 8000
```

API docs: http://localhost:8000/docs

### 2. Start Event Bridge

```bash
cd D:\code\event-bridge
npm install
npm run dev
```

Server: http://localhost:3000

### 3. Start ShowcaseApp (optional)

```bash
cd D:\code\ShowcaseApp\showcaseapp
npm install
npm run dev
```

UI: http://localhost:5173

## Docker Compose (Complete Stack)

```bash
cd D:\code\event-bridge
docker-compose up -d
```

This starts:
- Knowledge-Agent-POC: http://localhost:8000
- Event Bridge: http://localhost:3000
- Volumes for hot-reload in dev mode

Check logs:
```bash
docker-compose logs -f bridge
docker-compose logs -f knowledge-api
```

Stop:
```bash
docker-compose down
```

## Azure Deployment

### Prerequisites

- Azure CLI installed
- Resource Group created
- Azure App Service plan (B1 or higher)

### Step 1: Create Environment Variables

Create `config/azure.env`:

```env
RESOURCE_GROUP=event-hub-rg
LOCATION=eastus
APP_SERVICE_PLAN=event-hub-plan
APP_SERVICE_BRIDGE=event-bridge-api
APP_SERVICE_KNOWLEDGE=knowledge-api
```

### Step 2: Deploy Bridge

```bash
# Build
npm run build

# Deploy
az webapp up \
  --resource-group event-hub-rg \
  --name event-bridge-api \
  --runtime "NODE:20-lts" \
  --sku B1

# Get URL
az webapp show --resource-group event-hub-rg --name event-bridge-api \
  --query "defaultHostName" --output tsv
```

### Step 3: Configure App Settings

```bash
az webapp config appsettings set \
  --resource-group event-hub-rg \
  --name event-bridge-api \
  --settings \
  PORT=3000 \
  NODE_ENV=production \
  KNOWLEDGE_API_URL=https://knowledge-api.azurewebsites.net \
  JWT_SECRET=[get from Key Vault] \
  ALLOWED_ORIGINS=https://rrs25demoapp.azurewebsites.net,https://custom-app.azurewebsites.net
```

## Customer-Managed Keys (CMK) - Day-1 Setup

Configure encryption-at-rest using Azure Key Vault customer-managed keys. This is recommended even if not immediately needed.

### CMK Prerequisites

- Azure subscription
- Azure CLI installed
- Resource group for Event Hub infrastructure

### CMK Step 1: Deploy CMK Infrastructure

Navigate to the scripts directory and deploy the Bicep template:

```bash
cd scripts

# Set variables
$resourceGroup = "event-hub-rg"
$environment = "dev"
$location = "eastus"

# Deploy infrastructure
./deploy-cmk.ps1 `
  -ResourceGroupName $resourceGroup `
  -Environment $environment `
  -Location $location
```

This creates:

- ✅ Azure Key Vault with soft-delete & purge protection
- ✅ RSA customer-managed encryption key (CMK)
- ✅ Managed identity for the App Service
- ✅ RBAC role assignments (Key Vault Crypto User)

The script outputs Key Vault URI and other details needed for configuration.

### CMK Step 2: Configure App Settings

Update your App Service with CMK settings:

```bash
$appServiceName = "event-bridge-api"
$keyVaultUri = "<FROM_DEPLOYMENT_OUTPUT>"
$keyName = "event-hub-cmk"

# Enable system-assigned managed identity
az webapp identity assign \
  --name $appServiceName \
  --resource-group $resourceGroup

# Set Key Vault configuration
az webapp config appsettings set \
  --name $appServiceName \
  --resource-group $resourceGroup \
  --settings \
  CMK_ENABLED=true \
  KEY_VAULT_URL=$keyVaultUri \
  ENCRYPTION_KEY_NAME=$keyName
```

### CMK Step 3: Verify CMK Setup

Run the verification script:

```bash
./verify-cmk-setup.ps1 -ResourceGroupName $resourceGroup
```

Expected output:

```text
✅ Key Vault accessible
✅ CMK key found
✅ Managed identity configured
✅ Key Vault Crypto User role assigned
```

### CMK Step 4: Enable Diagnostics (Recommended)

Track CMK key usage and access:

```bash
./enable-keyvault-diagnostics.ps1 `
  -KeyVaultName "kv-event-hub-bridge-dev-xxx" `
  -ResourceGroupName $resourceGroup
```

This enables logging to Azure Monitor for audit and troubleshooting.

### CMK Step 5: Test Encryption

Once deployed, verify Key Vault integration:

```bash
# Health check includes Key Vault status
curl https://$appServiceName.azurewebsites.net/health/keyvault

# Expected response:
# {
#   "healthy": true,
#   "message": "Key Vault service is operational"
# }
```

### CMK Local Development

To test CMK locally with Azure credentials:

```bash
# Install dependencies (including Azure SDK)
npm install

# Set environment variables
$env:CMK_ENABLED = "true"
$env:KEY_VAULT_URL = "https://kv-xxx.vault.azure.net/"
$env:ENCRYPTION_KEY_NAME = "event-hub-cmk"

# Optional: Use Azure CLI authentication
az login

# Start dev server
npm run dev
```

### Step 4: Test Deployment

```bash
# Health check
curl https://event-bridge-api.azurewebsites.net/health

# Readiness check
curl https://event-bridge-api.azurewebsites.net/ready
```

### Step 5: Add to ShowcaseApp

In ShowcaseApp `.env`:

```env
BRIDGE_API_URL=https://event-bridge-api.azurewebsites.net
```

## Kubernetes Deployment

### Create Docker Image

```bash
docker build -t myregistry.azurecr.io/event-bridge:1.0 .
docker push myregistry.azurecr.io/event-bridge:1.0
```

### Deploy to AKS

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: event-bridge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: event-bridge
  template:
    metadata:
      labels:
        app: event-bridge
    spec:
      containers:
      - name: bridge
        image: myregistry.azurecr.io/event-bridge:1.0
        ports:
        - containerPort: 3000
        env:
        - name: KNOWLEDGE_API_URL
          value: "http://knowledge-api:8000"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: bridge-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: event-bridge
spec:
  selector:
    app: event-bridge
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy:

```bash
kubectl create secret generic bridge-secrets --from-literal=jwt-secret=your-secret
kubectl apply -f k8s/deployment.yaml
kubectl get svc event-bridge
```

## CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Event Bridge

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - run: npm run build
      - uses: azure/webapps-deploy@v2
        with:
          app-name: 'event-bridge-api'
          slot-name: 'production'
          package: '.'
```

## Monitoring

### Application Insights Integration

```bash
npm install applicationinsights
```

In `src/index.ts`:

```typescript
import appInsights from 'applicationinsights';

appInsights
  .setup(process.env.APPINSIGHTS_INSTRUMENTATION_KEY)
  .start();
```

### View Logs

```bash
# Azure Portal
az webapp log tail --resource-group event-hub-rg --name event-bridge-api

# Local Docker
docker logs event-bridge
```

## Troubleshooting

### Bridge can't reach backend

```bash
# Check backend health
curl http://knowledge-api:8000/health

# Check bridge logs
docker logs event-bridge
docker-compose logs bridge --tail 50
```

### JWT validation failing

```bash
# Verify token
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.decode('your-token'))"

# Check SECRET in .env
echo $JWT_SECRET
```

### CORS errors

Check `ALLOWED_ORIGINS` in `.env` includes your frontend domain.

### Service unavailable (503)

Backend is not responding. Check:

1. Knowledge-Agent-POC is running
2. `KNOWLEDGE_API_URL` is correct
3. Network connectivity between services

## Rollback

### Azure App Service

```bash
# View deployment history
az webapp deployment list --resource-group event-hub-rg --name event-bridge-api

# Redeploy previous version
az webapp deployment slot swap \
  --resource-group event-hub-rg \
  --name event-bridge-api \
  --slot staging
```

## Scaling

### Horizontal Scaling (Azure)

```bash
az appservice plan update \
  --resource-group event-hub-rg \
  --name event-hub-plan \
  --sku P1V2  # Premium tier for auto-scale

az monitor autosettings create \
  --resource-group event-hub-rg \
  --resource-name event-bridge-api \
  --resource-type "Microsoft.Web/sites" \
  --min-count 2 \
  --max-count 5 \
  --target-cpu-percentage 70
```

## Next Steps

1. ✅ Deploy Event Bridge
2. ✅ Configure authentication with Azure AD
3. ✅ Set up monitoring & alerts
4. ✅ Connect ShowcaseApp to Event Bridge
5. ✅ Test end-to-end event workflows
