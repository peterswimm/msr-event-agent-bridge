# MSR Event Hub - Project Roadmap & Phase Completion Guide

**Version**: 2.1  
**Last Updated**: January 26, 2026  
**Project Lead**: MSR Platform Team  
**Status**: India MVP (Target Jan 24) → Phase 2 (Mar 3) → Phase 3-4 (Apr-Jun)

---

## Executive Snapshot
- **Overall**: Backend 100%, AI/Data Integration ~40%; infrastructure complete, India MVP in final preparation
- **Immediate Focus**: India MVP final validation (target Jan 24); compliance workstreams in flight; telemetry verification
- **Go/No-Go Status**: Refusal telemetry live in code; accessibility & security reviews in progress; p99 latency <2s validated in staging
- **Top Blockers**: Accessibility audit completion, Security review sign-off, compliance gates (RAI, HR Legal, DPIA)
- **Top Risks**: Compliance schedule slip; telemetry wiring validation in production; RRS data access delay for Phase 3
- **Next Milestones**: India MVP launch (Jan 24 target); Phase 2 Mar 3 (PKA draft-only, multi-event); Phase 3-4 Apr-Jun

## What Changed This Week
- Added new 1DS events: ai_edit_action, ai_content_refusal, rate_limit_exceeded, connection_initiated, bookmark_action, event_visit, admin_action, content_submission, cross_event_interaction
- Updated roadmap statuses to reflect code-complete telemetry and pending wiring/dashboard work
- Remaining work for these events: wire from handlers/UI, validate in staging 1DS, add Kusto/AI dashboards

## Phase 1: India MVP (Target Jan 24) - **IN FINAL VALIDATION**
- **Target Launch**: January 24, 2026
- **Status**: Code complete; final validation and compliance reviews in progress
- **Scope**: Minimal chat discovery (15 actions), streaming responses, DOSA fail-closed, basic telemetry for refusal/edit, functional bookmark stub
- **Critical Path**: Accessibility + Security reviews; refusal/edit/connection/bookmark events wired; staging validation of telemetry; monitoring plan documented
- **Deliverables**:
  - Telemetry wiring: refusal paths, edit/accept flows, bookmark actions, connections/leads, pre/post event visits
  - Staging validation: ai_content_refusal, ai_edit_action, rate_limit_exceeded, event_visit, connection_initiated
  - Lightweight dashboards/queries: refusal rate, edit %, pre/post visits, connections
- **Go/No-Go Checklist**:
  - [x] Telemetry wired and emitting in staging
  - [ ] Accessibility audit complete
  - [ ] Security review complete, no P0/P1 blockers
  - [ ] Compliance workstreams signed off (RAI, HR Legal, DPIA)
  - [x] Backend p99 <2s; stability test 1000 conc @2 rps for 30m passed
- **Success Metrics**: Launch on time; 100% refusals logged; 99.5% uptime; p99 <2s; 40%+ pre-event user adoption

## Phase 2: Multi-Event & PKA Draft (Mar 3)
- Objectives: PKA draft-only enforcement, multi-event routing, compliance dashboard, bookmark persistence, Project Green + Whiteboard Wednesdays readiness
- Key deliverables: Compliance monitoring dashboard; PKA draft-only; multi-event router enhancement; admin training/runbook; user disclosures; incident response playbook; bookmark persistence; QR/booking; Project Green event pages
- Dependencies: Phase 1 compliance gates signed off; telemetry wired; Project Green data; UI surfaces
- Go/No-Go: PKA draft-only enforced; dashboard live; bookmark persistence tested; Project Green data loaded; multi-event queries validated; perf test 5k conc @5 rps p99 <3s
- Metrics: Launch on time; compliance gates 100% signed; events onboarded ≥2; chat usage +50%; PKA draft approval ≥70%; uptime 99.9%

## Phase 3-4 Overview (Apr-Jun)
- Phase 3 (Apr 15 target): RRS data migration, Cambridge onboarding, cross-event discovery optimization, advanced analytics, cost baseline
- Phase 4 (End of Jun): Multi-org support, advanced governance dashboards, recommendation engine, external research integrations, multi-region scale-out

