# Three-Repo Transition Strategy: ShowcaseApp → Bridge + Chat

**Timeline**: January 24, 2026 - June 15, 2026+  
**Status**: Master plan for synchronized rollout  
**Coordination**: Across ShowcaseApp, Bridge API, Chat (FastAPI)

## Executive Summary

This document details how ShowcaseApp (temporary MVP) will transition to Bridge API (authoritative gateway) and Chat (AI discovery UI) over a 6-month period. The strategy ensures:

1. **No service disruption** during transitions
2. **Parallel operation** of old and new systems
3. **Gradual feature migration** instead of big-bang cutover
4. **Rollback capability** at each phase boundary
5. **Clear ownership** of features in each phase

## Phase Overview

| Phase | Timeline | ShowcaseApp | Bridge | Chat | Key Transition |
|-------|----------|-------------|--------|------|-----------------|
| **Phase 1: MVP** | Jan 24 - Feb 28 | Live (JSON seed) | Planning | Planning | ShowcaseApp as sole MVP |
| **Phase 2: Integration** | Mar 3 - Apr 15 | Live (Bridge API) | Live (Cosmos) | Live (Bridge integration) | Bridge becomes authoritative |
| **Phase 3: Multi-Event** | Apr 15 - Jun 15 | Read-only curator | Full API | Primary discovery | Chat becomes primary UI |
| **Phase 4: Deprecation** | Jun 15+ | Deprecated | Authority | Authority | ShowcaseApp sunset |

## Phase 1: MVP (Jan 24 - Feb 28)

**Objective**: Deliver Redmond MVP with seed data, no external dependencies.

### ShowcaseApp
- ✅ **Live**: Event info page (`/about`)
- ✅ **Live**: Sessions list (`/sessions`) with filters
- ✅ **Live**: Session detail pages (`/sessions/{id}`)
- ✅ **Live**: Existing projects showcase
- 📦 **Data**: JSON seed files (`data/redmond-*.json`)
- 🔄 **Feature Flags**: All Phase 1 flags enabled
- 🎯 **Users**: Event organizers, speakers, researchers

### Bridge API
- 📋 **Status**: Design & planning phase
- 📝 **Deliverable**: [BRIDGE_API_SPECIFICATION.md](./BRIDGE_API_SPECIFICATION.md)
- 🔧 **Setup**: Repository structure, dependencies, CI/CD pipeline
- 🗂️ **Schema**: Event, Session, Speaker Cosmos containers designed
- ⏳ **Timeline**: Complete by Feb 28

### Chat
- 📋 **Status**: Ready to accept bridge API contracts
- 📝 **Design**: Chat doesn't need session search yet
- ⏳ **Start date**: Mar 3

### Deliverables
- ShowcaseApp with complete event infrastructure
- Seed data JSON files (source of truth)
- API contract specification (Bridge blueprint)
- Feature flag strategy documented
- @msr/types package designed

### Risk Mitigation
- **Seed data validation**: Verify JSON against TypeScript types
- **Mobile testing**: Ensure responsive layouts work
- **Accessibility**: WCAG compliance for event pages
- **Performance**: Local data = fast, but test lazy loading

## Phase 2: Integration (Mar 3 - Apr 15)

**Objective**: Bridge API goes live, apps integrate with it, Cosmos DB becomes authoritative.

### Weeks 1-2 (Mar 3-14): Bridge API Foundation

**Bridge API**:
```
✅ GET /api/v1/events/{eventId}
✅ GET /api/v1/events/{eventId}/sessions
✅ GET /api/v1/events/{eventId}/sessions/{sessionId}
✅ POST /api/v1/events/{eventId}/sessions/search
🔄 POST /events (create) - optional
🔄 PUT /events/{id} (update) - optional
```

- Authentication: Bearer token via Azure AD
- Data source: Initially reads from JSON seed files via `USE_SEED_DATA=true`
- Rate limiting: 100 req/min per API key
- Testing: Postman collection, cURL examples

**ShowcaseApp**:
- Update `cosmos-service.ts` to call Bridge API instead of seed JSON
- Configure `VITE_USE_SEED_DATA=false` in staging env
- Test all routes against Bridge
- Fallback logic: If Bridge down, show cached data

**Chat**:
- No action yet (Bridge integration starts next)

**Testing**:
```bash
# Verify Bridge endpoints
curl "http://localhost:3000/api/v1/events/redmond-2025"
curl "http://localhost:3000/api/v1/events/redmond-2025/sessions"

# Verify ShowcaseApp uses Bridge
npm run dev -- VITE_USE_SEED_DATA=false
# Navigate to /sessions and verify data loads
```

