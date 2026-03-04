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
    console.log('✘ UDA is not initialized. Run `uda init` first.');
    return;
  }

  const config = await loadConfig(root);
  console.log(`UDA v${config.version}\n`);

  // Plugins
  try {
    const pluginFiles = await readdir(paths.plugins);
    const plugins = pluginFiles.filter(f => f.endsWith('.json'));
    console.log(`Plugins: ${plugins.length > 0 ? plugins.map(f => f.replace('.json', '')).join(', ') : 'none'}`);
  } catch {
    console.log('Plugins: none');
  }

  // RAG stats
  try {
    const store = new VectorStore(paths.rag.lancedb);
    await store.init();
    const count = await store.count();
    console.log(`RAG index: ${count} chunks`);
  } catch {
    console.log('RAG index: not initialized');
  }

  // Adapters
  console.log(`Adapters: ${config.adapters.join(', ')}`);

  // State
  try {
    const state = await readFile(paths.state.current, 'utf8');
    const lines = state.split('\n').slice(0, 5).join('\n');
    console.log(`\n--- Current State ---\n${lines}`);
  } catch {
    console.log('\nNo state file.');
  }
}
