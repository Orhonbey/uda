// src/commands/status.js
import { readFile, readdir, access } from 'fs/promises'
import { join } from 'path'
import { udaPaths } from '../core/constants.js'
import { loadConfig } from '../core/config.js'
import { VectorStore } from '../rag/store.js'

export async function handleStatus() {
  const root = process.cwd()
  const paths = udaPaths(root)

  // Check if UDA is initialized
  try {
    await access(paths.config)
  } catch {
    console.error('UDA is not initialized. Run uda init first.')
    process.exitCode = 1
    return
  }

  let config
  try {
    config = await loadConfig(root)
  } catch (err) {
    console.error('Failed to read config file: ' + err.message)
    process.exitCode = 1
    return
  }
  console.log('UDA v' + (config.version || 'unknown') + '\n')

  // Knowledge breakdown
  console.log('Knowledge Base:')
  const engineCount = await countMdFiles(paths.knowledge.engine)
  const projectCount = await countMdFiles(paths.knowledge.project)
  const communityCount = await countMdFiles(paths.knowledge.community)
  console.log('  Engine:    ' + (engineCount > 0 ? engineCount + ' files' : 'empty'))
  console.log('  Project:   ' + (projectCount > 0 ? projectCount + ' files' : 'empty'))
  console.log('  Community: ' + (communityCount > 0 ? communityCount + ' files' : 'no plugins installed'))

  // Plugins
  try {
    const pluginFiles = await readdir(paths.plugins)
    const plugins = pluginFiles.filter(f => f.endsWith('.json'))
    console.log('\nPlugins: ' + (plugins.length > 0 ? plugins.map(f => f.replace('.json', '')).join(', ') : 'none'))
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('\nPlugins: none')
    } else {
      console.error('Plugins: failed to read (' + err.message + ')')
    }
  }

  // RAG stats
  try {
    const store = new VectorStore(paths.rag.lancedb)
    await store.init()
    const count = await store.count()
    console.log('RAG index: ' + count + ' chunks')
  } catch (err) {
    if (err.code === 'ENOENT' || err.message?.includes('Table') || err.message?.includes('does not exist')) {
      console.log('RAG index: not initialized')
    } else {
      console.error('RAG index: failed to read (' + err.message + ')')
    }
  }

  // Adapters
  const adapters = Array.isArray(config.adapters) ? config.adapters : []
  console.log('Adapters: ' + (adapters.length > 0 ? adapters.join(', ') : 'none configured'))

  // State (minimal - just last scan date)
  try {
    const state = await readFile(paths.state.current, 'utf8')
    const scanMatch = state.match(/Last Scan:\s*(.+)/)
    if (scanMatch && scanMatch[1] !== 'none') {
      console.log('\nLast Scan: ' + scanMatch[1])
    }
  } catch { /* no state file */ }
}

async function countMdFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true, recursive: true })
    return entries.filter(e => e.isFile() && e.name.endsWith('.md')).length
  } catch {
    return 0
  }
}
