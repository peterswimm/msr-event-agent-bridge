# Quick Start Guide

**Version**: 2.0  
**Last Updated**: January 12, 2026  
**Time to Complete**: ~10 minutes

Get the MSR Event Hub platform running locally and make your first API call.

---

## Prerequisites

- **Node.js 20+** and npm 10+
- **Python 3.10+** with pip
- **PostgreSQL 13+** running
- **Docker** (optional, for databases)
- **Git** for cloning repos

Check versions:
```bash
node --version          # v20.x.x or higher
npm --version           # 10.x.x or higher
python --version        # Python 3.10+
psql --version         # psql 13+
```

---

## 1️⃣ Setup (2 minutes)

### Clone Repositories

```bash
# Clone both repos (if not already cloned)
git clone https://github.com/microsoft/msr-event-agent-bridge.git
git clone https://github.com/microsoft/msr-event-agent-chat.git

# Navigate to projects
cd msr-event-agent-bridge
```

### Setup Gateway (msr-event-agent-bridge)

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env (optional for local development)
# Default values work for localhost:5000 backend
```

### Setup Backend (msr-event-agent-chat)

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

# Edit .env (optional - defaults work locally)
```

---

## 2️⃣ Start Services (3 minutes)

### Start PostgreSQL (if not running)

```bash
# Option A: Using Docker
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=event_hub \
  postgres:latest

# Option B: Local PostgreSQL
# Windows: net start postgresql-x64-14
# macOS: brew services start postgresql

# Option C: Using Docker Desktop (already running)
```

### Start Backend (FastAPI)

```bash
cd msr-event-agent-chat

# Activate virtual environment (if not already)
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Initialize database (first time only)
python scripts/init_db.py

# Start backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

# Output should show:
# Uvicorn running on http://0.0.0.0:5000
# Press CTRL+C to quit
```

### Start Gateway (Express)

```bash
# In new terminal
cd msr-event-agent-bridge

# Start gateway
npm run dev

# Output should show:
# Server running on http://localhost:3000
# Backend: http://localhost:5000
```

### Verify Services Running

```bash
# Open new terminal and test
curl http://localhost:3000/health
# Response: { "status": "healthy", "gateway": "running" }

curl http://localhost:5000/health
# Response: { "status": "healthy", "database": "connected" }
```

---

## 3️⃣ Get Authentication Token (2 minutes)

### Create Test User

```bash
# Use default test user
# Email: test@example.com
# Password: testpassword123
```

### Get JWT Token

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

### Save Token for Easy Access

```bash
# macOS/Linux:
export TOKEN="your_token_here"

# Windows (PowerShell):
$env:TOKEN="your_token_here"

# Windows (CMD):
set TOKEN=your_token_here
```

---

## 4️⃣ Make Your First API Call (2 minutes)

### Create an Event

```bash
curl -X POST http://localhost:3000/v1/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "My First Event",
    "description": "Testing the event hub",
    "startDate": "2025-03-15",
    "endDate": "2025-03-16",
    "location": "Virtual",
    "eventType": "conference"
  }'

# Response:
# {
#   "id": "evt_001",
#   "displayName": "My First Event",
#   "status": "draft",
#   "createdAt": "2025-01-12T17:30:00Z"
# }
```

### List Events

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/events

# Response:
# {
#   "@odata.count": 1,
#   "value": [
#     {
#       "id": "evt_001",
#       "displayName": "My First Event",
#       "status": "draft"
#     }
#   ]
# }
```

### Create a Project

```bash
EVENT_ID="evt_001"  # From previous response

curl -X POST "http://localhost:3000/v1/events/$EVENT_ID/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Research Breakthrough",
    "abstract": "Novel approach to knowledge extraction",
    "team": ["test@example.com"],
    "tags": ["AI", "research"]
  }'

# Response:
# {
#   "id": "proj_001",
#   "title": "AI Research Breakthrough",
#   "status": "draft"
# }
```

### Add Knowledge Artifact

```bash
PROJECT_ID="proj_001"

curl -X POST "http://localhost:3000/v1/projects/$PROJECT_ID/knowledge" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "paper",
    "title": "Attention Is All You Need",
    "sourceUrl": "https://arxiv.org/pdf/1706.03762.pdf"
  }'

