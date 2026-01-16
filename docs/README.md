# MSR Event Hub - Documentation Index

**Platform Version**: 2.0  
**Last Updated**: January 15, 2026  
**Status**: Production Ready

Complete documentation for the MSR Event Hub platform comprising two core repositories:

-   **msr-event-agent-bridge** - TypeScript/Express API Gateway
-   **msr-event-agent-chat** - Python/FastAPI Backend

---

## Documentation Map

### Getting Started (⏱️ 30 minutes)

1.  **[Integration & Setup Guide](INTEGRATION_GUIDE.md)** - Complete setup and integration reference
    
    -   Local development setup (2-5 minutes)
    -   Making your first API calls
    -   Frontend integration patterns (React, TypeScript, custom)
    -   Azure AI Foundry infrastructure setup
    -   Deterministic vs GenAI Switchboard (how to tune, headers, telemetry)
    -   Docker Compose deployment
    -   Production configuration
    -   Troubleshooting guide
    
    ⚠️ **Legacy docs archived**: See [archive/](archive/) for earlier versions ([QUICK_START_OLD.md](archive/QUICK_START_OLD.md), [INTEGRATION_GUIDE_OLD.md](archive/INTEGRATION_GUIDE_OLD.md)).
    
2.  **[Architecture Guide](ARCHITECTURE.md)** - System design and components
    
    -   System architecture diagram
    -   Component responsibilities
    -   Data flow between services
    -   Technology stack overview
    -   Entity relationship model
    -   API endpoints by service
    -   Configuration reference
    -   Deployment options

### API, Operations & Troubleshooting

3.  **[Operations & Reference Guide](OPERATIONS_REFERENCE.md)** - Unified operations reference
    -   **Complete API Reference**: All endpoints, authentication, request/response examples
    -   **System Architecture**: Component breakdown, data models, configuration
    -   **RBAC & Authorization**: Role definitions, permission matrices, endpoint access by role
    -   **Troubleshooting Guide**: Common issues, diagnostics, solutions for auth, network, database, CMK
    -   **Production Deployment**: Infrastructure setup, application deployment, monitoring, scaling
    -   **Security**: Encryption, access control, audit logging
    -   **Monitoring**: Key metrics, Application Insights queries, alerting

### Planning & Strategy

**[Project Roadmap & Phase Completion Guide](PROJECT_ROADMAP_CONSOLIDATED.md)** - Complete timeline and phase planning

5.  -   MSR India TAB MVP (Jan 24, 2026) - status, blockers, compliance requirements
    -   Phase 1-4 timelines, deliverables, go/no-go criteria
    -   Feature tracking and implementation plans
    -   Azure AI Foundry infrastructure requirements
    -   Production readiness assessment
    -   Risk assessment and mitigation strategies
    -   Detailed success metrics by phase
6.  **[Azure AI Foundry Integration Summary](AZURE_AI_FOUNDRY_INTEGRATION_SUMMARY.md)** - Executive summary of infrastructure deliverables
    
    -   Highlights of new infrastructure documentation
    -   Phase timelines and team responsibilities
    -   Quick links to setup, roadmap, and checklist artifacts
7.  **[Azure AI Foundry Completion Report](COMPLETION_REPORT_AZURE_AI_FOUNDRY.md)** - Worklog for requirements intake
    
    -   Scope of imported requirements
    -   Mapping to roadmap and phase checkpoints
    -   Status tracking for Phase 1 readiness (Jan 24, 2026)
        -   Feature areas and KPIs
        -   Event timeline and architecture considerations
    
    12.  **[MSR Event Hub BRD (Engineering)](MSR Event Hub BRD Engineering.md)** - Engineering view of requirements
    
    -   AI governance model (DOSA vs. PKA)
    -   MVP deliverables and guardrails
    -   Operational checklists and compliance linkage
    
    13.  **[Phase 3-4 Completion Checklist](PHASE_3_4_COMPLETION.md)** - Blocking items before scale-out
    
    -   Infrastructure, security, and monitoring gates
    -   Ownership by platform, security, and observability teams
    -   Status tracking for later phases
    
    14.  **[Features & Stories Backlog](MSR_EventHub_Features and Stories.csv)** - CSV export of product backlog
    
    -   Story metadata with owners and priorities
    -   Traceability to BRD references
    -   Sprint targeting for MVP scope

