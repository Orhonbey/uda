// src/commands/learn.test.js — Integration tests for handleLearn
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, writeFile, readFile } from 'fs/promises'
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from '../core/init.js';
import { udaPaths } from '../core/constants.js';

describe('handleLearn integration', { timeout: 60_000 }, () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-learn-int-'));
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

  it('learns a markdown file successfully', async () => {
    const mdFile = join(testDir, 'doc.md');
    await writeFile(mdFile, '# Test Doc\n\nThis is test content for learning.');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(mdFile, {});
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('reports error for non-existent file', async () => {
    const { handleLearn } = await import('./learn.js');
    await handleLearn('/tmp/does-not-exist-abc123.md', {});
    assert.strictEqual(process.exitCode, 1);
  });

  it('reports error for empty file', async () => {
    const emptyFile = join(testDir, 'empty.md');
    await writeFile(emptyFile, '');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(emptyFile, {});
    assert.strictEqual(process.exitCode, 1);
  });

  it('reports error for directory as source', async () => {
    const { handleLearn } = await import('./learn.js');
    await handleLearn(testDir, {});
    assert.strictEqual(process.exitCode, 1);
  });

  it('accepts type option', async () => {
    const mdFile = join(testDir, 'typed-doc.md');
    await writeFile(mdFile, '# Typed Doc\n\nContent with type annotation.');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(mdFile, { type: 'knowledge' });
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('accepts tags option', async () => {
    const mdFile = join(testDir, 'tagged-doc.md');
    await writeFile(mdFile, '# Tagged Doc\n\nContent with tags.');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(mdFile, { tags: 'unity,lifecycle' });
    assert.notStrictEqual(process.exitCode, 1);
  });

  it('warns about non-markdown files', async () => {
    const txtFile = join(testDir, 'doc.txt');
    await writeFile(txtFile, 'Plain text content for testing.');

    const { handleLearn } = await import('./learn.js');
    await handleLearn(txtFile, {});
    // Should not error — just warns
    assert.notStrictEqual(process.exitCode, 1);
  })

  it('copies file to knowledge/project/ with --type project', async () => {
    const mdFile = join(testDir, 'architecture.md')
    await writeFile(mdFile, '# Architecture\n\nCharacter system uses ECS pattern.')

    const { handleLearn } = await import('./learn.js')
    await handleLearn(mdFile, { type: 'project' })
    assert.notStrictEqual(process.exitCode, 1)

    const destPath = join(paths.knowledge.project, 'architecture.md')
    const content = await readFile(destPath, 'utf8')
    assert.ok(content.includes('Character system'))
  })

  it('copies file to knowledge/project/patterns/ with --type pattern', async () => {
    const mdFile = join(testDir, 'singleton.md')
    await writeFile(mdFile, '# Singleton Pattern\n\nUsed in GameManager.')

    const { handleLearn } = await import('./learn.js')
    await handleLearn(mdFile, { type: 'pattern' })
    assert.notStrictEqual(process.exitCode, 1)

    const destPath = join(paths.knowledge.project, 'patterns', 'singleton.md')
    const content = await readFile(destPath, 'utf8')
    assert.ok(content.includes('Singleton'))
  })

  it('copies file to knowledge/project/bugs/ with --type bug', async () => {
    const mdFile = join(testDir, 'null-ref-fix.md')
    await writeFile(mdFile, '# NullRef in Player\n\nFixed by null check.')

    const { handleLearn } = await import('./learn.js')
    await handleLearn(mdFile, { type: 'bug' })
    assert.notStrictEqual(process.exitCode, 1)

    const destPath = join(paths.knowledge.project, 'bugs', 'null-ref-fix.md')
    const content = await readFile(destPath, 'utf8')
    assert.ok(content.includes('NullRef'))
  })

  it('learns from text content with --stdin flag', async () => {
    const { handleLearn } = await import('./learn.js')
    await handleLearn(null, {
      stdin: true,
      name: 'char-system',
      type: 'project',
      _stdinContent: 'CharacterSystem uses MonoBehaviour with Singleton pattern.'
    })
    assert.notStrictEqual(process.exitCode, 1)

    const destPath = join(paths.knowledge.project, 'char-system.md')
    const content = await readFile(destPath, 'utf8')
    assert.ok(content.includes('CharacterSystem'))
  })

  it('overwrites existing file when same name is learned again', async () => {
    const { handleLearn } = await import('./learn.js')
    await handleLearn(null, {
      stdin: true,
      name: 'overwrite-test',
      type: 'project',
      _stdinContent: '# Version 1\n\nOld content.',
    })

    await handleLearn(null, {
      stdin: true,
      name: 'overwrite-test',
      type: 'project',
      _stdinContent: '# Version 2\n\nNew content.',
    })

    const destPath = join(paths.knowledge.project, 'overwrite-test.md')
    const content = await readFile(destPath, 'utf8')
    assert.ok(content.includes('Version 2'), 'should have new content')
    assert.ok(!content.includes('Version 1'), 'should not have old content')
  })
})
