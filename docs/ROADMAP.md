# MSR Event Hub - Project Roadmap & Phase Completion Guide

**Version**: 2.1  
**Last Updated**: January 15, 2026  
**Project Lead**: MSR Platform Team  
**Status**: India MVP (Jan 24) → Phase 2 (Mar 3) → Phase 3-4 (Apr-Jun)

---

## Executive Snapshot
- Overall: Backend 100%, AI/Data Integration ~40%; infrastructure complete, experimentation underway
- Next launches: India MVP Jan 24; Phase 2 Mar 3; Phase 3-4 Apr-Jun
- Go/No-Go (MVP): refusal telemetry live in code, compliance workstreams in flight, accessibility & security reviews started, p99 latency <2s, stability test 1000 conc @2 rps/30m
- Top blockers: Accessibility audit, Security review, compliance sign-offs (RAI, HR Legal, DPIA)
- Top risks: Compliance schedule slip; telemetry wiring not validated; RRS data access delay

## What Changed This Week
- Added new 1DS events: ai_edit_action, ai_content_refusal, rate_limit_exceeded, connection_initiated, bookmark_action, event_visit, admin_action, content_submission, cross_event_interaction
- Updated roadmap statuses to reflect code-complete telemetry and pending wiring/dashboard work
- Remaining work for these events: wire from handlers/UI, validate in staging 1DS, add Kusto/AI dashboards

## Phase 1: India MVP (Jan 24)
- Scope: Minimal chat discovery (15 actions), streaming responses, DOSA fail-closed, basic telemetry for refusal/edit, functional bookmark stub
- Critical path: Accessibility + Security reviews; refusal/edit/connection/bookmark events wired; staging validation of telemetry; monitoring plan documented
- Deliverables:
  - Telemetry wiring: refusal paths, edit/accept flows, bookmark actions, connections/leads, pre/post event visits
  - Staging validation: ai_content_refusal, ai_edit_action, rate_limit_exceeded, event_visit, connection_initiated
  - Lightweight dashboards/queries: refusal rate, edit %, pre/post visits, connections
- Go/No-Go checklist:
  - [ ] Telemetry wired and emitting in staging
  - [ ] Accessibility audit in progress
  - [ ] Security review in progress, no P0/P1
  - [ ] Compliance workstreams started (RAI, HR Legal, DPIA)
  - [ ] Backend p99 <2s; stability test 1000 conc @2 rps for 30m
- Success metrics: Launch on time; 100% refusals logged; 99.5% uptime; p99 <2s; 40%+ pre-event user adoption

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
