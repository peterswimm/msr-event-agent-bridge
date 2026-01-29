# Localization Specification: Blog + Chatbot Platform

**Version:** 1.0  
**Last Updated:** January 29, 2026  
**Status:** Implementation Guide  
**Audience:** Engineers, Product Managers, Designers, QA, Legal/HR

---

## Executive Summary

This specification defines the localization strategy for a multilingual Blog + Chatbot platform supporting multiple languages across web and mobile surfaces. The system implements a **dual-locale model**: UI Chrome (navigation, buttons, settings) follows the user's explicit language preference, while Content (blog posts, chat messages, generated text) resolves language independently per item, with explicit fallback mechanisms.

**Core Principle:** Never silently switch languages. Always show what language the user is viewing.

---

## Key Recommendations (Implemented in This Spec)

### 1. **8 Core Business Languages as Baseline**

Rather than starting with just English + a few languages, this specification defines **8 core business languages** as the foundation:

1. **English (en)** – Canonical language (Tier 0)
2. **Spanish (es)** – LATAM market (Tier 1)
3. **Portuguese (pt)** – LATAM market (Tier 1)
4. **French (fr)** – EMEA market (Tier 1)
5. **German (de)** – EMEA market (Tier 1)
6. **Chinese Simplified (zh-CN)** – APAC market (Tier 1)
7. **Japanese (ja)** – APAC market (Tier 1)
8. **Hindi (hi)** – South Asia market (Tier 1)

**Rationale:** This baseline supports global reach across major markets (LATAM, EMEA, APAC, South Asia) while remaining manageable in scope. Regional variants (e.g., es-MX, zh-TW) can be added in Phase 2 based on market demand.

**See:** Section 2.1 for details.

---

### 2. **Default English Mode per Event**

Every event **MUST default to English** as the canonical language, but event administrators can configure which subset of the 8 core languages are enabled for that specific event.

```typescript
Event {
  defaultContentLanguage: 'en',           // ALWAYS English
  supportedLanguages: ['en', 'es', 'pt'], // Event admin chooses subset
  contentLanguageConfig: {
    autoDetectUserLanguage: true,
    forceCanonicalLanguage: false
  }
}
```

**Benefits:**
- Ensures all content starts with English fallback
- Events can be single-language (English only) or multi-language
- Event-level control without platform-wide restrictions
- Simplifies content governance (all canonical content in English)

**See:** Section 2.3 for detailed event-level configuration.

---

### 3. **Admin Localization Tool: Content Diff Tracking, Export/Import, & Publishing**

A comprehensive admin tool enables teams to:

#### **Track Content Changes (Diffs)**
- Detect when canonical English content is updated
- Mark translations as "stale" (out of sync)
- Show exactly which sections changed (with change %)
- Prioritize translations needing attention

#### **Export Localization Packs**
- **Scope:** Platform-wide or event-specific
- **Formats:** JSON, CSV, or XLIFF (for translator tools)
- **Filtering:** Export only stale, untranslated, or all content
- **Intelligence:** Include diff highlights showing what changed in English

#### **Import Translated Content**
- Upload translated packs (from external translators or in-house)
- Validate file format and integrity
- Merge translations into database
- Track import status (draft → in_review → approved)

#### **Review & Publish**
- Side-by-side English vs. translation review UI
- Approve, request changes, or reject translations
- Reviewer comments and feedback system
- Publish approved translations to live platform

#### **Reporting**
- Translation completion dashboard (% by language)
- Stale content report (what needs updating)
- Translation velocity (translations/month)
- Cost estimates (translation hours needed)

**End-to-End Workflow:**
```
1. Admin updates blog post in English
   ↓
2. Dashboard shows: Spanish (STALE), French (STALE)
   ↓
3. Admin exports Spanish translation pack
   ↓
4. External translator updates translations
   ↓
5. Admin imports updated file
   ↓
6. Reviewer approves translations
   ↓
7. Admin publishes → Users see Spanish content
```

**See:** Section 8 for complete admin tool specification; Section 10 for API details.

---

## 1. Definitions

### 1.1 Locale Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Locale** | Language + region identifier (BCP 47 format) | `en-US`, `es-MX`, `pt-BR` |
| **Language** | Core language identifier (ISO 639-1) | `en`, `es`, `pt` |
| **UI Chrome Language** | Language for global navigation, buttons, labels, settings, error states | User sees "Settings," "Sign Out," "Save" in chosen language |
| **Content Language** | Language of a specific blog post, article, or chat message | A blog post marked as `es` Spanish |
| **Chat Language** | Language context for an active conversation | User set conversation to "Español" |
| **Canonical Language** | Source/fallback language for all content (default: English `en`) | All blog posts must exist in `en`; translations are optional |
| **Available Locales** | Languages where BOTH UI strings AND sufficient content exist | User can set locale = `es` and see translated UI + Spanish blog posts |
| **Supported Locales** | Languages that can be requested; UI chrome translatable | `en`, `es`, `pt`, `fr` (not all have full blog content) |
| **User Language Preference** | Explicit choice stored in user account or local storage | "I prefer UI in Español" |
| **Browser/Device Locale** | System-level locale (OS, browser settings) | Browser is set to `pt-BR` |
| **Fallback** | Intentional display of content in different language when requested language unavailable | "This post not available in Español. Showing English." |
| **Unavailable** | Content does not exist in requested language; fallback required | Blog post has `en`, `es`, `pt`; user requests `fr` |

---

## 2. Supported Locales

### 2.1 Phase 1: 8 Core Business Languages (Baseline)

| Language | Code | Regions | UI Strings | Content | STT/TTS | Market Priority | Status |
|----------|------|---------|-----------|---------|---------|-----------------|--------|
| English | `en` | US, GB, AU, CA | ✅ Full | ✅ Full (Canonical) | ✅ | Tier 0 (Global) | Production |
| Spanish | `es` | ES, MX, AR | ✅ Full | ⚠️ Partial (selective posts) | ✅ | Tier 1 (LATAM) | Production |
| Portuguese | `pt` | BR, PT | ✅ Full | ⚠️ Partial (selective posts) | ✅ | Tier 1 (LATAM) | Production |
| French | `fr` | FR, CA, CH | ✅ Full | ⚠️ Partial (selective posts) | ✅ | Tier 1 (EMEA) | Production |
| German | `de` | DE, AT, CH | ✅ Full | ⚠️ Partial (selective posts) | ✅ | Tier 1 (EMEA) | Production |
| Chinese (Simplified) | `zh-CN` | CN | ✅ Full | ⚠️ Partial (selective posts) | ✅ | Tier 1 (APAC) | Production |
| Japanese | `ja` | JP | ✅ Full | ⚠️ Partial (selective posts) | ✅ | Tier 1 (APAC) | Production |
| Hindi | `hi` | IN | ✅ Full | ⚠️ Partial (selective posts) | ✅ | Tier 1 (South Asia) | Production |

**Rationale:**
- **English (en)**: Canonical language; global baseline.
- **Spanish (es), Portuguese (pt)**: LATAM market expansion.
- **French (fr), German (de)**: EMEA business region.
- **Chinese (zh-CN), Japanese (ja)**: APAC market (largest user base potential).
- **Hindi (hi)**: South Asia market growth; India focus.

### 2.2 Phase 2: Regional Extensions (Optional)
Additional regional variants for Phase 1 languages (subject to market demand):
- `es-AR`, `es-MX` (Latin American Spanish variants)
- `pt-BR`, `pt-PT` (Brazilian vs. European Portuguese)
- `zh-TW` (Traditional Chinese, Taiwan market)
- `ar` (Arabic, MENA region)

### 2.3 Event-Level Localization Defaults

#### 2.3.1 Default Language per Event
Every event MUST have a default content language:

```typescript
interface Event {
  id: string;
  name: string;
  
  // Localization defaults for this event
  defaultContentLanguage: string;  // MUST be 'en' (English)
  supportedLanguages: string[];    // Subset of 8 core languages enabled for this event
  contentLanguageConfig?: {
    autoDetectUserLanguage?: boolean;
    forceCanonicalLanguage?: boolean;  // If true, all content served in English
  };
}
```

