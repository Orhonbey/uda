# UDA (Universal Dev AI)

AI-agnostic context engineering + RAG CLI tool for game development.

## Features

- **Local RAG**: LanceDB + MiniLM embeddings - no API keys needed
- **Multi-AI Support**: Claude, Cursor, Windsurf, AGENTS.md, Raw export
- **Plugin System**: Git-based engine plugins (Unity, Godot, Unreal, etc.)
- **Workflow Engine**: YAML-defined AI-assisted workflows
- **Project Context**: Automatic knowledge base management

## Installation

```bash
npm install -g uda
```

## Quick Start

```bash
# Initialize UDA in your project
uda init

# Scan and index knowledge
uda scan

# Search knowledge base
uda search "MonoBehaviour lifecycle"

# Export to your AI tool
uda export --format claude
```

## Commands

- `uda init` - Initialize UDA in current project
- `uda sync` - Generate AI tool files from knowledge base
- `uda search <query>` - Search knowledge base
- `uda learn <source>` - Teach knowledge to RAG
- `uda scan` - Scan project and index into RAG
- `uda plugin <action>` - Manage engine plugins
- `uda export --format <type>` - Export knowledge to specific format
- `uda status` - Show UDA system status
- `uda config [key] [value]` - Manage UDA settings

## Supported Formats

- **claude**: Generates CLAUDE.md and .claude/ skills
- **cursor**: Generates .cursorrules
- **agents-md**: Generates AGENTS.md
- **raw**: Generates full-context.md

## Plugin System

Install engine-specific knowledge:

```bash
uda plugin add https://github.com/user/uda-plugin-unity.git
uda plugin update unity
uda plugin update-all
```

## Project Structure

```
.uda/
├── config.json          # UDA configuration
├── knowledge/
│   ├── engine/          # Engine plugins (Unity, Godot, etc.)
│   ├── project/         # Project-specific knowledge
│   └── community/       # Community contributions
├── workflows/           # AI-assisted workflows
├── agents/              # Specialized AI agents
├── state/
│   ├── current.md       # Active work state
│   ├── features/        # Feature specifications
│   └── history/         # Completed work
└── rag/
    └── lancedb/         # Vector database
```

## License

MIT
