# MSR Event Hub - Project Roadmap

**Version**: 1.0  
**Last Updated**: January 12, 2026  
**Project Lead**: MSR Platform Team  
**Status**: In Development

---

## � Current Project Status

**Overall Completion**: 🟡 **Backend 100% | AI/Data Integration 40%** (Infrastructure complete, entering experimentation phase)

### Status by Component

| Component | Status | Completion | Notes |
| --- | --- | --- | --- |
| **Backend API** | ✅ COMPLETE | 100% | FastAPI, all routes implemented |
| **API Gateway** | ✅ COMPLETE | 100% | Auth, RBAC, CMK encryption ready |
| **Databases** | ✅ COMPLETE | 100% | PostgreSQL, Neo4j, Redis deployed |
| **Authentication** | ✅ COMPLETE | 100% | JWT, Microsoft Entra integrated |
| **CMK Encryption** | ✅ COMPLETE | 100% | Azure Key Vault configured |
| **Services/Agents** | ✅ COMPLETE | 100% | Knowledge extraction, chat, routing |
| **Azure Foundry Integration** | ✅ COMPLETE | 100% | Agent Framework, streaming, auth ready |
| **Documentation** | ✅ COMPLETE | 100% | 11 comprehensive guides created |
| **Frontend** | ⏳ EXTERNAL | N/A | Separate repository (not in scope) |
| **AI Experimentation** | 🟡 STARTING | 10% | Need Foundry access + RRS data |
| **RRS Data Integration** | ⏳ BLOCKED | 0% | Awaiting data access |
| **QR/Booking** | ⏳ PLANNED | 0% | Phase 2 feature |
| **Integration Testing** | 🟡 READY | 60% | Need test data to complete |
| **Security Testing** | ⏳ PLANNED | 0% | Scheduled for Week 3 |

**Key Achievements This Phase**:
- ✅ Full backend infrastructure production-ready
- ✅ Azure Foundry + Agent Framework integrated
- ✅ 3 knowledge extraction agents (Paper, Talk, Repo)
- ✅ Multi-agent workflows (Sequential, Group Chat)
- ✅ Streaming response architecture complete
- ✅ Multi-database architecture (SQL, Graph, Cache)
- ✅ RBAC framework with 6 roles
- ✅ Comprehensive documentation (11 files)

**Current Focus** (Weeks 1-2: Resource Access & Experimentation):
1. 🔑 **Obtain Azure Foundry project access** & credentials (Est: 2-3 days)
2. 🔑 **Get RRS event data** export (CSV/Excel) (Est: 1-2 days)
3. 🧪 **Run AI experiments**: summarization, chat, recommendations (Est: 3-4 days)
4. 📊 **Measure metrics**: cost, latency, quality (Est: 2 days)
5. 📝 **Document findings** and AI strategy recommendations (Est: 1 day)
6. ✅ **Load RRS test data** into dev environment (Est: 1 day)

