# RBAC Permission Matrix

**Version**: 2.0  
**Last Updated**: January 12, 2026

This document defines all roles, permissions, and API access control for the MSR Event Hub platform.

---

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

---

## 👥 Role Definitions

| Role | Description | Example Users | Primary Responsibility |
|------|-------------|-------|-----|
| **Admin** | Full system access, can manage users, events, and all content | MSR Leadership, Platform Admins | System administration, user management |
| **Organizer** | Can create/manage events, sessions, and review projects | Event Chairs, Conference Organizers | Event planning and execution |
| **Presenter** | Can submit projects and manage their own submissions | Researchers, Team Leaders | Content submission and presentation |
| **Reviewer** | Can approve/reject knowledge artifacts and provide feedback | Senior Researchers, Editors | Quality control and feedback |
| **Moderator** | Can moderate discussions, manage comments, enforce community guidelines | Community Managers | Community management |
| **User** | Default role; can view events and participate in chat | All authenticated users | Viewing and learning |

---

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
| **View Unpublished Event** | ✗ | ✗ | ✗ | ✗ | ✓* | ✓ |
| **Publish Event** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |

*Organizer can only view events they created

### Sessions Management

| Operation | User | Presenter | Reviewer | Moderator | Organizer | Admin |
|-----------|:----:|:--------:|:--------:|:---------:|:---------:|:-----:|
| **View Sessions** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Create Session** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Edit Session** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Delete Session** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Add Speakers** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Moderate Discussion** | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Record Session** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |

### Projects & Submissions

| Operation | User | Presenter | Reviewer | Moderator | Organizer | Admin |
|-----------|:----:|:--------:|:--------:|:---------:|:---------:|:-----:|
| **View Projects** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Create Project** | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Edit Own Project** | ✗ | ✓* | ✗ | ✗ | ✗ | ✓ |
| **Edit Any Project** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Delete Own Project** | ✗ | ✓* | ✗ | ✗ | ✗ | ✓ |
| **Delete Any Project** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **View Drafts** | ✗ | ✓* | ✗ | ✗ | ✓ | ✓ |
| **Submit for Review** | ✗ | ✓* | ✗ | ✗ | ✓ | ✓ |
| **Publish Project** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Invite Team Member** | ✗ | ✓* | ✗ | ✗ | ✓ | ✓ |

*Only their own projects or projects where they are team member

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
| **Delete Artifact** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Search Artifacts** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

*Only for projects they own

### Workflows & Execution

| Operation | User | Presenter | Reviewer | Moderator | Organizer | Admin |
|-----------|:----:|:--------:|:--------:|:---------:|:---------:|:-----:|
| **View Workflow Status** | ✗ | ✓* | ✓ | ✗ | ✓ | ✓ |
| **Start Compilation** | ✗ | ✓* | ✗ | ✗ | ✓ | ✓ |
| **Cancel Execution** | ✗ | ✓* | ✗ | ✗ | ✓ | ✓ |
| **View Logs** | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Trigger Re-evaluation** | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |

*Only for own projects

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
| **View User Profiles** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Create User** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Assign Roles** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Remove Roles** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **View All Users** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Disable User** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

### Analytics & Reporting

| Operation | User | Presenter | Reviewer | Moderator | Organizer | Admin |
|-----------|:----:|:--------:|:--------:|:---------:|:---------:|:-----:|
| **View Dashboard** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **View Event Analytics** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **View Engagement Metrics** | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| **Export Reports** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **View System Logs** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Access Audit Trail** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 🔑 API Endpoints by Role

### Public Endpoints (No Auth Required)
- `GET /health` - Health check
- `GET /ready` - Readiness probe
- `POST /auth/token` - Authentication

