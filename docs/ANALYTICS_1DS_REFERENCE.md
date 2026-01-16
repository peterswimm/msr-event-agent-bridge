# MSR Event Hub - 1DS Analytics Reference

## Overview

The MSR Event Hub platform instruments comprehensive analytics using **Microsoft 1DS (OneData Collector Service)** via Azure Application Insights. This document catalogs all telemetry events, properties, and metrics currently emitted across the platform's three layers: **Bridge API (Node.js)**, **Backend API (Python)**, and **Web Frontend (React)**.

---

## Platform Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    1DS / Application Insights                │
│         Centralized telemetry aggregation & dashboards       │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼──────┐     ┌──────▼──────┐    ┌──────▼──────┐
    │   Bridge   │     │   Backend   │    │     Web     │
    │  (Node.js) │     │  (Python)   │    │   (React)   │
    │   Port     │     │   FastAPI   │    │    Vite     │
    │   3000     │     │   Port 5000 │    │   Port 5173 │
    └────────────┘     └─────────────┘    └─────────────┘
```

**Key**: All three components emit telemetry to a shared Application Insights instrumentation key, enabling unified dashboards and cross-component correlation.

---

## Configuration

### Bridge API (Node.js / TypeScript)

**File**: `src/middleware/telemetry.ts`, `src/index.ts`

```typescript
import { initializeTelemetry } from './middleware/telemetry.js';

initializeTelemetry({
  instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATION_KEY || '',
  enableAutoCollection: true,
  samplingPercentage: parseInt(process.env.TELEMETRY_SAMPLING || '100', 10)
});
```

**Environment Variables**:
- `APPINSIGHTS_INSTRUMENTATION_KEY`: Azure Application Insights key
- `TELEMETRY_SAMPLING`: Sampling percentage (0-100, default: 100)

**Auto-Collection Enabled**:
- ✅ HTTP requests
- ✅ Performance counters
- ✅ Exceptions
- ✅ Dependencies (external calls)
- ✅ Live metrics streaming

---

### Backend API (Python / FastAPI)

**File**: `src/observability/telemetry.py`, `main.py`

```python
from observability.telemetry import initialize_telemetry

initialize_telemetry(
    instrumentation_key=os.getenv("APPINSIGHTS_INSTRUMENTATION_KEY")
)
```

**Environment Variables**:
- `APPINSIGHTS_INSTRUMENTATION_KEY`: Azure Application Insights key
- `ENVIRONMENT`: Environment name (dev, staging, prod)

**Context Properties**:
- Application version: `0.3.0`
- Environment: From `ENVIRONMENT` env var

---

### Web Frontend (React / TypeScript)

**File**: `web/chat/src/analytics.ts`, `web/chat/src/main.tsx`

```typescript
import { initializeAnalytics } from './analytics';

initializeAnalytics();
```

**Environment Variables**:
- `VITE_ANALYTICS_KEY`: 1DS instrumentation key

**Auto-Capture Enabled**:
- ✅ Page views
- ✅ User clicks
- ✅ Scroll events
- ✅ JavaScript errors
- ✅ Page load/unload
- ✅ Window resize

---

## Event Catalog

### 1. Bridge API Events (Node.js)

#### 1.1. `api_request`

**Purpose**: Track all HTTP requests through the bridge gateway.

**Emitted By**: `telemetryMiddleware` (automatic via Express middleware)

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `method` | string | HTTP method | `GET`, `POST`, `PUT`, `DELETE` |
| `path` | string | Request path | `/v1/events`, `/chat` |
| `statusCode` | string | HTTP status code | `200`, `404`, `500` |
| `userAgent` | string | Client user agent | `Mozilla/5.0...` |
| `ipAddress` | string | Client IP address | `10.0.0.5` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |
| `environment` | string | Runtime environment | `development`, `production` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `duration` | number | ms | Request processing time |

**Trigger**: Every HTTP request to Bridge API

---

#### 1.2. `copilot_interaction`

**Purpose**: Track AI chat interactions (questions, responses, token usage).

**Emitted By**: `trackCopilotInteraction()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `conversationId` | string | Unique conversation ID | `conv_abc123` |
| `userId` | string | User identifier | `user_456` or `anonymous` |
| `modelUsed` | string | AI model deployment name | `gpt-5`, `gpt-5-mini` |
| `success` | string | Completion success | `true`, `false` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |
| `environment` | string | Runtime environment | `production` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `messageCount` | number | count | Messages in conversation |
| `inputTokens` | number | tokens | Input tokens consumed |
| `outputTokens` | number | tokens | Output tokens generated |
| `latency` | number | ms | Response generation time |

