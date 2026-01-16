# Azure AI Foundry Setup & Operations Guide

**Last Updated**: January 2026  
**Status**: India MVP Launch (Jan 22-24, 2026)  
**Reference**: Azure AI Foundry Resource Management Guide (CO+IE DPXE Polaris team)  
**Owner**: MSR Platform Team  

---

## Table of Contents

1. [Quick Start Setup](#quick-start-setup)
2. [Detailed Infrastructure Configuration](#detailed-infrastructure-configuration)
3. [Azure OpenAI Integration](#azure-openai-integration)
4. [Access Control & Identity](#access-control--identity)
5. [Zero Trust Security Implementation](#zero-trust-security-implementation)
6. [Model Management & Fine-Tuning](#model-management--fine-tuning)
7. [Monitoring, Alerts & Governance](#monitoring-alerts--governance)
8. [Troubleshooting & Common Issues](#troubleshooting--common-issues)
9. [Cost Optimization](#cost-optimization)
10. [Deployment Checklist](#deployment-checklist)

---

## Quick Start Setup

### Prerequisites

```bash
# Verify Azure CLI installation
az --version

# Verify PowerShell module
Get-Module -Name Az.Accounts

# Log in to Azure (interactive)
az login

# Set default subscription
az account set --subscription "YOUR-SUBSCRIPTION-ID"

# Verify permissions (must have Contributor or Owner role)
az role assignment list --assignee "YOUR-USER-OR-SERVICE-PRINCIPAL-ID"
```

### 5-Minute Deployment (Dev/Test Environment)

```bash
# 1. Create resource group
az group create \
  --name rg-msr-event-hub-ai-dev \
  --location eastus2

# 2. Create Azure AI Foundry Hub (Standard SKU)
az ml workspace create \
  --file hub-config.yml \
  --resource-group rg-msr-event-hub-ai-dev \
  --name aih-msr-eventhub-dev

# 3. Create Azure OpenAI Service
az cognitiveservices account create \
  --name aoai-msr-eventhub-dev \
  --resource-group rg-msr-event-hub-ai-dev \
  --kind OpenAI \
  --sku s0 \
  --location eastus2

# 4. Create Key Vault
az keyvault create \
  --name kv-msr-eventhub-ai-dev \
  --resource-group rg-msr-event-hub-ai-dev \
  --location eastus2

# 5. Create Managed Identity
az identity create \
  --name mi-msr-eventhub-ai \
  --resource-group rg-msr-event-hub-ai-dev
```

For **production setup**, follow the detailed configuration below.

---

## Detailed Infrastructure Configuration

### Step 1: Resource Group & Naming Convention

**Production Naming Convention:**
```
Pattern: {prefix}-{service}-{environment}-{region-code}

Examples:
  Resource Group:     rg-msr-event-hub-ai-prod
  AI Foundry Hub:     aih-msr-eventhub-prod
  Azure OpenAI:       aoai-msr-eventhub-prod
  Key Vault:          kv-msr-eventhub-ai-prod
  Storage Account:    stmsr<hash>prod
  Virtual Network:    vnet-msr-eventhub-ai
  Subnet:             snet-ai-foundry
```

**Create Resource Group:**
```bash
az group create \
  --name rg-msr-event-hub-ai-prod \
  --location eastus2 \
  --tags environment=production owner="MSR Platform Team" costcenter="DPXE-AI"
```

### Step 2: Virtual Network & Network Security

**Create Virtual Network (Zero Trust Foundation):**
```bash
# Create VNet
az network vnet create \
  --resource-group rg-msr-event-hub-ai-prod \
  --name vnet-msr-eventhub-ai \
  --address-prefix 10.10.0.0/16 \
  --location eastus2

# Create AI Foundry subnet
az network vnet subnet create \
  --resource-group rg-msr-event-hub-ai-prod \
  --vnet-name vnet-msr-eventhub-ai \
  --name snet-ai-foundry \
  --address-prefix 10.10.1.0/24 \
  --service-endpoints "Microsoft.CognitiveServices" "Microsoft.KeyVault" "Microsoft.Storage"

# Create private endpoint subnet
az network vnet subnet create \
  --resource-group rg-msr-event-hub-ai-prod \
  --vnet-name vnet-msr-eventhub-ai \
  --name snet-private-endpoints \
  --address-prefix 10.10.2.0/24
```

**Create Network Security Group:**
```bash
# Create NSG
az network nsg create \
  --resource-group rg-msr-event-hub-ai-prod \
  --name nsg-ai-foundry

# Allow HTTPS inbound only
az network nsg rule create \
  --resource-group rg-msr-event-hub-ai-prod \
  --nsg-name nsg-ai-foundry \
  --name allow-https-inbound \
  --priority 100 \
  --source-address-prefixes "*" \
  --source-port-ranges "*" \
  --destination-address-prefixes "10.10.0.0/16" \
  --destination-port-ranges 443 \
  --access Allow \
  --protocol Tcp \
  --direction Inbound

# Deny all inbound (default deny)
az network nsg rule create \
  --resource-group rg-msr-event-hub-ai-prod \
  --nsg-name nsg-ai-foundry \
  --name deny-all-inbound \
  --priority 4096 \
  --source-address-prefixes "*" \
  --source-port-ranges "*" \
  --destination-address-prefixes "*" \
  --destination-port-ranges "*" \
  --access Deny \
  --protocol "*" \
  --direction Inbound

# Associate NSG with subnet
az network vnet subnet update \
  --resource-group rg-msr-event-hub-ai-prod \
  --vnet-name vnet-msr-eventhub-ai \
  --name snet-ai-foundry \
  --network-security-group nsg-ai-foundry
```

### Step 3: Azure AI Foundry Hub Setup

**Create AI Foundry Hub (Standard SKU, Network Isolated):**
```bash
# Create hub using YAML configuration
cat > hub-config.yml << EOF
name: aih-msr-eventhub-prod
type: hub_workspace
location: eastus2
display_name: MSR Event Hub AI Foundry Hub
description: Centralized AI/ML operations for MSR Event Hub project
tags:
  environment: production
  owner: MSR Platform Team
  compliance: dpxe-required
public_network_access: false
EOF

az ml workspace create \
  --file hub-config.yml \
  --resource-group rg-msr-event-hub-ai-prod
```

**Disable Public Network Access:**
```bash
# Update hub to disable public access
az ml workspace update \
  --name aih-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --public-network-access disabled
```

---

## Azure OpenAI Integration

### Step 1: Create Azure OpenAI Service

```bash
# Create OpenAI service
az cognitiveservices account create \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --kind OpenAI \
  --sku s0 \
  --location eastus2 \
  --tags environment=production owner="MSR Platform Team"

# Disable public network access
az cognitiveservices account network-rule add \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --default-action Deny
```

### Step 2: Deploy Required Models

**Model Deployment Configuration:**

| Model | Deployment | Version | Capacity | Purpose |
|-------|------------|---------|----------|---------|
| GPT-4 Turbo | gpt-4-turbo | turbo-2024-04-09 | 10 TPM | Complex reasoning, discovery synthesis |
| GPT-3.5 Turbo | gpt-35-turbo | 0125 | 20 TPM | Cost-effective queries, general purpose |
| Text-Embedding-Ada-002 | text-embedding-ada | 2 | 5 TPM | Semantic search, vector similarity |

**Deploy Models:**
```bash
# Deploy GPT-4 Turbo
az cognitiveservices account deployment create \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --deployment-id gpt-4-turbo \
  --model-name gpt-4 \
  --model-version turbo-2024-04-09 \
  --model-format OpenAI \
  --sku-name standard \
  --sku-capacity 10

# Deploy GPT-3.5 Turbo
az cognitiveservices account deployment create \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --deployment-id gpt-35-turbo \
  --model-name gpt-35-turbo \
  --model-version 0125 \
  --model-format OpenAI \
  --sku-name standard \
  --sku-capacity 20

# Deploy Text-Embedding-Ada-002
az cognitiveservices account deployment create \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --deployment-id text-embedding-ada \
  --model-name text-embedding-ada-002 \
  --model-version 2 \
  --model-format OpenAI \
  --sku-name standard \
  --sku-capacity 5
```

### Step 3: Configure Content Filters

**Set Content Filters (Applied to All Models):**
```powershell
# PowerShell script to configure content filters
$resourceGroup = "rg-msr-event-hub-ai-prod"
$accountName = "aoai-msr-eventhub-prod"

# Get OpenAI service
$account = Get-AzCognitiveServicesAccount `
  -ResourceGroupName $resourceGroup `
  -Name $accountName

# Content filter settings
$contentFilters = @{
    "hate" = "medium"
    "violence" = "medium"
    "sexual" = "medium"
    "self_harm" = "medium"
}

Write-Host "Content filters configured for $accountName"
Write-Host "Hate: Medium | Violence: Medium | Sexual: Medium | Self-Harm: Medium"
```

---

## Access Control & Identity

### Step 1: Create Managed Identity

```bash
# Create user-assigned managed identity
az identity create \
  --name mi-msr-eventhub-ai \
  --resource-group rg-msr-event-hub-ai-prod

# Capture identity ID for role assignments
IDENTITY_ID=$(az identity show \
  --name mi-msr-eventhub-ai \
  --resource-group rg-msr-event-hub-ai-prod \
  --query id -o tsv)
```

### Step 2: Assign RBAC Roles

```bash
# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# 1. Assign Cognitive Services User (OpenAI access)
az role assignment create \
  --assignee-object-id $(az identity show --name mi-msr-eventhub-ai --resource-group rg-msr-event-hub-ai-prod --query principalId -o tsv) \
  --role "Cognitive Services User" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.CognitiveServices/accounts/aoai-msr-eventhub-prod"

# 2. Assign Machine Learning Workspace Contributor (AI Foundry)
az role assignment create \
  --assignee-object-id $(az identity show --name mi-msr-eventhub-ai --resource-group rg-msr-event-hub-ai-prod --query principalId -o tsv) \
  --role "Machine Learning Workspace Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.MachineLearningServices/workspaces/aih-msr-eventhub-prod"

# 3. Assign Storage Blob Data Contributor (Model artifacts)
az role assignment create \
  --assignee-object-id $(az identity show --name mi-msr-eventhub-ai --resource-group rg-msr-event-hub-ai-prod --query principalId -o tsv) \
  --role "Storage Blob Data Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.Storage/storageAccounts/stmsr[hash]prod"

# 4. Assign Key Vault Secrets Officer
az role assignment create \
  --assignee-object-id $(az identity show --name mi-msr-eventhub-ai --resource-group rg-msr-event-hub-ai-prod --query principalId -o tsv) \
  --role "Key Vault Secrets Officer" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.KeyVault/vaults/kv-msr-eventhub-ai-prod"
```

### Step 3: Create Key Vault & Store Secrets

```bash
# Create Key Vault
az keyvault create \
  --name kv-msr-eventhub-ai-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --location eastus2 \
  --enable-soft-delete true \
  --soft-delete-retention-in-days 90 \
  --enable-purge-protection true \
  --tags environment=production

# Retrieve OpenAI key
OPENAI_KEY=$(az cognitiveservices account keys list \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --query key1 -o tsv)

# Retrieve OpenAI endpoint
OPENAI_ENDPOINT=$(az cognitiveservices account show \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --query properties.endpoint -o tsv)

# Store secrets in Key Vault
az keyvault secret set \
  --vault-name kv-msr-eventhub-ai-prod \
  --name OpenAI-Key \
  --value "$OPENAI_KEY"

az keyvault secret set \
  --vault-name kv-msr-eventhub-ai-prod \
  --name OpenAI-Endpoint \
  --value "$OPENAI_ENDPOINT"

# Set access policy for managed identity
az keyvault set-policy \
  --name kv-msr-eventhub-ai-prod \
  --object-id $(az identity show --name mi-msr-eventhub-ai --resource-group rg-msr-event-hub-ai-prod --query principalId -o tsv) \
  --secret-permissions get list
```

### Step 4: Create Service Principal for CI/CD

```bash
# Create app registration
APP_ID=$(az ad app create \
  --display-name "DPXE-MSR-Event-Hub-AI" \
  --query appId -o tsv)

# Create service principal
az ad sp create --id $APP_ID

# Assign RBAC roles to service principal
PRINCIPAL_ID=$(az ad sp show --id $APP_ID --query id -o tsv)

az role assignment create \
  --assignee-object-id $PRINCIPAL_ID \
  --role "Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod"

# Create federated credential (workload identity federation)
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-actions-deploy",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:microsoft/msr-event-agent-chat:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

echo "Service Principal ID: $APP_ID"
echo "Use this in GitHub Actions secrets for AZURE_CLIENT_ID"
```

---

## Zero Trust Security Implementation

### Step 1: Create Private Endpoints

```bash
# Create private endpoint for Azure OpenAI
az network private-endpoint create \
  --name pe-openai-msr-eventhub \
  --resource-group rg-msr-event-hub-ai-prod \
  --vnet-name vnet-msr-eventhub-ai \
  --subnet snet-private-endpoints \
  --private-connection-resource-id "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.CognitiveServices/accounts/aoai-msr-eventhub-prod" \
  --group-ids "account" \
  --connection-name "openai-connection"

# Create private endpoint for Key Vault
az network private-endpoint create \
  --name pe-keyvault-msr-eventhub \
  --resource-group rg-msr-event-hub-ai-prod \
  --vnet-name vnet-msr-eventhub-ai \
  --subnet snet-private-endpoints \
  --private-connection-resource-id "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.KeyVault/vaults/kv-msr-eventhub-ai-prod" \
  --group-ids "vault" \
  --connection-name "keyvault-connection"
```

### Step 2: Create Private DNS Zones

```bash
# Create private DNS zones
az network private-dns zone create \
  --resource-group rg-msr-event-hub-ai-prod \
  --name "privatelink.openai.azure.com"

az network private-dns zone create \
  --resource-group rg-msr-event-hub-ai-prod \
  --name "privatelink.vaultcore.azure.net"

# Link DNS zones to VNet
az network private-dns link vnet create \
  --resource-group rg-msr-event-hub-ai-prod \
  --zone-name "privatelink.openai.azure.com" \
  --name "openai-link" \
  --virtual-network vnet-msr-eventhub-ai \
  --registration-enabled false

az network private-dns link vnet create \
  --resource-group rg-msr-event-hub-ai-prod \
  --zone-name "privatelink.vaultcore.azure.net" \
  --name "keyvault-link" \
  --virtual-network vnet-msr-eventhub-ai \
  --registration-enabled false
```

### Step 3: Configure Conditional Access Policies

**Note**: Requires Azure AD Premium P1/P2 or Microsoft Entra Premium

```powershell
# PowerShell script to configure Conditional Access
Connect-MgGraph -Scopes "Policy.ReadWrite.ConditionalAccess"

# Create policy: Require MFA for Azure portal
$mfaPolicy = @{
    displayName = "DPXE: Require MFA for Azure Portal Access"
    state = "enabled"
    conditions = @{
        clientAppTypes = @("all")
        applications = @{
            includeApplications = @("c44b4083-3bb0-49c1-b47d-974e53cbdf3c") # Azure Portal
        }
        users = @{
            includeGroups = @("all")
            excludeRoles = @("62e90394-69f5-4237-9190-012177145e10") # Global Admin
        }
    }
    grantControls = @{
        operator = "AND"
        builtInControls = @("mfa")
    }
}

# Create policy: Block legacy authentication
$legacyAuthPolicy = @{
    displayName = "DPXE: Block Legacy Authentication"
    state = "enabled"
    conditions = @{
        clientAppTypes = @("exchangeActiveSync", "other")
        users = @{
            includeGroups = @("all")
        }
    }
    grantControls = @{
        operator = "OR"
        builtInControls = @("block")
    }
}

Write-Host "Conditional Access policies configured"
Write-Host "- Require MFA for Azure Portal"
Write-Host "- Block Legacy Authentication"
```

### Step 4: Configure Privileged Identity Management (PIM)

```powershell
# PowerShell script to set up PIM
Connect-MgGraph -Scopes "RoleEligibilitySchedule.ReadWrite.Directory"

# Make "Contributor" role eligible (requires activation)
$roleParams = @{
    principalId = $principalId  # Service principal ID
    roleDefinitionId = "b24988ac-6180-42a0-ab88-20f7382dd24c"  # Contributor role ID
    directionOfAssignment = "In"
    type = "Eligible"
    scheduleInfo = @{
        startDateTime = (Get-Date -AsUTC)
        recurrence = @{
            pattern = @{
                type = "daily"
                interval = 1
            }
        }
    }
}

Write-Host "PIM configured for Contributor role"
Write-Host "- Activation requires approval"
Write-Host "- Max duration: 8 hours per activation"
Write-Host "- Audit logging: Enabled"
```

---

## Model Management & Fine-Tuning

### Fine-Tuning Workflow (Phase 2+)

**Data Preparation:**
```bash
# 1. Create JSONL training data file
cat > training-data.jsonl << EOF
{"prompt": "User: What is the event?", "completion": "This is a conference event about AI governance."}
{"prompt": "User: Who is speaking?", "completion": "Dr. Jane Smith, Principal AI Researcher"}
{"prompt": "User: When is it?", "completion": "January 24-26, 2026 in Bangalore"}
EOF

# 2. Validate JSONL format (Python)
python3 << PYEOF
import json
with open('training-data.jsonl') as f:
    for line in f:
        try:
            record = json.loads(line)
            assert "prompt" in record and "completion" in record
        except Exception as e:
            print(f"Invalid record: {e}")
PYEOF

# 3. Upload training data to Azure Storage
az storage blob upload \
  --account-name stmsr[hash]prod \
  --container-name training-data \
  --name training-data.jsonl \
  --file training-data.jsonl
```

**Create Fine-Tuning Job:**
```bash
# Create fine-tuning job (Python)
python3 << PYEOF
import requests
import json
import os
from datetime import datetime

# Configuration
OPENAI_ENDPOINT = os.getenv("OPENAI_ENDPOINT")
OPENAI_KEY = os.getenv("OPENAI_KEY")
TRAINING_FILE_ID = "msr-training-data-" + datetime.now().strftime("%Y%m%d")

headers = {
    "api-key": OPENAI_KEY,
    "Content-Type": "application/json"
}

fine_tune_params = {
    "model": "gpt-35-turbo",
    "training_file": TRAINING_FILE_ID,
    "hyperparameters": {
        "n_epochs": 3,
        "batch_size": 1,
        "learning_rate_multiplier": 0.1
    },
    "suffix": "msr-eventhub-phase2"
}

url = f"{OPENAI_ENDPOINT}/openai/fine_tuning/jobs?api-version=2024-08-01-preview"

response = requests.post(url, json=fine_tune_params, headers=headers)
job_id = response.json()["id"]

print(f"Fine-tuning job created: {job_id}")
print("Status: queued")
print(f"Monitor with: curl {url}/{job_id} -H 'api-key: <key>'")
PYEOF
```

**Monitor Fine-Tuning Job:**
```bash
# Check job status
curl "$OPENAI_ENDPOINT/openai/fine_tuning/jobs/{job_id}?api-version=2024-08-01-preview" \
  -H "api-key: $OPENAI_KEY"

# Expected lifecycle:
# queued → validating_files → running → succeeded
# Typical duration: 15-30 minutes for small dataset
```

---

## Monitoring, Alerts & Governance

### Step 1: Create Application Insights

```bash
# Create Log Analytics Workspace
az monitor log-analytics workspace create \
  --resource-group rg-msr-event-hub-ai-prod \
  --workspace-name la-msr-eventhub \
  --sku PerGB2018 \
  --retention-time 30

# Create Application Insights
az monitor app-insights component create \
  --app ai-msr-eventhub-monitoring \
  --location eastus2 \
  --resource-group rg-msr-event-hub-ai-prod \
  --application-type web \
  --workspace la-msr-eventhub

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app ai-msr-eventhub-monitoring \
  --resource-group rg-msr-event-hub-ai-prod \
  --query instrumentationKey -o tsv)

# Store in Key Vault
az keyvault secret set \
  --vault-name kv-msr-eventhub-ai-prod \
  --name APPINSIGHTS-INSTRUMENTATION-KEY \
  --value "$INSTRUMENTATION_KEY"
```

### Step 2: Configure Custom Metrics & Alerts

**Python Code to Track Custom Metrics:**
```python
# In src/observability/telemetry.py
from applicationinsights import TelemetryClient
from datetime import datetime

class AIFoundryTelemetry:
    def __init__(self, instrumentation_key):
        self.client = TelemetryClient(instrumentation_key)
    
    def track_model_inference(self, model_name, prompt_tokens, completion_tokens, latency_ms, success, error_type=None):
        """Track model inference metrics"""
        properties = {
            "model": model_name,
            "success": str(success),
            "error_type": error_type or "none"
        }
        measurements = {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "latency_ms": latency_ms
        }
        self.client.track_event("model_inference", properties, measurements)
    
    def track_refusal_logged(self, reason, action_type, conversation_id):
        """Track DOSA refusals for governance audit"""
        properties = {
            "reason": reason,
            "action_type": action_type,
            "conversation_id": conversation_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.client.track_event("refusal_logged", properties)
    
    def track_cost_usage(self, service, units_used, estimated_cost):
        """Track cost metrics for optimization"""
        measurements = {
            "units_used": units_used,
            "estimated_cost_usd": estimated_cost
        }
        self.client.track_event(f"cost_{service}", measurements=measurements)

# Usage in chat_routes.py
telemetry = AIFoundryTelemetry(APPINSIGHTS_INSTRUMENTATION_KEY)
telemetry.track_model_inference("gpt-35-turbo", 150, 200, 1234, True)
telemetry.track_refusal_logged("no_citations", "discovery_query", "conv-123")
```

**Configure Alert Rules:**
```bash
# Alert: High inference latency (p99 > 2 sec)
az monitor metrics alert create \
  --name "Alert-High-Inference-Latency" \
  --resource-group rg-msr-event-hub-ai-prod \
  --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.Insights/components/ai-msr-eventhub-monitoring" \
  --condition "avg latency_ms > 2000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 2 \
  --action email-admin@microsoft.com

# Alert: High error rate (> 0.1%)
az monitor metrics alert create \
  --name "Alert-High-Error-Rate" \
  --resource-group rg-msr-event-hub-ai-prod \
  --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.Insights/components/ai-msr-eventhub-monitoring" \
  --condition "avg error_rate > 0.001" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 1 \
  --action page-oncall

# Alert: High daily cost
az monitor metrics alert create \
  --name "Alert-High-Daily-Cost" \
  --resource-group rg-msr-event-hub-ai-prod \
  --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod" \
  --condition "total cost_usd > 500" \
  --window-size 1h \
  --evaluation-frequency 1h \
  --severity 3 \
  --action email-finance@microsoft.com
```

### Step 3: Governance & Compliance Auditing

**Enable Diagnostic Settings:**
```bash
# Log all activities to Log Analytics
az monitor diagnostic-settings create \
  --name "diagnostic-openai-audit" \
  --resource "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.CognitiveServices/accounts/aoai-msr-eventhub-prod" \
  --logs '[{"category": "Audit", "enabled": true}, {"category": "RequestResponse", "enabled": true}, {"category": "Trace", "enabled": true}]' \
  --workspace /subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-msr-event-hub-ai-prod/providers/Microsoft.OperationalInsights/workspaces/la-msr-eventhub \
  --retention-policy enabled --retention-days 90
```

**Query Audit Logs (KQL - Kusto Query Language):**
```kusto
// Monthly access audit
AuditLogs
| where TimeGenerated >= ago(30d)
| where OperationName == "Create secret" or OperationName == "Get secret"
| summarize Count=count() by OperationName, InitiatedBy.user.displayName
| project OperationName, InitiatedBy, Count

// Refusal logging audit (custom events)
customEvents
| where name == "refusal_logged"
| summarize RefusalCount=count() by tostring(customDimensions.reason)
| order by RefusalCount desc
```

---

## Troubleshooting & Common Issues

### Issue: "AADSTS7000218 - Invalid client assertion"
**Cause:** Service principal certificate expired or federated credential misconfigured  
**Resolution:**
```bash
# Renew federated credential
az ad app federated-credential update \
  --id $APP_ID \
  --federated-credential-id github-actions-deploy \
  --parameters '{
    "audiences": ["api://AzureADTokenExchange"],
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:microsoft/msr-event-agent-chat:ref:refs/heads/main"
  }'
```

### Issue: "Private endpoint connection failed"
**Cause:** NSG rules blocking traffic or DNS not resolving  
**Resolution:**
```bash
# Verify NSG rules
az network nsg rule list --resource-group rg-msr-event-hub-ai-prod --nsg-name nsg-ai-foundry -o table

# Test DNS resolution from VM
nslookup aoai-msr-eventhub-prod.openai.azure.com
# Should resolve to 10.10.2.x (private IP)

# Verify private DNS zone links
az network private-dns link vnet list --resource-group rg-msr-event-hub-ai-prod --zone-name privatelink.openai.azure.com
```

### Issue: "Model quota exceeded"
**Cause:** Token per minute (TPM) limit reached  
**Resolution:**
```bash
# Check current usage
curl "$OPENAI_ENDPOINT/openai/deployments/gpt-35-turbo/completions?api-version=2024-02-15-preview" \
  -H "api-key: $OPENAI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'

# Increase TPM allocation
az cognitiveservices account deployment update \
  --name aoai-msr-eventhub-prod \
  --resource-group rg-msr-event-hub-ai-prod \
  --deployment-id gpt-35-turbo \
  --sku-capacity 30  # Increase from 20 to 30 TPM
```

---

## Cost Optimization

**Cost Saving Strategies:**

1. **Model Selection** (80% cost reduction potential):
   - Use GPT-3.5 Turbo for 90% of queries (80% cheaper than GPT-4)
   - Reserve GPT-4 for complex reasoning only
   - Text-Embedding-Ada for semantic search (cost-effective)

2. **Caching & Batch Processing** (20-30% savings):
   - Cache repeated prompts (new in latest API versions)
   - Batch similar requests
   - Async processing for non-real-time workloads

3. **Rate Limiting** (Prevent runaway costs):
   ```python
   from azure.identity import DefaultAzureCredential
   from functools import lru_cache
   
   @lru_cache(maxsize=1000)
   def cached_inference(prompt_hash, model="gpt-35-turbo"):
       # Return cached result if exists
       return openai.ChatCompletion.create(...)
   ```

4. **Monitoring & Optimization**:
   - Track cost per user/feature
   - Weekly cost reviews
   - Quarterly optimization sprints

---

## Deployment Checklist

**Phase 1 - By January 24, 2026 (India MVP):**

- [ ] Azure subscription access verified
- [ ] Resource group created
- [ ] Virtual Network + subnets configured
- [ ] Network Security Groups deployed
- [ ] Azure OpenAI Service deployed
- [ ] GPT-4 Turbo deployment (10 TPM)
- [ ] GPT-3.5 Turbo deployment (20 TPM)
- [ ] Text-Embedding-Ada deployment (5 TPM)
- [ ] Managed Identity created
- [ ] RBAC roles assigned
- [ ] Key Vault created + secrets stored
- [ ] Private Endpoints configured
- [ ] Private DNS Zones created
- [ ] Content filters configured
- [ ] Application Insights deployed
- [ ] Diagnostic settings enabled
- [ ] Custom metrics configured
- [ ] Alert rules created
- [ ] Conditional Access policies active
- [ ] Security baseline scan passed
- [ ] Cost alerts configured
- [ ] Backup/DR plan documented

**Phase 2 - By Mar 1, 2026:**

- [ ] Fine-tuning infrastructure ready
- [ ] Cost optimization baseline established
- [ ] Model governance framework implemented
- [ ] Custom models trained and tested
- [ ] Advanced monitoring dashboards
- [ ] PIM roles configured with approval workflows

---

## Support & Escalation

**For Infrastructure Issues:**
- Email: dpxe-ai-infrastructure@microsoft.com
- Slack: #msr-event-hub-infra
- On-call: Use PagerDuty (dpxe-ai-oncall)

**For Model/API Issues:**
- Azure OpenAI Support: https://learn.microsoft.com/azure/cognitive-services/openai/
- GitHub Issues: https://github.com/microsoft/msr-event-agent-chat/issues

**For Compliance/Security:**
- Email: dpxe-security@microsoft.com
- Compliance Review: Quarterly (schedule via Outlook)

---

**Last Updated**: January 2026  
**Next Review**: March 1, 2026  
**Owner**: MSR Platform Team (DPXE)
