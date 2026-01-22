# Azure AI Foundry Deployment Guide - Event Hub Assistant

## Prerequisites

- Azure subscription with access to Azure AI Foundry (https://ai.azure.com)
- Azure CLI logged in: `az login`
- Contributor access to Azure AI resource group

## Step 1: Create/Access Foundry Project

1. Navigate to https://ai.azure.com
2. Click **"+ New project"** or select existing project
3. Configure project:
   - **Project name**: `msr-event-hub` (or your preferred name)
   - **Hub**: Select or create a new hub
   - **Region**: Choose closest to your users (e.g., East US, West Europe)

4. Once created, note the **Project endpoint**:
   - Format: `https://<project-name>.<region>.api.azureml.ms/`
   - Example: `https://msr-event-hub.eastus.api.azureml.ms/`

## Step 2: Deploy Model (gpt-5-mini)

### Option A: Via Azure AI Foundry Portal

1. In your project, go to **"Models + endpoints"** → **"+ Deploy model"**
2. Search for **"gpt-5-mini"** in the model catalog
3. Click **Deploy** and configure:
   - **Deployment name**: `gpt-5-mini-event-hub` (or keep default)
   - **Deployment type**: Standard
   - **Tokens per Minute (TPM)**: 100K+ recommended
   - **Content filter**: Use default Azure content filtering

4. Wait for deployment to complete (2-5 minutes)
5. Note the **Deployment name** for configuration

### Option B: Via Azure CLI

```bash
# Login if not already
az login

# Set subscription
az account set --subscription "your-subscription-id"

# Deploy model
az ml online-deployment create \
  --name gpt-5-mini-event-hub \
  --model azureml://registries/azureml/models/gpt-5-mini \
  --endpoint-name msr-event-hub-endpoint \
  --resource-group your-resource-group \
  --workspace-name your-workspace
```

## Step 3: Configure Agent System Prompt

The agent uses the **Event Hub Assistant** prompt from [AGENT_PROMPTS.md](./AGENT_PROMPTS.md).

### Create Agent Configuration in Foundry

1. In your project, go to **"Agents"** section
2. Click **"+ New agent"**
3. Configure:
   - **Name**: Event Hub Assistant
   - **Model**: Select your deployed `gpt-5-mini-event-hub`
   - **Instructions**: Copy the Phase 0 system prompt from AGENT_PROMPTS.md

4. **System Prompt** (Phase 0):
```
You are the MSR Event Hub Assistant, helping Microsoft Research employees explore and navigate internal research events.

Your capabilities:
1. Answer questions about MSR events:
   - Event schedules, locations, and logistics
   - Session topics and speakers
   - Poster presentations and research projects

2. Help users find information:
   - Search by research area, team, or technology
   - Explain session abstracts in accessible terms
   - Suggest related sessions or projects

3. Provide event context:
   - Event format and structure
   - How to bookmark projects (QR codes)
   - Follow-up resources and contact information

Guidelines:
- Be concise and helpful
- Assume users are MSR researchers with technical backgrounds
- Link to specific sessions/projects when relevant
- If you don't know something, acknowledge it clearly
- Encourage exploration of event content

Context available: {event_name}, {current_date}, {event_phase}
Data access: {sessions}, {posters}, {agenda}
```

5. **Model settings**:
   - Temperature: `0.3`
   - Max tokens: `4096`
   - Top P: `0.95`

6. Click **"Create"** and note the **Agent ID** (if using REST API approach)

## Step 4: Update Backend Configuration

### 4.1 Update `.env` in `msr-event-agent-chat`

```bash
cd d:\code\msr-event-agent-chat
```

Edit `.env` (or create from `.env.example`):

```bash
# Azure OpenAI (fallback)
AZURE_OPENAI_ENDPOINT=https://tnr-events-ai.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-12-01-preview

# Azure AI Foundry Configuration
FOUNDRY_ENDPOINT=https://msr-event-hub.eastus.api.azureml.ms/
FOUNDRY_AGENT_DEPLOYMENT=gpt-5-mini-event-hub
FOUNDRY_API_VERSION=2025-11-15-preview

# Foundry delegation (keep OFF by default for testing)
DELEGATE_TO_FOUNDRY=false
FOUNDRY_ALLOW_PER_REQUEST_OVERRIDE=true
FOUNDRY_REQUIRED_ROLE=

# Agent settings
AGENT_TEMPERATURE=0.3
AGENT_MAX_TOKENS=4096
```

### 4.2 Update `.env` in `msr-event-agent-bridge`

```bash
cd d:\code\msr-event-agent-bridge
```

Edit `.env`:

```bash
# Backend API Configuration
KNOWLEDGE_API_URL=http://localhost:8000/api

# Foundry delegation (keep OFF by default)
DELEGATE_TO_FOUNDRY=false
FOUNDRY_REQUIRED_ROLE=
```

### 4.3 Verify ShowcaseApp `.env`

Already configured at `d:\code\ShowcaseApp\showcaseapp\.env`:
```bash
VITE_DELEGATE_TO_FOUNDRY=false
VITE_FOUNDRY_DEBUG_TOGGLE=false
```

## Step 5: Test Deployment

### 5.1 Start Backend

```bash
cd d:\code\msr-event-agent-chat
d:\code\msr-event-agent-chat\venv\Scripts\python.exe -m uvicorn src.main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 5.2 Start Bridge

```bash
cd d:\code\msr-event-agent-bridge
npm install  # if not already done
npm start
```

Expected output:
```
Bridge server listening on port 3000
```

### 5.3 Start Frontend

```bash
cd d:\code\ShowcaseApp\showcaseapp
npm run dev
```

Expected output:
```
VITE v5.x.x ready in xxx ms
Local: http://localhost:5173/
```

### 5.4 Test Chat (Azure OpenAI - Fallback)

1. Open http://localhost:5173
2. Navigate to Chat/Assistant
3. Send test message: "What is MSR Event Hub?"
4. Expected: Response from Azure OpenAI gpt-5-mini (fallback mode)

### 5.5 Test Chat (Foundry Override)

**Method 1: Query Parameter** (if frontend supports)
```
http://localhost:5173/chat?foundry=1&debug=1
```

**Method 2: Backend API Direct**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Delegate-To-Foundry: 1" \
  -H "X-Debug: 1" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is MSR Event Hub?"}
    ]
  }'
```

Expected: Response from Foundry agent (or fallback with error logged)

### 5.6 Enable Foundry by Default (Once Validated)

Update `.env` files:
```bash
# Backend
DELEGATE_TO_FOUNDRY=true

# Bridge
DELEGATE_TO_FOUNDRY=true

# Frontend (optional - for UI toggle)
VITE_DELEGATE_TO_FOUNDRY=true
```

Restart all services and test again.

## Step 6: Verify with Telemetry

### Backend Logs to Check

```bash
# Look for these in terminal running uvicorn:
INFO: Foundry delegation enabled via header
INFO: Forwarding to Foundry agent...
INFO: foundry_delegate_start
INFO: foundry_delegate_success
# OR if failed:
ERROR: foundry_delegate_error
INFO: foundry_delegate_fallback
```

### Debug Mode

If issues occur, check:
```bash
# Backend: Set debug logging
LOG_LEVEL=DEBUG

# Frontend: Check browser console for:
"Delegating to Foundry: true"
"X-Delegate-To-Foundry: 1"
```

## Step 7: Grounding Data (Phase 1)

Once Phase 0 chat works, add grounding data for context:

### Option A: Cosmos DB Integration (Production)
- Agent reads from `COSMOS_ENDPOINT` for live event data
- See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

### Option B: Static JSON (Testing)
```bash
# Backend: Add event data files
mkdir -p d:\code\msr-event-agent-chat\data\events
# Copy sample event JSON to data/events/msr-india-2026.json
```

Update `foundry_agent.py` to include context:
```python
context = {
    "event_name": "MSR India TAB 2026",
    "current_date": datetime.now().isoformat(),
    "event_phase": "pre_event",  # or "during_event", "post_event"
    "sessions": load_sessions(),
    "posters": load_posters(),
}
```

## Troubleshooting

### Issue: "FOUNDRY_ENDPOINT not configured"
- **Fix**: Ensure `.env` has valid `FOUNDRY_ENDPOINT=https://...` value
- Restart backend after changes

### Issue: 401 Unauthorized
- **Fix**: Run `az login` to refresh credentials
- Verify Managed Identity has access to Foundry project

### Issue: Model not found
- **Fix**: Verify `FOUNDRY_AGENT_DEPLOYMENT` matches deployed model name
- Check deployment status in Azure AI Foundry portal

### Issue: Timeout
- **Fix**: Increase `AGENT_TIMEOUT=300` in `.env`
- Check network connectivity to Foundry endpoint

### Issue: Fallback always triggers
- **Fix**: Check backend logs for actual error
- Verify `DELEGATE_TO_FOUNDRY=false` and using override headers
- Test Foundry connection directly with Azure SDK

## Next Steps

1. ✅ Deploy Event Hub Assistant (Phase 0)
2. ⏭️ Test with sample queries and gather feedback
3. ⏭️ Add event grounding data (sessions, posters)
4. ⏭️ Deploy Project Knowledge Agent (Phase 1)
5. ⏭️ Deploy Event Discovery Agent (Phase 1)
6. ⏭️ Implement agent routing logic in backend

## Resources

- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) - All agent system prompts
- [Azure AI Foundry Docs](https://learn.microsoft.com/azure/ai-studio/)
- [Agent Framework SDK](https://github.com/microsoft/agent-framework)
