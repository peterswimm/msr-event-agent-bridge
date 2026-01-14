# Phase 3: Backend Data Layer Restructuring

**Status**: Implementation Guide  
**Target Timeline**: Weeks 3-4 of refactoring  
**Objective**: Establish pure CRUD data endpoints, move action execution from backend to Bridge, and document API simplification

## Overview

Phase 3 separates data operations from business logic by establishing a **data layer** in the backend that:

1. **Provides CRUD endpoints** (`/data/*`) for projects, events, sessions, and artifacts
2. **Removes action execution** from backend (move to Bridge)
3. **Maintains data consistency** through PostgreSQL as source-of-truth
4. **Enables Bridge to orchestrate** all business logic and workflows

## Architecture Pattern

```
┌──────────────────────────────┐
│   Frontend (Webchat)         │
└──────────────┬───────────────┘
               │ HTTP
               ↓
┌──────────────────────────────┐
│  Bridge (Business Logic)     │
│  - Route actions             │
│  - Query backend for data    │
│  - Execute workflows         │
│  - Call LLMs                 │
└──────────────┬───────────────┘
               │ HTTP
               ↓
┌──────────────────────────────┐
│ Backend Data Layer           │
│ - CRUD /data/* endpoints     │
│ - PostgreSQL queries         │
│ - Neo4j graph operations     │
│ - NO action execution        │
└──────────────────────────────┘
```

## 1. Data Endpoints (`/data/*`)

### 1.1 Projects Endpoints

#### List Projects
```http
GET /data/projects?eventId={eventId}&status={status}&$skip={n}&$top={n}
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "proj_001",
      "eventId": "evt_001",
      "title": "Knowledge Extraction from Research Papers",
      "abstract": "Automated extraction of claims and methods",
      "team": ["user1@microsoft.com", "user2@microsoft.com"],
      "status": "published",
      "tags": ["AI", "NLP"],
      "createdAt": "2025-01-10T10:00:00Z",
      "publishedAt": "2025-01-12T10:00:00Z",
      "artifactCount": 3
    }
  ],
  "total": 42,
  "skip": 0,
  "top": 20
}
```

**Query Parameters**:
- `eventId` (optional): Filter by event
- `status` (optional): "draft", "published", "archived"
- `tags` (optional): Comma-separated tags
- `$skip`, `$top`: Pagination

**Errors**:
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Cannot list projects from other events (unless admin)

#### Get Project by ID
```http
GET /data/projects/{projectId}
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "id": "proj_001",
  "eventId": "evt_001",
  "title": "Knowledge Extraction from Research Papers",
  "abstract": "Automated extraction of claims and methods",
  "description": "Full project description",
  "team": [
    {
      "email": "user1@microsoft.com",
      "name": "Alice Smith",
      "role": "lead"
    }
  ],
  "status": "published",
  "tags": ["AI", "NLP"],
  "artifacts": ["art_001", "art_002", "art_003"],
  "publishedSummary": {
    "whatIsNew": "First automated approach...",
    "keyMethods": [...],
    "evidenceAndExamples": [...],
    "nextSteps": [...],
    "keywords": [...],
    "faq": [...]
  },
  "createdAt": "2025-01-10T10:00:00Z",
  "updatedAt": "2025-01-11T15:30:00Z",
  "publishedAt": "2025-01-12T10:00:00Z"
}
```

**Errors**:
- `404 Not Found` - Project not found
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Cannot access project

#### Create Project
```http
POST /data/projects
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "eventId": "evt_001",
  "title": "New Project Title",
  "abstract": "Short abstract",
  "description": "Longer description",
  "team": ["user1@microsoft.com"],
  "tags": ["AI", "research"]
}
```

**Response** (201 Created):
```json
{
  "id": "proj_new_001",
  "eventId": "evt_001",
  "title": "New Project Title",
  "status": "draft",
  "createdAt": "2025-01-12T16:30:00Z"
}
```

**Errors**:
- `400 Bad Request` - Missing required fields (eventId, title, abstract)
- `403 Forbidden` - No permission to create in this event
- `404 Not Found` - Event not found

