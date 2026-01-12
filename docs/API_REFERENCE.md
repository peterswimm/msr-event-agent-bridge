# MSR Event Hub - Complete API Reference

**Version**: 2.0  
**Last Updated**: January 12, 2026  
**Base URL**: `https://api.eventhub.microsoft.com` (Production) or `http://localhost:3000` (Local)

All endpoints require authentication via JWT bearer token except `/health` and `/ready`.

---

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

---

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

---

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

---

### Get Event

```http
GET /v1/events/{eventId}
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | string | Event ID (e.g., `evt_001`) |

**Example Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/events/evt_001
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

**Errors**:
- `404 Not Found` - Event does not exist
- `401 Unauthorized` - Invalid token

---

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

**Errors**:
- `404 Not Found` - Event does not exist
- `403 Forbidden` - Cannot update, insufficient permissions
- `409 Conflict` - Update conflict

---

### Delete Event

```http
DELETE /v1/events/{eventId}
```

**Required Role**: `admin`

**Response** (204 No Content)

**Errors**:
- `404 Not Found` - Event does not exist
- `403 Forbidden` - Insufficient permissions
- `409 Conflict` - Event cannot be deleted (has projects)

---

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

---

## 🎯 Projects & Posters

### List Projects

```http
GET /v1/events/{eventId}/projects
```

**Query Parameters** (same as events):
- `$skip`, `$top`, `$filter`, `$orderBy`

**Example Response**:
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

---

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
    },
    {
      "id": "art_002",
      "projectId": "proj_001",
      "sourceType": "talk",
      "title": "Keynote: The Future of AI",
      "extractedText": "...",
      "keyFindings": [...],
      "status": "approved"
    },
    {
      "id": "art_003",
      "projectId": "proj_001",
      "sourceType": "repository",
      "title": "transformers GitHub Repository",
      "sourceUrl": "https://github.com/huggingface/transformers",
      "technologyStack": ["Python", "PyTorch", "HuggingFace"],
      "status": "draft"
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
  "estimatedCompletionTime": "2025-01-12T16:35:00Z"
}
```

### Get Extraction Status

```http
GET /v1/knowledge/extract/{jobId}
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
    "claims": [...],
    "methods": [...],
    "limitations": [...]
  }
}
```

**Status Values**: `queued` → `extracting` → `completed` or `failed`

### Get Single Artifact

```http
GET /v1/knowledge/{artifactId}
```

### Search Knowledge

```http
POST /v1/knowledge/search
Content-Type: application/json
```

**Request Body**:
```json
{
  "query": "machine learning",
  "filters": {
    "sourceType": "paper",
    "eventId": "evt_001"
  },
  "$top": 20
}
```

**Response**:
```json
{
  "@odata.count": 15,
  "value": [
    {
      "id": "art_001",
      "title": "...",
      "excerpt": "...excerpt with 'machine learning' highlighted...",
      "relevanceScore": 0.95
    }
  ]
}
```

---

## 💬 Chat

### Stream Chat Response

```http
POST /v1/chat
Content-Type: application/json
```

**Request Body**:
```json
{
  "message": "What are the latest breakthroughs in knowledge extraction?",
  "userId": "user@microsoft.com",
  "eventId": "evt_001",
  "context": {
    "conversationId": "conv_001",
    "previousMessages": []
  }
}
```

**Response** (200 OK - Streaming):
```
event: message
data: {"delta":"The latest breakthroughs in knowledge extraction"}

event: message
data: {"delta":" include multi-modal approaches that combine"}

event: citation
data: {"source":"art_001","title":"Paper Title"}

event: done
```

**Errors**:
- `400 Bad Request` - Invalid message
- `429 Too Many Requests` - Rate limit exceeded
- `503 Service Unavailable` - LLM unavailable

---

## 🔧 Workflows

### Start Project Compilation

```http
POST /v1/projects/{projectId}/compile
```

**Response** (202 Accepted):
```json
{
  "executionId": "exec_abc123",
  "projectId": "proj_001",
  "status": "pending",
  "startedAt": "2025-01-12T16:40:00Z"
}
```

### Get Compilation Status