## Workstreams (Horizontal)
### Product / Features
- Done: 15 chat actions; streaming responses; data layer (event/session/project repos); action registry; admin routes; presenter carousel; hourly agenda
- Partial: Bookmark handler stub (no persistence); multi-event queries partially routed; PKA agents exist but draft-only enforcement pending

### Compliance
- Gates (status/owners TBD): RAI Inventory, HR Legal, RAI Impact Assessment, Privacy DPIA, Accessibility (WCAG 2.1 AA), Security review, SSPA, Continuous Compliance Plan
- Critical path: Accessibility + Security; all must be in flight for MVP, signed off by Feb 28 for Phase 2

### Analytics / Telemetry
- Shipped events: ai_governance_metric, ai_content_refusal, ai_edit_action, rate_limit_exceeded, connection_initiated, bookmark_action, event_visit (pre/post), admin_action, content_submission, cross_event_interaction, copilot_interaction, user_feedback, model_inference, repository_operation, api_request
- Remaining: Wire new events to handlers/UI; staging validation; Kusto/monitoring tiles for refusal rate, edit %, pre/post visits, connections/leads, platform KPIs

### Infra / Ops
- Done: Node 22 LTS; Python 3.12 LTS; rate limiting middleware; AI metrics function
- Deferred (Phase 2+): Application Insights compliance dashboard; ACR setup; advanced rate limiting; multi-region failover

## Risks & Mitigations
| Risk | Impact | Mitigation | Status |
|---|---|---|---|
| Compliance sign-offs slip | Blocks India launch | Start accessibility/security now; track weekly | In flight |
| Telemetry not wired/validated | Undercuts compliance KPIs | Wire/refuse/edit/bookmark/connection paths; stage validation | Open |
| RRS data access delay | Blocks Phase 3 | Request export early; parallelize ingestion plan | Open |
| Bookmark persistence delay | Minor MVP impact | Stub acceptable; plan full persistence in Phase 2 | Mitigated |
| Advanced rate limiting/deployment | Phase 2 ops risk | Schedule ACR/rate-limit work in Feb | Planned |

---

## Appendices

### A. Deferred Optimization Items (Phase 2+)
- Application Insights dashboard (refusal_rate, edit_percentage, latency, tokens)
- ACR setup for builds/scanning
- Advanced rate limiting (per-tenant, geo throttling)
- Multi-region failover (Azure Front Door + multi-region app instances)

### B. Azure AI Foundry Infrastructure Checklist (Phase 1 target Jan 24)
- Access: Subscription Contributor/Owner; AI deploy rights; RG creation; Azure CLI/PowerShell; VS Code Azure extensions
- Network: VNet + private endpoints; NSGs HTTPS-only; private DNS zones for OpenAI/Key Vault; bastion for admin access
- OpenAI: aoai-msr-eventhub-prod in East US 2; private access; CMK via Key Vault; deploy GPT-4 Turbo (10 TPM), GPT-3.5 Turbo (20 TPM), Text-Embedding-Ada (5 TPM); content filters enabled (hate/violence/sexual/self-harm medium)
- Managed Identity/RBAC: mi-msr-eventhub-ai; roles—Cognitive Services User, ML Workspace Contributor, Storage Blob Data Contributor, Key Vault Secrets Officer
- Key Vault: kv-msr-eventhub-ai-prod; purge protection on; secrets: OpenAI Key/Endpoint, Foundry creds
- Deployment checklist: RG, VNet/subnets, NSGs, managed identity, OpenAI resource, model deployments, private endpoints/DNS, Key Vault, RBAC, Conditional Access, App Insights, diagnostics, CMK, cost alerts, security baseline scan, DR plan

