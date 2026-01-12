/**
 * Azure Key Vault Service
 * Provides encryption and decryption operations using customer-managed keys (CMK)
 * stored in Azure Key Vault
 */

import { KeyClient, CryptographyClient } from '@azure/keyvault-keys';
import { DefaultAzureCredential } from '@azure/identity';
import pino from 'pino';

const logger = pino().child({ module: 'KeyVaultService' });

interface KeyVaultConfig {
  keyVaultUrl: string;
  keyName: string;
  keyVersion?: string;
}

class KeyVaultService {
  private keyClient: KeyClient | null = null;
  private cryptoClient: CryptographyClient | null = null;
  private config: KeyVaultConfig | null = null;
  private initialized = false;

  /**
   * Initialize Key Vault service with configuration
   * @param config Key Vault configuration
   */
  async initialize(config: KeyVaultConfig): Promise<void> {
    try {
      if (this.initialized) {
        logger.warn('KeyVaultService already initialized');
        return;
      }

      // Validate configuration
      if (!config.keyVaultUrl || !config.keyName) {
        throw new Error('keyVaultUrl and keyName are required');
      }

      this.config = config;

      // Initialize Key Client using default Azure credentials
      // This supports: environment variables, managed identity, CLI auth, etc.
      const credential = new DefaultAzureCredential();

      this.keyClient = new KeyClient(config.keyVaultUrl, credential);

      // Validate connectivity to Key Vault
      logger.info(`Validating Key Vault connectivity to ${config.keyVaultUrl}`);
      const key = await this.keyClient.getKey(config.keyName, config.keyVersion);

      if (!key) {
        throw new Error(`CMK key not found: ${config.keyName}`);
      }

      // Initialize crypto client for the specific key
      this.cryptoClient = new CryptographyClient(key, credential);

      this.initialized = true;
      logger.info(`Key Vault service initialized successfully with key: ${config.keyName}`);
    } catch (error) {
      logger.error('Failed to initialize Key Vault service', error);
      throw error;
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Encrypt data using the CMK key
   * @param plaintext Data to encrypt
   * @returns Encrypted data in base64 format
   */
  async encrypt(plaintext: string | Buffer): Promise<string> {
    try {
      if (!this.cryptoClient) {
        throw new Error('Key Vault service not initialized');
      }

      const plaintextBuffer = typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf-8') : plaintext;

      // Use RSA-OAEP algorithm (default for asymmetric encryption)
      const result = await this.cryptoClient.encrypt('RSA-OAEP', plaintextBuffer);

      // Return encrypted data as base64 string
      return Buffer.from(result.result).toString('base64');
    } catch (error) {
      logger.error('Encryption failed', error);
      throw new Error(`CMK encryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decrypt data using the CMK key
   * @param ciphertext Encrypted data in base64 format
   * @returns Decrypted plaintext
   */
  async decrypt(ciphertext: string): Promise<string> {
    try {
      if (!this.cryptoClient) {
        throw new Error('Key Vault service not initialized');
      }

      const ciphertextBuffer = Buffer.from(ciphertext, 'base64');

      // Use RSA-OAEP algorithm (must match encryption algorithm)
      const result = await this.cryptoClient.decrypt('RSA-OAEP', ciphertextBuffer);

      return Buffer.from(result.result).toString('utf-8');
    } catch (error) {
      logger.error('Decryption failed', error);
      throw new Error(`CMK decryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get key metadata (version, creation date, etc.)
   */
  async getKeyInfo() {
    try {
      if (!this.keyClient || !this.config) {
        throw new Error('Key Vault service not initialized');
      }

      const key = await this.keyClient.getKey(this.config.keyName, this.config.keyVersion);
      return {
        name: key.name,
        version: key.version,
        keyType: key.keyType,
        keyOps: key.keyOps,
        enabled: key.properties.enabled,
        createdOn: key.properties.createdOn,
        updatedOn: key.properties.updatedOn,
      };
    } catch (error) {
      logger.error('Failed to get key info', error);
      throw error;
    }
  }

  /**
   * Health check - verify Key Vault connectivity
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string; keyInfo?: object }> {
    try {
      if (!this.initialized) {
        return {
          healthy: false,
          message: 'Key Vault service not initialized',
        };
      }

      const keyInfo = await this.getKeyInfo();
      return {
        healthy: true,
        message: 'Key Vault service is operational',
        keyInfo,
      };
    } catch (error) {
      logger.error('Key Vault health check failed', error);
      return {
        healthy: false,
        message: `Key Vault health check failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// Export singleton instance
export const keyVaultService = new KeyVaultService();

export default KeyVaultService;
