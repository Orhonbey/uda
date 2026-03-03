# UDA (Universal Dev AI) — Design Document

## Date: 2026-03-03

## Overview

UDA is a local, file-based context engineering + RAG system that enhances any AI coding tool for game development. It is AI-agnostic, engine-agnostic (via plugins), and community-driven.

**What it is:** A CLI tool (`npx uda`) that manages knowledge, workflows, and AI tool adapters locally.

**What it is NOT:** An IDE, an AI model, a cloud service, or an MCP server.

## Core Principles

- Zero backend, zero cloud dependency — everything runs locally
- File-based — markdown + yaml + local vector DB
- AI-agnostic — single source, multiple outputs (Claude, Cursor, Windsurf, AGENTS.md, raw)
- Plugin architecture — engine knowledge is modular (Unity, Unreal, Godot)
- Learning system — RAG with project memory + ecosystem knowledge base
- Community-driven — open source, git-based plugin distribution

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   UDA CLI                        │
│  (Node.js — npx uda)                            │
│                                                  │
│  uda init    → Initialize project               │
│  uda sync    → Generate AI tool files            │
│  uda learn   → Teach knowledge to RAG            │
│  uda search  → Search RAG                        │
│  uda plugin  → Manage engine plugins             │
│  uda export  → Export to specific format          │
│  uda scan    → Scan project, index               │
│  uda status  → Show system status                │
│  uda config  → Manage settings                   │
└──────────┬──────────────┬───────────────────────┘
           │              │
     ┌─────▼─────┐  ┌────▼─────────────────┐
     │ RAG Engine │  │ Adapter Layer         │
     │ LanceDB   │  │ claude-adapter.js     │
     │ MiniLM    │  │ cursor-adapter.js     │
     │ (all local)│  │ windsurf-adapter.js   │
     └─────┬─────┘  │ agents-md-adapter.js  │
           │        │ raw-adapter.js        │
     ┌─────▼────────▼──────────────────────┐
     │         Knowledge Layer              │
     │  ┌─────────┐ ┌──────────┐ ┌───────┐│
     │  │ Engine  │ │ Project  │ │Community│
     │  │ Plugin  │ │ Memory   │ │ Packs  ││
     │  └─────────┘ └──────────┘ └────────┘│
     └─────────────────────────────────────┘
