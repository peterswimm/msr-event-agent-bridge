# MSR Event Agent Bridge

**Content Enrichment & API Gateway for MSR Event Hub Platform**

**Status**: Production-Ready | **Framework**: Node.js + Express + TypeScript | **Auth**: JWT + Azure AD

---

## 🎯 What This Does

The MSR Event Agent Bridge provides the backend integration layer for the MSR Event Hub platform. It handles:

- **Content Ingestion**: Import project data from Excel, PDFs, and JSON
- **Link Crawling**: Extract metadata from referenced papers, repos, slides
- **AI Enrichment**: Synthesize summaries, extract insights, identify novelty
- **Data Normalization**: Convert to unified Poster/Session/Project models
- **API Gateway**: Unified REST API for all frontends
- **Multi-Event Support**: Manage data for Redmond, India, Cambridge, and more

### Core Capabilities
✅ Ingest 1000+ research projects from multiple event formats  
✅ AI-assisted content summarization and enrichment  
✅ Link crawling for related assets (papers, code, videos)  
✅ Organizer tools for content validation & curation  
✅ Presenter self-service edits  
✅ Admin reporting & analytics

---

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start the Bridge Server
```bash
npm start
# Server runs on http://localhost:3000
```

### 4. Test the API
```bash
# Health check
curl http://localhost:3000/health

# List events
curl http://localhost:3000/api/v1/events

# View API docs
# Open http://localhost:3000/api/docs in your browser
```

---

## 📚 API Endpoints

### Events
| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/events` | List all events |
| GET | `/api/v1/events/{eventId}` | Get event details |
| POST | `/api/v1/events` | Create new event |
| PUT | `/api/v1/events/{eventId}` | Update event |
| DELETE | `/api/v1/events/{eventId}` | Delete event |

### Projects/Posters
| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/projects` | List projects (paginated) |
| GET | `/api/v1/projects/{projectId}` | Get project details |
| POST | `/api/v1/projects` | Create project |
| PUT | `/api/v1/projects/{projectId}` | Update project |
| DELETE | `/api/v1/projects/{projectId}` | Delete project |
| POST | `/api/v1/projects/{projectId}/validate` | Validate project data |

### Enrichment Pipeline
| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/v1/enrichment/ingest` | Start ingestion job |
| POST | `/api/v1/enrichment/crawl` | Crawl links for metadata |
| POST | `/api/v1/enrichment/summarize` | Generate AI summaries |
| GET | `/api/v1/enrichment/jobs/{jobId}` | Check job status |
| GET | `/api/v1/enrichment/jobs/{jobId}/results` | Get enrichment results |

### Admin
| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/admin/events` | List events (admin view) |
| POST | `/api/v1/admin/events/{eventId}/publish` | Publish event |
| GET | `/api/v1/admin/reports/engagement` | Engagement metrics |
| GET | `/api/v1/admin/reports/content` | Content quality report |

---

## 🏗️ Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────┐
│                  Frontends                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │   Chat App   │ │ Admin Portal  │ │   Showcase   │     │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘     │
└─────────┼─────────────────┼──────────────────┼────────────┘
          │                 │                  │
          └─────────────────┼──────────────────┘
                            │ REST API
┌───────────────────────────▼──────────────────────────────┐
│            Event Hub Bridge (Port 3000)                   │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │         API Gateway & Request Router              │   │
│  │  • JWT Authentication                             │   │
│  │  • Request forwarding & response transformation   │   │
│  │  • Logging & correlation IDs                      │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────▼───────────────────────────────┐   │
│  │    Content Enrichment Pipeline                    │   │
│  │  1. Ingestion (Excel, PDF, forms)                │   │
│  │  2. Link Crawling (metadata extraction)          │   │
│  │  3. AI Enrichment (Foundry, Azure OpenAI)       │   │
│  │  4. Normalization (schema alignment)             │   │
│  │  5. Curation (organizer approval)                │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────▼───────────────────────────────┐   │
│  │    Admin Tools                                    │   │
│  │  • Event management                              │   │
│  │  • Content validation                            │   │
│  │  • Reporting & analytics                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└──────────┬────────────────────────────────────────────────┘
           │ REST API