**Trigger**: After each AI chat completion

---

#### 1.3. `user_feedback`

**Purpose**: Track user satisfaction signals (thumbs up/down, comments).

**Emitted By**: `trackFeedback()` function

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `conversationId` | string | Conversation ID | `conv_abc123` |
| `messageId` | string | Specific message ID | `msg_789` |
| `rating` | string | User rating | `positive`, `negative` |
| `userId` | string | User identifier | `user_456` or `anonymous` |
| `comment` | string | Optional feedback text | `Helpful answer!` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |

**Metrics**: None

**Trigger**: When user provides feedback on AI response

---

#### 1.4. `feature_usage`

**Purpose**: Track usage of specific platform features (bookmarks, QR scans, etc.).

**Emitted By**: `trackFeatureUsage()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `userId` | string | User identifier | `user_456` or `anonymous` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |
| `environment` | string | Runtime environment | `production` |
| *(additional)* | string | Feature-specific metadata | `projectId: proj_123` |

**Metrics**: None

**Trigger**: When user interacts with tracked features

---

#### 1.5. `ai_governance_metric`

**Purpose**: Comprehensive AI compliance and governance tracking (DOSA).

**Emitted By**: `trackAIMetrics()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `conversationId` | string | Conversation ID | `conv_abc123` |
| `userId` | string | User identifier | `user_456` or `system` |
| `modelDeployment` | string | AI model used | `gpt-5`, `gpt-5-mini` |
| `wasRefused` | string | Content filter triggered | `true`, `false` |
| `errorDetails` | string | Error description | `token_limit_exceeded`, `none` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |
| `environment` | string | Runtime environment | `production` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `inputTokens` | number | tokens | Input tokens |
| `outputTokens` | number | tokens | Output tokens |
| `totalTokens` | number | tokens | Sum of input + output |
| `responseLatencyMs` | number | ms | Response time |
| `editPercentage` | number | % | % of response edited by user |
| `responseLength` | number | chars | Character count of response |

**Trigger**: After each AI interaction (comprehensive tracking)

---

#### 1.6. `ai_content_refusal`


**Emitted By**: `trackAIMetrics()` (bridge) when `wasRefused === true`; `log_refusal()` (backend) in chat router for empty queries or service-unavailable cases

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `conversationId` | string | Conversation ID | `conv_abc123` |
| `userId` | string | User identifier | `user_456` or `system` |
| `modelDeployment` | string | AI model used | `gpt-5` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |

**Metrics**: None

**Trigger**: When `wasRefused === true` in AI interaction, or when chat router rejects a request (empty query, missing Azure OpenAI config)

**PII Guardrails**: `query_context` redacted for emails/phones/URLs and truncated to 200 chars before emit

**Note**: Used for compliance dashboards to monitor refusal rates.

---

#### 1.7. `ai_high_latency_alert`

**Purpose**: Alert on AI responses exceeding latency SLA (>5 seconds).

**Emitted By**: `trackAIMetrics()` function (conditional)

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `conversationId` | string | Conversation ID | `conv_abc123` |
| `modelDeployment` | string | AI model used | `gpt-5` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `latencyMs` | number | ms | Actual latency recorded |

**Trigger**: When response time > 5000ms

---

#### 1.8. `ai_model_error`

**Purpose**: Track AI model failures, timeouts, or partial responses.

