# CMK-Based Environment Configuration Strategy

**Date**: January 12, 2026  
**Applies To**: Both `msr-event-agent-bridge` (TypeScript/Express) and `msr-event-agent-chat` (Python/FastAPI)

---

## 🔑 Current State vs. CMK State

### **Current Approach** ❌ (Security Risk)

```
.env file (committed? 🚨)
├── JWT_SECRET=xxxxx              ← Hardcoded secrets
├── AZURE_OPENAI_KEY=xxxxx         ← API keys in plain text
├── DATABASE_PASSWORD=xxxxx        ← Database credentials
└── ENCRYPTION_KEY_VERSION=xxxxx   ← Key metadata exposed
```

**Problems**:
- Secrets in environment variables (visible to any process)
- `.env.example` tempts developers to commit `.env`
- Secrets logged in error messages
- Rotation requires redeployment
- No audit trail for secret access
- Risk of exposure in CI/CD logs

### **CMK-Based Approach** ✅ (Secure)

```
.env file (minimal, no secrets)
├── ENVIRONMENT=production
├── KEY_VAULT_URL=https://kv-xxx.vault.azure.net/
└── AZURE_TENANT_ID=xxxx

Azure Key Vault (encrypted, audited)
├── jwt-signing-key               ← Retrieved on startup
├── openai-api-key                ← Retrieved on demand
├── database-connection-string     ← Retrieved on startup
└── encryption-key-for-data       ← Retrieved for each encryption operation
```

**Benefits**:
- No secrets in files or environment
- Keys stored in encrypted vault
- Automatic key rotation
- Complete audit logs
- Managed Identity (zero credential management)
- Role-based access control

---

## 📋 Step 1: Define Your Secrets Inventory

### **Bridge (TypeScript/Express)**

**What goes in Key Vault:**
- `jwt-signing-key` (JWT secret)
- `openai-api-key` (Azure OpenAI key)
- `database-connection-string` (PostgreSQL password)
- `redis-password` (Redis auth)
- `session-encryption-key` (session token encryption)
- `api-gateway-client-secret` (if using service-to-service auth)

**What stays in .env (non-sensitive):**
- `PORT`
- `NODE_ENV`
- `LOG_LEVEL`
- `KNOWLEDGE_API_URL` (backend URL, not a secret)
- `KEY_VAULT_URL` (public endpoint)
- `AZURE_TENANT_ID` (public tenant ID)

### **Backend (Python/FastAPI)**

**What goes in Key Vault:**
- `azure-openai-api-key` (OpenAI key)
- `foundry-api-key` (if needed for Foundry)
- `database-connection-string` (PostgreSQL)
- `redis-password` (Redis auth)
- `encryption-master-key` (data encryption)

**What stays in .env:**
- `LLM_PROVIDER`
- `AZURE_OPENAI_ENDPOINT` (public endpoint)
- `FOUNDRY_PROJECT_ENDPOINT` (public endpoint)
- `ENVIRONMENT`
- `LOG_LEVEL`
- `KEY_VAULT_URL`
- `AZURE_TENANT_ID`

---

## 🔨 Step 2: Implement Key Vault Client

### **Python Backend (Recommended)**

```python
# config/key_vault.py
"""
Azure Key Vault integration for secrets management.
Retrieves secrets at runtime, never stores them in environment.
"""

import logging
from typing import Optional, Dict, Any
from functools import lru_cache
from azure.identity import DefaultAzureCredential, ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from azure.core.exceptions import ResourceNotFoundError

logger = logging.getLogger(__name__)


class KeyVaultManager:
    """Manages secret retrieval from Azure Key Vault."""
    
    def __init__(self, vault_url: str, use_managed_identity: bool = True):
        """
        Initialize Key Vault client.
        
        Args:
            vault_url: Azure Key Vault URL (e.g., https://kv-xxx.vault.azure.net/)
            use_managed_identity: Use Managed Identity (production) vs. interactive auth (dev)
        """
        self.vault_url = vault_url
        
        # Use Managed Identity in Azure, fall back to DefaultAzureCredential for local dev
        if use_managed_identity:
            try:
                credential = ManagedIdentityCredential()
                logger.info("Using Managed Identity for Key Vault authentication")
            except Exception as e:
                logger.warning(f"Managed Identity unavailable, falling back to DefaultAzureCredential: {e}")
                credential = DefaultAzureCredential()
        else:
            credential = DefaultAzureCredential()
        
        self.client = SecretClient(vault_url=vault_url, credential=credential)
        self._cache: Dict[str, Any] = {}
        self._cache_ttl = 3600  # 1 hour cache (optional)
    
    def get_secret(self, secret_name: str, use_cache: bool = True) -> str:
        """
        Retrieve secret from Key Vault.
        
        Args:
            secret_name: Name of the secret in Key Vault
            use_cache: Cache the secret for performance (optional)
        
        Returns:
            Secret value
        
        Raises:
            ResourceNotFoundError: If secret doesn't exist
        """
        # Check cache first (optional optimization)
        if use_cache and secret_name in self._cache:
            logger.debug(f"Using cached secret: {secret_name}")
            return self._cache[secret_name]
        
        try:
            logger.debug(f"Retrieving secret from Key Vault: {secret_name}")
            secret = self.client.get_secret(secret_name)
            
            # Cache if requested (but not for highly sensitive keys)
            if use_cache and secret_name not in ["encryption-master-key"]:
                self._cache[secret_name] = secret.value
            
            return secret.value
        
        except ResourceNotFoundError:
            logger.error(f"Secret not found in Key Vault: {secret_name}")
            raise ValueError(f"Secret '{secret_name}' not found in Key Vault")
        except Exception as e:
            logger.error(f"Error retrieving secret: {e}")
            raise


@lru_cache(maxsize=1)
def get_key_vault_manager(vault_url: str) -> KeyVaultManager:
    """Get cached Key Vault manager instance."""
    return KeyVaultManager(vault_url)
```

