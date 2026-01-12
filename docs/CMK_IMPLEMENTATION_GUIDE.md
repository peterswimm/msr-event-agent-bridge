# CMK Implementation Guide - Step by Step

**Date**: January 12, 2026  
**Status**: Implementation Started  
**Scope**: Both `msr-event-agent-bridge` (TypeScript) and `msr-event-agent-chat` (Python)

---

## ✅ What's Been Created

### **Files Created**

#### **1. Python Backend**
- ✅ [config/key_vault.py](../msr-event-agent-chat/config/key_vault.py)
  - `KeyVaultManager` class for retrieving secrets
  - `get_key_vault_manager()` function for caching
  - Full error handling and logging

- ✅ Updated [config/settings.py](../msr-event-agent-chat/config/settings.py)
  - Added `key_vault_url` and `azure_tenant_id` fields
  - Added secret properties: `azure_openai_key`, `database_connection_string`, `encryption_master_key`, `redis_password`
  - Lazy-loading via `@property` decorators
  - `clear_secret_cache()` method for rotation

- ✅ [example_startup.py](../msr-event-agent-chat/example_startup.py)
  - Shows FastAPI lifespan initialization
  - Key Vault connectivity test on startup
  - Example endpoints using secrets

- ✅ Updated [.env.example](../msr-event-agent-chat/.env.example)
  - Removed all secrets
  - Added Key Vault configuration
  - Comments showing what secrets to create

#### **2. TypeScript Bridge**
- ✅ [src/services/keyVaultClient.ts](../msr-event-agent-bridge/src/services/keyVaultClient.ts)
  - `KeyVaultClient` class with async `getSecret()` method
  - Optional caching (excludes sensitive keys)
  - Full error handling and logging

- ✅ [src/config/config.ts](../msr-event-agent-bridge/src/config/config.ts)
  - `loadConfig()` function retrieves all secrets on startup
  - `validateConfig()` function checks required values
  - `AppConfig` interface defines all settings

- ✅ [example_startup.ts](../msr-event-agent-bridge/example_startup.ts)
  - Shows Express initialization with Key Vault
  - Middleware setup example
  - Route examples using config

- ✅ Updated [.env.example](../msr-event-agent-bridge/.env.example)
  - Removed all secrets
  - Added Key Vault configuration
  - Comments showing what secrets to create

#### **3. Documentation**
- ✅ [CMK_ENV_CONFIGURATION.md](../msr-event-agent-bridge/docs/CMK_ENV_CONFIGURATION.md)
  - Complete implementation strategy
  - Code examples for both languages
  - Migration path with 4 phases

---

## 🔧 Integration Steps (For Your Repos)

### **Step 1: Install Azure SDK Packages**

#### **Python Backend**
```bash
cd d:\code\msr-event-agent-chat

# Install Key Vault SDK
pip install azure-keyvault-secrets azure-identity
```

#### **TypeScript Bridge**
```bash
cd d:\code\msr-event-agent-bridge

# Install Key Vault SDK
npm install @azure/keyvault-secrets @azure/identity @types/node
```

### **Step 2: Integrate Config/Key Vault Files**

**For Python**: The files are already in place:
- `config/key_vault.py` ✅ (new)
- `config/settings.py` ✅ (updated)

**For TypeScript**: The files are already in place:
- `src/services/keyVaultClient.ts` ✅ (new)
- `src/config/config.ts` ✅ (new)

### **Step 3: Update Your Main Entry Points**

#### **Python: Update `main.py`**

Replace your current startup with this pattern:
```python
from config.settings import get_settings
from config.key_vault import get_key_vault_manager
import logging

logger = logging.getLogger(__name__)

# On app startup:
async def startup_event():
    try:
        settings = get_settings()
        if settings.key_vault_url:
            logger.info(f"Initializing Key Vault: {settings.key_vault_url}")
            kv = get_key_vault_manager(settings.key_vault_url)
            # Test connectivity
            test_key = kv.get_secret("azure-openai-api-key")
            logger.info("✅ Key Vault initialized")
    except Exception as e:
        logger.error(f"❌ Key Vault init failed: {e}")
        raise

app.add_event_handler("startup", startup_event)
```

#### **TypeScript: Update `src/index.ts`**

Replace your current startup with this pattern:
```typescript
import { loadConfig, validateConfig } from "./config/config";
import { getLogger } from "./services/logger";

const logger = getLogger();

async function main() {
  try {
    logger.info("Loading configuration from Key Vault...");
    const config = await loadConfig(logger);
    validateConfig(config);
    
    const app = express();
    
    // Use config.jwtSigningKey, config.openaiApiKey, etc.
    app.use(middleware.authentication(config.jwtSigningKey));
    
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error({ error }, "❌ Startup failed");
    process.exit(1);
  }
}

main();
```

### **Step 4: Create Azure Key Vault Resource**

If you don't have a Key Vault yet:

```bash
# Create Key Vault (if not exists)
az keyvault create \
  --name kv-event-hub-prod \
  --resource-group your-rg \
  --location eastus

# Set Key Vault URL in .env
KEY_VAULT_URL=https://kv-event-hub-prod.vault.azure.net/
```

### **Step 5: Create Secrets in Key Vault**

**For Bridge Service:**
```bash
# Create all required secrets
az keyvault secret set --vault-name kv-event-hub-prod \
  --name jwt-signing-key \
  --value "your-jwt-secret-key-here"

az keyvault secret set --vault-name kv-event-hub-prod \
  --name openai-api-key \
  --value "your-azure-openai-api-key"

az keyvault secret set --vault-name kv-event-hub-prod \
  --name database-connection-string \
  --value "postgresql://user:password@host/db"

az keyvault secret set --vault-name kv-event-hub-prod \
  --name redis-password \
  --value "your-redis-password"
```

