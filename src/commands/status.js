// src/commands/status.js
import { readFile, readdir, access } from 'fs/promises';
import { join } from 'path';
import { udaPaths } from '../core/constants.js';
import { loadConfig } from '../core/config.js';
import { VectorStore } from '../rag/store.js';

export async function handleStatus() {
  const root = process.cwd();
  const paths = udaPaths(root);

  // Check if UDA is initialized
  try {
    await access(paths.config);
  } catch {
    console.error('✘ UDA is not initialized. Run `uda init` first.');
    process.exitCode = 1;
    return;
  }

  let config;
  try {
    config = await loadConfig(root);
  } catch (err) {
    console.error(`✘ Failed to read config file: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`UDA v${config.version || 'unknown'}\n`);

  // Plugins
  try {
    const pluginFiles = await readdir(paths.plugins);
    const plugins = pluginFiles.filter(f => f.endsWith('.json'));
    console.log(`Plugins: ${plugins.length > 0 ? plugins.map(f => f.replace('.json', '')).join(', ') : 'none'}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('Plugins: none');
    } else {
      console.error(`Plugins: failed to read (${err.message})`);
    }
  }

  // RAG stats
  try {
    const store = new VectorStore(paths.rag.lancedb);
    await store.init();
    const count = await store.count();
    console.log(`RAG index: ${count} chunks`);
  } catch (err) {
    if (err.code === 'ENOENT' || err.message?.includes('Table') || err.message?.includes('does not exist')) {
      console.log('RAG index: not initialized');
    } else {
      console.error(`RAG index: failed to read (${err.message})`);
    }
  }

  // Adapters
  const adapters = Array.isArray(config.adapters) ? config.adapters : [];
  console.log(`Adapters: ${adapters.length > 0 ? adapters.join(', ') : 'none configured'}`);

  // State
  try {
    const state = await readFile(paths.state.current, 'utf8');
    const lines = state.split('\n').slice(0, 5).join('\n');
    console.log(`\n--- Current State ---\n${lines}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('\nNo state file.');
    } else {
      console.error(`\n✘ Failed to read state file: ${err.message}`);
    }
  }
}
