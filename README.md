# Event Hub Bridge

**API Gateway & Integration Layer for MSR Event Hub Platform**

A lightweight Node.js/Express bridge service that provides unified API access to the MSR Event Hub backend, with built-in authentication, error handling, and support for multiple frontend applications.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Event Hub Bridge                          │
│  (API Gateway, Authentication, Request Forwarding)          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ ShowcaseApp  │  │   Custom     │  │   Internal   │       │
│  │  (Frontend)  │  │   Frontend   │  │   Tools      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │                │
│         └─────────────────┼──────────────────┘                │
│                           │ REST API                          │
│                    ┌──────▼──────────┐                       │
│                    │   Event Bridge   │                       │
│                    │  (Port 3000)     │                       │
│                    ├──────────────────┤                       │
│                    │ - Auth (JWT)     │                       │
│                    │ - Proxy          │                       │
│                    │ - Logging        │                       │
│                    │ - Error Handle   │                       │
│                    └──────┬───────────┘                       │
│                           │ REST API                          │
│                    ┌──────▼──────────────┐                   │
│                    │   MSR Event Hub      │                   │
│                    │   (Port 8000)        │                   │
│                    │                      │                   │
│                    │ - Events            │                   │
│                    │ - Projects          │                   │
│                    │ - Knowledge Extract │                   │
│                    │ - Neo4j Graph       │                   │
│                    └──────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Features

✨ **Core Capabilities**
- 🔐 JWT authentication & authorization
- 🔀 Request forwarding & response transformation
- 📊 Structured logging with correlation IDs
- ⚡ Error handling & status code mapping
- 🔗 CORS support for multiple origins
- 🏥 Health checks & readiness probes
- 📦 Docker containerization
- 🚀 Azure App Service deployment ready

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- MSR Event Hub running on `http://localhost:8000`

### Installation

```bash
cd event-bridge
npm install
```

### Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Backend
KNOWLEDGE_API_URL=http://localhost:8000

# Auth
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ISSUER=https://eventhub.internal.microsoft.com
JWT_AUDIENCE=event-hub-apps

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Logging
LOG_LEVEL=info
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## API Routes

### Events
- `GET /v1/events` - List all events
- `GET /v1/events/:eventId` - Get event
- `POST /v1/events` - Create event (admin)
- `PATCH /v1/events/:eventId` - Update event (admin)
- `DELETE /v1/events/:eventId` - Delete event (admin)
- `GET /v1/events/:eventId/sessions` - List sessions
- `POST /v1/events/:eventId/sessions` - Create session
- `GET /v1/events/:eventId/projects` - List projects
- `POST /v1/events/:eventId/projects` - Create project

### Projects
- `GET /v1/projects/:projectId` - Get project
- `PATCH /v1/projects/:projectId` - Update project
- `DELETE /v1/projects/:projectId` - Delete project (admin)
- `GET /v1/projects/:projectId/knowledge` - Get knowledge artifacts
- `POST /v1/projects/:projectId/compile` - Compile summary

### Knowledge
- `POST /v1/knowledge/extract` - Extract from paper/talk/repo
- `GET /v1/knowledge/extract/:jobId` - Check extraction status
- `POST /v1/knowledge/search` - Cross-event semantic search
- `GET /v1/knowledge/artifacts/:artifactId` - Get artifact

### Health
- `GET /health` - Liveness check
- `GET /ready` - Readiness check

## Authentication

All endpoints (except `/health` and `/ready`) require a Bearer token:

```bash
curl -H "Authorization: Bearer <jwt-token>" \
  http://localhost:3000/v1/events
```

### Token Format

The JWT should contain:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "roles": ["user", "admin"],
  "scopes": ["read", "write", "ingest"]
}
```

### Generating Test Tokens

```bash
# Use this script to generate test tokens
npm run test:token -- --user "test@example.com" --roles "user,admin"
```

## Docker

### Build

```bash
docker build -t event-bridge:latest .
```

### Run

```bash
docker run -p 3000:3000 \
  -e KNOWLEDGE_API_URL=http://knowledge-api:8000 \
  -e JWT_SECRET=your-secret \
  event-bridge:latest
```

### Docker Compose (Full Stack)

```bash
docker-compose up -d
```

This starts:
- Bridge on `http://localhost:3000`
- MSR Event Hub on `http://localhost:8000`

## Deployment

### Azure App Service

```bash
# Build
npm run build

# Deploy
az webapp up \
  --resource-group event-hub-rg \
  --name event-bridge-api \
  --runtime "NODE:20-lts" \
  --sku B1
```

### Environment Variables (Azure Portal)

```
PORT=3000
NODE_ENV=production
KNOWLEDGE_API_URL=https://knowledge-api.azurewebsites.net
JWT_SECRET=[use Azure Key Vault]
ALLOWED_ORIGINS=https://showcase-app.azurewebsites.net
```

## Architecture

### Directory Structure

```
event-bridge/
├── src/
│   ├── index.ts                    # Main Express app
│   ├── middleware/
│   │   ├── auth.ts                 # JWT validation
│   │   └── error-handler.ts        # Error handling
│   ├── routes/
│   │   ├── events.ts               # Event endpoints
│   │   ├── projects.ts             # Project endpoints
│   │   ├── knowledge.ts            # Knowledge endpoints
│   │   └── health.ts               # Health checks
│   ├── services/
│   │   └── knowledge-api-client.ts # Backend HTTP client
│   └── types/
│       └── models.ts               # Shared TypeScript types
├── dist/                           # Compiled JavaScript
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
├── package.json
└── README.md
```

### Request Flow

```
Client Request
    ↓
CORS Middleware
    ↓
Auth Middleware (validate JWT)
    ↓
Route Handler
    ↓
KnowledgeAPIClient (forward to backend)
    ↓
Backend Response
    ↓
Error Handler (if needed)
    ↓
Response to Client
```

## Development

### TypeScript

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

## Logging

All requests are logged with:
- Method & path
- Status code
- Response time
- User ID (if authenticated)
- Correlation ID (for tracing)

```json
{
  "level": "info",
  "time": "2024-01-15T10:30:45.123Z",
  "correlationId": "1704885045123-a1b2c3d4",
  "userId": "user123",
  "method": "GET",
  "path": "/v1/events",
  "statusCode": 200,
  "responseTime": 45
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "BACKEND_ERROR",
    "message": "Error description",
    "correlationId": "1704885045123-a1b2c3d4",
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `202` - Accepted (async operation)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `503` - Service Unavailable (backend down)

## Performance

- Response timeout: 30s (configurable)
- Connection pooling via axios
- Request/response logging
- Correlation IDs for distributed tracing

## Security

- ✅ JWT validation on all endpoints (except health)
- ✅ Role-based access control (RBAC)
- ✅ CORS whitelisting
- ✅ Environment-based secrets
- ✅ Request size limits (10MB)
- ✅ Timeout protection

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `npm test`
4. Check types: `npm run typecheck`
5. Lint: `npm run lint`
6. Submit PR

## License

MIT

## Support

For issues or questions:
1. Check logs: `docker logs event-bridge` or `tail -f logs/*.log`
2. Review API docs: `http://localhost:3000/docs`
3. Check backend health: `curl http://localhost:8000/health`
