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
      JSON.stringify({ time: '2026-03-06T10:00:00Z', type: 'Error', message: 'NullRef', stack: 'at PlayerController.cs:42' }),
      JSON.stringify({ time: '2026-03-06T10:00:01Z', type: 'Warning', message: 'Shader not found', stack: '' }),
      JSON.stringify({ time: '2026-03-06T10:00:02Z', type: 'Log', message: 'Game started', stack: '' }),
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

  it('reads trace log entries with --trace flag', async () => {
    const logsDir = join(testDir, '.uda', 'logs');
    await mkdir(logsDir, { recursive: true });
    const entries = [
      JSON.stringify({ time: '2026-03-06T10:00:00Z', type: 'state', message: 'Idle to Attack', stack: '' }),
      JSON.stringify({ time: '2026-03-06T10:00:01Z', type: 'perf', message: 'frame took 45ms', stack: '' }),
    ];
    await writeFile(join(logsDir, 'trace.jsonl'), entries.join('\n'));

    const { handleLogs } = await import('./logs.js?t=trace');
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));
    await handleLogs({ trace: true });
    console.log = origLog;
    assert.ok(output.some(l => l.includes('Idle to Attack')));
    assert.ok(output.some(l => l.includes('frame took 45ms')));
  });

  it('filters trace logs by channel', async () => {
    const { handleLogs } = await import('./logs.js?t=channel');
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));
    await handleLogs({ channel: 'state' });
    console.log = origLog;
    assert.ok(output.some(l => l.includes('Idle to Attack')));
    assert.ok(!output.some(l => l.includes('frame took 45ms')));
  });

  it('shows message when no trace logs exist', async () => {
    // Create a fresh temp directory without trace logs
    const freshDir = await mkdtemp(join(tmpdir(), 'uda-logs-fresh-'));
    await initProject(freshDir);
    const prevCwd = process.cwd();
    process.chdir(freshDir);

    const { handleLogs } = await import('./logs.js?t=no-trace');
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));
    await handleLogs({ trace: true });
    console.log = origLog;
    process.chdir(prevCwd);
    await rm(freshDir, { recursive: true, force: true });
    assert.ok(output.some(l => l.includes('No trace logs found')));
  });
});