### **TypeScript/Express Backend (Recommended)**

```typescript
// src/services/keyVaultClient.ts
/**
 * Azure Key Vault client for secure secret management.
 * Retrieves secrets at runtime, never stores in environment.
 */

import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential, ManagedIdentityCredential } from "@azure/identity";
import { Logger } from "pino";

interface KeyVaultConfig {
  vaultUrl: string;
  useManagedIdentity?: boolean;
  cacheTTL?: number; // seconds
}

export class KeyVaultClient {
  private client: SecretClient;
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();
  private cacheTTL: number;
  private logger: Logger;

  constructor(config: KeyVaultConfig, logger: Logger) {
    this.logger = logger;
    this.cacheTTL = config.cacheTTL || 3600; // default 1 hour

    try {
      // Use Managed Identity in production, fallback for local development
      const credential = config.useManagedIdentity
        ? new ManagedIdentityCredential()
        : new DefaultAzureCredential();

      this.client = new SecretClient(config.vaultUrl, credential);
      this.logger.info("Key Vault client initialized");
    } catch (error) {
      this.logger.error({ error }, "Failed to initialize Key Vault client");
      throw error;
    }
  }

  /**
   * Retrieve secret from Key Vault with optional caching.
   */
  async getSecret(secretName: string, useCache: boolean = true): Promise<string> {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(secretName);
      if (cached && cached.expiresAt > Date.now()) {
        this.logger.debug({ secret: secretName }, "Using cached secret");
        return cached.value;
      }
      // Remove expired cache entry
      this.cache.delete(secretName);
    }

    try {
      this.logger.debug({ secret: secretName }, "Retrieving secret from Key Vault");
      const secret = await this.client.getSecret(secretName);

      // Cache if requested (but not for sensitive keys like encryption master key)
      if (useCache && !secretName.includes("encryption-master-key")) {
        this.cache.set(secretName, {
          value: secret.value!,
          expiresAt: Date.now() + this.cacheTTL * 1000,
        });
      }

      return secret.value!;
    } catch (error) {
      this.logger.error({ error, secret: secretName }, "Failed to retrieve secret");
      throw error;
    }
  }

  /**
   * Clear cache (useful for testing or secret rotation).
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info("Key Vault cache cleared");
  }
}
```

---

## 🎛️ Step 3: Update Settings/Config

### **Python: Enhanced settings.py**

```python
# config/settings.py
from functools import lru_cache
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from .key_vault import get_key_vault_manager

class Settings(BaseSettings):
    """Application settings with Key Vault integration."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    # Environment (from .env)
    environment: str = "development"
    key_vault_url: Optional[str] = Field(default=None, description="Key Vault URL")
    azure_tenant_id: Optional[str] = None
    
    # Azure OpenAI endpoint (from .env - not a secret)
    azure_openai_endpoint: Optional[str] = None
    azure_openai_deployment: str = "gpt-4o"
    
    # Secrets from Key Vault (retrieved at runtime)
    _azure_openai_key: Optional[str] = None
    _database_connection_string: Optional[str] = None
    _encryption_master_key: Optional[str] = None
    
    @property
    def azure_openai_key(self) -> str:
        """Get OpenAI key from Key Vault."""
        if not self._azure_openai_key and self.key_vault_url:
            kv = get_key_vault_manager(self.key_vault_url)
            self._azure_openai_key = kv.get_secret("azure-openai-api-key")
        return self._azure_openai_key or ""
    
    @property
    def database_connection_string(self) -> str:
        """Get database connection from Key Vault."""
        if not self._database_connection_string and self.key_vault_url:
            kv = get_key_vault_manager(self.key_vault_url)
            self._database_connection_string = kv.get_secret("database-connection-string")
        return self._database_connection_string or ""
    
    @property
    def encryption_master_key(self) -> str:
        """Get encryption key from Key Vault (not cached)."""
        if self.key_vault_url:
            kv = get_key_vault_manager(self.key_vault_url)
            # Don't use cache for encryption key
            return kv.get_secret("encryption-master-key", use_cache=False)
        return ""


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
```

