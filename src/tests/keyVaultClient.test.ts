/**
 * Unit tests for KeyVaultClient.
 *
 * These tests avoid real Azure calls by replacing the internal SecretClient
 * with a mock object after construction. This validates caching and error
 * behavior without network dependency.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { KeyVaultClient } from '../services/keyVaultClient.js';

// Simple mock secret client
const createMockSecretClient = (value = 'secret-value', throwOnce = false) => {
  let callCount = 0;
  return {
    getSecret: async (name: string) => {
      callCount += 1;
      if (throwOnce && callCount === 1) {
        throw new Error('Network error');
      }
      return { value } as any;
    },
    get calls() {
      return callCount;
    },
  };
};

// Minimal logger
const logger = {
  info: () => {},
  debug: () => {},
  error: () => {},
};

describe('KeyVaultClient', () => {
  it('throws on invalid vault URL', () => {
    assert.throws(() => {
      // @ts-expect-error testing invalid input
      new KeyVaultClient({ vaultUrl: 'http://bad-url' }, logger as any);
    }, /Invalid vault URL/);
  });

  it('retrieves secret and caches when allowed', async () => {
    const kv = new KeyVaultClient({ vaultUrl: 'https://kv-test.vault.azure.net/' }, logger as any);
    const mockClient = createMockSecretClient('cached-value');
    (kv as any).client = mockClient;

    const first = await kv.getSecret('my-secret', true);
    const second = await kv.getSecret('my-secret', true);

    assert.strictEqual(first, 'cached-value');
    assert.strictEqual(second, 'cached-value');
    assert.strictEqual(mockClient.calls, 1, 'second call should use cache');
  });

  it('bypasses cache when useCache=false', async () => {
    const kv = new KeyVaultClient({ vaultUrl: 'https://kv-test.vault.azure.net/' }, logger as any);
    const mockClient = createMockSecretClient('no-cache');
    (kv as any).client = mockClient;

    await kv.getSecret('plain', false);
    await kv.getSecret('plain', false);

    assert.strictEqual(mockClient.calls, 2, 'no caching when useCache=false');
  });

  it('does not cache sensitive keys (encryption/jwt)', async () => {
    const kv = new KeyVaultClient({ vaultUrl: 'https://kv-test.vault.azure.net/' }, logger as any);
    const mockClient = createMockSecretClient('sensitive');
    (kv as any).client = mockClient;

    await kv.getSecret('encryption-master-key', true);
    await kv.getSecret('encryption-master-key', true);

    assert.strictEqual(mockClient.calls, 2, 'sensitive keys should not be cached');
  });

  it('clears cache', async () => {
    const kv = new KeyVaultClient({ vaultUrl: 'https://kv-test.vault.azure.net/' }, logger as any);
    const mockClient = createMockSecretClient('abc');
    (kv as any).client = mockClient;

    await kv.getSecret('k1', true);
    kv.clearCache();
    await kv.getSecret('k1', true);

    assert.strictEqual(mockClient.calls, 2, 'cache should be cleared');
  });

  it('propagates errors from SecretClient', async () => {
    const kv = new KeyVaultClient({ vaultUrl: 'https://kv-test.vault.azure.net/' }, logger as any);
    const mockClient = createMockSecretClient('x', true);
    (kv as any).client = mockClient;

    await assert.rejects(kv.getSecret('err'), /Network error/);
  });
});