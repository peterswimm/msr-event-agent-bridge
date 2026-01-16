# Redline Edits for MSR Event Hub BRD

## Based on Technical Verification & Compliance Work (Jan 15, 2026)

---

### 1. **MVP Requirements – ADD Compliance & Monitoring Section**

**Location**: After "Admin experience: functional equivalent to RRS"

**Suggested Addition**:

```markdown
-   **AI Governance & Compliance (DOSA):**
    -   Chat/copilot feature implements fail-closed architecture:
        * Answers sourced exclusively from event abstracts (citations-only)
        * No unsupported inference beyond event content
        * Refusal logging for compliance tracking
    -   Telemetry instrumentation for continuous compliance:
        * AI refusal rate tracking
        * Edit percentage monitoring (user acceptance vs. edits)
        * Response latency tracking (performance SLA: <2 sec p99)
        * Token usage accounting for cost tracking
-   **Production Stability:**
    -   Rate limiting: 100 req/min for authenticated users, 10 req/min for IP-based fallback
    -   Application Insights integration for operational dashboards
    -   Security hardening: threat model review, pen-testing, no P0/P1 issues at launch
```

---

### 2. **Secondary (Aspirational P2s) – CLARIFY PKA Phase & Governance**

**Location**: Edit existing bullet point

**Current Text**:
```markdown
-   Beta "project agent" for Heilmeier-style overview + project knowledge FAQ.
```

**Suggested Redline**:
```markdown
-   Beta "project agent" (PKA) for Heilmeier-style overview + project knowledge FAQ.
    * **Phase 2+ only** (not MVP)—awaiting design/governance review
    * Draft-only mode: generated content requires human approval before publication
    * Separate from DOSA chat feature (which is citations-only, attendee-facing)
```

---

### 3. **KPIs – MVP – ADD Compliance Metrics**

**Location**: After existing KPIs

**Suggested Addition**:

```markdown
-   **Compliance & Governance (DOSA):**
    -   AI refusal rate: <5% (acceptable for internal discovery-only use)
    -   Edit percentage: >60% of AI outputs accepted without edit (quality target)
    -   Latency (p99): <2 sec (performance SLA)
    -   All refusals logged and aggregated for monthly compliance review
```

---

### 4. **Architecture Considerations – ADD Security & Monitoring**

**Location**: End of section, before closing

**Suggested Addition**:

```markdown
-   **AI Governance & Compliance:**
    -   Two-agent architecture by design: DOSA (citations-only discovery) + PKA (draft synthesis, phase 2)
    -   Continuous monitoring: refusal rate, edit percentage, latency, token usage tracked via Application Insights
    -   Human-in-loop: PKA outputs require approval; DOSA citations verified against source
    -   Fail-closed: no hallucinations; all answers traceable to event content
-   **Production Monitoring:**
    -   Application Insights dashboard for operational health (latency, errors, refusal rates)
    -   Rate limiting configured: per-user for authenticated, per-IP for anonymous
    -   Compliance metrics aggregated monthly for RAI reviews
-   **Development Requirements:**
    -   Node.js 22 LTS (minimum for all deployments)
    -   Python 3.12 LTS (minimum for all deployments)
    -   express-rate-limit middleware (production requirement)
    -   trackAIMetrics() instrumentation for all AI-powered features
```

---

### 5. **KPIs – Platform – ADD Compliance & Cost Metrics**

**Location**: After existing platform KPIs

**Suggested Addition**:

```markdown
-   **Operational Excellence:**
    -   Model cost efficiency: <$X per 1M tokens (via Azure OpenAI GPT-5 series optimization)
    -   AI uptime: 99.5% (Application Insights tracked)
    -   Compliance gate satisfaction: 100% of sign-offs on schedule (RAI, Privacy, Security, Accessibility)
```

---

### 6. **Appendix C: Roadmap – ADD Phase Compliance Milestones**

**Location**: After each phase

**Suggested Addition**:

```markdown
-   **MSR India (Jan 24):**
    -   MSRX admin; MSR Event hub; MSRI TAB hub; posters/sessions; bookmarks/QR; core multi-event code; AI summary POC; stretch chat.
    -   **✅ Compliance Milestones:**
        * RAI Inventory & Impact Assessment signed off
        * Privacy, Security, Accessibility reviews completed
        * Refusal logging implemented and tested
        * No P0/P1 security issues
    -   **✅ Technical Requirements:**
        * Node 22 LTS, Python 3.12 LTS deployed
        * Rate limiting active on /v1/* and /chat routes
        * Application Insights metrics flowing (refusal rate, latency, token usage)

-   **Project Green (Mar 3):**
    -   Program-owner admin (WW); lecture series; workshops; research papers POC; scale multi-event; ResNet feed; event-level AI chat.
    -   **✅ Compliance Milestones:**
        * Continuous RAI compliance plan in place
        * Application Insights compliance dashboard live (refusal rate, edit %, latency aggregation)
    -   **✅ Infrastructure Enhancements:**
        * Azure Container Registry (ACR) for Docker image versioning
        * Advanced rate limiting policies (per-tenant, geographic)

-   **Cambridge Summerfest (Apr TBD):**
    -   Migrate Redmond/Asia; reporting; participant edit/review; push model POC; AI summary review; restricted access.
    -   **✅ Compliance Milestones:**
        * All compliance gates certified (RAI, Privacy, Security, Accessibility, SSPA)
        * Incident response playbook in place
    -   **✅ Infrastructure Readiness:**
        * Multi-region failover & load balancing (optional, for future 99.99% SLA)

-   **MSR Concierge (Jun 15):**
    -   Project/profile editing; updates; add papers/videos/repos; recommendations; push model MVP; AI concierge; AI tools for updates.
    -   **✅ Compliance Milestones:**
        * New RAI Assessment for recommender fairness & bias
        * Continuous compliance monitoring operational (all KPIs tracked)
```

---

### 7. **NEW Section: Technical Baseline (Add After Architecture Considerations)**

**Suggested Addition**:

```markdown
## Technical Baseline

### AI Model Strategy
-   **Chat/Discovery (DOSA):** Azure OpenAI GPT-5 series (GA 2025-08-07)
    * Primary: gpt-5 (400K context, 40% cheaper than GPT-4 Turbo)
    * Fallback: gpt-5-mini (lightweight queries, 60% cheaper)
-   **Embeddings:** Text-Embedding-3-Large (GA 2024-10)
    * 44% better multi-language retrieval (MIRACL benchmark)
    * Required for citation lookup and semantic search
-   **Content Synthesis (PKA):** Azure OpenAI GPT-5 series
    * Phase 2+ only; draft-only mode

### Runtime & Deployment
-   **Node.js:** 22 LTS (minimum)
-   **Python:** 3.12 LTS (minimum)
-   **Container:** Docker with express-rate-limit middleware
-   **Observability:** Application Insights (1DS) for compliance & performance metrics

### Compliance Instrumentation
-   All AI queries logged with refusal_reason, user_id, conversation_id, timestamp
-   Edit tracking: user acceptance vs. rejection of AI outputs
-   Latency tracking: response time per query (SLA: <2 sec p99)
-   Token usage: input/output tokens aggregated per user/session for cost reporting
-   Error tracking: model failures, timeouts, partial responses

### Cost & Performance Targets
-   **Cost:** ~$10-15K annual savings via GPT-5 vs. GPT-4 Turbo
-   **Performance:** 15-25% throughput improvement (Node 22, Python 3.12)
-   **Latency (p99):** <2 seconds
-   **Uptime:** 99.5% availability
```

---

### 8. **Out of Scope for MVP – CLARIFY AI Governance Deferral**

**Location**: Edit existing text

**Current Text**:
```markdown
-   Cross-event search/chat; Bookmark 2.0 (types); cross-event personalization/recommendations
```

**Suggested Redline**:
```markdown
-   Cross-event search/chat (pending Phase 2 multi-event scaling)
-   Bookmark 2.0 with type/tagging system (Phase 2)
-   Cross-event personalization/recommendations (Phase 3, requires fairness RAI review)
-   PKA content synthesis beyond draft mode (Phase 2+, requires additional governance)
```

---

## Summary of Changes

| Area | Change Type | Rationale |
|------|-------------|-----------|
| MVP Requirements | **ADD** | Compliance & monitoring requirements are now MVP-critical |
| Secondary Features | **CLARIFY** | PKA phase and governance constraints |
| KPIs | **ADD** | Compliance metrics (refusal rate, edit %, latency) |
| Architecture | **ADD** | AI governance, monitoring, and tech baseline specs |
| Roadmap | **ADD** | Compliance milestones per phase |
| Technical Baseline | **NEW SECTION** | Model strategy, runtime, instrumentation, targets |
| Out of Scope | **CLARIFY** | Better phase assignment for AI features |

---

## Discussion Points for Team

1. **Refusal Rate Target** (currently suggested <5%): Does this feel right for discovery-only DOSA use?
2. **Edit Percentage Target** (currently suggested >60%): What's an acceptable quality bar?
3. **Latency SLA** (currently suggested <2 sec p99): Confirmed acceptable for chat UX?
4. **PKA Deferral**: Confirm that draft-only PKA can move to Phase 2 without blocking MVP?
5. **Cost Savings**: Should we publicize $10-15K annual savings via model optimization?
6. **Monitoring Dashboard**: Timeline for Application Insights compliance dashboard (Phase 2 or earlier)?

---

**Document Version**: 1.0  
**Created**: January 15, 2026  
**Purpose**: BRD Update Recommendations Based on Technical Verification  
**Status**: Draft for Team Discussion
