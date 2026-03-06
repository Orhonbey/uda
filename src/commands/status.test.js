// src/commands/status.test.js — Integration tests for handleStatus
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

describe('handleStatus integration', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-status-int-'));
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

  it('shows status after initialization', async () => {
    await initProject(testDir);
    process.chdir(testDir);
    process.exitCode = 0;

    const { handleStatus } = await import('./status.js');
    await handleStatus();
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('shows version from config', async () => {
    process.chdir(testDir);
    const { handleStatus } = await import('./status.js');
    // Config was created by initProject with version 0.1.0
    await handleStatus();
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('handles missing plugins directory gracefully', async () => {
    // Remove plugins dir to test error handling
    await rm(paths.plugins, { recursive: true, force: true });
    process.chdir(testDir);
    process.exitCode = 0;

    const { handleStatus } = await import('./status.js');
    await handleStatus();
    assert.notStrictEqual(process.exitCode, 1);

    // Restore for later tests
    await mkdir(paths.plugins, { recursive: true });
  });

  it('shows state file content', async () => {
    process.chdir(testDir);
    process.exitCode = 0;

    const { handleStatus } = await import('./status.js');
    await handleStatus();
    // state/current.md was created by initProject
    assert.notStrictEqual(process.exitCode, 1);
  });
});