#### Update Project
```http
PATCH /data/projects/{projectId}
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body** (partial update):
```json
{
  "title": "Updated Title",
  "status": "published",
  "publishedSummary": {
    "whatIsNew": "This project introduces...",
    "keyMethods": ["Method 1", "Method 2"],
    "evidenceAndExamples": ["Example 1"],
    "nextSteps": ["Step 1"],
    "keywords": ["tag1", "tag2"],
    "faq": [
      {
        "question": "What is this?",
        "answer": "This is a project about..."
      }
    ]
  }
}
```

**Response** (200 OK):
```json
{
  "id": "proj_001",
  "eventId": "evt_001",
  "title": "Updated Title",
  "status": "published",
  "updatedAt": "2025-01-12T16:45:00Z"
}
```

**Errors**:
- `404 Not Found` - Project not found
- `403 Forbidden` - No permission to update
- `400 Bad Request` - Invalid update

#### Delete Project
```http
DELETE /data/projects/{projectId}
Authorization: Bearer {token}
```

**Response** (204 No Content)

**Errors**:
- `404 Not Found` - Project not found
- `403 Forbidden` - Cannot delete (insufficient role)
- `409 Conflict` - Cannot delete published project

### 1.2 Events Endpoints

#### List Events
```http
GET /data/events?status={status}&$skip={n}&$top={n}
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "evt_001",
      "displayName": "MSR Research Showcase",
      "description": "Annual research conference",
      "startDate": "2025-03-15",
      "endDate": "2025-03-16",
      "location": "Redmond, WA",
      "eventType": "conference",
      "status": "live",
      "timeZone": "America/Los_Angeles",
      "projectCount": 42,
      "sessionCount": 18,
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-12T15:30:00Z"
    }
  ],
  "total": 5,
  "skip": 0,
  "top": 20
}
```

**Query Parameters**:
- `status` (optional): "draft", "live", "archived"
- `$skip`, `$top`: Pagination

#### Get Event by ID
```http
GET /data/events/{eventId}
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "id": "evt_001",
  "displayName": "MSR Research Showcase",
  "description": "Annual research conference",
  "startDate": "2025-03-15",
  "endDate": "2025-03-16",
  "location": "Redmond, WA",
  "eventType": "conference",
  "status": "live",
  "timeZone": "America/Los_Angeles",
  "tags": ["research", "showcase"],
  "projectCount": 42,
  "sessionCount": 18,
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-12T15:30:00Z"
}
```

#### Create Event
```http
POST /data/events
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "displayName": "New Conference 2025",
  "description": "Conference description",
  "startDate": "2025-06-01",
  "endDate": "2025-06-02",
  "location": "Seattle, WA",
  "eventType": "conference",
  "timeZone": "America/Los_Angeles",
  "tags": ["AI", "research"]
}
```

**Response** (201 Created):
```json
{
  "id": "evt_new_001",
  "displayName": "New Conference 2025",
  "status": "draft",
  "createdAt": "2025-01-12T16:30:00Z"
}
```

**Errors**:
- `400 Bad Request` - Missing required fields
- `403 Forbidden` - Insufficient permissions

#### Update Event
```http
PATCH /data/events/{eventId}
Content-Type: application/json
Authorization: Bearer {token}
```

#### Delete Event
```http
DELETE /data/events/{eventId}
Authorization: Bearer {token}
```

### 1.3 Sessions Endpoints

#### List Sessions for Event
```http
GET /data/events/{eventId}/sessions
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "items": [
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
      "transcriptUrl": "https://..."
    }
  ],
  "total": 18,
  "skip": 0,
  "top": 20
}
```

#### Get Session
```http
GET /data/sessions/{sessionId}
Authorization: Bearer {token}
```

#### Create Session
```http
POST /data/events/{eventId}/sessions
Content-Type: application/json
Authorization: Bearer {token}
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
  "capacity": 50,
  "description": "Learn how to build AI agents from scratch"
}
```

#### Update Session
```http
PATCH /data/sessions/{sessionId}
Content-Type: application/json
Authorization: Bearer {token}
```

#### Delete Session
```http
DELETE /data/sessions/{sessionId}
Authorization: Bearer {token}
```

### 1.4 Knowledge Artifacts Endpoints

#### List Artifacts for Project
```http
GET /data/projects/{projectId}/artifacts
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "items": [
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
  ],
  "total": 3,
  "skip": 0,
  "top": 20
}
```

**Query Parameters**:
- `status` (optional): "draft", "approved", "rejected"
- `sourceType` (optional): "paper", "talk", "repository"

#### Get Artifact
```http
GET /data/artifacts/{artifactId}
Authorization: Bearer {token}
```

#### Create Artifact (Submit for Extraction)
```http
POST /data/projects/{projectId}/artifacts
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "sourceType": "paper",
  "title": "Paper Title",
  "sourceUrl": "https://arxiv.org/pdf/...",
  "description": "Optional description"
}
```

**Response** (202 Accepted):
```json
{
  "jobId": "job_abc123",
  "status": "queued",
  "artifactId": null,
  "estimatedCompletionTime": "2025-01-12T16:35:00Z"
}
```

#### Get Extraction Job Status
```http
GET /data/artifacts/extract/{jobId}
Authorization: Bearer {token}
```

**Response**:
```json
{
  "jobId": "job_abc123",
  "status": "completed",
  "artifactId": "art_004",
  "sourceType": "paper",
  "title": "Paper Title",
  "extractedAt": "2025-01-12T16:30:00Z",
  "extracted": {
    "claims": ["Claim 1", "Claim 2"],
    "methods": ["Method 1"],
    "limitations": ["Limitation 1"],
    "summary": "One-line summary"
  }
}
```

**Status Values**:
- `queued`: Waiting to be processed
- `extracting`: Currently extracting content
- `completed`: Extraction finished successfully
- `failed`: Extraction failed with error

#### Update Artifact
```http
PATCH /data/artifacts/{artifactId}
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body** (partial):
```json
{
  "status": "approved",
  "claims": ["Updated claim"],
  "methods": ["Updated method"]
}
```