### Weeks 3-4 (Mar 15-28): Cosmos DB Population

**Bridge API**:
- Keep `USE_SEED_DATA=true` (hybrid mode)
- Run [import-seed-data.ts](./scripts/import-seed-data.ts) script:
  ```bash
  npm run import-seed-data -- --dry-run  # Preview
  npm run import-seed-data              # Execute
  ```
- Verify Cosmos containers have event/session/speaker data
- Load testing: 1000 req/min against Cosmos

**ShowcaseApp**:
- Still calls Bridge API (doesn't care about data source)
- No changes needed

**Chat**:
- Design session search tool
- Prototype Bridge integration:
  ```python
  def search_sessions(query: str, event_id: str):
      response = requests.post(
          f"http://bridge:3000/api/v1/events/{event_id}/sessions/search",
          json={"query": query, "limit": 5}
      )
      return response.json()['data']
  ```

**Testing**:
```bash
# Verify seed data in Cosmos
# Query in Azure Portal: SELECT * FROM c WHERE c.docType = 'Session'

# Verify Bridge uses Cosmos
SET USE_SEED_DATA=false npm start

# Load test
ab -n 1000 -c 10 http://localhost:3000/api/v1/events/redmond-2025/sessions
```

### Weeks 5-7 (Mar 29 - Apr 14): Chat Integration

**Chat**:
- ✅ Integrate session search tool
- ✅ Wire up to Bridge API
- ✅ Test "show me sessions about X" → calls search tool
- ✅ Format results for chat display
- ✅ Enable `FEATURE_CHAT_ROUTING=true`

**ShowcaseApp**:
- Optional: Show "Ask in Chat" CTA on session cards
- Or keep unchanged (bridge API is enough)

**Bridge API**:
- Finalize semantic search (if using embeddings)
- Set `USE_SEED_DATA=false` (switch to Cosmos entirely)

**Testing**:
```python
# Test Chat
user: "Show me AI sessions at Redmond 2025"
chat: calls search_sessions("AI", "redmond-2025")
# → returns sessions with AI in title/description
```

### Deployment Checklist (Phase 2 End)
- [ ] Bridge API v1.0 deployed to production
- [ ] Cosmos DB fully populated with event/session/speaker data
- [ ] ShowcaseApp configured to use Bridge API (VITE_USE_SEED_DATA=false)
- [ ] Chat integration tested end-to-end
- [ ] Feature flag `FEATURE_CHAT_ROUTING=true` enabled in Chat
- [ ] Monitoring: Application Insights setup for all three repos
- [ ] Rollback: Can revert to Phase 1 (seed data) within 1 hour
- [ ] Documentation updated with Bridge API usage

## Phase 3: Multi-Event & Advanced Features (Apr 15 - Jun 15)

**Objective**: Extend to multiple events, advanced search, semantic retrieval.

### Weeks 1-3 (Apr 15 - May 5): Multi-Event Support

**Bridge API**:
```
✅ GET /api/v1/events (list all events)
✅ GET /api/v1/events (paginated, filtered)
✅ Support eventId as parameter (parameterized, not hardcoded)
```

**ShowcaseApp**:
- Change `VITE_EVENT_ID=redmond-2025` to dynamic routing
- Home page shows list of upcoming events
- `/events/{eventId}` routes to event-specific pages
- Session filters now at event level

**Chat**:
- Support multi-event queries:
  - "Show me sessions at all MSR events"
  - "Find AI sessions in 2025"
- Track context: which event user is asking about

**Testing**:
```bash
# Add 2nd event to Cosmos
import-seed-data --event-id=seattle-2026

# Verify Bridge lists both
curl "http://localhost:3000/api/v1/events"
# → returns {data: [{id: redmond-2025}, {id: seattle-2026}]}

# Verify ShowcaseApp shows both
http://localhost:5173/events
```

### Weeks 4-6 (May 6 - May 26): Advanced Search & Semantic Search

**Bridge API**:
```
✅ POST /api/v1/events/{id}/sessions/search (enhanced)
✅ Support semantic search if USE_SEMANTIC_SEARCH=true
✅ Filter by track, speaker, date range
✅ Sort by relevance, date, popularity
```

**Chat**:
- Semantic search via embeddings:
  - "Sessions about generative AI" → semantic match
  - "Speaker: Sarah Chen" → exact speaker match
  - Combine keyword + semantic in hybrid search

**ShowcaseApp**:
- Optional: Add `/search` page for advanced search
- Or keep simple filters on `/events/{id}/sessions`
- Feature flag: `VITE_FEATURE_SESSION_SEARCH` controls visibility

**Testing**:
```bash
# Semantic search
curl -X POST "http://localhost:3000/api/v1/events/redmond-2025/sessions/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning challenges",
    "semantic": true,
    "limit": 5
  }'
```

### Weeks 7-9 (May 27 - Jun 15): ShowcaseApp Read-Only Transition

**ShowcaseApp**:
- Disable event creation/editing (if it existed)
- Become read-only curator UI
- Focus on:
  - Event information display
  - Session browsing and discovery
  - User bookmarks
  - Project showcase (unchanged)
- Chat as primary interaction:
  - "Ask about sessions" → redirects to Chat
  - "Find speakers" → Chat discovery

**Bridge API**:
- Full CRUD for events/sessions (for Chat/Chat inputs)
- Fully authoritative (single source of truth)
- Stable API for external integrations

**Chat**:
- Primary discovery interface
- Can create/edit sessions (if permissions allow)
- Session analytics and recommendations

**Testing**:
```bash
# Verify ShowcaseApp is read-only
POST /api/v1/events/{id}/sessions → 405 Method Not Allowed

# Verify Chat can create
POST /api/v1/events/{id}/sessions
  Authorization: Bearer {chat-token}
  Body: {title, description, ...}
  → 201 Created
```

### Deployment Checklist (Phase 3 End)
- [ ] Multi-event support working across all repos
- [ ] Semantic search implemented and tested
- [ ] ShowcaseApp feature flags for read-only mode
- [ ] Chat as primary discovery interface
- [ ] Performance: <100ms p99 latency for session queries
- [ ] Analytics: Track feature usage across repos
- [ ] Documentation: Updated with multi-event examples

## Phase 4: ShowcaseApp Deprecation (Jun 15+)

**Objective**: Retire ShowcaseApp, consolidate on Bridge + Chat.

### ShowcaseApp
- 🛑 **Status**: Deprecated
- 🪦 **Archive**: Move repo to read-only archive
- 📚 **Documentation**: Migration guide for any direct users
- 🗑️ **Cleanup**: Remove from CI/CD, monitoring alerts

### Bridge API
- ✅ **Status**: Primary data authority
- 📈 **Features**: Full event management API
- 🔐 **Access**: Role-based (admin, curator, viewer)

### Chat
- ✅ **Status**: Primary user interface
- 🤖 **Features**: AI-powered session discovery
- 📊 **Features**: Recommendations, attendance tracking

### Migration Checklist
- [ ] All ShowcaseApp users notified of deprecation (3-month notice)
- [ ] Data exports provided for any integrations
- [ ] Bridge API docs finalized
- [ ] Chat UI polished and performant
- [ ] Monitoring transitioned to Bridge + Chat
- [ ] Support procedures updated

## Data Flow Diagrams

### Phase 1: Seed Data Only
```
JSON files (git)
    ↓
ShowcaseApp (memory)
    ↓
User (browser)
```

### Phase 2: Bridge as Intermediary
```
JSON files (git)
    ↓
Cosmos DB (Azure)
    ↓
Bridge API (port 3000)
    ↙ ↘
ShowcaseApp  Chat
    ↓ ↓
User (browser/chat)
```

### Phase 3: Bridge Authoritative
```
Cosmos DB (Azure)
    ↓
Bridge API (port 3000)
    ├─ ShowcaseApp (read-only)
    ├─ Chat (read/write)
    └─ External APIs
    ↓
User (browser/chat)
```

## Environment Variable Changes

### ShowcaseApp Progression
```env
# Phase 1
VITE_FEATURE_EVENTS=true
VITE_FEATURE_SESSIONS=true
VITE_USE_SEED_DATA=true
VITE_FEATURE_CHAT_ROUTING=false
VITE_FEATURE_LIVE_COSMOS=false

# Phase 2
VITE_FEATURE_EVENTS=true
VITE_FEATURE_SESSIONS=true
VITE_USE_SEED_DATA=false
VITE_FEATURE_CHAT_ROUTING=true
VITE_FEATURE_LIVE_COSMOS=false

# Phase 3
VITE_FEATURE_EVENTS=true
VITE_FEATURE_SESSIONS=true
VITE_USE_SEED_DATA=false
VITE_FEATURE_CHAT_ROUTING=true
VITE_FEATURE_SESSION_SEARCH=true
VITE_FEATURE_LIVE_COSMOS=false

# Phase 4: Deprecated (not run)
```

## Rollback Procedures

### Phase 2 Rollback (If Bridge fails)
```bash
# Revert to Phase 1
VITE_USE_SEED_DATA=true npm start

# ShowcaseApp still works from JSON seed data
# Users see slightly stale data but no downtime
```

### Phase 3 Rollback (If semantic search fails)
```bash
# Keep keyword search only
USE_SEMANTIC_SEARCH=false npm start

# Revert feature flag
FEATURE_SESSION_SEARCH=false
```

## Monitoring & Alerts

### Critical Metrics by Phase

**Phase 1**:
- JSON seed files size (should be <1MB)
- ShowcaseApp page load time (<2s)
- 404 errors on routes

**Phase 2**:
- Bridge API latency (p99 <100ms)
- Cosmos DB request units consumed
- Bridge uptime (target: 99.9%)
- ShowcaseApp → Bridge API call success rate

**Phase 3**:
- Multi-event query performance
- Semantic search latency
- Chat integration success rate
- ShowcaseApp traffic (should be declining)

**Phase 4**:
- Bridge API SLA (99.99%)
- Chat uptime and latency
- Zero ShowcaseApp traffic (if deprecated)

## Communication Plan

### Week Before Each Phase
- Email all users about upcoming changes
- Document new features/changes
- Provide FAQ and troubleshooting

### Day of Phase Transition
- Monitor all systems closely
- Have on-call team available
- Post status updates in Slack/Teams

### Week After
- Gather feedback
- Monitor error rates
- Verify no data loss or corruption

## Success Criteria per Phase

### Phase 1 ✅
- Redmond MVP fully functional
- Seed data verified against types
- All routes working with JSON data
- Documentation complete

### Phase 2 ✅
- Bridge API passes integration tests
- ShowcaseApp calls Bridge API without issues
- Chat session search working
- Zero data loss during migration
- <1 hour downtime tolerance

### Phase 3 ✅
- Multi-event support working
- Semantic search latency <500ms
- ShowcaseApp traffic reduced 50%+
- Chat as primary discovery

### Phase 4 ✅
- Zero ShowcaseApp traffic
- Bridge + Chat fully operational
- Migration complete with archive

## Key Dependencies

| Dependency | Required For | Owner | Status |
|-----------|--------------|-------|--------|
| @msr/types package | All repos | Shared | 📋 Designed |
| Cosmos DB containers | Bridge, Chat | Bridge team | ⏳ Phase 2 |
| Azure AD B2C | Authentication | Security | ⏳ Phase 2 |
| Azure OpenAI (optional) | Semantic search | Chat team | ⏳ Phase 3 |
| Application Insights | Monitoring | DevOps | ⏳ Phase 2 |

## FAQ

**Q: Can I skip Phase 2 and go straight to Phase 4?**  
A: No - Bridge API must be stable before deprecating ShowcaseApp.

**Q: What if we need to add a 4th event mid-Phase 2?**  
A: Add to Cosmos via import script, update Bridge, automatic in ShowcaseApp/Chat.

**Q: Do users need to change anything?**  
A: Phase 1-2: No. Phase 3: Chat recommended. Phase 4: Use Chat only.

**Q: Can ShowcaseApp and Chat coexist permanently?**  
A: Not recommended - dual UIs create maintenance burden. Chat is primary.

**Q: What happens to ShowcaseApp data?**  
A: Archived in git. User data stored in Bridge API (Cosmos DB).

**Q: How do we handle backward compatibility?**  
A: Bridge API versioning (`/api/v1`, `/api/v2`) allows gradual migration.

## Related Documents

- [BRIDGE_API_SPECIFICATION.md](./BRIDGE_API_SPECIFICATION.md) - Full API spec
- [FEATURE_FLAG_ALIGNMENT.md](./FEATURE_FLAG_ALIGNMENT.md) - Flag strategy
- [REDMOND_MVP_IMPLEMENTATION.md](./ShowcaseApp/REDMOND_MVP_IMPLEMENTATION.md) - Current state
- [@msr/types Design](./msr-shared-types/) - Shared type definitions

---

**Last Updated**: January 2025  
**Next Review**: Mid-Phase 2 (Mar 31, 2025)  
**Questions?** Contact architecture team
