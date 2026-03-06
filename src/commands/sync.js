// src/commands/sync.js
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { udaPaths } from '../core/constants.js';
import { loadConfig } from '../core/config.js';
import { loadKnowledge, loadWorkflows, loadAgents } from '../core/knowledge-loader.js';
import { ClaudeAdapter } from '../adapters/claude.js';
import { CursorAdapter } from '../adapters/cursor.js';
import { RawAdapter } from '../adapters/raw.js';
import { AgentsMdAdapter } from '../adapters/agents-md.js';

const ALL_ADAPTERS = [
  new ClaudeAdapter(),
  new CursorAdapter(),
  new RawAdapter(),
  new AgentsMdAdapter(),
];

export async function handleSync() {
  const root = process.cwd();
  const paths = udaPaths(root);

  // Load knowledge from .uda/
  let config, knowledge, workflows, agents;
  try {
    config = await loadConfig(root);
    knowledge = await loadKnowledge(paths);
    workflows = await loadWorkflows(paths);
    agents = await loadAgents(paths);
  } catch (err) {
    console.error(`✘ Failed to load project data: ${err.message}`);
    console.error('  Run `uda init` to initialize the project.');
    process.exitCode = 1;
    return;
  }

  // Determine which adapters to run
  const adapterList = Array.isArray(config.adapters) ? config.adapters : [];
  const activeAdapters = adapterList.length > 0
    ? ALL_ADAPTERS.filter(a => adapterList.includes(a.name))
    : ALL_ADAPTERS;

  if (activeAdapters.length === 0) {
    console.log('No matching adapters found. Check config.adapters setting.');
    return;
  }

  let totalFiles = 0;

  for (const adapter of activeAdapters) {
    try {
      const files = adapter.generate(knowledge, workflows, agents, root);
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = join(root, filePath);
        await mkdir(dirname(fullPath), { recursive: true });
        await writeFile(fullPath, content);
        totalFiles++;
      }
      console.log(`  ✔ ${adapter.name} adapter — ${Object.keys(files).length} files`);
    } catch (err) {
      console.error(`  ✘ ${adapter.name} adapter failed: ${err.message}`);
    }
  }

  console.log(`\n✔ Sync complete: ${totalFiles} files generated`);
}