**Requirements:**
- **Default content language MUST be English (`en`)** for all events.
- Event admin MUST specify which of the 8 core languages are enabled for blog posts/content.
- Event admin CAN override default if event is NOT multilingual (single-language mode).
- If event is single-language: all content auto-fallback to canonical English; no language switching UI shown.

#### 2.3.2 Example Event Configurations

**Multi-Language Event (Default):**
```json
{
  "id": "event-001",
  "name": "Global Tech Summit 2026",
  "defaultContentLanguage": "en",
  "supportedLanguages": ["en", "es", "pt", "fr", "de", "zh-CN", "ja", "hi"],
  "contentLanguageConfig": {
    "autoDetectUserLanguage": true,
    "forceCanonicalLanguage": false
  }
}
```

**Single-Language Event (English Only):**
```json
{
  "id": "event-002",
  "name": "Regional Workshop (US)",
  "defaultContentLanguage": "en",
  "supportedLanguages": ["en"],
  "contentLanguageConfig": {
    "autoDetectUserLanguage": false,
    "forceCanonicalLanguage": true
  }
}
```

**Regional Event (Spanish-Primary, English Fallback):**
```json
{
  "id": "event-003",
  "name": "Conferencia México 2026",
  "defaultContentLanguage": "en",
  "supportedLanguages": ["es", "en"],
  "contentLanguageConfig": {
    "autoDetectUserLanguage": true,
    "forceCanonicalLanguage": false
  }
}
```



#### 2.2.1 Exact Locale Matching
When a user's browser/preference is `es-MX` (Spanish, Mexico):

```
Precedence for UI Chrome:
  1. Exact match: es-MX strings
  2. Language-only fallback: es (Spain) strings
  3. Canonical: en (English) strings
```

#### 2.2.2 Storage and Display
- **In Database:** Store as `language-region` (e.g., `es-MX`)
- **In UI Settings Dropdown:** Group by language, show region in parentheses
  ```
  Spanish
    ├─ Español (España) [es-ES]
    ├─ Español (México) [es-MX]
    └─ Español (Argentina) [es-AR]
  ```
- **In API Responses:** Always return the normalized locale code used (e.g., `"locale": "es"` if user requested `es-MX` but only `es` exists)

#### 2.2.3 String File Organization
```
localization/
├─ en.json              # English (canonical)
├─ es.json             # Spanish (shared for all es-* regions)
├─ es-MX.json          # (Optional) Mexico-specific overrides
├─ pt.json             # Portuguese (shared for pt-BR, pt-PT)
└─ pt-BR.json          # (Optional) Brazil-specific overrides
```

### 2.3 Adding a New Locale: Requirements Checklist

To support a new language (e.g., `de` German), the following MUST be completed before setting status to "Production":

- [ ] **String Translation**
  - [ ] All UI chrome strings translated (1000+ keys)
  - [ ] Review by native speaker + product team
  - [ ] Terminology glossary created (e.g., "Blog" → "Beitrag")

- [ ] **Content Baseline**
  - [ ] At least 5 high-priority blog posts translated
  - [ ] Home page, About, FAQ in new language

- [ ] **Font & Typography**
  - [ ] Test font rendering for all scripts
  - [ ] Verify RTL support (if applicable)
  - [ ] Line-height, letter-spacing adjusted for language

- [ ] **Quality Assurance**
  - [ ] Full UI regression test in new language
  - [ ] Pseudolocalization test (accented strings) passed
  - [ ] RTL layout test (if applicable)

- [ ] **Voice (if applicable)**
  - [ ] STT (Speech-to-Text) model available for language
  - [ ] TTS (Text-to-Speech) voice(s) available
  - [ ] Test voice chat end-to-end

- [ ] **Legal/Compliance**
  - [ ] Terms of Service translated
  - [ ] Privacy Policy translated
  - [ ] GDPR/local consent flows reviewed
  - [ ] Accessibility (WCAG 2.1 AA) verified in new language

- [ ] **Documentation**
  - [ ] Locale code added to this spec
  - [ ] Glossary published for translators
  - [ ] Design system locale guide updated

---

## 3. Language Negotiation Rules

### 3.1 Language Resolution Priority Matrix

Three independent surfaces require different resolution rules:

| Surface | Resolution Type | Persistence | Example |
|---------|-----------------|-------------|---------|
| **UI Chrome** | Single, global | User account or local storage | All navigation in `es` |
| **Blog Post** | Per-item | Content metadata + user choice | Read post #123 in `pt` |
| **Chat Conversation** | Per-conversation, per-message | Conversation settings + metadata | Conversation set to `fr` |
| **Voice (STT/TTS)** | Per-session | User input or conversation setting | Speak Portuguese; hear Spanish responses |

---

## 4. UI Chrome Language Resolution (Global Navigation, Buttons, Labels)

**Applies to:** Navigation menu, buttons, form labels, error messages, settings screens, modal dialogs.

### 4.1 Language Resolution Priority (Highest → Lowest)

```
1. Explicit UI Language Setting (User-chosen)
   └─ Stored: User account (if signed in) OR Browser localStorage
   └─ Key: localization.uiLanguage

2. Account Language Preference (Signed-in users)
   └─ If no explicit UI setting, use account.preferredLanguage
   └─ (Can be set on account settings page)

3. Browser/Device Locale
   └─ navigator.language or navigator.languages[0]
   └─ Examples: "es-MX", "pt-BR"

4. Fallback: Canonical Language (English)
   └─ en (always available)
```

### 4.2 Requirements

| Requirement | Rule |
|-------------|------|
| **No Auto-Switching** | UI language MUST NOT change mid-session unless user explicitly changes it. If device locale changes, do NOT update UI language. |
| **Session Persistence** | UI language MUST persist across page refreshes. |
| **Cross-Device Persistence** | If user signed in: UI language MUST sync across devices (stored in user account). If guest: persist only on device. |
| **Settings Visibility** | Language setting MUST be discoverable in account settings (main nav or user menu) |
| **Granular Control** | SHOULD allow UI language separate from content language preference |

### 4.3 Implementation: Browser Storage & Sync

#### On First Visit (Unsigned-in User)
```javascript
// Pseudo-code: Locale negotiation flow
function resolveUILanguage() {
  // Step 1: Check localStorage (user previously set)
  const stored = localStorage.getItem('localization.uiLanguage');
  if (stored && isSupportedLocale(stored)) {
    return stored;
  }

  // Step 2: Check account preference (if signed in)
  if (user.isSignedIn && user.account.preferredLanguage) {
    return user.account.preferredLanguage;
  }

  // Step 3: Browser locale
  const browserLocale = navigator.language; // e.g., "pt-BR"
  const normalized = normalizeLocale(browserLocale);
  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  // Step 4: Fallback to English
  return 'en';
}

function normalizeLocale(locale) {
  // es-MX → check if es-MX supported, else es
  if (isSupportedLocale(locale)) return locale;
  
  const [language] = locale.split('-');
  if (isSupportedLocale(language)) return language;
  
  return 'en';
}
```

#### When User Changes UI Language
```javascript
function setUILanguage(newLocale) {
  // Validate
  if (!isSupportedLocale(newLocale)) {
    throw new Error(`Locale ${newLocale} not supported`);
  }

  // Persist to localStorage (immediate)
  localStorage.setItem('localization.uiLanguage', newLocale);

  // Sync to account (if signed in)
  if (user.isSignedIn) {
    await api.patch('/account/preferences', {
      preferredLanguage: newLocale
    });
  }

  // Reload UI strings (i18n library)
  await i18n.changeLanguage(newLocale);

  // Optionally: Show confirmation toast
  showToast(t('settings.languageChanged')); // Uses new locale
}
```

### 4.4 User-Facing Copy Examples

#### Language Settings Page
```
┌─ Account Settings ────────────────
│
│ Language & Region
│ ┌─────────────────────────────────┐
│ │ Interface Language              │
│ │ (Applies to all menus & buttons)│
│ │                                 │
│ │ [Dropdown: "Español (México)"] ▼│
│ │                                 │
│ │ □ Use browser language          │
│ │   (Automatically adjust UI when │
│ │    your device language changes)│
│ └─────────────────────────────────┘
│
│ [Save]
└──────────────────────────────────
```

