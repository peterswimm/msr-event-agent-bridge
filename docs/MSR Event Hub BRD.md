# MSR Event Hub

## Background

### Overview

MSR internal events and lecture series are one of the most effective ways research teams share work, build community, and spark new ideas. But the value of these moments is often constrained by time, geography, and fragmented content. The MSR Event Hub is a scalable internal platform that augments MSR events with a digital experience that helps organizers run programs smoothly, helps presenters publish and refine supporting assets, and helps attendees discover and follow up on research—before, during, and long after the event concludes.

### Problem

Today, event content is typically distributed across ad hoc sites, documents, and links, and the “best” knowledge exchange happens only for those who attend in the moment. This creates friction for organizers, increases effort for presenters to publish consistent assets, and leaves attendees with limited ways to capture and revisit what they learned. As a result, high-quality research artifacts created for events often have limited reach and short-lived impact.By extending the reach of these events across space and time, we increase the durability, discoverability, and impact of MSR research beyond the moment of the event.

### Goals & outcomes

1.  For the organization

-   Provide a single, central platform for MSR internal events and lecture series, with event-specific sites and reusable platform capabilities
-   Create a pathway to integrate event assets into a shared knowledge base that can be explored across events and distributed more broadly as appropriate

1.  For organizers

• Reduce friction for organizers (setup, planning, content validation, communications, reporting)

For presenters

-   Help presenters/research teams submit, refine, and publish high-quality digital assets that represent their workFor attendees
-   Give attendees a better discovery and follow-up experience (search/browse, bookmarking via QR, personalized guide, revisiting content)• Extend in-person and virtual events by making the content and experiences available digitally to the broad MSR community• Create a pathway to integrate event assets into a shared knowledge base that can be explored across events and distributed more broadly as appropriate.Scope & approachThe platform supports before / during / after event workflows for three primary audiences: program organizers, presenters (research teams), and attendees (researchers and product leaders). The system will evolve from reliable event publishing and administration into richer discovery experiences including AI-assisted ingestion, structured project summaries, and cross-event exploration.MVP focusThe near-term delivery focus is an MVP that meets the needs of MSR India while establishing a scalable baseline platform (improving on the initial RRS proof-of-concept infrastructure). The MVP includes:• An MSR Events homepage that can promote multiple events (v1 may link to external event sites where needed).• An MSR India event site with core pages (home, about/logistics, agenda) and support for multi-day schedules, tracks/themes, and session detail pages with links to assets (decks, papers, repos).• Poster/project experiences (as scoped for the event): poster hub, tiles, and a project detail page with structured fields and related links.• A baseline admin experience functionally equivalent to RRS.• Secondary MVP capabilities. As time allows, additional capabilities that : presenter self-service edits, a basic chat/copilot experience, project “agent” synthesis for structured summaries/FAQ, and bookmarking.Feature areas• MSR Event hub – digital experience that can scale to host multiple event/program sections + provide a central experience to explore cross-event• Event hub - Section dedicated to a specific event that supports core formats:o Poster sessionso Talks + trackso Workshopso Lecture series• Admin experiences:MSR Event Hub

## Background & Overview

MSR internal events and lecture series are essential for sharing research, building community, and sparking ideas. Their value is constrained by time, geography, and fragmented content. The MSR Event Hub is a scalable internal platform that augments events with a durable digital experience so organizers can run programs smoothly, presenters can publish and refine assets, and attendees can discover and follow up on research before, during, and long after the event concludes.

## Problem

Content is scattered across ad hoc sites, documents, and links; only in-the-moment attendees get the best knowledge exchange. This creates friction for organizers, effort for presenters, and limited ways for attendees to capture and revisit learning. High-quality artifacts have short-lived impact. Extending reach across space and time increases durability, discoverability, and impact.

## Goals & Outcomes

-   **Organization:** Single platform for internal events; reusable sites and capabilities; path to integrate assets into a shared knowledge base.
-   **Organizers:** Reduce friction in setup, planning, validation, communications, and reporting.
-   **Presenters:** Submit, refine, and publish high-quality digital assets that represent their work.
-   **Attendees:** Better discovery and follow-up (search/browse, QR bookmarking, personalized guides, revisiting content); extend in-person/virtual events; path to shared knowledge base.

## Scope & Approach

Supports before/during/after workflows for organizers, presenters, and attendees. Evolves from reliable publishing/admin into richer discovery, including AI-assisted ingestion, structured project summaries, and cross-event exploration.

## MVP Focus (MSR India)

-   MSR Events homepage promoting multiple events (v1 may link externally).
-   MSR India event site: home, about/logistics, agenda; multi-day schedules; tracks/themes; session detail pages with asset links.
-   Poster/project experiences: hub, tiles, project detail page with structured fields and links.
-   Baseline admin experience equivalent to RRS.
-   Secondary (time-permitting): presenter self-service edits, basic chat/copilot, project “agent” synthesis for summaries/FAQ, bookmarking.

## Feature Areas