### User Level (Requires Authentication)
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
POST   /v1/projects/{projectId}/compile        # Start compilation
```

### Reviewer Level (Includes User + Following)
```
GET    /v1/knowledge/{artifactId}           # View all artifacts
PATCH  /v1/knowledge/{artifactId}/status    # Approve/reject
POST   /v1/knowledge/{artifactId}/feedback  # Add feedback
GET    /v1/workflows/executions/{id}        # View execution logs
```

### Moderator Level (Includes User + Following)
```
DELETE /v1/chat/{messageId}           # Delete messages
POST   /v1/chat/{userId}/mute         # Mute user
GET    /v1/chat/logs                  # Access chat logs
```

### Organizer Level (Includes All Lower Roles)
```
POST   /v1/events                      # Create event
PATCH  /v1/events/{eventId}            # Edit event
POST   /v1/events/{eventId}/sessions   # Create session
PATCH  /v1/events/{eventId}/sessions/{id}  # Edit session
DELETE /v1/projects/{projectId}        # Delete any project
GET    /v1/analytics/events/{eventId}  # View analytics
```

### Admin Level (Full Access)
```
DELETE /v1/events/{eventId}                    # Delete event
POST   /v1/admin/users                         # Create user
PATCH  /v1/admin/users/{userId}/roles         # Assign role
GET    /v1/admin/audit/logs                   # Access audit logs
POST   /v1/admin/system/settings              # System configuration
GET    /v1/admin/storage/usage                # View storage metrics
```

---

## 🛡️ Authorization Checks

The gateway performs the following authorization flow:

1. **Token Validation** - Verify JWT signature and expiration
2. **Role Extraction** - Extract `roles` claim from token
3. **Endpoint Mapping** - Check if role is allowed for endpoint
4. **Resource Ownership** - For resources marked with `*`, verify user ownership
5. **Hierarchy Check** - Higher roles inherit lower role permissions

Example middleware flow:

```typescript
async function authorize(req: Request, res: Response, next: NextFunction) {
  // 1. Token already validated at this point
  const user = req.user; // { sub, email, roles }
  
  // 2. Get endpoint requirements
  const endpoint = req.path; // e.g., "/v1/projects"
  const requiredRoles = getRequiredRoles(endpoint, req.method);
  
  // 3. Check role hierarchy
  if (!hasPermission(user.roles, requiredRoles)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  
  // 4. For owned resources, check ownership
  if (endpoint.includes("{projectId}")) {
    const projectId = req.params.projectId;
    const project = await getProject(projectId);
    if (!isOwner(user.sub, project)) {
      return res.status(403).json({ error: "Cannot access this resource" });
    }
  }
  
  next();
}
```

---

## 🔄 Role Assignment Flow

```
User Creation (Admin)
    ↓
Default Role: "user"
    ↓
Admin assigns additional roles (e.g., "presenter", "reviewer")
    ↓
User JWT token updated with new roles
    ↓
Next API request uses updated permissions
```

### Assigning Roles

**Admin Only Endpoint:**
```http
POST /v1/admin/users/{userId}/roles
Content-Type: application/json

{
  "roles": ["user", "presenter", "reviewer"]
}
```

---

## ⏱️ Time-Based Access Control

Some operations have time restrictions:

| Operation | Restriction | Rationale |
|-----------|-------------|-----------|
| Project submission | Event start - 2 hours before | Prevent last-minute submissions |
| Knowledge extraction | During event period + 7 days | Allow post-event contributions |
| Compilation | After event ends | Compile finalized content |
| Publication | Organizer approval + 1 day | Allow review before publication |

---

## 🚨 Permission Denied Scenarios

The API returns `403 Forbidden` in these cases:

1. **Insufficient Role**
   ```json
   {
     "error": {
       "code": "InsufficientPermissions",
       "message": "This operation requires 'organizer' role"
     }
   }
   ```

2. **Resource Not Owned**
   ```json
   {
     "error": {
       "code": "NotOwner",
       "message": "You cannot modify projects you don't own"
     }
   }
   ```

3. **Status Mismatch** (e.g., trying to edit published project)
   ```json
   {
     "error": {
       "code": "InvalidState",
       "message": "Cannot edit a published project"
     }
   }
   ```

---

## 🔐 Scopes (OAuth 2.0)

For OAuth 2.0 integrations, the following scopes are available:

```
read:events              # View events
write:events             # Create/edit events
read:projects            # View projects
write:projects           # Create/edit projects
read:knowledge           # View artifacts
write:knowledge          # Add/edit artifacts
read:chat                # View chat history
write:chat               # Send messages
admin:users              # User management
admin:audit              # Access audit logs
```

**Example OAuth Token Request:**
```bash
curl -X POST https://auth.eventhub.internal.microsoft.com/oauth/token \
  -d "client_id=my-app&scope=read:events write:projects read:chat"
```

---

## 📋 Audit & Compliance

All permission checks are logged:

- **Who**: User ID, email
- **What**: Operation, resource ID
- **When**: Timestamp
- **Result**: Allowed/Denied, reason code
- **Where**: IP address, user agent

**View Audit Log** (Admin Only):
```http
GET /v1/admin/audit/logs?filter=action eq 'forbidden'&orderby=timestamp desc
```

---

## 🧪 Testing Permissions

### Test as Different Roles

```bash
# Create token for "user" role
USER_TOKEN=$(curl -X POST http://localhost:3000/auth/token \
  -d '{"email":"user@example.com","password":"password"}')

# Try to create event (should fail - requires organizer)
curl -H "Authorization: Bearer $USER_TOKEN" \
  -X POST http://localhost:3000/v1/events \
  -d '{"displayName":"Test"}' \
  # Result: 403 Forbidden

# Create token for "organizer" role
ORGANIZER_TOKEN=$(curl -X POST http://localhost:3000/auth/token \
  -d '{"email":"organizer@example.com","password":"password"}')

# Try to create event (should succeed)
curl -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -X POST http://localhost:3000/v1/events \
  -d '{"displayName":"Test"}' \
  # Result: 201 Created
```

---

## 🔄 Related Documentation

- [API Reference](API_REFERENCE.md) - Complete endpoint documentation
- [Architecture Guide](ARCHITECTURE.md) - System design and data flow
- [Deployment Guide](DEPLOYMENT.md) - Infrastructure and setup
- [Security Checklist](SECURITY.md) - Production hardening

---

**Last Updated**: January 12, 2026  
**Version**: 2.0  
**Status**: Production Ready
