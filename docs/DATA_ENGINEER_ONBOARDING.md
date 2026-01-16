# Data Engineer Onboarding Plan

**Target Audience**: New data engineer joining the MSR Event Hub team to build the data warehouse enabling the chat API experience.

**Duration**: 8 weeks  
**Focus**: Data modeling, ETL pipelines, embeddings, telemetry warehousing, and performance tuning for Phase 1–4 rollout.

---

## Overview

This guide maps the [ROADMAP.md](ROADMAP.md) phases and [CHAT_UI_SPEC.md](CHAT_UI_SPEC.md) chat actions into concrete data engineering tasks. You will progressively build the warehouse that powers the agent—from raw ingestion to API-optimized read models, embeddings, and compliance dashboards.

**Key Principles**:
- Data schemas follow Azure Cosmos DB best practices (partition keys, HPK for scale).
- All pipelines are idempotent and include quality gates.
- Telemetry is first-class: every action is observable and queryable.
- Access controls and compliance flags are baked into schemas from day one.

---

## Week-by-Week Milestones

### Week 1: Environment, Context & Data Inventory

**Goals**: Get productive in the codebase; understand the chat experience and data needs.

**Tasks**:
- [ ] Git clone both repos; set up local Node 22 and Python 3.12 environments
- [ ] Read `ROADMAP.md` (focus on Phase 1 scope: 15 chat actions, DOSA/PKA, telemetry events)
- [ ] Read `CHAT_UI_SPEC.md` (review 31 total actions, UI surfaces, example commands)
- [ ] Read `INTEGRATION_GUIDE.md` (understand DOSA/PKA governance, error handling, switchboard patterns)
- [ ] List all upstream data sources: event sites, CSV exports, RRS database, admin sheets; document contact/SLA for each
- [ ] Map chat actions to required data fields: e.g., "View today's agenda" → Sessions with time, location, track, speaker, links
- [ ] Create data requirements spreadsheet: entity, required fields, keys, uniqueness rules, sample cardinality

**LLM Learning**:
- Understand system prompts and context window constraints (Azure OpenAI models, tokens).
- Learn why structured data is essential for safety (DOSA), retrieval (RAG), and compliance (PKA).

**Outcome**: Data inventory complete; local repos running; clear mapping of chat actions → data contracts.

**Verification**: Run `npm run cards:lint` in msr-event-agent-chat; zero errors.

---

### Week 2: Canonical Schemas & ETL Foundation

**Goals**: Design the data model; stand up idempotent ingestion pipelines.

**Tasks**:
- [ ] Define canonical schemas (JSON schema or SQL DDL) for:
  - `Event` (eventId, name, eventType, dates, tracks, visibility, access flags, geofence, org, created/updated)
  - `Session` (sessionId, eventId, title, abstract, speakers[], track, date/time/duration, location, links[], recording, keywords)
  - `Poster` (posterId, eventId, title, abstract, team[], image, links[], theme, location, QR ID, keywords)
  - `Person` (personId, name, title, affiliation, email, image, msr-id, created/updated)
  - `Link` (linkId, entityId, type, url, title, verified, crawledAt)
  - `Bookmark` (bookmarkId, userId, entityId, eventId, createdAt)
  - `Telemetry` (eventId, timestamp, eventName, userId, context, properties)
- [ ] Decide partition key strategy per entity (likely `eventId` for most; `userId + eventId` for bookmarks; timestamp partitioning for telemetry)
- [ ] Identify candidates for Hierarchical Partition Keys (HPK): consider multi-level partitions for cross-event queries
- [ ] Create sample records and validate schema completeness against Phase 1 chat actions (15 actions)
- [ ] Design ID generation strategy: durable identifiers, collision handling, QR ↔ entity mapping
- [ ] Build ETL for CSV/JSON ingestion:
  - Schema validation (required fields, types, referential integrity)
  - De-duplication logic (by ID and by content hash)
  - Enrichment (resolve speaker → Person, validate links)
  - Staging table; promotion logic (once validated)
  - Error handling: dead-letter queue for bad rows; retry with backoff