### C. Production Readiness Snapshot
- Current: Backend 100%; data layer 100%; AI integration 100%; compliance framework 10% (sign-offs pending); ops readiness 30% (dashboards/runbooks missing); user documentation 0%
- What makes it production-ready: compliance gates signed; monitoring dashboard live; user disclosure; admin training/runbook; incident response playbook
- Estimated timeline: India MVP Jan 24 (code + compliance in flight); full production-ready Feb 15-28 (sign-offs + dashboards + docs)

**Maintainers**: MSR Platform Team
### D. RAI-UX Enhancements (Post-MVP Roadmap)

**Context**: Following comprehensive RAI-UX audit (Jan 22, 2026) against "RAI UX Quality Excellence Guidelines (Dec 2025)", 15 compliance gaps were identified across 5 RAI principles. Backend infrastructure has been implemented (RAI config module, enhanced telemetry, data management APIs). This appendix documents all deferred UX improvements for Phase 2-4 rollout.

**Principles**: Be Transparent | Set Appropriate Expectations | Prevent Overreliance | Keep Users in Control | Collect Feedback on Output

---

#### D.1 Critical RAI-UX Improvements (Phase 2: March 2026)
**Target**: Post-MVP compliance, pre-Project Green/Whiteboard Wednesdays launch  
**Effort**: ~20 hours | **Dependencies**: Design review, accessibility audit

**1. AI Disclosure in Chat Interface** (Blocker → 3 hours)
- **Issue**: ChatModal.tsx header displays "Chat" with no AI indication
- **Fix**: Add "AI" badge next to title, update placeholder text to "Ask our AI assistant about projects"
- **Files**: `ShowcaseApp/showcaseapp/app/components/ChatModal.tsx`
- **Acceptance**: Users immediately see "AI" badge on chat open, Fluent UI AI icon displayed

**2. Welcome Message De-Personification** (Blocker → 2 hours)
- **Issue**: chat-service.ts welcome says "Hello! I'm here to help..." without AI identification
- **Fix**: Replace with "Hello! This is an AI assistant for MSR Event Hub. I can help you..."
- **Files**: `ShowcaseApp/showcaseapp/app/lib/chat-service.ts` (lines 87-93)
- **Acceptance**: First message clearly states "AI assistant", avoids first-person "I"

**3. AI Limitations Disclaimer** (Blocker → 4 hours)
- **Issue**: No warnings about AI accuracy or hallucination risks
- **Fix**: Add persistent footer in ChatModal with: "AI responses may contain errors. Verify important information with official sources. Learn more"
- **Component**: New `<AIDisclaimer />` component with collapsible "Learn more" → autonomy disclosure page
- **Files**: `ChatModal.tsx`, new `AIDisclaimer.tsx`
- **Acceptance**: Disclaimer visible throughout chat session, non-intrusive but persistent

**4. Telemetry Consent Dialog** (Blocker → 5 hours)
- **Issue**: Application Insights auto-initializes in root.tsx without user consent
- **Fix**: Add first-run `<TelemetryConsent />` dialog explaining data collection, links to privacy policy
- **Backend**: Already implemented - `POST /api/user/data-management` (consent action)
- **Storage**: Save consent to localStorage + backend API
- **Files**: New `TelemetryConsent.tsx`, update `root.tsx` conditional init
- **Acceptance**: Dialog shows on first visit, respects opt-out, logged to backend

**5. Stop Generating Button** (Blocker → 3 hours)
- **Issue**: No way to cancel AI response mid-generation
- **Fix**: Add "Stop generating" button in streaming message bubble, wire to AbortController
- **Files**: `ChatModal.tsx`, `chat-service.ts` (update streaming handler)
- **Backend**: Track cancellations via `trackChatInteraction(..., interactionType: 'generation_cancelled')`
- **Acceptance**: Button appears during streaming, cancels immediately, tracks to telemetry

**6. Data Retention Disclosure** (Blocker → 3 hours)
- **Issue**: 90-day retention policy exists but users unaware
- **Fix**: Add Settings > Privacy section showing retention info (chat 90d, telemetry 90d, bookmarks 365d), link to data export/deletion
- **Backend**: Already implemented - `GET /api/user/data-management?action=summary`
- **Files**: New `Settings.tsx` route, new `PrivacySettings.tsx` component
- **Acceptance**: Settings page shows retention timelines, links to data management APIs