### **TypeScript: Enhanced configuration**

```typescript
// src/config/config.ts
import { KeyVaultClient } from "../services/keyVaultClient";
import { Logger } from "pino";

export interface AppConfig {
  port: number;
  environment: "development" | "staging" | "production";
  knowledgeApiUrl: string;
  keyVaultUrl: string;
  azureTenantId: string;
  jwtIssuer: string;
  jwtAudience: string;
  allowedOrigins: string[];
  
  // Secrets (retrieved from Key Vault)
  jwtSigningKey: string;
  openaiApiKey: string;
  databaseConnectionString: string;
}

export async function loadConfig(logger: Logger): Promise<AppConfig> {
  const keyVaultUrl = process.env.KEY_VAULT_URL;
  const environment = (process.env.NODE_ENV || "development") as any;
  
  // Initialize Key Vault client
  const kvClient = new KeyVaultClient(
    {
      vaultUrl: keyVaultUrl!,
      useManagedIdentity: environment === "production",
      cacheTTL: 3600, // 1 hour
    },
    logger
  );
  
  // Retrieve secrets from Key Vault
  const [jwtSigningKey, openaiApiKey, dbConnectionString] = await Promise.all([
    kvClient.getSecret("jwt-signing-key", true),
    kvClient.getSecret("openai-api-key", true),
    kvClient.getSecret("database-connection-string", true),
  ]);
  
  return {
    port: parseInt(process.env.PORT || "3000"),
    environment,
    knowledgeApiUrl: process.env.KNOWLEDGE_API_URL || "http://localhost:8000",
    keyVaultUrl: keyVaultUrl!,
    azureTenantId: process.env.AZURE_TENANT_ID!,
    jwtIssuer: process.env.JWT_ISSUER || "https://eventhub.internal.microsoft.com",
    jwtAudience: process.env.JWT_AUDIENCE || "event-hub-apps",
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(","),
    jwtSigningKey,
    openaiApiKey,
    databaseConnectionString: dbConnectionString,
  };
}
```

---

## 📝 Step 4: Updated .env Files

### **.env.example (Bridge)**

```dotenv
# ========================================
# NON-SENSITIVE CONFIGURATION (OK in .env)
# ========================================
PORT=3000
NODE_ENV=production
KNOWLEDGE_API_URL=https://backend.eventhub.internal/api
LOG_LEVEL=info

# CORS - Allowed Origins
ALLOWED_ORIGINS=https://eventhub.internal.microsoft.com,https://teams.microsoft.com

# JWT Configuration (endpoints, not secrets)
JWT_ISSUER=https://eventhub.internal.microsoft.com
JWT_AUDIENCE=event-hub-apps

# ========================================
# AZURE KEY VAULT CONFIGURATION
# ========================================
KEY_VAULT_URL=https://kv-event-hub-bridge-prod.vault.azure.net/
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ========================================
# SECRETS ARE NOW RETRIEVED FROM KEY VAULT
# DO NOT ADD THEM HERE!
# ========================================
# The following secrets must exist in Key Vault:
# - jwt-signing-key
# - openai-api-key
# - database-connection-string
```

### **.env.example (Backend)**

```dotenv
# ========================================
# NON-SENSITIVE CONFIGURATION (OK in .env)
# ========================================
ENVIRONMENT=production
LOG_LEVEL=info

# LLM Configuration (endpoints, not secrets)
LLM_PROVIDER=foundry
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Foundry Configuration
FOUNDRY_PROJECT_ENDPOINT=https://your-project.api.azureml.ms/

# ========================================
# AZURE KEY VAULT CONFIGURATION
# ========================================
KEY_VAULT_URL=https://kv-event-hub-backend-prod.vault.azure.net/
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ========================================
# SECRETS ARE NOW RETRIEVED FROM KEY VAULT
# DO NOT ADD THEM HERE!
# ========================================
# The following secrets must exist in Key Vault:
# - azure-openai-api-key
# - database-connection-string
# - encryption-master-key
# - redis-password (if needed)
```

