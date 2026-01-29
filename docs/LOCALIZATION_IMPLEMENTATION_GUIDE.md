# Localization Implementation Guide

**Quick Reference for 3 Key Recommendations**

---

## Overview

The updated [Localization Specification](./LOCALIZATION_SPECIFICATION.md) now includes three critical recommendations that refine the platform's multilingual strategy:

1. **8 Core Business Languages as Baseline**
2. **Default English Mode per Event**
3. **Admin Localization Tool with Content Diff Tracking**

This guide provides a quick reference and implementation roadmap for each.

---

## Recommendation 1: 8 Core Business Languages

### The 8 Languages

| # | Language | Code | Market | Priority |
|---|----------|------|--------|----------|
| 1 | English | `en` | Global | Tier 0 (Canonical) |
| 2 | Spanish | `es` | LATAM | Tier 1 |
| 3 | Portuguese | `pt` | LATAM | Tier 1 |
| 4 | French | `fr` | EMEA | Tier 1 |
| 5 | German | `de` | EMEA | Tier 1 |
| 6 | Chinese (Simplified) | `zh-CN` | APAC | Tier 1 |
| 7 | Japanese | `ja` | APAC | Tier 1 |
| 8 | Hindi | `hi` | South Asia | Tier 1 |

### Why This Set?

✅ **Global Coverage:** Covers major markets (LATAM, EMEA, APAC, South Asia)  
✅ **Scalability:** 8 languages is manageable without overwhelming resources  
✅ **Business Alignment:** Matches expansion strategy across key regions  
✅ **Phased Growth:** Regional variants (es-MX, zh-TW, etc.) can be added later  

### Implementation Checklist

- [ ] Update locale configuration to support all 8 languages
- [ ] Hire/contract translators for all 8 languages
- [ ] Create terminology glossary for each language
- [ ] Set up fonts/typography for all scripts (Latin, CJK, Devanagari)
- [ ] Test STT/TTS availability for all 8 languages
- [ ] Begin UI string translation (i18n resource files)
- [ ] Plan content translation workflow

**Timeline:** 4-6 weeks for UI strings; ongoing for content translation

---

## Recommendation 2: Default English Mode per Event

### Event-Level Language Configuration

Every event has **3 configurable language settings**:

```typescript
interface EventLocalizationConfig {
  // 1. ALWAYS English (non-negotiable)
  defaultContentLanguage: 'en',
  
  // 2. Event admin chooses enabled languages
  supportedLanguages: ['en', 'es', 'pt'],  // Subset of 8 core languages
  
  // 3. Behavior settings
  contentLanguageConfig: {
    autoDetectUserLanguage: true,    // Auto-switch to user's browser locale?
    forceCanonicalLanguage: false    // Force English only (single-lang mode)?
  }
}
```

### Use Cases

#### **Multi-Language Event (Global Conference)**
```json
{
  "id": "event-global-2026",
  "name": "Global Tech Summit 2026",
  "defaultContentLanguage": "en",
  "supportedLanguages": ["en", "es", "pt", "fr", "de", "zh-CN", "ja", "hi"],
  "contentLanguageConfig": {
    "autoDetectUserLanguage": true,
    "forceCanonicalLanguage": false
  }
}
```
→ Users see content in their preferred language; all have English fallback

#### **Regional Event (Spanish-Focused)**
```json
{
  "id": "event-mexico-2026",
  "name": "Conferencia México 2026",
  "defaultContentLanguage": "en",
  "supportedLanguages": ["es", "en"],
  "contentLanguageConfig": {
    "autoDetectUserLanguage": true,
    "forceCanonicalLanguage": false
  }
}
```
→ Primarily Spanish; English as fallback

#### **Single-Language Event (US Only)**
```json
{
  "id": "event-us-workshop-2026",
  "name": "US Workshop 2026",
  "defaultContentLanguage": "en",
  "supportedLanguages": ["en"],
  "contentLanguageConfig": {
    "autoDetectUserLanguage": false,
    "forceCanonicalLanguage": true
  }
}
```
→ English only; no language switcher shown to users

