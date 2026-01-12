# Event Bridge - Complete Documentation Index

## 📚 Documentation Files

### Getting Started
- **[README.md](./README.md)** - Overview, features, quick start, API reference
  - User guide for all frontends
  - Complete API endpoint listing
  - Authentication instructions
  - Docker & deployment commands
  - Development setup

### System Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, components, data flow
  - Component breakdown (middleware, routes, services)
  - Request flow diagrams
  - Data models & relationships
  - Security architecture
  - Performance optimization
  - Monitoring & observability

### Production Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment, scaling, CI/CD
  - Local development setup (with docker-compose)
  - Azure App Service deployment
  - Kubernetes (AKS) deployment
  - GitHub Actions CI/CD pipeline
  - Monitoring with Application Insights
  - Troubleshooting guide
  - Rollback & scaling procedures

### Integration Guide
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Connect your frontend to Event Bridge
  - ShowcaseApp integration (step-by-step)
  - Custom frontend examples (React, vanilla JS)
  - React hooks for data fetching
  - Testing with Postman/cURL
  - Docker integration
  - Production setup with Azure AD

### Project Summary
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Quick project overview
  - What was created
  - Project structure
  - Key features
  - Quick start
  - Next steps

## 🏗️ Project Structure

```
event-bridge/
├── src/
│   ├── index.ts                      # Express app
│   ├── middleware/
│   │   ├── auth.ts                   # JWT validation
│   │   └── error-handler.ts          # Error normalization
│   ├── routes/
│   │   ├── events.ts                 # Event endpoints
│   │   ├── projects.ts               # Project endpoints
│   │   ├── knowledge.ts              # Knowledge endpoints
│   │   └── health.ts                 # Health checks
│   ├── services/
│   │   └── knowledge-api-client.ts   # HTTP proxy
│   └── types/
│       └── models.ts                 # Shared types
├── scripts/
│   └── generate-token.ts             # JWT token helper
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── *.md                              # Documentation files
```

## 🚀 Quick Reference

### Local Development
```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env

# 3. Run
npm run dev

# 4. Test
npm run test:token -- --user "test@example.com"
curl -H "Authorization: Bearer <token>" http://localhost:3000/v1/events
```

### Docker Compose (Full Stack)
```bash
docker-compose up -d
# Bridge: http://localhost:3000
# Backend: http://localhost:8000
```

### Production (Azure)
```bash
npm run build
az webapp up --resource-group event-hub-rg --name event-bridge-api --runtime "NODE:20-lts"
```

## 📋 API Endpoints

### Events (`/v1/events`)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | User | List all events |
| GET | `/:eventId` | User | Get single event |
| POST | `/` | Admin | Create event |
| PATCH | `/:eventId` | Admin | Update event |
| DELETE | `/:eventId` | Admin | Delete event |
| GET | `/:eventId/sessions` | User | List sessions |
| GET | `/:eventId/projects` | User | List projects |

### Projects (`/v1/projects`)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/:projectId` | User | Get project |
| PATCH | `/:projectId` | User | Update project |
| DELETE | `/:projectId` | Admin | Delete project |
| GET | `/:projectId/knowledge` | User | Get knowledge artifacts |
| POST | `/:projectId/compile` | User | Compile summary |

### Knowledge (`/v1/knowledge`)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/extract` | User | Extract from paper/talk/repo |
| GET | `/extract/:jobId` | User | Check extraction status |
| POST | `/search` | User | Search across events |
| GET | `/artifacts/:id` | User | Get artifact details |

### Health
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/health` | None | Liveness check |
| GET | `/ready` | None | Readiness check |

## 🔐 Authentication

All endpoints (except `/health`, `/ready`) require JWT Bearer token:

```bash
curl -H "Authorization: Bearer <jwt-token>" http://localhost:3000/v1/events
```

Token format:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "roles": ["user", "admin"],
  "scopes": ["read", "write", "ingest"]
}
```

Generate test token:
```bash
npm run test:token -- --user "test@example.com" --roles "user,admin"
```

## 🔗 Integration Checklist

- [ ] Read README.md for overview
- [ ] Set up local development (npm install, .env)
- [ ] Run docker-compose for full stack
- [ ] Generate test token
- [ ] Test API endpoints with curl
- [ ] Review ARCHITECTURE.md for system design
- [ ] Review INTEGRATION_GUIDE.md for your frontend
- [ ] Create bridge client library for your app
- [ ] Test integration locally
- [ ] Deploy to Azure (see DEPLOYMENT.md)
- [ ] Configure monitoring & alerts
- [ ] Update frontend environment variables

## 📞 Support Resources

### For API Questions
→ See [README.md](./README.md) - Complete API reference

### For System Design
→ See [ARCHITECTURE.md](./ARCHITECTURE.md) - Components, flow, security

### For Frontend Integration
→ See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Code examples, React hooks

### For Production Deployment
→ See [DEPLOYMENT.md](./DEPLOYMENT.md) - Azure, Kubernetes, CI/CD

### For Troubleshooting
→ See [DEPLOYMENT.md](./DEPLOYMENT.md) - Common issues & solutions

### For Project Overview
→ See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Features, next steps

## 🎯 Development Workflow

```
1. Clone/navigate to event-bridge
           ↓
2. Install dependencies (npm install)
           ↓
3. Configure .env (copy from .env.example)
           ↓
4. Start servers (docker-compose up -d)
           ↓
5. Read integration guide for your app
           ↓
6. Create bridge client library
           ↓
7. Test with sample requests
           ↓
8. Integrate into your frontend
           ↓
9. Deploy to production
```

## 🚢 Deployment Workflow

```
Local Dev
    ↓
Docker Compose (full stack test)
    ↓
Build: npm run build
    ↓
Container: docker build -t event-bridge:latest .
    ↓
Push: docker push <registry>/event-bridge:latest
    ↓
Azure App Service OR Kubernetes
    ↓
Configure env vars & secrets
    ↓
Test health checks & readiness
    ↓
Connect frontends
    ↓
Monitor & scale
```

## 📚 External Resources

- [Express.js Documentation](https://expressjs.com)
- [JWT.io - JWT Debugger](https://jwt.io)
- [Axios Documentation](https://axios-http.com)
- [Pino Logging](https://getpino.io)
- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service)
- [Docker Documentation](https://docs.docker.com)

## 🔄 Related Projects

- **[MSR Event Hub](../event-agent-example/msr-event-hub)** - Backend service
- **[ShowcaseApp](../ShowcaseApp)** - Frontend (React Router 7)
- **[Loomnode](../IW-Agent)** - Knowledge graph platform

## 📝 File Locations

| File | Purpose | Location |
|------|---------|----------|
| Source Code | TypeScript implementation | `src/` |
| Build Output | Compiled JavaScript | `dist/` |
| Configuration | Environment variables | `.env` |
| Dependencies | npm packages | `package.json` |
| Docker | Container setup | `docker-compose.yml`, `Dockerfile` |
| Documentation | All guides | `*.md` |
| Scripts | Helper tools | `scripts/` |
| Types | Shared interfaces | `src/types/` |

## ✅ Status

- ✅ Core bridge implementation (100%)
- ✅ API routing & forwarding (100%)
- ✅ JWT authentication (100%)
- ✅ Error handling (100%)
- ✅ Docker containerization (100%)
- ✅ Documentation (100%)
- ⏳ ShowcaseApp integration (in progress)
- ⏳ Production deployment (in progress)
- ⏳ Monitoring setup (TODO)

---

**Last Updated**: January 2025  
**Version**: 0.1.0  
**Status**: Production-Ready (Core)
