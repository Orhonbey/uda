// src/commands/clean.test.js — Integration tests for clean command
import { describe, it, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import { mkdtemp, rm, writeFile, readdir, mkdir, access } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { initProject } from '../core/init.js'
import { udaPaths } from '../core/constants.js'

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

describe('handleClean integration', () => {
  let testDir, paths, originalCwd

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-clean-int-'))
    paths = udaPaths(testDir)
    originalCwd = process.cwd()
  })

  after(async () => {
    process.chdir(originalCwd)
    process.exitCode = 0
    await rm(testDir, { recursive: true, force: true })
  })

  beforeEach(async () => {
    process.exitCode = 0
    // Clean and recreate test dir
    process.chdir(originalCwd)
    await rm(testDir, { recursive: true, force: true })
    await mkdir(testDir, { recursive: true })
    process.chdir(testDir)
  })

  it('errors when .uda/ does not exist', async () => {
    const { handleClean } = await import('./clean.js')
    await handleClean({ force: true })
    assert.strictEqual(process.exitCode, 1)
  })

  it('removes .uda/ directory with --force', async () => {
    await initProject(testDir)
    assert.strictEqual(await exists('.uda'), true)

    const { handleClean } = await import('./clean.js')
    await handleClean({ force: true })

    assert.strictEqual(process.exitCode, 0)
    assert.strictEqual(await exists('.uda'), false)
  })

  it('removes adapter files with --force', async () => {
    await initProject(testDir)

    // Create adapter files
    await writeFile('CLAUDE.md', '# Claude')
    await writeFile('.cursorrules', '# Cursor')
    await writeFile('AGENTS.md', '# Agents')
    await mkdir('.claude/commands/uda', { recursive: true })
    await writeFile('.claude/commands/uda/test.md', '# Test')
    await mkdir('.claude/agents', { recursive: true })
    await writeFile('.claude/agents/uda-architect.md', '# Architect')

    const { handleClean } = await import('./clean.js')
    await handleClean({ force: true })

    assert.strictEqual(await exists('CLAUDE.md'), false)
    assert.strictEqual(await exists('.cursorrules'), false)
    assert.strictEqual(await exists('AGENTS.md'), false)
    assert.strictEqual(await exists('.claude/commands/uda'), false)
    assert.strictEqual(await exists('.claude/agents/uda-architect.md'), false)
  })

  it('does not touch non-UDA files', async () => {
    await initProject(testDir)

    // Create custom files that should NOT be deleted
    await mkdir('.claude/agents', { recursive: true })
    await writeFile('.claude/agents/custom-agent.md', '# Custom')
    await mkdir('.claude/commands/custom', { recursive: true })
    await writeFile('.claude/commands/custom/cmd.md', '# Custom Cmd')

    const { handleClean } = await import('./clean.js')
    await handleClean({ force: true })

    // Custom files should still exist
    assert.strictEqual(await exists('.claude/agents/custom-agent.md'), true)
    assert.strictEqual(await exists('.claude/commands/custom/cmd.md'), true)
  })
})
