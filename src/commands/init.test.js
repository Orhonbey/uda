// src/commands/init.test.js — Integration tests for handleInit
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readFile, access, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { udaPaths } from '../core/constants.js';

describe('handleInit integration', () => {
  let testDir, paths, originalCwd;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-init-int-'));
    paths = udaPaths(testDir);
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  after(async () => {
    process.chdir(originalCwd);
    process.exitCode = 0;
    await rm(testDir, { recursive: true, force: true });
  });

  beforeEach(() => { process.exitCode = 0; });

  it('creates .uda directory structure and config', async () => {
    const { handleInit } = await import('./init.js');
    await handleInit({});

    // Verify directory structure
    await access(paths.root);
    await access(paths.knowledge.root);
    await access(paths.knowledge.engine);
    await access(paths.knowledge.project);
    await access(paths.workflows);
    await access(paths.agents);
    await access(paths.state.root);
    await access(paths.rag.root);
    await access(paths.plugins);
    await access(paths.generated);

    // Verify config.json
    const config = JSON.parse(await readFile(paths.config, 'utf8'));
    assert.strictEqual(config.version, '0.1.0');
    assert.ok(Array.isArray(config.adapters));
    assert.ok(Array.isArray(config.plugins));
  });

  it('creates initial state file', async () => {
    const content = await readFile(paths.state.current, 'utf8');
    assert.ok(content.includes('# Project State'));
  });

  it('preserves existing config on re-init', async () => {
    const configBefore = await readFile(paths.config, 'utf8');
    const { handleInit } = await import('./init.js');
    await handleInit({});
    const configAfter = await readFile(paths.config, 'utf8');
    assert.strictEqual(configBefore, configAfter);
  });

  it('rejects invalid engine option', async () => {
    const { handleInit } = await import('./init.js');
    await handleInit({ engine: 'invalid-engine-xyz' });
    assert.strictEqual(process.exitCode, 1);
  });

  it('accepts valid engine option', async () => {
    process.exitCode = 0;
    const dir2 = await mkdtemp(join(tmpdir(), 'uda-init-eng-'));
    const savedCwd = process.cwd();
    process.chdir(dir2);
    const { handleInit } = await import('./init.js');
    await handleInit({ engine: 'unity', skipPlugin: true });
    assert.notStrictEqual(process.exitCode, 1);
    process.chdir(savedCwd);
    await rm(dir2, { recursive: true, force: true });
  });
})

describe('handleInit profile and config', () => {
  let testDir, originalCwd

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-init-profile-'))
    originalCwd = process.cwd()
    process.chdir(testDir)
  })

  after(async () => {
    process.chdir(originalCwd)
    process.exitCode = 0
    await rm(testDir, { recursive: true, force: true })
  })

  beforeEach(() => { process.exitCode = 0 })

  it('creates profile.md with Project and Engine fields', async () => {
    const { handleInit } = await import('./init.js')
    await handleInit({ skipPlugin: true })
    
    const profilePath = join(testDir, '.uda', 'knowledge', 'project', 'profile.md')
    const content = await readFile(profilePath, 'utf8')
    
    assert.ok(content.includes('Project:'), 'Profile should contain Project field')
    assert.ok(content.includes('Engine:'), 'Profile should contain Engine field')
  })

  it('saves engine to config.json', async () => {
    // Create a Unity project marker
    await mkdir(join(testDir, 'ProjectSettings'), { recursive: true })
    await writeFile(join(testDir, 'ProjectSettings', 'ProjectVersion.txt'), '2022.3')
    
    const { handleInit } = await import('./init.js')
    await handleInit({ skipPlugin: true })
    
    const configPath = join(testDir, '.uda', 'config.json')
    const config = JSON.parse(await readFile(configPath, 'utf8'))
    
    assert.strictEqual(config.engine, 'unity', 'Config should have engine field set to unity')
  })

  it('creates enriched profile with engine version for Unity', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'uda-init-profile-'))
    const psDir = join(projectDir, 'ProjectSettings')
    await mkdir(psDir, { recursive: true })
    await writeFile(
      join(psDir, 'ProjectVersion.txt'),
      'm_EditorVersion: 2022.3.17f1\nm_EditorVersionWithRevision: 2022.3.17f1 (abc123)'
    )
    const assetsDir = join(projectDir, 'Assets')
    await mkdir(join(assetsDir, 'Scripts'), { recursive: true })
    await mkdir(join(assetsDir, 'Scenes'), { recursive: true })
    await mkdir(join(assetsDir, 'Prefabs'), { recursive: true })

    process.chdir(projectDir)
    process.exitCode = 0
    const { handleInit } = await import('./init.js')
    await handleInit({ engine: 'unity', skipPlugin: true })

    const profilePath = join(projectDir, '.uda', 'knowledge', 'project', 'profile.md')
    const content = await readFile(profilePath, 'utf8')

    assert.ok(content.includes('2022.3.17f1'), 'should contain Unity version')
    assert.ok(content.includes('Scripts'), 'should list Assets subdirectories')

    await rm(projectDir, { recursive: true, force: true })
  })
})
