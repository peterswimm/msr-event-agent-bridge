# Feature Flag Alignment Strategy

**Version**: 1.0.0  
**Scope**: ShowcaseApp, Bridge API, Chat  
**Baseline Date**: January 26, 2026  
**Target Implementation**: Effective immediately for ShowcaseApp, Bridge/Chat in Phase 2

## Overview

This document defines how feature flags are coordinated across all three repositories to enable/disable features consistently. Flags control:
- API feature availability (Bridge)
- Frontend UI visibility (ShowcaseApp)
- Chat tool activation (Chat)
- Data source selection (JSON seed vs. Cosmos DB)

## Flag Categories

### Phase 1: MVP (Jan 24 - Feb 28)
Basic event/session functionality with seed data.

### Phase 2: Integration (Mar 3 - Apr 15)
Bridge API live, full Cosmos DB support, chat integration.

### Phase 3: Multi-Event (Apr 15 - Jun 15)
Cross-event support, advanced features.

### Phase 4: Deprecation (Jun 15+)
ShowcaseApp deprecated, Bridge + Chat only.

## Core Flags

### `FEATURE_EVENTS`
**Type**: Feature toggle  
**Purpose**: Enable/disable event pages and APIs  
**Default**: `true` (Phase 1+)  
**Repos**: ShowcaseApp, Bridge, Chat

**ShowcaseApp** (`VITE_FEATURE_EVENTS`):
```env
# Phase 1
VITE_FEATURE_EVENTS=true

# Disables /about route and event APIs
VITE_FEATURE_EVENTS=false
```

**Bridge** (`FEATURE_EVENTS`):
```env
# Phase 2+
FEATURE_EVENTS=true

# Disables GET /api/v1/events/* endpoints
FEATURE_EVENTS=false
```

**Chat** (`FEATURE_EVENTS`):
```env
# Phase 2+
FEATURE_EVENTS=true

# Disables event context in chat queries
FEATURE_EVENTS=false
```

### `FEATURE_SESSIONS`
**Type**: Feature toggle  
**Purpose**: Enable/disable session browsing and discovery  
**Default**: `true` (Phase 1+)  
**Repos**: ShowcaseApp, Bridge, Chat

**ShowcaseApp** (`VITE_FEATURE_SESSIONS`):
```env
# Phase 1
VITE_FEATURE_SESSIONS=true

# Disables /sessions routes
VITE_FEATURE_SESSIONS=false
```

**Bridge** (`FEATURE_SESSIONS`):
```env
# Phase 2+
FEATURE_SESSIONS=true

# Disables GET /api/v1/events/{id}/sessions endpoints
FEATURE_SESSIONS=false
```

**Chat** (`FEATURE_SESSIONS`):
```env
# Phase 2+
FEATURE_SESSIONS=true

# Disables session search tools
FEATURE_SESSIONS=false
```

### `USE_SEED_DATA`
**Type**: Data source selector  
**Purpose**: Choose between JSON seed data (dev) or live Cosmos DB (prod)  
**Default**: `true` (Phase 1), `false` (Phase 2+)  
**Repos**: ShowcaseApp, Bridge, Chat

**ShowcaseApp** (`VITE_USE_SEED_DATA`):
```env
# Phase 1: Use JSON files from data/
VITE_USE_SEED_DATA=true

# Phase 2+: Use Bridge API or direct Cosmos
VITE_USE_SEED_DATA=false
```

**Bridge** (`USE_SEED_DATA`):
```env
# Phase 2 Early: Use seed data while populating Cosmos
USE_SEED_DATA=true

# Phase 2 Late: Use Cosmos DB directly
USE_SEED_DATA=false
```

**Chat** (`USE_SEED_DATA`):
```env
# Phase 2 Early: Use seed data fallback
USE_SEED_DATA=true

# Phase 2 Late: Use Bridge API
USE_SEED_DATA=false
```

### `FEATURE_CHAT_ROUTING`
**Type**: Feature toggle  
**Purpose**: Enable session search in chat  
**Default**: `false` (Phase 1), `true` (Phase 2+)  
**Repos**: Chat, ShowcaseApp

**Chat** (`FEATURE_CHAT_ROUTING`):
```env
# Phase 1: Disabled
FEATURE_CHAT_ROUTING=false

# Phase 2+: Enabled - routes "show me sessions about X" to search
FEATURE_CHAT_ROUTING=true
```

**ShowcaseApp** (`VITE_FEATURE_CHAT_ROUTING`):
```env
# Phase 1: Disabled (placeholder)
VITE_FEATURE_CHAT_ROUTING=false

# Phase 2+: May show "Ask in Chat" CTA on session cards
VITE_FEATURE_CHAT_ROUTING=true
```

### `FEATURE_SESSION_SEARCH`
**Type**: Feature toggle  
**Purpose**: Enable advanced session search UI  
**Default**: `false`  
**Repos**: ShowcaseApp, Bridge, Chat

