## Gateway Services Inventory

**Current Workspace:** d:\code\event-bridge

### 1. EVENT-BRIDGE (NEW - Primary Gateway)
**Location:** d:\code\event-bridge
**Type:** API Gateway (Node.js/Express)
**Port:** 3000
**Role:** Unified entry point for all frontends

**Capabilities:**
- ✅ JWT authentication & RBAC
- ✅ Request forwarding to backends
- ✅ Error handling & transformation
- ✅ CORS management
- ✅ Health checks & readiness probes
- ✅ Middleware pipeline (auth, error handling)

**Routes Implemented:**
```
GET    /api/health                      - Health status
GET    /api/health/ready                - Readiness check
GET    /api/events                      - List events (with filters)
GET    /api/events/:id                  - Get single event
POST   /api/events                      - Create event
PUT    /api/events/:id                  - Update event
DELETE /api/events/:id                  - Delete event
GET    /api/projects                    - List projects
GET    /api/projects/:id                - Get single project
POST   /api/projects                    - Create project
PUT    /api/projects/:id                - Update project
DELETE /api/projects/:id                - Delete project
POST   /api/knowledge/extract/paper     - Extract from papers
POST   /api/knowledge/extract/talk      - Extract from talks
POST   /api/knowledge/extract/repository - Extract from repos
```

**Files:**
```
src/
├── index.ts                    (67 lines) - Express setup, middleware pipeline
├── middleware/
│   ├── auth.ts                (95 lines) - JWT validation, RBAC, scopes
│   └── error-handler.ts       (43 lines) - Error normalization
├── routes/
│   ├── events.ts              (93 lines) - Event CRUD endpoints
│   ├── projects.ts            (55 lines) - Project management
│   ├── knowledge.ts           (46 lines) - Knowledge extraction
│   └── health.ts              (54 lines) - Health/readiness checks
├── services/
│   └── knowledge-api-client.ts (140 lines) - HTTP proxy to backend
└── types/
    └── models.ts              (120 lines) - TypeScript interfaces
```

**Dependencies:**
- Express (routing)
- axios (HTTP proxy)
- jsonwebtoken (JWT auth)
- pino (logging)
- cors (CORS handling)
- dotenv (config)

**Docker:**
- ✅ Dockerfile (28 lines, Node.js 20 Alpine)
- ✅ docker-compose.yml (50 lines, bridge + backend services)
- ✅ Health checks configured

---

### 2. MSR-EVENT-HUB Backend (Python/FastAPI)
**Location:** d:\code\event-agent-example\msr-event-hub (renamed from knowledge-agent-poc)
**Type:** REST API Backend (Python/FastAPI)
**Port:** 8000
**Role:** Core business logic, data persistence, knowledge extraction

**Key Features:**
- ✅ Event management (CRUD)
- ✅ Project/poster hubs
- ✅ Session & track management
- ✅ Knowledge extraction agents (papers, talks, repos)
- ✅ Neo4j graph database integration
- ✅ PostgreSQL relational storage
- ✅ Redis caching
- ✅ Celery async job processing
- ✅ Azure integrations

**Architecture:**
```
api/
├── app.py              - FastAPI application
├── auth.py            - Authentication (OAuth2)
├── models.py          - Pydantic models
├── dependencies.py    - Shared dependencies
└── routes/
    ├── chat.py       - Chat endpoints
    ├── graph.py      - Graph queries
    ├── health.py     - Health checks
    └── ingest.py     - Data ingestion

agents/
├── base.py           - Base agent class
├── orchestrator.py   - Agent coordination
└── [specific agents] - Paper, talk, repo analyzers

embeddings/
├── vector_store.py    - Vector storage abstraction
├── azure_search.py    - Azure AI Search
└── cloudflare_vectorize.py - Cloudflare Vectorize

ingestion/
├── pipeline.py        - Data ingestion pipeline
├── fetchers.py        - Data source fetchers
├── pdf.py            - PDF processing
└── llm_pdf.py        - LLM-based PDF analysis

graph/
├── engine.py         - Neo4j graph operations
├── node.py           - Node definitions
├── edge.py           - Edge definitions
└── query.py          - Graph queries

storage/
├── cosmosdb.py       - Cosmos DB adapter
└── cloudflare_d1.py  - Cloudflare D1 adapter
```

---

### 3. ShowcaseApp Frontend (React)
**Location:** d:\code\ShowcaseApp\showcaseapp
**Type:** Frontend UI (React Router 7.x + TypeScript)
**Port:** 5173 (dev) / Web App Service (prod)
**Role:** User-facing interface

**New Gateway Integration:**
- ✅ BridgeAPIClient (bridge-api-client.ts)
- ✅ React hooks (use-bridge-api.ts)
- ✅ ServiceFactory for transparent switching
- ✅ Zero-change migration support

**Can Connect Via:**
1. **Direct Cosmos DB** (legacy, default)
   - cosmos-service.ts
   - Direct Azure Cosmos DB connection
   
2. **event-bridge Gateway** (new, recommended)
   - bridge-api-service.ts
   - HTTP calls to event-bridge

**Architecture Modes:**
```
Mode 1 (Legacy):
ShowcaseApp → cosmos-service → Cosmos DB

Mode 2 (New):
ShowcaseApp → cosmosService (facade) → ServiceFactory → 
  → bridge-api-service → HTTP → event-bridge → msr-event-hub
```

---

### 4. Loomnode (Knowledge Graph Library - IW-Agent)
**Location:** d:\code\IW-Agent
**Type:** Python library / CLI tool
**Role:** Reusable knowledge extraction and graph building