**Emitted By**: `trackAIMetrics()` function (conditional)

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `conversationId` | string | Conversation ID | `conv_abc123` |
| `modelDeployment` | string | AI model used | `gpt-5` |
| `errorStatus` | string | Error type | `error`, `timeout`, `partial` |
| `errorDetails` | string | Error description | `token_limit_exceeded`, `unknown` |

**Metrics**: None

**Trigger**: When `completionStatus` is `error`, `timeout`, or `partial`

---

### 2. Backend API Events (Python)

#### 2.1. `api_request`

**Purpose**: Track all HTTP requests to FastAPI backend.

**Emitted By**: `track_api_request()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `method` | string | HTTP method | `GET`, `POST` |
| `path` | string | Request path | `/api/events`, `/api/chat` |
| `status_code` | string | HTTP status | `200`, `500` |
| `success` | string | Success flag | `true`, `false` |
| `user_id` | string | User identifier | `user_456` or `anonymous` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `duration_ms` | float | ms | Request duration |

**Trigger**: After each API request completes

---

#### 2.2. `repository_operation`

**Purpose**: Track database CRUD operations via repositories.

**Emitted By**: `track_repository_operation()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `operation` | string | CRUD operation | `create`, `read`, `update`, `delete`, `list` |
| `repository` | string | Repository name | `EventRepository`, `ProjectRepository`, `SessionRepository` |
| `entity_type` | string | Entity type | `event`, `project`, `session`, `artifact` |
| `entity_id` | string | Entity identifier | `evt_123`, `N/A` |
| `success` | string | Operation success | `true`, `false` |
| `error_message` | string | Error if failed | `not_found`, `none` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `duration_ms` | float | ms | Operation duration |

**Trigger**: After each repository operation

**Usage**: Tracks data layer performance and entity access patterns.

---

#### 2.3. `model_inference`

**Purpose**: Track AI model inference operations (token usage, latency).

**Emitted By**: `track_model_inference()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `model_name` | string | Model used | `gpt-5`, `text-embedding-3-large` |
| `success` | string | Inference success | `true`, `false` |
| `error_type` | string | Error type if failed | `timeout`, `rate_limit`, `none` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `prompt_tokens` | float | tokens | Input tokens |
| `completion_tokens` | float | tokens | Output tokens |
| `total_tokens` | float | tokens | Total tokens |
| `latency_ms` | float | ms | Inference time |

**Trigger**: After Azure OpenAI API call completes

**Usage**: Cost tracking and performance monitoring for AI operations.

---

#### 2.4. `user_feedback`

**Purpose**: Track user satisfaction signals from backend.

**Emitted By**: `track_user_feedback()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `conversation_id` | string | Conversation ID | `conv_abc123` |
| `message_id` | string | Message ID | `msg_789` |
| `rating` | string | User rating | `positive`, `negative` |
| `user_id` | string | User identifier | `user_456`, `anonymous` |
| `comment` | string | Optional comment | `Very helpful` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |

**Metrics**: None

**Trigger**: When user provides feedback via API

---

#### 2.5. `agent_execution`

**Purpose**: Track agentic workflow executions (knowledge extraction, chat routing).

