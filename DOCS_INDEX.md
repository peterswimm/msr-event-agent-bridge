# MSR Event Agent Bridge - Documentation Index

**Last Updated**: January 14, 2026 | **Status**: Production Ready (Phases 1-2) + Planned (Phases 3-4)

---

## 📚 Core Documentation

### 🚀 Getting Started

1. **[README.md](./README.md)** ← Start here
   - Project overview and capabilities
   - Quick start (5 minutes)
   - Local development setup
   - Docker deployment

2. **[docs/QUICK_START.md](./docs/QUICK_START.md)** - Detailed setup
   - Step-by-step local development
   - Docker Compose full-stack
   - First API request
   - Common config tasks

### 🏛️ System Design

- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture
  - Platform diagram and components
  - Data models and relationships
  - API endpoints overview
  - Security architecture
  - Performance patterns

### 🚢 Production Operations

- **[docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md)** - Complete ops guide
  - Pre-deployment checklists
  - Azure App Service deployment
  - Kubernetes (AKS) deployment
  - CI/CD pipelines with GitHub Actions
  - Monitoring and alerting
  - Incident response and scaling
  - **Upcoming**: Phase 3 & 4 implementation guides

### 🔌 API & Integration

- **[docs/API_REFERENCE.md](./docs/API_REFERENCE.md)** - Complete API documentation
  - All endpoints with examples
  - Request/response formats
  - Authentication methods
  - Error handling
  - Pagination and filtering
  - SDK examples (Python, Node.js, JavaScript)

- **[docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md)** - Frontend integration
  - How to connect your app
  - Example: ShowcaseApp
  - Custom frontend examples
  - React hooks and utilities
  - Testing and debugging
  - Azure AD integration

### 📋 Reference Materials

- **[docs/RBAC_MATRIX.md](./docs/RBAC_MATRIX.md)** - Role-based access control
  - User roles and definitions
  - Permission matrix
  - Endpoint access by role
  - Authorization examples

