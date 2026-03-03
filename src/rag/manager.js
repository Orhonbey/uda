// src/rag/manager.js
import { readFile } from 'fs/promises';
import { basename } from 'path';
import { chunkMarkdown } from './chunker.js';
import { Embedder } from './embedder.js';
import { VectorStore } from './store.js';

export class RagManager {
  constructor(dbPath) {
    this.embedder = new Embedder();
    this.store = new VectorStore(dbPath);
  }

  async init() {
    await this.embedder.init();
    await this.store.init();
  }

  async learnFile(filePath, options = {}) {
    const content = await readFile(filePath, 'utf8');
    const source = options.source || basename(filePath);
    const chunks = chunkMarkdown(content, { source, ...options });

    await this._indexChunks(chunks);
    return chunks.length;
  }

  async learnText(text, options = {}) {
    const chunks = chunkMarkdown(text, { source: 'manual', ...options });
    await this._indexChunks(chunks);
    return chunks.length;
  }

  async search(query, limit = 5) {
    const queryVector = await this.embedder.embed(query);
    return await this.store.search(queryVector, limit);
  }

  async _indexChunks(chunks) {
    const documents = [];

    for (const chunk of chunks) {
      const vector = await this.embedder.embed(chunk.content);
      documents.push({
        id: `${chunk.metadata.source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        content: chunk.content,
        vector,
        metadata: chunk.metadata,
      });
    }

    if (documents.length > 0) {
      await this.store.add(documents);
    }
  }
}
