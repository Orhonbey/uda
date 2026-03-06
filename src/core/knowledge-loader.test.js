import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { udaPaths } from './constants.js';
import { initProject } from './init.js';

describe('loadWorkflows', () => {
  let testDir, paths;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-loader-'));
    paths = udaPaths(testDir);
    await initProject(testDir);
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('returns empty array when no workflows exist', async () => {
    const { loadWorkflows } = await import('./knowledge-loader.js?t=wf1');
    const result = await loadWorkflows(paths);
    assert.deepStrictEqual(result, []);
  });

  it('loads YAML workflow files', async () => {
    await writeFile(join(paths.workflows, 'debug.yaml'), [
      'name: debug-logs',
      'description: Debug Unity console logs',
      'steps:',
      '  - id: read-logs',
      '    name: Read Logs',
      '    questions:',
      '      - What errors do you see?',
    ].join('\n'));

    // Re-import to get fresh module
    const mod = await import('./knowledge-loader.js?t=wf2');
    const result = await mod.loadWorkflows(paths);
    assert.ok(result.length >= 1);
    assert.strictEqual(result[0].name, 'debug-logs');
    assert.strictEqual(result[0].description, 'Debug Unity console logs');
  });
});

describe('loadAgents', () => {
  let testDir, paths;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-loader-agents-'));
    paths = udaPaths(testDir);
    await initProject(testDir);
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('returns empty array when no agents exist', async () => {
    const { loadAgents } = await import('./knowledge-loader.js?t=ag1');
    const result = await loadAgents(paths);
    assert.deepStrictEqual(result, []);
  });

  it('loads agent markdown files with frontmatter', async () => {
    await writeFile(join(paths.agents, 'debugger.md'), [
      '---',
      'name: unity-debugger',
      'description: Unity debugging expert',
      'tools: Read, Grep, Glob, Bash',
      '---',
      '',
      'You are a Unity debugging expert.',
    ].join('\n'));

    const mod = await import('./knowledge-loader.js?t=ag2');
    const result = await mod.loadAgents(paths);
    assert.ok(result.length >= 1);
    assert.strictEqual(result[0].name, 'unity-debugger');
    assert.strictEqual(result[0].description, 'Unity debugging expert');
    assert.ok(result[0].prompt.includes('Unity debugging expert'));
  });
});
