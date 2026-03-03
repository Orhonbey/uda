// src/commands/learn.js
import { resolve } from 'path';
import { stat } from 'fs/promises';
import { RagManager } from '../rag/manager.js';
import { udaPaths } from '../core/constants.js';

export async function handleLearn(source, options) {
  const paths = udaPaths(process.cwd());
  const rag = new RagManager(paths.rag.lancedb);
  await rag.init();

  const sourcePath = resolve(source);
  const info = await stat(sourcePath);

  if (info.isFile()) {
    const count = await rag.learnFile(sourcePath, {
      type: options.type || 'knowledge',
      tags: options.tags ? options.tags.split(',') : [],
    });
    console.log(`✔ Learned ${count} chunks from ${source}`);
  } else {
    console.error('✘ Source must be a file path');
    process.exit(1);
  }
}
