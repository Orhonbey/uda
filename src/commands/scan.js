// src/commands/scan.js
import { readdir, stat, readFile } from 'fs/promises';
import { join, relative, extname } from 'path';
import { RagManager } from '../rag/manager.js';
import { udaPaths } from '../core/constants.js';

export async function handleScan() {
  const root = process.cwd();
  const paths = udaPaths(root);
  const rag = new RagManager(paths.rag.lancedb);
  await rag.init();

  // Scan .uda/knowledge directory
  const knowledgeDir = paths.knowledge.root;
  const files = await collectMdFiles(knowledgeDir);

  let totalChunks = 0;
  for (const file of files) {
    const relPath = relative(root, file);
    const count = await rag.learnFile(file, { source: relPath });
    totalChunks += count;
    console.log(`  ✔ ${relPath} (${count} chunks)`);
  }

  console.log(`\n✔ Scan complete: ${files.length} files, ${totalChunks} chunks indexed`);
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
  } catch {
    // Directory doesn't exist
  }
  return results;
}
