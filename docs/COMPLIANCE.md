# Compliance Gates & Sign-offs for MSR Event Hub Project

## Overview

The MSR Event Hub – an internal platform for Microsoft Research events – must clear multiple internal compliance gates and sign-offs before and during its rollout. These include:

-   **Responsible AI (RAI) reviews** for AI-powered features
-   **Privacy compliance** for employee data handling
-   **Security reviews** under Microsoft's Secure Development Lifecycle
-   **Accessibility compliance** (WCAG 2.1 AA equivalent)
-   **SSPA verification** for any third-party services

> **Key Principle**: All compliance areas are interdependent. The RAI program explicitly requires that Privacy, Accessibility, Security, and SSPA compliance be in place as a foundation.

---

## Required Compliance Gates

### 1. RAI Inventory Registration ⏳ Required

**What**: Logging the project's AI functionalities in the Microsoft Responsible AI Inventory is the first step.

**Why**: Every AI scenario must be recorded in the internal service catalog for tracking and further RAI review.

**For Event Hub**:

-   Catalog planned AI agents: attendee-facing Q&A bot and content-summarization agent
-   Flag both for formal RAI review

---

### 2. HR Legal Review ⏳ Required

**What**: Internal legal assessment focused on HR/internal use of AI.

**Why**: Mandatory for AI systems requiring full RAI scrutiny.

**Scope**:

-   Ensures project's use of AI aligns with internal policy
-   Validates data handling practices
-   Confirms no legal or ethical issues
-   Covers content analysis and generation by guardrailed AI

---

### 3. HR RAI Impact Assessment ⏳ Required

**What**: Core Responsible AI compliance activity - thorough impact assessment.

**Why**: Evaluates purpose, data use, and potential harms of AI features.

**Key Outputs**:

-   Risk analysis: misinformation, inappropriate content, principle violations
-   Proposed mitigations
-   Two-agent design documented (DOSA for Q&A, PKA for draft synthesis)

**Status**: Full RAI assessment required for Copilot-like agents.

---

### 4. Sensitive Use Review ⏳ Likely Not Required

**What**: Determine if Event Hub falls under Sensitive Use categories of AI.

**Scope**: HR decisions, medical, legal, demographic profiling uses.

**For Event Hub**:

-   ✅ Research content domain (non-sensitive)
-   ✅ Internal use only
-   ⚠️ **Confirm during RAI Assessment** - if scope expands to sensitive areas, Responsible AI Sensitive Uses panel approval needed

---

### 5. Deployment Safety Board (DSB) Review ⏳ Not Initially Required

**What**: Review board for high-risk AI deployments.

**Triggers**:

-   First-party generative AI + sensitive use contexts
-   High-stakes autonomous decisions

**For Event Hub**:

-   ✅ Currently **not triggered** - discovery-first, fail-closed design, internal research only
-   ⚠️ **Required if scope expands** to sensitive decision-making or external use

---

### 6. Continuous RAI Compliance ⏳ Required

**What**: Ongoing monitoring and recertification beyond initial approval.

**Why**: Initial RAI approval is not one-and-done; continuous compliance is mandatory.

**Requirements**:

-   Post-deployment RAI monitoring plan
    -   Track if Q&A bot produces unsupported answers
    -   Log AI refusals or edits for compliance metrics
    -   Monitor new AI capabilities (e.g., "Concierge" feature)
-   Periodic assessments as project evolves
-   Scheduled follow-up reviews with RAI program

---

### 7. Privacy & Data Handling Compliance ⏳ Required for MVP

**What**: Comprehensive Data Privacy Impact Assessment (DPIA).

**Personal Data Handled**:

-   Researcher names, emails, photos
-   User bookmarks (tied to user ID)
-   Session presenter information
-   Usage data (who visited what, bookmarks)

**Compliance Checklist**:

#### A. Identify Personal Data

-   Project pages: team member names, titles, images, emails
-   Bookmarking system: user ID + project linkage
-   All constitute personal data requiring safeguards

#### B. Apply Minimization & Safeguards

-   Collect only what's necessary
-   Use opaque user IDs (not easily identifiable strings)
-   Store securely in Microsoft databases only
-   Restrict unauthorized access
-   Data retention policies documented

#### C. Inform & Obtain Consent

-   Internal users covered under employment terms
-   Best practice: notify users that event interactions (visits, bookmarks) may be logged
-   Transparent about metrics collection

#### D. AI & Sensitive Data

-   ✅ Event Hub AI confined to event content (abstracts, papers)
-   ✅ No personal info fed into models without consent
-   ✅ Design avoids Office 365 personal data without admin approval

**Status**: Required sign-off from Privacy team before launch.

---

### 8. Accessibility Compliance ⏳ Required for MVP

**What**: Meet WCAG 2.1 AA equivalent standards.

**Why**: Ensure platform is usable by employees with disabilities.

**Requirements**:

#### Visual Content

-    Alt-text for all images and posters
-    Captions or transcripts for embedded videos
-    Sufficient color contrast on event pages

#### Navigation & Interaction

-    Screen reader compatibility
-    Keyboard-only navigation support
-    Semantic HTML for proper structure
-    Test Q&A chat for screen-reader compatibility

#### Alternative Access

-    Alternative bookmark methods (for users unable to scan QR)
-    Accessible "My Bookmarks" page design
-    Multi-day agenda navigation via assistive tech

**Status**: Required for MVP. **Critical path item** - RAI compliance depends on Accessibility compliance.

---

### 9. Security Review & Sign-off ⏳ Required for MVP

**What**: Full security compliance under Microsoft's Secure Development Lifecycle.

**Components**:

#### A. Threat Modeling & Design Review

-   Only authorized users (Microsoft employees) can access content
-   Injection and XSS risk mitigation on user inputs
-   Data at rest security: approved storage with encryption
-   Audit trails for admin changes

#### B. Security Testing

-   Static code analysis
-   Vulnerability scanning
-   Address high-risk findings

#### C. Current Design Strengths

-   ✅ Access restricted to @microsoft.com accounts
-   ✅ No external users can sign in
-   ✅ Office 365 integration disabled by default
-   ✅ Graph-aligned architecture (auditable resource boundaries)

**Status**: Required for MVP. No P0/P1 security issues at launch.

---

### 10. SSPA (Supplier Security & Privacy Assurance) ⏳ If Applicable

**What**: Program ensuring suppliers meet Microsoft's security and privacy standards.

**When Required**:

-   Third-party/supplier services handling Microsoft data
-   Vendor-operated cloud services
-   External AI APIs or analytics services

**For Event Hub**:

-   ✅ **Likely not required** - code and cloud resources under Microsoft control
-   ✅ Azure OpenAI (Microsoft service) + internal Azure resources
-   ⚠️ All vendor staff covered by existing Microsoft vendor agreements
-   ⚠️ **Must verify** if any external services are introduced

**Recommendation**: Document that "No external supplier services (besides Azure) are used in production."

---

## Feature Mapping to Compliance Gates

Feature

Privacy

Security

Accessibility

RAI

Status

**Core Platform** (multi-event hub, codebase, Azure)

✅

✅

✅

N/A

MVP

**Events Homepage**

⚠️ Minimal

✅

✅

N/A

MVP

**Event Sites** (Agenda, Sessions)

✅

✅

✅

N/A

MVP

**Session Details & Recordings**

✅

✅

✅ (captions)

N/A

MVP

**Poster/Project Hub**

✅ Personal data

✅

✅ (alt-text)

N/A

MVP

**Bookmarking & QR**

✅ User data

✅

✅ Alternatives

N/A

MVP

**Admin Tools**

✅ Data handling

✅ Role-based

✅

N/A

MVP

**AI Q&A Chat (DOSA)**

✅

✅

✅

🔴 **CRITICAL**

MVP

**AI Content Summary (PKA)**

✅

✅

✅

🔴 **CRITICAL**

MVP

**ResNet Integration**

✅

✅

N/A

N/A

MVP

**Analytics & Metrics (1DS)**

✅ Aggregated

✅

N/A

✅ Ongoing

MVP

**Future: Recommendations**

✅

✅

N/A

🔴 Phase 2

Phase 2

---

## Why These Mappings?

### Standard Web Features

Primary compliance needs: **Privacy, Security, Accessibility**

-   Required for any internal digital product
-   Must be completed for MVP launch

### AI Features

Primary compliance needs: **Responsible AI**

-   Both DOSA (Q&A chat) and PKA (content synthesis) require full RAI process
-   Includes inventory, impact assessment, legal review
-   May require additional governance boards if high-risk

### Integration & Data Use

Primary compliance needs: **Privacy, Security**

-   External data feeds require admin consents
-   Telemetry must follow Microsoft privacy rules
-   Vendor handling covered by SSPA or existing agreements

---

## Design Constraints (Built-in Compliance)

The Event Hub architecture proactively addresses compliance requirements:

### Responsible AI Alignment

-   **Two-agent design**: DOSA (fail-closed discovery) + PKA (draft synthesis)
-   **Attendee-facing constraint**: Citations-only, no unsupported answers
-   **Human approval required**: AI outputs must be approved before use
-   **Clear guardrails**: Safety constraints documented in design

### Access Control

-   **Microsoft-only**: Restricted to @microsoft.com accounts
-   **No external users**: Design prevents data exposure to outsiders
-   **Office 365 disabled**: No unintended personal data access

### Governance

-   **Audit trails**: All admin actions logged for accountability
-   **Permission controls**: Role-based access at hub/event/session level
-   **Monitoring ready**: Event Hub can track AI compliance metrics (refusal rate, edit %)

---

## Guidance for Each Gate

