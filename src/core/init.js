// src/core/init.js
import { mkdir, writeFile, access } from 'fs/promises';
import { udaPaths } from './constants.js';

const DEFAULT_CONFIG = {
  version: '0.1.0',
  language: 'en',
  adapters: ['claude', 'cursor', 'windsurf', 'agents-md', 'raw'],
  plugins: [],
  rag: {
    embedding_model: 'Xenova/all-MiniLM-L6-v2',
    chunk_size: 512,
    chunk_overlap: 50,
  },
};

const INITIAL_STATE = `# Project State

## Last Updated: ${new Date().toISOString().split('T')[0]}

## Active Work
Initializing...

## Completed
- [x] UDA initialized

## Decisions
(Architectural decisions will be recorded here)
`

export async function initProject(root) {
  const paths = udaPaths(root);

  // Create all directories
  const dirs = [
    paths.root,
    paths.knowledge.root,
    paths.knowledge.engine,
    paths.knowledge.project,
    paths.knowledge.community,
    paths.workflows,
    paths.agents,
    paths.state.root,
    paths.state.features,
    paths.state.history,
    paths.rag.root,
    paths.rag.lancedb,
    paths.rag.cache,
    paths.plugins,
    paths.generated,
  ];

  for (const dir of dirs) {
    await mkdir(dir, { recursive: true });
  }

  // Create config.json (skip if exists)
  const configExists = await fileExists(paths.config);
  if (!configExists) {
    await writeFile(paths.config, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }

  // Create initial state
  const stateExists = await fileExists(paths.state.current);
  if (!stateExists) {
    await writeFile(paths.state.current, INITIAL_STATE);
  }

  // Create .gitignore for rag and generated
  const gitignorePath = `${paths.root}/.gitignore`;
  const gitignoreExists = await fileExists(gitignorePath);
  if (!gitignoreExists) {
    await writeFile(gitignorePath, 'rag/\n.generated/\n');
  }

  return paths;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