**Blocking Items** (MVP Launch):
- ⏳ **Compliance Sign-Offs** (CRITICAL):
  - RAI Inventory registration for DOSA agent
  - HR Legal Review (internal AI usage)
  - RAI Impact Assessment (fail-closed, citation-first design)
  - Privacy DPIA (employee data, bookmarks, telemetry)
  - Accessibility audit (WCAG 2.1 AA for chat, agenda, posters)
  - Security review & threat model sign-off
  - Continuous compliance monitoring plan
  - *Reference:* [Compliance.md Pre-Launch Checklist](../compliance.md#pre-launch-checklist-mvp--msr-india-tab)
- ⏳ **Frontend & Admin UI** (CRITICAL):
  - React event pages (home, about, agenda, posters)
  - Admin dashboard for organizer tools (import, curation, validation)
  - QR code integration (generation + attendee scanning)
  - Bookmarking UI
- ⏳ **AI Governance Enforcement** (CRITICAL FOR RESPONSIBLE AI):
  - Implement DOSA fail-closed contract (citations required, no inference)
  - Block PKA outputs from attendee surfaces (Phase 2+)
  - Add refusal tracking & edit logging (compliance metrics)
  - Reference: [BRD Engineering - Section 5](../MSR%20Event%20Hub%20BRD%20Engineering.md#5-ai-governance--safety-compliance-mapped)
- Azure Foundry project endpoint and credentials
- RRS data export (event, sessions, posters, papers)
- Decision on AI features: DOSA (MVP, discovery-only) vs PKA (Phase 2+, draft-only synthesis)

---

## ☁️ Azure AI Foundry Infrastructure Requirements

Based on [Azure AI Foundry Resource Management Guide](https://internal.microsoft.com/azure-ai-foundry-guide), the following infrastructure and configuration requirements must be completed to support AI capabilities across all phases.

### Prerequisites & Access Requirements

#### Azure Subscription Access
**Required Permissions:**
- ✅ Contributor or Owner role on target subscription
- ✅ Azure AI services deployment permissions
- ✅ Resource group creation/modification rights
- ✅ Azure CLI (latest version) installed
- ✅ Azure PowerShell module installed
- ✅ Visual Studio Code with Azure extensions
- ✅ Git for configuration management

#### Microsoft Entra ID Permissions
**Required Capabilities:**
- ✅ Application registration permissions
- ✅ Service principal creation rights
- ✅ Role assignment capabilities
- ✅ Conditional Access Policy configuration (Zero Trust)
- ✅ Privileged Identity Management (PIM) access

### Azure AI Foundry Setup (Phase 1 - Due Jan 22, 2026)

**Resource Group & Naming Convention:**
```
Resource Group:    rg-msr-event-hub-ai-prod
Location:          East US 2 (ensures OpenAI availability)
Environment Tag:   Production
Owner Tag:         MSR Platform Team
```

**Azure AI Foundry Hub (Standard SKU):**
- ✅ Hub Name: `aih-msr-eventhub-prod`
- ✅ Network Access: **Disabled** (private endpoint required, Zero Trust)
- ✅ Public Network Access: Disabled
- ✅ Virtual Network Integration: Required
- ✅ Private Endpoint: Configured for all connections

**Network Configuration (Zero Trust Implementation):**
- ✅ Virtual Network: `vnet-msr-eventhub-ai` (10.10.0.0/16)
- ✅ Subnet: `snet-ai-foundry` (10.10.1.0/24)
- ✅ Private Endpoints: All resources exposed via private endpoints only
- ✅ Network Security Groups: HTTPS-only (443) with explicit deny-all default
- ✅ Private DNS Zones: Configured for all services

### Azure OpenAI Integration (Phase 1 - Due Jan 22, 2026)

**Azure OpenAI Service Resource:**
```
Service Name:      aoai-msr-eventhub-prod
Location:          East US 2
SKU:               S0 (Standard)
Custom Domain:     aoai-msr-eventhub-prod
Public Access:     Disabled
Network Access:    Private Endpoints Only
Encryption:        Customer-Managed Keys (CMK) via Key Vault
```

**Required Model Deployments:**

| Model | Deployment Name | Version | Scale | Purpose | Capacity |
|-------|---|---|---|---|---|
| **GPT-4 Turbo** | gpt-4-turbo | turbo-2024-04-09 | Standard | DOSA discovery, PKA synthesis | 10 TPM |
| **GPT-3.5 Turbo** | gpt-35-turbo | 0125 | Standard | Cost-effective queries, embeddings generation | 20 TPM |
| **Text-Embedding-Ada-002** | text-embedding-ada | 2 | Standard | Semantic search, vector similarity | 5 TPM |

**Content Filters (All Models):**
- ✅ Hate: Enabled (severity: Medium)
- ✅ Violence: Enabled (severity: Medium)
- ✅ Sexual: Enabled (severity: Medium)
- ✅ Self-Harm: Enabled (severity: Medium)
- ✅ Applied to both prompt and completion filters

### Access Control & Identity Management (Phase 1 - Due Jan 22, 2026)

**Managed Identity Configuration:**
```
Managed Identity Name:    mi-msr-eventhub-ai
Type:                     User-Assigned
Purpose:                  Service-to-service authentication
```

**Required RBAC Role Assignments:**
| Role | Scope | Justification |
|---|---|---|
| **Cognitive Services User** | OpenAI service | Access to LLM APIs |
| **Machine Learning Workspace Contributor** | AI Foundry Hub | Model management and deployment |
| **Storage Blob Data Contributor** | Storage account | Model artifacts and training data |
| **Key Vault Secrets Officer** | Key Vault | Credential retrieval for services |

**Service Principal Setup:**
- ✅ App Registration: `DPXE-MSR-Event-Hub-AI`
- ✅ Service Principal created with above RBAC roles
- ✅ Federated credentials configured for CI/CD pipelines
- ✅ Certificate-based authentication (not shared keys)

**Key Vault Configuration:**
```
Key Vault Name:    kv-msr-eventhub-ai-prod
Location:          East US 2
Purge Protection:  Enabled
Soft Delete:       Enabled (90 days)
Encryption:        CMK supported
```

**Stored Secrets (Phase 1):**
- ✅ `OpenAI-Key`: Azure OpenAI API key
- ✅ `OpenAI-Endpoint`: Azure OpenAI service endpoint
- ✅ `Foundation-Models-Key`: Foundry API credentials (if applicable)
- ✅ Access policies configured for managed identity & service principal

### Zero Trust Security Implementation (Phase 1 - Due Jan 22, 2026)

**Network Security:**
- ✅ Private Endpoints: All resources (OpenAI, Key Vault, Storage) behind private endpoints
- ✅ Private DNS Zones: `privatelink.openai.azure.com`, `privatelink.vaultcore.azure.net`
- ✅ Network Security Groups:
  - Inbound: HTTPS (443) from VirtualNetwork only
  - Outbound: Allow to Azure services and private endpoints
  - Default: Deny All
- ✅ Bastion Host: For secure administrative access if needed

**Identity & Access:**
- ✅ Conditional Access Policies:
  - Require MFA for all Azure portal access
  - Device compliance required
  - Block access from untrusted locations
  - Require location: Corporate network or approved VPN
- ✅ Privileged Identity Management (PIM):
  - Activate roles on-demand with approval
  - 8-hour activation windows
  - Audit all privileged access
- ✅ Role-Based Access Control (RBAC):
  - Least privilege assignments
  - Regular access reviews (quarterly)
  - No standing admin roles except emergency break-glass

**Data Protection:**
- ✅ Encryption at Rest: Customer-Managed Keys (CMK) from Key Vault
- ✅ Encryption in Transit: TLS 1.2+ for all connections
- ✅ Data Loss Prevention:
  - Prevent PII/sensitive data in training data
  - Monitor model outputs for data leakage
  - Audit logs for all data access
- ✅ Secrets Management:
  - No hardcoded credentials
  - All secrets in Key Vault
  - Automatic rotation policies configured

### AI Model Management (Phase 2-4)

**Model Lifecycle Management:**
- ✅ Version Control: Semantic versioning (MAJOR.MINOR.PATCH)
- ✅ Model Registry: Track all models in AI Foundry
- ✅ Training Data:
  - Minimum 10 examples (recommend 100+)
  - Maximum 100 MB per file
  - Format: JSONL only
  - Compliance: No PII, no biased data
- ✅ Testing Gates:
  - Unit tests: Required
  - Integration tests: Required
  - Performance tests: Required
  - Bias tests: Required (Phase 2+ for PKA)

**Fine-Tuning Configuration (Phase 2+):**
- ✅ Fine-tune model: GPT-3.5 Turbo base
- ✅ Epochs: 3 (configurable per experiment)
- ✅ Batch size: 1 (for smaller datasets)
- ✅ Learning rate multiplier: 0.1
- ✅ Data format: JSONL with `{"prompt": "...", "completion": "..."}` structure

**Deployment Configuration:**
- ✅ Auto-scaling enabled for all models
- ✅ Scale type: Standard (token per minute)
- ✅ Health probes: `/health` endpoint every 30 seconds
- ✅ Timeout: 10 seconds
- ✅ Failure threshold: 3 consecutive failures trigger auto-healing
- ✅ Blue-green deployments for zero-downtime updates

### Monitoring, Governance & Auditing (Phase 1 - Due Feb 15, 2026)

**Application Insights Setup:**
```
Insights Name:     ai-msr-eventhub-monitoring
Workspace:         Log Analytics Workspace (la-msr-eventhub)
Retention:         30 days (configurable)
```

**Custom Metrics to Track:**
| Metric | Threshold | Alert Action | Frequency |
|--------|-----------|---|---|
| Model Inference Latency | < 2 sec (p99) | Email + Slack | Real-time |
| Token Usage Rate | Monitor daily cost | Daily report | Daily |
| Model Accuracy | > 0.85 | Alert if drops below | Weekly |
| Refusal Rate (DOSA) | < 5% | Escalate if exceeds | Daily |
| Error Rate | < 0.1% | Page on-call if exceeds | Real-time |

**Audit Logging (Compliance Required):**
- ✅ Diagnostic Settings: All logs to Log Analytics
- ✅ Categories: Audit, RequestResponse, Trace
- ✅ Retention: 90 days minimum
- ✅ Alert: On suspicious authentication failures
- ✅ Review: Monthly access reviews, quarterly security audits

**Compliance & Governance:**
- ✅ Resource Tags: Environment, Owner, CostCenter, Compliance
- ✅ Cost Alerts: Daily cost threshold monitoring
- ✅ Budget Alerts: Monthly budget caps per service
- ✅ Naming Conventions: Enforced via Azure Policy
- ✅ Encryption Status: Regular audits via Azure Security Center

### Cost Optimization & Resource Efficiency

**Recommendations:**
1. **Model Selection:**
   - Use GPT-3.5 Turbo for 90% of queries (80% cost savings vs GPT-4)
   - Reserve GPT-4 for complex reasoning tasks only
   - Implement caching for repeated queries (20-30% cost reduction)

2. **Batch Processing:**
   - Group similar requests (improves throughput 50-100%)
   - Asynchronous processing for non-real-time workloads
   - Implement request queuing to smooth usage

3. **Monitoring & Optimization:**
   - Track token usage per feature/user
   - Implement rate limiting to prevent runaway costs
   - Monthly cost reviews and optimization sprints

### Infrastructure Deployment Checklist (Phase 1)

**Due by January 24, 2026 (India MVP Launch):**

- [ ] Azure subscription access verified (Contributor role)
- [ ] Resource group created: `rg-msr-event-hub-ai-prod`
- [ ] Virtual Network configured with private subnets
- [ ] Network Security Groups deployed with proper rules
- [ ] Managed Identity created: `mi-msr-eventhub-ai`
- [ ] Azure OpenAI service deployed (`aoai-msr-eventhub-prod`)
- [ ] Model deployments completed:
  - [ ] GPT-4 Turbo (10 TPM)
  - [ ] GPT-3.5 Turbo (20 TPM)
  - [ ] Text-Embedding-Ada (5 TPM)
- [ ] Private Endpoints configured for all services
- [ ] Private DNS Zones created and linked
- [ ] Key Vault created and configured
- [ ] Secrets stored (API keys, endpoints)
- [ ] RBAC roles assigned to managed identity
- [ ] Conditional Access policies configured
- [ ] Application Insights deployed
- [ ] Diagnostic settings enabled
- [ ] CMK encryption enabled where applicable
- [ ] Cost alerts configured
- [ ] Security baseline scan passed (Azure Security Center)
- [ ] Backup/disaster recovery plan documented

**Reference Documentation:**
- [Azure AI Foundry Resource Management Guide](https://internal.microsoft.com/azure-ai-foundry-guide)
- [Azure Zero Trust Security Architecture](https://learn.microsoft.com/azure/security/fundamentals/zero-trust)
- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)

---

## 🗓️ Project Phases — Reality-Based Roadmap

**Source of Truth**: [PHASE_3_4_COMPLETION.md](./PHASE_3_4_COMPLETION.md) — tracks actual code status, compliance gaps, production readiness requirements, and effort estimates.

This roadmap maps **what code needs to ship and by when** to hit the BRD vision across four phases (Jan-Jun 2026).

---

### Phase 1: MVP - MSR India TAB
**Timeline**: Jan 16 - Jan 24, 2026 (9 days to launch)  
**Target Launch**: Late January 2026  
**Scope**: Minimal viable chat discovery for India event; compliance gates in flight

#### Phase 1: What's Done ✅

| Component | Status | Notes |
|---|---|---|
| **Chat Backend (15 Actions)** | ✅ COMPLETE | Browse, filter, search, navigation, experiences; all registered and working |
| **Streaming Responses** | ✅ COMPLETE | Azure OpenAI integrated; SSE working |
| **Telemetry Framework** | ✅ COMPLETE | 1DS instrumented; `track_model_inference()`, `track_user_feedback()` working |
| **Event Data Layer** | ✅ COMPLETE | Event/Session/Project repos; CRUD operations; auth enforced |
| **Action Registry System** | ✅ COMPLETE | Decorator-based handler registration; all 15 actions registered |
| **Hourly Agenda Handler** | ✅ COMPLETE | Shows session schedule with timezone support |
| **Presenter Carousel** | ✅ COMPLETE | Spotlight featured speakers |
| **Bookmark Handler (Stub)** | ⏳ FUNCTIONAL STUB | Acknowledges only; no persistence (Mike's backend scope) |
| **API Gateway** | ✅ COMPLETE | Auth, RBAC, CORS, CMK encryption |
| **Database Layer** | ✅ COMPLETE | PostgreSQL, Neo4j, Redis; all migrations done |
| **Admin Routes** | ✅ COMPLETE | Event/session/project management endpoints |
| **Authentication** | ✅ COMPLETE | Microsoft Entra, JWT, token validation |

#### Phase 1: What's Needed Before Launch 🚨

**Code Work (Peter — Due Jan 22, 2026):**
1. ✅ Add `log_refusal()` to telemetry (2-3 hrs) — *Compliance requirement*
2. ✅ Add `log_edit_event()` to telemetry (1-2 hrs) — *Compliance requirement*
3. ✅ Wire refusal logging into `chat_routes.py` (1-2 hrs) — *Testing required*
4. ✅ Test: Emit events to local 1DS endpoint (1 hr)

**Estimated Effort**: 5-8 hours. **Status**: ⏳ Ready to start immediately.

**Compliance/Process (Parallel, Not Code):**

| Item | Owner | Effort | Risk | Status |
|---|---|---|---|---|
| RAI Inventory Registration | RAI Champs | 1-2 days | 🟡 Medium (forms/approvals) | ⏳ In flight |
| RAI Impact Assessment | Peter + Compliance Lead | 3-5 days | 🟡 Medium (documentation) | ⏳ In flight |
| HR Legal Review | Legal Team | 3-5 days | 🟡 Medium (legal cycles) | ⏳ In flight |
| Privacy DPIA | Privacy Champion | 3-5 days | 🟡 Medium (data audit) | ⏳ In flight |
| Accessibility Audit (WCAG 2.1 AA) | APEX / Accessibility | 5-7 days | 🔴 HIGH (testing required) | ⏳ **CRITICAL PATH** |
| Security Review & Threat Model | Security / Azure team | 5-10 days | 🔴 HIGH (pen testing) | ⏳ **CRITICAL PATH** |
| SSPA Verification | SSPA PM | 1-2 days | 🟢 Low (Azure OpenAI = Microsoft) | ⏳ In flight |
| Continuous Compliance Plan (Draft) | Peter + Compliance | 2-3 days | 🟡 Medium (docs) | ⏳ In flight |

**Critical Path**: Accessibility audit + Security review (10-15 days) — **must start ASAP (Jan 15)**.

#### Phase 1: Go/No-Go Criteria

**Launch Blockers** (All must be true):
- [ ] Refusal logging code deployed and emitting to 1DS
- [ ] RAI Inventory entry filed and in queue for review
- [ ] HR Legal review in progress or complete
- [ ] Accessibility audit in progress (critical path item)
- [ ] Security review in progress (critical path item)
- [ ] No P0/P1 security issues
- [ ] Backend latency < 2sec (99th percentile)
- [ ] Chat stability test: 1000 concurrent users @ 2req/sec for 30 min

**Nice-to-Have** (Can defer to Feb if needed):
- All compliance gates fully signed off (can have in-progress items if timeline is tight)

#### Phase 1 Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| **Launch on time** | Jan 24, 2026 | Go-live checklist |
| **Compliance gates started** | 100% in flight | Status dashboard |
| **API uptime** | 99.5% | App Insights monitoring |
| **Chat latency (p99)** | < 2 sec | App Insights metrics |
| **Refusal logging working** | 100% of refusals logged | 1DS event audit |
| **Pre-event user adoption** | 40%+ of attendees | Azure analytics |

---

### Phase 2: Multi-Event Scaling & PKA Draft Mode
**Timeline**: Jan 25 - Mar 1, 2026 (5 weeks to launch)  
**Target Launch**: March 3, 2026  
**Scope**: Project Green + Whiteboard Wednesdays; PKA in draft-only mode; compliance gates cleared; production readiness complete

#### Phase 2: What Needs to Ship 📦

**Code Finalization (Peter & Chat Team):**

| Item | Effort | Owner | Dependency | Due Date |
|---|---|---|---|---|
| **Finalize Compliance Monitoring Dashboard** | 3-5 days | Analytics / DevOps | Refusal logging code done | Feb 5 |
| **Implement PKA Draft-Only Enforcement** | 2-3 days | Peter | Agents exist; just add blocking logic | Feb 10 |
| **Multi-Event Intent Router Enhancement** | 3-4 days | Peter | DISCOVERY-001; test cross-event queries | Feb 15 |
| **Admin Training Materials & Runbook** | 3-4 days | Product Ops | API docs complete | Feb 20 |
| **User Disclosure & Help Text** | 1-2 days | Product / UX | Chat UI ready | Feb 20 |
| **Incident Response Playbook** | 2-3 days | Security / Support | Security review complete | Feb 15 |
| **Data Retention & Deletion Policy** | 1-2 days | Privacy Champion | DPIA complete | Feb 10 |

**Estimated Effort**: 15-24 days across 3-5 people

**Frontend Integration (Mike & Frontend Team):**

| Item | Effort | Owner | Dependency | Due Date |
|---|---|---|---|---|
| **Bookmark Backend Persistence** | 5-7 days | Mike | Design finalized | Feb 15 |
| **Project Green Event Pages** | 5-7 days | Mike | Event data loaded | Feb 20 |
| **Whiteboard Wednesdays UI** | 3-5 days | Mike | Content ready | Feb 25 |
| **Admin Event Management UI** | 5-7 days | Mike | API routes ready | Feb 28 |
| **QR Code Generation & Scanning** | 3-5 days | Mike | Backend endpoints ready | Mar 1 |

**Estimated Effort**: 21-31 days across 2-3 people

**Compliance Clearance (Org-Level):**

| Item | Owner | Timeline | Critical Path? |
|---|---|---|---|
| Accessibility audit completion & sign-off | APEX / Accessibility | By Feb 10 | 🔴 YES |
| Security review completion & sign-off | Security / Azure | By Feb 10 | 🔴 YES |
| RAI Impact Assessment finalization | RAI Champs + Peter | By Feb 15 | 🟡 YES |
| Privacy DPIA finalization | Privacy Champion | By Feb 15 | 🟡 YES |
| HR Legal sign-off | Legal Team | By Feb 20 | 🟡 YES |
| All compliance gates signed off | Compliance Lead | By Feb 28 | 🔴 YES (launch blocker) |

**Critical Path**: All compliance gates must be signed off by **Feb 28** to launch Mar 3.

#### Phase 2: Go/No-Go Criteria

**Launch Blockers**:
- [ ] All Phase 1 compliance gates signed off
- [ ] PKA draft-only enforcement code working
- [ ] Compliance monitoring dashboard live
- [ ] Bookmark persistence complete and tested
- [ ] Project Green data loaded and indexed
- [ ] Multi-event queries tested and working
- [ ] Performance test: 5,000 concurrent users, 5 req/sec, p99 latency < 3 sec

#### Phase 2 Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| **Launch on time** | Mar 3, 2026 | Go-live checklist |
| **Compliance gates cleared** | 100% signed off | Compliance dashboard |
| **Events onboarded** | 2+ new events | Event admin dashboard |
| **Chat usage growth** | 50%+ of attendees | Analytics |
| **PKA draft approval rate** | 70%+ of suggestions approved | PKA metrics |
| **System uptime** | 99.9% | App Insights |

---

### Phase 3: Content Migration & Cross-Event Discovery
**Timeline**: Mar 4 - Apr 15, 2026 (6 weeks to launch)  
**Target Launch**: April 15, 2026 *(adjust per RRS data access)*  
**Scope**: Migrate Redmond Research Showcase (RRS); add Cambridge; cross-event features; full production readiness

#### Phase 3: What Needs to Ship 📦

**Data Migration (Peter + DevOps):**

| Item | Effort | Owner | Dependency | Due Date |
|---|---|---|---|---|
| **RRS Data Export & Validation** | 3-5 days | RRS team + Peter | RRS API/data access | Mar 10 |
| **Data Transformation & Mapping** | 3-5 days | Peter | RRS schema understood | Mar 15 |
| **QR Code Regeneration** | 1-2 days | Peter | Mapping complete | Mar 18 |
| **Bookmark Migration (RRS → New)** | 2-3 days | Peter | Old platform data exported | Mar 20 |
| **Validation & Testing** | 3-5 days | QA | Migration scripts ready | Mar 28 |

**Estimated Effort**: 12-20 days

**Platform Enhancements (Peter & Chat Team):**

| Item | Effort | Owner | Dependency | Due Date |
|---|---|---|---|---|
| **Cross-Event Search Indexing** | 3-5 days | Peter | All events loaded | Mar 25 |
| **Researcher Profile Editing** | 5-7 days | Peter | Schema finalized | Apr 1 |
| **Enhanced Project Synthesis (Heilmeier)** | 3-5 days | Peter | PKA working well | Apr 5 |
| **Project FAQ Auto-Generation** | 3-4 days | Peter | Content quality baseline | Apr 8 |
| **Engagement Reporting Dashboard** | 3-5 days | Analytics / DevOps | Metrics pipeline ready | Apr 10 |

**Estimated Effort**: 20-31 days across 2-3 people

**Frontend Integration (Mike & Frontend Team):**

| Item | Effort | Owner | Dependency | Due Date |
|---|---|---|---|---|
| **Cambridge Event Pages** | 5-7 days | Mike | Event data loaded | Mar 28 |
| **RRS Migration Frontend** | 3-5 days | Mike | QR codes regenerated | Apr 1 |
| **Enhanced Bookmarking UI** (types: further reading, contact me, etc.) | 3-4 days | Mike | Bookmark schema extended | Apr 5 |
| **Program Owner Analytics UI** | 5-7 days | Mike | Analytics pipeline ready | Apr 10 |
| **Push Notifications POC** | 3-5 days | Mike | Infrastructure ready | Apr 12 |

**Estimated Effort**: 24-38 days across 2-3 people

#### Phase 3: Go/No-Go Criteria

**Launch Blockers**:
- [ ] RRS migration complete and validated
- [ ] Cambridge event hub live and tested
- [ ] Cross-event search working correctly
- [ ] Researcher profile editing functional
- [ ] Engagement reporting dashboard live
- [ ] No P0/P1 data integrity issues
- [ ] Performance: 10,000 concurrent users, 10 req/sec, p99 < 4 sec

#### Phase 3 Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| **Launch on time** | Apr 15, 2026 | Go-live checklist |
| **Events onboarded** | 3+ total (RRS, Cambridge, MSIA prep) | Event dashboard |
| **RRS content migration** | 100% complete & validated | Data audit |
| **Cross-event users** | 40%+ exploring multiple events | Analytics |
| **Organizer self-service** | 85% without engineering | Support ticket volume |
| **System uptime** | 99.95% | App Insights |

---

### Phase 4: MSR Concierge & Advanced Discovery
**Timeline**: Apr 16 - Jun 14, 2026 (8 weeks to launch)  
**Target Launch**: June 15, 2026  
**Scope**: Personalized AI concierge; researcher profiles; content enrichment; knowledge graph; full platform maturity

#### Phase 4: What Needs to Ship 📦

**AI & Personalization (Peter + ML Team):**

| Item | Effort | Owner | Dependency | Due Date |
|---|---|---|---|---|
| **MSR AI Concierge Agent** | 10-15 days | Peter / ML | Phase 3 complete; advanced agents ready | May 15 |
| **Recommendation Engine MVP** | 10-15 days | ML / Analytics | User behavior data collected | May 20 |
| **Bias & Fairness Testing** | 5-7 days | RAI Champs / ML | Concierge logic finalized | May 28 |
| **Proactive Push Notifications (Full)** | 5-7 days | DevOps / Frontend | POC validated | Jun 1 |
| **AI-Assisted Content Updates** | 5-7 days | Peter | Integration patterns proven | Jun 5 |

**Estimated Effort**: 35-51 days across 3-4 people

**Content Enrichment (Peter + Data Team):**

| Item | Effort | Owner | Dependency | Due Date |
|---|---|---|---|---|
| **YouTube Talks Integration** | 5-7 days | Peter | YouTube API scoped | May 10 |
| **Academic Papers Indexing (arXiv/ACM/IEEE)** | 5-10 days | Data / Peter | APIs/feeds available | May 20 |
| **Code Repository Linking & Analysis** | 5-7 days | Peter | GitHub/GitLab APIs ready | May 28 |
| **Dataset Discovery & Linking** | 3-5 days | Data / Peter | Data source scoped | Jun 3 |
| **Knowledge Graph Entity Relationships** | 10-15 days | Peter / Data | Neo4j schema extended | Jun 8 |

**Estimated Effort**: 28-44 days across 2-3 people

**Frontend & Platform (Mike & Frontend Team):**

| Item | Effort | Owner | Dependency | Due Date |
|---|---|---|---|---|
| **Researcher Profile Self-Service** | 5-7 days | Mike | Schema finalized | May 15 |
| **Personalized Content Feed** | 5-7 days | Mike | Recommendation engine ready | May 28 |
| **Advanced Search UI** | 5-7 days | Mike | Cross-event search stable | Jun 1 |
| **Topic-Based Discovery UI** | 5-7 days | Mike | Knowledge graph ready | Jun 5 |
| **Connection Suggestion UI** | 3-5 days | Mike | Recommendation engine ready | Jun 8 |
| **Mobile App Support** (if planned) | 10-20 days | Mobile Team | Responsive design finalized | Jun 10 |

**Estimated Effort**: 38-60 days across 2-4 people

**Compliance & Monitoring (Org-Level):**

| Item | Owner | Timeline | Critical? |
|---|---|---|---|
| Concierge RAI Impact Assessment | RAI Champs | By May 31 | 🟡 YES |
| Fairness & Bias evaluation complete | RAI Champs / ML | By Jun 5 | 🟡 YES |
| Recommendation engine transparency docs | Product / ML | By Jun 8 | 🟡 YES |
| Extended continuous monitoring plan | Compliance Lead | By Jun 10 | 🟡 YES |

#### Phase 4: Go/No-Go Criteria

**Launch Blockers**:
- [ ] MSR Concierge agent passing safety testing
- [ ] Recommendation engine fairness audit complete
- [ ] Knowledge graph data quality validated
- [ ] All content integrations (YouTube, papers, repos, datasets) working
- [ ] Researcher profiles fully editable
- [ ] No P0/P1 fairness or safety issues
- [ ] Performance: 20,000 concurrent users, 20 req/sec, p99 < 5 sec

#### Phase 4 Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| **Launch on time** | Jun 15, 2026 | Go-live checklist |
| **Concierge adoption** | 60%+ of users | Analytics |
| **Recommendation acceptance rate** | 50%+ of suggestions used | Feedback metrics |
| **Cross-event engagement** | 70%+ of users exploring 2+ events | Analytics |
| **Researcher participation** | 80% updating profiles | Admin dashboard |
| **System uptime** | 99.99% | App Insights |
| **Fairness metrics** | Bias score < 0.05 across demographics | ML fairness dashboard |

---

## 📋 Critical Path Summary

**To hit BRD targets, complete these by:**

| Date | Milestone | Owner | Impact if Missed |
|---|---|---|---|
| **Jan 22, 2026** | Refusal logging code + 1DS emit working | Peter | India launch delayed |
| **Feb 10, 2026** | Accessibility + Security reviews COMPLETE | APEX + Security | India launch delayed (critical path) |
| **Feb 28, 2026** | All compliance gates SIGNED OFF | Compliance Lead | Phase 2 launch (Mar 3) delayed |
| **Mar 10, 2026** | RRS data export + validation complete | RRS team | Phase 3 launch (Apr 15) delayed 1-2 wks |
| **May 31, 2026** | Concierge RAI assessment complete | RAI Champs | Phase 4 launch (Jun 15) delayed |
| **Jun 10, 2026** | All content enrichments working | Data team | Phase 4 launch slips to Jul |

---

## 🚨 Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Compliance gates slip past Feb 28** | 🟡 Medium (process dependencies) | 🔴 Phase 2 launches late | Start all reviews NOW (Jan 15); assign dedicated compliance lead |
| **RRS data access delayed** | 🟡 Medium (org data governance) | 🔴 Phase 3 delay 4-6 weeks | Request data export immediately; have fallback test data ready |
| **Accessibility audit finds major issues** | 🟡 Medium (depends on code maturity) | 🔴 Launch blocker | Start WCAG testing NOW; budget 10-15 days for fixes |
| **Security pen testing finds P0 issues** | 🟢 Low (infrastructure is solid) | 🔴 Launch blocker | Start threat modeling NOW; pre-emptive code review |
| **Chat latency spikes with RRS migration** | 🟡 Medium (scale untested) | 🟡 Phase 3 performance issues | Load test early (Mar 15); have Redis caching strategy ready |
| **PKA generates biased suggestions** | 🟢 Low (citations-first design) | 🟡 Reputational risk | Implement fairness logging; have model drift detection ready by Phase 4 |

---

## 📊 Resource Allocation by Phase

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Total |
|---|---|---|---|---|---|
| **Peter (Chat/Backend)** | 5-8h | 15-24d | 12-20d + 20-31d | 35-51d + 28-44d | ~6-7 months FTE |
| **Mike (Frontend)** | 0h | 21-31d | 24-38d | 38-60d | ~5-6 months FTE |
| **Analytics/DevOps** | 0h | 3-5d | 3-5d | 5-10d | ~0.5 months FTE |
| **Compliance/RAI** | 2-3d (parallel) | 10-15d (parallel) | 5-7d (parallel) | 10-15d (parallel) | ~1-2 months cross-functional |
| **Security** | 5-10d (parallel) | 0d | 0d | 0d | ~1-2 weeks one-time |
| **Accessibility** | 5-7d (parallel) | 0d | 0d | 0d | ~1-2 weeks one-time |

---

## 🎯 Recommendation: What to Prioritize NOW (Jan 15-24)

1. ✅ **Refusal logging code** (5-8h) — Ship immediately; unblocks compliance
2. ✅ **Start accessibility audit** (APEX team, 5-7 days in parallel) — Critical path
3. ✅ **Start security review** (Security team, 5-10 days in parallel) — Critical path
4. ✅ **File RAI Inventory entry** (RAI Champs, 1-2 days) — First compliance gate
5. ✅ **Get RRS data export** (Jan 20-25) — Enables Phase 3 planning
6. ✅ **Load test plan** (DevOps, 2-3 days) — Prep for India peak traffic

**Do NOT wait for everything to be perfect. Launch India MVP with compliance gates in flight (not all signed off, but all workstreams started).**

---

## 🎯 Feature Delivery by Audience

### For Organizers

**Phase 1** (MSR India TAB):
- Event hub creation and management
- Content import and validation
- QR code generation
- Basic reporting (stability monitoring)

**Phase 2** (Multi-event):
- Program owner admin (WW, PG)
- Multi-event management
- Project placement planning
- Content update workflows

**Phase 3** (Cross-event):
- Engagement reporting (views, bookmarks)
- Content archival
- Access control by page/section
- Advanced analytics

**Phase 4** (Concierge):
- Cross-event content management
- Automated update workflows
- Research asset aggregation
- Advanced reporting and insights

### For Presenters

**Phase 1** (MSR India TAB):
- Submit project data (via organizer import)
- Review event placement
- Access QR codes for posters

**Phase 2** (Multi-event):
- Self-service edits to project details (Stretch)
- Upload/manage assets (decks, papers, repos)
- AI-suggested edits review
- Engagement metrics view

**Phase 3** (Cross-event):
- Presenter dashboard
- Multi-event project management
- Content review and refinement
- Cross-event visibility

**Phase 4** (Concierge):
- Researcher profile management
- Automated research asset updates
- Cross-event project promotion
- Researcher-to-researcher connections

### For Attendees

**Phase 1** (MSR India TAB):
- Event agenda browsing
- Project/poster discovery
- Session details and links
- QR code bookmarking
- Basic personalized guide
- **DOSA Discovery Chat** (MVP): Attendee-facing Q&A bot for event content exploration (fail-closed, citations required)

**Phase 2** (Multi-event):
- Lecture series browsing
- Workshop registration/discovery
- **DOSA Chat (Enhanced)**: Event-level & cross-event discovery queries
- Enhanced content preview

**Phase 3** (Cross-event):
- Cross-event search
- Enhanced bookmarking (types)
- Project recommendations (DOSA-safe ranking)
- Push notifications

**Phase 4** (Concierge):
- AI Concierge chat (cross-event, advanced discovery)
- Personalized recommendations (ML-based)
- Researcher profile discovery
- Research feed (latest papers, repos, talks)

---

## 📊 Feature Matrix by Phase

### Phase 1: MSR India TAB

| Feature | Organizer | Presenter | Attendee | Status | Notes |
|---------|-----------|-----------|----------|--------|-------|
| Event homepage | ✓ | - | ✓ | ✓ Complete | |
| Agenda (multi-day) | ✓ | - | ✓ | ✓ Complete | |
| Sessions & tracks | ✓ | - | ✓ | ✓ Complete | |
| Posters & projects | ✓ | - | ✓ | ✓ Complete | |
| QR codes | ✓ | - | ✓ | ✓ Complete | |
| Bookmarking | - | - | ✓ | ✓ Complete | |
| Admin console | ✓ | - | - | ✓ Complete | |
| Data import (Excel) | ✓ | - | - | ✓ Complete | |
| **DOSA Discovery Chat** | - | - | ✓ | 🟡 In Progress | Fail-closed, citation-required; governance enforcement pending |
| Compliance gates | ✓ | ✓ | ✓ | ⏳ CRITICAL | RAI, Legal, Privacy, Accessibility, Security sign-offs required |

### Phase 2: Multi-Event Scaling (DOSA Enhancement + PKA Introduction)

| Feature | Organizer | Presenter | Attendee | Status | Notes |
|---------|-----------|-----------|----------|--------|-------|
| Lecture series | ✓ | - | ✓ | Planned | |
| Workshops | ✓ | - | ✓ | Planned | |
| Presenter self-service | ✓ | ✓ | - | Planned (Stretch) | |
| **DOSA Chat (Enhanced)** | - | - | ✓ | Planned | Event-level & cross-event discovery (governance proven in Phase 1) |
| **PKA Synthesis (NEW)** | ✓ | ✓ | - | Planned | Draft-only, presenter-facing; blocked from attendees until approved |
| PKA approval workflow | ✓ | ✓ | - | Planned | Human review + citation audit before publishing |
| AI summaries POC | ✓ | - | ✓ | Planned | Via PKA, presenter-controlled, not auto-published |
| ResNet integration | ✓ | - | ✓ | Planned | |
| Papers integration | ✓ | ✓ | ✓ | Planned | |
| **PKA Compliance gates** | ✓ | ✓ | - | Planned | RAI fairness/bias assessment required before PKA rollout |

### Phase 3: Cross-Event (DOSA Expansion)

| Feature | Organizer | Presenter | Attendee | Status | Notes |
|---------|-----------|-----------|----------|--------|-------|
| RRS migration | ✓ | - | - | Planned | |
| Cambridge hub | ✓ | - | ✓ | Planned | |
| Access control | ✓ | - | - | Planned | |
| Program reporting | ✓ | - | - | Planned | |
| Engagement analytics | ✓ | ✓ | - | Planned | |
| **Cross-event DOSA search** | - | - | ✓ | Planned | DOSA-safe queries across events (governance proven in Phases 1-2) |
| Push notifications POC | ✓ | - | ✓ | Planned | |
| Push notifications POC | ✓ | - | ✓ | Planned |

### Phase 4: Concierge

| Feature | Organizer | Presenter | Attendee | Status |
|---------|-----------|-----------|----------|--------|
| Researcher profiles | - | ✓ | ✓ | Planned |
| AI Concierge | - | - | ✓ | Planned |
| Recommendations | - | - | ✓ | Planned |
| Cross-event analytics | ✓ | - | - | Planned |
| YouTube integration | ✓ | ✓ | ✓ | Planned |
| Papers enrichment | ✓ | ✓ | ✓ | Planned |
| Repo linking | ✓ | ✓ | ✓ | Planned |
| Knowledge graph | ✓ | ✓ | ✓ | Planned |

---

## 🏗️ Technical Architecture Evolution

### Phase 1: Foundation (✅ MOSTLY COMPLETE)

**Current Stack**:
```
Frontend (React 18 + Vite) - 🟡 IN DEVELOPMENT
    ↓
API Gateway (Express + TypeScript) - ✅ COMPLETE
    ↓
Backend Services (FastAPI) - ✅ COMPLETE
    ↓
Databases (PostgreSQL, Redis, Neo4j) - ✅ COMPLETE
    ↓
Azure Infrastructure (Key Vault, App Insights) - ✅ COMPLETE
```

**Infrastructure Components Deployed**:
- ✅ Express API gateway (port 3000) with JWT auth & CMK
- ✅ FastAPI backend services (multiple routes)
- ✅ PostgreSQL relational database
- ✅ Neo4j knowledge graph database
- ✅ Redis caching layer
- ✅ Azure Key Vault (CMK encryption)
- ✅ Application Insights (monitoring)
- ✅ Docker containerization (bridge + backend)

**Implemented Services**:
- ✅ Authentication & Authorization (RBAC)
- ✅ Event management service
- ✅ Project/poster service
- ✅ Chat/conversation service
- ✅ Knowledge extraction agents
- ✅ Query routing & intelligent dispatch
- ✅ Workflow orchestration (Celery foundation)
- ✅ Logging & correlation tracking

**What's Remaining**:
- 🟡 Frontend React application completion
- 🟡 Event-specific UI components
- 🟡 Admin dashboard UI
- 🟡 Attendee booking/discovery UI
- ⏳ Integration testing between all services

### Phase 2: Multi-Event & AI Integration

**Additions**:
- [ ] LLM Service Integration (Azure OpenAI/Foundry)
- [ ] ResNet Data Connector
- [ ] Papers API Integration
- [ ] Enhanced Caching (Redis optimization)
- [ ] Celery task queue (full implementation)

### Phase 2: Multi-Event & AI Integration
```
Add:
- LLM Service Integration (Azure OpenAI/Foundry)
- ResNet Data Connector
- Papers API Integration
- Enhanced Caching (Redis)
- Background Job Queue (Celery)
```

**New Services**:
- Knowledge extraction agents
- Content enrichment service
- Chat service (basic)
- Recommendation service (POC)

### Phase 3: Cross-Event & Advanced Features
```
Add:
- Search Service (Elasticsearch/Postgres FTS)
- Push Notification Service
- Content Migration Tools
- Advanced Analytics
- Access Control Service
```

**Enhancements**:
- Multi-event search
- Role-based content access
- Event-level analytics
- Data migration framework

### Phase 4: Knowledge Platform
```
Add:
- Knowledge Graph Database (Neo4j - already in place)
- ML Recommendation Engine
- Automated Content Indexing
- Researcher Profile Service
- Advanced AI/Copilot Features
```

**Full Stack**:
- Integrated knowledge graph
- Cross-event recommendation engine
- Automated research asset aggregation
- Advanced AI-powered discovery

---

## 📈 KPI Tracking

### MVP Success Metrics (Phase 1)

| KPI | Target | Measurement | Frequency |
|-----|--------|-------------|-----------|
| Launch on time | Day 1 of MSR India TAB | Event go-live date | One-time |
| Pre-event engagement | 60% of registered attendees | Site visits before Day 1 | Real-time |
| Post-event engagement (7d) | 40% of audience | Site visits within 7 days | Weekly |
| Post-event engagement (30d) | 30% of audience | Site visits within 30 days | Monthly |
| Extended reach | 20% from outside event geo | Geo-tagged unique users | Weekly |
| Content completeness | 100% of projects | % with required fields | Real-time |
| System stability | 99.5% uptime | Monitoring dashboard | Continuous |
| User satisfaction | 4/5 average | Post-event survey | Post-event |
| **Compliance readiness** | **100% sign-offs** | **Compliance.md checklist** | **Pre-launch** |
| **AI safety (DOSA)** | **0 unattributed claims** | **Audit logs** | **Continuous** |
| **DOSA adoption** | **10-15% of attendees** | **Usage metrics** | **Weekly** |
| **AI refusal rate** | **<5% (tracked)** | **Monitoring dashboard** | **Daily** |

### Platform Growth Metrics (Phases 2-4)

| KPI | Phase 2 Target | Phase 3 Target | Phase 4 Target |
|-----|--------|--------|--------|
| Events onboarded | 2 (PG, WW) | 3 (+ Cambridge) | 4+ (ongoing) |
| Repeat program usage | 50% | 80% | 90% |
| Organizer self-service | 60% | 80% | 90% |
| Post-event content usage (30d) | 40% | 50% | 60% |
| Cross-event engagement | 20% | 40% | 60% |
| AI feature adoption | 30% | 50% | 70% |

---

## 🚀 Launch Milestones

### Phase 1 Milestones

**✅ Completed**:
- ✅ Backend API development (FastAPI)
- ✅ API Gateway with auth (Express)
- ✅ Database schema design & setup
- ✅ RBAC framework implementation
- ✅ CMK encryption integration
- ✅ Docker containerization
- ✅ Core service integration
- ✅ Documentation & guides (11 comprehensive docs)

**🟡 In Progress (Target: Late January)**:
- 🟡 **Week 1**: Frontend React components completion
- 🟡 **Week 1-2**: Event data loading for MSR India
- 🟡 **Week 2**: Admin dashboard UI implementation
- 🟡 **Week 2**: Attendee discovery UI
- 🟡 **Week 2**: QR code generation & bookmark system

**⏳ Pre-Launch (Final Week)**:
- ⏳ End-to-end integration testing
- ⏳ Performance testing & load tests
- ⏳ Security penetration testing
- ⏳ Vulnerability scanning
- ⏳ Runbook & incident response setup
- ⏳ 24/7 support team briefing

**Launch Event**:
- [ ] **Late January 2026**: MSR India TAB event goes live
- [ ] Post-launch: Real-time monitoring and support

### Phase 2 Milestones
- [ ] **Week 1-2**: Project Green and Whiteboard Wednesdays data setup
- [ ] **Week 2-3**: Presenter self-service UI implementation
- [ ] **Week 3-4**: AI/LLM service integration
- [ ] **Week 4-5**: Papers integration and testing
- [ ] **Launch (March 3)**: Phase 2 features go live

### Phase 3 Milestones
- [ ] **Week 1**: RRS data export and schema analysis
- [ ] **Week 2-3**: Data migration scripts and testing
- [ ] **Week 3-4**: Cambridge content preparation
- [ ] **Week 4-5**: Access control implementation and testing
- [ ] **Launch (April)**: RRS migration and Cambridge launch

### Phase 4 Milestones
- [ ] **Month 1**: Researcher profile schema and UI
- [ ] **Month 1-2**: Knowledge graph expansion
- [ ] **Month 2**: AI Concierge MVP development
- [ ] **Month 2-3**: Recommendation engine implementation
- [ ] **Launch (June 15)**: Full platform launch

---

## 🔄 Dependencies & Constraints

### Technical Dependencies

**Phase 1** (Critical Path):
- ✓ Azure infrastructure provisioning
- ✓ Database setup and migrations
- ✓ Authentication framework
- ✓ API gateway with RBAC
- ✓ Frontend scaffolding

**Phase 2**:
- [ ] LLM service provisioning (Azure OpenAI or Foundry)
- [ ] ResNet API integration details
- [ ] Papers API access and schema
- [ ] Chat UI/UX design finalization

**Phase 3**:
- [ ] Search service setup (Elasticsearch or PostgreSQL FTS)
- [ ] Push notification infrastructure
- [ ] Data migration tools

**Phase 4**:
- [ ] Knowledge graph database (Neo4j - available)
- [ ] ML/recommendation infrastructure
- [ ] Advanced AI capabilities

### Organizational Dependencies

**Content Providers**:
- MSR India TAB organizers (Phase 1)
- Project Green leads (Phase 2)
- Whiteboard Wednesdays organizers (Phase 2)
- RRS organizers (Phase 3)
- Cambridge organizers (Phase 3)

**Stakeholders**:
- MSR Leadership (approval)
- Event organizers (requirements, data)
- Presenters (content submission)
- IT/Security (infrastructure, compliance)

**External Services**:
- Azure services (infrastructure)
- Microsoft Entra (authentication)
- Office 365 (optional integration - constrained)
- ResNet (research data)
- Papers APIs (academic content)

### Constraints

**Access Control**:
- ✓ @microsoft.com email only
- ✓ No external user access
- [ ] Optional Office 365 integration (requires consent)

**Content Management**:
- Large file uploads (videos, documents)
- Transcoding and streaming infrastructure
- Metadata and versioning
- User access control per file

**Data**:
- Microsoft-governed data only
- Compliance with organizational policies
- No external data sharing without approval

---

## 💼 Resource Planning

### Core Team

**Full-Stack Engineers** (4-6):
- Frontend development (React, Vite, UI/UX)
- Backend services (FastAPI, database)
- API gateway and auth (Express)
- DevOps and infrastructure

**AI/ML Engineers** (2-3):
- LLM integration (Phase 2+)
- Recommendation engine (Phase 4)
- Knowledge extraction agents

**Product & Design** (1-2):
- Product management
- UI/UX design
- User research

**DevOps/Infrastructure** (1-2):
- Azure infrastructure management
- CI/CD pipeline
- Monitoring and observability
- Security and compliance

**Data Engineering** (1):
- Data migration scripts
- ETL pipelines
- Database optimization

### Total Team Size: 9-14 people

---

## 🔐 Security & Compliance

### Phase 1 Requirements
- ✓ JWT authentication
- ✓ RBAC framework
- ✓ CMK encryption (Key Vault)
- ✓ SSL/TLS for all communications
- ✓ Azure security best practices
- ✓ Audit logging

### Phase 2 Additions
- [ ] Enhanced audit trails
- [ ] Data classification
- [ ] API rate limiting and throttling

### Phase 3 Additions
- [ ] Access control (page/section level)
- [ ] Data retention policies
- [ ] Compliance reporting

### Phase 4 Additions
- [ ] Advanced threat detection
- [ ] Encryption for PII
- [ ] Compliance audits

---

## 📊 Success Criteria

### Phase 1 Success
- ✓ Platform launches on time for MSR India TAB
- ✓ Zero P0/P1 issues at event start
- ✓ 60%+ pre-event attendance
- ✓ Content completeness (100% of projects)
- ✓ System stability (99.5% uptime)

### Phase 2 Success
- [ ] 2 additional events successfully onboarded
- [ ] AI features adopted by 30%+ of attendees
- [ ] Multi-event architecture validated
- [ ] Presenter self-service engagement 70%+

### Phase 3 Success
- [ ] RRS migration complete with 100% content
- [ ] Cambridge launch successful
- [ ] Cross-event user engagement 40%+
- [ ] Organizer self-service rate 80%+

### Phase 4 Success
- [ ] AI Concierge adoption 60%+
- [ ] Repeat program usage 90%+
- [ ] Post-event content usage 60%+ at 30 days
- [ ] Cross-event engagement 60%+

---

## ⚠️ Risks & Mitigation

### High Risk: MSR India TAB Launch Timeline

**Risk**: Delay in content preparation or technical integration  
**Impact**: Event launch delay or degraded experience  
**Mitigation**:
- Weekly sync with organizers
- Early data import and validation
- Parallel development and testing
- Contingency: Portal-based alternative

### Medium Risk: Multi-Event Architecture

**Risk**: Single-event system doesn't scale for multiple events  
**Impact**: Rework required, phase delays  
**Mitigation**:
- Architectural design review (Week 2)
- Load testing with projected volumes
- Incremental rollout of events

### Medium Risk: AI Integration Complexity

**Risk**: LLM service latency or cost overruns  
**Impact**: Delayed AI features, budget impact  
**Mitigation**:
- Early POC (Phase 1)
- Cost modeling and optimization
- Fallback to non-AI features

### Medium Risk: Data Migration (Phase 3)

**Risk**: RRS content loss or corruption during migration  
**Impact**: Loss of historical data, user frustration  
**Mitigation**:
- Parallel systems during migration
- Backup and rollback procedures
- Validation scripts and testing

### Low Risk: Authentication Integration

**Risk**: Microsoft Entra integration delays  
**Impact**: User access issues  
**Mitigation**:
- Early integration testing
- Support from identity team
- Local auth fallback (dev only)

---

## 📅 Timeline Summary

```
January 2026        March 2026          April 2026          June 2026
|                   |                   |                   |
Phase 1 Launch      Phase 2 Launch      Phase 3 Launch      Phase 4 Launch
MSR India TAB       Project Green +     RRS Migration       MSR Concierge
                    Whiteboard Wed      Cambridge           Knowledge Platform
|                   |                   |                   |
Late Jan            March 3             April (TBD)         June 15
```

---

## � Workspace Structure

### msr-event-agent-bridge (API Gateway & Orchestration)

**Status**: ✅ Production Ready

- `src/index.ts` - Main entry point with Express server
- `src/routes/` - API routes for events, knowledge, projects, health checks
- `src/middleware/` - Authentication, logging, error handling
- `src/services/` - Business logic and orchestration
- `src/types/` - TypeScript definitions
- `docs/` - 11 comprehensive documentation files
- `infra/` - Infrastructure as Code configurations
- `docker-compose.yml` & `Dockerfile` - Container setup
- `package.json` - Node.js dependencies (Express, JWT, Azure SDKs)

### msr-event-agent-chat (Backend Services)

**Status**: ✅ Production Ready (Core services) | 🟡 Frontend Integration In Progress

- `api/` - FastAPI routes (events, projects, chat, knowledge, artifacts, workflow)
- `agents/` - Knowledge extraction agents for papers, talks, repositories
- `core/` - Core services and utilities
- `knowledge_graph/` - Neo4j graph database interactions
- `storage/` - File storage and asset management
- `config/` - Configuration and settings management
- `alembic/` - Database migrations
- `docs/archive/` - Legacy documentation (preserved for reference)
- `pyproject.toml` - Python dependencies (FastAPI, Azure SDKs, Agent Framework)

---

## �📖 Related Documentation

- [Quick Start Guide](QUICK_START.md) - Development setup
- [Architecture Guide](ARCHITECTURE.md) - System design
- [API Reference](API_REFERENCE.md) - Available endpoints
- [Deployment Runbook](DEPLOYMENT_RUNBOOK.md) - Production deployment
- [RBAC Matrix](RBAC_MATRIX.md) - Permission framework

---

## 📝 Appendix: Feature Details

### Appendix A: Poster/Project Entity

**Core Fields**:
- Title, Abstract, Poster (PDF/image)
- Location, Theme/Track

**People & Contact**:
- Team (names, affiliations, roles)
- Primary contact (email/profile)

**Related Links**:
- Videos, Slide decks, Code repos, Research papers, Other links

**Knowledge Fields** (Structured):
- How organized, What's new, Evidence/examples, What comes next
- Maturity signal (exploratory → validated → pilot-ready)

### Appendix B: Session Entity

**Core Fields**:
- Title, Abstract, Session type (talk, keynote, workshop, etc.)
- Recording URL (if available)

**Event Context**:
- Event, Date/time, Duration, Location, Theme/Track

**People**:
- Speakers, Moderator, Contact

**Related Assets**:
- Slide decks, Related posters, Papers, Code repos, Links

**Knowledge Fields** (Structured):
- How structured, What's emphasized, Evidence/examples
- Key questions discussed, What comes next
- Maturity signal

### Appendix C: Events Roadmap (Program-Specific)

**Current Programs**:
- Redmond Research Showcase (RRS)
- MSR India TAB (starting Phase 1)
- Project Green (Phase 2)
- Whiteboard Wednesdays (Phase 2)
- Cambridge Research Showcase (Phase 3)
- MSR East (Phase 4, TBD)
- MSR Asia TAB (Future, pending discussions)
- Lecture series (expanding): Leaders @ Microsoft, AI & Society Fellows

---

**Version**: 1.0  
**Created**: January 12, 2026  
**Status**: Approved for Phase 1 Launch  
**Next Review**: Post-Phase 1 Launch (February 2026)
