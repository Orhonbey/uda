// src/commands/scan.js
import { readdir, stat, readFile, writeFile } from 'fs/promises'
import { join, relative, extname } from 'path';
import { RagManager } from '../rag/manager.js';
import { udaPaths } from '../core/constants.js';
import { syncPluginsToConfig } from '../core/plugin-sync.js';
import { loadConfig } from '../core/config.js'
import { generateProjectDocs, generateCodebaseDocs } from '../core/project-analyzer.js'

export async function handleScan(options = {}) {
  const root = process.cwd();
  const paths = udaPaths(root);

  let files = []
  let totalChunks = 0

  // RAG init + Knowledge scan
  if (!options.analyzeOnly) {
    let rag;
    try {
      rag = new RagManager(paths.rag.lancedb);
      await rag.init();
    } catch (err) {
      console.error(`✘ Failed to initialize RAG engine: ${err.message}`);
      process.exitCode = 1;
      return;
    }

    // Sync plugins to config (self-healing)
    try {
      const syncResult = await syncPluginsToConfig(root)
      if (syncResult.added.length > 0) {
        console.log('  Config synced: added ' + syncResult.added.join(', '))
      }
    } catch { /* non-critical */ }

    // Scan .uda/knowledge directory
    const knowledgeDir = paths.knowledge.root;
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
  }

  // Project analysis
  if (!options.knowledgeOnly) {
    try {
      const config = await loadConfig(root)
      if (config.engine) {
        console.log('\nAnalyzing project...')
        const analysis = await generateProjectDocs(root, config.engine, paths)
        console.log('  structure.md (' + analysis.scriptCount + ' scripts, ' + analysis.scenes.length + ' scenes)')

        const classCount = await generateCodebaseDocs(root, config.engine, paths)
        if (classCount) {
          console.log('  codebase.md (' + classCount + ' classes)')
        }
      } else if (options.analyzeOnly) {
        console.log('No engine configured. Run: uda config engine <name>')
      }
    } catch (err) {
      console.error('  Project analysis failed: ' + err.message)
    }
  }

  // Update state/current.md
  try {
    const statePath = paths.state.current
    const stateContent = `# UDA State

Last Scan: ${new Date().toISOString().split('T')[0]}
Knowledge Files: ${files.length}
RAG Chunks: ${totalChunks}
`
    await writeFile(statePath, stateContent)
  } catch { /* non-critical */ }
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
