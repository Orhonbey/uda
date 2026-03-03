// src/commands/sync.js
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { udaPaths } from '../core/constants.js';
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
  const config = JSON.parse(await readFile(paths.config, 'utf8'));
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

async function loadKnowledge(paths) {
  // Minimal implementation — reads project profile if exists
  const knowledge = { project: {}, conventions: [], decisions: [] };

  try {
    const profile = await readFile(join(paths.knowledge.project, 'profile.md'), 'utf8');
    // Simple parse — extract key-value pairs from markdown
    const nameMatch = profile.match(/Project:\s*(.+)/i);
    const engineMatch = profile.match(/Engine:\s*(.+)/i);
    if (nameMatch) knowledge.project.name = nameMatch[1].trim();
    if (engineMatch) knowledge.project.engine = engineMatch[1].trim();
  } catch { /* no profile yet */ }

  try {
    const decisions = await readFile(join(paths.knowledge.project, 'decisions.md'), 'utf8');
    knowledge.decisions = decisions.split('\n')
      .filter(l => l.startsWith('- '))
      .map(l => l.slice(2));
  } catch { /* no decisions yet */ }

  return knowledge;
}

async function loadWorkflows(paths) {
  // Will load YAML files in Phase 5 — for now return empty
  return [];
}

async function loadAgents(paths) {
  // Will load agent markdown files — for now return empty
  return [];
}