#### Delete Artifact
```http
DELETE /data/artifacts/{artifactId}
Authorization: Bearer {token}
```

## 2. Migration Strategy

### Phase 3.1: Add Data Endpoints (Week 1)

**Tasks**:
1. In backend, create new FastAPI routers for `/data/*` endpoints
2. Implement CRUD for projects, events, sessions, artifacts
3. Add comprehensive error handling and validation
4. Write unit tests for all data endpoints
5. Document each endpoint in backend README

**File Structure**:
```python
msr-event-agent-chat/src/
├── api/
│   └── data/              # NEW: Pure data layer
│       ├── __init__.py
│       ├── projects.py    # Project CRUD
│       ├── events.py      # Event CRUD
│       ├── sessions.py    # Session CRUD
│       ├── artifacts.py   # Artifact CRUD
│       ├── schemas.py     # Pydantic models
│       └── dependencies.py
│   └── actions/           # EXISTING: Keep for now (deprecated)
│       ├── __init__.py
│       └── chat.py
│
├── core/
│   └── handlers.py        # Action handlers (will move logic here)
│
└── services/
    └── data/              # NEW: Data access layer
        ├── projects.py
        ├── events.py
        ├── sessions.py
        ├── artifacts.py
        └── neo4j.py       # Graph queries
```

**Example Implementation** (artifacts.py):
```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/data/artifacts", tags=["artifacts"])

class ArtifactSchema(BaseModel):
    id: str
    projectId: str
    sourceType: str  # "paper", "talk", "repository"
    title: str
    sourceUrl: str | None = None
    claims: List[str] = []
    methods: List[str] = []
    status: str  # "draft", "approved"
    extractedAt: str

@router.get("/{artifactId}")
async def get_artifact(artifactId: str, db=Depends(get_db)) -> ArtifactSchema:
    """Get a single artifact by ID."""
    artifact = await db.query(
        "SELECT * FROM knowledge_artifacts WHERE id = $1",
        artifactId
    )
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return ArtifactSchema(**artifact[0])

@router.post("/")
async def create_artifact(projectId: str, data: dict, db=Depends(get_db)) -> dict:
    """Create new artifact (submit for extraction)."""
    # Validate projectId exists
    project = await db.query(
        "SELECT id FROM projects WHERE id = $1",
        projectId
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Insert artifact
    artifact_id = f"art_{uuid.uuid4().hex[:8]}"
    await db.execute(
        """INSERT INTO knowledge_artifacts 
           (id, projectId, sourceType, title, status)
           VALUES ($1, $2, $3, $4, 'draft')""",
        artifact_id, projectId, data["sourceType"], data["title"]
    )
    
    # Queue extraction job
    job_id = queue_extraction(artifact_id, data["sourceUrl"])
    
    return {
        "jobId": job_id,
        "status": "queued",
        "artifactId": artifact_id
    }
```

### Phase 3.2: Move Business Logic to Bridge (Week 2)

**Tasks**:
1. Create action handlers in Bridge that call `/data/*` endpoints
2. Update action router to use new data endpoints
3. Remove backend action execution (keep extraction only)
4. Update Bridge to handle async workflows
5. Create integration tests for Bridge → Backend data flow

**Example Bridge Handler**:
```typescript
// msr-event-agent-bridge/src/routes/actions.ts

export async function handlePublishProject(req: Request, res: Response) {
  const { projectId } = req.body;
  
  // 1. Query current project state from backend
  const project = await backendClient.get(`/data/projects/${projectId}`);
  
  // 2. Check permissions
  if (!canPublish(req.user, project)) {
    return res.status(403).json({ error: "Cannot publish" });
  }
  
  // 3. Get related artifacts (need for publishing)
  const artifacts = await backendClient.get(
    `/data/projects/${projectId}/artifacts`
  );
  
  // 4. Validate project is ready (Bridge logic)
  const validation = validateProjectForPublishing(project, artifacts);
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  // 5. Update project status in backend
  const updated = await backendClient.patch(
    `/data/projects/${projectId}`,
    { status: "published", publishedAt: new Date() }
  );
  
  // 6. Return Adaptive Card response
  res.json({
    type: "AdaptiveCard",
    body: [
      { type: "TextBlock", text: `Project "${project.title}" published!` }
    ]
  });
}
```