### ✅ RAI Inventory & Assessment

**Actions**:

1.  Engage early with **Responsible AI Champs** or central RAI program
2.  Use **HR RAI Portal** to file Inventory entry and Impact Assessment
3.  Be thorough in use-case descriptions:
    -   DOSA: excerpted answers with citations only
    -   PKA: internal draft tool
4.  Leverage design choices as evidence of safety/reliability
5.  Implement feedback from RAI committee (e.g., transparency notices)
6.  **Obtain written confirmation** of RAI approval

---

### ✅ HR Legal Review

**Actions**:

1.  Coordinate via RAI process or separately with MSR Legal Counsel
2.  Provide: BRD, architecture doc, completed RAI assessment
3.  Address legal concerns:
    -   **Data usage**: All internal MSR content
    -   **User consent**: Speakers have consented to share materials internally
    -   **IP rights**: Internal content, AI outputs are derivatives
4.  Discuss terms of use for Event Hub
5.  Document all open-source components and third-party libraries
6.  **Implement any legal requirements** (e.g., AI-generated content labels)

---

### ✅ Privacy Compliance

**Actions**:

1.  Work with **Privacy & Compliance team**
2.  Complete **Privacy Impact Assessment** (PIA)
3.  Key outputs:
    -   Update MSR Internal Privacy Notice (include event interaction logging)
    -   Define data retention policy (e.g., purge/anonymize bookmarks after X period)
    -   Verify cookie compliance for telemetry (likely fine as first-party, internal)
4.  Document all controls implemented
5.  **Obtain Privacy team sign-off** before launch

---

### ✅ Accessibility Compliance

**Actions**:

1.  Use **Accessibility Insights** tool during development
2.  Schedule manual accessibility testing (focus on high-traffic scenarios):
    -   Event agenda navigation
    -   Poster pages with screen reader
    -   Chatbot via keyboard-only
3.  Address blocking issues (e.g., color contrast)
4.  Document compliance testing results
5.  Recommend testing by **Microsoft accessibility team** or vendor
6.  **Obtain accessibility sign-off** before launch

---

### ✅ Security

**Actions**:

1.  Follow **Secure Development Lifecycle (SDL)**:
    -   Threat modeling
    -   Code review
    -   Dynamic testing
2.  Engage **internal security engineer** or red team for pen-test in staging
3.  Test scenarios:
    -   Can attendees fetch unpublished posters? (Should not be able to)
    -   Can bookmarks be manipulated to see others' data? (Per-user scoped)
    -   Azure infrastructure: approved base images, logging, monitoring
4.  Prepare **security review report**
5.  Implement **production monitoring**:
    -   Azure Monitor alerts (failed login attempts, unusual activity)
6.  **Obtain security team sign-off** before launch

---

### ✅ SSPA (If Applicable)

**Actions**:

1.  Verify no external supplier services in production
2.  If external service needed: work with **Microsoft ROC** (Risk & Compliance)
3.  Ensure vendor compliance:
    -   Valid NDAs
    -   Security training
    -   Master Services Agreements in place
4.  Document rationale: "No external supplier services (besides Azure); SSPA not applicable"
5.  **Keep documentation ready** for questions

---

## Timeline & Phases

The Event Hub rollout includes multiple phases, each with compliance checkpoints:

Phase

Scope

Compliance Focus

Timeline

**MVP (India)**

Core platform + AI agents

RAI, Privacy, Security, Accessibility

Jan 24, 2026

**Phase 2**

Multi-event scaling, PKA draft

Continuous RAI compliance review

Mar 3, 2026

**Phase 3-4**

Recommendations, Concierge

New RAI assessments for new features

Apr-Jun 2026

**Key Principle**: Each new feature requires fresh compliance review at the phase when it's introduced.

---

## Summary: Path to Launch

✅ **Compliance Foundation Ready**:

-   Design choices proactively address compliance (fail-closed AI, Microsoft-only access)
-   RAI, Privacy, Security, Accessibility frameworks in place
-   Documentation prepared (BRD, architecture)

**Remaining Compliance Work**:

1.  **RAI Assessment** (2-3 weeks) - impact analysis, AI governance
2.  **Privacy Review** (1-2 weeks) - DPIA, data handling sign-off
3.  **Security Testing** (2-3 weeks) - pen-test, code review, threat model
4.  **Accessibility Testing** (1-2 weeks) - manual + tool-based testing
5.  **Legal & Sign-offs** (1-2 weeks, parallel) - HR Legal, Privacy, Security approvals

**Critical Path**: Accessibility + Security reviews (10-15 days)

**Success Criteria**:

-   ✅ All compliance gates signed off (or in-flight with clear timeline)
-   ✅ No P0/P1 security issues
-   ✅ Accessibility standards met
-   ✅ Continuous compliance plan documented

---

**Last Updated**: January 15, 2026  
**Maintained By**: MSR Platform Compliance Team