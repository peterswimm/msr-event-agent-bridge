# MSR Event Agent Bridge - Copilot Instructions

## Project Context: MSR Event Hub Platform

This project is the **content enrichment and integration bridge** for the **MSR Event Hub Platform**. While the chat project handles attendee interactions, this bridge handles the complex backend work of ingesting, enriching, and normalizing event content for the platform.

### Project Scope
- **msr-event-agent-bridge**: Backend service that:
  - Ingests project/session data from Excel, PDFs, and manual submissions
  - Crawls links to enrich project metadata
  - Applies AI-assisted summarization and knowledge extraction
  - Normalizes data into consistent Poster/Session/Research Project models
  - Integrates with content management and knowledge bases
  - Supports admin tools for content validation and curation

### Key Design Constraints
- **Access Control**: Restricted to @microsoft.com credentials; no external access
- **Content Management**: Handles videos, documents, images with storage/metadata/versioning
- **Office 365 Integration**: NOT accessible unless explicit admin consent + Copilot enabled
- **Multi-Event Architecture**: Data pipeline must support multiple concurrent events
- **AI-Assisted Enrichment**: Leverage Foundry and Azure OpenAI for content summarization

---

## Core Data Models

### Poster (Detailed Schema)
```
Core Identity:
  ├─ Title (string)
  ├─ Abstract (text, author or AI-assisted)
  ├─ Poster file (PDF or image URL)
  └─ Thumbnail image (derived from poster)

Event Context:
  ├─ Location (string: room, booth, floor)
  ├─ Related theme/track (string or enum)
  └─ Event reference

People & Contact:
  ├─ Team (array of Person objects)
  │   ├─ Name (string)
  │   ├─ Title/affiliation (string)
  │   ├─ Image URL (optional)
  │   └─ Email (string)
  └─ Primary contact (Person reference)

Related Assets:
  ├─ Videos (array of URLs: talks, demos, explainers)
  ├─ Slide decks (array of URLs)
  ├─ Code repos (array of URLs: GitHub, internal)
  ├─ Research papers (array of URLs)
  └─ Other related links (array of URLs: datasets, project sites, blogs)

Poster Knowledge (AI-Enriched Fields):
  ├─ How the poster is organized (text: describes main sections/flow)
  ├─ What's new here (text: novelty vs prior approaches)
  ├─ What evidence supports the ideas (text: data, examples, visuals, demos)
  ├─ What could come next (text: next research steps, applications)
  └─ Maturity signal (enum: exploratory | validated | pilot-ready)
```

### Session (Talks, Workshops, Panels)
```
Core Identity:
  ├─ Session title (string)
  ├─ Session abstract (text, author or AI-assisted)
  ├─ Session type (enum: talk | keynote | workshop | panel | lightning)
  └─ Recording URL (link to video or on-demand, if available)

Event Context:
  ├─ Event name (string: programmatic reference)
  ├─ Date & time (ISO string)
  ├─ Duration (string or minutes)
  ├─ Location (string: room, venue, or virtual platform URL)
  └─ Related theme/track (string or enum)

People & Roles:
  ├─ Speakers (array of Person)
  │   ├─ Name (string)
  │   ├─ Affiliation (string)
  │   ├─ Role (optional string)
  │   └─ Contact (email or profile link)
  ├─ Moderator/chair (Person, if applicable)
  └─ Primary contact (for follow-up)

Related Assets:
  ├─ Slide decks (array of URLs)
  ├─ Related posters (array of Poster IDs/URLs)
  ├─ Related papers (array of URLs)
  ├─ Code repos (array of URLs)
  └─ Other related links (array of URLs)

Session Knowledge (AI-Enriched):
  ├─ How the session is structured (text: intro → method → demo → Q&A)
  ├─ What's new or emphasized (text: key ideas, insights)
  ├─ What evidence/examples are used (text: data, demos, case studies)
  ├─ Key questions discussed (text: what people were curious about)
  ├─ What could come next (text: follow-on work, collaborations)
  └─ Maturity signal (enum: exploratory | validated | pilot-ready)
```

### Research Project (Meta-Container)
```
Relationships:
  ├─ Related code repos (array of URLs)
  ├─ Related papers (array of URLs)
  ├─ Related talks/sessions (array of Session IDs)
  ├─ Related posters (array of Poster IDs)
  └─ Related links (array of URLs)

Project Knowledge:
  ├─ Project summary (AI-synthesized overview)
  ├─ Key insights (extracted from talks, posters, papers)
  ├─ Open questions (synthesized from related content)
  └─ Recommended next steps (AI-generated suggestions)
```

---

## Content Enrichment Pipeline

