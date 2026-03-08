// src/core/plugin-sync.js
import { readdir } from 'fs/promises'
import { extname } from 'path'
import { loadConfig, saveConfig } from './config.js'
import { udaPaths } from './constants.js'

export async function syncPluginsToConfig(root) {
  const paths = udaPaths(root)
  
  // Read physical plugin files
  let physicalPlugins = []
  try {
    const entries = await readdir(paths.plugins, { withFileTypes: true })
    physicalPlugins = entries
      .filter(e => e.isFile() && extname(e.name) === '.json')
      .map(e => e.name.slice(0, -5)) // Remove .json extension
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    // plugins dir doesn't exist, treat as empty
  }
  
  // Read config
  const config = await loadConfig(root)
  const configPlugins = config.plugins || []
  
  // Calculate differences
  const physicalSet = new Set(physicalPlugins)
  const configSet = new Set(configPlugins)
  
  const added = physicalPlugins.filter(p => !configSet.has(p))
  const removed = configPlugins.filter(p => !physicalSet.has(p))
  
  // Update config if needed
  if (added.length > 0 || removed.length > 0) {
    config.plugins = physicalPlugins
    await saveConfig(root, config)
  }
  
  return { added, removed }
}
