// src/commands/learn.js
import { resolve, extname, basename, join } from 'path'
import { stat, readFile, copyFile, mkdir } from 'fs/promises'
import { RagManager } from '../rag/manager.js';
import { udaPaths } from '../core/constants.js';
import { validateLearnType } from '../core/validators.js';

export async function handleLearn(source, options) {
  // Guard against missing source argument
  if (!source || (typeof source === 'string' && source.trim() === '')) {
    console.error('✘ Source file path is required.');
    process.exitCode = 1;
    return;
  }

  // Validate learn type if provided
  if (options.type) {
    const tv = validateLearnType(options.type);
    if (!tv.valid) {
      console.error(`✘ ${tv.error}`);
      process.exitCode = 1;
      return;
    }
  }

  const paths = udaPaths(process.cwd());

  let rag;
  try {
    rag = new RagManager(paths.rag.lancedb);
    await rag.init();
  } catch (err) {
    console.error(`✘ Failed to initialize RAG engine: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const sourcePath = resolve(source);

  let info;
  try {
    info = await stat(sourcePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`✘ File not found: ${sourcePath}`);
    } else {
      console.error(`✘ Cannot access file "${sourcePath}": ${err.message}`);
    }
    process.exitCode = 1;
    return;
  }

  if (!info.isFile()) {
    console.error(`✘ Source must be a file path, not a directory: ${sourcePath}`);
    process.exitCode = 1;
    return;
  }

  // Warn if file is not markdown
  const ext = extname(sourcePath).toLowerCase();
  if (ext && ext !== '.md' && ext !== '.markdown') {
    console.log(`⚠ Warning: "${source}" is not a markdown file. Results may vary.`);
  }

  // Check for empty files
  if (info.size === 0) {
    console.error(`✘ File is empty: ${sourcePath}`);
    process.exitCode = 1;
    return;
  }

  try {
    const count = await rag.learnFile(sourcePath, {
      type: options.type || 'knowledge',
      tags: options.tags ? options.tags.split(',') : [],
    })
    // Copy to knowledge subdirectory based on type
    const type = options.type || 'knowledge'
    if (['project', 'pattern', 'bug'].includes(type)) {
      const destDir = type === 'project'
        ? paths.knowledge.project
        : join(paths.knowledge.project, type === 'pattern' ? 'patterns' : 'bugs')
      await mkdir(destDir, { recursive: true })
      await copyFile(sourcePath, join(destDir, basename(sourcePath)))
    }
    console.log(`✔ Learned ${count} chunks from ${source}`);
  } catch (err) {
    console.error(`✘ Failed to learn from "${source}": ${err.message}`);
    process.exitCode = 1;
  }
}
