// src/rag/chunker.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { chunkMarkdown } from './chunker.js';

describe('chunkMarkdown', () => {
  it('splits by headings', () => {
    const md = `# Title\nSome intro text.\n## Section 1\nContent one.\n## Section 2\nContent two.`;
    const chunks = chunkMarkdown(md, { source: 'test.md' });
    assert.strictEqual(chunks.length, 3);
    assert.ok(chunks[0].content.includes('Title'));
    assert.ok(chunks[1].content.includes('Section 1'));
    assert.ok(chunks[2].content.includes('Section 2'));
  });

  it('preserves code blocks as separate chunks', () => {
    const md = "# Title\nText before.\n```csharp\nvoid Update() {}\n```\nText after.";
    const chunks = chunkMarkdown(md, { source: 'test.md' });
    const codeChunk = chunks.find(c => c.content.includes('void Update'));
    assert.ok(codeChunk);
    assert.strictEqual(codeChunk.type, 'code');
  });

  it('attaches metadata to each chunk', () => {
    const md = '# Title\nSome text.';
    const chunks = chunkMarkdown(md, {
      source: 'knowledge/unity/lifecycle.md',
      engine: 'unity',
      tags: ['lifecycle'],
    });
    assert.strictEqual(chunks[0].metadata.source, 'knowledge/unity/lifecycle.md');
    assert.strictEqual(chunks[0].metadata.engine, 'unity');
    assert.deepStrictEqual(chunks[0].metadata.tags, ['lifecycle']);
  });

  it('respects max chunk size', () => {
    const longText = '# Title\n' + 'word '.repeat(1000);
    const chunks = chunkMarkdown(longText, { source: 'test.md', maxChunkSize: 200 });
    for (const chunk of chunks) {
      assert.ok(chunk.content.length <= 250); // some tolerance for heading
    }
  });
});
