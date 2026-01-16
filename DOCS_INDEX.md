# MSR Event Agent Bridge - Documentation Index

**Last Updated**: January 15, 2026 | **Status**: Production Ready (Phases 1-2) + Planned (Phases 3-4) | **Archive**: [docs/archive/](./docs/archive/) for legacy versions

---

## 📚 Core Documentation

### 🚀 Getting Started

1. **[README.md](./README.md)** ← Start here
   - Project overview and capabilities
   - Quick start (5 minutes)
   - Local development setup
   - Docker deployment

2. **[docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md)** - Setup, integration, and deployment
   - Complete local development setup (2-5 minutes)
   - Making your first API calls
   - Frontend integration patterns
   - Azure AI Foundry infrastructure
   - Docker deployment
   - Production configuration
   - Troubleshooting

### 🏛️ System Design & Operations

- **[docs/OPERATIONS_REFERENCE.md](./docs/OPERATIONS_REFERENCE.md)** - Unified operations reference (60+ min read)
  - **System Architecture**: Components, data models, auth flow, workflows, configuration, deployment
  - **Complete API Reference**: All endpoints, authentication, request/response examples, error handling
  - **RBAC & Authorization**: Role hierarchy, permission matrices, endpoint access by role, authorization flow
  - **Troubleshooting Guide**: Gateway issues, backend issues, auth errors, database problems, CMK issues
  - **Production Deployment**: Infrastructure setup, application deployment, monitoring, scaling, security
  - **Monitoring & Observability**: Key metrics, Application Insights queries, alerting, logging
  - **Security**: At-rest encryption, in-transit encryption, access control, audit logging

- **[docs/AZURE_AI_FOUNDRY_SETUP.md](./docs/AZURE_AI_FOUNDRY_SETUP.md)** - Secure Azure AI infrastructure
  - Private networking (VNet, private endpoints, DNS)
  - Azure OpenAI deployment (GPT-4, GPT-3.5, embeddings)
  - Managed identities, RBAC, and CMK configuration
  - Monitoring, diagnostics, and cost optimization

### 🔌 API & Integration

- **[docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md)** - Complete integration reference (30 min read)
  - Frontend SDK patterns and implementation
  - React hooks and custom integrations
  - Azure AI Foundry setup and configuration
  - Docker deployment with full stack
  - Production deployment on Azure
  - Authentication and error handling

- **[docs/OPERATIONS_REFERENCE.md](./docs/OPERATIONS_REFERENCE.md)** - API reference (included section)
  - All endpoints with request/response examples
  - Authentication and token generation
  - OData filtering and pagination
  - Event, session, project, knowledge artifact endpoints
  - Chat and search endpoints

### 📋 Reference Materials

- **[docs/COMPLIANCE.md](./docs/COMPLIANCE.md)** - Security, privacy, and Responsible AI gates
  - Required signoffs (RAI, Legal, Privacy, Accessibility, Security)
  - Feature-to-compliance mapping
  - Continuous compliance guidance

### 📅 Planning & Roadmap

- **[docs/PROJECT_ROADMAP_CONSOLIDATED.md](./docs/PROJECT_ROADMAP_CONSOLIDATED.md)** - Complete project roadmap & phase planning (60+ min read)
  - MSR India TAB MVP launch (Jan 24, 2026) - scope, blockers, compliance
  - Phase 1-4 timelines (Jan-Jun 2026)
  - Feature tracking and implementation plans
  - Azure AI Foundry infrastructure requirements
  - Production readiness assessment
  - Risk assessment and success metrics by phase
  - *(Consolidated from PHASE_3_4_COMPLETION.md and PROJECT_ROADMAP.md)*

- **[docs/MSR Event Hub BRD.md](./docs/MSR%20Event%20Hub%20BRD.md)** - Business requirements and MVP goals
- **[docs/MSR Event Hub BRD Engineering.md](./docs/MSR%20Event%20Hub%20BRD%20Engineering.md)** - Engineering governance and AI guardrails
- **[docs/AZURE_AI_FOUNDRY_INTEGRATION_SUMMARY.md](./docs/AZURE_AI_FOUNDRY_INTEGRATION_SUMMARY.md)** - Integration highlights and phase readiness
- **[docs/COMPLETION_REPORT_AZURE_AI_FOUNDRY.md](./docs/COMPLETION_REPORT_AZURE_AI_FOUNDRY.md)** - Deliverable inventory for Azure AI requirements
- **[docs/MSR_EventHub_Features and Stories.csv](./docs/MSR_EventHub_Features%20and%20Stories.csv)** - Backlog export with priorities and owners

---

## 🎯 Quick Navigation by Role

| Role | Start With |
|------|-----------|
| **Developer** | [README.md](./README.md) → [docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md) → [docs/OPERATIONS_REFERENCE.md](./docs/OPERATIONS_REFERENCE.md) |
| **Frontend Engineer** | [docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md) → [docs/OPERATIONS_REFERENCE.md](./docs/OPERATIONS_REFERENCE.md) (API section) |
| **DevOps/SRE** | [docs/OPERATIONS_REFERENCE.md](./docs/OPERATIONS_REFERENCE.md) (Deployment section) → [infra/main.bicep](./infra/main.bicep) |
| **Product Manager** | [README.md](./README.md) → [docs/PROJECT_ROADMAP_CONSOLIDATED.md](./docs/PROJECT_ROADMAP_CONSOLIDATED.md) |

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
├── docs/                              # Documentation (current)
│   ├── README.md
│   ├── QUICK_START.md
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   ├── INTEGRATION_GUIDE.md
│   ├── RBAC_MATRIX.md
│   ├── DEPLOYMENT_RUNBOOK.md
│   ├── TROUBLESHOOTING.md
│   ├── PROJECT_ROADMAP.md
│   ├── AZURE_AI_FOUNDRY_SETUP.md
│   ├── AZURE_AI_FOUNDRY_INTEGRATION_SUMMARY.md
│   ├── COMPLETION_REPORT_AZURE_AI_FOUNDRY.md
│   ├── COMPLIANCE.md
│   ├── MSR Event Hub BRD.md
│   ├── MSR Event Hub BRD Engineering.md
│   ├── PHASE_3_4_COMPLETION.md
│   ├── MSR_EventHub_Features and Stories.csv
│   ├── archive/                       # Archived legacy docs
│   │   ├── ARCHITECTURE_OLD.md
│   │   ├── DEPLOYMENT_OLD.md
│   │   ├── README_OLD.md
│   │   ├── START_HERE_OLD.md
│   │   ├── cmk-implementation-jan-2026/
│   │   └── ...
│   └── _archive/                      # Historical archives
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

**Last Updated**: January 15, 2026  
**Maintained By**: MSR Platform Team  
**Version**: 2.0 (Production Ready)

Need help? Check [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) or the relevant guide above.