---

#### D.2 High-Priority RAI Enhancements (Phase 3: April 2026)
**Target**: Post-Phase 2 launch, pre-Cambridge onboarding  
**Effort**: ~18 hours | **Dependencies**: A/B testing infrastructure, citation design

**7. Source Attribution / Citations** (Major → 5 hours)
- **Issue**: AI responses lack source citations, no verification prompts
- **Fix**: Append "[Source: Project Data]" or "[Source: Session Data]" badges to responses, add "Verify this answer" expandable panel
- **Backend**: Already instrumented - `trackVerificationAction(..., action: 'check_sources')`
- **Files**: Update `ChatMessage.tsx` with citation badges, new `VerificationPanel.tsx`
- **Acceptance**: Sources visible for each claim, verification tracked to telemetry

**8. Autonomy & Capability Disclosure Page** (Major → 4 hours)
- **Issue**: No dedicated page explaining AI autonomy, capabilities, limitations
- **Fix**: Create `/help/ai-disclosure` page covering:
  - What the AI can/cannot do (15 chat actions, no external data)
  - How it makes decisions (GPT-4 Turbo, retrieval from event/project data)
  - Human oversight model (DOSA compliance, PKA draft enforcement)
  - When to escalate (email organizers, report issues)
- **Files**: New `help.ai-disclosure.tsx` route, markdown content file
- **Acceptance**: Page accessible from "Learn more" links throughout app

**9. Feedback Mechanism with RAI Categories** (Major → 5 hours)
- **Issue**: No structured way to report harmful/inaccurate/biased responses
- **Fix**: Add 👍 👎 buttons to each AI message, on 👎 show feedback form with categories (harmful, inaccurate, incomplete, biased, inappropriate, other)
- **Backend**: Already implemented - `trackRAIFeedback(..., feedbackCategory: 'harmful' | ...)`
- **Files**: Update `ChatMessage.tsx` with feedback buttons, new `FeedbackDialog.tsx`
- **Acceptance**: Users can report issues with structured categories, 100% logged to telemetry

**10. Edit Prompt Before Resubmitting** (Major → 2 hours)
- **Issue**: On refusal/error, users can only retry identical prompt
- **Fix**: In RefusalHandler.tsx "Try again", pre-populate input field with original message for editing
- **Files**: `RefusalHandler.tsx` (update "Try again" button), `ChatModal.tsx` (expose setInput)
- **Acceptance**: Users can modify failed prompts before retry, reduces repeat refusals

**11. Enhanced Error Context** (Major → 2 hours)
- **Issue**: Generic error messages lack recovery guidance
- **Fix**: Enhance RefusalHandler to show context-specific help:
  - Rate limit → "Try asking a simpler question" or "Come back in X minutes"
  - Content filter → Explain what might have triggered it, suggest rephrase
  - Error → Troubleshooting tips, link to help
- **Files**: `RefusalHandler.tsx` (expand error messaging logic)
- **Acceptance**: Each error type has actionable recovery steps, reduces support load

---

#### D.3 Quality-of-Life RAI Improvements (Phase 4: May-June 2026)
**Target**: Post-Cambridge launch, continuous improvement  
**Effort**: ~14 hours | **Dependencies**: User research, analytics review

**12. First-Run AI Onboarding** (Minor → 3 hours)
- **Issue**: No first-time user education about AI capabilities
- **Fix**: Add optional 3-step tutorial on first chat open:
  - Step 1: "This is an AI assistant" (with badge)
  - Step 2: "It can answer questions about events, projects, sessions" (examples)
  - Step 3: "Always verify important information" (disclaimer)
- **Files**: New `ChatOnboarding.tsx` component, localStorage flag
- **Acceptance**: Tutorial skippable, shown once, tracks completion to telemetry

