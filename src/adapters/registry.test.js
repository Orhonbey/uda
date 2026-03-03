// src/adapters/registry.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { registerAdapter, getAdapter, getAllAdapters } from './registry.js';

describe('Adapter Registry', () => {
  it('registers and retrieves adapters', () => {
    registerAdapter({
      name: 'test-adapter',
      detect: () => true,
      generate: () => ({}),
    });

    const adapter = getAdapter('test-adapter');
    assert.ok(adapter);
    assert.strictEqual(adapter.name, 'test-adapter');
  });

  it('returns all registered adapters', () => {
    const all = getAllAdapters();
    assert.ok(all.length > 0);
  });
});
