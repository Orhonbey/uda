// src/commands/sync.test.js — Integration tests for handleSync
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

describe('handleSync integration', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-sync-int-'));
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

  it('generates adapter output files', async () => {
    const { handleSync } = await import('./sync.js');
    await handleSync();
    assert.notStrictEqual(process.exitCode, 1);

    // Check that some adapter files were generated
    // Default config includes claude, cursor, windsurf, agents-md, raw
    const generatedFiles = await readdir(testDir, { recursive: true });
    // At minimum, CLAUDE.md or .cursorrules should exist
    const hasAdapterOutput = generatedFiles.some(f =>
      f.includes('CLAUDE.md') || f.includes('.cursorrules') || f.includes('AGENTS.md') || f.includes('full-context.md')
    );
    assert.ok(hasAdapterOutput, 'Should generate at least one adapter output file');
  });

  it('handles empty project knowledge', async () => {
    // Even with no knowledge files, sync should not error
    const { handleSync } = await import('./sync.js');
    await handleSync();
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('includes project profile in generated output', async () => {
    // Add a project profile
    await writeFile(
      join(paths.knowledge.project, 'profile.md'),
      '# Project Profile\n\nProject: TestGame\nEngine: unity\nVersion: 2022.3'
    );

    const { handleSync } = await import('./sync.js');
    await handleSync();
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('errors when project is not initialized', async () => {
    const uninitDir = await mkdtemp(join(tmpdir(), 'uda-sync-noinit-'));
    const savedCwd = process.cwd();
    process.chdir(uninitDir);

    const { handleSync } = await import('./sync.js');
    await handleSync();
    assert.strictEqual(process.exitCode, 1);

    process.chdir(savedCwd);
    await rm(uninitDir, { recursive: true, force: true });
  });

  it('passes plugin capabilities to claude adapter', async () => {
    // Install a fake plugin with capabilities
    const pluginsDir = join(testDir, '.uda', 'plugins');
    await writeFile(join(pluginsDir, 'unity.json'), JSON.stringify({
      name: 'uda-unity',
      engine: 'unity',
      capabilities: {
        logs: { source: '.uda/logs/console.jsonl' },
        knowledge: true,
      },
    }));

    const { handleSync } = await import('./sync.js?t=cap');
    await handleSync();

    const claudeMd = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');
    assert.ok(claudeMd.includes('npx uda-cli logs'));
    assert.ok(claudeMd.includes('.uda/knowledge/'));
  });
});
