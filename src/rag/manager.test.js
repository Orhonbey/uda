// src/rag/manager.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { RagManager } from './manager.js';

describe('RagManager', () => {
  let rag;
  let testDir;
  let dbDir;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-rag-test-'));
    dbDir = join(testDir, 'lancedb');
    await mkdir(dbDir, { recursive: true });
    rag = new RagManager(dbDir);
    await rag.init();
  });

  after(async () => {
    await rm(testDir, { recursive: true });
  });

  it('learns from a markdown file', async () => {
    const mdPath = join(testDir, 'test.md');
    await writeFile(mdPath, '# Unity Lifecycle\nAwake is called before Start.\n## Start\nStart is called on the first frame.');

    await rag.learnFile(mdPath, { engine: 'unity', tags: ['lifecycle'] });

    const results = await rag.search('When is Awake called?');
    assert.ok(results.length > 0);
    assert.ok(results[0].content.includes('Awake') || results[0].content.includes('lifecycle'));
  });

  it('learns from raw text', async () => {
    await rag.learnText('NullReferenceException fix: check if GetComponent returns null before accessing.', {
      type: 'bug-fix',
      tags: ['nullref'],
    });

    const results = await rag.search('NullReferenceException');
    assert.ok(results.length > 0);
  });

  it('returns scored results', async () => {
    const results = await rag.search('Unity lifecycle order');
    assert.ok(results[0].score !== undefined);
  });
});
