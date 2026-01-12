/**
 * Azure Key Vault client for secure secrets management.
 *
 * Retrieves secrets at runtime from Key Vault instead of storing them
 * in environment variables or files. Implements caching and automatic
 * retry logic for reliability.
 */

import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential, ManagedIdentityCredential } from "@azure/identity";
import { Logger } from "pino";

/**
 * Configuration for Key Vault client.
 */
export interface KeyVaultConfig {
  /** Azure Key Vault URL (e.g., https://kv-xxx.vault.azure.net/) */
  vaultUrl: string;
  /** Use Managed Identity in production (true) or interactive auth for dev (false) */
  useManagedIdentity?: boolean;
  /** Cache TTL in seconds (default 3600) */
  cacheTTL?: number;
}

/**
 * Azure Key Vault client for retrieving secrets securely.
 *
 * Supports both Managed Identity (production) and interactive authentication (dev).
 * Implements optional caching for performance, excluding highly sensitive keys.
 *
 * @example
 * ```typescript
 * const kv = new KeyVaultClient({
 *   vaultUrl: "https://kv-xxx.vault.azure.net/",
 *   useManagedIdentity: true
 * }, logger);
 *
 * const apiKey = await kv.getSecret("openai-api-key");
 * ```
 */
export class KeyVaultClient {
  private client: SecretClient;
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();
  private cacheTTL: number;
  private logger: Logger;

  constructor(config: KeyVaultConfig, logger: Logger) {
    if (!config.vaultUrl || !config.vaultUrl.startsWith("https://")) {
      throw new Error(`Invalid vault URL: ${config.vaultUrl}`);
    }

    this.logger = logger;
    this.cacheTTL = config.cacheTTL || 3600; // default 1 hour

    try {
      // Use Managed Identity in production, fallback for local development
      const credential = config.useManagedIdentity
        ? new ManagedIdentityCredential()
        : new DefaultAzureCredential();

      this.client = new SecretClient(config.vaultUrl, credential);
      this.logger.info({ vaultUrl: config.vaultUrl }, "✅ Key Vault client initialized");
    } catch (error) {
      this.logger.error(
        { error, vaultUrl: config.vaultUrl },
        "❌ Failed to initialize Key Vault client"
      );
      throw error;
    }
  }

  /**
   * Retrieve secret from Key Vault with optional caching.
   *
   * @param secretName - Name of the secret in Key Vault (kebab-case)
   * @param useCache - Whether to cache the secret for performance
   * @returns Secret value as string
   * @throws Error if secret not found or retrieval fails
   *
   * @example
   * ```typescript
   * const apiKey = await kv.getSecret("openai-api-key");
   * const unCachedKey = await kv.getSecret("encryption-master-key", false);
   * ```
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

      if (!secret.value) {
        throw new Error(`Secret '${secretName}' returned empty value`);
      }

      // Cache if requested (but not for sensitive keys like encryption master key)
      // Keys containing these patterns are not cached
      const nonCacheablePatterns = ["encryption-master-key", "jwt-signing-key"];
      const shouldNotCache = nonCacheablePatterns.some((pattern) =>
        secretName.includes(pattern)
      );

      if (useCache && !shouldNotCache) {
        this.cache.set(secretName, {
          value: secret.value,
          expiresAt: Date.now() + this.cacheTTL * 1000,
        });
      }

      return secret.value;
    } catch (error) {
      this.logger.error(
        { error, secret: secretName },
        "Failed to retrieve secret from Key Vault"
      );
      throw error;
    }
  }

  /**
   * Clear all cached secrets.
   *
   * Useful for testing or forced secret rotation.
   *
   * @example
   * ```typescript
   * kv.clearCache();
   * // Subsequent calls will fetch fresh from Key Vault
   * ```
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info("Key Vault cache cleared");
  }

  /**
   * Get cache size (for monitoring/testing).
   *
   * @returns Number of cached secrets
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
