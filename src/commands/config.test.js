// src/commands/config.test.js — Integration tests for handleConfig
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

describe('handleConfig integration', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-config-int-'));
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

  it('lists all config when no key given', async () => {
    const { handleConfig } = await import('./config.js');
    await handleConfig(undefined, undefined);
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('gets a config value by key', async () => {
    const { handleConfig } = await import('./config.js');
    await handleConfig('version', undefined);
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('gets a nested config value', async () => {
    const { handleConfig } = await import('./config.js');
    await handleConfig('rag.chunk_size', undefined);
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('sets a config value', async () => {
    const { handleConfig } = await import('./config.js');
    await handleConfig('language', 'tr');
    assert.notStrictEqual(process.exitCode, 1);

    // Verify it was saved
    const config = JSON.parse(await readFile(paths.config, 'utf8'));
    assert.strictEqual(config.language, 'tr');
  });

  it('sets a nested config value', async () => {
    const { handleConfig } = await import('./config.js');
    await handleConfig('rag.chunk_size', '1024');
    assert.notStrictEqual(process.exitCode, 1);

    const config = JSON.parse(await readFile(paths.config, 'utf8'));
    assert.strictEqual(config.rag.chunk_size, 1024);
  });

  it('errors on non-existent key', async () => {
    const { handleConfig } = await import('./config.js');
    await handleConfig('nonexistent.key.path', undefined);
    assert.strictEqual(process.exitCode, 1);
  });

  it('errors when UDA is not initialized', async () => {
    const uninitDir = await mkdtemp(join(tmpdir(), 'uda-config-noinit-'));
    const savedCwd = process.cwd();
    process.chdir(uninitDir);

    const { handleConfig } = await import('./config.js');
    await handleConfig('version', undefined);
    assert.strictEqual(process.exitCode, 1);

    process.chdir(savedCwd);
    await rm(uninitDir, { recursive: true, force: true });
  });
});
