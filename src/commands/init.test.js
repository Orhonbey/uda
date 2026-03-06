// src/commands/init.test.js — Integration tests for handleInit
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readFile, access, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { udaPaths } from '../core/constants.js';

describe('handleInit integration', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-init-int-'));
    paths = udaPaths(testDir);
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  after(async () => {
    process.chdir(originalCwd);
    process.exitCode = 0;
    await rm(testDir, { recursive: true, force: true });
  });

  beforeEach(() => { process.exitCode = 0; });

  it('creates .uda directory structure and config', async () => {
    const { handleInit } = await import('./init.js');
    await handleInit({});

    // Verify directory structure
    await access(paths.root);
    await access(paths.knowledge.root);
    await access(paths.knowledge.engine);
    await access(paths.knowledge.project);
    await access(paths.workflows);
    await access(paths.agents);
    await access(paths.state.root);
    await access(paths.rag.root);
    await access(paths.plugins);
    await access(paths.generated);

    // Verify config.json
    const config = JSON.parse(await readFile(paths.config, 'utf8'));
    assert.strictEqual(config.version, '0.1.0');
    assert.ok(Array.isArray(config.adapters));
    assert.ok(Array.isArray(config.plugins));
  });

  it('creates initial state file', async () => {
    const content = await readFile(paths.state.current, 'utf8');
    assert.ok(content.includes('# Project State'));
  });

  it('preserves existing config on re-init', async () => {
    const configBefore = await readFile(paths.config, 'utf8');
    const { handleInit } = await import('./init.js');
    await handleInit({});
    const configAfter = await readFile(paths.config, 'utf8');
    assert.strictEqual(configBefore, configAfter);
  });

  it('rejects invalid engine option', async () => {
    const { handleInit } = await import('./init.js');
    await handleInit({ engine: 'invalid-engine-xyz' });
    assert.strictEqual(process.exitCode, 1);
  });

  it('accepts valid engine option', async () => {
    process.exitCode = 0;
    const dir2 = await mkdtemp(join(tmpdir(), 'uda-init-eng-'));
    const savedCwd = process.cwd();
    process.chdir(dir2);
    const { handleInit } = await import('./init.js');
    await handleInit({ engine: 'unity' });
    assert.notStrictEqual(process.exitCode, 1);
    process.chdir(savedCwd);
    await rm(dir2, { recursive: true, force: true });
  });
});
