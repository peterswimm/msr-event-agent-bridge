# Event Bridge Architecture

## System Overview

Event Bridge is a lightweight API gateway that sits between multiple frontend applications and the Knowledge-Agent-POC backend. It provides:

1. **Unified Authentication** - Single JWT validation point
2. **Request Forwarding** - Transparent proxy with header manipulation
3. **Error Normalization** - Consistent error responses across services
4. **Correlation Tracking** - Distributed tracing via correlation IDs
5. **Multi-Origin Support** - CORS configuration for multiple frontends

## Components

### 1. Express Application (`src/index.ts`)

**Responsibilities:**
- CORS configuration
- Body parsing & request limits
- Middleware pipeline setup
- Route registration
- Global error handling
- Server lifecycle management

```
Request → CORS → Body Parser → Auth → Routes → Error Handler → Response
```

### 2. Authentication Middleware (`src/middleware/auth.ts`)

**Validates JWT tokens** on all endpoints except health checks.

**Token Requirements:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "roles": ["user", "admin"],
  "scopes": ["read", "write"]
}
```

**Key Features:**
- ✅ Validates signature (JWT_SECRET)
- ✅ Checks issuer & audience
- ✅ Extracts user context
- ✅ Logs auth events with correlation ID
- ✅ Returns 401 for invalid tokens
- ✅ Supports RBAC via roles
- ✅ Supports scopes for fine-grained access

### 3. Error Handler (`src/middleware/error-handler.ts`)

**Normalizes all errors** to consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "correlationId": "...",
    "timestamp": "2024-01-15T10:30:45.123Z"
  }
}
```

**Status Code Mapping:**
- `400` - Bad request (validation error)
- `401` - Missing/invalid token
- `403` - Insufficient permissions
- `404` - Resource not found
- `503` - Backend unavailable

### 4. Knowledge API Client (`src/services/knowledge-api-client.ts`)

**HTTP client** that forwards requests to Knowledge-Agent-POC backend.

**Features:**
- Connection pooling via axios
- Automatic timeout (30s default)
- Request/response logging
- Header forwarding (auth, correlation ID)
- User context injection (x-user-id, x-user-email)
- Graceful error handling

**Example:**
```typescript
const client = new KnowledgeAPIClient();
const events = await client.get('/v1/events', req);
```

### 5. Route Handlers

#### Events (`src/routes/events.ts`)

Proxy all event-related operations:
- List events: `GET /v1/events`
- Get event: `GET /v1/events/:eventId`
- Create: `POST /v1/events` (admin)
- Update: `PATCH /v1/events/:eventId` (admin)
- Delete: `DELETE /v1/events/:eventId` (admin)
- Nested sessions: `GET /v1/events/:eventId/sessions`
- Nested projects: `GET /v1/events/:eventId/projects`

#### Projects (`src/routes/projects.ts`)

Proxy project operations:
- Get project: `GET /v1/projects/:projectId`
- Update: `PATCH /v1/projects/:projectId`
- Delete: `DELETE /v1/projects/:projectId` (admin)
- Knowledge: `GET /v1/projects/:projectId/knowledge`
- Compile: `POST /v1/projects/:projectId/compile`

#### Knowledge (`src/routes/knowledge.ts`)

Proxy knowledge extraction:
- Extract: `POST /v1/knowledge/extract`
- Status: `GET /v1/knowledge/extract/:jobId`
- Search: `POST /v1/knowledge/search`
- Artifacts: `GET /v1/knowledge/artifacts/:artifactId`

#### Health (`src/routes/health.ts`)

Non-authenticated endpoints:
- `/health` - Liveness (quick response)
- `/ready` - Readiness (checks backend connectivity)

### 6. Shared Types (`src/types/models.ts`)

**TypeScript interfaces** for all domain models:

```typescript
interface Event { id, displayName, location, dates, ... }
interface Project { id, eventId, title, team, ... }
interface KnowledgeArtifact { sourceType, title, claims, ... }
interface User { id, email, roles, ... }
```

Used by:
- Event Bridge (routing & validation)
- ShowcaseApp (frontend types)
- Knowledge-Agent-POC (could import)

## Request Flow Diagram

```
┌─────────────┐
│   Client    │ (ShowcaseApp, custom app, CLI)
└──────┬──────┘
       │ HTTP + JWT Bearer Token
       ▼
┌──────────────────────────────────────────────┐
│           Event Bridge (Port 3000)            │
├──────────────────────────────────────────────┤
│                                               │
│  1. CORS Check (whitelist origins)            │
│  2. Body Parse (JSON, limit 10MB)             │
│  3. Auth Middleware:                          │
│     ├─ Extract Bearer token                   │
│     ├─ Validate JWT (sig, iss, aud)           │
│     ├─ Extract user context (id, email,      │
│     │  roles, scopes)                         │
│     └─ Attach to req.auth                     │
│  4. Route Handler:                            │
│     ├─ Parse path & query params              │
│     ├─ Optional: Check roles/scopes           │
│     └─ Call KnowledgeAPIClient.method()       │
│  5. KnowledgeAPIClient:                       │
│     ├─ Forward headers (auth, correlation)    │
│     ├─ Inject user context (x-user-*)        │
│     ├─ Make HTTP request to backend           │
│     └─ Handle response/error                  │
│  6. Response Pipeline:                        │
│     ├─ Success: Return data                   │
│     ├─ Error: Normalize & return              │
│     └─ Log event (method, path, status, user) │
│                                               │
└──────────────────┬───────────────────────────┘
                   │ HTTP Request
                   ▼
┌──────────────────────────────────────────────┐
│   Knowledge-Agent-POC (Port 8000)             │
├──────────────────────────────────────────────┤
│                                               │
│  - Event CRUD (PostgreSQL)                    │
│  - Project Management (PostgreSQL)            │
│  - Knowledge Extraction (Celery async jobs)   │
│  - Neo4j Graph Operations                     │
│  - Analytics & Reporting                      │
│                                               │
└──────────────────────────────────────────────┘
```