## Use Case Guides

I want to...

#### Develop

→ Start with [Quick Start Guide](QUICK_START.md) then read [Architecture Guide](ARCHITECTURE.md)

#### Integrate with the API

→ Follow [API Reference](API_REFERENCE.md) and check [RBAC Matrix](RBAC_MATRIX.md) for permissions

#### Deploy to Production

→ Follow [Deployment Runbook](DEPLOYMENT_RUNBOOK.md) in sequence

#### Debug an Issue

→ Check [Troubleshooting Guide](TROUBLESHOOTING.md) for your symptom

#### Understand System Design

→ Review [Architecture Guide](ARCHITECTURE.md) for complete overview

#### Configure User Access

→ Consult [RBAC Matrix](RBAC_MATRIX.md) for roles and permissions

---

##   

## Documentation Structure

### By Role

**Software Developers**

1.  [Quick Start Guide](QUICK_START.md) - Get environment running
2.  [Architecture Guide](ARCHITECTURE.md) - Understand components
3.  [API Reference](API_REFERENCE.md) - Integrate with services
4.  [Troubleshooting Guide](TROUBLESHOOTING.md) - Debug issues

**DevOps / SRE**

1.  [Deployment Runbook](DEPLOYMENT_RUNBOOK.md) - Deploy and operate
2.  [Architecture Guide](ARCHITECTURE.md) - Infrastructure requirements
3.  [Troubleshooting Guide](TROUBLESHOOTING.md) - Incident response
4.  [RBAC Matrix](RBAC_MATRIX.md) - Security and access control

**System Architects**

1.  [Architecture Guide](ARCHITECTURE.md) - Complete system design
2.  [API Reference](API_REFERENCE.md) - Integration points
3.  [Deployment Runbook](DEPLOYMENT_RUNBOOK.md) - Scaling and HA
4.  [RBAC Matrix](RBAC_MATRIX.md) - Security design

**Security & Compliance**

1.  [Compliance Gates & Signoffs](COMPLIANCE.md) - Required approvals and ownership
2.  [RBAC Matrix](RBAC_MATRIX.md) - Access control
3.  [Azure AI Foundry Setup Guide](AZURE_AI_FOUNDRY_SETUP.md) - Governance for model infrastructure
4.  [Deployment Runbook](DEPLOYMENT_RUNBOOK.md) - Security hardening and monitoring

**Product & Program Leads**

1.  [MSR Event Hub BRD](MSR Event Hub BRD.md) - Business scope
2.  [MSR Event Hub BRD (Engineering)](MSR Event Hub BRD Engineering.md) - Engineering commitments
3.  [Project Roadmap](PROJECT_ROADMAP.md) - Phased delivery plan
4.  [Azure AI Foundry Integration Summary](AZURE_AI_FOUNDRY_INTEGRATION_SUMMARY.md) - Current-state highlights

---

## 🗂️ Repository Contents

### msr-event-agent-bridge (API Gateway)

```
├── docs/│   ├── QUICK_START.md (this location)│   ├── ARCHITECTURE.md│   ├── API_REFERENCE.md│   ├── RBAC_MATRIX.md│   ├── DEPLOYMENT_RUNBOOK.md│   ├── TROUBLESHOOTING.md│   └── archive/│       └── cmk-implementation-jan-2026/│├── src/│   ├── middleware/│   │   ├── auth.ts - JWT validation, RBAC│   │   ├── keyVaultInit.ts - CMK initialization│   │   ├── errorHandler.ts - Error normalization│   │   └── rateLimit.ts - Rate limiting│   ││   ├── services/│   │   ├── knowledge-api-client.ts - Backend proxy│   │   └── keyVaultService.ts - CMK encryption│   ││   ├── routes/│   │   ├── health.ts - Health/readiness checks│   │   ├── auth.ts - Authentication endpoints│   │   └── proxy.ts - Proxy routes to backend│   ││   ├── utils/│   │   ├── logger.ts - Structured logging│   │   └── types.ts - TypeScript interfaces│   ││   └── server.ts - Express app setup│├── tests/│   ├── integration/│   │   └── keyVaultService.test.ts│   └── unit/│       └── auth.test.ts│├── infra/│   ├── main.bicep - Azure resources (Key Vault, etc.)│   ├── main.bicepparam - Parameters│   ├── deploy-cmk.ps1 - CMK deployment script│   ├── verify-cmk-setup.ps1 - Verification│   └── enable-keyvault-diagnostics.ps1 - Monitoring│├── package.json├── tsconfig.json├── .env.example└── README.md
```