- [ ] Implement data quality checks:
  - Non-null for critical fields
  - Link health (HTTP 200, HTTPS only)
  - Image alt-text presence and format
  - Speaker/team member record existence
  - Create a linting/validation script (similar to `card_lint.mjs`)

**LLM Learning**:
- Understand embeddings models (text-embedding-ada-002): input size, dimensions, cost.
- Learn why schema design matters for RAG: structured metadata enables filtering and citation linking.

**Outcome**: Schemas defined; MVP ingestion pipeline running on sample data; zero data quality violations.

**Verification**: Load Phase 1 data (1 event, 20 sessions, 30 posters, 50 people); run validation; check count/cardinality.

---

### Week 3: Read Models, Indexes & Telemetry Landing

**Goals**: Materialize API views; land telemetry in the warehouse.

**Tasks**:
- [ ] Create read models (materialized views or separate collections):
  - `AgendaView` (eventId, day, sessions sorted by time; includes speaker names, location, track, links)
  - `PosterGalleryView` (eventId, posters with filters: theme, track, keywords; thumbnail image + basic info)
  - `SessionDetailView` (sessionId, full details: abstract, speaker bios, links, recording, related posters)
  - `TeamContactView` (posterId, team list: names, titles, emails, images, affiliation)
  - `BookmarkedItemsView` (userId, bookmarks per event; with full detail of bookmarked entity)
  - `SearchIndexView` (eventId, entity type, title, abstract, keywords, track, speaker, searchable text)
- [ ] Add secondary indexes:
  - `(eventId, date, time)` for agenda queries
  - `(eventId, track)` for filtered browsing
  - `(eventId, keywords)` for topic search
  - `(userId, eventId)` for bookmarks
  - `(personId)` for speaker lookup
- [ ] Define caching strategy:
  - Short TTL (5–10 min) for hot reads: agenda, poster gallery, session detail
  - Medium TTL (1 hour) for less-frequent: team contacts, cross-event searches
  - Cache invalidation triggers: on ETL promotion, manual refresh
- [ ] Model 1DS telemetry schema:
  - `ai_content_refusal` (eventId, userId, timestamp, reason, model, attempt)
  - `ai_edit_action` (eventId, userId, timestamp, originalText, editedText, accepted)
  - `bookmark_action` (eventId, userId, timestamp, entityId, action: save/unsave)
  - `connection_initiated` (eventId, userId, timestamp, contactType: email/organizer/repo, target)
  - `event_visit` (eventId, userId, timestamp, visitType: pre/during/post)
  - `ai_governance_metric` (eventId, timestamp, wasRefused, modelUsed, tokenCount, latencyMs)
- [ ] Create telemetry warehouse tables and dashboards:
  - Refusal rate by event and reason
  - Edit acceptance rate and common edits
  - Bookmark volume and trends
  - Connection-initiated count and types
  - Pre/post event visit funnels
  - KPI tiles: refusal %, edit %, pre-event %, post-event %, connection count

**LLM Learning**:
- Understand prompt context and token budget: how much space for data retrieval within a completion.
- Learn telemetry-driven evaluation: using logging to measure safety (refusal %) and utility (edit acceptance).

**Outcome**: Read models queryable; all Phase 1 actions have backing data; telemetry dashboards show baseline traffic.

**Verification**: Query AgendaView by event/day; return <100ms. Query BookmarkedItems for a test user; verify persistence. Check 1DS dashboard: refusal_rate tile populated.

---

### Week 4: LLM Safety & DOSA Enforcement Data

**Goals**: Implement data guardrails for DOSA (Deterministic Outcome, Safety-bound Action).

**Tasks**:
- [ ] Design DOSA trigger table:
  - Content type (PII, restricted keywords, cross-org, out-of-scope)
  - Severity (fail-closed vs warn)
  - Rules (regex, list membership, category detection)
  - Refresh policy (weekly updates from compliance team)