---

## 5. Blog Post Language Resolution (Per-Post)

**Applies to:** Blog post, article, news item, documentation page.

### 5.1 Data Model: Blog Post with Language Variants

```typescript
interface BlogPost {
  id: string;
  slug: string;
  canonicalLanguage: 'en';  // MUST be 'en'
  
  // Primary content (canonical language)
  title: string;           // In English
  content: string;         // In English, HTML
  author: string;
  publishedDate: ISO8601;
  
  // Available translations
  translations: {
    [locale: string]: {      // Key: 'es', 'pt', 'fr', etc.
      title: string;
      content: string;
      translatedBy?: string;
      translationDate?: ISO8601;
    }
  };
  
  // Metadata
  tags: string[];
  contentLanguages: string[]; // ['en', 'es', 'pt'] – computed from translations
}
```

### 5.2 Language Resolution Priority (for Viewing a Post)

```
1. User Explicit Post Language Choice (from "Switch language" button)
   └─ Scoped to THIS post only
   └─ Stored: sessionStorage[`post_${postId}_language`]

2. User Content Language Preference
   └─ "I prefer to read content in Español"
   └─ Stored: User account OR localStorage

3. Browser/Device Locale Match
   └─ Attempt exact: pt-BR
   └─ Fallback: pt (language-only)
   └─ Fallback: en (canonical)

4. Canonical Language (English)
   └─ Always available, displayed if no other match
```

### 5.3 Requirements

