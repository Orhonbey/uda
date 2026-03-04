// src/commands/export.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, mkdir, writeFile, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { handleExport } from './export.js';
import { udaPaths } from '../core/constants.js';

describe('handleExport', () => {
  let testDir;
  let paths;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-export-test-'));
    paths = udaPaths(testDir);
    
    // Create .uda structure
    await mkdir(paths.knowledge.project, { recursive: true });
    await mkdir(paths.knowledge.engine, { recursive: true });
    await mkdir(paths.workflows, { recursive: true });
    await mkdir(paths.agents, { recursive: true });
    await mkdir(paths.generated, { recursive: true });
    
    // Create config.json
    await writeFile(
      paths.config,
      JSON.stringify({ version: '0.1.0', adapters: ['claude', 'cursor'] })
    );
    
    // Create project profile
    await writeFile(
      join(paths.knowledge.project, 'profile.md'),
      `# Project Profile\n\nProject: TestGame\nEngine: unity\nVersion: 2022.3`
    );
    
    // Create decisions file
    await writeFile(
      join(paths.knowledge.project, 'decisions.md'),
      `- Using Singleton pattern for managers\n- Dependency injection for services`
    );
  });

  after(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('exports to claude format', async () => {
    process.chdir(testDir);
    
    await handleExport({ format: 'claude', output: join(testDir, 'output-claude') });
    
    const files = await readdir(join(testDir, 'output-claude'));
    assert.ok(files.includes('CLAUDE.md'), 'Should generate CLAUDE.md');
    
    const content = await readFile(join(testDir, 'output-claude', 'CLAUDE.md'), 'utf8');
    assert.ok(content.includes('TestGame'), 'Should include project name');
    assert.ok(content.includes('unity'), 'Should include engine');
  });

  it('exports to cursor format', async () => {
    process.chdir(testDir);
    
    await handleExport({ format: 'cursor', output: join(testDir, 'output-cursor') });
    
    const files = await readdir(join(testDir, 'output-cursor'));
    assert.ok(files.includes('.cursorrules'), 'Should generate .cursorrules');
    
    const content = await readFile(join(testDir, 'output-cursor', '.cursorrules'), 'utf8');
    assert.ok(content.includes('TestGame'), 'Should include project name');
  });

  it('exports to agents-md format', async () => {
    process.chdir(testDir);
    
    await handleExport({ format: 'agents-md', output: join(testDir, 'output-agents') });
    
    const files = await readdir(join(testDir, 'output-agents'));
    assert.ok(files.includes('AGENTS.md'), 'Should generate AGENTS.md');
    
    const content = await readFile(join(testDir, 'output-agents', 'AGENTS.md'), 'utf8');
    assert.ok(content.includes('AGENTS.md'), 'Should have AGENTS.md header');
  });

  it('exports to raw format', async () => {
    process.chdir(testDir);
    
    await handleExport({ format: 'raw', output: join(testDir, 'output-raw') });
    
    const files = await readdir(join(testDir, 'output-raw', '.uda', '.generated'));
    assert.ok(files.includes('full-context.md'), 'Should generate full-context.md');
    
    const content = await readFile(join(testDir, 'output-raw', '.uda', '.generated', 'full-context.md'), 'utf8');
    assert.ok(content.includes('TestGame'), 'Should include project name');
  });

  it('rejects unknown format', async () => {
    process.chdir(testDir);
    
    const originalExitCode = process.exitCode;
    process.exitCode = 0;
    
    await handleExport({ format: 'unknown-format' });
    
    assert.strictEqual(process.exitCode, 1, 'Should set exit code to 1');
    process.exitCode = originalExitCode;
  });

  it('uses default output path when not specified', async () => {
    process.chdir(testDir);
    
    await handleExport({ format: 'claude' });
    
    const defaultOutput = join(paths.generated, 'claude');
    const files = await readdir(defaultOutput);
    assert.ok(files.includes('CLAUDE.md'), 'Should generate CLAUDE.md in default location');
  });
});
