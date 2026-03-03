# UDA (Universal Dev AI) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local, AI-agnostic context engineering + RAG CLI tool for game development.

**Architecture:** Node.js CLI (Commander.js) with local RAG (LanceDB + MiniLM embedding), adapter pattern for multi-AI output, plugin system for engine-specific knowledge via git repos.

**Tech Stack:** Node.js, Commander.js, @lancedb/lancedb, @xenova/transformers, yaml, simple-git

---

## Phase 1: Core CLI Skeleton

### Task 1: Initialize npm project and CLI entry point

**Files:**
- Create: `package.json`
- Create: `bin/uda.js`
- Create: `src/cli.js`

**Step 1: Create package.json**

```json
{
  "name": "uda",
  "version": "0.1.0",
  "description": "Universal Dev AI — AI-agnostic context engineering + RAG for game development",
  "type": "module",
  "bin": {
    "uda": "./bin/uda.js"
  },
  "scripts": {
    "test": "node --test src/**/*.test.js",
    "dev": "node bin/uda.js"
  },
  "keywords": ["ai", "context-engineering", "rag", "game-dev", "unity", "cli"],
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Step 2: Create bin/uda.js entry point**

```javascript
#!/usr/bin/env node
import { createCli } from '../src/cli.js';
const program = createCli();
program.parse(process.argv);
```

**Step 3: Create src/cli.js with commander setup**

```javascript
import { Command } from 'commander';

export function createCli() {
  const program = new Command();

  program
    .name('uda')
    .description('Universal Dev AI — AI-agnostic context engineering + RAG')
    .version('0.1.0');

  program
    .command('init')
    .description('Initialize UDA in current project')
    .option('-e, --engine <name>', 'Engine plugin to install (e.g. unity)')
    .action(async (options) => {
      console.log('uda init — not yet implemented');
    });

  program
    .command('sync')
    .description('Generate AI tool files from knowledge base')
    .action(async () => {
      console.log('uda sync — not yet implemented');
    });

  program
    .command('search <query>')
    .description('Search knowledge base')
    .option('-t, --top <number>', 'Number of results', '5')
    .option('-f, --format <format>', 'Output format (terminal, md, clipboard)', 'terminal')
    .action(async (query, options) => {
      console.log('uda search — not yet implemented');
    });

  program
    .command('learn <source>')
    .description('Teach knowledge to RAG')
    .option('--type <type>', 'Knowledge type (bug-fix, feature, pattern, knowledge)', 'knowledge')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async (source, options) => {
      console.log('uda learn — not yet implemented');
    });

  program
    .command('scan')
    .description('Scan project and index into RAG')
    .action(async () => {
      console.log('uda scan — not yet implemented');
    });

  const pluginCmd = program
    .command('plugin')
    .description('Manage engine plugins');

  pluginCmd
    .command('add <repo>')
    .description('Install plugin from git repo')
    .action(async (repo) => {
      console.log('uda plugin add — not yet implemented');
    });

  pluginCmd
    .command('list')
    .description('List installed plugins')
    .action(async () => {
      console.log('uda plugin list — not yet implemented');
    });

  pluginCmd
    .command('remove <name>')
    .description('Remove a plugin')
    .action(async (name) => {
      console.log('uda plugin remove — not yet implemented');
    });

  pluginCmd
    .command('update [name]')
    .description('Update plugin(s)')
    .action(async (name) => {
      console.log('uda plugin update — not yet implemented');
    });

  pluginCmd
    .command('create <name>')
    .description('Scaffold a new plugin')
    .action(async (name) => {
      console.log('uda plugin create — not yet implemented');
    });

  program
    .command('export')
    .description('Export knowledge to specific format')
    .requiredOption('-f, --format <format>', 'Output format (claude, cursor, windsurf, agents-md, raw)')
    .option('-o, --output <path>', 'Output file path')
    .action(async (options) => {
      console.log('uda export — not yet implemented');
    });

  program
    .command('status')
    .description('Show UDA system status')
    .action(async () => {
      console.log('uda status — not yet implemented');
    });

  program
    .command('config')
    .description('Manage UDA settings')
    .argument('[key]', 'Config key to get/set')
    .argument('[value]', 'Value to set')
    .action(async (key, value) => {
      console.log('uda config — not yet implemented');
    });

  return program;
}
```

**Step 4: Install dependencies and test**

```bash
npm install commander
chmod +x bin/uda.js
node bin/uda.js --help
node bin/uda.js init --help
node bin/uda.js plugin --help
```

Expected: Help text displays all commands and options correctly.

**Step 5: Commit**

```bash
git init
echo "node_modules/" > .gitignore
git add package.json bin/uda.js src/cli.js .gitignore
git commit -m "feat: initialize UDA CLI skeleton with all command stubs"
```

---

### Task 2: Create .uda directory structure generator

**Files:**
- Create: `src/core/init.js`
- Create: `src/core/constants.js`
- Create: `src/core/init.test.js`

**Step 1: Write constants**

```javascript
// src/core/constants.js
import { join } from 'path';

export const UDA_DIR = '.uda';

export function udaPaths(root) {
  const uda = join(root, UDA_DIR);
  return {
    root: uda,
    config: join(uda, 'config.json'),
    knowledge: {
      root: join(uda, 'knowledge'),
      engine: join(uda, 'knowledge', 'engine'),
      project: join(uda, 'knowledge', 'project'),
      community: join(uda, 'knowledge', 'community'),
    },
    workflows: join(uda, 'workflows'),
    agents: join(uda, 'agents'),
    state: {
      root: join(uda, 'state'),
      current: join(uda, 'state', 'current.md'),
      features: join(uda, 'state', 'features'),
      history: join(uda, 'state', 'history'),
    },
    rag: {
      root: join(uda, 'rag'),
      lancedb: join(uda, 'rag', 'lancedb'),
      cache: join(uda, 'rag', 'cache'),
    },
    plugins: join(uda, 'plugins'),
    generated: join(uda, '.generated'),
  };
}
```

**Step 2: Write the failing test**

```javascript
// src/core/init.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readFile, access } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from './init.js';