| Requirement | Rule |
|-------------|------|
| **Canonical Always Available** | Every blog post MUST exist in `en` (English). No exceptions. |
| **Partial Localization** | Blog posts MAY be translated into `es`, `pt`, etc., but NOT REQUIRED. |
| **Explicit Fallback** | When displaying a post in a language other than requested, MUST show a banner: "This post is not available in [Requested Language]. Showing English." |
| **Available Languages List** | MUST display "Available in: English, Español, Português" (link to switch per language) |
| **Page-Scoped vs Global** | Language choice on a post SHOULD be page-scoped (doesn't change overall content preference) UNLESS user clicks "Set as my content language preference" |

### 5.4 User-Facing Copy: Fallback Banners

#### Scenario: User in Español, Post Only in English

```
┌─────────────────────────────────────────────┐
│ ⓘ  This post is not yet available in        │
│     Español. Showing English.                │
│                                              │
│     Available in: English                    │
│     [ Request Translation ]                  │
└─────────────────────────────────────────────┘

[Blog Post Title – English]
[Blog Post Content – English]

At bottom of post:
─────────────────────────────────────────────
Available in:
  🔹 English (current)
  
Not translated: Español, Português

[Suggest a translation] [Read in another post]
```

#### Scenario: User in Português (Portugal), Post Available in pt-BR

```
┌─────────────────────────────────────────────┐
│ ⓘ  This post is available in Português      │
│     (Brazil). Using that version.            │
│                                              │
│     [ Use English ]  [ Use another... ]      │
└─────────────────────────────────────────────┘

[Blog Post Title – Portuguese (Brazil)]
[Blog Post Content]
```

#### Language Selector Component (Bottom of Post)

```
┌─ Available Languages ─────────────────────┐
│                                           │
│ English        [★ Current]                │
│ Español        [Switch]                   │
│ Português      [Switch]                   │
│                                           │
│ [ Set Português as my default language ]  │
└───────────────────────────────────────────┘
```

### 5.5 Implementation: Post Language Resolution

```typescript
interface PostResolutionContext {
  postId: string;
  post: BlogPost;
  userLanguagePreference?: string;      // Account or localStorage
  browserLocale: string;                 // navigator.language
  sessionLanguageOverride?: string;      // From "Switch language" button
}

function resolvePostLanguage(ctx: PostResolutionContext): {
  language: string;
  fallbackReason?: string;
} {
  const available = ctx.post.contentLanguages;

  // Step 1: Session override (user clicked "Switch language")
  if (ctx.sessionLanguageOverride && available.includes(ctx.sessionLanguageOverride)) {
    return { language: ctx.sessionLanguageOverride };
  }

  // Step 2: User content language preference
  if (ctx.userLanguagePreference && available.includes(ctx.userLanguagePreference)) {
    return { language: ctx.userLanguagePreference };
  }

  // Step 3: Browser locale match (exact, then language-only)
  const normalized = normalizeLocale(ctx.browserLocale);
  if (available.includes(normalized)) {
    return { language: normalized };
  }

  // Step 4: Canonical fallback (English)
  return { 
    language: 'en',
    fallbackReason: `Requested language not available. Available: ${available.join(', ')}`
  };
}

// Show banner if fallback occurred
function renderPostWithBanner(post: BlogPost, resolution: ReturnType<typeof resolvePostLanguage>) {
  const content = post.translations[resolution.language] || post;
  
  if (resolution.fallbackReason) {
    return (
      <>
        <FallbackBanner
          reason={resolution.fallbackReason}
          language={resolution.language}
          availableLanguages={post.contentLanguages}
        />
        <BlogPostContent {...content} />
      </>
    );
  }

  return <BlogPostContent {...content} />;
}
```

---

## 6. Chat Conversation Language Resolution

**Applies to:** Active chat conversation, message input/output, assistant responses, generated content.

### 6.1 Data Model: Chat Conversation with Language Tracking

```typescript
interface ChatConversation {
  id: string;
  userId: string;
  
  // Conversation-level language setting
  conversationLanguage: string;  // 'en', 'es', 'pt', etc. (mutable)
  
  // Messages
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  
  // Content
  content: string;
  
  // Language metadata
  detectedLanguage?: string;     // STT output, or language detection
  intentLanguage: string;        // What language does the user intend?
  displayLanguage: string;       // What language was this rendered in?
  
  // Timestamps
  createdAt: ISO8601;
}
```

### 6.2 Conversation Language: Two Modes

#### Mode A: Single-Language Conversation (Recommended)
User sets "I want this conversation in Español" → all messages use Spanish.

```
Conversation Language Setting: Español

User Input (English):
  "What is climate change?"
  └─ Detected as English

Assistant Decision:
  ✓ Detected language ≠ Conversation language
  ✓ Ask user once: "You wrote in English, but this conversation is in Español.
                     Do you want to switch to English?"
  
  If yes → Change conversation to 'en'
  If no → Respond in Español (translate/summarize user intent)
```

#### Mode B: Flexible Multi-Language Conversation
User has NOT set a conversation language → assistant adapts.

```
No Conversation Language Set

Message 1: User writes in English
  → Assistant responds in English
  → Conversation language auto-set to 'en'

Message 2: User writes in Español
  → Detected language ≠ Conversation language
  → Ask: "Did you want to switch to Español?"
  
  If yes → Auto-switch, continue in Español
  If no → Respond in English, translate intent if needed
```

### 6.3 Language Resolution Priority for Assistant Response

```
1. Conversation Language Setting (explicit, mutable)
   └─ User set "I want Spanish" → respond in Spanish

2. Detected User Input Language
   └─ User input detected as Portuguese
   └─ If ≠ conversation language, ASK before switching

3. User Account Preference (Content Language)
   └─ "I prefer to consume content in Português"
   └─ Applied if no conversation language + no clear user input language

4. Default: UI Chrome Language
   └─ If all else fails, respond in same language as UI

5. Fallback: English
   └─ If generation not supported in target language
```

### 6.4 Requirements

| Requirement | Rule |
|-------------|------|
| **Ask Before Switching** | When user input language ≠ conversation language, MUST ask before proceeding. Show: "I detected you wrote in [Language]. Do you want to switch this conversation to [Language]?" with [Yes] [No] buttons. |
| **Ask Once Per Conversation** | If user clicks [No] once, do NOT ask again for same language (remember in conversation context). |
| **Clear Indication** | Each message MUST show or indicate its display language (especially when different from setting). Consider inline label: "(Showing in Español)" |
| **Unsupported Language Generation** | If user requests response in a language not supported for generation (e.g., `de` German), show: "I can read German, but I can only respond in English, Español, and Português. Please choose one." |
| **Per-Conversation Isolation** | Language setting is per-conversation. User can start a new conversation in a different language without affecting others. |
| **Persistence** | Conversation language setting MUST persist; user can edit it in conversation info/settings. |

### 6.5 User-Facing Copy: Language Prompt Examples

#### Prompt 1: Detected Language Differs from Conversation Language
```
┌──────────────────────────────────────────────┐
│ You wrote in Español, but this conversation  │
│ is in English.                               │
│                                              │
│ Do you want to switch to Español?            │
│                                              │
│ [ Yes, switch to Español ]  [ No, stay English ] │
└──────────────────────────────────────────────┘
```

**Copy variants by language:**
- **en:** "You wrote in [Language], but this conversation is in English. Switch to [Language]?"
- **es:** "Escribiste en [Idioma], pero esta conversación está en Español. ¿Cambiar a [Idioma]?"
- **pt:** "Você escreveu em [Idioma], mas esta conversa está em Português. Mudar para [Idioma]?"

#### Prompt 2: Unsupported Generation Language
```
┌──────────────────────────────────────────────┐
│ I can understand German, but I can only      │
│ respond in:                                  │
│                                              │
│ • English                                    │
│ • Español                                    │
│ • Português                                  │
│                                              │
│ Please choose a language for my response.    │
│ [ English ]  [ Español ]  [ Português ]      │
└──────────────────────────────────────────────┘
```

#### Message-Level Language Indicator
```
User: "Hola, ¿cómo estás?"

┌─ Assistant (Español) ─────────────────────┐
│ ¡Hola! Estoy bien, gracias por preguntar. │
│ ¿Cómo puedo ayudarte hoy?                 │
└───────────────────────────────────────────┘

Meta-info (optional, below message):
"(Showing in Español)"
```

### 6.6 Implementation: Conversation Language Resolution

```typescript
interface MessageResolutionContext {
  message: ChatMessage;
  conversation: ChatConversation;
  userLanguagePreference?: string;
  uiLanguage: string;
}

function resolveMessageLanguage(ctx: MessageResolutionContext): {
  displayLanguage: string;
  requiresLanguageSwitch?: boolean;
  switchPromptCopy?: string;
} {
  const { 
    message, 
    conversation, 
    userLanguagePreference,
    uiLanguage 
  } = ctx;

  // Step 1: Conversation language (if set)
  if (conversation.conversationLanguage) {
    // Check if user input language differs
    if (message.detectedLanguage && 
        message.detectedLanguage !== conversation.conversationLanguage &&
        !wasAlreadyAsked(conversation.id, message.detectedLanguage)) {
      
      return {
        displayLanguage: conversation.conversationLanguage,
        requiresLanguageSwitch: true,
        switchPromptCopy: t('chat.switchLanguagePrompt', {
          detectedLang: message.detectedLanguage,
          conversationLang: conversation.conversationLanguage
        })
      };
    }

    return { displayLanguage: conversation.conversationLanguage };
  }

  // Step 2: Detected language from user input
  if (message.detectedLanguage) {
    return { displayLanguage: message.detectedLanguage };
  }

  // Step 3: User content language preference
  if (userLanguagePreference) {
    return { displayLanguage: userLanguagePreference };
  }

  // Step 4: UI language
  if (uiLanguage) {
    return { displayLanguage: uiLanguage };
  }

  // Step 5: Default to English
  return { displayLanguage: 'en' };
}

function wasAlreadyAsked(conversationId: string, language: string): boolean {
  // Check conversation history: have we already asked about this language?
  // Implementation: could store in conversation context or check message metadata
  return false; // Placeholder
}
```

---

## 7. Voice Chat Language Resolution (STT/TTS)

**Applies to:** Speech-to-Text input, Text-to-Speech output, voice selection.

### 7.1 Dual-Language Voice Model

Voice chat involves TWO independent language choices:

| Component | Purpose | Default |
|-----------|---------|---------|
| **STT Language (Input)** | Which language model interprets user's speech | Conversation language OR browser locale |
| **TTS Language (Output)** | Which voice/language model generates assistant's spoken response | Conversation language OR UI language |

### 7.2 Voice Settings UI

```
┌─ Chat Settings ──────────────────────────┐
│                                          │
│ Voice Chat                               │
│ ┌──────────────────────────────────────┐│
│ │ Input Language (Speech-to-Text)       ││
│ │ [Dropdown: "Português"]            ▼  ││
│ │                                       ││
│ │ Output Language (Text-to-Speech)      ││
│ │ [Dropdown: "Español"]              ▼  ││
│ │                                       ││
│ │ Voice (TTS)                           ││
│ │ [Dropdown: "Rosa (Female, Spain)"] ▼  ││
│ │                                       ││
│ │ □ Auto-detect input language          ││
│ │   (Attempt to identify speech)        ││
│ └──────────────────────────────────────┘│
│                                          │
│ [Save]                                   │
└──────────────────────────────────────────┘
```

### 7.3 Requirements

| Requirement | Rule |
|-------------|------|
| **STT Language Availability** | MUST verify that chosen STT language is available for the platform (Cognitive Services Voice API, etc.). If unavailable, fallback with user notification: "Speech recognition not available for [Language]. Using text input instead." |
| **TTS Voice Selection** | MUST support multiple voices per language. Allow user to select voice (gender, accent, etc.). Cache voice selection in conversation settings. |
| **Language Mismatch Handling** | If STT language ≠ TTS language (e.g., user speaks Portuguese, responds in English), MUST show indicator: "(You spoke in Português; responding in English)" |
| **Auto-Detect STT** | If enabled, auto-detect user's speech language on first message. If detected language ≠ conversation language, apply same "switch language?" prompt as text chat. |
| **Voice Fallback** | If chosen voice unavailable (e.g., regional variant), fallback to base language voice with user notification. |

### 7.4 User-Facing Copy: Voice Fallbacks

#### Fallback 1: STT Language Not Available
```
┌─────────────────────────────────────────┐
│ ✗ Speech recognition not available      │
│   for Catalan (ca).                     │
│                                         │
│ Supported languages for voice input:    │
│ • English                               │
│ • Español                               │
│ • Português                             │
│                                         │
│ Please switch to a supported language   │
│ or use text input.                      │
│                                         │
│ [ Switch Language ]  [ Use Text Input ] │
└─────────────────────────────────────────┘
```

#### Fallback 2: Voice Not Available for Region
```
┌─────────────────────────────────────────┐
│ ⓘ Voice "Carlos (Spain)" not available. │
│   Using "Carlos (Mexico)" instead.      │
│                                         │
│ [ Choose Different Voice ]               │
└─────────────────────────────────────────┘
```

---

---

## 8. Admin Localization Tool: Content Diff Tracking & Export

**Purpose:** Enable content admins and localization teams to identify what blog posts/content need translation, manage localization workflows, export translation files, and publish updates.

### 8.1 Overview: Localization Diff Tracking

The admin tool tracks when content changes and marks which translations are "stale" (out of sync with canonical English).

```
Content Lifecycle:
  1. Admin updates blog post in English
     └─ Post marked as "canonical updated"
  
  2. Admin dashboard shows:
     ├─ Spanish translation: STALE (last sync 2025-12-01)
     ├─ French translation: STALE (last sync 2025-11-15)
     └─ German translation: STALE (last sync 2025-10-20)
  
  3. Admin exports "Translation Pack" for Spanish
     └─ Includes: English original + Spanish existing + Diff (marked unchanged sections)
     └─ Format: CSV, JSON, or TAB (for external translator)
  
  4. External translator updates translation
  
  5. Admin imports updated translation
     └─ Post marked as "Spanish translation: CURRENT"
```

### 8.2 Content Version Tracking Model

```typescript
interface BlogPost {
  id: string;
  slug: string;
  canonicalLanguage: 'en';
  
  // English content (canonical)
  title: string;
  content: string;
  
  // Version tracking
  canonicalVersion: {
    versionId: string;
    lastModifiedBy: string;
    lastModifiedDate: ISO8601;
    changeHash: string;  // Hash of content for diff detection
  };
  
  // Translation status per language
  translations: {
    [locale: string]: {
      title: string;
      content: string;
      versionId: string;  // Which canonical version this translates
      translationStatus: 'current' | 'stale' | 'in_progress' | 'needs_review';
      translatedBy?: string;
      translationDate?: ISO8601;
      lastReviewedBy?: string;
      lastReviewedDate?: ISO8601;
      diffFromCanonical?: {
        canonicalVersionId: string;
        changedSections: string[];  // Which sections of canonical changed
        changePercentage: number;    // 0-100% how much changed
      };
    }
  };
  
  // Localization metadata
  localizationMetadata: {
    targetLanguages: string[];  // ['es', 'pt', 'fr', etc.]
    completionPercentage: number;  // % of target languages with current translations
    lastComprehensiveUpdate?: ISO8601;  // Last time all translations were current
  };
}
```

### 8.3 Admin Dashboard: Localization Status Page

```
┌─ Localization Hub ─────────────────────────────────────────┐
│                                                              │
│ 📊 Platform-Wide Localization Status                        │
│ ────────────────────────────────────────────────────────   │
│                                                              │
│ Language      | Total Posts | Translated | Status           │
│ ─────────────┼─────────────┼────────────┼───────────────   │
│ English (en)  | 150         | 150 (100%) | ✅ Complete     │
│ Spanish (es)  | 150         | 142 (95%)  | ⚠️ 8 posts stale│
│ Portuguese    | 150         | 138 (92%)  | ⚠️ 12 posts stale│
│ French (fr)   | 150         | 125 (83%)  | ⚠️ 25 posts stale│
│ German (de)   | 150         | 110 (73%)  | ⚠️ 40 posts stale│
│ Chinese       | 150         | 95 (63%)   | ⚠️ 55 posts stale│
│ Japanese      | 150         | 85 (57%)   | ⚠️ 65 posts stale│
│ Hindi (hi)    | 150         | 72 (48%)   | ⚠️ 78 posts stale│
│                                                              │
│ 🔧 Actions:                                                 │
│ [ Export All Stale Translations ] [ View Translation Queue ]│
│ [ Generate Report ] [ Sync All from Canonical ]             │
└──────────────────────────────────────────────────────────────┘
```

### 8.4 Localization Export/Import Workflow

#### 8.4.1 Export Localization Pack

**Request:**
```
GET /api/admin/localization/export
Query params:
  - locale: 'es' (target language to translate)
  - scope: 'platform' | 'event' (platform-wide or single event)
  - eventId?: 'event-123' (required if scope=event)
  - filter: 'stale' | 'untranslated' | 'all' (which posts to include)
  - format: 'csv' | 'json' | 'xliff' (translation file format)
```

**Response (format=json):**
```json
{
  "exportId": "exp-2026-01-29-001",
  "exportDate": "2026-01-29T15:30:00Z",
  "targetLocale": "es",
  "scope": "platform",
  "posts": [
    {
      "postId": "post-123",
      "slug": "climate-change-explained",
      "status": "stale",
      "canonical": {
        "title": "Climate Change Explained (Updated Jan 2026)",
        "content": "<p>New content about latest findings...</p>",
        "lastModified": "2026-01-15T10:00:00Z"
      },
      "existing_translation": {
        "title": "El Cambio Climático Explicado",
        "content": "<p>Contenido anterior...</p>",
        "translatedDate": "2025-12-01T14:22:00Z"
      },
      "diff": {
        "changedSections": ["introduction", "findings"],
        "changePercentage": 35,
        "instructions": "Update 'introduction' section and 'findings' section; keep rest as-is"
      }
    },
    {
      "postId": "post-124",
      "slug": "renewable-energy-trends",
      "status": "untranslated",
      "canonical": {
        "title": "Renewable Energy Trends 2026",
        "content": "<p>Solar and wind adoption reaches...</p>"
      },
      "instructions": "New post, translate from scratch"
    }
  ],
  "downloadUrl": "/downloads/localization-export-exp-2026-01-29-001-es.json"
}
```

**Response (format=csv):**
```
postId,slug,status,sectionType,english,existing_translation,translator_notes,updated_translation
post-123,climate-change,stale,title,Climate Change Explained (Updated Jan 2026),El Cambio Climático Explicado,,
post-123,climate-change,stale,content-intro,"New content about latest findings...",,"[TRANSLATOR: Update this section]",
post-124,renewable-energy,untranslated,title,Renewable Energy Trends 2026,,"[NEW POST]",
```

#### 8.4.2 Import Translated Content

**Request:**
```
POST /api/admin/localization/import
Content-Type: multipart/form-data

Form data:
  - file: <translation-pack.json or .csv>
  - exportId: 'exp-2026-01-29-001'
  - locale: 'es'
  - reviewStatus: 'draft' | 'in_review' | 'approved'
  - importedBy: 'translator-user-123'
```

**Response:**
```json
{
  "importId": "imp-2026-01-29-005",
  "importDate": "2026-01-29T16:45:00Z",
  "locale": "es",
  "summary": {
    "total_posts": 33,
    "updated": 8,
    "created": 0,
    "errors": 2,
    "warnings": 3
  },
  "results": [
    {
      "postId": "post-123",
      "action": "updated",
      "status": "in_review",
      "message": "Spanish translation updated. Ready for review."
    },
    {
      "postId": "post-456",
      "action": "error",
      "message": "Post not found in database"
    }
  ],
  "nextSteps": [
    "Review 8 updated posts at /admin/localization/review",
    "Publish when approved"
  ]
}
```

### 8.5 Localization Review & Publishing

#### 8.5.1 Review Workflow

```
┌─ Localization Review ──────────────────────────────────────┐
│                                                             │
│ Language: Español | Imported: Jan 29 | Translator: Maria  │
│                                                             │
│ 📋 Posts Ready for Review (8 total)                         │
│                                                             │
│ ☐ post-123: "Climate Change Explained"                     │
│    Status: [Draft] → [In Review] → [Approved]             │
│                                                             │
│    English (Original):                                     │
│    ┌────────────────────────────────────────────────────┐ │
│    │ Climate Change Explained (Updated Jan 2026)        │ │
│    │ New content about latest findings...               │ │
│    └────────────────────────────────────────────────────┘ │
│                                                             │
│    Español (Translation):                                  │
│    ┌────────────────────────────────────────────────────┐ │
│    │ El Cambio Climático Explicado (Actualizado...)    │ │
│    │ Contenido nuevo sobre hallazgos recientes...       │ │
│    └────────────────────────────────────────────────────┘ │
│                                                             │
│    Review Actions:                                         │
│    [ ✓ Approve ] [ 🔄 Request Changes ] [ ✗ Reject ]     │
│    [ 📝 Add Comment ]                                      │
│                                                             │
│ ☐ post-124: "Renewable Energy Trends"                      │
│ ...                                                         │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐│
│ │ [ Review All ] [ Approve All ] [ Reject All ]          ││
│ │ [ Publish Approved ] [ Export Review Report ]          ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### 8.5.2 Publish to Live

**Request:**
```
POST /api/admin/localization/publish
{
  "locale": "es",
  "postIds": ["post-123", "post-124", "post-125"],
  "publishAction": "update_translations",
  "approvalNotes": "All reviewed and approved by QA team"
}
```

**Response:**
```json
{
  "publishId": "pub-2026-01-29-018",
  "status": "published",
  "locale": "es",
  "postsPublished": 3,
  "publishedDate": "2026-01-29T17:00:00Z",
  "message": "3 Spanish translations published. Live users will see updates within 5 minutes."
}
```

### 8.6 Event-Level Localization Export/Import

Events can also have event-specific translations (blog posts, welcome messages, event details).

**Request:**
```
GET /api/admin/events/:eventId/localization/export
Query params:
  - locale: 'pt' (target language)
  - contentTypes: 'blog_posts' | 'event_details' | 'all'
  - format: 'json' | 'csv' | 'xliff'
```

**Response** follows same structure as platform export, but filtered to event's content.

### 8.7 Diff Highlights & Translation Hints

When exporting, system automatically highlights what changed in canonical:

```json
{
  "postId": "post-999",
  "diff": {
    "changedSections": [
      {
        "sectionId": "intro",
        "type": "paragraph",
        "oldText": "Solar energy accounts for 5% of global electricity...",
        "newText": "Solar energy accounts for 12% of global electricity (2026 data)...",
        "changeType": "modified",
        "changePercentage": 40
      }
    ],
    "unchangedSections": [
      {
        "sectionId": "conclusion",
        "guidance": "Keep existing translation; no changes needed"
      }
    ],
    "recommendation": "Re-translate introduction; reuse other sections"
  }
}
```

### 8.8 Localization Reporting

**Admin can generate:**
- Translation completion report (% by language)
- Stale content report (posts with outdated translations)
- Translation velocity report (translations/month by language)
- Translator performance report (accuracy, turnaround time)
- Cost estimate report (estimated translation hours needed)

```
GET /api/admin/localization/reports
Query:
  - reportType: 'completion' | 'stale' | 'velocity' | 'quality' | 'cost'
  - locale?: 'es' (optional, filter to single language)
  - dateRange?: 'week' | 'month' | 'quarter' | 'year'
  - format: 'json' | 'pdf' | 'csv'
```

---



### 8.1 Content Endpoints

#### GET /api/blog/:postId
```json
GET /api/blog/slug/my-post-slug?locale=es

Response:
{
  "id": "post-123",
  "slug": "my-post-slug",
  "canonicalLanguage": "en",
  "contentLanguages": ["en", "es", "pt"],
  "title": "El Cambio Climático Explicado",
  "content": "<p>...</p>",
  "requestedLocale": "es",
  "resolvedLocale": "es",
  "fallbackApplied": false,
  "availableLocales": [
    {
      "locale": "en",
      "label": "English",
      "isCurrent": false,
      "isCanonical": true
    },
    {
      "locale": "es",
      "label": "Español",
      "isCurrent": true,
      "isCanonical": false
    }
  ]
}
```

#### POST /api/blog/:postId/translate
```json
POST /api/blog/123/translate
{
  "targetLocale": "pt",
  "translationKey": "backend-generated-id"
}

Response (if translation exists):
{
  "postId": "123",
  "locale": "pt",
  "title": "Mudança Climática Explicada",
  "content": "...",
  "translatedDate": "2026-01-15",
  "translatedBy": "translator-user-123"
}

Response (if not exists, return 404):
{
  "error": "translation_not_found",
  "message": "Portuguese translation not available",
  "availableLocales": ["en", "es"]
}
```

### 8.2 Chat Endpoints

#### GET /api/chat/conversations/:conversationId
```json
{
  "id": "conv-456",
  "conversationLanguage": "es",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Hola",
      "detectedLanguage": "es",
      "intentLanguage": "es",
      "displayLanguage": "es",
      "createdAt": "2026-01-29T10:00:00Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "¡Hola! ¿Cómo estás?",
      "intentLanguage": "es",
      "displayLanguage": "es",
      "createdAt": "2026-01-29T10:00:05Z"
    }
  ]
}
```

#### POST /api/chat/conversations/:conversationId/messages
```json
POST /api/chat/conversations/conv-456/messages
{
  "content": "What is climate change?",
  "detectedLanguage": "en"  // From STT or user setting
}