```

---

## RAG System

### Stack
- **Vector DB:** LanceDB (local, file-based, no server)
- **Embedding Model:** all-MiniLM-L6-v2 via ONNX Runtime (~50MB, local)
- **Chunk Strategy:** Heading-based markdown splitting with metadata

### Three Knowledge Layers

| Layer | Contents | Source | Example |
|-------|----------|--------|---------|
| Engine Plugin | Engine-specific knowledge | `uda plugin add` from git repo | Unity lifecycle, URP patterns, known bugs |
| Project Memory | Project-specific learned knowledge | `uda learn` + auto after workflows | "We use SO events instead of Singletons" |
| Community Packs | Community-shared knowledge | Optional git repo | "Unity multiplayer best practices" |

### Auto-Learning Cycle

When a workflow completes (bug fixed, feature done), UDA automatically:
1. Extracts the problem, cause, and solution
2. Tags with metadata (engine, type, keywords)
3. Indexes into RAG
4. Next time a similar issue appears, `uda search` finds it

### Chunk Metadata

Each chunk carries:
- `source`: file path
- `type`: "bug-fix" | "feature" | "pattern" | "knowledge"
- `engine`: "unity" | "unreal" | null
- `tags`: ["networking", "physics", ...]
- `date`: when learned

---

## Plugin System

### Plugin Structure (git repo)

```
uda-plugin-<name>/
├── manifest.json            # Plugin metadata + detection rules
├── knowledge/               # Engine-specific knowledge files
├── workflows/               # Engine-specific workflow overrides
├── agents/                  # Engine-specific agent definitions
├── scanners/                # Project scanning logic (JS)
└── templates/               # Templates for state/profile
```

### manifest.json

```json
{
  "name": "uda-plugin-unity",
  "version": "1.0.0",
  "engine": "unity",
  "detect": {
    "files": ["ProjectSettings/ProjectVersion.txt", "Assets/"]
  },
  "scan": {
    "entry": "scanners/project-scanner.js",
    "patterns": ["Assets/**/*.cs", "Packages/manifest.json"]
  }
}
```

### Plugin Commands

```bash
uda plugin add <git-repo-url>    # Install plugin
uda plugin list                   # List installed plugins
uda plugin update [name]          # Update plugin(s)
uda plugin remove <name>          # Remove plugin
uda plugin create <name>          # Scaffold new plugin
```

### Auto-Detection

`uda init` scans the project for known engine signatures and suggests the appropriate plugin.

---

## Adapter System

### Purpose

Convert UDA knowledge + workflows into AI-tool-specific formats.

### Adapter Interface

```javascript
module.exports = {
  name: "adapter-name",
  detect: () => boolean,         // Is this AI tool in use?
  generate: (knowledge, workflows, agents) => {
    return { "filepath": "content", ... }
  }
}
```

### Supported Outputs

| AI Tool | Output Files |
|---------|-------------|
| Claude Code | CLAUDE.md + .claude/skills/ + .claude/agents/ |
| Cursor | .cursorrules + .cursor/rules/*.mdc |
| Windsurf | .windsurfrules |
| OpenAI Codex | AGENTS.md |
| Raw (Kimi, MiniMax, Gemini, etc.) | full-context.md (single file) |

### Adding New Adapters

Community writes a JS module implementing the adapter interface → PR to core repo or standalone package.

---

## Workflow System

### YAML Source Format

Workflows are defined in YAML — structured, parseable, convertible to any AI tool format.

```yaml
name: debug
description: Systematic bug debugging
trigger: "bug, error, crash, exception"
engine: null  # engine-agnostic, plugin can override

steps:
  - id: define
    type: ask
    questions:
      - "What should happen?"
      - "What is happening?"

  - id: context
    type: auto
    actions:
      - read_state
      - rag_search:
          query: "{{bug_description}}"
          top: 3

  - id: fix
    type: auto
    actions:
      - apply_fix
      - git_commit: "fix: {{bug_summary}}"

  - id: learn
    type: auto
    actions:
      - rag_learn:
          type: "bug-fix"
          content: "{{full_debug_session}}"
```

### Engine Override

Plugins can extend core workflows:

```yaml
extends: core/debug
override_steps:
  - id: context
    actions_append:
      - read_file: "~/Library/Logs/Unity/Editor.log"
```

---

## File Structure

```
.uda/
├── config.json
├── knowledge/
│   ├── engine/              # From plugins
│   ├── project/             # Auto-learned
│   └── community/           # From community plugins
├── workflows/               # YAML workflow definitions
├── agents/                  # Agent definitions (markdown)
├── state/
│   ├── current.md
│   ├── features/
│   └── history/
├── rag/                     # [git-ignored] vector index + cache
├── plugins/                 # Installed plugin metadata
└── .generated/              # [git-ignored] AI tool output files
```

### .gitignore

```
.uda/rag/
.uda/.generated/
```

Everything else is git-tracked and shareable.

---

## Distribution

- **Core CLI:** npm package (`npx uda`)
- **Plugins:** git repositories
- **Community packs:** git repositories

---

## Decisions Made

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Name | UDA (Universal Dev AI) | Engine-agnostic expansion of original Unity Dev AI |
| RAG storage | LanceDB (local) | Zero backend, file-based, matches philosophy |
| Embedding | all-MiniLM-L6-v2 (ONNX, local) | Free, private, offline, quality sufficient |
| AI integration | Adapter pattern (file-based) | Not MCP — industry trend is file-based context |
| Engine support | Plugin system (git repos) | Modular, community-extensible |
| Workflow format | YAML source → multi-format output | Structured, parseable, convertible |
| Distribution | npm (CLI) + git (plugins) | Universal, no platform lock-in |
| Target audience | Open source community | Solo devs → teams → ecosystem |
