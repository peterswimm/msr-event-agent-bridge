# Integration & Setup Guide

**Version**: 2.0  
**Last Updated**: January 15, 2026  
**Status**: Production Ready  
**Time to Complete**: 15 minutes (local) → 2+ hours (Azure)

Complete guide for setting up the MSR Event Hub platform locally and integrating it with your frontend applications.

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Making Your First API Calls](#making-your-first-api-calls)
3. [Frontend Integration](#frontend-integration)
4. [Azure AI Foundry Setup](#azure-ai-foundry-setup)
5. [Docker Integration](#docker-integration)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

- **Node.js 20+** and npm 10+
- **Python 3.10+** with pip
- **PostgreSQL 13+** running
- **Docker** (optional, for databases)
- **Git** for cloning repos

**Verify your environment:**
```bash
node --version          # v20.x.x or higher
npm --version           # 10.x.x or higher
python --version        # Python 3.10+
psql --version         # psql 13+
```

### Step 1: Clone Repositories (2 minutes)

```bash
# Clone both repos
git clone https://github.com/microsoft/msr-event-agent-bridge.git
git clone https://github.com/microsoft/msr-event-agent-chat.git

# Navigate to bridge gateway
cd msr-event-agent-bridge
```

### Step 2: Setup Gateway (2 minutes)

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Default values work for localhost:5000 backend
# Edit .env if needed:
# BACKEND_URL=http://localhost:5000
# PORT=3000
```

### Step 3: Setup Backend (2 minutes)

```bash
# In another terminal
cd ../msr-event-agent-chat

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### Step 4: Setup PostgreSQL (2 minutes)

```bash
# Option A: Using Docker (recommended)
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=event_hub \
  postgres:latest

# Option B: Local PostgreSQL
# Windows: net start postgresql-x64-14
# macOS: brew services start postgresql

# Verify PostgreSQL is running
psql -h localhost -U postgres -d event_hub -c "SELECT 1;"
```

### Step 5: Start Services (3 minutes)

**Terminal 1 - Backend:**
```bash
cd msr-event-agent-chat

# Activate environment (if not already)
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Initialize database (first time only)
python scripts/init_db.py

# Start backend on port 5000
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

# You should see:
# Uvicorn running on http://0.0.0.0:5000
```

**Terminal 2 - Gateway:**
```bash
cd msr-event-agent-bridge

# Start gateway on port 3000
npm run dev

# You should see:
# Server running on http://localhost:3000
# Connected to backend: http://localhost:5000
```

**Terminal 3 - Verify services:**
```bash
# Test gateway health
curl http://localhost:3000/health
# Response: { "status": "healthy", "gateway": "running" }

# Test backend health
curl http://localhost:5000/health
# Response: { "status": "healthy", "database": "connected" }
```

✅ **Local setup complete!** Both services are running.

---

## Making Your First API Calls

### Step 1: Get Authentication Token (2 minutes)

**Create test user:**
- Email: `test@example.com`
- Password: `testpassword123`

**Get JWT token:**
```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'

# Response:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "bearer",
#   "expires_in": 3600
# }
```

**Save token for easy access:**
```bash
# macOS/Linux:
export TOKEN="your_token_here"

# Windows (PowerShell):
$env:TOKEN="your_token_here"

# Or save to file:
echo "your_token_here" > token.txt
TOKEN=$(cat token.txt)
```

### Step 2: Create an Event (2 minutes)

```bash
curl -X POST http://localhost:3000/v1/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "MSR India TAB 2025",
    "description": "Testing the event hub",
    "startDate": "2025-01-25",
    "endDate": "2025-01-26",
    "location": "Bangalore",
    "eventType": "conference"
  }'

# Response:
# {
#   "id": "evt_001",
#   "displayName": "MSR India TAB 2025",
#   "status": "draft",
#   "createdAt": "2025-01-15T12:00:00Z"
# }

# Save event ID for next steps:
EVENT_ID="evt_001"
```

### Step 3: List Events

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/events

# Response:
# {
#   "@odata.count": 1,
#   "value": [
#     {
#       "id": "evt_001",
#       "displayName": "MSR India TAB 2025",
#       "status": "draft",
#       "createdAt": "2025-01-15T12:00:00Z"
#     }
#   ]
# }
```

### Step 4: Create a Project

```bash
curl -X POST "http://localhost:3000/v1/events/$EVENT_ID/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI-Powered Knowledge Extraction",
    "abstract": "Novel approach to extract structured insights from unstructured content",
    "team": ["test@example.com"],
    "tags": ["AI", "research", "knowledge-extraction"]
  }'

# Response:
# {
#   "id": "proj_001",
#   "title": "AI-Powered Knowledge Extraction",
#   "status": "draft",
#   "team": ["test@example.com"]
# }

# Save project ID:
PROJECT_ID="proj_001"
```

### Step 5: Add Knowledge Artifact

```bash
curl -X POST "http://localhost:3000/v1/projects/$PROJECT_ID/knowledge" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "paper",
    "title": "Attention Is All You Need",
    "sourceUrl": "https://arxiv.org/pdf/1706.03762.pdf",
    "tags": ["transformers", "NLP"]
  }'

# Response:
# {
#   "jobId": "job_abc123",
#   "status": "queued"
# }
```

✅ **API calls working!** You've created an event, project, and knowledge artifact.

---

## Frontend Integration

### ShowcaseApp Integration

#### 1. Update Environment

Add to `showcaseapp/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
```

#### 2. Create Bridge Client

Create `showcaseapp/lib/bridge-api-client.ts`:

```typescript
import type { Event, Project, Session } from '../types/models.js';

export class BridgeAPIClient {
  constructor(private baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000') {}

  private async request<T>(
    path: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Bridge error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getEvents(token: string): Promise<Event[]> {
    const data = await this.request<{ value: Event[] }>('/v1/events', token);
    return data.value;
  }

  async getEvent(eventId: string, token: string): Promise<Event> {
    return this.request<Event>(`/v1/events/${eventId}`, token);
  }

  async listProjects(eventId: string, token: string, search?: string): Promise<Project[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const data = await this.request<{ value: Project[] }>(
      `/v1/events/${eventId}/projects${query}`,
      token
    );
    return data.value;
  }

  async getProject(projectId: string, token: string): Promise<Project> {
    return this.request<Project>(`/v1/projects/${projectId}`, token);
  }

  async searchKnowledge(query: string, token: string): Promise<any> {
    return this.request('/v1/knowledge/search', token, {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  async createEvent(event: Event, token: string): Promise<Event> {
    return this.request<Event>('/v1/events', token, {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }
}
```

#### 3. Use in Routes

Update `showcaseapp/routes/projects.tsx`:

```typescript
import { useLoaderData } from 'react-router';
import { BridgeAPIClient } from '../lib/bridge-api-client.js';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const token = getTokenFromRequest(request); // Your auth logic
  if (!token) return redirect('/login');

  const bridge = new BridgeAPIClient();
  
  try {
    const projects = await bridge.listProjects(
      params.eventId!,
      token,
      new URL(request.url).searchParams.get('search') || undefined
    );
    return { projects };
  } catch (error) {
    console.error('Failed to load projects:', error);
    return { projects: [], error: 'Failed to load projects' };
  }
}

export default function ProjectsPage() {
  const { projects, error } = useLoaderData<typeof loader>();
  
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Custom Frontend Integration

#### Basic Setup

```typescript
import type { Event, Project } from './types/models.js';

const BRIDGE_URL = 'http://localhost:3000';

async function getEvents(token: string): Promise<Event[]> {
  const res = await fetch(`${BRIDGE_URL}/v1/events`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return data.value;
}

async function createProject(eventId: string, project: Project, token: string) {
  const res = await fetch(`${BRIDGE_URL}/v1/events/${eventId}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}
```

#### React Hook

```typescript
import { useState, useEffect } from 'react';
import type { Event } from './types/models.js';

export function useEvents(token: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:3000/v1/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEvents(data.value);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchEvents();
  }, [token]);

  return { events, loading, error };
}

// Usage
function EventList({ token }: { token: string }) {
  const { events, loading, error } = useEvents(token);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {events.map(event => (
        <li key={event.id}>{event.displayName}</li>
      ))}
    </ul>
  );
}
```

---

## Azure AI Foundry Setup

For production AI capabilities, you'll need to set up Azure AI Foundry infrastructure.

### Prerequisites

- Azure subscription access (Contributor or Owner role)
- Azure CLI installed (`az --version`)
- PowerShell 7+ (for some configuration)
- Permissions to create resources in your Azure tenant

### Quick Start (5 minutes)

```bash
# 1. Log in to Azure
az login

# 2. Create resource group
az group create \
  --name rg-msr-event-hub-ai-prod \
  --location eastus2

# 3. Create Azure OpenAI Service
az cognitiveservices account create \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --kind OpenAI \
  --sku s0 \
  --location eastus2

# 4. Create Managed Identity
az identity create \
  --name mi-msr-eventhub-ai \
  --resource-group rg-msr-event-hub-ai-prod

# 5. Get Keys
az cognitiveservices account keys list \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --query "key1" -o tsv

# 6. Get Endpoint
az cognitiveservices account show \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --query "properties.endpoint" -o tsv
```

### Comprehensive Setup

**For complete Azure AI Foundry infrastructure setup including:**
- Virtual Network & private endpoints
- GPT-4, GPT-3.5, and embedding model deployments
- Zero Trust security (conditional access, PIM, CMK)
- Monitoring with Application Insights
- Cost optimization strategies

👉 **See [AZURE_AI_FOUNDRY_SETUP.md](./AZURE_AI_FOUNDRY_SETUP.md)** (26-minute guide with CLI commands)

### Environment Configuration

Once infrastructure is provisioned, update `.env`:

```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://aoai-msr-eventhub-prod.openai.azure.com/
AZURE_OPENAI_API_KEY=<your-key-from-above>

# Model deployments
AZURE_OPENAI_DEPLOYMENT_GPT4=gpt-4-turbo
AZURE_OPENAI_DEPLOYMENT_GPT35=gpt-35-turbo
AZURE_OPENAI_DEPLOYMENT_EMBEDDING=text-embedding-ada

# Identity
AZURE_CLIENT_ID=<managed-identity-client-id>
AZURE_TENANT_ID=<your-tenant-id>

# Key Vault
AZURE_KEYVAULT_ENDPOINT=https://kv-msr-eventhub-ai-prod.vault.azure.net/
```

---

## Docker Integration

### Run Full Stack with Docker Compose

```bash
cd msr-event-agent-bridge
docker-compose up -d
```

**Services:**
- Bridge Gateway: `http://localhost:3000`
- FastAPI Backend: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

**Verify:**
```bash
docker-compose ps
# Should show all 3 services as "Up"
```

**View logs:**
```bash
docker-compose logs -f bridge      # Gateway logs
docker-compose logs -f backend     # Backend logs
docker-compose logs -f postgres    # Database logs
```

**Stop services:**
```bash
docker-compose down
```

### Integration with Other Containers

**Use from another container:**
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .
RUN npm install

ENV VITE_API_URL=http://bridge:3000

CMD ["npm", "run", "dev"]
```

**Run with Docker network:**
```bash
# Create shared network
docker network create event-hub-network

# Run container on network
docker run \
  --network event-hub-network \
  --env VITE_API_URL=http://bridge:3000 \
  my-app:latest
```

---

## Production Deployment

### Environment Variables

Add to your production `.env`:

```env
# API
BRIDGE_API_URL=https://event-bridge-api.azurewebsites.net
PORT=443
NODE_ENV=production

# Security
JWT_SECRET=<get-from-azure-keyvault>
ALLOWED_ORIGINS=https://rrs25demoapp.azurewebsites.net,https://your-app.azurewebsites.net

# Database
DATABASE_URL=postgresql://user:password@prod-db.postgres.database.azure.com/event_hub

# Azure OpenAI (from AI Foundry setup)
AZURE_OPENAI_ENDPOINT=https://aoai-msr-eventhub-prod.openai.azure.com/
AZURE_OPENAI_API_KEY=<key-from-keyvault>

# Monitoring
APPINSIGHTS_INSTRUMENTATION_KEY=<from-application-insights>
```

### Azure AD Integration

```typescript
import { useMsal } from '@azure/msal-react';
import { BridgeAPIClient } from './lib/bridge-api-client.js';

export function useAuthenticatedBridge() {
  const { instance, accounts } = useMsal();
  const bridge = new BridgeAPIClient();

  return async (path: string) => {
    const account = accounts[0];
    if (!account) throw new Error('User not authenticated');

    const token = await instance.acquireTokenSilent({
      account,
      scopes: ['api://your-app-id/api']
    });

    return bridge.request(path, token.accessToken);
  };
}
```

### Deploy to Azure App Service

```bash
# From msr-event-agent-bridge directory
npm run build

# Deploy using Azure CLI
az webapp deployment source config-zip \
  --resource-group rg-msr-event-hub \
  --name event-bridge-api \
  --src dist.zip
```

👉 **For detailed deployment instructions**, see [DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md)

---

## Troubleshooting

### Bridge Service Not Responding

```bash
# Check if gateway is running
curl http://localhost:3000/health

# Check logs
npm run dev

# Verify backend connection
curl http://localhost:5000/health
```

### 401 Unauthorized

```bash
# Token expired or invalid - generate new token
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'

# Verify header format
curl -v http://localhost:3000/v1/events
# Look for: Authorization: Bearer <token>
```

### CORS Errors

**Backend responds but browser blocks:**
```bash
# 1. Verify bridge is running
curl http://localhost:3000/health

# 2. Check ALLOWED_ORIGINS in .env
# Should include your frontend URL

# 3. Verify Authorization header is present in request
```

### Backend 503 Error

**Backend is not responding:**
```bash
# Check backend health
curl http://localhost:5000/health

# Start backend if needed
cd msr-event-agent-chat
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 5000
```

### Database Connection Failed

```bash
# Verify PostgreSQL is running
psql -h localhost -U postgres -d event_hub -c "SELECT 1;"

# Check connection string in .env
# Default: postgresql://postgres:postgres@localhost/event_hub

# Start PostgreSQL if needed
docker run -d --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=event_hub \
  postgres:latest
```

### Azure OpenAI Integration Issues

```bash
# Verify credentials
az cognitiveservices account show \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod

# Check Key Vault access
az keyvault secret show \
  --vault-name kv-msr-eventhub-ai-prod \
  --name OpenAI-Key

# Test connectivity
curl -X POST https://aoai-msr-eventhub-prod.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-02-15-preview \
  -H "api-key: <your-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 100
  }'
```

---

## Common Tasks

### Change Port Numbers

```bash
# Gateway on different port
PORT=3001 npm run dev

# Backend on different port
python -m uvicorn app.main:app --port 5001

# Update .env
BACKEND_URL=http://localhost:5001
```

### Reset Database

```bash
cd msr-event-agent-chat

# Drop and recreate
python scripts/reset_db.py
python scripts/init_db.py
```

### View Logs

```bash
# Gateway logs
tail -f logs/gateway.log

# Backend logs
tail -f logs/backend.log

# Enable debug mode
DEBUG=true npm run dev
```

### Use jq for JSON Processing

```bash
# Pretty print
curl -s http://localhost:3000/v1/events | jq '.'

# Extract field
curl -s http://localhost:3000/v1/events | jq '.value[0].id'

# Filter results
curl -s http://localhost:3000/v1/events | jq '.value[] | select(.status=="draft")'
```

---

## Next Steps

| Time | Task | Reference |
|------|------|-----------|
| 5 min | Explore endpoints with curl | [API Reference](./API_REFERENCE.md) |
| 15 min | Review system design | [Architecture Guide](./ARCHITECTURE.md) |
| 30 min | Check all endpoints & examples | [API Reference](./API_REFERENCE.md) |
| 1-2 hrs | Deploy to Azure | [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md) |
| 2+ hrs | Setup Azure AI Foundry | [Azure AI Foundry Setup](./AZURE_AI_FOUNDRY_SETUP.md) |

---

## Help & Support

| Question | Reference |
|----------|-----------|
| How do I use the API? | [API Reference](./API_REFERENCE.md) |
| What permissions do I need? | [RBAC Matrix](./RBAC_MATRIX.md) |
| How do I deploy to production? | [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md) |
| What's the system architecture? | [Architecture Guide](./ARCHITECTURE.md) |
| I'm stuck on an error | [Troubleshooting Guide](./TROUBLESHOOTING.md) |

---

**Last Updated**: January 15, 2026  
**Status**: Production Ready  
**Next Version**: 2.1 (Q2 2025)