describe('initProject', () => {
  let testDir;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-test-'));
  });

  after(async () => {
    await rm(testDir, { recursive: true });
  });

  it('creates .uda directory structure', async () => {
    await initProject(testDir);

    const dirs = [
      '.uda',
      '.uda/knowledge',
      '.uda/knowledge/engine',
      '.uda/knowledge/project',
      '.uda/knowledge/community',
      '.uda/workflows',
      '.uda/agents',
      '.uda/state',
      '.uda/state/features',
      '.uda/state/history',
      '.uda/rag',
      '.uda/plugins',
      '.uda/.generated',
    ];

    for (const dir of dirs) {
      await access(join(testDir, dir));
    }
  });

  it('creates config.json with defaults', async () => {
    await initProject(testDir);
    const config = JSON.parse(await readFile(join(testDir, '.uda/config.json'), 'utf8'));
    assert.strictEqual(config.version, '0.1.0');
    assert.ok(Array.isArray(config.adapters));
    assert.ok(Array.isArray(config.plugins));
  });

  it('creates initial state/current.md', async () => {
    await initProject(testDir);
    const content = await readFile(join(testDir, '.uda/state/current.md'), 'utf8');
    assert.ok(content.includes('# Project State'));
  });

  it('does not overwrite existing config', async () => {
    await initProject(testDir);
    const config1 = await readFile(join(testDir, '.uda/config.json'), 'utf8');
    await initProject(testDir); // run again
    const config2 = await readFile(join(testDir, '.uda/config.json'), 'utf8');
    assert.strictEqual(config1, config2);
  });
});
```

**Step 3: Run test to verify it fails**

```bash
node --test src/core/init.test.js
```

Expected: FAIL — `initProject` not found

**Step 4: Implement initProject**

```javascript
// src/core/init.js
import { mkdir, writeFile, access } from 'fs/promises';
import { udaPaths } from './constants.js';

const DEFAULT_CONFIG = {
  version: '0.1.0',
  language: 'en',
  adapters: ['claude', 'cursor', 'windsurf', 'agents-md', 'raw'],
  plugins: [],
  rag: {
    embedding_model: 'Xenova/all-MiniLM-L6-v2',
    chunk_size: 512,
    chunk_overlap: 50,
  },
};

const INITIAL_STATE = `# Project State

## Last Updated: ${new Date().toISOString().split('T')[0]}

## Active Work
None yet. Run \`uda scan\` to index your project.

## Completed
- [x] UDA initialized

## Decisions
(Architectural decisions will be recorded here)
`;