### msr-event-agent-chat (Backend)

```
├── app/│   ├── main.py - FastAPI application│   ││   ├── routes/│   │   ├── events.py - Event endpoints│   │   ├── sessions.py - Session endpoints│   │   ├── projects.py - Project endpoints│   │   ├── knowledge.py - Knowledge artifact endpoints│   │   ├── chat.py - Chat streaming│   │   └── workflows.py - Workflow execution│   ││   ├── models/│   │   ├── event.py - Event data model│   │   ├── session.py - Session model│   │   ├── project.py - Project model│   │   ├── knowledge.py - Knowledge artifact model│   │   └── chat.py - Chat message model│   ││   ├── agents/│   │   ├── paper_agent.py - Paper extraction LLM agent│   │   ├── talk_agent.py - Talk extraction agent│   │   ├── repository_agent.py - Repository extraction agent│   │   └── base_agent.py - Agent interface│   ││   ├── services/│   │   ├── knowledge_extraction.py - Extraction service│   │   ├── chat_service.py - Chat LLM service│   │   ├── database.py - Database access│   │   └── cache.py - Redis caching│   ││   ├── workflows/│   │   ├── executor.py - Workflow executor│   │   ├── iterators.py - Iteration logic│   │   ├── compilation.py - Project compilation│   │   └── approval.py - Approval workflow│   ││   ├── middleware/│   │   ├── auth.py - JWT validation│   │   └── logging.py - Request logging│   ││   └── utils/│       ├── database.py - Database utilities│       └── logging.py - Logging setup│├── tests/│   ├── integration/│   │   ├── test_knowledge_extraction.py│   │   └── test_chat.py│   └── unit/│       └── test_models.py│├── migrations/│   ├── versions/│   │   └── *.py - Alembic migrations│   └── env.py│├── requirements.txt - Python dependencies├── .env.example├── pytest.ini└── README.md
```

---

## 🔍 Quick Reference

### Common Tasks

Task

Reference

Start local development