### Implementation Checklist

- [ ] Extend Event model with `defaultContentLanguage` field (always 'en')
- [ ] Add `supportedLanguages: string[]` array to Event
- [ ] Add `contentLanguageConfig` object for behavior settings
- [ ] Build event admin UI to configure language settings
- [ ] Update content retrieval API to respect event's `supportedLanguages`
- [ ] Update blog post language resolver to use event config
- [ ] Hide language switcher in chat/UI if event is single-language
- [ ] Update event creation form/wizard

**Timeline:** 2-3 weeks for backend; 1-2 weeks for admin UI

---

## Recommendation 3: Admin Localization Tool

### The Complete Workflow

```
1. CONTENT CHANGE (Admin updates blog post)
   └─ Post in English marked with new version hash
   └─ All translations marked as "STALE"
   
2. IDENTIFY WHAT NEEDS TRANSLATION (Dashboard)
   ├─ Spanish: STALE (1 section changed, 35%)
   ├─ French: STALE (entire post changed)
   └─ German: STALE (2 sections changed)
   
3. EXPORT TRANSLATION PACK (for translators)
   ├─ Format: JSON or CSV (easy to edit)
   ├─ Includes: English + existing translation + diff highlights
   └─ Download: localization-pack-es-20260129.json
   
4. TRANSLATE (External or in-house team)
   ├─ Translator receives file with clear instructions
   ├─ Only updates changed sections
   └─ Returns updated file
   
5. IMPORT & REVIEW (Admin uploads file)
   ├─ System validates format
   ├─ Merge into database (draft status)
   └─ Reviewer sees side-by-side comparison
   
6. APPROVE (Reviewer reviews + approves)
   ├─ Green checkmark: "Translation approved"
   └─ Status: draft → approved
   
7. PUBLISH (Admin publishes to live)
   ├─ Spanish translation goes live
   └─ Users see: "Este contenido en Español"
```

### Core Features

#### **Admin Dashboard: Localization Hub**

```
Platform Translation Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Language    | Posts | Translated | Status
──────────┼───────┼────────────┼─────────────
Spanish    | 150   | 142 (95%)  | ⚠️ 8 stale
French     | 150   | 125 (83%)  | ⚠️ 25 stale
German     | 150   | 110 (73%)  | ⚠️ 40 stale
Chinese    | 150   | 95 (63%)   | ⚠️ 55 stale
Japanese   | 150   | 85 (57%)   | ⚠️ 65 stale
Portuguese | 150   | 138 (92%)  | ⚠️ 12 stale
Hindi      | 150   | 72 (48%)   | ⚠️ 78 stale

Quick Actions:
[ Export All Stale Translations ]
[ View Translation Queue ]
[ Generate Status Report ]
```

#### **Export Endpoint**

```bash
GET /api/admin/localization/export?locale=es&scope=platform&filter=stale

Response:
{
  "exportId": "exp-2026-01-29-001",
  "targetLocale": "es",
  "posts": [
    {
      "postId": "post-123",
      "status": "stale",
      "canonical": {
        "title": "Climate Change Explained (Updated Jan 2026)",
        "content": "..."
      },
      "existing_translation": {
        "title": "El Cambio Climático Explicado",
        "content": "... (old)"
      },
      "diff": {
        "changedSections": ["introduction", "findings"],
        "changePercentage": 35,
        "instructions": "Update intro & findings sections only"
      }
    }
  ],
  "downloadUrl": "/downloads/localization-pack-es-20260129.json"
}
```

#### **Import Endpoint**