Response:
{
  "message": {
    "id": "msg-3",
    "role": "user",
    "content": "What is climate change?",
    "detectedLanguage": "en",
    "intentLanguage": "en",
    "displayLanguage": "en"
  },
  "languageSwitchRequired": true,
  "languageSwitchPrompt": {
    "type": "detected_language_differs",
    "message": "You wrote in English, but this conversation is in Español. Switch to English?",
    "detectedLanguage": "en",
    "conversationLanguage": "es"
  },
  "aiResponse": null  // Null until language is confirmed
}

// User responds to language switch
POST /api/chat/conversations/conv-456/messages/msg-3/confirm-language
{
  "action": "switch" | "keep"  // Switch conversation to English OR keep Español
}

Response:
{
  "conversationLanguage": "en",  // Updated
  "aiResponse": {
    "id": "msg-4",
    "role": "assistant",
    "content": "Climate change...",
    "displayLanguage": "en"
  }
}
```

#### PATCH /api/chat/conversations/:conversationId
```json
PATCH /api/chat/conversations/conv-456
{
  "conversationLanguage": "pt"
}

Response:
{
  "id": "conv-456",
  "conversationLanguage": "pt"
}
```

### 8.3 Localization Config Endpoint

#### GET /api/localization/config
```json
{
  "supportedLocales": [
    {
      "code": "en",
      "label": "English",
      "nativeName": "English",
      "isCanonical": true,
      "capabilities": {
        "uiStrings": true,
        "contentTranslation": true,
        "tts": true,
        "stt": true
      }
    },
    {
      "code": "es",
      "label": "Español",
      "nativeName": "Español",
      "isCanonical": false,
      "capabilities": {
        "uiStrings": true,
        "contentTranslation": true,
        "tts": true,
        "stt": true
      }
    },
    {
      "code": "pt",
      "label": "Português",
      "nativeName": "Português",
      "isCanonical": false,
      "capabilities": {
        "uiStrings": true,
        "contentTranslation": true,
        "tts": true,
        "stt": true
      }
    }
  ],
  "ttsPolicies": {
    "supportedLanguages": ["en", "es", "pt"],
    "voicesAvailable": {
      "en": [
        { "code": "en-US-AvaNeural", "gender": "female", "accent": "US" },
        { "code": "en-GB-GeorgeNeural", "gender": "male", "accent": "GB" }
      ],
      "es": [
        { "code": "es-ES-ElviraNeural", "gender": "female", "accent": "Spain" },
        { "code": "es-MX-CarlosaNeural", "gender": "female", "accent": "Mexico" }
      ],
      "pt": [
        { "code": "pt-BR-FranciscaNeural", "gender": "female", "accent": "Brazil" }
      ]
    }
  },
  "sttPolicies": {
    "supportedLanguages": ["en", "es", "pt"]
  }
}
```

---

## 10. Admin Localization APIs

### 10.1 Localization Export Endpoint

**GET /api/admin/localization/export**

Query parameters:
- `locale` (required): Target language code (e.g., `es`, `pt`)
- `scope` (required): `platform` or `event`
- `eventId` (conditional): Required if scope=`event`
- `filter` (optional): `stale`, `untranslated`, or `all` (default: `stale`)
- `format` (optional): `json`, `csv`, or `xliff` (default: `json`)

Example request:
```
GET /api/admin/localization/export?locale=es&scope=platform&filter=stale&format=json
```

Response (JSON format):
```json
{
  "exportId": "exp-2026-01-29-001",
  "targetLocale": "es",
  "scope": "platform",
  "postsCount": 33,
  "downloadUrl": "/downloads/localization-pack-es-20260129.json",
  "summary": {
    "staleCount": 8,
    "untranslatedCount": 0,
    "currentCount": 142
  }
}
```

### 10.2 Localization Import Endpoint

**POST /api/admin/localization/import**

Multipart form data:
- `file` (required): Translation pack (JSON or CSV)
- `exportId` (required): Export ID to track
- `locale` (required): Language code
- `reviewStatus` (optional): `draft`, `in_review`, `approved` (default: `draft`)

Example request:
```
POST /api/admin/localization/import
Content-Type: multipart/form-data

