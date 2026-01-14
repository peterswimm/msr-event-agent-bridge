/**
 * Key Vault Service Integration Tests
 * Tests encryption/decryption and connectivity
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { keyVaultService } from '../services/keyVaultService.js';

describe('Key Vault Service', () => {
  before(async () => {
    // Skip tests if CMK is not enabled or configured
    if (process.env.CMK_ENABLED !== 'true') {
      console.log('⏭️  Skipping Key Vault tests (CMK_ENABLED=false)');
      return;
    }

    if (!process.env.KEY_VAULT_URL || !process.env.ENCRYPTION_KEY_NAME) {
      console.log('⏭️  Skipping Key Vault tests (KEY_VAULT_URL or ENCRYPTION_KEY_NAME not configured)');
      return;
    }
  });

  it('should initialize with valid configuration', async () => {
    if (process.env.CMK_ENABLED !== 'true') {
      console.log('  ⏭️  Skipped (CMK not enabled)');
      return;
    }

    await keyVaultService.initialize({
      keyVaultUrl: process.env.KEY_VAULT_URL!,
      keyName: process.env.ENCRYPTION_KEY_NAME!,
      keyVersion: process.env.ENCRYPTION_KEY_VERSION,
    });

    assert.ok(keyVaultService.isInitialized(), 'Service should be initialized');
  });

  it('should encrypt and decrypt data', async () => {
    if (!keyVaultService.isInitialized()) {
      console.log('  ⏭️  Skipped (service not initialized)');
      return;
    }

    const plaintext = 'sensitive-data-123';

    // Encrypt
    const encrypted = await keyVaultService.encrypt(plaintext);
    assert.ok(encrypted, 'Encryption should return non-empty result');
    assert.notStrictEqual(encrypted, plaintext, 'Encrypted data should differ from plaintext');

    // Decrypt
    const decrypted = await keyVaultService.decrypt(encrypted);
    assert.strictEqual(decrypted, plaintext, 'Decrypted data should match original');
  });

  it('should handle buffer input for encryption', async () => {
    if (!keyVaultService.isInitialized()) {
      console.log('  ⏭️  Skipped (service not initialized)');
      return;
    }

    const plaintextBuffer = Buffer.from('buffer-input-test');

    // Encrypt buffer
    const encrypted = await keyVaultService.encrypt(plaintextBuffer);
    assert.ok(encrypted, 'Buffer encryption should return non-empty result');

    // Decrypt
    const decrypted = await keyVaultService.decrypt(encrypted);
    assert.strictEqual(decrypted, plaintextBuffer.toString('utf-8'), 'Decrypted buffer data should match');
  });

  it('should retrieve key information', async () => {
    if (!keyVaultService.isInitialized()) {
      console.log('  ⏭️  Skipped (service not initialized)');
      return;
    }

    const keyInfo = await keyVaultService.getKeyInfo();
    assert.ok(keyInfo.name, 'Key should have a name');
    assert.ok(keyInfo.id, 'Key should have an id');
    assert.ok(keyInfo.keyType, 'Key should have a type');
    assert.ok(keyInfo.enabled !== undefined, 'Key should have enabled status');
  });

  it('should perform health check', async () => {
    if (!keyVaultService.isInitialized()) {
      console.log('  ⏭️  Skipped (service not initialized)');
      return;
    }

    const health = await keyVaultService.healthCheck();
    assert.ok(health.healthy === true, 'Health check should succeed');
    assert.ok(health.message, 'Health check should have message');
  });

  it('should fail gracefully with invalid ciphertext', async () => {
    if (!keyVaultService.isInitialized()) {
      console.log('  ⏭️  Skipped (service not initialized)');
      return;
    }

    try {
      await keyVaultService.decrypt('invalid-base64-ciphertext!!!');
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error instanceof Error, 'Should throw an error');
      assert.ok(error.message.includes('decryption failed'), 'Error should mention decryption');
    }
  });
});