**ShowcaseApp** (`VITE_FEATURE_SESSION_SEARCH`):
```env
# Phase 1
VITE_FEATURE_SESSION_SEARCH=false

# Phase 3+: Show advanced search page
VITE_FEATURE_SESSION_SEARCH=true
```

**Bridge** (`FEATURE_SESSION_SEARCH`):
```env
# Phase 1-2
FEATURE_SESSION_SEARCH=false

# Phase 3+: Enable POST /api/v1/events/{id}/sessions/search
FEATURE_SESSION_SEARCH=true
```

**Chat** (`FEATURE_SESSION_SEARCH`):
```env
# Phase 1-2
FEATURE_SESSION_SEARCH=false

# Phase 3+: Enable semantic search tool
FEATURE_SESSION_SEARCH=true
```

### `USE_SEMANTIC_SEARCH`
**Type**: Feature toggle  
**Purpose**: Enable vector/semantic search for sessions  
**Default**: `false`  
**Repos**: Bridge, Chat  
**Requirement**: Azure OpenAI embeddings configured

**Bridge** (`USE_SEMANTIC_SEARCH`):
```env
# Phase 1-2: Use keyword search only
USE_SEMANTIC_SEARCH=false

# Phase 3+: Use embeddings for semantic search
USE_SEMANTIC_SEARCH=true
```

**Chat** (`USE_SEMANTIC_SEARCH`):
```env
# Phase 1-2: Use keyword search
USE_SEMANTIC_SEARCH=false

# Phase 3+: Use semantic search
USE_SEMANTIC_SEARCH=true
```

### `FEATURE_LIVE_COSMOS`
**Type**: Data source toggle  
**Purpose**: Use live Cosmos DB instead of Bridge API  
**Default**: `false`  
**Repos**: ShowcaseApp

**ShowcaseApp** (`VITE_FEATURE_LIVE_COSMOS`):
```env
# Phase 1: Disabled (JSON seed data)
VITE_FEATURE_LIVE_COSMOS=false

# Phase 2: Use Bridge API or direct Cosmos
VITE_FEATURE_LIVE_COSMOS=true
```

## Flag Propagation Matrix

| Phase | `FEATURE_EVENTS` | `FEATURE_SESSIONS` | `USE_SEED_DATA` | `FEATURE_CHAT_ROUTING` | `FEATURE_SESSION_SEARCH` | `USE_SEMANTIC_SEARCH` | `FEATURE_LIVE_COSMOS` |
|-------|-----|-----|-----|----|-----|-----|-----|
| **Phase 1** (Jan 24 - Feb 28) | ✅ true | ✅ true | ✅ true | ❌ false | ❌ false | ❌ false | ❌ false |
| **Phase 2 Early** (Mar 3 - Mar 31) | ✅ true | ✅ true | ⚠️ hybrid | ✅ true | ❌ false | ❌ false | ⚠️ hybrid |
| **Phase 2 Late** (Apr 1 - Apr 15) | ✅ true | ✅ true | ❌ false | ✅ true | ✅ true | ❌ false | ❌ false |
| **Phase 3** (Apr 15 - Jun 15) | ✅ true | ✅ true | ❌ false | ✅ true | ✅ true | ✅ true | ❌ false |
| **Phase 4** (Jun 15+) | Bridge only | Bridge only | Bridge only | Chat only | Chat only | ✅ true | Deprecated |

**Legend**: ✅ = Enabled | ❌ = Disabled | ⚠️ = Gradual migration (both paths available)

## Implementation Pattern: ShowcaseApp

```typescript
// cosmos-service.ts
async getSessions(eventId: string, filters?: SessionFilters) {
  const useSeedData = process.env.VITE_USE_SEED_DATA !== 'false';
  const useCosmosLive = process.env.VITE_FEATURE_LIVE_COSMOS === 'true';

  if (useSeedData && !useCosmosLive) {
    // Phase 1: Load from JSON
    return this.loadFromSeedJSON(eventId, filters);
  } else if (useCosmosLive && this.cosmosConnected) {
    // Phase 2+: Load from Cosmos directly
    return this.loadFromCosmos(eventId, filters);
  } else {
    // Phase 2+: Load from Bridge API (preferred)
    return this.loadFromBridgeAPI(eventId, filters);
  }
}

// routes/sessions.tsx
export function ShouldRender() {
  const featureSessions = process.env.VITE_FEATURE_SESSIONS === 'true';
  if (!featureSessions) return <NotFound />;
  // Render sessions page
}
```

## Implementation Pattern: Bridge API

```typescript
// middleware/featureFlags.ts
export function withFeatureFlag(flagName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const enabled = process.env[flagName] === 'true';
    if (!enabled) {
      return res.status(404).json({
        success: false,
        error: { code: 'FEATURE_DISABLED', message: `${flagName} is disabled` }
      });
    }
    next();
  };
}

// routes/sessions.ts
router.get(
  '/events/:eventId/sessions',
  withFeatureFlag('FEATURE_SESSIONS'),
  sessionsHandler
);
```