- [ ] Implement PII detection:
  - Redact email addresses and phone numbers in responses (except published contact info)
  - Block responses that leak attendee lists or private data
  - Tag sensitive fields in schemas (email, internal ID, SSN, etc.)
- [ ] Add DOSA logging:
  - When a query triggers a refusal, log: eventId, userId, intent, refusalReason, timestamp
  - Emit `ai_content_refusal` telemetry with reason
  - Track refusal rate by event and user
- [ ] Create compliance data views:
  - `RefusedQueriesView` (eventId, timestamp, intent, reason, user count)
  - `DSemanticsView` (eventId, sessions/posters with restricted flags, access rules)
- [ ] Document DOSA failure modes and test vectors:
  - Attempt cross-event queries when disallowed
  - Ask for attendee contact info not in speaker list
  - Request internal project data marked confidential
  - Verify refusal logging triggers

**LLM Learning**:
- Understand content filters and safety policies in Azure OpenAI.
- Learn deterministic guardrails: data-driven vs model-driven safety decisions.
- Study DOSA pattern: fail-closed, emit telemetry, suggest safer alternatives.

**Outcome**: DOSA table live; PII redaction working; refusal logging validated in staging.

**Verification**: Query a restricted event; verify refusal logged with reason. Check refusal_rate dashboard tile updates.

---

### Week 5: PKA Draft-Only & Knowledge Synthesis Data

**Goals**: Materialize PKA checklist data and source citation fields.

**Tasks**:
- [ ] Design PKA schema for draft assessments:
  - `ProjectKnowledgeAssessment` (posterId, heilmeierQ1-Q5 responses, evidence[], maturity level, draft status)
  - Source fields: created_by, reviewed_by, created_date, reviewed_date, notes, disclaimers
- [ ] Build knowledge synthesis data models:
  - `ProjectFAQ` (posterId, questions[], answers[], source links)
  - `ProjectOverview` (posterId, heilmeier summary, team roles, next steps, limitations)
  - All derived from abstract, team bios, linked papers, code repos
- [ ] Create PKA enforcement table:
  - Draft-only flag per assessment (auto-set on creation, cleared only by human reviewer)
  - Citation tracking: every fact must have a source (URL, section, quote)
  - Audit trail: who created, who reviewed, when, what changed
- [ ] Add source citation layer to all chat responses:
  - Every fact → source URL or section
  - Track via `CitationMapping` table: (responseId, factId, sourceId, section, quote)
- [ ] Implement compliance dashboards:
  - PKA draft approval rate (% of assessments reviewed by human)
  - Citation coverage (% of response facts with sources)
  - Disclaimer hits (how many times users see "draft-only" notice)

**LLM Learning**:
- Understand Retrieval-Augmented Generation (RAG): embedding queries, retrieving source documents, citing them.
- Learn hallucination mitigation: structured data with source fields reduces model drift.
- Study PKA patterns: draft-only enforcement, source requirements, human-in-the-loop workflows.

**Outcome**: PKA schema and assessment data live; draft-only enforcement working; citations tracked for every response.

**Verification**: Run PKA draft check on a test project; verify disclaimer shown. Check citation_coverage dashboard. Confirm draft status blocks auto-approval.

---

### Week 6: Multi-Event & Bookmark Persistence

**Goals**: Enable event context switching and persistent bookmarking.

**Tasks**:
- [ ] Design event context data:
  - `EventContext` (eventId, eventName, visibility, audience, access_restrictions, active_for_user)
  - User-event permission mapping: `(userId, eventId, role: attendee/presenter/organizer, scopes[])`
- [ ] Build bookmark persistence layer:
  - `Bookmarks` (bookmarkId, userId, eventId, entityId, entityType, savedAt, tags[], notes)
  - Uniqueness: `(userId, eventId, entityId)` — one bookmark per user-event-item
  - TTL/lifecycle: persistent, user can delete, archive after event +90 days (configurable)
