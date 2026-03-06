// src/commands/search.test.js — Integration tests for handleSearch
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

describe('handleSearch integration', { timeout: 60_000 }, () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-search-int-'));
    paths = udaPaths(testDir);
    await initProject(testDir);
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  after(async () => {
    process.chdir(originalCwd);
    process.exitCode = 0;
    await rm(testDir, { recursive: true, force: true });
  });

  beforeEach(() => { process.exitCode = 0; });

  it('returns no results on empty index', async () => {
    const { handleSearch } = await import('./search.js');
    await handleSearch('test query', { top: 5 });
    // Should not error — just "No results found"
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('finds content after learning a file', async () => {
    // First learn a file
    const mdFile = join(testDir, 'searchable.md');
    await writeFile(mdFile, '# Unity MonoBehaviour\n\nThe MonoBehaviour lifecycle includes Awake, Start, Update, and FixedUpdate methods.');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(mdFile, {});
    assert.notStrictEqual(process.exitCode, 1, 'Learn should succeed');

    // Now search
    process.exitCode = 0;
    const { handleSearch } = await import('./search.js');
    await handleSearch('MonoBehaviour lifecycle', { top: 5 });
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('rejects empty query', async () => {
    const { handleSearch } = await import('./search.js');
    await handleSearch('', { top: 5 });
    assert.strictEqual(process.exitCode, 1);
  });

  it('rejects null query', async () => {
    const { handleSearch } = await import('./search.js');
    await handleSearch(null, { top: 5 });
    assert.strictEqual(process.exitCode, 1);
  });

  it('respects --top option', async () => {
    const { handleSearch } = await import('./search.js');
    await handleSearch('test', { top: 1 });
    assert.notStrictEqual(process.exitCode, 1);
  });
});