```bash
POST /api/admin/localization/import
Content-Type: multipart/form-data

file=<translated-pack.json>
locale=es
reviewStatus=draft

Response:
{
  "importId": "imp-2026-01-29-005",
  "locale": "es",
  "summary": {
    "totalPosts": 33,
    "updated": 8,
    "errors": 0
  },
  "status": "success"
}
```

#### **Review UI**

```
Reviewing: Spanish (Español)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Post: "Climate Change Explained"
Status: [Draft] → [In Review] → [Approved]

┌─ English (Original) ──────────────┐
│ Climate Change Explained...       │
│ New findings show...              │
└──────────────────────────────────┘

┌─ Español (Translation) ────────────┐
│ El Cambio Climático Explicado...  │
│ Nuevos hallazgos muestran...      │
└──────────────────────────────────┘

Reviewer Actions:
[ ✓ Approve ]  [ 🔄 Request Changes ]  [ ✗ Reject ]

Comments:
"Looks good! Minor adjustment: use 'datos' instead of 'hallazgos'"

[ Post Comment ]  [ Approve & Next ]
```

#### **Publish Endpoint**

```bash
POST /api/admin/localization/publish
{
  "locale": "es",
  "postIds": ["post-123", "post-124", "post-125"],
  "publishAction": "update_translations"
}

Response:
{
  "publishId": "pub-2026-01-29-018",
  "status": "published",
  "postsPublished": 3,
  "message": "3 Spanish translations published. Live in 5 minutes."
}
```

#### **Reporting Endpoint**

```bash
GET /api/admin/localization/reports?reportType=completion&format=json

Response:
{
  "reportType": "completion",
  "summary": {
    "totalLanguages": 8,
    "overallCompletion": 78.5,
    "byLanguage": [
      { "locale": "es", "completion": 95 },
      { "locale": "pt", "completion": 92 },
      { "locale": "fr", "completion": 83 },
      { "locale": "de", "completion": 73 },
      { "locale": "zh-CN", "completion": 63 },
      { "locale": "ja", "completion": 57 },
      { "locale": "hi", "completion": 48 }
    ]
  },
  "recommendations": [
    "Prioritize Chinese and Hindi translations",
    "Schedule review for stale French translations"
  ]
}
```

### Implementation Roadmap

#### **Phase 3a: Backend Foundation**
- [ ] Extend BlogPost model with `canonicalVersion` field
- [ ] Add `translations[locale].translationStatus` field (current | stale | in_progress)
- [ ] Implement change detection (hash-based diff)
- [ ] Mark stale translations when canonical updates
- [ ] Build `/api/admin/localization/export` endpoint
- [ ] Build `/api/admin/localization/import` endpoint

#### **Phase 3b: Review & Publish**
- [ ] Create `/api/admin/localization/review/:postId` endpoint
- [ ] Build admin review UI (side-by-side comparison)
- [ ] Implement approval workflow (draft → approved)
- [ ] Create `/api/admin/localization/publish` endpoint
- [ ] Build publish confirmation UI

#### **Phase 3c: Reporting & Dashboard**
- [ ] Create `/api/admin/localization/reports` endpoint
- [ ] Build Localization Hub dashboard
- [ ] Add completion charts and status indicators
- [ ] Build "Stale Content" report
- [ ] Add "Translation Queue" view

**Timeline:** 8-10 weeks for complete tool (can be phased)

---

## Integration Points

### With Existing Systems

1. **Event Model**
   - Add `defaultContentLanguage`, `supportedLanguages`, `contentLanguageConfig`
   - Update event edit form to expose language settings

2. **Blog Post Model**
   - Add `canonicalVersion` tracking
   - Extend `translations[locale]` with `translationStatus`, `diffFromCanonical`

3. **Content Resolution**
   - Update blog post resolver to check event's `supportedLanguages`
   - Hide language switcher if event is single-language

4. **Chat System**
   - Conversation language respects event's `supportedLanguages`
   - No language switch prompts for unsupported languages in event

### New Admin Routes

