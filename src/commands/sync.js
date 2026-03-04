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
  const config = await loadConfig(root);
  const knowledge = await loadKnowledge(paths);
  const workflows = await loadWorkflows(paths);
  const agents = await loadAgents(paths);

  // Determine which adapters to run
  const activeAdapters = config.adapters
    ? ALL_ADAPTERS.filter(a => config.adapters.includes(a.name))
    : ALL_ADAPTERS;

  let totalFiles = 0;

  for (const adapter of activeAdapters) {
    const files = adapter.generate(knowledge, workflows, agents, root);
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = join(root, filePath);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content);
      totalFiles++;
    }
    console.log(`  ✔ ${adapter.name} adapter — ${Object.keys(files).length} files`);
  }

  console.log(`\n✔ Sync complete: ${totalFiles} files generated`);
}

