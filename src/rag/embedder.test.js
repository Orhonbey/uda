import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { Embedder } from './embedder.js';

describe('Embedder', () => {
  let embedder;

  before(async () => {
    embedder = new Embedder();
    await embedder.init(); // downloads model on first run
  });

  it('generates a 384-dimensional embedding', async () => {
    const embedding = await embedder.embed('Hello world');
    assert.strictEqual(embedding.length, 384);
  });

  it('generates similar embeddings for similar texts', async () => {
    const emb1 = await embedder.embed('The cat sat on the mat');
    const emb2 = await embedder.embed('A cat is sitting on a mat');
    const emb3 = await embedder.embed('Quantum physics explains wave functions');

    const sim12 = cosineSim(emb1, emb2);
    const sim13 = cosineSim(emb1, emb3);

    assert.ok(sim12 > sim13, 'Similar texts should have higher similarity');
    assert.ok(sim12 > 0.7, `Expected similarity > 0.7, got ${sim12}`);
  });

  it('batch embeds multiple texts', async () => {
    const embeddings = await embedder.embedBatch(['Hello', 'World', 'Test']);
    assert.strictEqual(embeddings.length, 3);
    assert.strictEqual(embeddings[0].length, 384);
  });
});

function cosineSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