- `/admin/localization/` – Localization Hub (dashboard)
- `/admin/localization/export` – Export translation packs
- `/admin/localization/review` – Review translations
- `/admin/localization/reports` – View reports

---

## Success Metrics

- **Translation Completion:** % of posts translated to each language
- **Time to Translate:** Days from export to publish
- **Translation Quality:** Reviewer approval rate (target: 95%+)
- **Stale Content:** % of translations needing updates
- **User Satisfaction:** Language switching usage; fallback clicks

---

## FAQ

**Q: Can we start with just 3 languages instead of 8?**  
A: Yes. The spec supports Phase 1 (3 languages) with Phase 2 expansion. Recommended: `en`, `es`, `pt` for launch; add others in Q2 2026.

**Q: Do we need all 3 tools at launch?**  
A: No. Recommend:
- Launch v1: Dashboard + Export only (for internal translation)
- Sprint 2: Add Import + Review workflow
- Sprint 3: Add Reporting + Publish workflow

**Q: How much will translation cost?**  
A: Depends on word count and language. Example:
- 50,000 English words × 8 languages = 400,000 words
- At $0.05/word = $20,000 for initial translation
- Ongoing: $2-5K/month for new/updated content

**Q: What if we use machine translation?**  
A: Machine translation is good for speed but hurts quality. Recommend:
- Use MT for first draft (faster)
- Human review mandatory for all languages
- Store both MT version and human version

**Q: Can events override platform's default language?**  
A: No, English is canonical for all events. Events can only choose which subset of 8 languages they support.

---

## Related Documentation

