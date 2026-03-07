# UDA (Universal Dev AI)

AI-agnostic context engineering + RAG CLI tool for game development. Local, file-based, zero cloud dependency.

## Features

- **Local RAG**: LanceDB + MiniLM embeddings — no API keys needed
- **Multi-AI Support**: Claude, Cursor, Windsurf, AGENTS.md, Raw export
- **Plugin System**: Git-based engine plugins (Unity, Godot, Unreal, etc.)
- **Guided Setup**: Interactive plugin installation during `uda init`
- **Workflow Engine**: YAML-defined AI-assisted workflows
- **AI-Native Integration**: Generates CLAUDE.md, skills, and agent files automatically

## Installation

```bash
npm install -g uda-cli
```

Or run directly:

```bash
npx uda-cli init
```

## Quick Start

```bash
# Initialize UDA in your game project (auto-detects engine)
uda init

# The init wizard will:
# 1. Create .uda/ directory
# 2. Detect your engine (Unity/Godot/Unreal)
# 3. Prompt to install the official plugin
# 4. Scan and index knowledge
# 5. Generate AI tool files (CLAUDE.md, .cursorrules, etc.)
```

### Init Options

```bash
uda init                      # Interactive (auto-detect engine)
uda init --engine unity       # Specify engine explicitly
uda init --skip-plugin        # Skip plugin prompt (CI/automation)
```

## Commands

| Command | Description |
|---------|-------------|
| `uda init` | Initialize UDA in current project |
| `uda sync` | Generate AI tool files from knowledge base |
| `uda scan` | Scan project and index into RAG |
| `uda search <query>` | Search knowledge base |
| `uda learn <source>` | Teach knowledge to RAG |
| `uda logs` | View Unity console logs |
| `uda plugin add <repo>` | Install an engine plugin |
| `uda plugin update <name>` | Update an installed plugin |
| `uda plugin update-all` | Update all plugins |
| `uda export --format <type>` | Export knowledge to specific format |
| `uda status` | Show UDA system status |
| `uda config [key] [value]` | Manage UDA settings |

## Supported AI Tools

| Format | Generated Files |
|--------|----------------|
| **claude** | `CLAUDE.md`, `.claude/skills/`, `.claude/agents/` |
| **cursor** | `.cursorrules` |
| **windsurf** | `.windsurfrules` |
| **agents-md** | `AGENTS.md` |
| **raw** | `full-context.md` |

## Plugin System

Plugins provide engine-specific knowledge, workflows, and agents. During `uda init`, you'll be prompted to install the default plugin for your detected engine.

```bash
# Manual plugin management
uda plugin add https://github.com/Orhonbey/uda-unity-plugin.git
uda plugin update unity
uda plugin update-all
```

### Available Plugins

| Engine | Plugin |
|--------|--------|
| Unity | [uda-unity-plugin](https://github.com/Orhonbey/uda-unity-plugin) |
| Godot | Coming soon |
| Unreal | Coming soon |

## Project Structure

```
.uda/
├── config.json          # UDA configuration
├── knowledge/
│   ├── engine/          # Engine plugins (Unity, Godot, etc.)
│   ├── project/         # Project-specific knowledge
│   └── community/       # Community contributions
├── workflows/           # AI-assisted workflows (YAML)
├── agents/              # Specialized AI agents
├── logs/                # Engine logs (console.jsonl)
├── state/
│   ├── current.md       # Active work state
│   ├── features/        # Feature specifications
│   └── history/         # Completed work
└── rag/
    └── lancedb/         # Vector database
```

## License

MIT
