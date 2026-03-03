import { pipeline } from '@xenova/transformers';

export class Embedder {
  constructor(modelName = 'Xenova/all-MiniLM-L6-v2') {
    this.modelName = modelName;
    this.extractor = null;
  }

  async init() {
    if (!this.extractor) {
      this.extractor = await pipeline('feature-extraction', this.modelName);
    }
  }

  async embed(text) {
    await this.init();
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  async embedBatch(texts) {
    await this.init();
    const results = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }
}