- [Full Localization Specification](./LOCALIZATION_SPECIFICATION.md)
- [Locale Codes (BCP 47)](./LOCALIZATION_SPECIFICATION.md#12-glossary--reference)
- [API Endpoints](./LOCALIZATION_SPECIFICATION.md#9-api--data-model-requirements)
- [QA Test Matrix](./LOCALIZATION_SPECIFICATION.md#11-qa--test-matrix)

---

## Code Progress: This Branch

### Completed (Chat Flow + Localization Foundation)

#### **Models**
- ✅ [app/models/chatFlow.ts](../../app/models/chatFlow.ts) – Types for `ChatFlowDefinition`, `CardInventoryItem`, flow status/scope/locale
- ✅ [app/models/event.ts](../../app/models/event.ts) – Extended Event with `chatCardInventory: CardInventoryItem[]` field

#### **Services & Utilities**
- ✅ [app/lib/chat-flow-service.ts](../../app/lib/chat-flow-service.ts) – Default flow builder, hardcoded card inventory defaults
- ✅ [app/services/chatFlows.server.ts](../../app/services/chatFlows.server.ts) – Cosmos CRUD for chat flows with locale/event resolution
- ✅ [app/services/chatCardInventory.server.ts](../../app/services/chatCardInventory.server.ts) – System inventory (appsettings) + event inventory (event docs)
- ✅ [app/services/cosmosDb.ts](../../app/services/cosmosDb.ts) – Added `chatflows` container

#### **API Routes**
- ✅ [app/routes/api.chat-flows.tsx](../../app/routes/api.chat-flows.tsx) – Public API loader for flow retrieval with event slug resolution
- ✅ [app/routes/admin.chat-flows.tsx](../../app/routes/admin.chat-flows.tsx) – Admin UI for chat flow + inventory authoring with JSON validation, preview, and scope selector

#### **Components (Localized)**
- ✅ [app/components/ChatWelcome.tsx](../../app/components/ChatWelcome.tsx) – Loads flows from API with locale/event/org slug fallback
- ✅ [app/components/ChatMessage.tsx](../../app/components/ChatMessage.tsx) – Localized rating labels with i18n
- ✅ [app/components/RefusalHandler.tsx](../../app/components/RefusalHandler.tsx) – Localized error messages and feedback text

#### **Routing & Localization**
- ✅ [app/routes.ts](../../app/routes.ts) – Registered `/admin/chat-flows` and `/api/chat-flows` routes
- ✅ [app/routes/admin.tsx](../../app/routes/admin.tsx) – Added Chat Flows admin navigation card
- ✅ [app/lib/useChatService.ts](../../app/lib/useChatService.ts) – Added locale to dependency array
- ✅ [app/localization/resources.ts](../../app/localization/resources.ts) – Fixed Spanish translation typos, added i18n keys for chat flows

**Status:** All files compile without TypeScript errors. Chat welcome loads flows from API with fallback to hardcoded defaults. Event-specific flow resolution working with org filter.

---

### Remaining Implementation Tasks

#### **Phase 1: Event-Level Localization Defaults**
- [ ] Extend Event model with `defaultContentLanguage` field (MUST be 'en')
- [ ] Add `supportedLanguages: string[]` field to Event
- [ ] Add `contentLanguageConfig` object (autoDetectUserLanguage, forceCanonicalLanguage)
- [ ] Update event admin UI to expose language configuration
- [ ] Update blog post content API to respect event's `supportedLanguages`
- [ ] Hide language switcher in chat UI if event is single-language (`forceCanonicalLanguage: true`)
- [ ] Update event creation/edit form in admin

#### **Phase 2: Blog Post Model & Content Versioning**
- [ ] Extend BlogPost model with `canonicalVersion` field (versionId, lastModifiedDate, changeHash)
- [ ] Add `translations[locale].translationStatus` field (current | stale | in_progress | needs_review)
- [ ] Add `translations[locale].diffFromCanonical` field (changedSections, changePercentage)
- [ ] Implement change detection service (hash-based diff when English post updated)
- [ ] Auto-mark translations as "stale" when canonical updates
- [ ] API endpoint: `GET /api/blog/:postId` with locale resolution + diffFromCanonical info

#### **Phase 3a: Admin Tool - Export & Diff Detection**
- [ ] Implement `POST /api/admin/localization/export` endpoint
  - [ ] Accept locale, scope (platform|event), filter (stale|untranslated|all), format (json|csv|xliff)
  - [ ] Return localization pack with canonical + existing translation + diff highlights
  - [ ] Generate download URL
- [ ] Build stale detection service (compare current translation version to canonical version)
- [ ] Implement CSV export format (for spreadsheet-based translation)
- [ ] Implement XLIFF export format (for CAT tools)

#### **Phase 3b: Admin Tool - Import & Validation**
- [ ] Implement `POST /api/admin/localization/import` endpoint
  - [ ] Accept multipart file (JSON/CSV), exportId, locale, reviewStatus
  - [ ] Validate file format and structure
  - [ ] Merge translations into database
  - [ ] Track import status and errors
- [ ] Build import validation service (schema validation, missing field detection)
- [ ] Implement rollback capability (revert failed imports)

#### **Phase 3c: Admin Tool - Review & Publish**
- [ ] Implement `PATCH /api/admin/localization/review/:postId` endpoint
  - [ ] Accept action (approve|request_changes|reject), comments
  - [ ] Update translation status in database
  - [ ] Track reviewer and review date
- [ ] Build admin review UI component
  - [ ] Side-by-side English vs. translation view
  - [ ] Approve / Request Changes / Reject buttons
  - [ ] Comment form with reviewer feedback
- [ ] Implement `POST /api/admin/localization/publish` endpoint
  - [ ] Accept locale, postIds, publishAction
  - [ ] Publish approved translations to live
  - [ ] Cache invalidation for blog posts

#### **Phase 3d: Admin Tool - Reporting & Dashboard**
- [ ] Implement `GET /api/admin/localization/reports` endpoint
  - [ ] Support reportType: completion, stale, velocity, quality, cost
  - [ ] Generate JSON, PDF, CSV output formats
  - [ ] Include recommendations
- [ ] Build Localization Hub dashboard
  - [ ] Show completion % by language
  - [ ] Stale content count
  - [ ] Quick action buttons (Export, View Queue, Generate Report)
- [ ] Build "Translation Queue" view (list of stale posts needing translation)
- [ ] Build "Stale Content" report

#### **Phase 4: Event-Level Translation Management**
- [ ] Extend event edit form with "Chat Card Inventory" tab
  - [ ] Allow event admin to customize card inventory for event
  - [ ] Inherit system inventory as defaults
- [ ] Implement event-scoped export/import
  - [ ] `GET /api/admin/events/:eventId/localization/export`
  - [ ] `POST /api/admin/events/:eventId/localization/import`
- [ ] Add event-level translations for blog posts
  - [ ] Allow event to have event-specific blog post translations

#### **Phase 5: Quality Assurance**
- [ ] Full QA test matrix for all 8 languages
  - [ ] UI chrome language resolution (all 8 languages)
  - [ ] Blog post language fallback + stale detection
  - [ ] Chat language switching + detection
  - [ ] Voice STT/TTS language selection
- [ ] Accessibility audit (WCAG 2.1 AA)
  - [ ] Screen reader testing in all 8 languages
  - [ ] Font rendering for all scripts (CJK, Devanagari, Latin)
  - [ ] Contrast ratios, focus order, ARIA labels
- [ ] Pseudolocalization test (accented strings)
- [ ] RTL layout test (if adding Arabic later)
- [ ] Performance testing
  - [ ] i18n resource loading time
  - [ ] Export file size with all languages
  - [ ] API response times for stale detection

#### **Phase 6: Deployment & Launch**
- [ ] Legal review: Terms of Service, Privacy Policy (all 8 languages)
- [ ] Compliance audit: GDPR, CCPA, local regulations
- [ ] Translation of Terms/Privacy/compliance docs
- [ ] Hire/contract translators for all 8 languages
- [ ] Seed initial translations for high-priority blog posts
- [ ] Feature flag: Localization (disabled by default, enable for beta users)
- [ ] Beta testing with 20% of users
- [ ] Gradual rollout to 100% of users

---

### Architecture Summary

```
User-Facing (Chat + Blog)
├─ Chat Welcome → API /api/chat-flows → Get flow for locale/event
├─ Blog Post → API /blog/:postId → Get post in user's language + fallback banner
├─ Language Settings → User can change UI/content/chat language
└─ Language Selector → Page-scoped language switch with "Set as default"

Admin-Facing (Localization Tool)
├─ Dashboard → See completion % by language + stale count
├─ Export → Extract stale posts for translation
│   └─ Formats: JSON (for devs) / CSV (for spreadsheet) / XLIFF (for CAT tools)
├─ Import → Upload translated file + validation
├─ Review → Side-by-side comparison + approve/reject
├─ Publish → Push translations to live
└─ Reports → Completion, velocity, cost estimates

Database Schema
├─ Event
│   ├─ defaultContentLanguage: 'en' (required)
│   ├─ supportedLanguages: ['en', 'es', 'pt'] (subset of 8 core)
│   └─ contentLanguageConfig: { autoDetectUserLanguage, forceCanonicalLanguage }
├─ BlogPost
│   ├─ canonicalVersion: { versionId, lastModifiedDate, changeHash }
│   └─ translations[locale]
│       ├─ content: string
│       ├─ translationStatus: 'current' | 'stale' | 'in_progress'
│       └─ diffFromCanonical: { changedSections[], changePercentage }
├─ ChatFlow (Cosmos)
│   ├─ scope: 'global' | 'event'
│   ├─ contentLanguages: ['en', 'es', 'pt']
│   └─ translations[locale]: { title, content, cards[] }
└─ AppSettings (Cosmos)
    └─ 'chat-card-inventory': CardInventoryItem[] (system templates)
```

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**Next Review:** April 29, 2026