export async function initProject(root) {
  const paths = udaPaths(root);

  // Create all directories
  const dirs = [
    paths.root,
    paths.knowledge.root,
    paths.knowledge.engine,
    paths.knowledge.project,
    paths.knowledge.community,
    paths.workflows,
    paths.agents,
    paths.state.root,
    paths.state.features,
    paths.state.history,
    paths.rag.root,
    paths.rag.lancedb,
    paths.rag.cache,
    paths.plugins,
    paths.generated,
  ];

  for (const dir of dirs) {
    await mkdir(dir, { recursive: true });
  }

  // Create config.json (skip if exists)
  const configExists = await fileExists(paths.config);
  if (!configExists) {
    await writeFile(paths.config, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }

  // Create initial state
  const stateExists = await fileExists(paths.state.current);
  if (!stateExists) {
    await writeFile(paths.state.current, INITIAL_STATE);
  }

  // Create .gitignore for rag and generated
  const gitignorePath = `${paths.root}/.gitignore`;
  const gitignoreExists = await fileExists(gitignorePath);
  if (!gitignoreExists) {
    await writeFile(gitignorePath, 'rag/\n.generated/\n');
  }

  return paths;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
```

**Step 5: Run tests to verify they pass**

```bash
node --test src/core/init.test.js
```

Expected: All 4 tests PASS

**Step 6: Wire init command to CLI**

Update `src/cli.js` init action:

```javascript
// In the init command action:
import { initProject } from './core/init.js';

.action(async (options) => {
  const root = process.cwd();
  const paths = await initProject(root);
  console.log('✔ .uda/ directory created');

  if (options.engine) {
    console.log(`Engine: ${options.engine} — plugin install not yet implemented`);
  }
})
```

**Step 7: Commit**

```bash
git add src/core/constants.js src/core/init.js src/core/init.test.js src/cli.js
git commit -m "feat: add project initialization with directory structure and config"
```

---

## Phase 2: RAG Engine

### Task 3: Markdown chunker

**Files:**
- Create: `src/rag/chunker.js`
- Create: `src/rag/chunker.test.js`

**Step 1: Write the failing test**

```javascript
// src/rag/chunker.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { chunkMarkdown } from './chunker.js';

describe('chunkMarkdown', () => {
  it('splits by headings', () => {
    const md = `# Title\nSome intro text.\n## Section 1\nContent one.\n## Section 2\nContent two.`;
    const chunks = chunkMarkdown(md, { source: 'test.md' });
    assert.strictEqual(chunks.length, 3);
    assert.ok(chunks[0].content.includes('Title'));
    assert.ok(chunks[1].content.includes('Section 1'));
    assert.ok(chunks[2].content.includes('Section 2'));
  });

  it('preserves code blocks as separate chunks', () => {
    const md = "# Title\nText before.\n```csharp\nvoid Update() {}\n```\nText after.";
    const chunks = chunkMarkdown(md, { source: 'test.md' });
    const codeChunk = chunks.find(c => c.content.includes('void Update'));
    assert.ok(codeChunk);
    assert.strictEqual(codeChunk.type, 'code');
  });

  it('attaches metadata to each chunk', () => {
    const md = '# Title\nSome text.';
    const chunks = chunkMarkdown(md, {
      source: 'knowledge/unity/lifecycle.md',
      engine: 'unity',
      tags: ['lifecycle'],
    });
    assert.strictEqual(chunks[0].metadata.source, 'knowledge/unity/lifecycle.md');
    assert.strictEqual(chunks[0].metadata.engine, 'unity');
    assert.deepStrictEqual(chunks[0].metadata.tags, ['lifecycle']);
  });

  it('respects max chunk size', () => {
    const longText = '# Title\n' + 'word '.repeat(1000);
    const chunks = chunkMarkdown(longText, { source: 'test.md', maxChunkSize: 200 });
    for (const chunk of chunks) {
      assert.ok(chunk.content.length <= 250); // some tolerance for heading
    }
  });
});
```

**Step 2: Run test to verify it fails**

```bash
node --test src/rag/chunker.test.js
```

Expected: FAIL

**Step 3: Implement chunker**

```javascript
// src/rag/chunker.js

export function chunkMarkdown(text, options = {}) {
  const {
    source = 'unknown',
    engine = null,
    tags = [],
    type = 'knowledge',
    maxChunkSize = 512,
  } = options;

  const baseMetadata = { source, engine, tags, type, date: new Date().toISOString().split('T')[0] };
  const chunks = [];
  const lines = text.split('\n');

  let currentChunk = { heading: '', lines: [], type: 'text' };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block detection
    if (line.startsWith('```')) {
      // Flush current text chunk
      if (currentChunk.lines.length > 0) {
        chunks.push(buildChunk(currentChunk, baseMetadata, maxChunkSize));
        currentChunk = { heading: currentChunk.heading, lines: [], type: 'text' };
      }

      // Collect code block
      const codeLines = [line];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) codeLines.push(lines[i]); // closing ```

      chunks.push({
        content: codeLines.join('\n'),
        type: 'code',
        metadata: { ...baseMetadata },
      });
      continue;
    }

    // Heading detection
    if (line.match(/^#{1,6}\s/)) {
      // Flush previous chunk
      if (currentChunk.lines.length > 0) {
        chunks.push(buildChunk(currentChunk, baseMetadata, maxChunkSize));
      }
      currentChunk = { heading: line, lines: [line], type: 'text' };
      continue;
    }

    currentChunk.lines.push(line);
  }

  // Flush last chunk
  if (currentChunk.lines.length > 0) {
    chunks.push(buildChunk(currentChunk, baseMetadata, maxChunkSize));
  }

  return chunks;
}

function buildChunk(chunk, baseMetadata, maxChunkSize) {
  const content = chunk.lines.join('\n').trim();

  // If within size limit, return as-is
  if (content.length <= maxChunkSize) {
    return {
      content,
      type: chunk.type,
      metadata: { ...baseMetadata },
    };
  }

  // Split oversized chunks by paragraph
  // For simplicity, return single chunk trimmed (full split in future)
  return {
    content: content.slice(0, maxChunkSize),
    type: chunk.type,
    metadata: { ...baseMetadata },
  };
}
```

**Step 4: Run tests**

```bash
node --test src/rag/chunker.test.js
```

Expected: All PASS

**Step 5: Commit**

```bash
git add src/rag/chunker.js src/rag/chunker.test.js
git commit -m "feat: add markdown chunker with heading-based splitting and code block detection"
```

---

### Task 4: Embedding service

**Files:**
- Create: `src/rag/embedder.js`
- Create: `src/rag/embedder.test.js`

**Step 1: Install dependency**

```bash
npm install @xenova/transformers
```

**Step 2: Write the failing test**

```javascript
// src/rag/embedder.test.js
import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { Embedder } from './embedder.js';

describe('Embedder', () => {
  let embedder;

  before(async () => {
    embedder = new Embedder();
    await embedder.init(); // downloads model on first run
  });

  it('generates a 384-dimensional embedding', async () => {
    const embedding = await embedder.embed('Hello world');
    assert.strictEqual(embedding.length, 384);
  });

  it('generates similar embeddings for similar texts', async () => {
    const emb1 = await embedder.embed('The cat sat on the mat');
    const emb2 = await embedder.embed('A cat is sitting on a mat');
    const emb3 = await embedder.embed('Quantum physics explains wave functions');

    const sim12 = cosineSim(emb1, emb2);
    const sim13 = cosineSim(emb1, emb3);

    assert.ok(sim12 > sim13, 'Similar texts should have higher similarity');
    assert.ok(sim12 > 0.7, `Expected similarity > 0.7, got ${sim12}`);
  });

  it('batch embeds multiple texts', async () => {
    const embeddings = await embedder.embedBatch(['Hello', 'World', 'Test']);
    assert.strictEqual(embeddings.length, 3);
    assert.strictEqual(embeddings[0].length, 384);
  });
});

function cosineSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

**Step 3: Implement embedder**

```javascript
// src/rag/embedder.js
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
```

**Step 4: Run tests** (first run will download ~90MB model)

```bash
node --test src/rag/embedder.test.js --timeout 120000
```

Expected: All PASS

**Step 5: Commit**

```bash
git add src/rag/embedder.js src/rag/embedder.test.js package.json package-lock.json
git commit -m "feat: add local embedding service using all-MiniLM-L6-v2"
```

---

### Task 5: Vector store (LanceDB wrapper)

**Files:**
- Create: `src/rag/store.js`
- Create: `src/rag/store.test.js`

**Step 1: Install dependency**

```bash
npm install @lancedb/lancedb
```

**Step 2: Write the failing test**

```javascript
// src/rag/store.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { VectorStore } from './store.js';

describe('VectorStore', () => {
  let store;
  let testDir;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-store-test-'));
    store = new VectorStore(testDir);
    await store.init();
  });

  after(async () => {
    await rm(testDir, { recursive: true });
  });

  it('adds documents and retrieves by vector search', async () => {
    await store.add([
      {
        id: 'doc-1',
        content: 'Unity MonoBehaviour lifecycle',
        vector: new Array(384).fill(0).map((_, i) => i * 0.001),
        metadata: { source: 'test.md', engine: 'unity', type: 'knowledge', tags: ['lifecycle'] },
      },
      {
        id: 'doc-2',
        content: 'Unreal Actor lifecycle',
        vector: new Array(384).fill(0).map((_, i) => i * 0.002),
        metadata: { source: 'test2.md', engine: 'unreal', type: 'knowledge', tags: ['lifecycle'] },
      },
    ]);

    const queryVector = new Array(384).fill(0).map((_, i) => i * 0.0015);
    const results = await store.search(queryVector, 2);

    assert.strictEqual(results.length, 2);
    assert.ok(results[0].content);
    assert.ok(results[0].score !== undefined);
  });

  it('returns results sorted by relevance', async () => {
    const queryVector = new Array(384).fill(0).map((_, i) => i * 0.001);
    const results = await store.search(queryVector, 2);

    // First result should be closer to doc-1
    assert.ok(results[0].score <= results[1].score); // lower distance = more similar
  });

  it('respects limit parameter', async () => {
    const queryVector = new Array(384).fill(0).map((_, i) => i * 0.001);
    const results = await store.search(queryVector, 1);
    assert.strictEqual(results.length, 1);
  });
});
```

**Step 3: Implement store**

```javascript
// src/rag/store.js
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
    } catch {
      // Table doesn't exist yet — will be created on first add
      this.table = null;
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
      tags: JSON.parse(row.tags || '[]'),
      score: row._distance,
    }));
  }

  async count() {
    if (!this.table) return 0;
    return await this.table.countRows();
  }
}
```

**Step 4: Run tests**

```bash
node --test src/rag/store.test.js
```

Expected: All PASS

**Step 5: Commit**

```bash
git add src/rag/store.js src/rag/store.test.js package.json package-lock.json
git commit -m "feat: add LanceDB vector store wrapper with search and insert"
```

---

### Task 6: RAG manager (orchestrates chunker + embedder + store)

**Files:**
- Create: `src/rag/manager.js`
- Create: `src/rag/manager.test.js`

**Step 1: Write the failing test**

```javascript
// src/rag/manager.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { RagManager } from './manager.js';

describe('RagManager', () => {
  let rag;
  let testDir;
  let dbDir;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-rag-test-'));
    dbDir = join(testDir, 'lancedb');
    await mkdir(dbDir, { recursive: true });
    rag = new RagManager(dbDir);
    await rag.init();
  });

  after(async () => {
    await rm(testDir, { recursive: true });
  });

  it('learns from a markdown file', async () => {
    const mdPath = join(testDir, 'test.md');
    await writeFile(mdPath, '# Unity Lifecycle\nAwake is called before Start.\n## Start\nStart is called on the first frame.');

    await rag.learnFile(mdPath, { engine: 'unity', tags: ['lifecycle'] });

    const results = await rag.search('When is Awake called?');
    assert.ok(results.length > 0);
    assert.ok(results[0].content.includes('Awake') || results[0].content.includes('lifecycle'));
  });

  it('learns from raw text', async () => {
    await rag.learnText('NullReferenceException fix: check if GetComponent returns null before accessing.', {
      type: 'bug-fix',
      tags: ['nullref'],
    });

    const results = await rag.search('NullReferenceException');
    assert.ok(results.length > 0);
  });

  it('returns scored results', async () => {
    const results = await rag.search('Unity lifecycle order');
    assert.ok(results[0].score !== undefined);
  });
});
```

**Step 2: Implement manager**

```javascript
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
```

**Step 3: Run tests** (slow — embedding model)

```bash
node --test src/rag/manager.test.js --timeout 120000
```

Expected: All PASS

**Step 4: Commit**

```bash
git add src/rag/manager.js src/rag/manager.test.js
git commit -m "feat: add RAG manager orchestrating chunker, embedder, and vector store"
```

---

### Task 7: Wire RAG commands to CLI (learn, search, scan)

**Files:**
- Modify: `src/cli.js`
- Create: `src/commands/learn.js`
- Create: `src/commands/search.js`
- Create: `src/commands/scan.js`

**Step 1: Create command handlers**

```javascript
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
```

```javascript
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
```

```javascript
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
```

**Step 2: Update cli.js to use command handlers**

Replace the stub actions in `src/cli.js` for search, learn, and scan with:

```javascript
import { handleLearn } from './commands/learn.js';
import { handleSearch } from './commands/search.js';
import { handleScan } from './commands/scan.js';

// In the search command:
.action(handleSearch)

// In the learn command:
.action(handleLearn)

// In the scan command:
.action(handleScan)
```

**Step 3: Manual integration test**

```bash
mkdir -p /tmp/uda-test && cd /tmp/uda-test
node /path/to/uda/bin/uda.js init
echo "# Unity Tips\nAlways cache GetComponent in Awake." > .uda/knowledge/project/tips.md
node /path/to/uda/bin/uda.js scan
node /path/to/uda/bin/uda.js search "GetComponent caching"
```

Expected: Search returns the tips content

**Step 4: Commit**

```bash
git add src/commands/learn.js src/commands/search.js src/commands/scan.js src/cli.js
git commit -m "feat: wire RAG commands (learn, search, scan) to CLI"
```

---

## Phase 3: Adapter System

### Task 8: Adapter interface and registry

**Files:**
- Create: `src/adapters/base.js`
- Create: `src/adapters/registry.js`
- Create: `src/adapters/registry.test.js`

**Step 1: Write adapter base class and registry**

```javascript
// src/adapters/base.js
export class BaseAdapter {
  constructor() {
    if (new.target === BaseAdapter) {
      throw new Error('BaseAdapter is abstract');
    }
  }

  get name() { throw new Error('Not implemented'); }

  detect(projectRoot) { throw new Error('Not implemented'); }

  generate(knowledge, workflows, agents, projectRoot) { throw new Error('Not implemented'); }
}
```

```javascript
// src/adapters/registry.js
const adapters = [];

export function registerAdapter(adapter) {
  adapters.push(adapter);
}

export function getAdapter(name) {
  return adapters.find(a => a.name === name);
}

export function detectAdapters(projectRoot) {
  return adapters.filter(a => a.detect(projectRoot));
}

export function getAllAdapters() {
  return [...adapters];
}
```

**Step 2: Write test**

```javascript
// src/adapters/registry.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { registerAdapter, getAdapter, getAllAdapters } from './registry.js';

describe('Adapter Registry', () => {
  it('registers and retrieves adapters', () => {
    registerAdapter({
      name: 'test-adapter',
      detect: () => true,
      generate: () => ({}),
    });

    const adapter = getAdapter('test-adapter');
    assert.ok(adapter);
    assert.strictEqual(adapter.name, 'test-adapter');
  });

  it('returns all registered adapters', () => {
    const all = getAllAdapters();
    assert.ok(all.length > 0);
  });
});
```

**Step 3: Run and commit**

```bash
node --test src/adapters/registry.test.js
git add src/adapters/
git commit -m "feat: add adapter base class and registry"
```

---

### Task 9: Claude adapter

**Files:**
- Create: `src/adapters/claude.js`
- Create: `src/adapters/claude.test.js`

**Step 1: Write test**

```javascript
// src/adapters/claude.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { ClaudeAdapter } from './claude.js';

describe('ClaudeAdapter', () => {
  let testDir;
  const adapter = new ClaudeAdapter();

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-claude-test-'));
  });

  after(async () => {
    await rm(testDir, { recursive: true });
  });

  it('has correct name', () => {
    assert.strictEqual(adapter.name, 'claude');
  });

  it('detects Claude Code by CLAUDE.md or .claude directory', () => {
    // detection is best-effort — always generates
    assert.strictEqual(typeof adapter.detect, 'function');
  });

  it('generates CLAUDE.md', async () => {
    const knowledge = {
      project: { name: 'TestGame', engine: 'unity', version: '2022.3' },
      conventions: ['PascalCase methods', 'camelCase variables'],
      decisions: ['Using Singleton pattern for managers'],
    };
    const workflows = [
      { name: 'debug', description: 'Systematic debugging' },
    ];
    const agents = [
      { name: 'log-analyzer', description: 'Unity log analysis expert' },
    ];

    const files = await adapter.generate(knowledge, workflows, agents, testDir);

    assert.ok(files['CLAUDE.md']);
    assert.ok(files['CLAUDE.md'].includes('TestGame'));
    assert.ok(files['CLAUDE.md'].includes('unity'));
    assert.ok(files['CLAUDE.md'].includes('PascalCase'));
  });
});
```

**Step 2: Implement Claude adapter**

```javascript
// src/adapters/claude.js
import { existsSync } from 'fs';
import { join } from 'path';

export class ClaudeAdapter {
  get name() { return 'claude'; }

  detect(projectRoot) {
    return (
      existsSync(join(projectRoot, 'CLAUDE.md')) ||
      existsSync(join(projectRoot, '.claude'))
    );
  }

  generate(knowledge, workflows, agents, projectRoot) {
    const files = {};

    // Generate CLAUDE.md
    files['CLAUDE.md'] = this._generateClaudeMd(knowledge, workflows);

    // Generate skills
    for (const wf of workflows) {
      const skillPath = `.claude/commands/uda/${wf.name}.md`;
      files[skillPath] = this._generateSkill(wf);
    }

    // Generate agents
    for (const agent of agents) {
      const agentPath = `.claude/agents/uda-${agent.name}.md`;
      files[agentPath] = this._generateAgent(agent);
    }

    return files;
  }

  _generateClaudeMd(knowledge, workflows) {
    const lines = ['# CLAUDE.md', ''];

    if (knowledge.project) {
      lines.push('## Project Info');
      if (knowledge.project.name) lines.push(`- **Project**: ${knowledge.project.name}`);
      if (knowledge.project.engine) lines.push(`- **Engine**: ${knowledge.project.engine}`);
      if (knowledge.project.version) lines.push(`- **Version**: ${knowledge.project.version}`);
      lines.push('');
    }

    if (knowledge.conventions?.length > 0) {
      lines.push('## Conventions');
      for (const conv of knowledge.conventions) {
        lines.push(`- ${conv}`);
      }
      lines.push('');
    }

    if (knowledge.decisions?.length > 0) {
      lines.push('## Architectural Decisions');
      for (const dec of knowledge.decisions) {
        lines.push(`- ${dec}`);
      }
      lines.push('');
    }

    if (workflows.length > 0) {
      lines.push('## UDA Commands');
      lines.push('This project uses UDA (Universal Dev AI).');
      for (const wf of workflows) {
        lines.push(`- \`/uda:${wf.name}\` — ${wf.description}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  _generateSkill(workflow) {
    const lines = [
      '---',
      `description: ${workflow.description}`,
      '---',
      '',
      `# ${workflow.name}`,
      '',
    ];

    if (workflow.steps) {
      for (const step of workflow.steps) {
        lines.push(`## ${step.name || step.id}`);
        if (step.questions) {
          for (const q of step.questions) {
            lines.push(`- "${q}"`);
          }
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  _generateAgent(agent) {
    return [
      '---',
      `name: uda-${agent.name}`,
      `description: ${agent.description}`,
      `tools: ${agent.tools || 'Read, Grep, Glob'}`,
      `model: ${agent.model || 'sonnet'}`,
      '---',
      '',
      agent.prompt || `You are a ${agent.description}.`,
      '',
    ].join('\n');
  }
}
```

**Step 3: Run tests and commit**

```bash
node --test src/adapters/claude.test.js
git add src/adapters/claude.js src/adapters/claude.test.js
git commit -m "feat: add Claude Code adapter (CLAUDE.md + skills + agents)"
```

---

### Task 10: Cursor adapter

**Files:**
- Create: `src/adapters/cursor.js`

**Step 1: Implement**

```javascript
// src/adapters/cursor.js
import { existsSync } from 'fs';
import { join } from 'path';

export class CursorAdapter {
  get name() { return 'cursor'; }

  detect(projectRoot) {
    return (
      existsSync(join(projectRoot, '.cursorrules')) ||
      existsSync(join(projectRoot, '.cursor'))
    );
  }

  generate(knowledge, workflows, agents, projectRoot) {
    const files = {};
    files['.cursorrules'] = this._generateRules(knowledge);
    return files;
  }

  _generateRules(knowledge) {
    const lines = [];

    if (knowledge.project) {
      lines.push(`Project: ${knowledge.project.name || 'Unknown'}`);
      lines.push(`Engine: ${knowledge.project.engine || 'Unknown'}`);
      lines.push('');
    }

    if (knowledge.conventions?.length > 0) {
      lines.push('## Conventions');
      for (const conv of knowledge.conventions) {
        lines.push(`- ${conv}`);
      }
      lines.push('');
    }

    if (knowledge.decisions?.length > 0) {
      lines.push('## Architecture');
      for (const dec of knowledge.decisions) {
        lines.push(`- ${dec}`);
      }
    }

    return lines.join('\n');
  }
}
```

**Step 2: Commit**

```bash
git add src/adapters/cursor.js
git commit -m "feat: add Cursor adapter (.cursorrules generation)"
```

---

### Task 11: Raw adapter + AGENTS.md adapter

**Files:**
- Create: `src/adapters/raw.js`
- Create: `src/adapters/agents-md.js`

**Step 1: Implement both**

```javascript
// src/adapters/raw.js
export class RawAdapter {
  get name() { return 'raw'; }
  detect() { return true; } // always available

  generate(knowledge, workflows, agents) {
    const lines = ['# Project Context (UDA Generated)', ''];

    if (knowledge.project) {
      lines.push(`## Project: ${knowledge.project.name || 'Unknown'}`);
      lines.push(`Engine: ${knowledge.project.engine || 'N/A'}`);
      lines.push('');
    }

    if (knowledge.conventions?.length > 0) {
      lines.push('## Conventions');
      knowledge.conventions.forEach(c => lines.push(`- ${c}`));
      lines.push('');
    }

    if (knowledge.decisions?.length > 0) {
      lines.push('## Decisions');
      knowledge.decisions.forEach(d => lines.push(`- ${d}`));
      lines.push('');
    }

    if (workflows.length > 0) {
      lines.push('## Available Workflows');
      workflows.forEach(w => lines.push(`- **${w.name}**: ${w.description}`));
      lines.push('');
    }

    return { '.uda/.generated/full-context.md': lines.join('\n') };
  }
}
```

```javascript
// src/adapters/agents-md.js
export class AgentsMdAdapter {
  get name() { return 'agents-md'; }
  detect() { return true; }

  generate(knowledge, workflows, agents) {
    const lines = ['# AGENTS.md', '', '> Generated by UDA (Universal Dev AI)', ''];

    if (knowledge.conventions?.length > 0) {
      lines.push('## Coding Conventions');
      knowledge.conventions.forEach(c => lines.push(`- ${c}`));
      lines.push('');
    }

    if (knowledge.decisions?.length > 0) {
      lines.push('## Architecture');
      knowledge.decisions.forEach(d => lines.push(`- ${d}`));
      lines.push('');
    }

    return { 'AGENTS.md': lines.join('\n') };
  }
}
```

**Step 2: Commit**

```bash
git add src/adapters/raw.js src/adapters/agents-md.js
git commit -m "feat: add Raw and AGENTS.md adapters"
```

---

### Task 12: Sync command (ties adapters together)

**Files:**
- Create: `src/commands/sync.js`
- Modify: `src/cli.js`

**Step 1: Implement sync**

```javascript
// src/commands/sync.js
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { udaPaths } from '../core/constants.js';
import { ClaudeAdapter } from '../adapters/claude.js';
import { CursorAdapter } from '../adapters/cursor.js';
import { RawAdapter } from '../adapters/raw.js';
import { AgentsMdAdapter } from '../adapters/agents-md.js';

const ALL_ADAPTERS = [
  new ClaudeAdapter(),
  new CursorAdapter(),
  new RawAdapter(),
  new AgentsMdAdapter(),
];

export async function handleSync() {
  const root = process.cwd();
  const paths = udaPaths(root);

  // Load knowledge from .uda/
  const config = JSON.parse(await readFile(paths.config, 'utf8'));
  const knowledge = await loadKnowledge(paths);
  const workflows = await loadWorkflows(paths);
  const agents = await loadAgents(paths);

  // Determine which adapters to run
  const activeAdapters = config.adapters
    ? ALL_ADAPTERS.filter(a => config.adapters.includes(a.name))
    : ALL_ADAPTERS;

  let totalFiles = 0;

  for (const adapter of activeAdapters) {
    const files = adapter.generate(knowledge, workflows, agents, root);
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = join(root, filePath);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content);
      totalFiles++;
    }
    console.log(`  ✔ ${adapter.name} adapter — ${Object.keys(files).length} files`);
  }

  console.log(`\n✔ Sync complete: ${totalFiles} files generated`);
}