┌──────────▼────────────────────────────────────────────────┐
│         MSR Event Hub Backend                              │
│    (Events, Projects, Knowledge Graph, Analytics)          │
└───────────────────────────────────────────────────────────┘
```

### Content Pipeline Phases

**Phase 1: Ingestion**
- Import Excel sheets with project metadata
- Parse PDF submissions (title, authors, abstract)
- Accept form submissions from web UI
- Store raw data with versioning

**Phase 2: Link Crawling**
- Fetch and parse URLs (papers, code repos, slides)
- Extract metadata (title, authors, description)
- Detect file types and content
- Validate links are accessible

**Phase 3: AI Enrichment**
- Foundry agents for summarization & insight extraction
- Azure OpenAI for keyword extraction, classification
- Human-in-the-loop: flag AI suggestions for review
- Preserve original author-provided text

**Phase 4: Normalization**
- Convert to canonical Poster/Session/Project models
- Validate required fields present & properly typed
- Generate machine-readable IDs and QR codes
- Create cross-event relationships

**Phase 5: Curation**
- Organizer reviews & approves enriched data
- Presenter self-service edits
- Content validation checks
- Publish to Event Hub platform

---

## 📁 Project Structure

```
msr-event-agent-bridge/
├── src/
│   ├── routes/
│   │   ├── events.ts                # Event CRUD endpoints
│   │   ├── projects.ts              # Project/poster endpoints
│   │   ├── enrichment.ts            # Content pipeline endpoints
│   │   └── admin.ts                 # Admin tools & reporting
│   │
│   ├── services/
│   │   ├── event.service.ts         # Event management logic
│   │   ├── project.service.ts       # Project data handling
│   │   ├── enrichment/
│   │   │   ├── ingestion.ts         # Data ingestion
│   │   │   ├── crawler.ts           # Link crawling
│   │   │   ├── enricher.ts          # AI enrichment
│   │   │   └── normalizer.ts        # Data normalization
│   │   └── admin.service.ts         # Admin operations
│   │
│   ├── middleware/
│   │   ├── auth.ts                  # JWT authentication
│   │   ├── errorHandler.ts          # Error handling
│   │   ├── logger.ts                # Structured logging
│   │   └── validator.ts             # Request validation
│   │
│   ├── types/
│   │   ├── event.ts                 # Event data model
│   │   ├── project.ts               # Project data model
│   │   ├── session.ts               # Session data
│   │   └── errors.ts                # Error types
│   │
│   ├── config/
│   │   ├── database.ts              # Database config
│   │   ├── auth.ts                  # Authentication config
│   │   └── enrichment.ts            # Pipeline config
│   │
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # Server entry point
│
├── tests/
│   ├── integration/                 # End-to-end tests
│   ├── unit/                        # Unit tests
│   └── fixtures/                    # Test data
│
├── docs/
│   ├── API_REFERENCE.md             # All endpoints
│   ├── ARCHITECTURE.md              # System design
│   ├── INTEGRATION_GUIDE.md         # Chat/Hub integration
│   ├── DEPLOYMENT.md                # Production setup
│   ├── DEPLOYMENT_RUNBOOK.md        # Step-by-step guide
│   ├── PROJECT_ROADMAP.md           # Features & timeline
│   ├── TROUBLESHOOTING.md           # Common issues
│   └── _archive/                    # Historical docs
│
├── infra/
│   ├── docker-compose.yml           # Local development
│   ├── Dockerfile                   # Production image
│   └── kubernetes/                  # K8s manifests
│
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── .env.example                     # Environment template
└── README.md                        # This file
```

---

## 🔄 Content Enrichment Pipeline

### Example: Ingest Research Project

```bash
# 1. Start ingestion job
curl -X POST http://localhost:3000/api/v1/enrichment/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "msr-india-2026",
    "sourceFile": "projects.xlsx",
    "sourceType": "excel"
  }'

# Response:
{
  "jobId": "job-123",
  "status": "in_progress",
  "progress": 0
}

# 2. Check progress
curl http://localhost:3000/api/v1/enrichment/jobs/job-123

# Response:
{
  "jobId": "job-123",
  "status": "enriching",
  "progress": 45,  // 45% complete
  "processedCount": 450,
  "totalCount": 1000
}