file=<translation-pack.json>
exportId=exp-2026-01-29-001
locale=es
reviewStatus=draft
```

Response:
```json
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

### 10.3 Localization Review Endpoint

**PATCH /api/admin/localization/review/:postId**

Request body:
```json
{
  "locale": "es",
  "action": "approve" | "request_changes" | "reject",
  "comments": "Translation looks good, minor terminology adjustment needed",
  "approvedBy": "reviewer-user-123"
}
```

Response:
```json
{
  "postId": "post-123",
  "locale": "es",
  "status": "approved",
  "lastReviewedDate": "2026-01-29T17:30:00Z"
}
```

### 10.4 Publish Translations Endpoint

**POST /api/admin/localization/publish**

Request body:
```json
{
  "locale": "es",
  "postIds": ["post-123", "post-124", "post-125"],
  "publishAction": "update_translations",
  "approvalNotes": "All reviewed and approved"
}
```

Response:
```json
{
  "publishId": "pub-2026-01-29-018",
  "status": "published",
  "locale": "es",
  "postsPublished": 3,
  "publishedDate": "2026-01-29T17:00:00Z",
  "message": "3 Spanish translations published. Live in 5 minutes."
}
```

### 10.5 Localization Reports Endpoint

**GET /api/admin/localization/reports**