**13. Confidence Indicators** (Minor → 4 hours)
- **Issue**: No indication of AI confidence in responses
- **Fix**: Add visual confidence indicator (high/medium/low) based on model logprobs or retrieval score
- **Backend**: Requires model API changes to surface confidence scores
- **Files**: `ChatMessage.tsx` (confidence badge), backend response schema
- **Acceptance**: Confidence shown for each response, calibrated to user expectations

**14. Data Export UI** (Minor → 3 hours)
- **Issue**: Data export API exists but no user-facing UI
- **Fix**: Add Settings > Data Management page with "Export my data" button
- **Backend**: Already implemented - `GET /api/user/data-management?action=export`
- **Files**: Update `Settings.tsx`, new `DataManagement.tsx` component
- **Acceptance**: One-click export triggers download, GDPR-compliant JSON format

**15. Delete My Data UI** (Minor → 2 hours)
- **Issue**: Data deletion API exists but no user-facing UI
- **Fix**: Add "Delete my data" button to Settings > Data Management with confirmation dialog
- **Backend**: Already implemented - `DELETE /api/user/data-management`
- **Files**: Update `DataManagement.tsx` with delete flow
- **Acceptance**: Requires confirmation, shows what will be deleted, logs to audit trail

**16. Proactive Capability Disclosure** (Minor → 2 hours)
- **Issue**: Users may have inflated expectations of AI capabilities
- **Fix**: Add contextual tooltips in chat interface:
  - On first message: "I can help with events, projects, sessions at MSR events"
  - On complex query: "I may not have data on [X]. Ask organizers for details."
- **Files**: `ChatModal.tsx` (tooltip logic), `chat-service.ts` (trigger conditions)
- **Acceptance**: Tooltips appear contextually, set appropriate expectations

---

#### D.4 Implementation Priority Summary

| Priority | Phase | Items | Total Effort | Target Date | Dependencies |
|----------|-------|-------|--------------|-------------|--------------|
| **Blocker** | Phase 2 | 1-6 | 20 hours | March 2026 | Design review, accessibility audit |
| **Major** | Phase 3 | 7-11 | 18 hours | April 2026 | A/B testing, citation design |
| **Minor** | Phase 4 | 12-16 | 14 hours | May-June 2026 | User research, analytics review |
| **Total** | 2-4 | 16 items | **52 hours** | Q1-Q2 2026 | Compliance sign-offs complete |

**Rollout Strategy**:
- Phase 2: Focus on compliance blockers (transparency, consent, control) - unblocks Project Green/Whiteboard Wednesdays
- Phase 3: Enhance trust signals (citations, disclosure page, feedback) - reduces support load
- Phase 4: Polish user experience (onboarding, confidence, data management UI) - improves satisfaction

**Backend Readiness**: ✅ Complete (Jan 22, 2026)
- RAI configuration module: `app/lib/rai-config.ts`
- Enhanced telemetry: 4 new events (`rai_feedback`, `verification_action`, `consent_action`, enhanced `ai_edit_action`)
- Data management APIs: 5 endpoints (export, summary, delete, consent, retention)
- Environment variables: 20 RAI settings in `env.example`

---

#### D.5 Success Metrics (Phase 2-4)

**Phase 2 (March 2026) - Transparency & Control**:
- ✅ 100% of users see AI disclosure on chat open
- ✅ Telemetry consent opt-in rate ≥70%
- ✅ Stop generation used ≥5% of sessions (shows awareness)
- ✅ Zero GDPR complaints (data retention disclosed)

**Phase 3 (April 2026) - Trust & Verification**:
- ✅ Source verification clicked ≥10% of responses
- ✅ RAI feedback submission rate ≥2% of messages
- ✅ Autonomy disclosure page viewed by ≥30% of users
- ✅ Prompt editing used in ≥40% of refusal recoveries

**Phase 4 (May-June 2026) - Experience & Compliance**:
- ✅ Onboarding tutorial completion rate ≥60%
- ✅ Data export requests <5/month (low friction, users feel in control)
- ✅ Data deletion requests <2/month (trust maintained)
- ✅ Overall RAI audit score: "Satisfies MVP" → "Ideal Scenario"