# 3. Get results when complete
curl http://localhost:3000/api/v1/enrichment/jobs/job-123/results
```

### Project Data Model

All projects normalized to this schema:

```json
{
  "id": "project-123",
  "eventId": "msr-india-2026",
  "title": "AI-Assisted Research Discovery",
  "abstract": "An AI-powered system for...",
  "team": [
    {
      "name": "John Smith",
      "title": "Senior Researcher",
      "email": "john@microsoft.com"
    }
  ],
  "relatedAssets": {
    "papers": ["https://arxiv.org/abs/..."],
    "repos": ["https://github.com/..."],
    "slides": ["https://..."],
    "videos": ["https://youtu.be/..."]
  },
  "enrichedFields": {
    "summary": "AI-generated 1-paragraph summary",
    "keyInsights": ["insight 1", "insight 2"],
    "novelty": "What's new compared to prior work",
    "evidence": "How ideas are supported",
    "nextSteps": "Potential future directions",
    "maturity": "exploratory|validated|pilot-ready"
  },
  "metadata": {
    "location": "Booth A-123",
    "researchArea": "AI/ML",
    "createdAt": "2026-01-13T...",
    "lastUpdated": "2026-01-13T...",
    "publishStatus": "draft|approved|published"
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=production

# Authentication
JWT_SECRET=your-secret-key
AZURE_AD_TENANT=your-tenant-id
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/msr_hub

# AI Services
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_KEY=your-key
FOUNDRY_ENDPOINT=https://xxx.foundry.ai
FOUNDRY_KEY=your-key

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Feature Flags
ENABLE_ENRICHMENT=true
ENABLE_CRAWLING=true
ENABLE_ANALYTICS=true
```

---

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t msr-event-bridge:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e AZURE_OPENAI_KEY=xxx \
  msr-event-bridge:latest
```

### Production Checklist

- [ ] Set all required environment variables
- [ ] Configure PostgreSQL database with backups
- [ ] Set up SSL/TLS for HTTPS
- [ ] Configure CORS for frontend domains
- [ ] Set up monitoring & alerting
- [ ] Run full test suite
- [ ] Load test with expected concurrency
- [ ] Configure database connection pooling
- [ ] Set up structured logging (ELK, DataDog, etc.)
- [ ] Enable rate limiting
- [ ] Configure API key rotation

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Test Coverage
```bash
npm run test:coverage
# View report at coverage/index.html
```

### Example Test
```typescript
describe('Enrichment Pipeline', () => {
  it('should ingest and normalize project data', async () => {
    const jobId = await enrichmentService.ingestExcel('projects.xlsx');
    const status = await enrichmentService.getJobStatus(jobId);
    
    expect(status.status).toBe('completed');
    expect(status.processedCount).toBeGreaterThan(0);
  });
});
```

---

## 🔨 Development Guide

### Adding a New Enrichment Task

```typescript
// services/enrichment/myEnricher.ts
import { EnrichmentTask } from '../types';

export class MyEnricher implements EnrichmentTask {
  async execute(project: Project): Promise<EnrichedProject> {
    // Your enrichment logic
    const result = await this.performAnalysis(project);
    return {
      ...project,
      enrichedFields: {
        ...project.enrichedFields,
        myField: result
      }
    };
  }

  async validate(project: EnrichedProject): Promise<boolean> {
    // Validate enrichment output
    return project.enrichedFields.myField !== null;
  }
}
```

### Add to Pipeline

```typescript
// services/enrichment/enricher.ts
const tasks: EnrichmentTask[] = [
  new SummaryEnricher(),
  new InsightEnricher(),
  new MyEnricher(),  // Your new task
];
```

---

## 📖 Quick Reference

### Common Operations

**Create an Event**
```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MSR India 2026",
    "startDate": "2026-02-15",
    "endDate": "2026-02-17"
  }'
```

**Add Projects to Event**
```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-123",
    "title": "My Research Project",
    "abstract": "Description..."
  }'
```

**Start Enrichment**
```bash
curl -X POST http://localhost:3000/api/v1/enrichment/ingest \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-123",
    "sourceFile": "projects.xlsx"
  }'
```

### Troubleshooting

**Issue**: Enrichment jobs timing out
- Increase `ENRICHMENT_TIMEOUT` in config
- Check Foundry/Azure OpenAI service health
- Monitor API rate limits

**Issue**: Link crawling failing
- Check internet connectivity
- Verify URLs are publicly accessible
- Review rate limiting on target sites

**Issue**: Authentication errors
- Verify JWT token is valid
- Check `JWT_SECRET` matches
- Ensure Azure AD configuration is correct

**Issue**: Database connection errors
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Verify network connectivity

---

## 🔗 Integration with Chat Service

The Bridge provides normalized data to the Chat service:

```
Bridge (Content Pipeline)
  ↓ publishes normalized projects
Chat Service
  ↓ uses for discovery/search
User Interface
  ↓ displays to attendees
```

**Sync Protocol**:
- Event data is published to Chat service on approval
- Real-time WebSocket for live updates
- Fallback to polling if WebSocket unavailable
- Chat service caches data locally

---

## 📚 Additional Resources

- **API Reference**: See [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)
- **Architecture Details**: See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Integration with Chat**: See [docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md)
- **Deployment Steps**: See [docs/DEPLOYMENT_RUNBOOK.md](./docs/DEPLOYMENT_RUNBOOK.md)
- **Roadmap**: See [docs/PROJECT_ROADMAP.md](./docs/PROJECT_ROADMAP.md)

---

## 🔗 Related Projects

- **msr-event-agent-chat**: AI chat for attendee discovery
- **msr-event-hub**: Main platform (frontend, knowledge graph)

---

## 📊 Performance Targets

- API response time: <200ms (p95)
- Link crawling: 100 URLs/minute
- AI enrichment: 10 projects/minute (with Foundry)
- Database query latency: <50ms (p95)
- Concurrent connections: 1000+

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Implement with tests
3. Run `npm test` and `npm run lint`
4. Submit PR with description

---

## 📝 License

Internal MSR Platform - Microsoft Research

---

**Questions?** Check the docs/ or troubleshooting section above.
