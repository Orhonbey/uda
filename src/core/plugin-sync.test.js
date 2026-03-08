// src/core/plugin-sync.test.js
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { initProject } from './init.js'
import { udaPaths } from './constants.js'
import { syncPluginsToConfig } from './plugin-sync.js'

describe('syncPluginsToConfig', () => {
  let tempDir
  
  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'uda-test-'))
    await initProject(tempDir)
  })
  
  it('adds physically present plugin to config.plugins', async () => {
    const paths = udaPaths(tempDir)
    await writeFile(join(paths.plugins, 'unity.json'), '{}')
    
    const result = await syncPluginsToConfig(tempDir)
    
    const config = JSON.parse(await readFile(paths.config, 'utf8'))
    assert.deepStrictEqual(result.added, ['unity'])
    assert.deepStrictEqual(result.removed, [])
    assert.deepStrictEqual(config.plugins, ['unity'])
  })
  
  it('does not duplicate already synced plugins', async () => {
    const paths = udaPaths(tempDir)
    await writeFile(join(paths.plugins, 'unity.json'), '{}')
    
    await syncPluginsToConfig(tempDir)
    const result = await syncPluginsToConfig(tempDir)
    
    const config = JSON.parse(await readFile(paths.config, 'utf8'))
    assert.deepStrictEqual(result.added, [])
    assert.deepStrictEqual(result.removed, [])
    assert.deepStrictEqual(config.plugins, ['unity'])
  })
  
  it('removes config entry when plugin file is deleted', async () => {
    const paths = udaPaths(tempDir)
    await writeFile(join(paths.plugins, 'unity.json'), '{}')
    await syncPluginsToConfig(tempDir)
    
    await rm(join(paths.plugins, 'unity.json'))
    const result = await syncPluginsToConfig(tempDir)
    
    const config = JSON.parse(await readFile(paths.config, 'utf8'))
    assert.deepStrictEqual(result.added, [])
    assert.deepStrictEqual(result.removed, ['unity'])
    assert.deepStrictEqual(config.plugins, [])
  })
})