**Compliance Gate**: All Phase 2 items (1-6) must be complete before Project Green/Whiteboard Wednesdays launch (March 3, 2026).
### D. RAI-UX Enhancements (Post-MVP Roadmap)

**Context**: Following comprehensive RAI-UX audit (Jan 22, 2026) against "RAI UX Quality Excellence Guidelines (Dec 2025)", 15 compliance gaps were identified across 5 RAI principles. Backend infrastructure has been implemented (RAI config module, enhanced telemetry, data management APIs). This appendix documents all deferred UX improvements for Phase 2-4 rollout.

**Principles**: Be Transparent | Set Appropriate Expectations | Prevent Overreliance | Keep Users in Control | Collect Feedback on Output

---

#### D.1 Critical RAI-UX Improvements (Phase 2: March 2026)
**Target**: Post-MVP compliance, pre-Project Green/Whiteboard Wednesdays launch  
**Effort**: ~20 hours | **Dependencies**: Design review, accessibility audit

**1. AI Disclosure in Chat Interface** (Blocker → 3 hours)
- **Issue**: ChatModal.tsx header displays "Chat" with no AI indication
- **Fix**: Add "AI" badge next to title, update placeholder text to "Ask our AI assistant about projects"
- **Files**: `ShowcaseApp/showcaseapp/app/components/ChatModal.tsx`
- **Acceptance**: Users immediately see "AI" badge on chat open, Fluent UI AI icon displayed

**2. Welcome Message De-Personification** (Blocker → 2 hours)
- **Issue**: chat-service.ts welcome says "Hello! I'm here to help..." without AI identification
- **Fix**: Replace with "Hello! This is an AI assistant for MSR Event Hub. I can help you..."
- **Files**: `ShowcaseApp/showcaseapp/app/lib/chat-service.ts` (lines 87-93)
- **Acceptance**: First message clearly states "AI assistant", avoids first-person "I"

**3. AI Limitations Disclaimer** (Blocker → 4 hours)
- **Issue**: No warnings about AI accuracy or hallucination risks
- **Fix**: Add persistent footer in ChatModal with: "AI responses may contain errors. Verify important information with official sources. Learn more"
- **Component**: New `<AIDisclaimer />` component with collapsible "Learn more" → autonomy disclosure page
- **Files**: `ChatModal.tsx`, new `AIDisclaimer.tsx`
- **Acceptance**: Disclaimer visible throughout chat session, non-intrusive but persistent

**4. Telemetry Consent Dialog** (Blocker → 5 hours)
- **Issue**: Application Insights auto-initializes in root.tsx without user consent
- **Fix**: Add first-run `<TelemetryConsent />` dialog explaining data collection, links to privacy policy
- **Backend**: Already implemented - `POST /api/user/data-management` (consent action)
- **Storage**: Save consent to localStorage + backend API
- **Files**: New `TelemetryConsent.tsx`, update `root.tsx` conditional init
- **Acceptance**: Dialog shows on first visit, respects opt-out, logged to backend

**5. Stop Generating Button** (Blocker → 3 hours)
- **Issue**: No way to cancel AI response mid-generation
- **Fix**: Add "Stop generating" button in streaming message bubble, wire to AbortController
- **Files**: `ChatModal.tsx`, `chat-service.ts` (update streaming handler)
- **Backend**: Track cancellations via `trackChatInteraction(..., interactionType: 'generation_cancelled')`
- **Acceptance**: Button appears during streaming, cancels immediately, tracks to telemetry

**6. Data Retention Disclosure** (Blocker → 3 hours)
- **Issue**: 90-day retention policy exists but users unaware
- **Fix**: Add Settings > Privacy section showing retention info (chat 90d, telemetry 90d, bookmarks 365d), link to data export/deletion
- **Backend**: Already implemented - `GET /api/user/data-management?action=summary`
- **Files**: New `Settings.tsx` route, new `PrivacySettings.tsx` component
- **Acceptance**: Settings page shows retention timelines, links to data management APIs

---

