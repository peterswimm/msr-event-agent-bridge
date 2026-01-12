# Event Bridge Integration Guide

Quick reference for connecting your frontends to Event Bridge.

## ShowcaseApp Integration

### 1. Update Environment

Add to `showcaseapp/.env`:

```env
BRIDGE_API_URL=http://localhost:3000
BRIDGE_API_TIMEOUT=30000
```

### 2. Create Bridge Client

Create `showcaseapp/app/lib/bridge-api-client.ts`:

```typescript
import type { Event, Project, Session } from '../../types/models.js';

export class BridgeAPIClient {
  constructor(private baseURL: string = process.env.BRIDGE_API_URL || 'http://localhost:3000') {}

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
}
```

### 3. Use in Routes

Update `showcaseapp/app/routes/projects.tsx`:

```typescript
import { useLoaderData } from 'react-router';
import { BridgeAPIClient } from '~/lib/bridge-api-client.js';

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

### 4. Shared Types

Copy `event-bridge/src/types/models.ts` to `showcaseapp/app/types/models.ts`:

```bash
cp D:\code\event-bridge\src\types\models.ts D:\code\ShowcaseApp\showcaseapp\app\types\models.ts
```

## Custom Frontend Integration

### Basic Setup

```typescript
import type { Event, Project } from 'event-bridge/src/types/models.js';

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

### React Hook

```typescript
import { useState, useEffect } from 'react';
import type { Event } from 'event-bridge/src/types/models.js';

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

## Testing Integration

### With Postman/Insomnia

1. Generate token:
   ```bash
   cd D:\code\event-bridge
   npm run test:token -- --user "test@example.com" --roles "user,admin"
   ```

2. Create request:
   ```
   GET http://localhost:3000/v1/events
   Header: Authorization: Bearer <token>
   ```

### With cURL

```bash
# Get token
TOKEN=$(npm run test:token -- --user "test@example.com" 2>/dev/null | grep -A 1 "Generated JWT Token" | tail -1)

# Make request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/events | jq
```

### With Node.js

```bash
node -e "
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { sub: 'test-user', email: 'test@example.com', roles: ['user'] },
  'secret-key'
);

fetch('http://localhost:3000/v1/events', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e));
"
```

## Docker Integration

### Run Full Stack

```bash
cd D:\code\event-bridge
docker-compose up -d
```

Services:
- Bridge: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend Docs: `http://localhost:8000/docs`

### Use from Another Container

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .
RUN npm install

ENV BRIDGE_API_URL=http://bridge:3000

CMD ["npm", "start"]
```

Run with:
```bash
docker run \
  --network event-hub-network \
  --env BRIDGE_API_URL=http://bridge:3000 \
  my-app:latest
```

## Troubleshooting

### Bridge refuses connection

```bash
# Check if running
curl http://localhost:3000/health

# Start it
cd D:\code\event-bridge && npm run dev
```

### 401 Unauthorized

```bash
# Token expired or invalid
# Generate new token
npm run test:token

# Verify token in request header
curl -v http://localhost:3000/v1/events
# Look for: Authorization: Bearer <token>
```

### CORS errors

Backend is responding but browser blocks it. Check:

1. Bridge is running: `http://localhost:3000/health`
2. Origin is whitelisted in `ALLOWED_ORIGINS` env var
3. Request includes `Authorization` header

### Backend 503

Backend is not responding.

```bash
# Check backend
curl http://localhost:8000/health

# Start backend
cd D:\code\event-agent-example\msr-event-hub
python run_server.py --port 8000
```

## Production Setup

### Environment Variables

Add to your production `.env`:

```env
BRIDGE_API_URL=https://event-bridge-api.azurewebsites.net
JWT_SECRET=<get-from-azure-keyvault>
ALLOWED_ORIGINS=https://rrs25demoapp.azurewebsites.net,https://your-app.azurewebsites.net
```

### Auth Integration (Azure AD)

In your frontend:

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

## Next Steps

1. ✅ Set up Event Bridge locally
2. ✅ Create bridge client library
3. ✅ Integrate into ShowcaseApp
4. ✅ Test with sample data
5. ✅ Deploy to production

Questions? Check:
- [README.md](./README.md) - API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production setup