[Quick Start](QUICK_START.md#1%EF%B8%8F%E2%83%A3-setup-2-minutes)

Get JWT token

[Quick Start](QUICK_START.md#3%EF%B8%8F%E2%83%A3-get-authentication-token-2-minutes)

List API endpoints

[API Reference](API_REFERENCE.md)

Check permissions for role

[RBAC Matrix](RBAC_MATRIX.md)

Deploy to Azure

[Deployment Runbook](DEPLOYMENT_RUNBOOK.md)

Fix authentication error

[Troubleshooting](TROUBLESHOOTING.md#401-unauthorized---invalid-token)

Scale for load

[Deployment Runbook](DEPLOYMENT_RUNBOOK.md#-scaling--load-testing)

Setup monitoring

[Deployment Runbook](DEPLOYMENT_RUNBOOK.md#phase-3-monitoring--alerting-day-2)

Understand data model

[Architecture](ARCHITECTURE.md#data-model)

Implement chat integration

[API Reference](API_REFERENCE.md#-chat)

### Key Endpoints

```
# AuthenticationPOST   /auth/token                    # Get JWT token# EventsGET    /v1/events                     # List all eventsPOST   /v1/events                     # Create eventGET    /v1/events/{id}                # Get event details# ProjectsGET    /v1/events/{eventId}/projects  # List projects in eventPOST   /v1/events/{eventId}/projects  # Create projectGET    /v1/projects/{id}              # Get project details# KnowledgeGET    /v1/projects/{id}/knowledge    # List artifactsPOST   /v1/projects/{id}/knowledge    # Add artifactPATCH  /v1/knowledge/{id}/status      # Approve/reject (reviewer only)# ChatPOST   /v1/chat                       # Send message (streaming)GET    /v1/knowledge/search           # Search knowledge# HealthGET    /health                        # Service healthGET    /ready                         # Readiness probe
```

### Required Roles by Operation

Operation

Required Role

View published content

`user` (default)

Create project

`presenter`

Submit for review

`presenter`

Approve knowledge

`reviewer`

Create event

`organizer`

Manage users

`admin`

Delete event

`admin`

---

## 🔐 Security Quick Links

-   **JWT Token Format**: [API Reference - Authentication](API_REFERENCE.md#-authentication)
-   **Role-Based Access Control**: [RBAC Matrix](RBAC_MATRIX.md)
-   **Security Hardening**: [Deployment Runbook - Security Hardening](DEPLOYMENT_RUNBOOK.md#-security-hardening)
-   **CMK Encryption**: [Architecture - Data Protection](ARCHITECTURE.md#data-protection) | [Deployment Runbook - CMK Setup](DEPLOYMENT_RUNBOOK.md#13-configure-key-vault--cmk)

---

## 📈 Metrics & Monitoring

### Key Metrics

-   **API Latency**: P95 < 500ms, P99 < 2000ms
-   **Error Rate**: < 0.1% (99.9% success rate)
-   **Availability**: 99.95% uptime SLA
-   **Database**: < 100ms query response
-   **Cache Hit Rate**: > 70% for Redis

### Monitoring Setup

See [Deployment Runbook - Monitoring & Metrics](DEPLOYMENT_RUNBOOK.md#-monitoring--metrics)

---

## 🚀 Release Notes

### Version 2.0 (January 12, 2026)

✅ Production-ready platform  
✅ CMK encryption for Key Vault  
✅ Complete API documentation  
✅ RBAC implementation  
✅ Knowledge extraction agents  
✅ Workflow orchestration  
✅ Chat with streaming

### Coming in Version 2.1 (Spring 2025)

-   Advanced analytics dashboard
-   Multi-region replication
-   Enhanced LLM agent customization
-   Mobile application support

---

## 🆘 Support & Help

### Finding Answers

Question

Answer Location

"How do I get started?"

[Quick Start Guide](QUICK_START.md)

"How does the system work?"

[Architecture Guide](ARCHITECTURE.md)

"What APIs are available?"

[API Reference](API_REFERENCE.md)

"What permissions does my role have?"

[RBAC Matrix](RBAC_MATRIX.md)

"How do I deploy this?"

[Deployment Runbook](DEPLOYMENT_RUNBOOK.md)

"Why is my API call failing?"

[Troubleshooting Guide](TROUBLESHOOTING.md)

### For Specific Services

-   **Gateway (msr-event-agent-bridge)**: Check authentication, routing, CMK issues→ [Troubleshooting Guide - Gateway Issues](TROUBLESHOOTING.md#-gateway-issues-msr-event-agent-bridge)
    
-   **Backend (msr-event-agent-chat)**: Check database, LLM agents, async jobs→ [Troubleshooting Guide - Backend Issues](TROUBLESHOOTING.md#-backend-issues-msr-event-agent-chat)
    

---

## 📋 Checklist for New Developers

-    Read [Quick Start Guide](QUICK_START.md)
-    Get local environment running
-    Review [Architecture Guide](ARCHITECTURE.md)
-    Read [API Reference](API_REFERENCE.md) for your feature area
-    Check [RBAC Matrix](RBAC_MATRIX.md) for authorization needs
-    Make first API call with curl
-    Run tests: `npm test` and `pytest`
-    Set up IDE debugging
-    Read relevant code in service you're working on
-    Ask questions in team chat/meetings

---

## 🔄 Documentation Maintenance

**Last Updated**: January 15, 2026  
**Next Review**: April 1, 2026  
**Maintained By**: MSR Platform Team

### Contributing

When making changes:

1.  Update relevant documentation file
2.  Update this index if adding new sections
3.  Test all code examples
4.  Get documentation review
5.  Update version and date

---

## 📞 Contact & Community

-   **Slack Channel**: #event-hub-dev
-   **On-Call**: #event-hub-oncall
-   **Issue Tracking**: GitHub Issues
-   **Team Sync**: Thursdays 10 AM PT

---

**Status**: ✅ Production Ready  
**Last Check**: January 15, 2026  
**Next Rotation**: January 22, 2026