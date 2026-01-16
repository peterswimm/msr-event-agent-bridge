# Channel Schema Reference

**Version:** 1.0  
**Last Updated:** January 16, 2026  
**Audience:** Developers, integrators, architects

---

## Overview

This document describes a **generic channel schema** for representing chat and interaction events across multiple platforms (e.g., Web, Teams, Slack, SMS, mobile apps) within the MSR Event Hub system.

A unified schema enables the platform to consistently manage and route messages, support omnichannel scenarios, and audit user engagement independent of the source channel.

---

## Schema Structure

### Fields

| Field              | Type      | Description                                         |
|--------------------|-----------|-----------------------------------------------------|
| `channelId`        | string    | Unique identifier for this channel instance (GUID or canonical) |
| `channelType`      | string    | Channel/platform type (e.g., "web", "teams", "slack", "sms") |
| `channelName`      | string    | Human-friendly channel name (optional)              |
| `userId`           | string    | External user ID as used by the channel             |
| `conversationId`   | string    | Unique conversation/thread/session ID in the channel|
| `externalMessageId`| string    | Native message ID (if provided by external channel) |
| `timestamp`        | datetime  | When the message/event occurred (ISO8601)           |
| `payload`          | object    | Channel-specific content (could be text, card, attachment, etc.) |
| `context`          | object    | Optional extra metadata (e.g. projectId, eventId)   |
| `sourceIp`         | string    | (Optional) Network source IP                        |
| `userAgent`        | string    | (Optional) Client user agent, for web channels      |
| `status`           | string    | Message state: "sent", "delivered", "read", "failed", etc. |

### Example JSON

```json
{
  "channelId": "42fcf5d3-1ecd-4959-ab3c-1111a9ea1b02",
  "channelType": "teams",
  "channelName": "Microsoft Teams",
  "userId": "john.doe@microsoft.com",
  "conversationId": "19:someTeamsChatId",
  "externalMessageId": "162723",
  "timestamp": "2026-01-16T14:25:00Z",
  "payload": {
    "type": "text",
    "content": "List all events"
  },
  "context": {
    "projectId": "proj_001",
    "eventId": "evt_123"
  },
  "sourceIp": "10.1.2.3",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "status": "delivered"
}
```

---

## Omnichannel Support

**Channel Types Supported:**  
- "web" (browser chat, single-page apps)  
- "teams" (Microsoft Teams bot/channel)  
- "slack" (Slack bot integration)  
- "sms" (SMS gateway)  
- "mobile" (native Android/iOS apps)  
- "email" (email-based triggers)  
- Add others as required via `channelType` field

**Why Use a Generic Schema?**  
- Centralizes routing logic: all incoming/outgoing messages use the same model  
- Enables analytics on channel engagement, trends, and performance  
- Facilitates fair audit and compliance across platforms  
- Makes it simple to extend support for new channels

---

## Extension Guidance

- **Custom Payloads:**  
  The `payload` field can be extended to support multimedia, cards, or structured forms depending on the channel.
- **Extra Metadata:**  
  Add keys to `context` as needed to link messages to workflows, object references, or business logic.

---

## Integration Patterns

- **Source Channel Connectors** should map native message formats into this schema upon input.
- **Destination Adapters** consume the schema for reply or workflow triggers, ensuring channel-appropriate rendering.
- **Audit Logging** should capture the entire schema for each interaction.

---

## Related Topics

- [OPERATIONS_REFERENCE.md](./OPERATIONS_REFERENCE.md) – System architecture and API guides  
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) – Patterns for connecting new channel sources

---

**Maintainers:** MSR Event Hub Team

**Status:** Draft, v1.0 – Feedback welcome