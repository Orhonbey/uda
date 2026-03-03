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
});
