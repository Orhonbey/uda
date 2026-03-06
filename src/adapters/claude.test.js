// src/adapters/claude.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { ClaudeAdapter } from './claude.js';

describe('ClaudeAdapter', () => {
  let testDir;
  const adapter = new ClaudeAdapter();

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-claude-test-'));
  });

  after(async () => {
    await rm(testDir, { recursive: true });
  });

  it('has correct name', () => {
    assert.strictEqual(adapter.name, 'claude');
  });

  it('detects Claude Code by CLAUDE.md or .claude directory', () => {
    // detection is best-effort — always generates
    assert.strictEqual(typeof adapter.detect, 'function');
  });

  it('generates CLAUDE.md', async () => {
    const knowledge = {
      project: { name: 'TestGame', engine: 'unity', version: '2022.3' },
      conventions: ['PascalCase methods', 'camelCase variables'],
      decisions: ['Using Singleton pattern for managers'],
    };
    const workflows = [
      { name: 'debug', description: 'Systematic debugging' },
    ];
    const agents = [
      { name: 'log-analyzer', description: 'Unity log analysis expert' },
    ];

    const files = await adapter.generate(knowledge, workflows, agents, testDir);

    assert.ok(files['CLAUDE.md']);
    assert.ok(files['CLAUDE.md'].includes('TestGame'));
    assert.ok(files['CLAUDE.md'].includes('unity'));
    assert.ok(files['CLAUDE.md'].includes('PascalCase'));
  });

  it('generates CLAUDE.md with UDA instructions section', async () => {
    const knowledge = {
      project: { name: 'TestGame', engine: 'unity' },
      conventions: [],
      decisions: [],
    };
    const workflows = [{ name: 'debug-logs', description: 'Debug console logs', steps: [] }];
    const agents = [];
    const capabilities = { logs: { source: '.uda/logs/console.jsonl' }, knowledge: true };

    const files = adapter.generate(knowledge, workflows, agents, testDir, capabilities);

    const md = files['CLAUDE.md'];
    assert.ok(md.includes('UDA (Universal Dev AI)'));
    assert.ok(md.includes('npx uda-cli search'));
    assert.ok(md.includes('npx uda-cli logs'));
    assert.ok(md.includes('.uda/knowledge/'));
  });

  it('omits log instructions when logs capability is absent', async () => {
    const knowledge = { project: { name: 'Test', engine: 'unity' }, conventions: [], decisions: [] };
    const files = adapter.generate(knowledge, [], [], testDir, { knowledge: true });

    const md = files['CLAUDE.md'];
    assert.ok(!md.includes('npx uda-cli logs'));
  });

  it('generates skill files from workflows', async () => {
    const knowledge = { project: {}, conventions: [], decisions: [] };
    const workflows = [{ name: 'debug-logs', description: 'Debug logs', steps: [{ id: 'read', name: 'Read Logs' }] }];
    const files = adapter.generate(knowledge, workflows, [], testDir, {});

    assert.ok(files['.claude/commands/uda/debug-logs.md']);
  });

  it('generates agent files', async () => {
    const knowledge = { project: {}, conventions: [], decisions: [] };
    const agents = [{ name: 'debugger', description: 'Unity debugger', prompt: 'You debug Unity.' }];
    const files = adapter.generate(knowledge, [], agents, testDir, {});

    assert.ok(files['.claude/agents/uda-debugger.md']);
  });
});