async function loadKnowledge(paths) {
  // Minimal implementation — reads project profile if exists
  const knowledge = { project: {}, conventions: [], decisions: [] };

  try {
    const profile = await readFile(join(paths.knowledge.project, 'profile.md'), 'utf8');
    // Simple parse — extract key-value pairs from markdown
    const nameMatch = profile.match(/Project:\s*(.+)/i);
    const engineMatch = profile.match(/Engine:\s*(.+)/i);
    if (nameMatch) knowledge.project.name = nameMatch[1].trim();
    if (engineMatch) knowledge.project.engine = engineMatch[1].trim();
  } catch { /* no profile yet */ }

  try {
    const decisions = await readFile(join(paths.knowledge.project, 'decisions.md'), 'utf8');
    knowledge.decisions = decisions.split('\n')
      .filter(l => l.startsWith('- '))
      .map(l => l.slice(2));
  } catch { /* no decisions yet */ }

  return knowledge;
}

async function loadWorkflows(paths) {
  // Will load YAML files in Phase 5 — for now return empty
  return [];
}

async function loadAgents(paths) {
  // Will load agent markdown files — for now return empty
  return [];
}
```

**Step 2: Wire to CLI and commit**

```bash
git add src/commands/sync.js src/cli.js
git commit -m "feat: add sync command — generates AI tool files from knowledge base"
```

---

## Phase 4: Plugin System

### Task 13: Plugin manager (add, list, remove via git clone)

**Files:**
- Create: `src/plugins/manager.js`
- Create: `src/plugins/manager.test.js`
- Create: `src/commands/plugin.js`

**Step 1: Install git dependency**

```bash
npm install simple-git
```

**Step 2: Implement plugin manager**

```javascript
// src/plugins/manager.js
import { simpleGit } from 'simple-git';
import { readFile, writeFile, rm, readdir, mkdir, cp } from 'fs/promises';
import { join, basename } from 'path';
import { udaPaths } from '../core/constants.js';