- [ ] Implement access control checks:
  - When a user queries across events, enforce visibility: only return items user has access to
  - Tag responses with org/geo/audience restrictions ("Restricted: Project Green organizers only")
  - Log access attempts to unauthorized events for compliance
- [ ] Create event selector data:
  - `AvailableEventsForUser` view: (userId, eventId, eventName, access_level, unread_count)
  - QR mapping: `(qrCode, entityId, eventId, expiresAt)` — links QR scans to bookmarks
- [ ] Build multi-event read models:
  - `CrossEventSessionSearch` (title, abstract, eventId, eventName, speaker, keywords)
  - Scoped by user permissions; limited to top 5 per phase spec
- [ ] Add bookmark telemetry:
  - `bookmark_action` events: (userId, eventId, entityId, action: save/unsave, timestamp)
  - Aggregate: bookmarks per user, per event, per entity type

**LLM Learning**:
- Understand context isolation: how to scope LLM responses to user permissions without leaking data.
- Learn multi-tenant patterns: event-based namespacing, access control enforcement at query layer.

**Outcome**: Multi-event queries scoped correctly; bookmarks persist and sync across sessions; QR scans trigger bookmarks.

**Verification**: Save bookmark in Event A; verify persistence. Switch to Event B; verify bookmarks per event. Scan QR; verify bookmark auto-created.

---

### Week 7: Embeddings Pipeline & Cross-Event RAG

**Goals**: Stand up embeddings and citation-aware retrieval for Phase 3–4 cross-event discovery.

**Tasks**:
- [ ] Design embeddings pipeline:
  - Data to embed: session abstracts, poster titles + abstracts, presenter bios, related papers/repos
  - Model: `text-embedding-ada-002` (3072 dims)
  - Batch ingestion: nightly, post-promotion
  - Versioning: track embedding_model_version; regenerate on model changes
- [ ] Create vector store (Cosmos DB or Azure AI Search):
  - Schema: (entityId, entityType, eventId, vector[], title, abstract, keywords, sourceUrl, accessFlags[])
  - Index on: eventId, entityType, keywords, accessFlags
  - Search strategy: cosine similarity, top-k=5, filtered by user permissions
- [ ] Build citation-aware retrieval:
  - `RetrievalResult` (entityId, eventId, similarity_score, title, sourceUrl, excerpt, accessBadge)
  - Citation mapping: store which abstract section matched the query
  - Access badges: if entity is restricted, label it ("Restricted: [reason]")
- [ ] Implement scoped cross-event search:
  - Enforce user event permissions: only retrieve from authorized events
  - Limit results to top 5 per event
  - Add source event label to each result
  - Include research area categorization (Machine Learning, Systems, etc.)
- [ ] Create embeddings monitoring:
  - Token cost per embedding batch
  - Vector search latency (target: <500ms for top-5)
  - Cache hit rate for frequently searched topics
- [ ] Build search analytics dashboard:
  - Popular topics/researchers across events
  - Search success metrics (did user click a result?)
  - Cross-event discovery rate (% of searches spanning multiple events)

**LLM Learning**:
- Deep dive into embeddings: how to embed text, search vectors, interpret similarity scores.
- Understand RAG architecture: retrieve documents, rank by relevance, pass to LLM with citations.
- Learn evaluation metrics: retrieval precision/recall, citation accuracy.

**Outcome**: Embeddings pipeline running nightly; cross-event search returns top 5 with citations; latency <500ms.

**Verification**: Search for "machine learning" across events; verify top 5 returned with source event labels and similarity scores. Check citation accuracy: verify excerpts match results.

---

### Week 8: Compliance, Performance Tuning & Go-Live Validation

**Goals**: Harden the warehouse for Phase 1 launch; document runbooks; validate compliance gates.

