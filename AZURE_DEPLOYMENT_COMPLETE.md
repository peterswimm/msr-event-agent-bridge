# ✅ Azure Infrastructure Deployed

**Deployment Date:** January 20, 2026  
**Subscription:** MSRChat (9c9d9ee3-e51d-4644-862f-2d26ce69c717)  
**Resource Group:** msr-event-hub-dev (eastus)  
**Environment:** dev

---

## Deployed Resources

### 1. Key Vault ✅
```
Name: kvehub2873
URI: https://kvehub2873.vault.azure.net/
```

### 2. CMK Key ✅
```
Key Name: event-hub-cmk
Algorithm: RSA-2048
Operations: encrypt, decrypt, sign, verify, wrapKey, unwrapKey
```

### 3. Managed Identity ✅
```
Name: mi-event-hub-dev
Client ID: 7505080d-2ab4-4d55-8fa2-89ce34b74987
Principal ID: 1aa18e03-3715-4296-a8e7-435b1cda5024
```

### 4. Azure OpenAI Service ✅
```
Name: aoai-ehub-9304
Kind: OpenAI
SKU: S0
Endpoint: https://eastus.api.cognitive.microsoft.com/
Location: eastus
```

---

## Next Steps

### Step 1: Get OpenAI API Key
In Azure Portal or via:
```powershell
az cognitiveservices account keys list `
  --resource-group "msr-event-hub-dev" `
  --name "aoai-ehub-9304" `
  --query "key1" -o tsv
```

### Step 2: Deploy Models to Azure OpenAI

Deploy via Azure Portal (Cognitive Services → aoai-ehub-9304 → Model deployments):

| Model | Deployment Name | Version | Instances | TPM |
|-------|-----------------|---------|-----------|-----|
| gpt-4o | gpt-4o | 2024-11-20 | 1 | 20 |
| gpt-4o-mini | gpt-4o-mini | 2024-07-18 | 1 | 30 |
| text-embedding-3-large | embeddings-3-large | 1 | 10 |

**Alternative: Azure CLI**
```powershell
$aoaiName = "aoai-ehub-9304"
$rg = "msr-event-hub-dev"

# Deploy gpt-4o
az cognitiveservices account deployment create `
  --resource-group $rg `
  --name $aoaiName `
  --deployment-name "gpt-4o" `
  --model-name "gpt-4o" `
  --model-version "2024-11-20" `
  --model-format "OpenAI" `
  --sku-capacity "1" `
  --sku-name "Standard"

# Deploy gpt-4o-mini
az cognitiveservices account deployment create `
  --resource-group $rg `
  --name $aoaiName `
  --deployment-name "gpt-4o-mini" `
  --model-name "gpt-4o-mini" `
  --model-version "2024-07-18" `
  --model-format "OpenAI" `
  --sku-capacity "1" `
  --sku-name "Standard"

# Deploy text-embedding-3-large
az cognitiveservices account deployment create `
  --resource-group $rg `
  --name $aoaiName `
  --deployment-name "embeddings-3-large" `
  --model-name "text-embedding-3-large" `
  --model-version "1" `
  --model-format "OpenAI" `
  --sku-capacity "1" `
  --sku-name "Standard"
```

### Step 3: Grant Managed Identity Access to OpenAI

```powershell
$aoaiResourceId = "/subscriptions/9c9d9ee3-e51d-4644-862f-2d26ce69c717/resourceGroups/msr-event-hub-dev/providers/Microsoft.CognitiveServices/accounts/aoai-ehub-9304"
$miPrincipalId = "1aa18e03-3715-4296-a8e7-435b1cda5024"

# Role: Cognitive Services OpenAI User
az role assignment create `
  --assignee-object-id $miPrincipalId `
  --role "Cognitive Services OpenAI User" `
  --scope $aoaiResourceId
```

### Step 4: Configure Application Environment

**msr-event-agent-bridge/.env**:
```env
AZURE_OPENAI_ENDPOINT=https://aoai-ehub-9304.openai.azure.com/
AZURE_OPENAI_KEY=<paste-key-here>
KNOWLEDGE_API_URL=http://localhost:8000
KEY_VAULT_URL=https://kvehub2873.vault.azure.net/
ENCRYPTION_KEY_NAME=event-hub-cmk
AZURE_CLIENT_ID=7505080d-2ab4-4d55-8fa2-89ce34b74987
```

**msr-event-agent-chat/.env**:
```env
AZURE_OPENAI_ENDPOINT=https://aoai-ehub-9304.openai.azure.com/
AZURE_OPENAI_KEY=<paste-key-here>
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
EMBEDDINGS_DEPLOYMENT_NAME=embeddings-3-large
KEY_VAULT_URL=https://kvehub2873.vault.azure.net/
ENCRYPTION_KEY_NAME=event-hub-cmk
AZURE_CLIENT_ID=7505080d-2ab4-4d55-8fa2-89ce34b74987
```

### Step 5: Test Integration

Once models are deployed and .env configured:

```powershell
# Terminal 1: Python backend
cd D:\code\msr-event-agent-chat
$env:AZURE_OPENAI_KEY = "<your-key>"
python -m uvicorn main:app --reload

# Terminal 2: Node bridge
cd D:\code\msr-event-agent-bridge
$env:AZURE_OPENAI_KEY = "<your-key>"
npm start

# Terminal 3: Test chat
curl -X POST http://localhost:3000/api/chat `
  -H "Content-Type: application/json" `
  -d '{
    "eventId": "msri-tab-2026",
    "sessionId": "sess-ai-agents-foundations",
    "message": "Tell me about this session",
    "userId": "test-user"
  }'
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Model deployment quota exceeded | Request quota increase via Azure Portal → Quotas |
| Connection timeout | Verify endpoint URL spelling; test: `curl https://aoai-ehub-9304.openai.azure.com/` |
| 401 Unauthorized | Verify API key is correct and models are deployed |
| Rate limit (429) | Configured TPM: gpt-4o (20), gpt-4o-mini (30), embeddings (10) |

---

## Important Notes

- **Managed identity** has not yet been granted Key Vault Crypto User role (pending network reconnection)
- **Models** need to be deployed in Azure Portal or via CLI commands above
- **Cost**: S0 SKU charges based on API calls; estimate $0.01-0.05 per 1K tokens depending on model

For questions, see [Azure OpenAI documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