Query parameters:
- `reportType`: `completion`, `stale`, `velocity`, `quality`, `cost`
- `locale` (optional): Filter to single language
- `dateRange` (optional): `week`, `month`, `quarter`, `year`
- `format` (optional): `json`, `pdf`, `csv`

Example request:
```
GET /api/admin/localization/reports?reportType=completion&format=json
```

Response:
```json
{
  "reportId": "rep-2026-01-29-042",
  "reportType": "completion",
  "generatedDate": "2026-01-29T18:00:00Z",
  "summary": {
    "totalLanguages": 8,
    "completionRate": 78.5,
    "languageBreakdown": [
      { "locale": "es", "completion": 95, "status": "high" },
      { "locale": "pt", "completion": 92, "status": "high" },
      { "locale": "fr", "completion": 83, "status": "medium" },
      { "locale": "de", "completion": 73, "status": "medium" },
      { "locale": "zh-CN", "completion": 63, "status": "low" },
      { "locale": "ja", "completion": 57, "status": "low" },
      { "locale": "hi", "completion": 48, "status": "low" }
    ]
  },
  "recommendations": [
    "Prioritize Chinese and Hindi translations",
    "Schedule review for stale French translations"
  ]
}
```

---

## 11. QA & Test Matrix

### 9.1 Test Scenarios by Surface

#### 9.1.1 UI Chrome Language Tests

| Test Case | Precondition | Action | Expected Outcome |
|-----------|--------------|--------|------------------|
| **TC-UI-001** | User on home page, no localStorage | Browser locale = es-MX | UI renders in Español |
| **TC-UI-002** | User signed in, account.preferredLanguage = pt | Browser locale = en-US | UI renders in Português (account overrides browser) |
| **TC-UI-003** | User changes UI to Español in settings | Reload page | UI still in Español (localStorage persists) |
| **TC-UI-004** | User signed in, changes UI to Português | Sign out → sign in from new device | UI in Português on new device (account syncs) |
| **TC-UI-005** | UI language = es, browser language changes to pt | Device locale changes mid-session | UI remains Español (no auto-switch) |
| **TC-UI-006** | Locale dropdown shown in settings | Click "Use browser language" option | UI switches to browser locale on page refresh |

#### 9.1.2 Blog Post Language Tests

| Test Case | Precondition | Action | Expected Outcome |
|-----------|--------------|--------|------------------|
| **TC-BLOG-001** | Post available in en, es, pt | Request post with locale=pt | Post rendered in Português, no banner |
| **TC-BLOG-002** | Post available in en, es (NO pt) | Request post with locale=pt | Post rendered in English, fallback banner shown with "Available in: English, Español" |
| **TC-BLOG-003** | User content language preference = es | Open post available in es | Post renders in Español automatically |
| **TC-BLOG-004** | User on post in es | Click "Switch to English" | Post reloads in English, session override saved |
| **TC-BLOG-005** | User on post in es, clicks "Set as my content language" | Refresh page | All subsequent posts attempt to load in Español |
| **TC-BLOG-006** | Post in en only | User requests es → sees fallback banner | Banner has [Request Translation] button → sends email to content team |

#### 9.1.3 Chat Language Tests

| Test Case | Precondition | Action | Expected Outcome |
|-----------|--------------|--------|------------------|
| **TC-CHAT-001** | New conversation, no language set | User types: "Hola, ¿cómo estás?" | Prompt appears: "You wrote in Español. Switch to Español?" |
| **TC-CHAT-002** | Conversation language = es | User types: "Hello, how are you?" | Prompt: "You wrote in English. Switch to English?" + [Yes] [No] buttons |
| **TC-CHAT-003** | Conversation language = es, user clicked [No] before on English | User types: "How is the weather?" | NO prompt shown (already declined), assistant responds in Español |
| **TC-CHAT-004** | Conversation language = en | Click "Edit conversation" → change to pt | Conversation language updates in DB; subsequent responses in Português |
| **TC-CHAT-005** | User requests language not supported (e.g., de German) | User types: "Antworte auf Deutsch" | Prompt: "I can read German, but I only respond in English, Español, Português. Choose one." |
| **TC-CHAT-006** | STT language = en, TTS language = es | User speaks: "What is climate change?" | Response in Español, indicator shows: "(You spoke English; responding in Español)" |

#### 9.1.4 Voice Chat Tests

| Test Case | Precondition | Action | Expected Outcome |
|-----------|--------------|--------|------------------|
| **TC-VOICE-001** | Voice input enabled, STT language = pt | User speaks in Portuguese | Speech recognized and transcribed in Portuguese |
| **TC-VOICE-002** | STT language = de (German, unsupported) | User clicks "Record" | Fallback prompt: "Speech recognition not available for German. Use text instead." |
| **TC-VOICE-003** | TTS voice = "Rosa (Spain)" selected | Conversation language changes to en | Voice changes to English voice automatically (or prompt user) |
| **TC-VOICE-004** | Auto-detect STT enabled | User speaks in Spanish (conversation = en) | STT detects Spanish; language switch prompt appears |

### 9.2 Regression Test Suite

- [ ] Pseudolocalization: replace all strings with accented versions (e.g., "Sëttïngs") → UI renders without layout breakage
- [ ] RTL layout test (if applicable): test layout for RTL languages (Arabic, Hebrew)
- [ ] Font loading: verify fonts for non-Latin scripts load correctly
- [ ] Performance: check localization doesn't impact page load (lazy-load i18n resources)
- [ ] Link integrity: verify all language-specific links resolve correctly
- [ ] Form validation: test error messages in all supported languages

### 9.3 Accessibility (WCAG 2.1 AA) Checklist

- [ ] Language code in HTML: `<html lang="es">` updates dynamically
- [ ] Language change announcement: Use ARIA to announce UI language changes
- [ ] Fallback banner accessible: Semantic HTML, screen reader compatible
- [ ] Label association: Form labels correctly associated in all languages
- [ ] Color contrast: Fallback banners meet WCAG AA contrast requirements
- [ ] Font size: Accommodates languages with larger character sets (e.g., Chinese)
- [ ] Voice selection: TTS voice descriptions clear; gender/accent labels accessible

---

## 10. Accessibility & Legal/HR Guardrails

### 10.1 Accessibility Requirements

#### 10.1.1 WCAG 2.1 AA Compliance (Mandatory)

| Criterion | Requirement |
|-----------|-------------|
| **1.3.1 Info and Relationships (Level A)** | Structural markup reflects language hierarchy. Fallback banners use semantic elements (`<aside role="status">` for alerts). |
| **2.4.4 Link Purpose (Level A)** | Language-switch links have clear text ("Switch to Español" not "Click here"). |
| **3.1.1 Language of Page (Level A)** | HTML `lang` attribute updated on language change. Announce change to screen readers. |
| **3.1.4 Unusual Words (Level AAA)** | Glossary provided for specialized terms (e.g., technical blog posts). |
| **2.4.3 Focus Order (Level A)** | Language selector in logical tab order. Focus visible when selecting language. |
| **1.4.3 Contrast (Minimum) (Level AA)** | Fallback banners: text must have 4.5:1 contrast ratio with background. |

#### 10.1.2 Screen Reader Testing
- [ ] Test with NVDA (Windows) and JAWS in all supported languages
- [ ] Test with VoiceOver (macOS/iOS) and TalkBack (Android)
- [ ] Verify language-switch announcements: "Interface language changed to Español"
- [ ] Fallback banner announced as "Alert: This post not available in Português"