**Emitted By**: `track_agent_execution()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `agent_name` | string | Agent identifier | `TalkAgent`, `PaperAgent`, `RouterAgent` |
| `task_type` | string | Task type | `extraction`, `routing`, `chat` |
| `success` | string | Execution success | `true`, `false` |
| `error_type` | string | Error if failed | `timeout`, `validation_error`, `none` |
| `timestamp` | string | ISO timestamp | `2026-01-15T10:30:00.000Z` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `duration_ms` | float | ms | Agent execution time |
| `steps_count` | float | count | Number of workflow steps |

**Trigger**: After agent workflow completes

---

#### 2.6. `ai_edit_action`

**Purpose**: Track user accept/edit/reject actions on AI responses for compliance KPIs.

**Emitted By**: `log_edit_action()` (backend); intended to be called from UX edit/accept flows and `/api/chat/telemetry/edit-action`.

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `conversation_id` | string | Conversation ID | `conv_abc123` |
| `message_id` | string | Message ID | `msg_789` |
| `action` | string | `accept`, `edit`, `reject` | `edit` |
| `user_id` | string | User identifier | `user_456` or `anonymous` |
| `has_significant_edit` | string | `true` if edit% > 10 | `true` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `edit_percentage` | number | % | % difference between original and edited |
| `time_since_generation_ms` | number | ms | Time from generation to action |

**Trigger**: When user accepts/edits/rejects an AI response (UX calls `/api/chat/telemetry/edit-action`).

---

#### 2.7. `bookmark_action`

**Purpose**: Track bookmarking actions for engagement metrics (even in stub state).

**Emitted By**: `BookmarkHandler` (backend experiences action) — now emits telemetry even without persistence.

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `entity_type` | string | Entity type | `project`, `session`, `presenter` |
| `entity_id` | string | Entity identifier | `proj_123` |
| `user_id` | string | User identifier | `user_456` or `anonymous` |
| `conversation_id` | string | Conversation ID | `conv_abc123` |
| `action` | string | Bookmark action | `add` |

**Metrics**: None

**Trigger**: When bookmark action is invoked (stub acknowledgement path).

---

#### 2.8. `connection_initiated`

**Purpose**: Track connection/lead initiation events (email presenter, repo visit, contact organizer, etc.).

**Emitted By**: `track_connection_initiated()` via `/api/chat/telemetry/connection` endpoint.

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `event_id` | string | Event identifier | `evt_india_tab` |
| `user_id` | string | User identifier | `user_456` or `anonymous` |
| `connection_type` | string | Connection action type | `email_presenter`, `visit_repo`, `contact_organizer`, `linkedin`, `other` |
| `target_id` | string | Target entity | `presenter_123` |
| `metadata` | object | Optional metadata | `{ "source": "carousel" }` |

**Metrics**: None

**Trigger**: When UI calls `/api/chat/telemetry/connection` upon connection/lead action.

---

#### 2.9. `event_visit`

**Purpose**: Track event page visits with timing context (pre/post/during).

**Emitted By**: `track_event_visit()` via `/api/chat/telemetry/event-visit` endpoint.

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `event_id` | string | Event identifier | `evt_india_tab` |
| `user_id` | string | User identifier | `user_456` or `anonymous` |
| `visit_type` | string | Visit timing | `pre_event`, `post_event`, `during_event`, `general` |
| `event_date` | string | Event date | `2026-01-24` |

**Metrics**:
| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `session_duration_seconds` | number | seconds | Time spent on event pages |
| `pages_viewed` | number | count | Pages viewed in session |

**Trigger**: When UI calls `/api/chat/telemetry/event-visit` on event page load.

---

### 3. Web Frontend Events (React / TypeScript)

#### 3.1. `chat_interaction`

**Purpose**: Track user chat interactions from web UI.

**Emitted By**: `trackChatInteraction()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `conversationId` | string | Conversation ID | `conv_abc123` |
| `messageId` | string | Message ID | `msg_789` |
| `queryLength` | number | User query length | `45` |
| `responseLatency` | number | Response time | `1200` |
| `success` | boolean | Request success | `true`, `false` |

**Metrics**: None (properties capture numeric values)

**Trigger**: After each chat message exchange

---

#### 3.2. `user_feedback`

**Purpose**: Track user feedback from web UI.