**Tasks**:
- [ ] Performance tuning:
  - Measure p99 latencies for Phase 1 actions (agenda, poster detail, bookmarks, session detail)
  - Target: p99 <2s; p50 <500ms
  - Identify hot partitions; add read replicas or cache if needed
  - Load test: simulate 1000 concurrent users @ 2 rps for 30 min (Phase 1 target)
- [ ] Data migration from RRS (if needed):
  - Export RRS schema; map to canonical schemas
  - Backfill: Sessions, Posters, People from RRS
  - Reconcile IDs: create mapping table for legacy → new IDs
  - Validate counts, spot-check data, compare with source
  - Archive RRS export for audit/provenance
- [ ] Compliance validation checklist:
  - [ ] DOSA refusal logging 100% (all triggered refusals logged)
  - [ ] PKA draft-only enforced (no auto-approvals)
  - [ ] PII redaction working (test vectors confirmed)
  - [ ] Bookmark data retention policy documented
  - [ ] Access control enforced (unauthorized access rejected with logging)
  - [ ] Telemetry retention windows set (e.g., telemetry 90 days, bookmarks indefinite)
  - [ ] Audit trail complete (created_by, updated_by, timestamps on all entities)
- [ ] Create runbooks:
  - Data ingestion: trigger, monitor, rollback, troubleshoot
  - Telemetry dashboard: KPI definitions, alert thresholds, escalation
  - Backup/restore procedures
  - Incident response: handle data corruption, access violations, compliance breaches
- [ ] Build synthetic test datasets:
  - Multi-event fixture (2 events, 30 sessions, 40 posters)
  - Golden query validation (agenda, poster, session detail, cross-event search)
  - Failure mode tests: missing fields, bad links, PII injection, DOSA triggers
- [ ] Documentation:
  - Schema dictionary: entity definitions, field purposes, valid values
  - Data lineage: how entities flow from ingestion → read models → API
  - Troubleshooting guide: common issues and solutions
  - Metrics and SLOs: latency targets, availability targets, cost baselines
- [ ] Integration with API:
  - Finalize read model schemas for API consumption
  - Document query patterns and indexes used
  - Set up API logging to correlate with warehouse telemetry
  - Load test API + warehouse together (Phase 1 load profile)
- [ ] Sign-off checklist for Phase 1 launch:
  - [ ] All 15 chat actions have complete data paths
  - [ ] Telemetry wired and emitting in staging
  - [ ] p99 latency <2s under load
  - [ ] Compliance gates passed (RAI, HR Legal, Security, DPIA)
  - [ ] Runbooks reviewed and tested
  - [ ] Team trained on monitoring and troubleshooting

**LLM Learning**:
- Understand operational concerns: reliability, observability, performance under load.
- Learn cost optimization: embeddings API costs, storage tiering, query optimization.
- Study compliance operations: audit trails, data retention, incident response.

**Outcome**: Warehouse hardened; Phase 1 data path validated end-to-end; runbooks in place; team ready for launch.

**Verification**: Run load test: 1000 concurrent users, 2 rps, 30 min; confirm p99 <2s. Verify all compliance sign-offs. Spot-check a full chat interaction: user logs in, views agenda, bookmarks session, sees telemetry in dashboard.

---

## Key Data Modeling Decisions