# Response:
# {
#   "jobId": "job_abc123",
#   "status": "queued"
# }
```

---

## 5️⃣ Explore UI (Optional)

### Frontend Setup

```bash
# Navigate to frontend directory
cd path-to-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser: http://localhost:5173
```

### Login to Web Interface

1. Open http://localhost:5173
2. Click "Sign In"
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `testpassword123`
4. Dashboard loads with events and projects

---

## 📚 Next Steps

### Learn the API
- Read [API Reference](API_REFERENCE.md) for all endpoints
- Check [RBAC Matrix](RBAC_MATRIX.md) for permissions
- Review [Architecture](ARCHITECTURE.md) for system design

### Deploy to Azure
- Follow [Deployment Guide](DEPLOYMENT.md)
- Setup Key Vault for CMK encryption
- Configure Azure resources with Bicep

### Run Tests

```bash
# Gateway tests
cd msr-event-agent-bridge
npm test

# Backend tests
cd msr-event-agent-chat
pytest tests/ -v
```

### Debug Issues

- Check [Troubleshooting Guide](TROUBLESHOOTING.md)
- Enable debug logging: `DEBUG=true npm run dev`
- Review error codes in [API Reference](API_REFERENCE.md#error-responses)

---

## 🔧 Common Tasks

### Change Port Numbers

```bash
# Gateway on different port
PORT=3001 npm run dev

# Backend on different port
python -m uvicorn app.main:app --port 5001

# Update .env to point to new backend URL
BACKEND_URL=http://localhost:5001
```

### Reset Database

```bash
# Backend directory
cd msr-event-agent-chat

# Drop all tables
python scripts/reset_db.py

# Re-initialize
python scripts/init_db.py
```

### View Logs

```bash
# Gateway logs (last 100 lines)
tail -100 logs/gateway.log

# Backend logs (last 100 lines)
tail -100 logs/backend.log

# Real-time logs
tail -f logs/gateway.log
```

### Disable CMK Encryption (Optional)

```bash
# Edit .env
CMK_ENABLED=false

# Restart gateway
npm run dev
```

---

## ✅ Verification Checklist

- [ ] Node.js 20+ installed
- [ ] Python 3.10+ installed
- [ ] PostgreSQL running on 5432
- [ ] Backend running on http://localhost:5000
- [ ] Gateway running on http://localhost:3000
- [ ] Can get authentication token
- [ ] Can create event with `POST /v1/events`
- [ ] Can list events with `GET /v1/events`
- [ ] Can create project
- [ ] Can add knowledge artifact

---

## 💡 Pro Tips

### Save Token to File
```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}' \
  | jq -r '.access_token' > token.txt

# Use it:
TOKEN=$(cat token.txt)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/v1/events
```

### Use jq for JSON Parsing
```bash
# Pretty print response
curl ... | jq '.'

# Extract specific field
curl ... | jq '.value[0].id'

# Filter results
curl ... | jq '.value[] | select(.status=="draft")'
```

### Create Shell Alias
```bash
# Add to ~/.bashrc or ~/.zshrc
alias evhub='curl -H "Authorization: Bearer $(cat token.txt)" http://localhost:3000'

# Use:
evhub /v1/events
```

### Test Streaming Chat
```bash
# Chat streaming endpoint
curl -X POST http://localhost:3000/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the latest breakthroughs?"}' \
  -N  # No buffer

# See streaming responses in real-time
```

---

## 🚀 What Now?

1. **5 min**: Explore API endpoints with curl
2. **15 min**: Read [Architecture](ARCHITECTURE.md) guide
3. **30 min**: Review [API Reference](API_REFERENCE.md) 
4. **1 hour**: Deploy to Azure following [Deployment Guide](DEPLOYMENT.md)

---

## 📞 Help & Support

- **API Issues?** → Check [API Reference](API_REFERENCE.md)
- **Errors?** → Check [Troubleshooting Guide](TROUBLESHOOTING.md)
- **Permissions?** → Check [RBAC Matrix](RBAC_MATRIX.md)
- **Architecture Questions?** → Check [Architecture Guide](ARCHITECTURE.md)
- **Logs?** → Check `logs/` directory or enable `DEBUG=true`

---

**Last Updated**: January 12, 2026  
**Status**: Production Ready  
**Next Version**: 2.1 (Spring 2025)