- **[docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Issues & solutions
  - 25+ problem scenarios
  - Diagnostic procedures
  - Quick fixes
  - Escalation paths

### 📅 Planning & Roadmap

- **[docs/PROJECT_ROADMAP.md](./docs/PROJECT_ROADMAP.md)** - Status & timeline
  - Component completion metrics
  - Next milestones
  - Team responsibilities
  - Schedule and timeline

---

## 🎯 Quick Navigation by Role

| Role | Start With |
|------|-----------|
| **Developer** | [README.md](./README.md) → [docs/QUICK_START.md](./docs/QUICK_START.md) → [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| **Frontend Engineer** | [docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md) → [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) |
| **DevOps/SRE** | [docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md) → [infra/main.bicep](./infra/main.bicep) |
| **Product Manager** | [README.md](./README.md) → [docs/PROJECT_ROADMAP.md](./docs/PROJECT_ROADMAP.md) |

---

## 📁 Project Structure

```
msr-event-agent-bridge/
├── README.md                          # Overview & quick start
├── DOCS_INDEX.md                      # This file
├── package.json
├── tsconfig.json
├── .env.example
│
├── src/                               # Source code
│   ├── index.ts                       # Express app
│   ├── middleware/                    # Request processing
│   │   ├── auth.ts                    # JWT validation
│   │   └── error-handler.ts           # Error handling
│   ├── routes/                        # API routes
│   │   ├── events.ts
│   │   ├── projects.ts
│   │   ├── knowledge.ts
│   │   ├── chat.ts
│   │   └── health.ts
│   ├── services/                      # Business logic
│   ├── config/                        # Configuration
│   └── types/                         # TypeScript types
│
├── scripts/                           # Utility scripts
│   ├── generate-token.ts              # JWT generator
│   └── deploy-*.sh                    # Deployment scripts
│
├── docs/                              # Documentation
│   ├── README.md
│   ├── QUICK_START.md
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   ├── INTEGRATION_GUIDE.md
│   ├── RBAC_MATRIX.md
│   ├── DEPLOYMENT_RUNBOOK.md
│   ├── TROUBLESHOOTING.md
│   ├── PROJECT_ROADMAP.md
│   ├── archive/                       # Archived docs
│   │   ├── README_OLD.md
│   │   ├── ARCHITECTURE_OLD.md
│   │   └── cmk-implementation/
│   └── _archive/                      # More archives
│
├── infra/                             # Infrastructure
│   ├── main.bicep
│   └── main.bicepparam
│
├── docker-compose.yml
├── Dockerfile
└── dist/                              # Compiled output
```

---

## 🚀 Quick Start Commands

```bash
# Setup
npm install
cp .env.example .env

# Development
npm run dev                       # Run with hot reload
npm test                         # Run tests
npm run build                    # Compile TypeScript

# Production
docker build -t bridge .         # Build image
docker-compose up                # Full stack
npm start                        # Run compiled

# Utilities
npm run test:token              # Generate JWT token
```

---

## 🔮 Planned Features (Phases 3-4)

### Phase 3: Backend Data Layer Restructuring
- Pure CRUD `/data/*` endpoints in backend
- Business logic moved to Bridge
- Clear separation of data and logic
- See [docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md) for details

### Phase 4: Frontend Deployment Separation
- Deploy Webchat independently to CDN
- Multi-origin CORS support
- Separate frontend/backend versioning
- Independent CI/CD pipelines
- See [docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md) for details

---

## 📞 Documentation Index by Topic

| Topic | Document |
|-------|----------|
| Getting started | [README.md](./README.md) |
| System design | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| All API endpoints | [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) |
| Frontend integration | [docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md) |
| User permissions | [docs/RBAC_MATRIX.md](./docs/RBAC_MATRIX.md) |
| Production deployment | [docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md) |
| Troubleshooting | [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) |
| Project status | [docs/PROJECT_ROADMAP.md](./docs/PROJECT_ROADMAP.md) |

---

## 📊 Documentation Statistics

| Document | Purpose | Size |
|----------|---------|------|
| API_REFERENCE.md | API documentation | 1,000+ lines |
| ARCHITECTURE.md | System design | 500+ lines |
| DEPLOYMENT_RUNBOOK.md | Operations guide | 900+ lines |
| INTEGRATION_GUIDE.md | Frontend guide | 600+ lines |
| QUICK_START.md | Setup guide | 200+ lines |
| RBAC_MATRIX.md | Permissions | 300+ lines |
| TROUBLESHOOTING.md | Issues & fixes | 400+ lines |
| PROJECT_ROADMAP.md | Roadmap | 1,000+ lines |
| **Total** | **8 core docs** | **5,000+ lines** |

---

## ✅ Documentation Checklist

- ✅ Getting started guide
- ✅ Architecture documentation
- ✅ Complete API reference
- ✅ Local development setup
- ✅ Production deployment guide
- ✅ Frontend integration guide
- ✅ Permissions and RBAC
- ✅ Troubleshooting guide
- ✅ Project roadmap
- ✅ Code examples
- ✅ Archived old documentation

---

## 🔗 Related Repositories

- **[msr-event-agent-chat](https://github.com/peterswimm/msr-event-agent-chat)** - Python/FastAPI backend
- **[msr-event-hub](https://github.com/peterswimm/msr-event-hub)** - Legacy backend (being refactored)

---

## 📝 Contributing to Documentation

When updating docs:
1. Edit the relevant file in `docs/`
2. Update DOCS_INDEX.md if sections change
3. Test all code examples
4. Archive outdated docs to `docs/archive/`
5. Commit with descriptive message

---

**Last Updated**: January 14, 2026  
**Maintained By**: MSR Platform Team  
**Version**: 2.0 (Production Ready)

Need help? Check [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) or the relevant guide above.
