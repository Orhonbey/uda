import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';

describe('handleLogs', () => {
  let testDir, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-logs-'));
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

  it('shows message when no log files exist', async () => {
    const { handleLogs } = await import('./logs.js');
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));
    await handleLogs({});
    console.log = origLog;
    assert.ok(output.some(l => l.includes('No log files found')));
  });

  it('reads and displays log entries', async () => {
    const logsDir = join(testDir, '.uda', 'logs');
    await mkdir(logsDir, { recursive: true });
    const entries = [
      JSON.stringify({ timestamp: '2026-03-06T10:00:00Z', level: 'Error', message: 'NullRef', stackTrace: 'at PlayerController.cs:42' }),
      JSON.stringify({ timestamp: '2026-03-06T10:00:01Z', level: 'Warning', message: 'Shader not found', stackTrace: '' }),
      JSON.stringify({ timestamp: '2026-03-06T10:00:02Z', level: 'Log', message: 'Game started', stackTrace: '' }),
    ];
    await writeFile(join(logsDir, 'console.jsonl'), entries.join('\n'));

    const { handleLogs } = await import('./logs.js?t=display');
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));
    await handleLogs({});
    console.log = origLog;
    assert.ok(output.some(l => l.includes('NullRef')));
    assert.ok(output.some(l => l.includes('Game started')));
  });

  it('filters errors only with --errors flag', async () => {
    const { handleLogs } = await import('./logs.js?t=errors');
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));
    await handleLogs({ errors: true });
    console.log = origLog;
    assert.ok(output.some(l => l.includes('NullRef')));
    assert.ok(!output.some(l => l.includes('Game started')));
  });

  it('filters warnings with --warnings flag', async () => {
    const { handleLogs } = await import('./logs.js?t=warnings');
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));
    await handleLogs({ warnings: true });
    console.log = origLog;
    assert.ok(output.some(l => l.includes('Shader not found')));
    assert.ok(!output.some(l => l.includes('Game started')));
  });

  it('limits output with --last flag', async () => {
    const { handleLogs } = await import('./logs.js?t=last');
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));
    await handleLogs({ last: '1' });
    console.log = origLog;
    // Should only show last entry
    const logLines = output.filter(l => l.includes('['));
    assert.ok(logLines.length <= 2); // header + 1 entry max
  });
});