---

## 🚀 Step 5: Startup Flow

### **Python: Startup Sequence**

```python
# main.py
import logging
from fastapi import FastAPI
from config.settings import get_settings
from config.key_vault import get_key_vault_manager

logger = logging.getLogger(__name__)

async def startup_event():
    """Initialize application with secrets from Key Vault."""
    try:
        settings = get_settings()
        
        if settings.key_vault_url:
            logger.info(f"Initializing Key Vault client: {settings.key_vault_url}")
            kv = get_key_vault_manager(settings.key_vault_url)
            
            # Test connectivity (secrets are retrieved on-demand)
            test_secret = kv.get_secret("azure-openai-api-key")
            logger.info("✅ Key Vault initialized successfully")
        else:
            logger.warning("KEY_VAULT_URL not configured, running in legacy mode")
    
    except Exception as e:
        logger.error(f"❌ Failed to initialize Key Vault: {e}")
        raise

app = FastAPI()
app.add_event_handler("startup", startup_event)
```

### **TypeScript: Startup Sequence**

```typescript
// src/index.ts
import express from "express";
import { loadConfig } from "./config/config";
import { logger } from "./services/logger";

async function main() {
  try {
    logger.info("Loading configuration from Key Vault...");
    const config = await loadConfig(logger);
    logger.info("✅ Configuration loaded successfully");
    
    const app = express();
    
    // Use config with secrets already loaded
    app.use(middleware.authentication(config.jwtSigningKey));
    
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error({ error }, "❌ Failed to start server");
    process.exit(1);
  }
}

main();
```

---

## 🔐 Step 6: Key Vault Secret Names (Standardized)

Create all these secrets in Azure Key Vault:

### **Bridge Service Secrets**
```
jwt-signing-key                    (High rotation: 30 days)
openai-api-key                     (As needed)
database-connection-string         (Medium: 90 days)
redis-password                     (As needed)
```

### **Backend Service Secrets**
```
azure-openai-api-key              (As needed)
database-connection-string        (Medium: 90 days)
encryption-master-key             (Rarely changed)
redis-password                    (As needed)
foundry-api-key                   (Optional, if not Managed Identity)
```

---

## ✅ Benefits of This Approach

| Aspect | Current | CMK-Based |
|--------|---------|-----------|
| **Secret Storage** | .env files | Azure Key Vault |
| **Visibility** | Plain text in memory | Encrypted at rest, in transit |
| **Rotation** | Manual redeploy | Automatic, zero downtime |
| **Audit Trail** | None | Complete (who, when, what) |
| **Access Control** | File permissions | Azure RBAC + Managed Identity |
| **Caching** | Everything | Selective (performance vs. security) |
| **Credential Mgmt** | API keys in code | Managed Identity (zero keys) |
| **Risk if Breached** | Game over | Limited to that one secret |

---

## 🚢 Migration Path

### **Phase 1: Preparation** (Week 1)
- [ ] Create Key Vault resource
- [ ] Add current secrets to Key Vault
- [ ] Implement Key Vault clients (Python + TypeScript)
- [ ] Test locally with DefaultAzureCredential

### **Phase 2: Implementation** (Week 2)
- [ ] Update settings/config classes
- [ ] Update startup/initialization logic
- [ ] Update .env.example files
- [ ] Remove secrets from git history (if committed)

### **Phase 3: Testing** (Week 3)
- [ ] Test in staging with Managed Identity
- [ ] Verify audit logs in Key Vault
- [ ] Test secret rotation
- [ ] Verify error handling

### **Phase 4: Rollout** (Week 4)
- [ ] Deploy to production
- [ ] Monitor Key Vault metrics
- [ ] Remove any fallback logic after 1 week

---

## 🎓 Summary

**CMK-Based Environment Configuration**:
1. **Minimal .env** (non-sensitive config only)
2. **Key Vault client** retrieves secrets at runtime
3. **Startup validation** confirms connectivity
4. **Automatic rotation** with zero downtime
5. **Complete audit trail** of all secret access
6. **Managed Identity** eliminates credential management

**Result**: Secrets are never stored in files, environment variables, or code. They're retrieved on-demand from an encrypted, audited vault. 🔐

---

**Questions?** See [CMK_AUTH_EXPLAINER.md](CMK_AUTH_EXPLAINER.md) for security deep-dive or [ARCHITECTURE.md](ARCHITECTURE.md) for system overview.