```http
GET /v1/workflows/executions/{executionId}
```

**Response**:
```json
{
  "executionId": "exec_abc123",
  "projectId": "proj_001",
  "status": "evaluating",
  "progress": {
    "completed": 2,
    "total": 3,
    "percentComplete": 67
  },
  "currentArtifact": "art_003",
  "iterations": [
    {
      "iteration": 1,
      "score": 3.2,
      "feedback": "Missing limitation analysis"
    }
  ],
  "startedAt": "2025-01-12T16:40:00Z",
  "estimatedCompletionTime": "2025-01-12T17:00:00Z"
}
```

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "InvalidRequest",
    "message": "The request is invalid",
    "details": [
      {
        "code": "MissingRequiredField",
        "message": "Field 'displayName' is required"
      }
    ],
    "correlationId": "abc-123-def"
  }
}
```

**Common Error Codes**:
| Code | HTTP | Description |
|------|------|-------------|
| `InvalidRequest` | 400 | Malformed request |
| `Unauthorized` | 401 | Missing/invalid token |
| `Forbidden` | 403 | Insufficient permissions |
| `NotFound` | 404 | Resource not found |
| `Conflict` | 409 | Resource conflict (duplicate, etc.) |
| `RateLimitExceeded` | 429 | Too many requests |
| `InternalError` | 500 | Server error |
| `ServiceUnavailable` | 503 | Service down |

---

## 🔍 Filtering & Searching

### OData Filter Examples

```
# Get events that are currently live
/v1/events?$filter=status eq 'live'

# Get projects from specific event
/v1/projects?$filter=eventId eq 'evt_001' and status eq 'published'

# Get projects with multiple tags
/v1/projects?$filter=contains(tags,'AI') and contains(tags,'NLP')

# Get recent projects (last 7 days)
/v1/projects?$filter=publishedAt gt 2025-01-05T00:00:00Z
```

### Ordering

```
# Order by date descending
/v1/events?$orderBy=startDate desc

# Order by creation ascending
/v1/projects?$orderBy=createdAt asc
```

---

## 📊 Pagination

Use `$skip` and `$top` for pagination:

```bash
# Get first page (20 results)
/v1/events?$top=20&$skip=0

# Get second page (20 results)
/v1/events?$top=20&$skip=20

# Maximum $top value is 100
```

The response includes `@odata.count` for total count and `@odata.nextLink` for next page:

```json
{
  "@odata.count": 250,
  "@odata.nextLink": "http://localhost:3000/v1/events?$top=20&$skip=20",
  "value": [...]
}
```

---

## 🧪 Testing with cURL

```bash
# Set token as variable
TOKEN="your-jwt-token"

# List all events
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/events

# Create event
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Test Event","startDate":"2025-06-01"}' \
  http://localhost:3000/v1/events

# Search knowledge
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"machine learning"}' \
  http://localhost:3000/v1/knowledge/search
```

---

## 📖 SDK Examples

### Python
```python
import httpx

headers = {"Authorization": f"Bearer {token}"}
client = httpx.AsyncClient(base_url="http://localhost:3000")

# List events
events = await client.get("/v1/events", headers=headers)
print(events.json())

# Create project
project = await client.post(
    "/v1/events/evt_001/projects",
    headers=headers,
    json={"title": "New Project", "abstract": "..."}
)
print(project.json())
```

### TypeScript/Node.js
```typescript
import fetch from 'node-fetch';

const token = "your-jwt-token";
const headers = { "Authorization": `Bearer ${token}` };

// Get project
const response = await fetch(
  "http://localhost:3000/v1/projects/proj_001",
  { headers }
);
const project = await response.json();
console.log(project);
```

### JavaScript (Browser)
```javascript
const token = localStorage.getItem("token");
const headers = { "Authorization": `Bearer ${token}` };

// Stream chat
const response = await fetch(
  "http://localhost:3000/v1/chat",
  {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ message: "What are the latest papers?" })
  }
);

// Handle streaming response
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(new TextDecoder().decode(value));
}
```

---

**Last Updated**: January 12, 2026  
**API Version**: 2.0  
**Status**: Production Ready
