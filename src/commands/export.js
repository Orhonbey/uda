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
import { validateExportFormat } from '../core/validators.js';

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

  // Validate format
  const fv = validateExportFormat(format);
  if (!fv.valid) {
    console.error(`✘ ${fv.error}`);
    process.exitCode = 1;
    return;
  }

  const createAdapter = ADAPTER_MAP[format];
  if (!createAdapter) {
    console.error(`✘ Unknown format "${format}". Available: ${Object.keys(ADAPTER_MAP).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  let adapter, knowledge, workflows, agents;
  try {
    adapter = createAdapter();
    knowledge = await loadKnowledge(paths);
    workflows = await loadWorkflows(paths);
    agents = await loadAgents(paths);
  } catch (err) {
    console.error(`✘ Failed to load knowledge base: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  let files;
  try {
    files = adapter.generate(knowledge, workflows, agents, root);
  } catch (err) {
    console.error(`✘ Failed to generate ${format} output: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  // Determine output base directory
  const outputBase = options.output || join(paths.generated, format);

  let totalFiles = 0;
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(outputBase, filePath);
    try {
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content);
      totalFiles++;
    } catch (err) {
      console.error(`  ✘ Failed to write ${filePath}: ${err.message}`);
    }
  }

  console.log(`✔ Exported ${totalFiles} files (${format}) → ${outputBase}`);
}
