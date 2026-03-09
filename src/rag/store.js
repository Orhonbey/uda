import * as lancedb from '@lancedb/lancedb';

export class VectorStore {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.table = null;
    this.tableName = 'knowledge';
  }

  async init() {
    this.db = await lancedb.connect(this.dbPath);

    try {
      this.table = await this.db.openTable(this.tableName);
    } catch (err) {
      // Table doesn't exist yet — will be created on first add
      this.table = null;
      if (err.message && !err.message.includes('does not exist') && !err.message.includes('not found') && !err.message.includes('was not found')) {
        console.error(`Warning: Unexpected error opening table "${this.tableName}": ${err.message}`);
      }
    }
  }

  async add(documents) {
    const rows = documents.map((doc) => ({
      id: doc.id,
      content: doc.content,
      vector: doc.vector,
      source: doc.metadata?.source || '',
      engine: doc.metadata?.engine || '',
      type: doc.metadata?.type || 'knowledge',
      tags: JSON.stringify(doc.metadata?.tags || []),
      date: doc.metadata?.date || new Date().toISOString().split('T')[0],
    }));

    if (!this.table) {
      this.table = await this.db.createTable(this.tableName, rows);
    } else {
      await this.table.add(rows);
    }
  }

  async search(queryVector, limit = 5) {
    if (!this.table) return [];

    const results = await this.table
      .vectorSearch(queryVector)
      .limit(limit)
      .toArray();

    return results.map((row) => ({
      id: row.id,
      content: row.content,
      source: row.source,
      engine: row.engine,
      type: row.type,
      tags: parseTags(row.tags),
      score: row._distance,
    }));
  }

  async count() {
    if (!this.table) return 0;
    return await this.table.countRows();
  }

  async deleteBySource(source) {
    if (!this.table) return 0
    const before = await this.table.countRows()
    await this.table.delete('source = "' + source + '"')
    const after = await this.table.countRows()
    return before - after
  }
}

function parseTags(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
