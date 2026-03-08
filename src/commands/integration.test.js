import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

describe('UDA v0.2.0 end-to-end', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-e2e-'));
    paths = udaPaths(testDir);
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Init project
    await initProject(testDir);

    // Simulate plugin install: add knowledge, workflows, agents, capabilities
    await writeFile(join(paths.workflows, 'debug-logs.yaml'), [
      'name: debug-logs',
      'description: Analyze Unity console logs and fix errors',
      'steps:',
      '  - id: read',
      '    name: Read Logs',
      '    questions:',
      '      - Run npx uda-cli logs --errors --last 50',
    ].join('\n'));

    await writeFile(join(paths.agents, 'debugger.md'), [
      '---',
      'name: unity-debugger',
      'description: Unity debugging expert',
      'tools: Read, Grep, Glob, Bash',
      '---',
      '',
      'You are a Unity debugging expert. Use `npx uda-cli logs` to read console logs.',
    ].join('\n'));

    await mkdir(paths.plugins, { recursive: true });
    await writeFile(join(paths.plugins, 'unity.json'), JSON.stringify({
      name: 'uda-unity',
      engine: 'unity',
      capabilities: {
        logs: { source: '.uda/logs/console.jsonl' },
        knowledge: true,
        workflows: true,
        agents: true,
      },
    }));

    // Add log entries
    await mkdir(paths.logs, { recursive: true });
    await writeFile(join(paths.logs, 'console.jsonl'), [
      JSON.stringify({ time: '2026-03-06T10:00:00Z', type: 'Error', message: 'NullReferenceException', stack: 'at Player.Update()' }),
    ].join('\n'));
  });

  after(async () => {
    process.chdir(originalCwd);
    process.exitCode = 0;
    await rm(testDir, { recursive: true, force: true });
  });

  it('sync generates CLAUDE.md with full UDA instructions', async () => {
    const { handleSync } = await import('./sync.js?t=e2e');
    await handleSync();

    const claudeMd = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');

    // Has UDA section
    assert.ok(claudeMd.includes('UDA (Universal Dev AI)'));
    // Has knowledge instructions
    assert.ok(claudeMd.includes('.uda/knowledge/'));
    // Has log instructions (capability present)
    assert.ok(claudeMd.includes('npx uda-cli logs'));
    // Has search command
    assert.ok(claudeMd.includes('npx uda-cli search'));
    // Has skill reference
    assert.ok(claudeMd.includes('/uda:debug-logs'));
  });

  it('sync generates Claude skill files', async () => {
    const skill = await readFile(join(testDir, '.claude', 'commands', 'uda', 'debug-logs.md'), 'utf8');
    assert.ok(skill.includes('debug-logs'));
  });

  it('sync generates Claude agent files', async () => {
    const agent = await readFile(join(testDir, '.claude', 'agents', 'uda-unity-debugger.md'), 'utf8');
    assert.ok(agent.includes('Unity debugging expert'));
  });

  it('logs command reads and filters log entries', async () => {
    const { handleLogs } = await import('./logs.js?t=e2e2');
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));
    await handleLogs({ errors: true, last: '10' });
    console.log = origLog;

    assert.ok(output.some(l => l.includes('NullReferenceException')));
  });
});
