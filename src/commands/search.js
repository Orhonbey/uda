// src/commands/search.js
import { RagManager } from '../rag/manager.js';
import { udaPaths } from '../core/constants.js';

export async function handleSearch(query, options) {
  const paths = udaPaths(process.cwd());
  const rag = new RagManager(paths.rag.lancedb);
  await rag.init();

  const limit = parseInt(options.top, 10) || 5;
  const results = await rag.search(query, limit);

  if (results.length === 0) {
    console.log('No results found.');
    return;
  }

  results.forEach((r, i) => {
    const score = (1 - r.score).toFixed(2); // convert distance to similarity
    console.log(`\n${i + 1}. [${(score * 100).toFixed(0)}%] ${r.source}`);
    console.log(`   ${r.content.slice(0, 120)}...`);
    if (r.tags.length > 0) console.log(`   Tags: ${r.tags.join(', ')}`);
  });
}