-   MSR Event hub: multi-event, cross-event exploration.
-   Event hub sections: poster sessions, talks/tracks, workshops, lecture series.
-   Admin experiences: hub-level (home programming, new events, permissions), event/program, and session/presentation admin.
-   AI tools: ingestion and knowledge augmentation to reduce friction; MSR Knowledge agent for cross-event exploration; personalization/recommendations (proactive and reactive); TBD additions to support core programs.

## Programs & Events Supported (initial focus)

-   Redmond Research Showcase
-   MSR India TAB
-   Project Green
-   Cambridge Research Showcase
-   MSR East (TBD)
-   MSR Asia TAB (pending discussions)
-   Lecture series: Whiteboard Wednesdays, AI & Society Fellows, Leaders @ Microsoft

## MVP Requirements (Must-haves for MSR India)

-   MSR Events homepage to promote several events (v1 links may go off-platform); eventual multi-site hosting and RRS migration.
-   MSR India site:
    -   Home (RRS-style layout TBD)
    -   About (event details, logistics)
    -   Agenda (before/after experience), with:
        -   Multi-day agendas
        -   Tracks/themes
        -   Sessions: title, abstract, speakers (name, title), date/time/duration/location, links (decks, papers, repos, etc.)
        -   Before: optional Teams link + schedule/location
        -   After: on-demand talk embed (date remains; time/location may drop)
    -   Poster session:
        -   Poster hub with optional themes (RRS-style)
        -   Poster tiles (RRS-style)
        -   Poster/project detail: title, abstract, team list (name, title, image, email), team contact, optional image, optional embedded video, related links (code, decks, papers, sites, etc.)
    -   Admin experience: functional equivalent to RRS

## Secondary (Aspirational P2s)

-   Presenter admin (edit poster/presentation, upload content).
-   Base chat/copilot with abstract-level exploration.
-   Beta “project agent” for Heilmeier-style overview + project knowledge FAQ.
-   Bookmarking (QR + on-site) and RRS content migration.

## Out of Scope for MVP (Backlog)

-   Program owner admin/reporting; cross-event search/chat; Bookmark 2.0 (types); cross-event personalization/recommendations; support for ongoing talk series (home, themes, upcoming, on-demand); personal push options.

## KPIs — MVP

-   Launch on time for MSR India TAB: site live by agreed date; no P0/P1 at start.
-   Pre-event unique users: % of expected attendees visiting before Day 1.
-   Post-event unique users: % of audience visiting within 7/30 days post-event.
-   Extended-reach users: % of uniques outside primary geo/time zone.
-   Connections/leads initiated: count of contact actions (email clicks, contact links, repo visits, etc.).

## KPIs — Platform

-   Events onboarded: count per quarter.
-   Repeat program usage: % of programs returning.
-   Organizer self-service rate: % of events launched without bespoke engineering.
-   Post-event content usage: % of views 30+ days post-event.
-   Cross-event engagement: % of users viewing multiple events.

## Appendix A: Feature Matrix (phases)

-   Pre-Event (Organizers): import Excel; assign project IDs/QRs; crawl links; plan placement; curate/validate; finalize data for floor/printing.
-   Pre-Event (Presenters): submit initial data; upload poster PDF for AI suggestions; review/approve suggestions; iterate core data; gain insights from custom guides.
-   Pre-Event (Attendees): preview content; express interests/profile; generate custom guide.
-   During Event (Organizers): manage last-minute placement/content changes; monitor stability/usage.
-   During Event (Presenters): present with posters/QRs; see engagement/bookmarks.
-   During Event (Attendees): browse/search by area/title/location; scan QR to bookmark; locate projects; plan routes.
-   Post-Event (Organizers): engagement reports; archive for reuse.
-   Post-Event (Presenters): review engagement; follow up on bookmarks/interested attendees.
-   Post-Event (Attendees): access personalized bookmarks; revisit details/resources; share/reference projects.

## Appendix B: Entities (posters/sessions excerpts)

-   Poster: title; abstract; poster file; image; location; theme/track; team; contact; related links (videos, slides, repos, papers, other); knowledge fields (organization, novelty, evidence, what’s next, maturity).
-   Session: title; abstract; type; recording; event; date/time/duration; location; theme/track; speakers/moderator; contact; related assets (slides, posters, papers, repos, other); knowledge fields (structure, emphasis, evidence, questions, next, maturity).

## Appendix C: Roadmap (summary)

-   MSR India (late Jan/TBD): MSRX admin; MSR Event hub; MSRI TAB hub; posters/sessions; bookmarks/QR; core multi-event code; AI summary POC; stretch chat.
-   Project Green (Mar 3): program-owner admin (WW); lecture series; workshops; research papers POC; scale multi-event; ResNet feed; event-level AI chat.
-   Cambridge Summerfest (Apr TBD): migrate Redmond/Asia; reporting; participant edit/review; push model POC; AI summary review; restricted access.
-   MSR Concierge (Jun 15): project/profile editing; updates; add papers/videos/repos; recommendations; push model MVP; AI concierge; AI tools for updates.

## Architecture Considerations

-   Access restricted to @microsoft.com; no external users.
-   No Office 365 integration by default; O365 data unavailable without admin consent and Copilot enablement.
-   Content management (video/docs/images) requires storage, metadata, versioning, permissions, and, for video, upload/transcode/secure delivery.• Papers

• Research talks/sessions