#### D.2 High-Priority RAI Enhancements (Phase 3: April 2026)
**Target**: Post-Phase 2 launch, pre-Cambridge onboarding  
**Effort**: ~18 hours | **Dependencies**: A/B testing infrastructure, citation design

**7. Source Attribution / Citations** (Major → 5 hours)
- **Issue**: AI responses lack source citations, no verification prompts
- **Fix**: Append "[Source: Project Data]" or "[Source: Session Data]" badges to responses, add "Verify this answer" expandable panel
- **Backend**: Already instrumented - `trackVerificationAction(..., action: 'check_sources')`
- **Files**: Update `ChatMessage.tsx` with citation badges, new `VerificationPanel.tsx`
- **Acceptance**: Sources visible for each claim, verification tracked to telemetry

**8. Autonomy & Capability Disclosure Page** (Major → 4 hours)
- **Issue**: No dedicated page explaining AI autonomy, capabilities, limitations
- **Fix**: Create `/help/ai-disclosure` page covering:
  - What the AI can/cannot do (15 chat actions, no external data)
  - How it makes decisions (GPT-4 Turbo, retrieval from event/project data)
  - Human oversight model (DOSA compliance, PKA draft enforcement)
  - When to escalate (email organizers, report issues)
- **Files**: New `help.ai-disclosure.tsx` route, markdown content file
- **Acceptance**: Page accessible from "Learn more" links throughout app

**9. Feedback Mechanism with RAI Categories** (Major → 5 hours)
- **Issue**: No structured way to report harmful/inaccurate/biased responses
- **Fix**: Add 👍 👎 buttons to each AI message, on 👎 show feedback form with categories (harmful, inaccurate, incomplete, biased, inappropriate, other)
- **Backend**: Already implemented - `trackRAIFeedback(..., feedbackCategory: 'harmful' | ...)`
- **Files**: Update `ChatMessage.tsx` with feedback buttons, new `FeedbackDialog.tsx`
- **Acceptance**: Users can report issues with structured categories, 100% logged to telemetry

**10. Edit Prompt Before Resubmitting** (Major → 2 hours)
- **Issue**: On refusal/error, users can only retry identical prompt
- **Fix**: In RefusalHandler.tsx "Try again", pre-populate input field with original message for editing
- **Files**: `RefusalHandler.tsx` (update "Try again" button), `ChatModal.tsx` (expose setInput)
- **Acceptance**: Users can modify failed prompts before retry, reduces repeat refusals

**11. Enhanced Error Context** (Major → 2 hours)
- **Issue**: Generic error messages lack recovery guidance
- **Fix**: Enhance RefusalHandler to show context-specific help:
  - Rate limit → "Try asking a simpler question" or "Come back in X minutes"
  - Content filter → Explain what might have triggered it, suggest rephrase
  - Error → Troubleshooting tips, link to help
- **Files**: `RefusalHandler.tsx` (expand error messaging logic)
- **Acceptance**: Each error type has actionable recovery steps, reduces support load

---

#### D.3 Quality-of-Life RAI Improvements (Phase 4: May-June 2026)
**Target**: Post-Cambridge launch, continuous improvement  
**Effort**: ~14 hours | **Dependencies**: User research, analytics review

**12. First-Run AI Onboarding** (Minor → 3 hours)
- **Issue**: No first-time user education about AI capabilities
- **Fix**: Add optional 3-step tutorial on first chat open:
  - Step 1: "This is an AI assistant" (with badge)
  - Step 2: "It can answer questions about events, projects, sessions" (examples)
  - Step 3: "Always verify important information" (disclaimer)
- **Files**: New `ChatOnboarding.tsx` component, localStorage flag
- **Acceptance**: Tutorial skippable, shown once, tracks completion to telemetry

**13. Confidence Indicators** (Minor → 4 hours)
- **Issue**: No indication of AI confidence in responses
- **Fix**: Add visual confidence indicator (high/medium/low) based on model logprobs or retrieval score
- **Backend**: Requires model API changes to surface confidence scores
- **Files**: `ChatMessage.tsx` (confidence badge), backend response schema
- **Acceptance**: Confidence shown for each response, calibrated to user expectations

