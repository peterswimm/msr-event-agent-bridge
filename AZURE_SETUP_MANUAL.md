# Azure Infrastructure Setup - Manual Steps

**Status**: Bicep CLI network issue detected. Use manual steps below to configure Azure resources.

**Subscription**: MSRChat (9c9d9ee3-e51d-4644-862f-2d26ce69c717)  
**Resource Group**: msr-event-hub-dev (eastus) ✅ *Already created*  
**Environment**: dev

---

## Step 1: Create Key Vault

```powershell
$rg = "msr-event-hub-dev"
$location = "eastus"
$kvName = "kv-event-hub-dev-$(Get-Random -Maximum 9999)"

az keyvault create `
  --resource-group $rg `
  --name $kvName `
  --location $location `
  --enable-soft-delete true `
  --soft-delete-retention-days 90 `
  --enable-purge-protection true
```

**Save the Key Vault name**: `$kvName`

---

## Step 2: Create CMK in Key Vault

```powershell
$keyName = "event-hub-cmk"

az keyvault key create `
  --vault-name $kvName `
  --name $keyName `
  --kty RSA `
  --size 2048 `
  --ops encrypt decrypt
```

---

## Step 3: Create Managed Identity

```powershell
$miName = "mi-event-hub-dev"

az identity create `
  --resource-group $rg `
  --name $miName `
  --location $location

# Save the ID
$miId = az identity show --resource-group $rg --name $miName --query "id" -o tsv
$miClientId = az identity show --resource-group $rg --name $miName --query "clientId" -o tsv
$miPrincipalId = az identity show --resource-group $rg --name $miName --query "principalId" -o tsv
```

---

## Step 4: Grant Key Vault Permissions

```powershell
# Role: Key Vault Crypto User
$roleId = "12338af0-0e69-4776-a894-a57eca8541a3"

az role assignment create `
  --assignee-object-id $miPrincipalId `
  --role $roleId `
  --scope "/subscriptions/9c9d9ee3-e51d-4644-862f-2d26ce69c717/resourceGroups/$rg/providers/Microsoft.KeyVault/vaults/$kvName"
```

---

## Step 5: Create Azure OpenAI Service

```powershell
$openaiName = "aoai-event-hub-dev-$(Get-Random -Maximum 9999)"

az cognitiveservices account create `
  --resource-group $rg `
  --name $openaiName `
  --location "eastus" `
  --kind OpenAI `
  --sku s0 `
  --custom-domain $openaiName `
  --yes

# Save the endpoint
$openaiEndpoint = az cognitiveservices account show --resource-group $rg --name $openaiName --query "properties.endpoint" -o tsv
$openaiKey = az cognitiveservices account keys list --resource-group $rg --name $openaiName --query "key1" -o tsv
```

---

## Step 6: Deploy Models

Deploy these models to Azure OpenAI (via Portal or CLI):

| Model | Deployment Name | Instance Count | Tokens Per Minute |
|-------|-----------------|-----------------|-------------------|
| gpt-4o (2024-11-20) | gpt-4o | 1 | 20 |
| gpt-4o-mini (2024-07-18) | gpt-4o-mini | 1 | 30 |
| text-embedding-3-large | embeddings-3-large | 1 | 10 |

```powershell
# Example for gpt-4o deployment
az cognitiveservices account deployment create `
  --resource-group $rg `
  --name $openaiName `
  --deployment-name "gpt-4o" `
  --model-name "gpt-4o" `
  --model-version "2024-11-20" `
  --model-format OpenAI `
  --sku "Standard" `
  --capacity 1
```

---

## Step 7: Configure Environment Variables

Create `.env` in both bridge and chat repos:

**msr-event-agent-bridge/.env**:
```
AZURE_OPENAI_ENDPOINT=https://<openaiName>.openai.azure.com/
AZURE_OPENAI_KEY=<openaiKey>
KEY_VAULT_URL=https://<kvName>.vault.azure.net/
ENCRYPTION_KEY_NAME=event-hub-cmk
AZURE_CLIENT_ID=<miClientId>
KNOWLEDGE_API_URL=http://localhost:8000
```

**msr-event-agent-chat/.env**:
```
AZURE_OPENAI_ENDPOINT=https://<openaiName>.openai.azure.com/
AZURE_OPENAI_KEY=<openaiKey>
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
EMBEDDINGS_DEPLOYMENT_NAME=embeddings-3-large
KEY_VAULT_URL=https://<kvName>.vault.azure.net/
ENCRYPTION_KEY_NAME=event-hub-cmk
AZURE_CLIENT_ID=<miClientId>
```

---

## Step 8: Test Integration

Once deployed and .env is configured:

```powershell
# Terminal 1: Start Python backend
cd D:\code\msr-event-agent-chat
python -m uvicorn main:app --reload

# Terminal 2: Start Node bridge
cd D:\code\msr-event-agent-bridge
npm start

# Terminal 3: Test chat endpoint
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

## Variables to Save

After completing all steps, save these for future reference:

```powershell
# Key Vault
$kvName = "kv-event-hub-dev-XXXX"
$keyVaultUrl = "https://$kvName.vault.azure.net/"

# Managed Identity
$miClientId = "00000000-0000-0000-0000-000000000000"
$miPrincipalId = "00000000-0000-0000-0000-000000000000"

# Azure OpenAI
$openaiName = "aoai-event-hub-dev-XXXX"
$openaiEndpoint = "https://$openaiName.openai.azure.com/"
$openaiKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## Troubleshooting

**Issue**: "Connection aborted" when running Bicep CLI  
**Solution**: Use manual Azure CLI commands above (Bicep binary network issue is temporary)

**Issue**: Model deployment fails  
**Solution**: May need to request quota increase via Azure Portal > Quotas

**Issue**: Managed identity permissions denied  
**Solution**: Ensure role assignment propagated (may take 2-5 minutes)
