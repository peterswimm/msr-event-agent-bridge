/**
 * Application configuration loader with Key Vault integration.
 *
 * Loads application settings from environment variables (.env) and
 * retrieves secrets from Azure Key Vault at startup.
 *
 * Configuration is split into two categories:
 * 1. Non-sensitive config (from .env) - ports, URLs, feature flags
 * 2. Secrets (from Key Vault) - API keys, passwords, encryption keys
 */

import { KeyVaultClient } from "../services/keyVaultClient";
import { Logger } from "pino";

/**
 * Application configuration with secrets from Key Vault.
 */
export interface AppConfig {
  // Server
  port: number;
  environment: "development" | "staging" | "production";
  nodeEnv: string;
  logLevel: string;

  // Backend Integration
  knowledgeApiUrl: string;
  knowledgeApiTimeout: number;

  // JWT Configuration (endpoints only, not secrets)
  jwtIssuer: string;
  jwtAudience: string;

  // CORS
  allowedOrigins: string[];

  // Azure Key Vault
  keyVaultUrl: string;
  azureTenantId: string;

  // ========================================
  // SECRETS (Retrieved from Key Vault)
  // ========================================
  jwtSigningKey: string;
  openaiApiKey: string;
  databaseConnectionString: string;
  redisPassword?: string;
}

/**
 * Load application configuration from environment and Key Vault.
 *
 * Environment variables (.env) provide non-sensitive configuration.
 * Key Vault provides all secrets securely.
 *
 * @param logger - Pino logger instance
 * @returns Complete application configuration
 * @throws Error if Key Vault connection fails or required secrets are missing
 *
 * @example
 * ```typescript
 * const config = await loadConfig(logger);
 * app.use(middleware.authentication(config.jwtSigningKey));
 * ```
 */
export async function loadConfig(logger: Logger): Promise<AppConfig> {
  const keyVaultUrl = process.env.KEY_VAULT_URL;
  const environment = (process.env.NODE_ENV || "development") as any;

  if (!keyVaultUrl) {
    throw new Error("KEY_VAULT_URL environment variable is required");
  }

  if (!process.env.AZURE_TENANT_ID) {
    throw new Error("AZURE_TENANT_ID environment variable is required");
  }

  logger.info({ keyVaultUrl }, "Initializing Key Vault client...");

  // Initialize Key Vault client
  const kvClient = new KeyVaultClient(
    {
      vaultUrl: keyVaultUrl,
      useManagedIdentity: environment === "production",
      cacheTTL: 3600, // 1 hour cache
    },
    logger
  );

  logger.info("Retrieving secrets from Key Vault...");

  try {
    // Retrieve secrets from Key Vault in parallel
    const [jwtSigningKey, openaiApiKey, dbConnectionString] = await Promise.all([
      kvClient.getSecret("jwt-signing-key", true),
      kvClient.getSecret("openai-api-key", true),
      kvClient.getSecret("database-connection-string", true),
    ]);

    // Optionally retrieve redis password if it exists
    let redisPassword: string | undefined;
    try {
      redisPassword = await kvClient.getSecret("redis-password", true);
    } catch (e) {
      logger.debug("redis-password not found in Key Vault (optional)");
    }

    const config: AppConfig = {
      port: parseInt(process.env.PORT || "3000"),
      environment,
      nodeEnv: process.env.NODE_ENV || "development",
      logLevel: process.env.LOG_LEVEL || "info",
      knowledgeApiUrl: process.env.KNOWLEDGE_API_URL || "http://localhost:8000",
      knowledgeApiTimeout: parseInt(process.env.KNOWLEDGE_API_TIMEOUT || "30000"),
      jwtIssuer: process.env.JWT_ISSUER || "https://eventhub.internal.microsoft.com",
      jwtAudience: process.env.JWT_AUDIENCE || "event-hub-apps",
      allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),
      keyVaultUrl,
      azureTenantId: process.env.AZURE_TENANT_ID!,
      jwtSigningKey,
      openaiApiKey,
      databaseConnectionString: dbConnectionString,
      redisPassword,
    };

    logger.info("✅ Configuration loaded successfully");
    return config;
  } catch (error) {
    logger.error({ error }, "❌ Failed to load configuration from Key Vault");
    throw error;
  }
}

/**
 * Validate configuration for required values.
 *
 * @param config - Application configuration
 * @throws Error if validation fails
 */
export function validateConfig(config: AppConfig): void {
  const errors: string[] = [];

  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push("Invalid PORT - must be between 1 and 65535");
  }

  if (!config.jwtSigningKey) {
    errors.push("jwtSigningKey from Key Vault is empty");
  }

  if (!config.openaiApiKey) {
    errors.push("openaiApiKey from Key Vault is empty");
  }

  if (!config.databaseConnectionString) {
    errors.push("databaseConnectionString from Key Vault is empty");
  }

  if (config.allowedOrigins.length === 0) {
    errors.push("ALLOWED_ORIGINS is empty");
  }

  if (errors.length > 0) {
    throw new Error("Configuration validation failed:\n" + errors.join("\n"));
  }
}
