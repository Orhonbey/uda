// src/commands/scan.js
import { readdir, stat, readFile, writeFile } from 'fs/promises'
import { join, relative, extname } from 'path';
import { RagManager } from '../rag/manager.js';
import { udaPaths } from '../core/constants.js';

export async function handleScan() {
  const root = process.cwd();
  const paths = udaPaths(root);

  let rag;
  try {
    rag = new RagManager(paths.rag.lancedb);
    await rag.init();
  } catch (err) {
    console.error(`✘ Failed to initialize RAG engine: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  // Scan .uda/knowledge directory
  const knowledgeDir = paths.knowledge.root;
  let files;
  try {
    files = await collectMdFiles(knowledgeDir);
  } catch (err) {
    console.error(`✘ Failed to collect files from knowledge directory: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (files.length === 0) {
    console.log('No markdown files found in knowledge directory.');
    console.log('  Add .md files to .uda/knowledge/ or install a plugin.');
    return;
  }

  let totalChunks = 0;
  for (const file of files) {
    const relPath = relative(root, file);
    try {
      const count = await rag.learnFile(file, { source: relPath });
      totalChunks += count;
      console.log(`  ✔ ${relPath} (${count} chunks)`);
    } catch (err) {
      console.error(`  ✘ Failed to index ${relPath}: ${err.message}`);
    }
  }

  console.log(`\n✔ Scan complete: ${files.length} files, ${totalChunks} chunks indexed`)

  // Update state/current.md
  try {
    const statePath = paths.state.current
    const stateContent = `# Project State

## Last Updated: ${new Date().toISOString().split('T')[0]}

## Active Work
Project indexed. ${files.length} knowledge files, ${totalChunks} chunks in RAG.

## Completed
- [x] UDA initialized
- [x] Knowledge base scanned

## Decisions
(Architectural decisions will be recorded here)
`
    await writeFile(statePath, stateContent)
  } catch { /* non-critical, don't fail scan for state update */ }
}

async function collectMdFiles(dir) {
  const results = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...await collectMdFiles(fullPath));
      } else if (extname(entry.name) === '.md') {
        results.push(fullPath);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`✘ Failed to read directory ${dir}: ${err.message}`);
    }
  }
  return results;
}