### Phase 3.3: Update Frontend to Use Bridge (Week 2)

**Tasks**:
1. Verify Webchat component calls `/chat/action` on Bridge (not backend)
2. Update Bridge routes to properly handle project/artifact operations
3. Test end-to-end flow: Webchat → Bridge → Backend
4. Create integration test suite

**Example Webchat Action Call**:
```typescript
// msr-event-agent-chat/web/chat/src/components/App.tsx

const handleCardAction = async (action: CardAction) => {
  try {
    // Call Bridge (not backend)
    const response = await fetch(
      `${props.backendUrl}/chat/action`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action.actionType,
          data: action.data
        })
      }
    );
    
    const cardJson = await response.json();
    
    // Render returned Adaptive Card
    setMessages(prev => [...prev, {
      type: "card",
      content: cardJson
    }]);
  } catch (error) {
    console.error("Action failed:", error);
  }
};
```

### Phase 3.4: Documentation & Testing (Week 2)

**Tasks**:
1. Update API_REFERENCE.md with `/data/*` endpoint examples
2. Create BACKEND_MIGRATION.md guide for implementation
3. Write integration tests for all endpoints
4. Document query patterns for Bridge developers
5. Create examples of common operations (list, create, update, delete)

## 3. Query Consistency Patterns

### Pattern 1: Single Resource Fetch
```typescript
// Bridge fetches project, validates, updates
const project = await backendClient.get(`/data/projects/${projectId}`);
if (!canEdit(req.user, project)) throw new Error("Forbidden");

const updated = await backendClient.patch(
  `/data/projects/${projectId}`,
  { title: "New Title" }
);
```

### Pattern 2: Related Data Fetch
```typescript
// Fetch project + all artifacts in one operation
const project = await backendClient.get(`/data/projects/${projectId}`);
const artifacts = await backendClient.get(
  `/data/projects/${projectId}/artifacts`
);

// Process both sets of data
const isReadyToPublish = validateProjectWithArtifacts(project, artifacts);
```

### Pattern 3: List with Filtering
```typescript
// List all projects for an event
const response = await backendClient.get(
  `/data/projects?eventId=${eventId}&status=draft&$skip=0&$top=20`
);

const { items, total } = response;
```

### Pattern 4: Async Operations (Extraction)
```typescript
// Submit artifact for extraction
const { jobId } = await backendClient.post(
  `/data/projects/${projectId}/artifacts`,
  { sourceType: "paper", sourceUrl: "..." }
);

// Poll status until complete
const result = await pollUntilComplete(jobId, 30000); // 30s timeout
const { artifactId, extracted } = result;
```

## 4. Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_PROJECT_STATE",
    "message": "Project cannot be published without artifacts",
    "details": {
      "projectId": "proj_001",
      "status": "draft",
      "artifactCount": 0,
      "requiredArtifactCount": 1
    }
  }
}
```

### Bridge Error Handler
```typescript
async function handleError(error: any, res: Response) {
  if (error.status === 404) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Resource not found" }
    });
  }
  
  if (error.status === 403) {
    return res.status(403).json({
      error: { code: "FORBIDDEN", message: "Insufficient permissions" }
    });
  }
  
  // Log unexpected errors
  logger.error("Unhandled error:", error);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" }
  });
}
```

## 5. Implementation Checklist

- [ ] Create `/data/*` FastAPI routers in backend
- [ ] Implement projects CRUD endpoint
- [ ] Implement events CRUD endpoint
- [ ] Implement sessions CRUD endpoint
- [ ] Implement artifacts CRUD endpoint
- [ ] Add request/response validation (Pydantic)
- [ ] Create comprehensive error handling
- [ ] Write unit tests for each endpoint
- [ ] Create Bridge action handlers for common operations
- [ ] Update Webchat to call Bridge (not backend directly)
- [ ] Create integration tests (Webchat → Bridge → Backend)
- [ ] Update API documentation
- [ ] Create migration guide
- [ ] Perform end-to-end testing
- [ ] Team review and approval

## 6. Success Criteria

✅ All `/data/*` endpoints tested and documented  
✅ Bridge can list, create, update, delete projects/events/artifacts  
✅ Webchat actions route through Bridge to Backend  
✅ No direct Webchat → Backend calls (except /chat endpoint)  
✅ All operations maintain data consistency  
✅ Integration tests pass  
✅ No TypeScript or Python errors  

## 7. Next Steps

After Phase 3 completion, move to **Phase 4: Frontend Separation**
- Deploy Webchat to CDN independently
- Configure CORS for multi-origin support
- Update deployment pipelines
- Cost optimization review

---

**Related Files**:
- [API_REFERENCE.md](./API_REFERENCE.md) - Comprehensive API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
