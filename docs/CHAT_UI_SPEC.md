# MSR Event Hub Chat UI Specification

**Status**: Production | **Version**: 1.0 | **Last Updated**: January 15, 2026

Complete specification for the MSR Event Hub conversational assistant, covering conversational design, UI layouts, Adaptive Card templates, accessibility standards, and error handling across all four deployment phases.

---

## Contents

1. [Overview](#overview)
2. [Global Requirements](#global-requirements)
3. [BRD Actions & Requirements](#brd-actions--requirements)
4. [Phase 1: India MVP (Jan 24)](#phase-1-india-mvp-jan-24)
5. [Phase 2: Multi-Event & PKA Draft (Mar 3)](#phase-2-multi-event--pka-draft-mar-3)
6. [Phase 3–4: Cross-Event & Recommendations (Apr–Jun)](#phase-34-cross-event--recommendations-aprjun)
7. [Error Handling & Human Escalation](#error-handling--human-escalation)
8. [Adaptive Card Templates](#adaptive-card-templates)
9. [Accessibility Standards](#accessibility-standards)

---

## Overview

This specification defines:
- **Conversational requirements** (system prompts, menu items, intents, copy) for each phase
- **UI surface expectations** (Adaptive Card layouts, button labels, accessibility metadata)
- **7 primary card templates** with features, accessibility details, and implementation notes
- **Error handling** and human escalation flows
- **Build-time validation** rules for all card assets

**Scope**: Internal MSR events only. Respect event/role context. Do not surface PII beyond published contact information.

---

## Global Requirements

### Tone & Voice
- Concise, action-first, neutral tone
- Always cite the page/section when referencing site data
- Cap responses to ~90 words unless providing lists or detailed information

### Safety & Governance
- **DOSA** (Deterministic Outcome, Safety-bound Action): Fail-closed on safety/compliance triggers. Emit `ai_content_refusal` telemetry. Do not regenerate without new user input.
- **PKA** (Potential Knowledge Assessment): Draft-only guidance only. Never auto-approve. Always include disclaimer and cite source fields.
- Refuse when data is missing or user is out of scope

### Accessibility (WCAG 2.1 AA)
- Provide `aria-label` and `aria-description` on all buttons and inputs
- Ensure color contrast ≥ 4.5:1
- Support keyboard focus order (Tab navigation)
- Include text alternatives for all icons

### Telemetry
Emit telemetry on each user interaction:
- Refusal events, edit/accept events, bookmark events, connection events, visit events
- Error tracking (rate limit, DOSA, timeout, human escalation)

---

## BRD Actions & Requirements

### MVP Feature Matrix (15 Core Chat Actions)

The MVP chat experience supports 15 primary actions, enumerated below by phase and audience (organizers, presenters, attendees). All are discoverable via quick-action buttons, menu items, or natural language intents.

#### Phase 1: India MVP (Jan 24) — 15 Core Actions

| # | Action | Category | Description |
|---|--------|----------|-------------|
| 1 | View today's agenda | Browse & Discover | List today's sessions by time, location, track; show current session |
| 2 | Browse all sessions | Browse & Discover | Full agenda with filters (track, time, speaker); search by keyword |
| 3 | Browse poster gallery | Browse & Discover | Grid/carousel of posters with themes; filter by topic/track |
| 4 | View poster detail | Browse & Discover | Title, abstract, team, image, links (code, papers, decks, repos); QR bookmark hint |
| 5 | View session detail | Session & Poster Details | Title, abstract, speaker, time/location/duration, track, slides/paper/repo links, recording links (after event) |
| 6 | View speaker contact | Session & Poster Details | Name, title, MSR affiliation, email/contact link; optional image |
| 7 | View team contact | Session & Poster Details | List of team members with names, titles, email links, optional images |
| 8 | Access asset links | Session & Poster Details | Direct links to papers, decks, code repos, supplementary resources |
| 9 | Bookmark session/poster | Interaction & Bookmarking | Save to personal bookmarks; QR scan triggers bookmark (Phase 1 stub; persistence in Phase 2) |
| 10 | Copy session/poster link | Interaction & Bookmarking | Generate shareable URL for email/messaging |
| 11 | Download poster PDF | Interaction & Bookmarking | Download poster for reference (if available) |
| 12 | Share poster/session | Interaction & Bookmarking | Email or messaging integration to share with colleagues |
| 13 | Report an issue | Support & Navigation | Feedback form or contact link for event issues |
| 14 | Contact organizer | Support & Navigation | Link to event organizer page/email |
| 15 | Navigate to main event page | Support & Navigation | Return to home/agenda/poster hub |

---

#### Phase 2: Multi-Event & PKA Draft (Mar 3) — Extended Actions

| # | Action | Category | Description |
|---|--------|----------|-------------|
| 16 | Switch active event | Event & Bookmark Management | Select from multiple events (Project Green, Whiteboard Wednesdays); confirm context |
| 17 | View saved bookmarks | Event & Bookmark Management | List of bookmarks per event; persistent across sessions |
| 18 | Remove bookmark | Event & Bookmark Management | Unsave items from bookmark list |
| 19 | Run PKA draft check | PKA & Knowledge Synthesis | Submit project content; receive draft-only checklist (Heilmeier questions, evidence, maturity) |
| 20 | View project FAQ | PKA & Knowledge Synthesis | Agent-synthesized Q&A based on project abstract and team details |
| 21 | View project overview | PKA & Knowledge Synthesis | Agent-generated summary (2–3 paragraph structured overview) |
| 22 | Find similar projects | Multi-Event Discovery | Across events, suggest related posters/sessions by topic or team |
| 23 | Filter results to one event | Multi-Event Discovery | Scope multi-event queries back to single event |

---

#### Phase 3–4: Cross-Event & Recommendations (Apr–Jun) — Advanced Actions

| # | Action | Category | Description |
|---|--------|----------|-------------|
| 24 | Find talks on [topic] | Cross-Event Search | Search across multiple events; return top 5 with source event labels |
| 25 | Find researchers by name/affiliation | Cross-Event Search | Cross-event speaker/author lookup |
| 26 | Browse by research area | Cross-Event Search | Category-based discovery across all events |
| 27 | View engagement stats | Analytics & Recommendations | Post-event: attendance, bookmarks, repeat views per session/poster |
| 28 | Get personalized recommendations | Analytics & Recommendations | "Based on your bookmarks/interests, you might also like…" with rationale |
| 29 | Download engagement report | Analytics & Recommendations | CSV/PDF export of event stats (authorized roles only) |
| 30 | View admin dashboard | Administrator Actions | Event status, submission stats, bookmark metrics, compliance flags |
| 31 | Manage event submissions | Administrator Actions | Organizer tools: review/approve poster data, assign QRs, validate content |

---

### Supporting Features (Non-Chat)

**Before Event**
- Import Excel; assign project IDs/QRs; crawl links; plan physical placement; curate/validate data; finalize for printing
- Preview agenda/posters; express interests; generate custom guide (attendee)

**During Event**
- Live browse/search by area/title/location; scan QR to bookmark; locate projects; plan routes
- Monitor stability/usage; manage last-minute changes (organizers)
- See engagement/bookmarks in real-time (presenters)

**After Event**
- Access personalized bookmarks; revisit details/resources; share/reference projects (attendees)
- Engagement reports; archive for reuse (organizers)
- Review engagement; follow up on bookmarks/interested attendees (presenters)

---

### Success Metrics (BRD KPIs)

**MVP Launch**
- Launch on time for MSR India TAB; no P0/P1 at start
- Pre-event unique users: 40%+ of expected attendees
- Post-event unique users: 60%+ within 7 days, 50%+ within 30 days
- Connections/leads: 20%+ of bookmark/contact actions
- Platform stability: 99.5% uptime; p99 latency <2s

**Phase 2 & Beyond**
- Events onboarded: ≥2 events by Mar 3
- Chat usage increase: +50% month-over-month
- PKA draft approval rate: ≥70%
- Cross-event engagement: 30%+ of users viewing multiple events
- Compliance gates: 100% signed off by Feb 28

---

## Phase 1: India MVP (Jan 24)

### System Prompt

> "You are the MSR India event assistant. Answer using only published event pages (agenda, sessions, posters, presenters). Keep replies under 90 words. Cite the page you used. Refuse cross-event or speculative answers. If a safety/compliance filter triggers, say you cannot provide that and suggest a safer, event-scoped question. Emit refusal telemetry."

### Chat Menu (Quick Actions)

- What's on now?
- Today's agenda
- Find a poster by title
- Where is Session [name]?
- Contact options for presenters
- Report an issue

### Supported Intents

| Intent | Input | Output |
|--------|-------|--------|
| Agenda/now | "What's on now?" or "Today's agenda?" | Session title, time, location, link |
| Session lookup | "Where is [Session]?" | Location and time |
| Poster lookup | "Show poster details for [title]" | Title, team, links, QR bookmark hint |
| Presenter contact | Depends on available data | Contact link (if published) |
| Issue/report | "Report an issue" | Direct to site feedback URL |

### Refusal Copy

- "I can only answer with info published for this event."
- "I don't have that session/poster yet—try another from the agenda."
- "I can't answer that safely. Try an agenda or poster question."

### UI Surface

- **Layout**: Single column preferred; horizontal scroll for related links
- **Sections**: Header (session/poster title) → Key facts (time, location, track) → Links block → Optional summary (2–3 bullet points)
- **Container style**: Inherits theme styling

### Buttons

| Label | aria-label | Purpose |
|-------|-----------|---------|
| Open details | "Open details for [title]" | Primary action; view full details |
| Copy link | "Copy link to [title]" | Secondary action; copy shareable URL |
| Bookmark | "Bookmark this item" | Acknowledge only; no persistence in Phase 1 |

### Inputs

None. Phase 1 is read-only.

---

## Phase 2: Multi-Event & PKA Draft (Mar 3)

### System Prompt

> "You assist across multiple MSR events. Always confirm the active event; switch context only when the user names an event. Provide draft-only PKA guidance with a disclaimer. Keep answers concise and cite the source page."

**DOSA**: Same as Phase 1, fail-closed with refusal telemetry.
**PKA**: "Run draft-only PKA checklist on provided content. Never mark as approved. Always state 'Draft-only—requires human reviewer.'"

### Chat Menu (Quick Actions)

- Switch event to [Event]
- Show today for [Event]
- Save/unsave bookmark
- Run PKA draft check
- Get booking/QR link
- Contact presenter

### Supported Intents

| Intent | Behavior |
|--------|----------|
| Event switch | Confirm active event; scope future answers to that event |
| Multi-event lookup | Agendas, posters, presenters per selected event |
| Bookmark persistence | Save/unsave within event scope |
| QR/booking actions | Surface URLs; do not initiate external bookings |
| PKA draft check | Run checklist; never auto-approve |

### Required Copy

- Event context reminder: "You're viewing [Event]. Ask if you want a different event."
- PKA disclaimer: "Draft-only PKA check. Requires human reviewer approval."
- Bookmark confirm: "Saved to your bookmarks for [Event]." / "Removed from bookmarks for [Event]."

### UI Surface

- **Header**: Event badge (text label)
- **Fact grid**: time, location, track + event name
- **Links row**: session/poster link, QR link, booking link (if present)
- **Bookmark state chip**: Saved / Not saved
- **PKA checklist block**: Pass/warn flags with source fields cited

### Buttons

| Label | aria-label | Purpose |
|-------|-----------|---------|
| Open details | "Open details for [title] in [Event]" | Primary action |
| Save bookmark / Remove bookmark | "Save bookmark for [title]" | Toggle state; reflect in aria-pressed |
| Run PKA draft check | "Run draft PKA checklist for [title]" | Secondary action |

### Inputs

- Optional event selector: `aria-label="Select active event"`

---

## Phase 3–4: Cross-Event & Recommendations (Apr–Jun)

### System Prompt

> "You can summarize across multiple MSR events using only indexed, cited items. Provide top results (max 5) with sources. Refuse if data lacks citations or permissions."

**DOSA**: Continue fail-closed policy; emit refusal telemetry.
**PKA**: Still draft-only; highlight if content comes from archived events.

### Chat Menu (Quick Actions)

- Find talks on [topic] across events
- Recommendations for my interests
- Show post-event stats for [Event]
- Download engagement report (if authorized)
- Filter to one event

### Supported Intents

| Intent | Behavior |
|--------|----------|
| Cross-event discovery | Topics across events (top 5 with sources) |
| Recommendations | Based on stated interests; include rationale per item |
| Post-event follow-up | Summarize changes/engagement deltas with numbers |
| Organizer reports | Engagement trends by event (authorized roles only) |
| Multi-org awareness | Respect org/geo flags; refuse if user lacks access |

### Required Copy

- Cross-event scope notice: "Results span multiple events; filter to one event if needed."
- Recommendation lead-in: "Here are suggestions with reasons and source links."
- Archive notice: "This item is archived; details may be outdated."
- Access notice: "You don't have access to that org's data."

### UI Surface

- **Layout**: Multi-item list card with per-item blocks (Title, Event, Key metric/reason, Link)
- **Chart alt text**: "Engagement trend for [Event] (sparklines)"
- **Item limit**: 5 items max; include source link per item
- **Access badges**: Show "Restricted" text label when applicable

### Buttons

| Label | aria-label | Purpose |
|-------|-----------|---------|
| Open | "Open [title] from [Event]" | View item details |
| Filter to this event | "Filter results to [Event]" | Scope results |
| Download report | "Download engagement report" | Export (authorized only) |

### Inputs

- Interest chips (multi-select): `aria-label="Interest: [topic]"`
- Time range selector: `aria-label="Select time range"`

---

## Error Handling & Human Escalation

### Error Triggers

**User phrases**: "talk to a human", "human", "contact", "support", "organizer", "helpdesk", "escalate"

**System conditions**: 401/403 (auth), 404 (not found), 429 (rate limit), 5xx/timeout (backend), DOSA refusal, unsupported event scope, unknown intent

### Standardized Error Messages

| Error | Message |
|-------|---------|
| 401/403 Auth | "You need to sign in with a valid MSR account to continue." |
| 404 Not found | "I couldn't find that in [Event]. Try another title or filter." |
| 429 Rate limit | "You're sending requests too quickly. Please wait and try again." |
| 5xx/Timeout | "The service is busy or unreachable right now. Please try again shortly." |
| DOSA Refusal | "I can't provide that safely. Try an agenda, poster, or presenter question for this event." |
| Unsupported scope | "I can only answer for [Event]. Switch events to continue." |
| PKA Disclaimer | "PKA checks are draft-only and require human reviewer approval." |
| Unknown intent | "I might not support that yet. Try one of these quick actions." |

### Error Card Layout

- **Title**: Concise error summary (e.g., "Sign-in required", "Service busy")
- **Body**: One-sentence guidance; optional steps list
- **Actions**:
  - "Try again" (`aria-label="Try this action again"`)
  - "Reduce request scope" (for 429/timeouts)
  - "Switch event" (for scope issues)
  - "Open details" (when a specific item exists)
  - Human escalation options (see below)

### Human Escalation Options

Show when user asks or after 2 failed attempts:

- **Contact organizer**: Links to event organizer page/contact URL. `aria-label="Contact organizer for [Event]"`
- **Email support**: mailto: SUPPORT_EMAIL. `aria-label="Email support team"`
- **Open feedback form**: Links to SUPPORT_URL. `aria-label="Open feedback form"`

Prefer event-specific contact first; fall back to global support.

### Telemetry on Error/Escalation

- 429 → `rate_limit_exceeded` (endpoint, limitType, counts)
- DOSA → `ai_content_refusal` and `ai_governance_metric` (wasRefused=true)
- 5xx/Timeout → `ai_model_error` (if GenAI path) or `api_request` (with error fields)
- Human click → `connection_initiated` (connection_type = contact_organizer | email_support | feedback_form)

### Recovery Menu

When two consecutive failures occur, suggest:
- "What's on now?"
- "Today's agenda"
- "Find a poster by title"
- "Switch event"

---

## Adaptive Card Templates

All card templates live in `msr-event-agent-chat/data/cards/` and follow Adaptive Cards v1.5 specification. Cards include accessibility metadata, responsive layouts, and fallback text for all scenarios.

### Template 1: welcome_card_template.json

**Purpose**: Entry-point card; displays quick actions.

**Features**:
- Event branding header (Project Green 2026 / MSR Event Hub)
- 4 quick action buttons in 2x2 grid: Browse Projects, Admin Tools, Find Researcher, Today's Schedule
- Responsive layout with emphasis containers

**Accessibility**:
- Each button has `selectAction` with `title` describing action
- Text labels adjacent to icon containers (no icon-only buttons)
- Color contrast ≥ 4.5:1 (theme colors, no gradients)
- `fallbackText` summarizes card intent
- Semantic hierarchy: h1 (event), h2 (section), buttons

**Used in Phases**: 1–4

---

### Template 2: agenda_summary_card.json

**Purpose**: Display today's agenda as time/session table.

**Features**:
- 2-column layout: Time (left), Session title (right)
- Templated data: `${sessions[0].time}`, `${sessions[0].title}`
- Row-by-row entries

**Accessibility**:
- Table-like ColumnSet with header row (bold "Time" / "Session")
- `fallbackText` explains unavailable state
- Text blocks with `wrap: true` for mobile readability
- No images; semantic text hierarchy

**Used in Phases**: 1–4 (intents: "What's on now?", "Today's agenda")

---

### Template 3: project_detail_card_template.json

**Purpose**: Rich detail view for single research project.

**Features**:
- Templated fields: title, researchArea, description, teamMembers, placement, equipment, recordingStatus, targetAudience
- Sections with dividers (Team, Project Details)
- Two-column detail grid (key: value pairs)
- Action buttons: "Back to Results", "Similar Projects"

**Accessibility**:
- Large bold title (size: large, weight: bolder)
- Section headers use weight: bolder
- Key-value pairs in ColumnSet with clear alignment
- Action buttons include title with context
- `fallbackText` summarizes project

**Used in Phases**: 1–4 (intents: "view_project", "find_similar")

---

### Template 4: category_select_card_template.json

**Purpose**: Event management dashboard; system status and organizer tools.

**Features**:
- System Status table: Component (left), Status (right, with ✓ Operational)
- Organizer Tools 2x2 grid: Attendance Reports, Manage Submissions, Recording Manager, Communications
- Each tool has icon + label + description + selectAction

**Accessibility**:
- Header row (bold "Component" / "Status") for semantic clarity
- Tool containers include descriptive text below icon
- Emoji icons paired with text labels
- Status symbols (✓) followed by word description
- All selectAction buttons include title
- `fallbackText` summarizes event management status

**Used in Phases**: 2–4

---

### Template 5: project_card_template.json

**Purpose**: Rich carousel/list item for project browsing.

**Features**:
- Image carousel with 4 slides + navigation buttons (chevron toggles)
- Features section: 4-column grid (Precision, Collaborate, Innovate, App Ecosystem) with icons + text
- Specs section: Display, Sensors, Camera specs in 2-column layout
- `Action.ToggleVisibility` controls carousel navigation

**Accessibility**:
- Images have `altText` (auto-generated from ID or URL)
- FEATURES header (weight: bolder, color: Accent) marks section
- Icon + text pairs avoid icon-only UI
- Navigation buttons have `title: "Next"`
- All text blocks support `wrap: true`
- `fallbackText` describes product overview

**Used in Phases**: 1–4 (intent: "browse_all", carousel views)

---

### Template 6: project_list_card_template.json

**Purpose**: FAQ accordion pattern; collapsible Q&A.

**Features**:
- Expandable questions via `Action.ToggleVisibility`
- Icon toggle (up/down chevron) per question
- Answer blocks with nested imagery and descriptions
- Call-to-action sections with input field

**Accessibility**:
- Question text bold and clickable (Container with selectAction)
- Chevron icons paired with label toggling
- All images have `altText` (added by linter)
- Answer text fully wrapped and readable
- Input field has placeholder: "Ask your question here"
- `fallbackText` explains FAQ overview

**Used in Phases**: 2–4 (multi-event discovery, detail expansion)

---

### Template 7: session_card_template.json

**Purpose**: Timeline-based view for events/sessions.

**Features**:
- Timeline layout with vertical connectors and date nodes
- Year headers (2021, 2022)
- Per-item: date, title, image, description
- Nested info boxes with secondary actions

**Accessibility**:
- Year headers are ExtraLarge and bold
- Date labels bold and colored (weight: bolder, color: Accent)
- Timeline structure signals relationships via column layout
- Images have `altText` for non-visual users
- Info callouts styled as containers with bold titles
- Secondary text marked `isSubtle: true`
- `fallbackText` summarizes timeline scope

**Used in Phases**: 2–4 (session agenda, timeline views)

---

## Adaptive Card Validation

All cards are validated by `msr-event-agent-chat/scripts/card_lint.mjs`:

✅ Root `type` = "AdaptiveCard"  
✅ Root `version` is present  
✅ `$schema` uses HTTPS: https://adaptivecards.io/schemas/adaptive-card.json  
✅ `fallbackText` present on root  
✅ All `Image` elements have `altText` (auto-generated if missing)  
✅ `minHeight` uses string format with px units  

**Commands**:
```bash
cd msr-event-agent-chat/
npm run cards:lint        # Report issues
npm run cards:fix         # Auto-fix safe issues
```

---

## Accessibility Standards

### WCAG 2.1 Level AA (All Cards)

- **Color contrast**: ≥ 4.5:1 for text on backgrounds; theme tokens enforce
- **Image accessibility**: No images as sole content; all have `altText`
- **Focus management**: Visible focus ring on all interactive elements
- **Keyboard support**: Tab → Enter flow; no hover-only interactions
- **Language**: Concise, clear labels; no unnecessary jargon

### Adaptive Cards Structure

- **Headers**: Use `TextBlock` with `weight: "bolder"` (replaces `<h1>`, `<h2>`)
- **Tables**: Use `ColumnSet` for table-like data
- **Grouping**: Use `Container` for logical sections
- **Action labels**: Every `selectAction` or `Action.Submit` includes `title`
- **Input labels**: Pair with adjacent text; never placeholder-only
- **Icons**: Always paired with readable text (no icon-only buttons)
- **Color**: Use text labels + color (e.g., "✓ Operational" in green)
- **Responsive**: Single column on mobile; multi-column use `width: "stretch"`

---

## Card Rollout Timeline

| Phase | Timeline | New Cards | Total | Use Cases |
|-------|----------|-----------|-------|-----------|
| 1 | Jan 24 | Welcome, Agenda, Project Detail | 3 | Browse, filter, lookup |
| 2 | Mar 3 | Category Select, Project List | 5 | Event switch, PKA, bookmarks |
| 3–4 | Apr–Jun | Project Card, Session Timeline | 7 | Carousel, timeline, recs |

---

## Related Documentation

- **Analytics Reference**: [ANALYTICS_1DS_REFERENCE.md](ANALYTICS_1DS_REFERENCE.md)
- **Integration Guide**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **Roadmap**: [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)

---

**Version**: 1.0 | **Status**: Production | **Last Updated**: January 15, 2026

