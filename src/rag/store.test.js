import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { VectorStore } from './store.js';

describe('VectorStore', () => {
  let store;
  let testDir;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-store-test-'));
    store = new VectorStore(testDir);
    await store.init();
  });

  after(async () => {
    await rm(testDir, { recursive: true });
  });

  it('adds documents and retrieves by vector search', async () => {
    await store.add([
      {
        id: 'doc-1',
        content: 'Unity MonoBehaviour lifecycle',
        vector: new Array(384).fill(0).map((_, i) => i * 0.001),
        metadata: { source: 'test.md', engine: 'unity', type: 'knowledge', tags: ['lifecycle'] },
      },
      {
        id: 'doc-2',
        content: 'Unreal Actor lifecycle',
        vector: new Array(384).fill(0).map((_, i) => i * 0.002),
        metadata: { source: 'test2.md', engine: 'unreal', type: 'knowledge', tags: ['lifecycle'] },
      },
    ]);

    const queryVector = new Array(384).fill(0).map((_, i) => i * 0.0015);
    const results = await store.search(queryVector, 2);

    assert.strictEqual(results.length, 2);
    assert.ok(results[0].content);
    assert.ok(results[0].score !== undefined);
  });

  it('returns results sorted by relevance', async () => {
    const queryVector = new Array(384).fill(0).map((_, i) => i * 0.001);
    const results = await store.search(queryVector, 2);

    // First result should be closer to doc-1
    assert.ok(results[0].score <= results[1].score); // lower distance = more similar
  });

  it('respects limit parameter', async () => {
    const queryVector = new Array(384).fill(0).map((_, i) => i * 0.001);
    const results = await store.search(queryVector, 1);
    assert.strictEqual(results.length, 1);
  });
});
