# CMK Implementation - Quick Reference

## Files Created/Modified

### Infrastructure (Phase 1 - Complete ✅)

| File | Purpose |
|------|---------|
| `infra/main.bicep` | Bicep template defining all CMK infrastructure (Key Vault, CMK key, managed identity, RBAC) |
| `infra/main.bicepparam` | Parameter file with dev/test defaults |
| `infra/README.md` | Comprehensive CMK setup and troubleshooting guide |
| `scripts/deploy-cmk.ps1` | Main deployment script with validation & output capture |
| `scripts/verify-cmk-setup.ps1` | Automated verification and troubleshooting script |
| `scripts/enable-keyvault-diagnostics.ps1` | Monitoring setup for audit logging |

### Application Integration (Phase 2 - Complete ✅)

| File | Purpose |
|------|---------|
| `package.json` | Added `@azure/keyvault-keys` & `@azure/identity` dependencies |
| `src/services/keyVaultService.ts` | Key Vault client service (encrypt/decrypt operations) |
| `src/middleware/keyVaultInit.ts` | Initialization & health check middleware |
| `src/tests/keyVaultService.test.ts` | Integration tests for Key Vault operations |
| `.env.example` | Added CMK configuration variables with documentation |

### Documentation (Phase 3 - Complete ✅)

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Day-1 CMK setup section with step-by-step instructions |

## Day-1 Deployment Checklist

- [ ] **Install packages**: `npm install` (installs Azure SDK dependencies)
- [ ] **Run deployment script**: `scripts/deploy-cmk.ps1 -ResourceGroupName "event-hub-rg"`
- [ ] **Save outputs**: Copy Key Vault URI, key name, managed identity ID
- [ ] **Update .env**: Set `CMK_ENABLED=true`, `KEY_VAULT_URL=<from-output>`, etc.
- [ ] **Verify setup**: `scripts/verify-cmk-setup.ps1 -ResourceGroupName "event-hub-rg"`
- [ ] **Enable monitoring**: `scripts/enable-keyvault-diagnostics.ps1 (optional)`
- [ ] **Test integration**: `npm run dev` + health check endpoint
- [ ] **Run tests**: `npm test` (tests automatically skip if CMK disabled)

## Key Design Decisions

### 1. Optional at Startup

CMK is disabled by default (`CMK_ENABLED=false`). Apps can start without it and check `keyVaultService.isInitialized()` before using encryption.

### 2. Managed Identity First

Uses `DefaultAzureCredential` which supports:

- Managed identity (App Service, Container Apps) - **recommended**
- Environment variables (service principal) - dev/testing
- Azure CLI authentication - local development
- Visual Studio sign-in - developer machines

### 3. RBAC-Based (Not Vault Access Policies)

Uses Azure RBAC `Key Vault Crypto User` role for modern, centralized permission management.

### 4. RSA-OAEP Encryption

Uses industry-standard RSA-OAEP with 2048-bit keys for asymmetric encryption suitable for sensitive data.

### 5. Graceful Degradation

If Key Vault is unavailable or misconfigured:

- Encryption operations fail with clear error messages
- Health check endpoint reports status
- App continues to function (agents check `isInitialized()` before using encryption)

## Environment Variables

```env
# Required to enable CMK
CMK_ENABLED=true

# From deployment outputs
KEY_VAULT_URL=https://kv-event-hub-bridge-dev-xxx.vault.azure.net/
ENCRYPTION_KEY_NAME=event-hub-cmk

# Optional: specific key version (defaults to latest)
ENCRYPTION_KEY_VERSION=

# For non-managed-identity auth (optional)
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
```

## Testing

```bash
# Automatically respects CMK_ENABLED environment variable
npm test

# Manual integration test with CMK enabled
CMK_ENABLED=true npm test
```

## Costs

| Component | Estimated Cost |
| --------- | -------------- |
| Key Vault | $0.60/month |
| CMK Operations | $0.03 per 10K ops (~$1-5/month typical usage) |
| Diagnostics | $0.50-2.50/month (Log Analytics) |
| **Total** | **~$3-10/month** |

## Common Issues & Solutions

| Issue | Solution |
| ----- | -------- |
| "Module not found" errors | Run `npm install` to install Azure SDK |
| "Key Vault not found" | Verify `KEY_VAULT_URL` matches deployed Key Vault name |
| "Permission denied" | Run `scripts/verify-cmk-setup.ps1` - may need to assign identity to App Service |
| "CMK operations failing" | Check Key Vault diagnostics: `Enable-KeyVaultDiagnostics.ps1` |
| Tests being skipped | Set `CMK_ENABLED=true` to enable Key Vault tests |

## Architecture Summary

```text
Application
    ↓
KeyVaultService (singleton)
    ├→ DefaultAzureCredential (auth)
    ├→ KeyClient (metadata)
    └→ CryptographyClient (encrypt/decrypt)
        ↓
    Azure Key Vault
        ├→ CMK (RSA-2048)
        └→ Diagnostics → Log Analytics
```

## Next Phase Recommendations

1. **Implement encryption in agents** - Use `keyVaultService.encrypt()` for sensitive fields
2. **Set up key rotation policy** - Annual or bi-annual key version rotation
3. **Monitor key usage** - Dashboard in Azure Portal for audit logs
4. **Document encryption patterns** - Which agent fields should be encrypted
5. **Add encryption/decryption routes** - Optional API endpoints for external systems

## Rollback Plan

If CMK needs to be disabled:

1. Set `CMK_ENABLED=false` in `.env` (app continues without encryption)
2. Keep Key Vault for future use (no resources to delete immediately)
3. To delete Key Vault: Delete resource group or use `az keyvault delete --name <name>`

---

**Status**: Phase 1 & 2 Complete ✅ | Ready for Day-1 Deployment | Tests Pending npm install