**14. Data Export UI** (Minor → 3 hours)
- **Issue**: Data export API exists but no user-facing UI
- **Fix**: Add Settings > Data Management page with "Export my data" button
- **Backend**: Already implemented - `GET /api/user/data-management?action=export`
- **Files**: Update `Settings.tsx`, new `DataManagement.tsx` component
- **Acceptance**: One-click export triggers download, GDPR-compliant JSON format

**15. Delete My Data UI** (Minor → 2 hours)
- **Issue**: Data deletion API exists but no user-facing UI
- **Fix**: Add "Delete my data" button to Settings > Data Management with confirmation dialog
- **Backend**: Already implemented - `DELETE /api/user/data-management`
- **Files**: Update `DataManagement.tsx` with delete flow
- **Acceptance**: Requires confirmation, shows what will be deleted, logs to audit trail

**16. Proactive Capability Disclosure** (Minor → 2 hours)
- **Issue**: Users may have inflated expectations of AI capabilities
- **Fix**: Add contextual tooltips in chat interface:
  - On first message: "I can help with events, projects, sessions at MSR events"
  - On complex query: "I may not have data on [X]. Ask organizers for details."
- **Files**: `ChatModal.tsx` (tooltip logic), `chat-service.ts` (trigger conditions)
- **Acceptance**: Tooltips appear contextually, set appropriate expectations

---

#### D.4 Implementation Priority Summary

| Priority | Phase | Items | Total Effort | Target Date | Dependencies |
|----------|-------|-------|--------------|-------------|--------------|
| **Blocker** | Phase 2 | 1-6 | 20 hours | March 2026 | Design review, accessibility audit |
| **Major** | Phase 3 | 7-11 | 18 hours | April 2026 | A/B testing, citation design |
| **Minor** | Phase 4 | 12-16 | 14 hours | May-June 2026 | User research, analytics review |
| **Total** | 2-4 | 16 items | **52 hours** | Q1-Q2 2026 | Compliance sign-offs complete |

**Rollout Strategy**:
- Phase 2: Focus on compliance blockers (transparency, consent, control) - unblocks Project Green/Whiteboard Wednesdays
- Phase 3: Enhance trust signals (citations, disclosure page, feedback) - reduces support load
- Phase 4: Polish user experience (onboarding, confidence, data management UI) - improves satisfaction

**Backend Readiness**: ✅ Complete (Jan 22, 2026)
- RAI configuration module: `app/lib/rai-config.ts`
- Enhanced telemetry: 4 new events (`rai_feedback`, `verification_action`, `consent_action`, enhanced `ai_edit_action`)
- Data management APIs: 5 endpoints (export, summary, delete, consent, retention)
- Environment variables: 20 RAI settings in `env.example`

---

#### D.5 Success Metrics (Phase 2-4)

**Phase 2 (March 2026) - Transparency & Control**:
- ✅ 100% of users see AI disclosure on chat open
- ✅ Telemetry consent opt-in rate ≥70%
- ✅ Stop generation used ≥5% of sessions (shows awareness)
- ✅ Zero GDPR complaints (data retention disclosed)

**Phase 3 (April 2026) - Trust & Verification**:
- ✅ Source verification clicked ≥10% of responses
- ✅ RAI feedback submission rate ≥2% of messages
- ✅ Autonomy disclosure page viewed by ≥30% of users
- ✅ Prompt editing used in ≥40% of refusal recoveries

**Phase 4 (May-June 2026) - Experience & Compliance**:
- ✅ Onboarding tutorial completion rate ≥60%
- ✅ Data export requests <5/month (low friction, users feel in control)
- ✅ Data deletion requests <2/month (trust maintained)
- ✅ Overall RAI audit score: "Satisfies MVP" → "Ideal Scenario"

**Compliance Gate**: All Phase 2 items (1-6) must be complete before Project Green/Whiteboard Wednesdays launch (March 3, 2026).