**Emitted By**: `trackUserFeedback()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `messageId` | string | Message ID | `msg_789` |
| `rating` | string | User rating | `positive`, `negative` |
| `hasComment` | boolean | Comment provided | `true`, `false` |

**Metrics**: None

**Trigger**: When user clicks thumbs up/down or submits feedback

---

#### 3.3. `feature_usage`

**Purpose**: Track feature usage from web UI.

**Emitted By**: `trackFeatureUsage()` function

**Properties**:
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `feature` | string | Feature name | `view_poster`, `bookmark_project`, `download_deck` |
| *(additional)* | any | Feature-specific metadata | `projectId: proj_123` |

**Metrics**: None

**Trigger**: When user interacts with tracked features

---

#### 3.4. Auto-Captured Events (1DS Web Analytics)

The web frontend automatically captures these events via 1DS SDK:

| Event | Description | Trigger |
|-------|-------------|---------|
| `pageView` | Page navigation | On route change |
| `click` | User clicks | On any click event |
| `scroll` | Scroll events | User scrolls page |
| `jsError` | JavaScript errors | Uncaught exceptions |
| `onLoad` | Page load complete | Window load event |
| `onUnload` | Page unload | User navigates away |
| `resize` | Window resize | Browser resize |

---

## KPI Mapping

### Compliance & Governance

| KPI | Event(s) | Property/Metric | Target | Dashboard Query |
|-----|----------|-----------------|--------|-----------------|
| **AI Refusal Rate** | `ai_content_refusal`, `ai_governance_metric` | `wasRefused` | <5% | `(refusals / total_interactions) * 100` |
| **Edit Percentage** | `ai_governance_metric` | `editPercentage` | >60% acceptance | `AVG(editPercentage)` |
| **Response Latency (p99)** | `ai_governance_metric` | `responseLatencyMs` | <2000ms | `PERCENTILE(responseLatencyMs, 99)` |
| **Model Error Rate** | `ai_model_error` | count | <1% | `(errors / total_inferences) * 100` |

---

### Operational Health

| KPI | Event(s) | Property/Metric | Target | Dashboard Query |
|-----|----------|-----------------|--------|-----------------|
| **API Uptime** | `api_request` | `success` | 99.5% | `(success_count / total_requests) * 100` |
| **Request Duration (p95)** | `api_request` | `duration` | <500ms | `PERCENTILE(duration, 95)` |
| **Database Query Time (p95)** | `repository_operation` | `duration_ms` | <100ms | `PERCENTILE(duration_ms, 95)` |

---

### User Engagement (MVP KPIs)

| KPI | Event(s) | Property/Metric | Target | Dashboard Query |
|-----|----------|-----------------|--------|-----------------|
| **Pre-Event Unique Users** | `pageView`, `api_request` | `userId`, `timestamp` | 40% of attendees | `COUNT(DISTINCT userId) WHERE timestamp < event_start` |
| **Post-Event Unique Users (7d)** | `pageView`, `api_request` | `userId`, `timestamp` | Track | `COUNT(DISTINCT userId) WHERE timestamp BETWEEN event_end AND event_end+7d` |
| **Connections/Leads** | `feature_usage` | `feature IN ('email_click', 'repo_visit', 'contact_click')` | Track | `COUNT(*) WHERE feature IN (...)` |
| **Bookmark Usage** | `feature_usage` | `feature = 'bookmark_project'` | Track | `COUNT(*) WHERE feature = 'bookmark_project'` |

---

## Sample Queries

### 1. AI Refusal Rate (Last 24 Hours)

```kusto
let total = toscalar(
    customEvents
    | where timestamp > ago(24h)
    | where name == "ai_governance_metric"
    | count
);
let refusals = toscalar(
    customEvents
    | where timestamp > ago(24h)
    | where name == "ai_content_refusal"
    | count
);
print refusal_rate_pct = (refusals * 100.0 / total)
```

---

### 2. API Latency by Endpoint (p95, p99)

```kusto
customEvents
| where timestamp > ago(1h)
| where name == "api_request"
| extend duration_ms = todouble(customMeasurements.duration)
| summarize 
    p50 = percentile(duration_ms, 50),
    p95 = percentile(duration_ms, 95),
    p99 = percentile(duration_ms, 99),
    count = count()
    by path = tostring(customDimensions.path)
| order by p99 desc
```

---

### 3. Token Usage by Model (Last 7 Days)

```kusto
customEvents
| where timestamp > ago(7d)
| where name == "model_inference"
| extend 
    model = tostring(customDimensions.model_name),
    total_tokens = todouble(customMeasurements.total_tokens)
