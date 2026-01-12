# Customer-Managed Keys (CMK) Implementation Guide

## Overview

This directory contains the infrastructure-as-code (Bicep) templates and deployment scripts for implementing Customer-Managed Keys (CMK) encryption in Azure Key Vault for the MSR Event Hub Bridge.

## What's Included

### Infrastructure Templates

- **`main.bicep`** - Complete infrastructure definition including:
  - Azure Key Vault with soft-delete and purge protection
  - RSA customer-managed encryption key (CMK)
  - User-assigned managed identity for the application
  - RBAC role assignments (Key Vault Crypto User)
  
- **`main.bicepparam`** - Parameter file with sensible defaults for development/testing

### Deployment Scripts

- **`deploy-cmk.ps1`** - Main deployment orchestrator:
  - Validates prerequisites (Azure CLI, authentication)
  - Validates Bicep template syntax
  - Deploys infrastructure to Azure
  - Outputs configuration values for application setup
  - Saves outputs to file for reference

- **`verify-cmk-setup.ps1`** - Verification and troubleshooting:
  - Checks Key Vault accessibility
  - Validates CMK key exists and is enabled
  - Confirms managed identity configuration
  - Verifies RBAC role assignments
  - Reports any issues or misconfigurations

- **`enable-keyvault-diagnostics.ps1`** - Monitoring setup:
  - Creates/uses existing Log Analytics workspace
  - Enables Key Vault audit logging
  - Sets up diagnostic settings for Azure Monitor
  - Enables investigation of key access patterns

## Quick Start (Day-1 Deployment)

### Prerequisites

```powershell
# Ensure you have:
# - Azure CLI installed (https://aka.ms/azure-cli)
# - PowerShell 7+ (https://github.com/PowerShell/PowerShell)
# - Azure subscription with appropriate permissions
# - Resource group created

# Login to Azure
az login
```

### Step 1: Deploy Infrastructure

```powershell
cd scripts

$ResourceGroupName = "event-hub-rg"
$Environment = "dev"
$Location = "eastus"

.\deploy-cmk.ps1 `
  -ResourceGroupName $ResourceGroupName `
  -Environment $Environment `
  -Location $Location
```

**Output:** Script displays Key Vault URI and other values to configure in your application.

### Step 2: Configure Application

```powershell
# Save these values from deployment output in your .env file:
CMK_ENABLED=true
KEY_VAULT_URL=https://kv-event-hub-bridge-dev-xxx.vault.azure.net/
ENCRYPTION_KEY_NAME=event-hub-cmk
AZURE_CLIENT_ID=<managed-identity-client-id>
```

### Step 3: Verify Setup

```powershell
.\verify-cmk-setup.ps1 -ResourceGroupName $ResourceGroupName

# Expected output: All tests should pass (✅)
```

### Step 4: Enable Monitoring (Optional but Recommended)

```powershell
.\enable-keyvault-diagnostics.ps1 `
  -KeyVaultName "kv-event-hub-bridge-dev-xxx" `
  -ResourceGroupName $ResourceGroupName
```

## Architecture

### Data Flow

```text
┌─────────────────┐
│  Application    │
│  (Managed ID)   │
└────────┬────────┘
         │ (RBAC: Key Vault Crypto User)
         │
    ┌────▼─────┐
    │   Azure   │
    │ Key Vault │
    ├───────────┤
    │   CMK     │
    │   (RSA    │
    │   2048)   │
    └───────────┘
```

### Security Features

- ✅ **Soft Delete**: 90-day recovery window for accidental key deletion
- ✅ **Purge Protection**: Prevents permanent deletion during soft-delete period
- ✅ **RBAC**: Least-privilege access via managed identity
- ✅ **Audit Logging**: Full key access tracking via diagnostic settings
- ✅ **Encryption**: RSA-OAEP for asymmetric encryption/decryption

## Application Integration

### Initialize Key Vault in Express App

```typescript
import { keyVaultService } from './services/keyVaultService.js';
import { initializeKeyVault } from './middleware/keyVaultInit.js';