## Data Models Relationship

```
Event
  ├── Sessions (1:N)
  │   ├── Speakers (N:M Person)
  │   └── Related Items (papers, repos)
  │
  └── Projects (1:N)
      ├── Team (N:M Person)
      ├── Knowledge Artifacts (1:N)
      │   ├── Source Type (paper, talk, repo)
      │   └── Extracted Info (claims, methods, etc)
      └── Compiled Summary (1:1)
          ├── What's New
          ├── Evidence & Examples
          ├── Next Steps
          └── FAQ
```

## Security Architecture

```
┌─────────────────────────────────────────────┐
│        Client (ShowcaseApp, CLI)             │
└────────────────────┬────────────────────────┘
                     │
                     │ 1. Auth Provider (Azure AD, custom)
                     │    generates JWT token
                     │
                     ▼
┌─────────────────────────────────────────────┐
│      Client sends: Authorization: Bearer... │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│          Event Bridge Auth Middleware        │
│  ├─ Extract Bearer token                    │
│  ├─ Verify signature (JWT_SECRET)           │
│  ├─ Check issuer (JWT_ISSUER)               │
│  ├─ Check audience (JWT_AUDIENCE)           │
│  ├─ Check expiration                        │
│  └─ Extract claims (roles, scopes)          │
└────────────────────┬────────────────────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
      Token Valid        Token Invalid
            │                 │
            ▼                 ▼
      req.auth set      return 401
            │
            ▼
┌─────────────────────────────────────────────┐
│      Route Handler (optional RBAC)           │
│  if (req.auth.roles.includes('admin'))      │
│    ✅ Proceed                                │
│  else                                        │
│    ❌ return 403 Forbidden                   │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│   Forward to Backend with user context      │
│  Headers:                                    │
│  - Authorization: Bearer <token>            │
│  - x-user-id: <userId>                      │
│  - x-user-email: <email>                    │
│  - x-correlation-id: <traceId>              │
└─────────────────────────────────────────────┘
```

## Deployment Architecture

### Single Instance (Dev/Small)

```
┌─────────────────────────────┐
│    Azure App Service        │
│  ├─ Event Bridge (1 instance)
│  └─ ENV: NODE_SCALING=false
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│    Azure App Service        │
│  └─ Knowledge-Agent-POC      │
└─────────────────────────────┘
```

### Multi-Instance (Production)

```
┌─────────────────────────────────────────┐
│        Azure Load Balancer              │
└────────────┬────────────────────────────┘
             │
    ┌────────┼────────┬────────┐
    ▼        ▼        ▼        ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│Bridge │ │Bridge │ │Bridge │ │Bridge │
│Pod 1  │ │Pod 2  │ │Pod 3  │ │Pod N  │
└───────┘ └───────┘ └───────┘ └───────┘
    │        │        │        │
    └────────┼────────┼────────┘
             │        │
             ▼        ▼
         Cache (Redis, optional)
```

## Performance Optimization

### Request Caching

Implement optional Redis caching for:
- Event lists (TTL: 5 minutes)
- Project details (TTL: 10 minutes)
- Knowledge artifacts (TTL: 30 minutes)

### Connection Pooling

- Axios connection pool (default: 10 keep-alive connections)
- Reuse TCP connections to backend
- Configure via env: `KNOWLEDGE_API_POOL_SIZE`

### Request Timeout

- Default: 30 seconds
- Configurable: `KNOWLEDGE_API_TIMEOUT` env var
- Individual route timeouts possible

### Compression

```typescript
app.use(compression()); // enable gzip for responses > 1KB
```

## Monitoring & Observability

### Logging

All requests logged with:
- Correlation ID (unique per request)
- User ID & email (when authenticated)
- Method, path, status code
- Response time (ms)
- Error details (when applicable)

### Distributed Tracing

Correlation ID flows through:
```
Client Request
  ↓
Bridge (generates/forwards)
  ↓
Backend (receives in header)
  ↓
Logs can be correlated across services
```

### Health Checks

1. **Liveness** (`/health`): Quick response, no dependencies
2. **Readiness** (`/ready`): Checks backend connectivity

Azure App Service uses these for:
- Auto-restart if liveness fails
- Take instance out of rotation if readiness fails

## Testing Strategy

### Unit Tests
- Middleware (auth, error handling)
- API client (request/response handling)
- Type definitions

### Integration Tests
- Full request flow with mock backend
- Auth with various token scenarios
- Error handling & status codes

### End-to-End Tests
- Full stack with real backend
- Multiple frontends connecting
- Concurrent requests

## Future Enhancements

### Phase 2
- [ ] Request/response caching
- [ ] Rate limiting per user/app
- [ ] API versioning (v2, v3)
- [ ] GraphQL layer (alternative to REST)
- [ ] WebSocket support (real-time events)

### Phase 3
- [ ] Service mesh integration (Istio)
- [ ] Circuit breaker pattern
- [ ] Automatic retry logic
- [ ] Request signing (mutual TLS)
- [ ] Advanced monitoring (Datadog, New Relic)

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [README.md](./README.md) - Quick start & API reference
- [Backend API Docs](http://localhost:8000/docs) - Knowledge-Agent-POC