| summarize 
    total_tokens = sum(total_tokens),
    avg_tokens = avg(total_tokens),
    request_count = count()
    by model
| order by total_tokens desc
```

---

### 4. User Engagement by Feature

```kusto
customEvents
| where timestamp > ago(30d)
| where name == "feature_usage"
| extend feature = tostring(customDimensions.feature)
| summarize usage_count = count() by feature
| order by usage_count desc
```

---

### 5. Error Rate by Status Code

```kusto
customEvents
| where timestamp > ago(24h)
| where name == "api_request"
| extend 
    status = tostring(customDimensions.statusCode),
    is_error = toint(status) >= 400
| summarize 
    total = count(),
    errors = countif(is_error)
| extend error_rate_pct = (errors * 100.0 / total)
```

---

## Dashboard Recommendations

### 1. **Compliance Dashboard** (DOSA Monitoring)

**Widgets**:
- AI Refusal Rate (line chart, last 30 days)
- Edit Percentage (gauge, current vs. target 60%)
- Response Latency p99 (line chart with 2s SLA threshold)
- Model Error Count (bar chart by error type)
- Token Usage by Model (pie chart)

**Refresh**: Real-time (1-minute intervals)

---

### 2. **Operational Health Dashboard**

**Widgets**:
- API Uptime (gauge, 99.5% target)
- Request Latency p95/p99 (dual-axis line chart)
- Requests per Minute (area chart)
- Error Rate by Endpoint (table, sorted by error count)
- Database Query Time p95 (line chart)

**Refresh**: Real-time (30-second intervals)

---

### 3. **User Engagement Dashboard** (MVP KPIs)

**Widgets**:
- Unique Users (pre-event vs. post-event, stacked bar)
- Bookmark Activity (line chart, daily)
- Feature Usage Breakdown (horizontal bar chart)
- Connections/Leads Initiated (count card)
- Chat Interactions (line chart with success rate overlay)

**Refresh**: Hourly

---

## Cost Tracking

### Token Usage Cost Calculation

```kusto
customEvents
| where timestamp > ago(30d)
| where name == "model_inference"
| extend 
    model = tostring(customDimensions.model_name),
    prompt_tokens = todouble(customMeasurements.prompt_tokens),
    completion_tokens = todouble(customMeasurements.completion_tokens)
| summarize 
    prompt_tokens = sum(prompt_tokens),
    completion_tokens = sum(completion_tokens)
    by model
| extend 
    // GPT-5 pricing: $3 per 1M input tokens, $15 per 1M output tokens
    cost_usd = case(
        model == "gpt-5", (prompt_tokens / 1000000.0 * 3.0) + (completion_tokens / 1000000.0 * 15.0),
        model == "gpt-5-mini", (prompt_tokens / 1000000.0 * 0.3) + (completion_tokens / 1000000.0 * 1.5),
        0.0
    )
