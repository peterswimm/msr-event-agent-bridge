/**
 * Key Vault Initialization Middleware
 * Initializes the Key Vault service on app startup if CMK is enabled
 */

import { Express, Request, Response, NextFunction } from 'express';
import { keyVaultService } from '../services/keyVaultService.js';
import pino from 'pino';

const logger = pino().child({ module: 'KeyVaultMiddleware' });

/**
 * Initialize Key Vault service if enabled
 * This should be called early in the app startup
 */
export async function initializeKeyVault(): Promise<void> {
  const cmkEnabled = process.env.CMK_ENABLED?.toLowerCase() === 'true';

  if (!cmkEnabled) {
    logger.info('CMK disabled - Key Vault service will not be initialized');
    return;
  }

  const keyVaultUrl = process.env.KEY_VAULT_URL;
  const keyName = process.env.ENCRYPTION_KEY_NAME;

  if (!keyVaultUrl || !keyName) {
    logger.warn('CMK enabled but KEY_VAULT_URL or ENCRYPTION_KEY_NAME not configured');
    return;
  }

  try {
    logger.info('Initializing Key Vault service...');
    await keyVaultService.initialize({
      keyVaultUrl,
      keyName,
      keyVersion: process.env.ENCRYPTION_KEY_VERSION,
    });
    logger.info('Key Vault service initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Key Vault service', error);
    // Don't throw - allow app to start with warnings
    // Applications can check keyVaultService.isInitialized() before using encryption
  }
}

/**
 * Middleware to check Key Vault health on requests
 * Can be used to track Key Vault availability
 */
export function keyVaultHealthCheck(req: Request, res: Response, next: NextFunction): void {
  // Store health status in request for logging
  if (keyVaultService.isInitialized()) {
    (req as any).keyVaultHealthy = true;
  }
  next();
}

/**
 * Route handler for Key Vault status
 * GET /health/keyvault
 */
export async function getKeyVaultStatus(req: Request, res: Response): Promise<void> {
  const health = await keyVaultService.healthCheck();
  const statusCode = health.healthy ? 200 : 503;
  res.status(statusCode).json(health);
}