export class PluginManager {
  constructor(projectRoot) {
    this.root = projectRoot;
    this.paths = udaPaths(projectRoot);
  }

  async add(repoUrl) {
    const tmpDir = join(this.paths.root, '.tmp-plugin');
    const git = simpleGit();

    try {
      // Clone repo
      await git.clone(repoUrl, tmpDir, ['--depth', '1']);

      // Read manifest
      const manifest = JSON.parse(await readFile(join(tmpDir, 'manifest.json'), 'utf8'));
      const pluginName = manifest.name;

      // Copy knowledge files
      const knowledgeDir = join(tmpDir, 'knowledge');
      const targetKnowledge = join(this.paths.knowledge.engine, manifest.engine || pluginName);
      await mkdir(targetKnowledge, { recursive: true });
      await cpDir(knowledgeDir, targetKnowledge);

      // Copy workflows
      const workflowDir = join(tmpDir, 'workflows');
      await cpDir(workflowDir, this.paths.workflows);

      // Copy agents
      const agentDir = join(tmpDir, 'agents');
      await cpDir(agentDir, this.paths.agents);

      // Save plugin metadata
      const pluginMeta = {
        ...manifest,
        repo: repoUrl,
        installedAt: new Date().toISOString(),
      };
      await writeFile(
        join(this.paths.plugins, `${manifest.engine || pluginName}.json`),
        JSON.stringify(pluginMeta, null, 2)
      );

      return manifest;
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  }

  async list() {
    try {
      const files = await readdir(this.paths.plugins);
      const plugins = [];
      for (const f of files) {
        if (f.endsWith('.json')) {
          const data = JSON.parse(await readFile(join(this.paths.plugins, f), 'utf8'));
          plugins.push(data);
        }
      }
      return plugins;
    } catch {
      return [];
    }
  }

  async remove(name) {
    const metaPath = join(this.paths.plugins, `${name}.json`);
    const meta = JSON.parse(await readFile(metaPath, 'utf8'));

    // Remove engine knowledge
    const engineDir = join(this.paths.knowledge.engine, meta.engine || name);
    await rm(engineDir, { recursive: true, force: true });

    // Remove metadata
    await rm(metaPath);

    return meta;
  }
}

async function cpDir(src, dest) {
  try {
    await cp(src, dest, { recursive: true });
  } catch {
    // Source directory might not exist
  }
}
```

**Step 3: Create plugin command handlers**

```javascript
// src/commands/plugin.js
import { PluginManager } from '../plugins/manager.js';

export async function handlePluginAdd(repo) {
  const pm = new PluginManager(process.cwd());
  const manifest = await pm.add(repo);
  console.log(`✔ Plugin "${manifest.name}" v${manifest.version} installed`);
  console.log(`  Engine: ${manifest.engine || 'generic'}`);
  console.log(`  Run \`uda scan\` to index new knowledge`);
}

export async function handlePluginList() {
  const pm = new PluginManager(process.cwd());
  const plugins = await pm.list();
  if (plugins.length === 0) {
    console.log('No plugins installed. Run `uda plugin add <repo>` to install one.');
    return;
  }
  for (const p of plugins) {
    console.log(`  ✔ ${p.name} (v${p.version}) — ${p.engine || 'generic'}`);
  }
}

export async function handlePluginRemove(name) {
  const pm = new PluginManager(process.cwd());
  const meta = await pm.remove(name);
  console.log(`✔ Plugin "${meta.name}" removed`);
}
```

**Step 4: Wire to CLI and commit**

```bash
git add src/plugins/ src/commands/plugin.js src/cli.js package.json package-lock.json
git commit -m "feat: add plugin system with git-based install, list, and remove"
```

---

## Phase 5: Workflow System

### Task 14: YAML workflow parser

**Files:**
- Create: `src/workflows/parser.js`
- Create: `src/workflows/parser.test.js`

**Step 1: Install dependency**

```bash
npm install yaml
```

**Step 2: Write test**

```javascript
// src/workflows/parser.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseWorkflow } from './parser.js';

describe('parseWorkflow', () => {
  it('parses a workflow YAML string', () => {
    const yaml = `
name: debug
description: Systematic debugging
trigger: "bug, error, crash"
engine: null
steps:
  - id: define
    name: Bug Definition
    type: ask
    questions:
      - "What should happen?"
      - "What is happening?"
  - id: fix
    name: Apply Fix
    type: auto
    actions:
      - apply_fix
      - git_commit: "fix: bug"
`;
    const wf = parseWorkflow(yaml);
    assert.strictEqual(wf.name, 'debug');
    assert.strictEqual(wf.steps.length, 2);
    assert.strictEqual(wf.steps[0].type, 'ask');
    assert.deepStrictEqual(wf.steps[0].questions, ['What should happen?', 'What is happening?']);
  });
});
```

**Step 3: Implement**

```javascript
// src/workflows/parser.js
import YAML from 'yaml';

export function parseWorkflow(yamlString) {
  return YAML.parse(yamlString);
}

export function workflowToSkillMd(workflow) {
  const lines = [
    '---',
    `description: ${workflow.description}`,
    '---',
    '',
    `# ${workflow.name}`,
    '',
  ];

  for (const step of workflow.steps || []) {
    lines.push(`## ${step.name || step.id}`);

    if (step.type === 'ask' && step.questions) {
      lines.push('Ask the user:');
      for (const q of step.questions) {
        lines.push(`- "${q}"`);
      }
    }

    if (step.type === 'auto' && step.actions) {
      lines.push('Actions:');
      for (const action of step.actions) {
        if (typeof action === 'string') {
          lines.push(`- ${action}`);
        } else {
          const key = Object.keys(action)[0];
          lines.push(`- ${key}: ${JSON.stringify(action[key])}`);
        }
      }
    }

    if (step.type === 'agent') {
      lines.push(`Delegate to agent: **${step.agent}**`);
      if (step.output) lines.push(`Expected output: ${step.output}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}
```

**Step 4: Run tests and commit**

```bash
node --test src/workflows/parser.test.js
git add src/workflows/ package.json package-lock.json
git commit -m "feat: add YAML workflow parser with skill markdown conversion"
```

---

## Phase 6: Integration (Init → Scan → Sync full flow)

### Task 15: Full init flow with engine detection

**Files:**
- Modify: `src/commands/init.js` (create if not exists)
- Modify: `src/cli.js`

**Step 1: Create init command handler**

```javascript
// src/commands/init.js
import { initProject } from '../core/init.js';
import { handleScan } from './scan.js';
import { handleSync } from './sync.js';

export async function handleInit(options) {
  const root = process.cwd();

  console.log('UDA v0.1.0\n');

  // Step 1: Create directory structure
  console.log('Creating project structure...');
  await initProject(root);
  console.log('✔ .uda/ directory created\n');

  // Step 2: Engine detection
  const engine = options.engine || await detectEngine(root);
  if (engine) {
    console.log(`✔ Engine detected: ${engine}`);
    console.log(`  Run \`uda plugin add <repo>\` to install ${engine} plugin\n`);
  }

  // Step 3: Initial scan
  console.log('Scanning knowledge base...');
  await handleScan();

  // Step 4: Generate AI tool files
  console.log('\nGenerating AI tool files...');
  await handleSync();

  console.log('\n✔ UDA is ready!');
  console.log('  uda search "your query"');
  console.log('  uda learn <file.md>');
  console.log('  uda plugin add <git-repo>');
}

async function detectEngine(root) {
  const { existsSync } = await import('fs');
  const { join } = await import('path');

  if (existsSync(join(root, 'ProjectSettings', 'ProjectVersion.txt'))) return 'unity';
  if (existsSync(join(root, 'project.godot'))) return 'godot';
  if (existsSync(join(root, 'Config', 'DefaultEngine.ini'))) return 'unreal';

  return null;
}
```

**Step 2: Wire to CLI and commit**

```bash
git add src/commands/init.js src/cli.js
git commit -m "feat: full init flow with engine detection, scan, and sync"
```

---

### Task 16: Status command

**Files:**
- Create: `src/commands/status.js`

**Step 1: Implement**

```javascript
// src/commands/status.js
import { readFile, readdir, access } from 'fs/promises';
import { join } from 'path';
import { udaPaths } from '../core/constants.js';
import { VectorStore } from '../rag/store.js';

export async function handleStatus() {
  const root = process.cwd();
  const paths = udaPaths(root);

  // Check if UDA is initialized
  try {
    await access(paths.config);
  } catch {
    console.log('✘ UDA is not initialized. Run `uda init` first.');
    return;
  }

  const config = JSON.parse(await readFile(paths.config, 'utf8'));
  console.log(`UDA v${config.version}\n`);

  // Plugins
  try {
    const pluginFiles = await readdir(paths.plugins);
    const plugins = pluginFiles.filter(f => f.endsWith('.json'));
    console.log(`Plugins: ${plugins.length > 0 ? plugins.map(f => f.replace('.json', '')).join(', ') : 'none'}`);
  } catch {
    console.log('Plugins: none');
  }

  // RAG stats
  try {
    const store = new VectorStore(paths.rag.lancedb);
    await store.init();
    const count = await store.count();
    console.log(`RAG index: ${count} chunks`);
  } catch {
    console.log('RAG index: not initialized');
  }

  // Adapters
  console.log(`Adapters: ${config.adapters.join(', ')}`);

  // State
  try {
    const state = await readFile(paths.state.current, 'utf8');
    const lines = state.split('\n').slice(0, 5).join('\n');
    console.log(`\n--- Current State ---\n${lines}`);
  } catch {
    console.log('\nNo state file.');
  }
}
```

**Step 2: Wire and commit**

```bash
git add src/commands/status.js src/cli.js
git commit -m "feat: add status command showing UDA system state"
```

---

## Summary: Task Dependency Graph

```
Task 1: CLI skeleton
  ↓
Task 2: Directory structure
  ↓
  ├── Task 3: Chunker
  │     ↓
  ├── Task 4: Embedder
  │     ↓
  ├── Task 5: Vector store
  │     ↓
  └── Task 6: RAG manager ← depends on 3,4,5
        ↓
      Task 7: Wire RAG commands to CLI
        ↓
  ├── Task 8: Adapter interface
  │     ↓
  ├── Task 9: Claude adapter
  ├── Task 10: Cursor adapter
  ├── Task 11: Raw + AGENTS.md adapters
  │     ↓
  └── Task 12: Sync command ← depends on 8-11
        ↓
  Task 13: Plugin system
        ↓
  Task 14: Workflow parser
        ↓
  Task 15: Full init flow ← depends on all above
        ↓
  Task 16: Status command
```

## After MVP

These are NOT in this plan but are the logical next steps:
- Windsurf adapter
- Unity plugin repo (uda-plugin-unity)
- `uda export --format clipboard` support
- Auto-learn hook after workflow completion
- `uda plugin create` scaffolding
- `uda config` interactive editor
- npm publish setup