## Implementation Pattern: Chat

```python
# services/feature_flags.py
def get_feature_flag(flag_name: str, default: bool = False) -> bool:
    return os.getenv(flag_name, str(default)).lower() == 'true'

# tools/session_search.py
if get_feature_flag('FEATURE_CHAT_ROUTING'):
    @tool
    def search_sessions(query: str, event_id: str):
        """Search sessions by query"""
        if get_feature_flag('USE_SEED_DATA'):
            results = load_seed_sessions()
        else:
            results = call_bridge_api(event_id, query)
        return results
```

## Environment Variable Setup

### ShowcaseApp (.env)
```env
# Phase 1 Defaults
VITE_FEATURE_EVENTS=true
VITE_FEATURE_SESSIONS=true
VITE_USE_SEED_DATA=true
VITE_FEATURE_CHAT_ROUTING=false
VITE_FEATURE_SESSION_SEARCH=false
VITE_FEATURE_LIVE_COSMOS=false
```

### Bridge API (.env)
```env
# Phase 2 Defaults
FEATURE_EVENTS=true
FEATURE_SESSIONS=true
USE_SEED_DATA=true
FEATURE_CHAT_ROUTING=true
FEATURE_SESSION_SEARCH=false
USE_SEMANTIC_SEARCH=false
```

### Chat (.env)
```env
# Phase 2 Defaults
FEATURE_EVENTS=true
FEATURE_SESSIONS=true
USE_SEED_DATA=true
FEATURE_CHAT_ROUTING=true
FEATURE_SESSION_SEARCH=false
USE_SEMANTIC_SEARCH=false
```

## Migration Timeline

### Phase 1 → Phase 2 Transition (Feb 28 → Mar 3)
1. Bridge API goes live with seed data fallback
2. Set `USE_SEED_DATA=true` in Bridge and Chat (hybrid mode)
3. Enable `FEATURE_CHAT_ROUTING=true` in Chat
4. ShowcaseApp remains on seed data until Cosmos is ready

### Phase 2 Early → Late Transition (Mar 31 → Apr 1)
1. Cosmos DB fully populated with seed data
2. Set `USE_SEED_DATA=false` in Bridge (Cosmos is source)
3. ShowcaseApp optional: Set `VITE_FEATURE_LIVE_COSMOS=true` to use Cosmos directly
4. Chat continues using Bridge API

### Phase 2 → Phase 3 Transition (Apr 15)
1. Enable `FEATURE_SESSION_SEARCH=true` across repos
2. Enable `USE_SEMANTIC_SEARCH=true` if embeddings ready
3. ShowcaseApp shows advanced search UI

## Deployment Checklist

- [ ] All three repos have feature flag environment variables defined
- [ ] Documentation updated in each repo with flag meanings
- [ ] Local development `.env.example` files updated
- [ ] CI/CD pipelines configured with phase-specific flags
- [ ] Monitoring/logging includes flag state on startup
- [ ] Rollback procedure tested for flag changes

## Testing Feature Flags

### Test Isolation
Each feature should be independently testable:

```bash
# Test with all Phase 1 flags
VITE_FEATURE_EVENTS=true VITE_FEATURE_SESSIONS=true VITE_USE_SEED_DATA=true npm test

# Test with Phase 2 flags
VITE_FEATURE_EVENTS=true VITE_FEATURE_SESSIONS=true VITE_USE_SEED_DATA=false npm test

# Test with feature disabled
VITE_FEATURE_SESSIONS=false npm test
```

## Monitoring & Observability

Log flag state on startup:

```typescript
console.log('=== Feature Flags ===');
console.log(`FEATURE_EVENTS: ${process.env.FEATURE_EVENTS}`);
console.log(`FEATURE_SESSIONS: ${process.env.FEATURE_SESSIONS}`);
console.log(`USE_SEED_DATA: ${process.env.USE_SEED_DATA}`);
console.log(`FEATURE_CHAT_ROUTING: ${process.env.FEATURE_CHAT_ROUTING}`);
console.log('====================');
```

Track flag changes in Application Insights/logging service to detect unexpected toggles.

## FAQ

**Q: Can I enable FEATURE_SESSIONS without FEATURE_EVENTS?**  
A: Not recommended. Sessions are part of events, so both should be enabled together.

**Q: What if Bridge API is down and USE_SEED_DATA=false?**  
A: ShowcaseApp should gracefully fall back to showing cached data or "offline" message.

**Q: How do I test Phase 2 features locally?**  
A: Set `VITE_USE_SEED_DATA=false` and point to local Bridge API on `localhost:3000`.

**Q: Can I enable semantic search without embeddings?**  
A: No - `USE_SEMANTIC_SEARCH` requires Azure OpenAI configured with embeddings model.

**Q: How often should I check flags in code?**  
A: At startup for initialization, and optionally at request-time for dynamic feature toggling.