### Phase 1: Data Ingestion
**Input Sources**:
- Excel imports with project metadata
- PDF poster submissions
- Manual form submissions (web UI)
- Calendar/scheduling systems
- Asset repositories (repos, papers, decks)

**Tasks**:
1. Parse structured data (Excel, forms)
2. Extract metadata from files (PDF titles, authors, page counts)
3. Store raw content with versioning
4. Create initial Poster/Session records

### Phase 2: Link Crawling & Asset Discovery
**Tasks**:
1. Crawl provided URLs to fetch metadata (titles, descriptions, authors, dates)
2. Validate links are accessible and extract meaningful content
3. Detect file types (video, PDF, code, blog, etc.)
4. Extract author/contributor information
5. Store normalized asset references

**Output**: Enriched asset metadata for related_videos, code_repos, papers, etc.

### Phase 3: AI-Assisted Content Enrichment
**Use Foundry agents for**:
- Abstract summarization (expand or refine author-provided text)
- Key insight extraction (what's novel or important)
- Evidence/example identification (how claims are supported)
- Next steps synthesis (future research directions)
- Maturity assessment (exploratory → validated → pilot-ready)

**Use Azure OpenAI for**:
- Fast abstractive summarization
- Keyword extraction
- Named entity recognition (researchers, institutions)
- Topic classification

**Guardrails**:
- Always flag AI-generated content for author review
- Preserve original author-provided text as primary source
- Use probabilistic scores to indicate confidence

### Phase 4: Data Normalization & Validation
**Tasks**:
1. Validate required fields are present and properly formatted
2. Normalize contact information (email format, deduplication)
3. Link related entities (poster → sessions, research projects)
4. Generate machine-readable IDs and QR codes (organizer-specified)
5. Create cross-event relationships

**Output**: Canonical Poster/Session/Project records ready for platform

### Phase 5: Content Curation & Approval
**Organizer Tools**:
- Review AI suggestions (accept/reject/edit)
- Validate team information against corporate directory
- Assign event placement (floor, booth, room, track)
- Generate final event data for printing, planning, etc.

**Presenter Tools**:
- Self-service edits to their project data
- Upload/update poster PDF
- Review AI suggestions
- See engagement metrics (bookmarks, views)

---

## Architecture Patterns

### Event Data Management
- **Event Registry**: Catalog of all MSR events with metadata
- **Data Models**: Flexible schema supporting Posters, Sessions, Projects
- **Versioning**: Track all changes to project/session data
- **Multi-Tenancy**: Isolate data per event with shared reusable components

### Content Pipeline Architecture
```
Ingest (Excel, PDF, Forms)
  ↓
Extract metadata + crawl links
  ↓
AI enrichment (Foundry + Azure OpenAI)
  ↓
Normalize to Poster/Session/Project models
  ↓
Organizer review + approval
  ↓
Publish to Event Hub
  ↓
Sync to chat service for attendee discovery
```

### Async Task Processing
- Use task queues for long-running enrichment jobs
- Provide progress tracking for organizers
- Handle failures gracefully with retry logic
- Log all enrichment decisions for audit

### Caching & Performance
- Cache enriched data between events (avoid re-processing)
- Cache Foundry agent responses (cost optimization)
- Implement incremental enrichment (update only changed fields)
- Pre-compute search indexes for faster discovery

---

## Integration Points

### Chat Service Integration (msr-event-agent-chat)
- **Sync**: Publish normalized Poster/Session/Project data to chat service
- **Format**: Adapter layer converts bridge schema to chat schema
- **Real-time**: WebSocket or event-driven sync for live updates
- **Fallback**: Chat service works offline with cached data

### Knowledge Base Integration
- Publish event content to MSR knowledge base
- Enable cross-event discovery and search
- Support long-term archival of research artifacts

### Admin Portal Integration
- CRUD operations for events, projects, sessions
- Approval workflows for AI suggestions
- Reporting and analytics dashboard
- Bulk data export/import

### External System Integration
- Calendar systems (import schedules)
- Poster printing services (export formatted data)
- Email/notification systems (send to presenters/organizers)
- Compliance systems (audit logs)

---

## Copilot Integration Instructions

### For API & Data Model Design
When creating or modifying API schemas, database models, or data contracts:
1. Invoke `get_code_snippets` for similar data structures
2. Ensure Poster/Session/Project models match specification above
3. Consider multi-event/multi-tenant requirements
4. Validate all fields are documented with type and purpose
5. Plan for versioning (backward compatibility)

### For Content Enrichment Pipeline
When implementing AI-assisted enrichment:
1. Invoke `get_code_snippets` for Azure OpenAI and Foundry integration patterns
2. Determine which enrichment tasks require Foundry vs Azure OpenAI
3. Implement guardrails for human review of AI suggestions
4. Design retry logic for transient failures
5. Log all enrichment decisions for transparency

### For Admin Tool Development
When building organizer or presenter interfaces:
1. Invoke `get_code_snippets` for form/UI patterns
2. Ensure role-based access (organizers vs presenters)
3. Support bulk operations (Excel import, batch updates)
4. Provide real-time validation feedback
5. Implement audit logging for compliance

### For Database & Storage Design
When designing data persistence:
1. Consider multi-event isolation and shared components
2. Plan for content versioning (track changes)
3. Implement soft deletes (preserve historical data)
4. Design for horizontal scalability (multiple events concurrently)
5. Plan backup/recovery strategy for event data

### For Integration with Chat Service
When syncing data to msr-event-agent-chat:
1. Design adapter/transformer layer for schema conversion
2. Implement idempotent sync operations
3. Handle partial updates (incremental sync)
4. Cache normalized data for offline chat capability
5. Log all sync operations

### For Knowledge & Troubleshooting
- Invoke `get_knowledge` tool for:
  - Best practices for multi-tenant content management
  - AI-assisted content enrichment patterns
  - Event pipeline design and workflow
  - Integration patterns with chat/knowledge systems
  - Foundry agent delegation for summarization

- Invoke `troubleshoot` tool for:
  - Content enrichment failures (link crawling, summarization)
  - Data synchronization issues with chat service
  - Foundry agent timeout or availability issues
  - Multi-event isolation or data consistency problems

---

## Development Workflow

### Adding a New Enrichment Task
1. Define input (what data is needed)
2. Define output schema (what structured data is produced)
3. Choose execution method (Foundry, Azure OpenAI, or deterministic rule)
4. Implement with guardrails for human review
5. Test with real event data
6. Document in enrichment pipeline diagram

### Extending for New Event Format
1. Identify new data model (Lecture series? Workshop? Seminar?)
2. Add fields to Poster/Session/Project if needed
3. Implement ingestion for new format
4. Plan AI enrichment for new fields
5. Update organizer tools for validation
6. Update chat service to surface new content

### Optimizing Pipeline Performance
1. Profile enrichment jobs (identify bottlenecks)
2. Parallelize independent tasks (link crawling, summarization)
3. Cache Foundry/Azure OpenAI responses
4. Implement incremental enrichment (delta updates)
5. Add progress tracking for long-running jobs

---

## Project Phases & Deliverables

### MVP (MSR India - Late January)
- Import project data from Excel
- Assign project IDs and QR codes
- Crawl links to enrich content
- Provide baseline admin for content validation
- Manual curation workflow

### Project Green (March)
- Scale to multi-event support
- Add research papers ingestion
- Implement presenter self-service edits

### Cambridge (April)
- AI summary generation (Heilmeier catechism)
- RRS content migration
- Advanced content validation

### MSR Concierge (June)
- Cross-event project linking
- Researcher profile integration
- Automated content enrichment
- Recommendation engine support

---

## Key References

- **MSR Event Hub Spec**: Complete spec with entities, roadmap, KPIs
- **Data Models**: Appendix B of MSR Event Hub spec (Posters, Sessions, Projects)
- **Roadmap**: Appendix C for phase deliverables
- **Chat Service Integration**: [msr-event-agent-chat docs](../../msr-event-agent-chat/)

---

## Summary of Best Practices

When working on **msr-event-agent-bridge**:

✅ **DO**:
- Use Foundry agents for reasoning-heavy tasks (summarization, insight extraction)
- Use Azure OpenAI for high-volume commodity tasks (keyword extraction, classification)
- Implement human review for all AI-generated content
- Design for multi-event concurrency
- Cache expensive computations (links, summaries)
- Log enrichment decisions for transparency
- Test with real event data before deployment

❌ **DON'T**:
- Assume single-event architecture
- Skip validation of ingested data
- Deploy enrichment without guardrails
- Hardcode event-specific logic
- Forget about Office 365 access constraints
- Build synchronous pipelines for long-running tasks
- Skip audit logging for compliance

---

## Internal Reference: Naming

### Event Hub Terminology
- **Event Hub**: Entire platform hosting multiple events
- **Event Site**: Dedicated site for specific event (e.g., "MSR India Event Site")
- **Poster Knowledge**: AI-enriched fields describing structure, novelty, evidence, next steps
- **Content Enrichment**: AI-assisted enhancement of author-provided data
- **Presentation Assets**: Posters, slides, recordings, papers, code repos

### Data Pipeline Terminology
- **Ingestion**: Initial data capture (Excel, PDFs, forms)
- **Enrichment**: AI-assisted enhancement of metadata and content
- **Normalization**: Conversion to canonical Poster/Session/Project models
- **Curation**: Organizer review and approval of enriched data
- **Publication**: Release of finalized content to Event Hub
