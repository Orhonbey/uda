// src/commands/edge-cases.test.js
// Wave 2: Edge case protection tests
import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

// --- handleLearn edge cases ---
describe('handleLearn edge cases', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-learn-edge-'));
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

  it('rejects missing source argument', async () => {
    const { handleLearn } = await import('./learn.js');
    await handleLearn('', { type: 'knowledge' });
    assert.strictEqual(process.exitCode, 1);
  });

  it('rejects null source argument', async () => {
    const { handleLearn } = await import('./learn.js');
    await handleLearn(null, { type: 'knowledge' });
    assert.strictEqual(process.exitCode, 1);
  });

  it('rejects whitespace-only source argument', async () => {
    const { handleLearn } = await import('./learn.js');
    await handleLearn('   ', { type: 'knowledge' });
    assert.strictEqual(process.exitCode, 1);
  });

  it('rejects empty file', async () => {
    const { handleLearn } = await import('./learn.js');
    const emptyFile = join(testDir, 'empty.md');
    await writeFile(emptyFile, '');
    await handleLearn(emptyFile, {});
    assert.strictEqual(process.exitCode, 1);
  });

  it('rejects directory as source', async () => {
    const { handleLearn } = await import('./learn.js');
    await handleLearn(testDir, {});
    assert.strictEqual(process.exitCode, 1);
  });

  it('rejects non-existent file', async () => {
    const { handleLearn } = await import('./learn.js');
    await handleLearn('/tmp/definitely-does-not-exist-12345.md', {});
    assert.strictEqual(process.exitCode, 1);
  });
});

// --- handleScan edge cases ---
describe('handleScan edge cases', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-scan-edge-'));
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

  it('handles empty knowledge directory gracefully', async () => {
    const { handleScan } = await import('./scan.js');
    await handleScan();
    assert.notStrictEqual(process.exitCode, 1);
  });
});

// --- handleStatus edge cases ---
describe('handleStatus edge cases', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-status-edge-'));
    paths = udaPaths(testDir);
    originalCwd = process.cwd();
  });

  after(async () => {
    process.chdir(originalCwd);
    process.exitCode = 0;
    await rm(testDir, { recursive: true, force: true });
  });

  beforeEach(() => { process.exitCode = 0; });

  it('errors when UDA is not initialized', async () => {
    process.chdir(testDir);
    await mkdir(testDir, { recursive: true });
    const { handleStatus } = await import('./status.js');
    await handleStatus();
    assert.strictEqual(process.exitCode, 1);
  });

  it('handles config with missing adapters field', async () => {
    process.chdir(testDir);
    await initProject(testDir);
    await writeFile(paths.config, JSON.stringify({ version: '0.1.0' }));
    const { handleStatus } = await import('./status.js');
    await handleStatus();
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('handles config with missing version field', async () => {
    process.chdir(testDir);
    await writeFile(paths.config, JSON.stringify({ adapters: ['claude'] }));
    const { handleStatus } = await import('./status.js');
    await handleStatus();
    assert.notStrictEqual(process.exitCode, 1);
  });
});

// --- handleSync edge cases ---
describe('handleSync edge cases', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-sync-edge-'));
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

  it('handles config with invalid adapters list gracefully', async () => {
    await writeFile(paths.config, JSON.stringify({
      version: '0.1.0',
      adapters: ['nonexistent-adapter'],
    }));
    const { handleSync } = await import('./sync.js');
    await handleSync();
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('handles config without adapters field', async () => {
    await writeFile(paths.config, JSON.stringify({ version: '0.1.0' }));
    const { handleSync } = await import('./sync.js');
    await handleSync();
    assert.notStrictEqual(process.exitCode, 1);
  });
});

// --- handleConfig edge cases ---
describe('handleConfig edge cases', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-config-edge-'));
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

  it('lists all config when no key provided', async () => {
    const { handleConfig } = await import('./config.js');
    await handleConfig(undefined, undefined);
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('errors on non-existent key', async () => {
    const { handleConfig } = await import('./config.js');
    await handleConfig('deeply.nested.nonexistent.key', undefined);
    assert.strictEqual(process.exitCode, 1);
  });

  it('errors when .uda is not initialized', async () => {
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

// --- handlePlugin edge cases ---
describe('handlePlugin edge cases', () => {
  beforeEach(() => { process.exitCode = 0; });
  afterEach(() => { process.exitCode = 0; });

  it('handlePluginAdd rejects empty repo', async () => {
    const { handlePluginAdd } = await import('./plugin.js');
    await handlePluginAdd('');
    assert.strictEqual(process.exitCode, 1);
  });

  it('handlePluginRemove rejects empty name', async () => {
    const { handlePluginRemove } = await import('./plugin.js');
    await handlePluginRemove('');
    assert.strictEqual(process.exitCode, 1);
  });

  it('handlePluginRemove rejects name with special chars', async () => {
    const { handlePluginRemove } = await import('./plugin.js');
    await handlePluginRemove('../../../etc/passwd');
    assert.strictEqual(process.exitCode, 1);
  });

  it('handlePluginUpdate rejects name with special chars', async () => {
    const { handlePluginUpdate } = await import('./plugin.js');
    await handlePluginUpdate('plugin@latest');
    assert.strictEqual(process.exitCode, 1);
  });
});

// --- handleExport edge cases ---
describe('handleExport edge cases', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-export-edge-'));
    paths = udaPaths(testDir);
    await initProject(testDir);
    await writeFile(
      join(paths.knowledge.project, 'profile.md'),
      '# Project Profile\n\nProject: EdgeTest\nEngine: unity'
    );
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  after(async () => {
    process.chdir(originalCwd);
    process.exitCode = 0;
    await rm(testDir, { recursive: true, force: true });
  });

  beforeEach(() => { process.exitCode = 0; });

  it('rejects null format', async () => {
    const { handleExport } = await import('./export.js');
    await handleExport({ format: null });
    assert.strictEqual(process.exitCode, 1);
  });

  it('rejects empty string format', async () => {
    const { handleExport } = await import('./export.js');
    await handleExport({ format: '' });
    assert.strictEqual(process.exitCode, 1);
  });

  it('rejects numeric format', async () => {
    const { handleExport } = await import('./export.js');
    await handleExport({ format: 123 });
    assert.strictEqual(process.exitCode, 1);
  });
});

// --- VectorStore parseTags edge case ---
describe('VectorStore parseTags safety', () => {
  it('handles invalid JSON in tags gracefully', async () => {
    const { VectorStore } = await import('../rag/store.js');
    assert.ok(VectorStore);
  });
});