**For Backend Service:**
```bash
# Create all required secrets
az keyvault secret set --vault-name kv-event-hub-prod \
  --name azure-openai-api-key \
  --value "your-azure-openai-api-key"

az keyvault secret set --vault-name kv-event-hub-prod \
  --name database-connection-string \
  --value "postgresql://user:password@host/db"

az keyvault secret set --vault-name kv-event-hub-prod \
  --name encryption-master-key \
  --value "your-master-encryption-key"

az keyvault secret set --vault-name kv-event-hub-prod \
  --name redis-password \
  --value "your-redis-password"
```

### **Step 6: Configure Managed Identity (Production)**

```bash
# For Bridge service (if using App Service)
az webapp identity assign \
  --name event-hub-bridge \
  --resource-group your-rg

# For Backend service (if using App Service)
az webapp identity assign \
  --name event-hub-backend \
  --resource-group your-rg

# Grant access to Key Vault for each identity
az keyvault set-policy --name kv-event-hub-prod \
  --object-id <bridge-identity-object-id> \
  --secret-permissions get list

az keyvault set-policy --name kv-event-hub-prod \
  --object-id <backend-identity-object-id> \
  --secret-permissions get list
```

### **Step 7: Local Development Setup**

For local development without Managed Identity:

```bash
# Login to Azure with your account
az login

# Set in .env
KEY_VAULT_URL=https://kv-event-hub-prod.vault.azure.net/
AZURE_TENANT_ID=your-tenant-id

# DefaultAzureCredential will use:
# 1. Environment variables
# 2. Shared token cache (from 'az login')
# 3. Managed Identity (if running in Azure)
```

### **Step 8: Test Configuration**

#### **Python (unit tests)**

```bash
cd d:\code\msr-event-agent-chat

# Run the CMK-focused tests (mocked Azure SDK; no live calls)
python -m pytest tests/test_key_vault.py tests/test_settings_key_vault.py

# Or run the full suite
python -m pytest
```

#### **TypeScript (unit tests)**

```bash
cd d:\code\msr-event-agent-bridge

# Runs tsx-based tests; SecretClient is mocked, no Azure calls
npm test
```

#### **Optional end-to-end sanity**

```bash
# Python example startup
cd d:\code\msr-event-agent-chat
python example_startup.py

# TypeScript build/start
cd d:\code\msr-event-agent-bridge
npm run build
npm run start
```

---

## 🔄 Migration Checklist

### **Phase 1: Preparation** ✅

- [x] Created Key Vault client files
- [x] Updated settings/config files
- [x] Updated .env.example files
- [x] Created example startup files
- [ ] Install Azure SDK packages in both repos

### **Phase 2: Integration** (Next)

- [ ] Update main.py with Key Vault initialization
- [ ] Update src/index.ts with Key Vault initialization
- [ ] Create Key Vault resource in Azure
- [ ] Create secrets in Key Vault

### **Phase 3: Testing** (Week 2)

- [ ] Test locally with DefaultAzureCredential
- [ ] Test in staging with Managed Identity
- [ ] Verify audit logs in Key Vault
- [ ] Test secret rotation

### **Phase 4: Deployment** (Week 3)

- [ ] Deploy to production
- [ ] Monitor Key Vault metrics
- [ ] Verify all secrets retrieved correctly
- [ ] Remove any fallback logic

---

## 🐛 Troubleshooting

### **"Cannot find module '@azure/keyvault-secrets'"**

```bash
# Install missing packages
npm install @azure/keyvault-secrets @azure/identity
# or
pip install azure-keyvault-secrets azure-identity
```

### **"Secret not found in Key Vault"**

- Verify secret name matches exactly (kebab-case)
- Check spelling of secret name in code
- Verify you're using correct Key Vault URL

### **"AuthenticationError: Failed to authenticate"**

- For production: Verify Managed Identity is enabled
- For local: Run `az login` to authenticate
- Check AZURE_TENANT_ID is set correctly

### **"Connection timed out"**

- Verify Key Vault URL is accessible
- Check firewall rules if behind corporate proxy
- Verify network connectivity: `curl https://kv-xxx.vault.azure.net/`

---

## 📚 Additional Resources

- **CMK Architecture**: See [CMK_AUTH_EXPLAINER.md](CMK_AUTH_EXPLAINER.md)
- **Full Implementation Guide**: See [CMK_ENV_CONFIGURATION.md](CMK_ENV_CONFIGURATION.md)
- **Key Vault Docs**: [Azure Key Vault Documentation](https://docs.microsoft.com/azure/key-vault/)
- **Azure Identity SDK**: [Azure Identity SDK (Python)](https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/identity)

---

## ❓ Questions?

1. **How do I rotate secrets?**
   - Update the secret in Key Vault
   - Call `clear_secret_cache()` (Python) or `clearCache()` (TypeScript)
   - Secrets will be retrieved fresh on next access

2. **Can I use different Key Vaults for different environments?**
   - Yes! Use different `KEY_VAULT_URL` per environment
   - Set in `.env.production`, `.env.staging`, etc.

3. **What if I don't have Azure yet?**
   - Set `KEY_VAULT_URL=""` in `.env`
   - The code falls back gracefully
   - Secrets will need to be provided another way (for testing only)

4. **Is there a performance impact?**
   - First call per secret: ~50-100ms (Key Vault roundtrip)
   - Subsequent calls: <1ms (from cache)
   - Cache timeout: 1 hour (configurable)

---

**Ready to integrate? Start with Step 1 above!** 🚀
