// src/commands/search.js
import { RagManager } from '../rag/manager.js';
import { udaPaths } from '../core/constants.js';
import { validateSearchQuery, validatePositiveInt, validateSearchFormat } from '../core/validators.js';

export async function handleSearch(query, options) {
  // Validate search query
  const qv = validateSearchQuery(query);
  if (!qv.valid) {
    console.error(`✘ ${qv.error}`);
    process.exitCode = 1;
    return;
  }

  // Validate --top option
  const tv = validatePositiveInt(options.top, '--top');
  if (!tv.valid) {
    console.error(`✘ ${tv.error}`);
    process.exitCode = 1;
    return;
  }

  // Validate --format option
  if (options.format) {
    const fv = validateSearchFormat(options.format);
    if (!fv.valid) {
      console.error(`✘ ${fv.error}`);
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

  const limit = tv.value;

  let results;
  try {
    results = await rag.search(query, limit);
  } catch (err) {
    console.error(`✘ Search failed: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (results.length === 0) {
    console.log('No results found.');
    return;
  }

  results.forEach((r, i) => {
    const distance = typeof r.score === 'number' && !isNaN(r.score) ? r.score : 0;
    const score = (1 - distance).toFixed(2); // convert distance to similarity
    console.log(`\n${i + 1}. [${(score * 100).toFixed(0)}%] ${r.source || 'unknown'}`);
    console.log(`   ${(r.content || '').slice(0, 120)}...`);
    const tags = Array.isArray(r.tags) ? r.tags : [];
    if (tags.length > 0) console.log(`   Tags: ${tags.join(', ')}`);
  });
}