| project model, prompt_tokens, completion_tokens, cost_usd
```

---

## Alerts Configuration

### Critical Alerts (PagerDuty Integration)

| Alert | Condition | Threshold | Action |
|-------|-----------|-----------|--------|
| **API Downtime** | `api_request` success rate drops | <95% for 5 min | Page on-call engineer |
| **AI Refusal Spike** | `ai_content_refusal` rate increases | >10% for 15 min | Alert compliance team |
| **High Latency** | `ai_governance_metric` p99 latency | >5s for 10 min | Alert DevOps |
| **Model Errors** | `ai_model_error` count increases | >50 errors in 5 min | Alert engineering |

---

### Warning Alerts (Email/Slack)

| Alert | Condition | Threshold | Action |
|-------|-----------|-----------|--------|
| **Token Budget** | Daily token usage exceeds budget | >80% of daily budget | Notify finance team |
| **Edit Percentage Drop** | AI acceptance rate drops | <50% for 1 hour | Notify product team |
| **Database Slow Queries** | Repository operation latency | p95 >500ms for 30 min | Notify database team |

---

## Privacy & Compliance

### Data Retention

- **Default**: 90 days in Application Insights
- **Extended**: 730 days for compliance events (`ai_governance_metric`, `ai_content_refusal`)
- **Purge**: User-specific data can be purged on request (GDPR compliance)

### PII Handling

**Excluded from Telemetry**:
- ❌ User email addresses
- ❌ Full names (anonymized IDs only)
- ❌ Chat message content (length tracked, not content)
- ❌ Personal bookmarks (project IDs tracked, not user context)

**Included (Anonymized)**:
- ✅ User IDs (opaque identifiers)
- ✅ Session IDs (temporary)
- ✅ IP addresses (for rate limiting only, not logged)

**Best Practices Applied (Jan 2026)**:
- Redact emails/phones/URLs and truncate free text to 200 chars before emit (`log_refusal` uses sanitizer)
- Hash or tokenize identifiers if cross-system joins are needed; avoid raw emails/names
- Drop or mask optional free-text fields in telemetry unless required; prefer boolean flags (`has_comment`)
- Keep geo/time coarse (timezone/country, minute-level timestamps) where possible
- Enforce RBAC on telemetry access; separate raw content storage from analytics events
- Set retention: 90 days default, 730 days only for compliance events; automate purge
- Feedback comments are sanitized before emit (`comment_sanitized` field) and raw text should not be stored

---

## Implementation Examples

### Bridge API: Track Custom Event

```typescript
import { trackFeatureUsage } from './middleware/telemetry';

// Track poster view
app.get('/v1/projects/:id', async (req, res) => {
  trackFeatureUsage('view_poster', req.user?.id, {
    projectId: req.params.id,
    eventId: req.query.eventId as string
  });
  
  // ... rest of handler
});
```

---

### Backend API: Track Repository Operation

```python
from observability.telemetry import track_repository_operation

async def get_event(event_id: str) -> Event:
    start = time.time()
    try:
        event = await db.query(Event).filter_by(id=event_id).first()
        duration_ms = (time.time() - start) * 1000
        
        track_repository_operation(
            operation="read",
            repository="EventRepository",
            entity_type="event",
            entity_id=event_id,
            success=True,
            duration_ms=duration_ms
        )
        
        return event
    except Exception as e:
        duration_ms = (time.time() - start) * 1000
        track_repository_operation(
            operation="read",
            repository="EventRepository",
            entity_type="event",
            entity_id=event_id,
            success=False,
            duration_ms=duration_ms,
            error_message=str(e)
        )
        raise
```

---

### Web Frontend: Track User Action

```typescript
import { trackFeatureUsage } from './analytics';

const handleBookmark = (projectId: string) => {
  // Send bookmark request
  api.bookmarkProject(projectId);
  
  // Track usage
  trackFeatureUsage('bookmark_project', {
    projectId,
    timestamp: Date.now()
  });
};
```

---

## Next Steps

### Phase 2 Enhancements (Mar 2026)

- [ ] **Application Insights Dashboard**: Build compliance monitoring dashboard (refusal rate, edit %, latency)
- [ ] **Cost Alerts**: Set up alerts when token usage exceeds budget
- [ ] **Custom Metrics**: Add business-specific metrics (event onboarding rate, repeat usage)
- [ ] **Cross-Component Tracing**: Implement distributed tracing across Bridge → Backend → AI

### Phase 3 Enhancements (Apr 2026)

- [ ] **User Journey Analytics**: Track full user flows (view poster → bookmark → follow-up)
- [ ] **A/B Testing**: Instrument experiment variants for feature testing
- [ ] **Recommendation Metrics**: Track recommendation click-through rates
- [ ] **Geolocation Tracking**: Add timezone/region tracking for extended-reach KPI

---

**Document Version**: 1.0  
**Last Updated**: January 15, 2026  
**Maintained By**: MSR Event Hub Platform Team  
**Related Docs**: [DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md), [COMPLIANCE.md](compliance.md)
