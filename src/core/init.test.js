// src/core/init.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readFile, access } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from './init.js';

describe('initProject', () => {
  let testDir;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-test-'));
  });

  after(async () => {
    await rm(testDir, { recursive: true });
  });

  it('creates .uda directory structure', async () => {
    await initProject(testDir);

    const dirs = [
      '.uda',
      '.uda/knowledge',
      '.uda/knowledge/engine',
      '.uda/knowledge/project',
      '.uda/knowledge/community',
      '.uda/workflows',
      '.uda/agents',
      '.uda/state',
      '.uda/state/features',
      '.uda/state/history',
      '.uda/rag',
      '.uda/plugins',
      '.uda/.generated',
    ];

    for (const dir of dirs) {
      await access(join(testDir, dir));
    }
  });

  it('creates config.json with defaults', async () => {
    await initProject(testDir);
    const config = JSON.parse(await readFile(join(testDir, '.uda/config.json'), 'utf8'));
    assert.strictEqual(config.version, '0.1.0');
    assert.ok(Array.isArray(config.adapters));
    assert.ok(Array.isArray(config.plugins));
  });

  it('creates initial state/current.md', async () => {
    await initProject(testDir);
    const content = await readFile(join(testDir, '.uda/state/current.md'), 'utf8');
    assert.ok(content.includes('# UDA State'));
    assert.ok(content.includes('Last Scan:'));
  });

  it('does not overwrite existing config', async () => {
    await initProject(testDir);
    const config1 = await readFile(join(testDir, '.uda/config.json'), 'utf8');
    await initProject(testDir); // run again
    const config2 = await readFile(join(testDir, '.uda/config.json'), 'utf8');
    assert.strictEqual(config1, config2);
  });
});