#### 10.1.3 Language and Locale Accessibility
- [ ] Fonts support all language scripts (Latin, Cyrillic, Arabic, CJK, etc.)
- [ ] Line-height, letter-spacing adjusted for language (e.g., CJK often needs tighter spacing)
- [ ] Punctuation and diacritics render correctly (e.g., Portuguese ã, Spanish ñ)
- [ ] Hyphenation rules respect language (e.g., German compound words)

### 10.2 Legal & Compliance Requirements

#### 10.2.1 Terms & Privacy
- [ ] Terms of Service translated to all supported languages
- [ ] Privacy Policy translated; legal review completed
- [ ] GDPR compliance: consent flows translated; user understands what they're consenting to
- [ ] CCPA compliance: California users see appropriate notices in their preferred language

#### 10.2.2 Localization Review (Legal/HR)
- [ ] Content review for cultural sensitivity (e.g., no culturally inappropriate imagery)
- [ ] Compliance with local advertising/marketing regulations
- [ ] Verify no references to unsupported languages/regions that might be misleading

#### 10.2.3 Data Handling
- [ ] Store user language preference securely (encrypted in database)
- [ ] Log language choices for analytics (with user consent)
- [ ] Respect "do not track" signals; do not force language tracking

#### 10.2.4 Accessibility Statements
- [ ] Publish accessibility statement (WCAG level claimed, known issues, contact info)
- [ ] Available in all supported languages

### 10.3 Content Moderation & Translation Safety

#### 10.3.1 Translation Verification
- [ ] All translations reviewed by native speaker (not just automated)
- [ ] Terminology glossary maintained; ensure consistency across translations
- [ ] Verify machine-translated content is marked: "AI-assisted translation — [Report an issue]"

#### 10.3.2 Content Safety
- [ ] Moderation rules applied to user-generated content (comments, etc.) in all languages
- [ ] Profanity filters configured per language
- [ ] Hate speech detection in all supported languages

---

## 16. Implementation Checklist

### Phase 1: Foundation (Essential for Launch)
- [ ] Define 8 core business languages (en, es, pt, fr, de, zh-CN, ja, hi)
- [ ] i18n library integrated (i18next or similar)
- [ ] All UI chrome strings translated to supported locales
- [ ] Locale negotiation service implemented
- [ ] Blog post model extended with translations field
- [ ] Chat message model extended with language metadata
- [ ] Event model extended with defaultContentLanguage and supportedLanguages
- [ ] Localization config API endpoint (`GET /api/localization/config`)

### Phase 2: User Features
- [ ] Language settings UI (account settings + session language)
- [ ] Blog post language switcher + fallback banner
- [ ] Chat conversation language setting + language switch prompt
- [ ] Persistence: localStorage + account sync
- [ ] API endpoints for blog post content retrieval with locale

### Phase 3: Admin Localization Tool
- [ ] Content version tracking model (canonicalVersion, diff detection)
- [ ] Admin Localization Dashboard (status by language, stale count, completion %)
- [ ] Export Localization Pack endpoint (`GET /api/admin/localization/export`)
  - [ ] Support JSON, CSV, and XLIFF formats
  - [ ] Detect stale vs. untranslated vs. current
  - [ ] Include diff highlights (what changed in canonical)
- [ ] Import Translated Content endpoint (`POST /api/admin/localization/import`)
  - [ ] Validate imported file format
  - [ ] Merge translations into database
  - [ ] Track import status (draft, in_review, approved)
- [ ] Localization Review UI
  - [ ] Side-by-side English vs. translation view
  - [ ] Approve / Request Changes / Reject buttons
  - [ ] Comment system for reviewer feedback
- [ ] Publish Translations endpoint (`POST /api/admin/localization/publish`)
- [ ] Localization Reports endpoint
  - [ ] Completion report (% by language)
  - [ ] Stale content report
  - [ ] Translation velocity report
  - [ ] Cost estimate report

### Phase 4: Event-Level Localization
- [ ] Event admin UI: Set defaultContentLanguage and supportedLanguages
- [ ] Event-scoped export/import (blog posts, event details)
- [ ] Event inventory translations (chat card inventory per language)

### Phase 5: Voice (Optional)
- [ ] STT/TTS language selection UI
- [ ] Voice choice persistence per conversation
- [ ] Fallback handling for unsupported languages
- [ ] Auto-detect STT option

### Phase 6: QA & Launch
- [ ] Full test matrix executed (UI, blog, chat, voice)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Legal review: Terms, Privacy, compliance
- [ ] Pseudolocalization test
- [ ] Performance testing (i18n resource loading, export file size)
- [ ] Translation proofreading (native speaker review for all 8 languages)
- [ ] Admin tool end-to-end test (export → translate → import → review → publish)

---

## 12. Glossary & Reference

### Locale Codes (BCP 47)
- `en` – English (default)
- `en-US` – English (United States)
- `en-GB` – English (United Kingdom)
- `es` – Spanish (generic)
- `es-ES` – Spanish (Spain)
- `es-MX` – Spanish (Mexico)
- `es-AR` – Spanish (Argentina)
- `pt` – Portuguese (generic)
- `pt-BR` – Portuguese (Brazil)
- `pt-PT` – Portuguese (Portugal)

### Key Definitions

**Canonical Language:** The source language for all content. All blog posts and chat interactions MUST support this language. Default: `en` (English).

**Fallback:** Intentional display of content in a different language when the requested language is unavailable. MUST be accompanied by a visible notice to the user.

**Locale Negotiation:** The process of determining which language to display based on user preference, browser locale, and content availability.

**Scope:** The range of content affected by a language choice (e.g., "page-scoped" for blog post language, "global" for UI chrome).

---

## 13. Examples: End-to-End Scenarios

### Scenario 1: European User, Mixed Blog/Chat
```
1. User in Barcelona (browser = ca-ES)
   → UI resolves to es (Catalan not supported; fall back to Spanish)
   
2. User opens blog post available in en, es, pt
   → Resolves to es (browser language)
   
3. User starts chat conversation
   → Conversation language = es (same as UI)
   
4. User types message in English: "How is climate change?"
   → Detected language = en ≠ conversation language (es)
   → Prompt: "You wrote in English. Switch conversation to English?"
   → User clicks [No]
   
5. Assistant responds in Spanish
   → Indicator: "(Showing in Español)"
   
6. User clicks voice button
   → STT language = es (from conversation)
   → TTS voice = "Rosa (Spain)" (pre-selected)
   → User speaks Spanish → recognized and transcribed
   → Response spoken in Spanish
```

### Scenario 2: Portuguese User, Content Availability Issue
```
1. User in Brazil (browser = pt-BR)
   → UI language = pt
   
2. User opens blog post
   → Post available in: en, es (NO Portuguese translation)
   → Fallback to English
   → Banner: "This post not available in Português. Showing English."
   → User sees: [Request Translation] button
   
3. User clicks [Request Translation]
   → Email sent to content team: "User requested Portuguese translation of post #123"
   → Future: when translation added, user notified
   
4. User changes to different post (available in pt)
   → Post resolves to pt automatically
   → No banner shown
```

### Scenario 3: Unsupported Language Generation
```
1. User has conversation language = de (German, STT only)
   
2. User speaks: "Wie geht es dir?"
   → STT detects German, transcribes correctly
   
3. User asks: "Respond in German"
   → Prompt: "I can read German, but I only respond in English, Español, Português."
   → [English] [Español] [Português]
   
4. User selects [English]
   → Response generated in English
   → Indicator: "(You spoke German; responding in English)"
```

---

## 14. Migration & Rollout Plan

### Opt-In Localization (Recommended First Release)
1. Deploy localization backend + API endpoints
2. Enable for beta users (feature flag)
3. Gather feedback on language prompts, fallback copy
4. Roll out to all users once stable

### Communication
- [ ] Product announcement: "New: Blog posts in Español & Português"
- [ ] Settings tour: Show users where to change UI language
- [ ] Email to beta users: "Help us test new languages"

---

## 15. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-29 | Initial specification: locale definitions, negotiation rules, API design, QA matrix, legal guardrails. |

---

**Document Owner:** Localization Lead / Product Manager  
**Review Stakeholders:** Engineering, Design, QA, Legal, Accessibility  
**Next Review Date:** 2026-04-29
