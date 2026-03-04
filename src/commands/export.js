// src/commands/export.js
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { udaPaths } from '../core/constants.js';
import { loadConfig } from '../core/config.js';
import { loadKnowledge, loadWorkflows, loadAgents } from '../core/knowledge-loader.js';
import { ClaudeAdapter } from '../adapters/claude.js';
import { CursorAdapter } from '../adapters/cursor.js';
import { RawAdapter } from '../adapters/raw.js';
import { AgentsMdAdapter } from '../adapters/agents-md.js';

const ADAPTER_MAP = {
  claude: () => new ClaudeAdapter(),
  cursor: () => new CursorAdapter(),
  'agents-md': () => new AgentsMdAdapter(),
  raw: () => new RawAdapter(),
};

export async function handleExport(options) {
  const root = process.cwd();
  const paths = udaPaths(root);
  const format = options.format;

  const createAdapter = ADAPTER_MAP[format];
  if (!createAdapter) {
    console.log(`✘ Unknown format "${format}". Available: ${Object.keys(ADAPTER_MAP).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const adapter = createAdapter();
  const knowledge = await loadKnowledge(paths);
  const workflows = await loadWorkflows(paths);
  const agents = await loadAgents(paths);

  const files = adapter.generate(knowledge, workflows, agents, root);

  // Determine output base directory
  const outputBase = options.output || join(paths.generated, format);

  let totalFiles = 0;
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(outputBase, filePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content);
    totalFiles++;
  }

  console.log(`✔ Exported ${totalFiles} files (${format}) → ${outputBase}`);
}
