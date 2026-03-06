// src/commands/learn.test.js — Integration tests for handleLearn
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

describe('handleLearn integration', { timeout: 60_000 }, () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-learn-int-'));
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

  it('learns a markdown file successfully', async () => {
    const mdFile = join(testDir, 'doc.md');
    await writeFile(mdFile, '# Test Doc\n\nThis is test content for learning.');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(mdFile, {});
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('reports error for non-existent file', async () => {
    const { handleLearn } = await import('./learn.js');
    await handleLearn('/tmp/does-not-exist-abc123.md', {});
    assert.strictEqual(process.exitCode, 1);
  });

  it('reports error for empty file', async () => {
    const emptyFile = join(testDir, 'empty.md');
    await writeFile(emptyFile, '');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(emptyFile, {});
    assert.strictEqual(process.exitCode, 1);
  });

  it('reports error for directory as source', async () => {
    const { handleLearn } = await import('./learn.js');
    await handleLearn(testDir, {});
    assert.strictEqual(process.exitCode, 1);
  });

  it('accepts type option', async () => {
    const mdFile = join(testDir, 'typed-doc.md');
    await writeFile(mdFile, '# Typed Doc\n\nContent with type annotation.');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(mdFile, { type: 'knowledge' });
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('accepts tags option', async () => {
    const mdFile = join(testDir, 'tagged-doc.md');
    await writeFile(mdFile, '# Tagged Doc\n\nContent with tags.');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(mdFile, { tags: 'unity,lifecycle' });
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('warns about non-markdown files', async () => {
    const txtFile = join(testDir, 'doc.txt');
    await writeFile(txtFile, 'Plain text content for testing.');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(txtFile, {});
    // Should not error — just warns
    assert.notStrictEqual(process.exitCode, 1);
  });
});
