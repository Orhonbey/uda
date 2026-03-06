// src/commands/plugin.test.js — Integration tests for plugin commands
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, writeFile, readFile, readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

describe('handlePluginList integration', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-plugin-int-'));
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

  it('returns empty list when no plugins installed', async () => {
    const { handlePluginList } = await import('./plugin.js');
    await handlePluginList();
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('lists installed plugins', async () => {
    // Create a mock plugin metadata file
    await writeFile(
      join(paths.plugins, 'test-engine.json'),
      JSON.stringify({
        name: 'test-plugin',
        version: '1.0.0',
        engine: 'test-engine',
        repo: 'https://github.com/test/test-plugin',
        installedAt: new Date().toISOString(),
      })
    );

    const { handlePluginList } = await import('./plugin.js');
    await handlePluginList();
    assert.notStrictEqual(process.exitCode, 1);
  });
});

describe('handlePluginAdd integration', () => {
  beforeEach(() => { process.exitCode = 0; });
  after(() => { process.exitCode = 0; });

  it('rejects empty repo URL', async () => {
    const { handlePluginAdd } = await import('./plugin.js');
    await handlePluginAdd('');
    assert.strictEqual(process.exitCode, 1);
  });

  it('rejects null repo URL', async () => {
    const { handlePluginAdd } = await import('./plugin.js');
    await handlePluginAdd(null);
    assert.strictEqual(process.exitCode, 1);
  });
});

describe('handlePluginRemove integration', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-pluginrm-int-'));
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

  it('rejects empty plugin name', async () => {
    const { handlePluginRemove } = await import('./plugin.js');
    await handlePluginRemove('');
    assert.strictEqual(process.exitCode, 1);
  });

  it('errors when plugin is not installed', async () => {
    const { handlePluginRemove } = await import('./plugin.js');
    await handlePluginRemove('nonexistent-plugin');
    assert.strictEqual(process.exitCode, 1);
  });

  it('removes an installed plugin', async () => {
    // Create mock plugin
    const pluginMeta = {
      name: 'removable-plugin',
      version: '1.0.0',
      engine: 'removable',
      repo: 'https://github.com/test/removable',
    };
    await writeFile(
      join(paths.plugins, 'removable.json'),
      JSON.stringify(pluginMeta)
    );
    // Create mock engine knowledge
    const engineDir = join(paths.knowledge.engine, 'removable');
    await mkdir(engineDir, { recursive: true });
    await writeFile(join(engineDir, 'test.md'), '# Test');

    const { handlePluginRemove } = await import('./plugin.js');
    await handlePluginRemove('removable');
    assert.notStrictEqual(process.exitCode, 1);

    // Verify plugin metadata removed
    const pluginFiles = await readdir(paths.plugins);
    assert.ok(!pluginFiles.includes('removable.json'), 'Plugin metadata should be removed');
  });
});

describe('handlePluginUpdate integration', () => {
  beforeEach(() => { process.exitCode = 0; });
  after(() => { process.exitCode = 0; });

  it('rejects name with special characters', async () => {
    const { handlePluginUpdate } = await import('./plugin.js');
    await handlePluginUpdate('../../../etc/passwd');
    assert.strictEqual(process.exitCode, 1);
  });
});
