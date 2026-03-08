// src/commands/scan.test.js — Integration tests for handleScan
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

describe('handleScan integration', { timeout: 60_000 }, () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-scan-int-'));
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

  it('reports no files when knowledge directory is empty', async () => {
    const { handleScan } = await import('./scan.js');
    await handleScan();
    // Should not error — just reports no markdown files
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('scans markdown files in knowledge directory', async () => {
    // Add a markdown file to knowledge
    await writeFile(
      join(paths.knowledge.project, 'test-doc.md'),
      '# Test Document\n\nSome content for testing scan functionality.'
    );

    const { handleScan } = await import('./scan.js');
    await handleScan();
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('scans nested knowledge directories', async () => {
    const nestedDir = join(paths.knowledge.engine, 'unity');
    await mkdir(nestedDir, { recursive: true });
    await writeFile(
      join(nestedDir, 'lifecycle.md'),
      '# MonoBehaviour Lifecycle\n\nAwake, Start, Update, FixedUpdate'
    );

    const { handleScan } = await import('./scan.js');
    await handleScan();
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('updates state/current.md after scan', async () => {
    await writeFile(
      join(paths.knowledge.project, 'state-test.md'),
      '# State Test\n\nContent for state update test.'
    )

    const { handleScan } = await import('./scan.js')
    await handleScan()

    const statePath = join(testDir, '.uda', 'state', 'current.md')
    const content = await readFile(statePath, 'utf8')

    assert.ok(content.includes('Last Scan:'), 'State should show last scan date')
    assert.ok(content.includes('Knowledge Files:'), 'State should show file count')
    assert.ok(content.includes('RAG Chunks:'), 'State should show chunk count')
  })
});
