# Bridge API Specification

**Version**: 1.0.0  
**Status**: Specification (Ready for Implementation)  
**Last Updated**: January 26, 2026  
**Baseline**: Ready for Phase 2 (Mar 3, 2026+)

## Overview

The Bridge API serves as the authoritative API gateway for event/session/project management. It provides RESTful endpoints that ShowcaseApp and Chat will consume.

**Base URL**: `http://localhost:3000/api/v1` (development)

## Architecture Principles

1. **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE)
2. **Pagination**: All list endpoints support `limit` and `offset`
3. **Filtering**: Query parameters for filtering and searching
4. **Versioning**: API versioned via URL path (`/api/v1`, `/api/v2`, etc.)
5. **Error Handling**: Consistent error response format
6. **Authentication**: Bearer token via Authorization header
7. **Rate Limiting**: 100 requests/minute per API key

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "timestamp": "2025-01-24T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Event not found",
    "details": null
  },
  "timestamp": "2025-01-24T10:30:00Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "timestamp": "2025-01-24T10:30:00Z"
}
```

## Events API

### GET /events
**Description**: List all events  
**Access**: Public  
**Query Parameters**:
- `limit` (number, default: 20)
- `offset` (number, default: 0)
- `status` (string, enum: `published|draft|archived`)

**Response**: `PaginatedApiResponse<Event[]>`

```bash
curl "http://localhost:3000/api/v1/events?limit=10&status=published"
```

### GET /events/{eventId}
**Description**: Get event details  
**Access**: Public  
**Path Parameters**:
- `eventId` (string, required)

**Response**: `ApiResponse<Event>`

```bash
curl "http://localhost:3000/api/v1/events/redmond-2025"
```

### POST /events
**Description**: Create new event  
**Access**: Authenticated (admin/curator role required)  
**Request Body**: `CreateEventInput`

**Response**: `ApiResponse<Event>`

```bash
curl -X POST "http://localhost:3000/api/v1/events" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Event Name","startDate":"2026-01-24T00:00:00Z",...}'
```

### PUT /events/{eventId}
**Description**: Update event  
**Access**: Authenticated (admin/curator role required)  
**Path Parameters**:
- `eventId` (string, required)

**Request Body**: `UpdateEventInput`  
**Response**: `ApiResponse<Event>`

### DELETE /events/{eventId}
**Description**: Delete event  
**Access**: Authenticated (admin role required)  
**Path Parameters**:
- `eventId` (string, required)

**Response**: `ApiResponse<{success: boolean}>`

## Sessions API

### GET /events/{eventId}/sessions
**Description**: List sessions for an event  
**Access**: Public  
**Path Parameters**:
- `eventId` (string, required)

**Query Parameters**:
- `limit` (number, default: 20)
- `offset` (number, default: 0)
- `track` (string, optional) - Filter by track name
- `sessionType` (string, optional) - Filter by session type (talk|workshop|panel|keynote|breakout)
- `speakerId` (string, optional) - Filter by speaker
- `sort` (string, default: `startTime`) - Sort field
- `order` (string, enum: `asc|desc`, default: `asc`)

**Response**: `PaginatedApiResponse<Session[]>`

```bash
curl "http://localhost:3000/api/v1/events/redmond-2025/sessions?track=AI%20Agents&limit=10"
```

### GET /events/{eventId}/sessions/{sessionId}
**Description**: Get session details  
**Access**: Public  
**Path Parameters**:
- `eventId` (string, required)
- `sessionId` (string, required)

**Response**: `ApiResponse<Session>`

```bash
curl "http://localhost:3000/api/v1/events/redmond-2025/sessions/RRS25-SESSION-001"
```

### POST /events/{eventId}/sessions
**Description**: Create new session  
**Access**: Authenticated (admin/curator role required)  
**Path Parameters**:
- `eventId` (string, required)

**Request Body**: `CreateSessionInput`  
**Response**: `ApiResponse<Session>`

### PUT /events/{eventId}/sessions/{sessionId}
**Description**: Update session  
**Access**: Authenticated (admin/curator role required)  
**Path Parameters**:
- `eventId` (string, required)
- `sessionId` (string, required)

**Request Body**: `UpdateSessionInput`  
**Response**: `ApiResponse<Session>`

### DELETE /events/{eventId}/sessions/{sessionId}
**Description**: Delete session  
**Access**: Authenticated (admin role required)  

**Response**: `ApiResponse<{success: boolean}>`

### POST /events/{eventId}/sessions/search
**Description**: Search sessions with full-text search and semantic search  
**Access**: Public  
**Path Parameters**:
- `eventId` (string, required)

**Request Body**:
```json
{
  "query": "AI keynote",
  "filters": {
    "track": "AI Agents",
    "sessionType": "keynote"
  },
  "limit": 20,
  "offset": 0,
  "semantic": false
}
```

**Response**: `PaginatedApiResponse<Session[]>`

```bash
curl -X POST "http://localhost:3000/api/v1/events/redmond-2025/sessions/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"AI","filters":{"track":"AI Agents"}}'
```

## Projects API

### GET /projects
**Description**: List all projects  
**Access**: Public  
**Query Parameters**:
- `limit` (number, default: 20)
- `offset` (number, default: 0)
- `theme` (string, optional)
- `tag` (string, optional)
- `search` (string, optional)
- `status` (string, enum: `active|archived|draft`)

**Response**: `PaginatedApiResponse<Project[]>`

### GET /projects/{projectId}
**Description**: Get project details  
**Access**: Public  

**Response**: `ApiResponse<Project>`

### POST /projects
**Description**: Create new project  
**Access**: Authenticated  

**Request Body**: `CreateProjectInput`  
**Response**: `ApiResponse<Project>`

### PUT /projects/{projectId}
**Description**: Update project  
**Access**: Authenticated  

**Request Body**: `UpdateProjectInput`  
**Response**: `ApiResponse<Project>`

### DELETE /projects/{projectId}
**Description**: Delete project  
**Access**: Authenticated (admin/curator role required)  

**Response**: `ApiResponse<{success: boolean}>`

## Users API

### GET /users/{userId}
**Description**: Get user profile  
**Access**: Public (limited data), Full data if authenticated as self/admin

**Response**: `ApiResponse<UserProfile>`

### PUT /users/{userId}
**Description**: Update user profile  
**Access**: Authenticated (self or admin)  

**Request Body**: `UpdateUserProfileInput`  
**Response**: `ApiResponse<UserProfile>`

### POST /users/{userId}/bookmarks
**Description**: Add session/project to bookmarks  
**Access**: Authenticated  

**Request Body**: `{resourceId: string, resourceType: 'session'|'project'}`  
**Response**: `ApiResponse<Bookmark>`

### DELETE /users/{userId}/bookmarks/{resourceId}
**Description**: Remove from bookmarks  
**Access**: Authenticated  

**Response**: `ApiResponse<{success: boolean}>`

### GET /users/{userId}/bookmarks
**Description**: Get user's bookmarks  
**Access**: Authenticated (self or admin)  

**Response**: `ApiResponse<UserBookmarks>`

## Chat Integration API

### POST /events/{eventId}/sessions/search (Chat Tool)
**Description**: Session search tool specifically for chat integration  
**Access**: Authenticated (chat service)  

**Request Body**:
```json
{
  "query": "Show me AI keynote sessions",
  "limit": 5,
  "semantic": true
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "RRS25-SESSION-001",
      "title": "AI Keynote: The Future of Research",
      "track": "AI Agents",
      "startTime": "2026-01-24T09:00:00Z",
      "speakers": ["Dr. Sarah Chen"],
      "summary": "High-level overview of AI research directions..."
    }
  ]
}
```

## Authentication

### Header Format
```
Authorization: Bearer {jwt_token}
```

### Token Claims
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "admin|curator|participant",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Bad request (validation error) |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

**Limits**: 100 requests/minute per API key

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Implementation Status

| Endpoint | Status | Notes |
|----------|--------|-------|
| GET /events | ⏳ Ready | Implement in Bridge Phase 2 |
| GET /events/{id} | ⏳ Ready | Implement in Bridge Phase 2 |
| POST /events | ⏳ Ready | Implement in Bridge Phase 2 |
| PUT /events/{id} | ⏳ Ready | Implement in Bridge Phase 2 |
| DELETE /events/{id} | ⏳ Ready | Implement in Bridge Phase 2 |
| GET /events/{id}/sessions | ⏳ Ready | Implement in Bridge Phase 2 |
| GET /events/{id}/sessions/{id} | ⏳ Ready | Implement in Bridge Phase 2 |
| POST /events/{id}/sessions | ⏳ Ready | Implement in Bridge Phase 2 |
| PUT /events/{id}/sessions/{id} | ⏳ Ready | Implement in Bridge Phase 2 |
| DELETE /events/{id}/sessions/{id} | ⏳ Ready | Implement in Bridge Phase 2 |
| POST /events/{id}/sessions/search | ⏳ Ready | Implement with semantic search |
| GET /projects | ✅ Exists | Already in ShowcaseApp |
| GET /projects/{id} | ✅ Exists | Already in ShowcaseApp |
| GET /users/{id} | ⏳ Ready | Plan in Bridge Phase 2 |

## TypeScript Integration

All responses use shared types from `@msr/types`:

```typescript
import type { Event, Session, ApiResponse, PaginatedApiResponse } from '@msr/types';

// Usage in Bridge implementation
app.get('/api/v1/events/:eventId', async (req, res) => {
  const event = await eventService.getEvent(req.params.eventId);
  const response: ApiResponse<Event> = {
    success: true,
    data: event,
    timestamp: new Date().toISOString()
  };
  res.json(response);
});
```

## Migration Timeline

- **Phase 2 (Mar 3 - Apr 15)**: Implement all events/sessions endpoints
- **Phase 3 (Apr 15 - Jun 15)**: Implement users/bookmarks endpoints, chat integration
- **Phase 4 (Jun 15+)**: Full Bridge API as source of truth

## Testing

### Local Testing with cURL
```bash
# Get events
curl "http://localhost:3000/api/v1/events"

# Get sessions for event
curl "http://localhost:3000/api/v1/events/redmond-2025/sessions"

# Search sessions
curl -X POST "http://localhost:3000/api/v1/events/redmond-2025/sessions/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"AI"}'
```

### Integration Testing
See [BRIDGE_TESTING.md](./BRIDGE_TESTING.md) for full test suite and Postman collection.