**Components:**
```
loomnode-agents/
├── examples/
│   ├── paper_tracker.py
│   ├── citation_sync.py
│   └── author_tracker.py

loomnode-core/
├── agents/    - Agent implementations
├── api/       - FastAPI endpoints
├── embeddings/ - Vector storage
├── graph/     - Neo4j operations
├── ingestion/ - Data pipelines
├── llm/       - LLM integrations
└── storage/   - Database adapters
```

**Can Be:**
- Used as library in msr-event-hub
- Used as standalone service
- Extended with custom agents

---

## Gateway Service Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                       Applications                           │
├──────────────────────┬──────────────────┬──────────────────┤
│   ShowcaseApp        │   Mobile App     │   Other UIs      │
│   (React)            │   (future)       │   (future)       │
└──────────┬───────────┴────────┬─────────┴──────────┬───────┘
           │                    │                    │
           └────────────────────┼────────────────────┘
                                │
                     ┌──────────▼────────────┐
                     │   event-bridge        │
                     │  (API Gateway)        │
                     │  Port 3000            │
                     │                       │
                     │ • Authentication      │
                     │ • Authorization       │
                     │ • Request routing     │
                     │ • Response caching    │
                     │ • Error handling      │
                     └──────────┬────────────┘
                                │
                     ┌──────────▼────────────┐
                     │  msr-event-hub        │
                     │  (Backend API)        │
                     │  Port 8000            │
                     │                       │
                     │ • Event management    │
                     │ • Knowledge extraction│
                     │ • Graph building      │
                     │ • Data persistence    │
                     └──────────┬────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
         ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
         │ PostgreSQL  │ │   Neo4j    │ │   Redis    │
         │ (Relations) │ │  (Graph)   │ │  (Cache)   │
         └─────────────┘ └────────────┘ └────────────┘
```

---

## Service Communication Matrix

| From | To | Protocol | Purpose |
|------|-------|----------|---------|
| ShowcaseApp | event-bridge | HTTP/REST | Data access, auth |
| ShowcaseApp | Cosmos DB | Direct Azure SDK | Legacy mode |
| event-bridge | msr-event-hub | HTTP/REST | API forwarding |
| msr-event-hub | PostgreSQL | SQL | Data persistence |
| msr-event-hub | Neo4j | Bolt | Graph operations |
| msr-event-hub | Redis | Redis protocol | Caching |
| Loomnode | event-bridge | HTTP/REST | Knowledge extraction |
| Loomnode | msr-event-hub | Direct import | Library usage |

---

## Deployment Architecture

### Development (Local)

```bash
# 3 services running locally
event-bridge (localhost:3000)      ← Frontend connects here
msr-event-hub (localhost:8000)     ← Bridge connects here
ShowcaseApp (localhost:5173)       ← User opens here
```

### Production (Azure)

```
┌─ Azure AD (Authentication)
│
├─ event-bridge
│  ├─ App Service (Port 3000)
│  └─ Application Insights (Logging)
│
├─ msr-event-hub
│  ├─ App Service (Port 8000)
│  ├─ Application Insights
│  └─ Managed Identity auth
│
├─ ShowcaseApp
│  ├─ Static Web App
│  └─ CDN (caching)
│
└─ Data Layer
   ├─ PostgreSQL (Flexible Server)
   ├─ Neo4j (AuraDB or hosted)
   ├─ Azure Cache for Redis
   ├─ Cosmos DB (legacy, optional)
   └─ Azure Blob Storage
```

---

## Gateway Service Comparison

| Feature | event-bridge | msr-event-hub |
|---------|--------------|---------------|
| **Language** | TypeScript/Node.js | Python/FastAPI |
| **Purpose** | API Gateway | Business Logic |
| **Auth** | JWT validation | OAuth2 + JWT |
| **Caching** | Can add Redis | Redis built-in |
| **Rate Limiting** | ✅ Implementable | ❌ Not yet |
| **Circuit Breaker** | ✅ Implementable | ❌ Not yet |
| **WebSockets** | ✅ Implementable | ❌ Not yet |
| **GraphQL** | ❌ Could add | ❌ Not yet |
| **Metrics** | ✅ Via pino | ✅ Via logging |
| **Request Tracing** | ✅ Implementable | ✅ Implementable |

---

## What We Can Now Build

With this gateway architecture in place:

✅ **Multiple frontends** - Any new UI just connects to event-bridge
✅ **Microservices** - Add more backend services behind bridge
✅ **Real-time** - Add WebSockets/SSE via bridge without changing ShowcaseApp
✅ **API versioning** - Multiple versions at bridge layer
✅ **Gradual migration** - Run Cosmos DB + bridge simultaneously
✅ **Performance** - Cache/optimize at gateway
✅ **Vendor independence** - Swap backends behind bridge
✅ **Feature flags** - Toggle implementations at ServiceFactory
✅ **Mobile apps** - Connect native apps through same bridge
✅ **External partners** - Controlled API access via bridge auth

---

## Summary

**Total Gateway Services:** 2

1. **event-bridge** (Node.js/Express) - API Gateway Layer
   - HTTP request routing
   - Authentication & authorization
   - Request transformation
   - Response caching (future)
   - Error handling

2. **msr-event-hub** (Python/FastAPI) - Backend Business Logic
   - Event management
   - Knowledge extraction
   - Graph operations
   - Data persistence
   - Job processing

**+ ShowcaseApp** - Frontend with zero-change migration to bridge via ServiceFactory pattern

All connected through clean HTTP REST APIs, enabling scalable, loosely-coupled microservices architecture.