// On app startup
await initializeKeyVault();

// Check if service is ready
if (keyVaultService.isInitialized()) {
  // Use encryption
  const encrypted = await keyVaultService.encrypt(sensitiveData);
  const decrypted = await keyVaultService.decrypt(encrypted);
}
```

### Health Check Endpoint

```typescript
// GET /health/keyvault
const health = await keyVaultService.healthCheck();
// Returns: { healthy: boolean, message: string, keyInfo?: object }
```

## Testing

### Run Integration Tests

```bash
npm test

# Tests automatically skip if CMK not configured (CMK_ENABLED=false)
# Tests verify:
# - Key Vault connectivity
# - Encryption/decryption functionality
# - Key metadata retrieval
# - Error handling
```

### Manual Testing (Local Development)

```powershell
# Set environment variables
$env:CMK_ENABLED = "true"
$env:KEY_VAULT_URL = "https://kv-xxx.vault.azure.net/"
$env:ENCRYPTION_KEY_NAME = "event-hub-cmk"

# Authenticate with Azure
az login

# Start dev server
npm run dev

# Test encryption endpoint (if implemented)
curl http://localhost:3000/health/keyvault
```

## Troubleshooting

### Key Vault Not Accessible

```powershell
# Check authentication
az account show

# Verify Key Vault exists
az keyvault show --name kv-xxx --resource-group event-hub-rg

# Test managed identity permissions
az keyvault key list --vault-name kv-xxx --resource-group event-hub-rg
```

### Encryption/Decryption Fails

```powershell
# Verify CMK key exists and is enabled
./verify-cmk-setup.ps1 -ResourceGroupName event-hub-rg

# Check Key Vault diagnostic logs
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "AuditLogs | where OperationName contains 'Decrypt'"
```

### Managed Identity Not Found

```powershell
# List all managed identities
az identity list --resource-group event-hub-rg

# Ensure App Service has identity assigned
az webapp identity show --name event-bridge-api --resource-group event-hub-rg
```

## Cost Considerations

- **Key Vault**: $0.6/month (standard tier)
- **CMK Operations**: $0.03 per 10K encrypt/decrypt operations
- **Diagnostics**: Log Analytics charges per GB ingested (~$0.50-2.50 depending on retention)

For dev/test environments, costs are typically < $5-10/month.

## Security Best Practices

1. **Enable Purge Protection** - Prevents accidental key deletion (configured by default)
2. **Enable Soft Delete** - 90-day recovery window (configured by default)
3. **Use Managed Identity** - Don't store credentials in environment variables
4. **Rotate Keys Regularly** - Create new key versions periodically
5. **Monitor Access** - Review Key Vault audit logs regularly
6. **Limit Permissions** - Use RBAC instead of Vault Access Policies

## Next Steps

- [ ] Deploy CMK infrastructure using `deploy-cmk.ps1`
- [ ] Configure application environment variables
- [ ] Implement encryption/decryption in your agents
- [ ] Enable diagnostics for audit logging
- [ ] Test encryption functionality
- [ ] Set up key rotation policy (optional)
- [ ] Monitor Key Vault metrics in Azure Portal

## References

- [Azure Key Vault Documentation](https://learn.microsoft.com/azure/key-vault/)
- [CMK with Managed Identities](https://learn.microsoft.com/azure/ai-foundry/concepts/encryption-keys-portal?view=foundry)
- [Azure RBAC Best Practices](https://learn.microsoft.com/azure/role-based-access-control/)
- [Key Vault Diagnostic Logging](https://learn.microsoft.com/azure/key-vault/general/logging)

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review Azure Key Vault diagnostic logs
3. Run `verify-cmk-setup.ps1` for automated checks
4. Check app logs for specific error messages
