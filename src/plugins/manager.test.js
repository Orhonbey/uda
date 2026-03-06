// src/plugins/manager.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { PluginManager } from './manager.js';
import { simpleGit } from 'simple-git';
import { validateManifest } from '../core/validators.js';

describe('PluginManager', () => {
  let testDir;
  let pluginManager;
  let fakeRepoDir;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-plugin-test-'));
    
    // Create .uda structure
    const udaDir = join(testDir, '.uda');
    await mkdir(join(udaDir, 'knowledge', 'engine'), { recursive: true });
    await mkdir(join(udaDir, 'workflows'), { recursive: true });
    await mkdir(join(udaDir, 'agents'), { recursive: true });
    await mkdir(join(udaDir, 'plugins'), { recursive: true });
    
    // Create config.json
    await writeFile(
      join(udaDir, 'config.json'),
      JSON.stringify({ version: '0.1.0', adapters: ['claude'] })
    );
    
    pluginManager = new PluginManager(testDir);
    
    // Create a fake git repo for testing
    fakeRepoDir = await mkdtemp(join(tmpdir(), 'uda-fake-repo-'));
    const git = simpleGit(fakeRepoDir);
    await git.init();
    await git.addConfig('user.email', 'test@test.com');
    await git.addConfig('user.name', 'Test User');
    
    // Create plugin structure
    await mkdir(join(fakeRepoDir, 'knowledge'), { recursive: true });
    await mkdir(join(fakeRepoDir, 'workflows'), { recursive: true });
    await mkdir(join(fakeRepoDir, 'agents'), { recursive: true });
    
    // Create manifest.json with uda_version (required in v0.2.0)
    await writeFile(
      join(fakeRepoDir, 'manifest.json'),
      JSON.stringify({
        name: 'test-plugin',
        version: '1.0.0',
        engine: 'unity',
        uda_version: '>=0.2.0',
        capabilities: {
          logs: { source: '.uda/logs/console.jsonl' },
          knowledge: true,
        },
      })
    );
    
    // Create a knowledge file
    await writeFile(
      join(fakeRepoDir, 'knowledge', 'test.md'),
      '# Test Knowledge\nThis is test content.'
    );
    
    // Commit the files
    await git.add('.');
    await git.commit('Initial commit');
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
    await rm(fakeRepoDir, { recursive: true, force: true });
  });

  it('adds a plugin from git repo', async () => {
    const manifest = await pluginManager.add(fakeRepoDir);
    
    assert.strictEqual(manifest.name, 'test-plugin');
    assert.strictEqual(manifest.version, '1.0.0');
    assert.strictEqual(manifest.engine, 'unity');
  });

  it('tracks commitHash when adding plugin', async () => {
    const plugins = await pluginManager.list();
    const plugin = plugins.find(p => p.name === 'test-plugin');
    
    assert.ok(plugin, 'Plugin should be in list');
    assert.ok(plugin.commitHash, 'Plugin should have commitHash');
    assert.strictEqual(plugin.commitHash.length, 40, 'commitHash should be 40 chars');
  });

  it('lists installed plugins', async () => {
    const plugins = await pluginManager.list();
    
    assert.ok(plugins.length > 0, 'Should have at least one plugin');
    assert.ok(plugins.some(p => p.name === 'test-plugin'), 'Should list test-plugin');
  });

  it('updates a plugin', async () => {
    const git = simpleGit(fakeRepoDir);
    
    // Make a change to the repo
    await writeFile(
      join(fakeRepoDir, 'knowledge', 'updated.md'),
      '# Updated Knowledge\nThis is updated content.'
    );
    await git.add('.');
    await git.commit('Update content');
    
    const result = await pluginManager.update('unity');
    
    assert.ok(result.old, 'Should have old metadata');
    assert.ok(result.new, 'Should have new manifest');
    assert.notStrictEqual(result.old.commitHash, result.new.commitHash, 'Commit hash should change');
  });

  it('updateAll updates all plugins', async () => {
    const results = await pluginManager.updateAll();
    
    assert.ok(Array.isArray(results), 'Should return array');
    assert.ok(results.length > 0, 'Should update at least one plugin');
    assert.ok(results[0].name, 'Result should have name');
    assert.ok(results[0].old, 'Result should have old metadata');
    assert.ok(results[0].new, 'Result should have new manifest');
  });

  it('removes a plugin', async () => {
    const meta = await pluginManager.remove('unity');
    
    assert.strictEqual(meta.name, 'test-plugin');
    
    const plugins = await pluginManager.list();
    assert.ok(!plugins.some(p => p.name === 'test-plugin'), 'Plugin should be removed');
  });

  it('rejects plugin with invalid manifest', async () => {
    // Create a new fake repo with invalid manifest
    const invalidRepoDir = await mkdtemp(join(tmpdir(), 'uda-invalid-repo-'));
    const git = simpleGit(invalidRepoDir);
    await git.init();
    await git.addConfig('user.email', 'test@test.com');
    await git.addConfig('user.name', 'Test User');

    // Create manifest missing required fields
    await writeFile(
      join(invalidRepoDir, 'manifest.json'),
      JSON.stringify({ name: 'invalid-plugin' }) // missing version, engine, uda_version
    );

    await git.add('.');
    await git.commit('Initial commit');

    // Create a fresh plugin manager
    const testDir2 = await mkdtemp(join(tmpdir(), 'uda-plugin-test2-'));
    const udaDir2 = join(testDir2, '.uda');
    await mkdir(join(udaDir2, 'knowledge', 'engine'), { recursive: true });
    await mkdir(join(udaDir2, 'workflows'), { recursive: true });
    await mkdir(join(udaDir2, 'agents'), { recursive: true });
    await mkdir(join(udaDir2, 'plugins'), { recursive: true });
    await writeFile(join(udaDir2, 'config.json'), JSON.stringify({ version: '0.1.0' }));

    const pm2 = new PluginManager(testDir2);

    try {
      await pm2.add(invalidRepoDir);
      assert.fail('Should have thrown an error for invalid manifest');
    } catch (err) {
      assert.ok(err.message.includes('Invalid plugin manifest'), `Error message should mention invalid manifest: ${err.message}`);
    }

    await rm(testDir2, { recursive: true, force: true });
    await rm(invalidRepoDir, { recursive: true, force: true });
  });

  it('saves capabilities from manifest to plugin metadata', async () => {
    // Re-add the plugin with capabilities
    const manifest = await pluginManager.add(fakeRepoDir);
    
    // Check that capabilities are saved in the metadata
    const plugins = await pluginManager.list();
    const plugin = plugins.find(p => p.name === 'test-plugin');
    
    assert.ok(plugin, 'Plugin should be in list');
    assert.ok(plugin.capabilities, 'Plugin should have capabilities');
    assert.ok(plugin.capabilities.logs, 'Capabilities should include logs');
    assert.strictEqual(plugin.capabilities.logs.source, '.uda/logs/console.jsonl');
  });
});