### Partition Keys
- **Events, Sessions, Posters**: `eventId` (ensures colocality within an event)
- **Bookmarks**: `userId` (hot for user's view of bookmarks), consider **`(userId, eventId)`** for Phase 2 multi-event
- **Telemetry**: `eventId` with secondary time-based partitioning for large events
- **People**: Partition by `msr-id` or hash to spread lookups; consider HPK for cross-event speaker search

### Hierarchical Partition Keys (HPK)
- **Multi-Event Queries**: Consider HPK like `(eventId, keyword)` for cross-event searches; enables scoping to few partitions instead of full scan
- **Bookmarks at Scale**: `(userId, eventId)` allows efficient per-user, per-event views
- **Telemetry**: `(eventId, timestamp_month)` balances query flexibility with partition size

### Data Retention
- **Event/Session/Poster**: Indefinite (archive after event if needed)
- **Bookmarks**: Indefinite (user-owned; allow export)
- **Telemetry**: 90 days operational, 1 year compliance hold (DPIA requirement)
- **Links (crawled metadata)**: 30 days; recrawl on-demand if needed

### Access Control
- Every entity has `visibility` field: public, internal, restricted
- Restricted entities carry `access_list` (org/team IDs with permission)
- Queries must filter by user's authorized orgs; deny-list any unauthorized event
- Compliance flag: `require_disclosure` (if true, user must accept data usage terms before viewing)

---

## Example Data Flows

### Phase 1: "View today's agenda"
```
User Query
  ↓
Determine eventId + userId
  ↓
Query AgendaView(eventId, today)
  ↓
Fetch: Session[], sorted by time
  ↓
Enrich: speaker names, location, track from Person, Link tables
  ↓
Filter: only sessions user can see (visibility + access_list)
  ↓
Return: agenda card with session list
  ↓
Log: event_visit (userId, eventId, visitType: 'pre/during') → telemetry
```

### Phase 2: "Save bookmark"
```
User Query
  ↓
Determine userId, eventId, entityId
  ↓
Insert Bookmark(userId, eventId, entityId, savedAt=now)
  ↓
Upsert (unique constraint on userId+eventId+entityId)
  ↓
Return: confirmation card
  ↓
Log: bookmark_action (userId, eventId, entityId, action: 'save') → telemetry
  ↓
Invalidate: BookmarkedItemsView cache for this user
```

### Phase 3: "Find talks on Machine Learning"
```
User Query
  ↓
Embed query: "Machine Learning"
  ↓
Vector search: top-k=5 per event, filtered by user authorized events
  ↓
Retrieve: SessionDetailView for each result, with eventId labels
  ↓
Filter: only top 5 results per event (Phase spec)
  ↓
Enrich: add access badges (if restricted, show "Restricted: [org]")
  ↓
Return: recommendation card with top 5, source events, similarity scores
  ↓
Log: cross_event_interaction (userId, eventIds[], query_intent) → telemetry
```

---

## Success Metrics (Data Readiness)

| Metric | Phase 1 Target | Phase 2 Target | Phase 3–4 Target |
|--------|---|---|---|
| Data freshness | <1 day (nightly refresh) | <4 hours | Real-time (hourly) |
| Query latency (p99) | <2s | <3s | <4s |
| Ingestion success rate | 99%+ | 99.5%+ | 99.9%+ |
| Data quality (lint pass) | 100% | 100% | 100% |
| Telemetry coverage | 15 actions tracked | 23 actions tracked | 31 actions tracked |
| Compliance checks passed | 100% | 100% | 100% |
| Backup coverage | Daily snapshots | Hourly incremental | Real-time replication |

---

## Resources & References

- **Schema Design**: [Azure Cosmos DB Best Practices](https://docs.microsoft.com/azure/cosmos-db/best-practices) – partition keys, indexing, HPK
- **Embeddings**: [Azure OpenAI Embeddings Docs](https://learn.microsoft.com/azure/ai-services/openai/concepts/understand-embeddings)
- **1DS Telemetry**: Event schema definitions in [ROADMAP.md](ROADMAP.md#analytics--telemetry)
- **Chat Spec**: [CHAT_UI_SPEC.md](CHAT_UI_SPEC.md) – 31 actions mapped to data needs
- **Integration Guide**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) – DOSA/PKA patterns

---

## Next Steps

- **Week 1 deliverable**: Data requirements spreadsheet + upstream inventory → share with team
- **Weekly check-ins**: Standup on schema decisions, ETL blockers, performance baselines
- **End of Week 8**: Launch readiness review; go/no-go decision

Welcome to the team! Reach out anytime with questions on schema design, query patterns, or LLM fundamentals.
