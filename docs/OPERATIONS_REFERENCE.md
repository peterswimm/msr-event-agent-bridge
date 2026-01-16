# MSR Event Hub - Operations & Reference Guide

**Version**: 2.0  
**Last Updated**: January 12, 2026  
**Scope**: Complete API reference, system architecture, RBAC permissions, troubleshooting, and production deployment runbook

This document consolidates all critical operational reference material for the MSR Event Hub platform, including API documentation, system design, security policies, common issues, and deployment procedures.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Complete API Reference](#complete-api-reference)
3. [RBAC & Authorization](#rbac--authorization)
4. [Troubleshooting Guide](#troubleshooting-guide)
5. [Production Deployment Runbook](#production-deployment-runbook)

---

# System Architecture

## 🏗️ Architecture Overview

The MSR Event Hub is a **two-tier distributed platform** for managing events, projects, knowledge extraction, and AI-powered discovery.

### Platform Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Frontend Tier                                  │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ React 18 + Vite 7 + Fluent UI v9 (Dark Theme)                   │ │
│  │ • Modern responsive UI                                           │ │
│  │ • TypeScript for type safety                                    │ │
│  │ • Fully configurable via environment variables                  │ │
│  └──────────────────────────────┬──────────────────────────────────┘ │
└─────────────────────────────────┼─────────────────────────────────────┘
                                  │ REST API + JWT
┌─────────────────────────────────┼─────────────────────────────────────┐
│              API Gateway Tier (Port 3000)                             │
│  ┌──────────────────────────────┴──────────────────────────────────┐ │
│  │  Express.js Gateway (msr-event-agent-bridge)                   │ │
│  │  • JWT validation & RBAC enforcement                            │ │
│  │  • Error normalization & logging                                │ │
│  │  • Request forwarding & correlation tracking                    │ │
│  │  • CMK encryption integration (Azure Key Vault)                │ │
│  │  • Multi-origin CORS support                                    │ │
│  └──────────────────────────────┬──────────────────────────────────┘ │
└─────────────────────────────────┼─────────────────────────────────────┘
                                  │ Internal REST API
┌─────────────────────────────────┼─────────────────────────────────────┐
│              Application Tier (Port 8000)                             │
│  ┌──────────────────────────────┴──────────────────────────────────┐ │
│  │  FastAPI Application (msr-event-agent-chat)                    │ │
│  │  • Event & Project management                                   │ │
│  │  • Knowledge extraction agents (paper/talk/repo)               │ │
│  │  • Workflow orchestration & compilation                         │ │
│  │  • Hybrid chat routing                                          │ │
│  │  • Neo4j graph integration                                      │ │
│  └────────┬──────────────┬──────────────┬──────────────┬──────────┘ │
└───────────┼──────────────┼──────────────┼──────────────┼──────────────┘
            │              │              │              │
        ┌───▼──┐      ┌────▼─────┐  ┌───▼──┐        ┌──▼──────┐
        │ PG   │      │  Neo4j   │  │Redis │        │ Azure   │
        │ SQL  │      │  Graph   │  │Cache │        │ OpenAI  │
        └──────┘      └──────────┘  └──────┘        └─────────┘
```

### Component Breakdown

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **Frontend** | React 18 + Vite + Fluent UI | 5173 | User interface for event discovery, projects, chat |
| **API Gateway** | Express.js + TypeScript | 3000 | Authentication, error handling, request forwarding |
| **Backend** | FastAPI + Python | 8000 | Business logic, knowledge extraction, workflows |
| **Database** | PostgreSQL | 5432 | Relational data (events, projects, users) |
| **Graph DB** | Neo4j | 7687 | Knowledge relationships & semantic search |
| **Cache** | Redis | 6379 | Session data, hot cache, async job queue |
| **LLM** | Azure OpenAI | API | Language model for extraction & chat |

### Data Model

```
Event (base container)
├── id, displayName, description
├── startDate, endDate, location, timeZone
├── eventType (conference/seminar/lecture-series)
├── status (draft/live/archived)
└── createdAt, updatedAt
    │
    ├─── Session (within Event)
    │    ├── id, title, description
    │    ├── speaker(s), time, duration
    │    ├── sessionType (keynote/paper/demo/panel)
    │    └── resources (slides, transcript, video)
    │    │
    │    └─── Project (Event-scoped)
    │         ├── id, title, abstract, team
    │         ├── status (draft/submitted/approved/published)
    │         ├── tags, keywords, research-area
    │         │
    │         ├─── KnowledgeArtifact (scoped to Project)
    │         │    ├── sourceType (paper/talk/repository)
    │         │    ├── title, extractedText, claims
    │         │    ├── methods, limitations, evidence
    │         │    ├── sourceUrl, extractedAt
    │         │    └── status (draft/review/approved)
    │         │
    │         └─── CompiledSummary (Published)
    │              ├── whatIsNew, problemStatement
    │              ├── keyMethods, evidenceAndExamples
    │              ├── nextSteps, keyInsights
    │              ├── faq (generated), keywords
    │              └── publishedAt, modifiedAt
    │
User (Global)
├── id, email, displayName
├── roles [user, presenter, organizer, admin]
├── passwordHash (bcrypt)
├── lastLoginAt
└── preferences (theme, notifications)
```

### Database Schema

**PostgreSQL Tables**:
- `events` - Event definitions
- `sessions` - Sessions within events
- `projects` - Projects/posters scoped to events
- `knowledge_artifacts` - Draft knowledge (paper/talk/repo extracts)
- `published_knowledge` - Published/compiled knowledge
- `users` - User accounts & roles
- `evaluation_executions` - Workflow execution history
- `async_jobs` - Celery task tracking

**Neo4j Nodes**:
- `Paper`, `Author`, `Technology`, `Concept`, `Venue`
- `Project`, `Artifact`, `Evaluation`, `Event`

### Authentication & Authorization Flow

```
1. User submits credentials
                    ↓
2. Backend validates (JWT_SECRET)
                    ↓
3. Token issued (JWT)
   {
     "sub": "user-id",
     "email": "user@example.com",
     "roles": ["user", "organizer"],
     "exp": 1234567890,
     "iss": "https://eventhub.internal.microsoft.com",
     "aud": "event-hub-apps"
   }
                    ↓
4. Client stores token
                    ↓
5. All requests include: Authorization: Bearer <token>
                    ↓
6. Gateway validates:
   - Signature (JWT_SECRET)
   - Issuer/Audience match
   - Not expired
   - Extract user context
                    ↓
7. Request forwarded with X-User-* headers
```

### Knowledge Extraction Workflow

```
1. User uploads paper/transcript/repo link
                    ↓
2. System enqueues extraction job (Celery)
                    ↓
3. Agent analyzes source:
   - PaperAgent: extracts claims, methods, limitations
   - TalkAgent: extracts key findings, Q&A
   - RepositoryAgent: extracts tech stack, patterns
                    ↓
4. Structured JSON produced (KnowledgeArtifact)
                    ↓
5. User reviews draft
                    ↓
6. Organizer approves
                    ↓
7. System publishes (updates PublishedKnowledge)
```

### Project Compilation Workflow

```
1. Project contains 3 KnowledgeArtifacts (paper + talk + repo)
                    ↓
2. User initiates compilation
                    ↓
3. HybridEvaluator scores each artifact (1-5 scale)
                    ↓
4. If score < threshold: iterate with refined prompts
                    ↓
5. Once all artifacts approved
                    ↓
6. System generates compiled summary:
   - What's New (synthesis)
   - Key Methods (technical overview)
   - Evidence & Examples (proof points)
   - Next Steps (future work)
   - FAQ (generated from artifacts)
                    ↓
7. Publish to event project hub
```

### Configuration

#### Frontend (web/chat/.env)

```env
# API Configuration
VITE_CHAT_API_BASE=/api                    # Gateway endpoint
VITE_AOAI_ENDPOINT=https://xxx.openai.azure.com
VITE_AOAI_DEPLOYMENT=gpt-4
VITE_AOAI_API_VERSION=2024-02-15-preview

# UI Configuration
VITE_SITE_TITLE=MSR Event Hub
VITE_THEME=webDark
VITE_FEEDBACK_URL=mailto:feedback@microsoft.com

# Example Prompts
VITE_HERO_CARDS='[{"title":"Find research...","prompt":"..."}]'
```

#### API Gateway (.env)

```env
PORT=3000
NODE_ENV=production

# Backend Service
KNOWLEDGE_API_URL=http://knowledge-api:8000
KNOWLEDGE_API_TIMEOUT=30000

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_ISSUER=https://eventhub.internal.microsoft.com
JWT_AUDIENCE=event-hub-apps

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://myapp.com

# CMK - Customer-Managed Keys
CMK_ENABLED=false
KEY_VAULT_URL=https://kv-xxx.vault.azure.net/
ENCRYPTION_KEY_NAME=event-hub-cmk

# Logging
LOG_LEVEL=info
```

#### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/msrevents
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Cache
REDIS_URL=redis://localhost:6379/0

# AI Services
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Authentication
JWT_SECRET=your-secret-key
JWT_ISSUER=https://eventhub.internal.microsoft.com

# Async Jobs
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

### Deployment Options

#### Local Development

```bash
# Backend
python run_server.py --reload

# Frontend
cd web/chat && npm run dev

# Gateway
cd ../msr-event-agent-bridge && npm run dev
```

#### Docker Compose (Complete Stack)

```bash
docker-compose up -d
```

Starts:
- Backend API (8000)
- Frontend (5173)
- Gateway (3000)
- PostgreSQL (5432)
- Neo4j (7687)
- Redis (6379)

#### Azure App Service

```bash
# Package
npm run build

# Deploy
az webapp up --resource-group event-hub-rg --name event-bridge-api

# Configure environment
az webapp config appsettings set --settings KEY1=value1 KEY2=value2
```

#### Kubernetes

See `k8s/deployment.yaml` for helm charts and manifests.

### Monitoring & Observability

#### Key Metrics

**Gateway Metrics**:
- Request count by endpoint
- Response time (p50, p95, p99)
- Error rate by status code
- JWT validation successes/failures
- Active connections

**Backend Metrics**:
- Knowledge extraction job count & duration
- Database query performance
- Neo4j graph query latency
- Celery task queue depth
- LLM API latency & cost

**Business Metrics**:
- Events created/published
- Projects submitted/approved
- Knowledge artifacts extracted
- Users active per day
- Chat message volume

#### Logging

**Structured Logging** (Pino + structlog):

```json
{
  "timestamp": "2025-01-12T10:30:00Z",
  "level": "info",
  "module": "gateway",
  "correlation_id": "abc-123-def",
  "user_id": "user123",
  "endpoint": "POST /v1/knowledge/extract",
  "status": 202,
  "duration_ms": 145,
  "message": "Knowledge extraction enqueued"
}
```

### Security

#### At-Rest Encryption

- **CMK**: Customer-Managed Keys via Azure Key Vault
- **Algorithm**: RSA-OAEP with 2048-bit keys
- **Scope**: Sensitive data fields (API keys, passwords)

#### In-Transit Encryption

- **HTTPS/TLS 1.2+**: All external traffic
- **Mutual TLS**: Internal service-to-service (optional)

#### Access Control

- **JWT**: Token-based stateless authentication
- **RBAC**: Role-based permissions (user/presenter/organizer/admin)
- **Managed Identity**: Azure AD for platform services
- **API Keys**: Personal access tokens for CLI/automation

#### Audit Logging

- All data modifications logged with user & timestamp
- Key Vault access tracked via diagnostics
- Chat history retained for compliance

---

# Complete API Reference

**Base URL**: `https://api.eventhub.microsoft.com` (Production) or `http://localhost:3000` (Local)

All endpoints require authentication via JWT bearer token except `/health` and `/ready`.

## 🔐 Authentication

### JWT Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload** (example):
```json
{
  "sub": "user@microsoft.com",
  "email": "user@microsoft.com",
  "name": "User Name",
  "roles": ["user", "organizer"],
  "scopes": ["read:events", "write:projects"],
  "iss": "https://eventhub.internal.microsoft.com",
  "aud": "event-hub-apps",
  "exp": 1234567890,
  "iat": 1234567000
}
```

### Getting a Token

```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "optional-refresh-token"
}
```

## 📋 Events

### List All Events

```http
GET /v1/events
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `$skip` | integer | Number of records to skip (default: 0) |
| `$top` | integer | Number of records to return (default: 20, max: 100) |
| `$filter` | string | OData filter (e.g., `status eq 'live'`) |
| `$orderBy` | string | Sort field (e.g., `startDate desc`) |

**Example Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  'http://localhost:3000/v1/events?$filter=status eq "live"&$orderBy=startDate desc&$top=10'
```

**Response** (200 OK):
```json
{
  "@odata.type": "microsoft.graph.collection",
  "@odata.count": 5,
  "value": [
    {
      "@odata.type": "microsoft.graph.event",
      "id": "evt_001",
      "displayName": "MSR Research Showcase 2025",
      "description": "Annual research conference",
      "startDate": "2025-03-15",
      "endDate": "2025-03-16",
      "location": "Redmond, WA",
      "eventType": "conference",
      "status": "live",
      "timeZone": "America/Los_Angeles",
      "@odata.etag": "W/\"123456\"",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-12T15:30:00Z"
    }
  ]
}
```

**Errors**:
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Insufficient permissions
- `400 Bad Request` - Invalid filter syntax

### Create Event

```http
POST /v1/events
Content-Type: application/json
```

**Required Role**: `admin` or `organizer`

**Request Body**:
```json
{
  "displayName": "MSR AI Summit 2025",
  "description": "Annual AI research conference",
  "startDate": "2025-06-01",
  "endDate": "2025-06-02",
  "location": "Seattle, WA",
  "eventType": "conference",
  "timeZone": "America/Los_Angeles",
  "tags": ["AI", "research", "conference"],
  "imageUrl": "https://example.com/event.jpg"
}
```

**Response** (201 Created):
```json
{
  "@odata.type": "microsoft.graph.event",
  "id": "evt_new_001",
  "displayName": "MSR AI Summit 2025",
  "startDate": "2025-06-01",
  "status": "draft",
  "createdAt": "2025-01-12T16:00:00Z"
}
```

**Errors**:
- `400 Bad Request` - Missing required fields
- `403 Forbidden` - Insufficient permissions
- `409 Conflict` - Event already exists

### Get Event

```http
GET /v1/events/{eventId}
```

**Response** (200 OK):
```json
{
  "@odata.type": "microsoft.graph.event",
  "id": "evt_001",
  "displayName": "MSR Research Showcase",
  "description": "Annual research conference",
  "startDate": "2025-03-15",
  "endDate": "2025-03-16",
  "location": "Redmond, WA",
  "eventType": "conference",
  "status": "live",
  "tags": ["research", "showcase"],
  "projectCount": 42,
  "sessionCount": 18,
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-12T15:30:00Z"
}
```

### Update Event

```http
PATCH /v1/events/{eventId}
Content-Type: application/json
```

**Required Role**: `organizer` or `admin`

**Request Body** (partial update):
```json
{
  "displayName": "Updated Event Name",
  "status": "archived"
}
```

**Response** (200 OK):
```json
{
  "@odata.type": "microsoft.graph.event",
  "id": "evt_001",
  "displayName": "Updated Event Name",
  "status": "archived",
  "updatedAt": "2025-01-12T16:15:00Z"
}
```

### Delete Event

```http
DELETE /v1/events/{eventId}
```

**Required Role**: `admin`

**Response** (204 No Content)

## 📌 Sessions

### List Event Sessions

```http
GET /v1/events/{eventId}/sessions
```

**Example Response**:
```json
{
  "@odata.count": 3,
  "value": [
    {
      "id": "sess_001",
      "eventId": "evt_001",
      "title": "Keynote: The Future of AI",
      "speakers": ["alice@microsoft.com", "bob@microsoft.com"],
      "sessionType": "keynote",
      "startTime": "2025-03-15T09:00:00Z",
      "endTime": "2025-03-15T10:00:00Z",
      "room": "Grand Ballroom A",
      "capacity": 500,
      "attendees": 387,
      "transcript": "https://...pdf"
    }
  ]
}
```

### Create Session

```http
POST /v1/events/{eventId}/sessions
```

**Request Body**:
```json
{
  "title": "Workshop: Building AI Agents",
  "speakers": ["alice@microsoft.com"],
  "sessionType": "workshop",
  "startTime": "2025-03-15T14:00:00Z",
  "endTime": "2025-03-15T15:30:00Z",
  "room": "Room 101",
  "capacity": 50
}
```

## 🎯 Projects & Posters

### List Projects

```http
GET /v1/events/{eventId}/projects
```

**Response**:
```json
{
  "@odata.count": 42,
  "value": [
    {
      "id": "proj_001",
      "eventId": "evt_001",
      "title": "Knowledge Extraction from Research Papers",
      "abstract": "Automated extraction of claims and methods...",
      "team": ["alice@microsoft.com", "bob@microsoft.com"],
      "tags": ["AI", "NLP", "knowledge-management"],
      "status": "published",
      "artifacts": 3,
      "createdAt": "2025-01-10T10:00:00Z",
      "publishedAt": "2025-01-12T10:00:00Z"
    }
  ]
}
```

### Create Project

```http
POST /v1/events/{eventId}/projects
```

**Required Role**: `presenter` or `organizer`

**Request Body**:
```json
{
  "title": "New Research Project",
  "abstract": "Short abstract describing the project",
  "team": ["user@microsoft.com"],
  "tags": ["research", "ai"],
  "description": "Longer description..."
}
```

**Response** (201 Created):
```json
{
  "id": "proj_new_001",
  "eventId": "evt_001",
  "title": "New Research Project",
  "status": "draft",
  "createdAt": "2025-01-12T16:20:00Z"
}
```

### Get Project

```http
GET /v1/projects/{projectId}
```

**Response** (200 OK):
```json
{
  "id": "proj_001",
  "eventId": "evt_001",
  "title": "Knowledge Extraction from Research Papers",
  "abstract": "Automated extraction of claims and methods using LLM agents",
  "team": ["alice@microsoft.com", "bob@microsoft.com"],
  "status": "published",
  "tags": ["AI", "NLP"],
  "knowledgeArtifactIds": ["art_001", "art_002", "art_003"],
  "publishedSummary": {
    "whatIsNew": "First automated approach to extract structured knowledge from academic papers without human annotation",
    "keyMethods": [
      "Multi-stage PDF parsing with layout analysis",
      "LLM prompting with few-shot examples",
      "Iterative refinement with expert feedback"
    ],
    "evidenceAndExamples": [
      "Evaluated on 100 papers across 5 domains",
      "Achieves 92% accuracy on claim extraction",
      "Reduces annotation time by 80%"
    ],
    "nextSteps": [
      "Extend to conference papers and preprints",
      "Fine-tune LLM for specific domains",
      "Build interactive tool for researchers"
    ],
    "keywords": ["knowledge-extraction", "nlp", "academic-papers"],
    "faq": [
      {
        "question": "How accurate is the extraction?",
        "answer": "Our system achieves 92% accuracy on claim extraction and 87% on methods extraction, validated against expert annotations."
      }
    ]
  },
  "publishedAt": "2025-01-12T10:00:00Z"
}
```

### Update Project

```http
PATCH /v1/projects/{projectId}
```

**Request Body** (partial):
```json
{
  "title": "Updated Title",
  "status": "draft"
}
```

### Delete Project

```http
DELETE /v1/projects/{projectId}
```

**Required Role**: `organizer` or `admin`

## 💡 Knowledge Artifacts

### List Project Knowledge

```http
GET /v1/projects/{projectId}/knowledge
```

**Response**:
```json
{
  "@odata.count": 3,
  "value": [
    {
      "id": "art_001",
      "projectId": "proj_001",
      "sourceType": "paper",
      "title": "Attention Is All You Need",
      "sourceUrl": "https://arxiv.org/pdf/1706.03762.pdf",
      "extractedText": "...",
      "claims": ["Attention mechanism is sufficient for sequence modeling"],
      "methods": ["Multi-head attention", "Positional encoding"],
      "limitations": ["Requires large-scale training data"],
      "status": "approved",
      "extractedAt": "2025-01-10T10:00:00Z"
    }
  ]
}
```

### Add Knowledge Artifact

```http
POST /v1/projects/{projectId}/knowledge
```

**Request Body**:
```json
{
  "sourceType": "paper",
  "title": "Paper Title",
  "sourceUrl": "https://arxiv.org/pdf/..."
}
```

The system will automatically extract and analyze the source.

**Response** (202 Accepted):
```json
{
  "jobId": "job_abc123",
  "status": "queued",
  "projectId": "proj_001"
}
```

### Knowledge Extraction

```http
POST /v1/knowledge/extract
```

**Request Body**:
```json
{
  "projectId": "proj_001",
  "sourceType": "paper",
  "sourceUrl": "https://arxiv.org/pdf/2301.00001.pdf",
  "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP"
}
```

**Response**:
```json
{
  "jobId": "job_abc123",
  "status": "queued",
  "projectId": "proj_001",
  "sourceType": "paper",
  "enqueuedAt": "2025-01-12T10:15:00Z",
  "estimatedCompletionTime": "2025-01-12T10:30:00Z"
}
```

### Search Knowledge

```http
GET /v1/knowledge/search?q=attention%20mechanism&limit=10
```

**Response**:
```json
{
  "results": [
    {
      "id": "art_001",
      "title": "Attention Is All You Need",
      "excerpt": "...attention mechanism is sufficient for sequence modeling...",
      "relevanceScore": 0.95,
      "sourceType": "paper",
      "projectId": "proj_001"
    }
  ]
}
```

## 💬 Chat & Interactions

### Send Chat Message

```http
POST /v1/chat
```

**Request Body**:
```json
{
  "message": "What are the key findings from this project?",
  "context": {
    "projectId": "proj_001",
    "conversationId": "conv_123"
  }
}
```

**Response** (200 OK - Streaming):
```json
{
  "conversationId": "conv_123",
  "messageId": "msg_456",
  "response": "The project demonstrates...",
  "sources": ["art_001", "art_002"],
  "timestamp": "2025-01-12T10:30:00Z"
}
```

### Get Chat History

```http
GET /v1/chat/history/{userId}?limit=50
```

### Health & Status

```http
GET /health
GET /ready
GET /health/keyvault
GET /docs
```

---

# RBAC & Authorization

## 🔐 Role Hierarchy

```
┌─────────────────────────────────────────┐
│           ROLE HIERARCHY                │
├─────────────────────────────────────────┤
│                                         │
│  Admin (All Permissions)                │
│    ├─ Organizer                         │
│    │   ├─ Presenter                     │
│    │   │   └─ User                      │
│    │   └─ Reviewer                      │
│    │       └─ User                      │
│    │                                    │
│    └─ Moderator                         │
│        └─ User                          │
│                                         │
└─────────────────────────────────────────┘
```

## 👥 Role Definitions

| Role | Description | Primary Responsibility |
|------|-------------|-----|
| **Admin** | Full system access, can manage users, events, and all content | System administration, user management |
| **Organizer** | Can create/manage events, sessions, and review projects | Event planning and execution |
| **Presenter** | Can submit projects and manage their own submissions | Content submission and presentation |
| **Reviewer** | Can approve/reject knowledge artifacts and provide feedback | Quality control and feedback |
| **Moderator** | Can moderate discussions, manage comments, enforce community guidelines | Community management |
| **User** | Default role; can view events and participate in chat | Viewing and learning |

## 📊 Permission Matrix

### Events Management

| Operation | User | Presenter | Reviewer | Moderator | Organizer | Admin |
|-----------|:----:|:--------:|:--------:|:---------:|:---------:|:-----:|
| **View Events** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **List All Events** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Create Event** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Edit Event** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Delete Event** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Archive Event** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Publish Event** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |

### Projects & Submissions

| Operation | User | Presenter | Reviewer | Moderator | Organizer | Admin |
|-----------|:----:|:--------:|:--------:|:---------:|:---------:|:-----:|
| **View Projects** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Create Project** | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Edit Own Project** | ✗ | ✓* | ✗ | ✗ | ✗ | ✓ |
| **Edit Any Project** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Delete Own Project** | ✗ | ✓* | ✗ | ✗ | ✗ | ✓ |
| **Delete Any Project** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Submit for Review** | ✗ | ✓* | ✗ | ✗ | ✓ | ✓ |
| **Publish Project** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |

### Knowledge Artifacts

| Operation | User | Presenter | Reviewer | Moderator | Organizer | Admin |
|-----------|:----:|:--------:|:--------:|:---------:|:---------:|:-----:|
| **View Approved Artifacts** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **View All Artifacts** | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Add Artifact to Project** | ✗ | ✓* | ✗ | ✗ | ✓ | ✓ |
| **Extract Knowledge** | ✗ | ✓* | ✗ | ✗ | ✓ | ✓ |
| **Approve Artifact** | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Reject Artifact** | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Request Changes** | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |

### Chat & Discussions

| Operation | User | Presenter | Reviewer | Moderator | Organizer | Admin |
|-----------|:----:|:--------:|:--------:|:---------:|:---------:|:-----:|
| **Send Messages** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **View Chat History** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Delete Own Message** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Delete Any Message** | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Mute User** | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Ban User** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |

### User & Account Management

| Operation | User | Presenter | Reviewer | Moderator | Organizer | Admin |
|-----------|:----:|:--------:|:--------:|:---------:|:---------:|:-----:|
| **View Own Profile** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Edit Own Profile** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Create User** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Assign Roles** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **View All Users** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Disable User** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

## 🔑 API Endpoints by Role

### Public Endpoints (No Auth Required)
- `GET /health` - Health check
- `GET /ready` - Readiness probe
- `POST /auth/token` - Authentication

### User Level
```
GET    /v1/events           # List published events
GET    /v1/events/{id}      # View event
GET    /v1/chat             # Chat history
POST   /v1/chat             # Send message
GET    /v1/knowledge/search # Search knowledge
```

### Presenter Level (Includes User + Following)
```
POST   /v1/events/{eventId}/projects           # Create project
PATCH  /v1/projects/{projectId}                # Edit own project
POST   /v1/projects/{projectId}/knowledge      # Add artifact
GET    /v1/projects/{projectId}/artifacts      # View artifacts
```

### Reviewer Level
```
GET    /v1/knowledge/{artifactId}           # View all artifacts
PATCH  /v1/knowledge/{artifactId}/status    # Approve/reject
POST   /v1/knowledge/{artifactId}/feedback  # Add feedback
```

### Organizer Level
```
POST   /v1/events                      # Create event
PATCH  /v1/events/{eventId}            # Edit event
POST   /v1/events/{eventId}/sessions   # Create session
DELETE /v1/projects/{projectId}        # Delete any project
```

### Admin Level (Full Access)
```
DELETE /v1/events/{eventId}                    # Delete event
POST   /v1/admin/users                         # Create user
PATCH  /v1/admin/users/{userId}/roles         # Assign role
GET    /v1/admin/audit/logs                   # Access audit logs
```

## 🛡️ Authorization Checks

The gateway performs the following authorization flow:

1. **Token Validation** - Verify JWT signature and expiration
2. **Role Extraction** - Extract `roles` claim from token
3. **Endpoint Mapping** - Check if role is allowed for endpoint
4. **Resource Ownership** - For resources marked with `*`, verify user ownership
5. **Hierarchy Check** - Higher roles inherit lower role permissions

---

# Troubleshooting Guide

## 🔍 Gateway Issues

### Authentication & Authorization

#### 401 Unauthorized - Invalid Token

**Symptom**: API returns `401 Unauthorized` error

**Solutions**:

1. **Check Token Expiration**
   ```bash
   # Decode JWT
   jwt decode YOUR_TOKEN
   # Look for "exp" field - compare to current Unix timestamp
   date +%s  # Current time
   ```

2. **Validate Header Format**
   ```bash
   # ❌ WRONG:
   curl -H "Authorization: TOKEN_WITHOUT_BEARER" ...
   
   # ✓ CORRECT:
   curl -H "Authorization: Bearer YOUR_TOKEN" ...
   ```

3. **Get New Token**
   ```bash
   curl -X POST http://localhost:3000/auth/token \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "securepassword"
     }'
   ```

4. **Check Token in Local Storage** (Browser)
   ```javascript
   localStorage.getItem('auth_token')
   ```

#### 403 Forbidden - Insufficient Permissions

**Symptom**: API returns `403 Forbidden` error

**Solutions**:

1. **Check User Roles**
   ```bash
   jwt decode YOUR_TOKEN | grep roles
   ```

2. **Verify Endpoint Requirements**
   
   | Endpoint | Required Role |
   | -------- | ------------- |
   | `POST /v1/events` | organizer |
   | `POST /v1/projects/{id}` | presenter |
   | `PATCH /v1/knowledge/{id}/status` | reviewer |

3. **Get Role Assigned** (Admin)
   ```bash
   curl -X POST http://localhost:3000/v1/admin/users/{userId}/roles \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"roles": ["user", "presenter"]}'
   ```

### Network & Connectivity

#### Connection Refused

**Symptom**: `connect ECONNREFUSED 127.0.0.1:3000`

**Solutions**:

1. **Check if Gateway is Running**
   ```bash
   netstat -ano | findstr :3000
   ```

2. **Start Gateway**
   ```bash
   cd msr-event-agent-bridge
   npm run dev
   ```

3. **Check for Port Conflicts**
   ```bash
   taskkill /PID 12345 /F
   PORT=3001 npm run dev
   ```

#### Network Timeout

**Symptom**: Request hangs for 30+ seconds then fails

**Solutions**:

1. **Check Backend Status**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Increase Timeout** (in client code)
   ```typescript
   const response = await axios.get(url, {
     timeout: 60000  # 60 seconds
   });
   ```

### Data Issues

#### 404 Not Found - Resource Missing

**Symptom**: API returns `404 Not Found` for existing resource

**Solutions**:

1. **Verify Resource ID**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/v1/events
   ```

2. **Check Resource Deletion**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/v1/projects/proj_001 -v
   ```

#### 409 Conflict - State Mismatch

**Symptom**: Error message: `Cannot edit published project`

**Solutions**:

1. **Check Resource State**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/v1/projects/proj_001
   ```

2. **Only Edit Draft Resources**
   - Can edit: draft → submitted → approved → published
   - Cannot modify: published, archived

### CMK (Key Vault) Issues

#### Key Vault Service Initialization Failed

**Symptom**: Error message: `KeyVaultService not initialized`

**Solutions**:

1. **Check CMK Status**
   ```bash
   curl http://localhost:3000/health | jq '.keyvault'
   ```

2. **Verify Environment Variables**
   ```bash
   cat .env | grep KEY_VAULT
   # Should have: KEY_VAULT_URL, ENCRYPTION_KEY_NAME, CMK_ENABLED=true
   ```

3. **Test Key Vault Access**
   ```bash
   az keyvault show --name my-keyvault
   ```

## 🔍 Backend Issues

### Python Environment

#### ModuleNotFoundError

**Symptom**: `ModuleNotFoundError: No module named 'fastapi'`

**Solutions**:

1. **Install Dependencies**
   ```bash
   cd msr-event-agent-chat
   pip install -r requirements.txt
   ```

2. **Activate Virtual Environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Check Python Version**
   ```bash
   python --version  # Should be 3.10+
   ```

#### Port Already in Use

**Symptom**: `OSError: [Errno 48] Address already in use`

**Solutions**:

1. **Find Process Using Port**
   ```bash
   netstat -ano | findstr :8000
   ```

2. **Kill Process**
   ```bash
   taskkill /PID 12345 /F
   ```

### Database Issues

#### PostgreSQL Connection Failed

**Symptom**: `could not connect to server: Connection refused`

**Solutions**:

1. **Check PostgreSQL Status**
   ```bash
   psql --version
   # Ensure service is running
   ```

2. **Verify Connection String**
   ```bash
   echo $DATABASE_URL
   # Should be: postgresql://user:pass@localhost:5432/dbname
   ```

3. **Test Connection**
   ```bash
   psql postgresql://user:pass@localhost:5432/dbname
   ```

#### Database Migrations Failed

**Symptom**: Alembic migration errors during startup

**Solutions**:

1. **Run Migrations Manually**
   ```bash
   alembic upgrade head
   ```

2. **Check Migration Status**
   ```bash
   alembic current
   ```

### Knowledge Extraction Issues

#### Extraction Job Timeout

**Symptom**: Knowledge extraction takes > 5 minutes or fails

**Solutions**:

1. **Check Redis Connection**
   ```bash
   redis-cli ping  # Should return PONG
   ```

2. **Check Celery Worker**
   ```bash
   celery -A app.celery worker --loglevel=info
   ```

3. **Verify LLM Connectivity**
   ```bash
   curl $AZURE_OPENAI_ENDPOINT/health
   ```

---

# Production Deployment Runbook

**Audience**: DevOps, Site Reliability Engineers, Operations

## 📋 Pre-Deployment Checklist

### Infrastructure Requirements

- [ ] Azure subscription with appropriate permissions
- [ ] Resource group created
- [ ] Storage account for logs and backups
- [ ] Application Insights instance
- [ ] Log Analytics workspace
- [ ] Azure Key Vault configured with CMK
- [ ] Azure Container Registry (for Docker images)
- [ ] Database (PostgreSQL, Neo4j) provisioned
- [ ] Redis cache instance
- [ ] VNet and subnets configured (if required)

### Security Checklist

- [ ] SSL/TLS certificates obtained
- [ ] Key Vault access policies configured
- [ ] Managed identities created for gateway and backend
- [ ] Network security groups configured
- [ ] API rate limiting configured
- [ ] WAF rules configured (if using Application Gateway)
- [ ] CORS whitelist configured
- [ ] Audit logging enabled
- [ ] Secrets rotation policy established

### Application Checklist

- [ ] Environment variables documented
- [ ] Configuration validated in staging
- [ ] Database migrations tested
- [ ] Health check endpoints verified
- [ ] Error handling tested
- [ ] Logging configured and tested
- [ ] Load testing completed
- [ ] Backup and restore procedures tested

## 🚀 Deployment Steps

### Phase 1: Infrastructure Setup

#### 1.1 Deploy Core Infrastructure

```bash
cd msr-event-agent-bridge/infra
az login
az account set --subscription "your-subscription-id"

# Create resource group
az group create \
  --name event-hub-prod \
  --location eastus

# Deploy Bicep template
az deployment group create \
  --resource-group event-hub-prod \
  --template-file main.bicep \
  --parameters \
    environmentName=prod \
    location=eastus
```

#### 1.2 Configure Database

```bash
# Connect to PostgreSQL
psql \
  --host=evhub-db-prod.postgres.database.azure.com \
  --user=adminuser@evhub-db-prod \
  --dbname=event_hub

# Run migrations
python migrations/run_migrations.py \
  --connection-string "postgresql://user:pass@host/db" \
  --direction up
```

#### 1.3 Configure Key Vault & CMK

```bash
# Run CMK setup script
pwsh scripts/deploy-cmk.ps1 \
  -ResourceGroup event-hub-prod \
  -KeyVaultName evhub-kv-prod \
  -KeyName prod-encryption-key

# Verify setup
pwsh scripts/verify-cmk-setup.ps1 \
  -ResourceGroup event-hub-prod \
  -KeyVaultName evhub-kv-prod
```

### Phase 2: Application Deployment

#### 2.1 Build Docker Images

```bash
# Gateway image
cd msr-event-agent-bridge
docker build -t evhub-gateway:latest .
docker tag evhub-gateway:latest $ACR_URL/evhub-gateway:latest
docker push $ACR_URL/evhub-gateway:latest

# Backend image
cd ../msr-event-agent-chat
docker build -t evhub-backend:latest .
docker tag evhub-backend:latest $ACR_URL/evhub-backend:latest
docker push $ACR_URL/evhub-backend:latest
```

#### 2.2 Deploy to AKS

```bash
# Create AKS cluster
az aks create \
  --resource-group event-hub-prod \
  --name event-hub-aks \
  --node-count 3

# Get credentials
az aks get-credentials \
  --resource-group event-hub-prod \
  --name event-hub-aks

# Deploy
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/gateway-deployment.yaml
kubectl apply -f kubernetes/backend-deployment.yaml

# Verify
kubectl get pods -n event-hub
```

#### 2.3 Configure Load Balancer

```bash
# Create Application Gateway
az network application-gateway create \
  --name event-hub-appgw \
  --location eastus \
  --resource-group event-hub-prod \
  --vnet-name event-hub-vnet \
  --capacity 2 \
  --sku Standard_v2
```

### Phase 3: Monitoring & Alerting

#### 3.1 Configure Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app event-hub-insights \
  --resource-group event-hub-prod \
  --location eastus
```

#### 3.2 Create Alerts

```bash
# High error rate alert
az monitor metrics alert create \
  --name "Event Hub - High Error Rate" \
  --resource-group event-hub-prod \
  --condition "avg RequestsFailed > 10" \
  --window-size 5m

# High latency alert
az monitor metrics alert create \
  --name "Event Hub - High Latency" \
  --resource-group event-hub-prod \
  --condition "avg RequestDuration > 5000" \
  --window-size 5m
```

## 📊 Monitoring & Metrics

### Key Application Insights Queries

```kusto
// Request rate and errors
requests
| summarize TotalRequests=count(), FailedRequests=sum(itemCount) by bin(timestamp, 5m)

// Response time by endpoint
requests
| summarize AvgDuration=avg(duration), P95=percentile(duration, 95) by name

// Dependency performance
dependencies
| summarize AvgDuration=avg(duration) by type, name

// Exceptions
exceptions
| summarize ErrorCount=count() by type
| order by ErrorCount desc
```

## 🔄 Scaling & Load Testing

### Horizontal Scaling

```bash
# Scale AKS nodes
az aks scale \
  --resource-group event-hub-prod \
  --name event-hub-aks \
  --node-count 5

# Auto-scaling
kubectl autoscale deployment evhub-gateway \
  --cpu-percent=70 \
  --min=2 \
  --max=10
```

### Load Testing

```bash
# Using k6
k6 run --vus 100 --duration 5m tests/load-test.js

# Target: 100 req/sec sustained
# P95 latency: < 500ms
# Error rate: < 0.1%
```

## 🔐 Security Hardening

### Network Security

```bash
# Configure NSG
az network nsg rule create \
  --resource-group event-hub-prod \
  --nsg-name event-hub-nsg \
  --name AllowHTTPS \
  --priority 100 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --destination-port-ranges 443
```

---

## 📚 Additional Resources

- **Integration Setup**: See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Architecture Details**: See this guide (System Architecture section)
- **API Examples**: See this guide (Complete API Reference section)
- **Deployment Scripts**: See `infra/` and `scripts/` directories

---

**Last Updated**: January 12, 2026  
**Version**: 2.0  
**Status**: Production Ready (Phase E)  
**Maintainers**: MSR Event Hub Team
