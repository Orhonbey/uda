# Changelog

Tüm UDA CLI projesinin önemli değişiklikleri bu dosyada belgelenmektedir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) baz alınmıştır ve bu proje [Semantic Versioning](https://semver.org/lang/tr/) kullanmaktadır.

## [Unreleased]

## [0.5.0] - 2026-03-07

### Added
- `uda init` now auto-completes setup: creates project profile, saves engine to config, updates state after scan
- Project profile (`profile.md`) generated with Project/Engine fields during init
- Engine detection result persisted to `config.json`
- `state/current.md` updated after scan with indexed file/chunk counts

### Fixed
- Init no longer shows "Run uda scan" after automatic scan completes
- Adapters now correctly display project name and engine instead of "Unknown / N/A"

## [0.4.1] - 2026-03-07

### Fixed
- CLI: `--version` flag support added (was returning "unknown option")

## [0.4.0] - 2026-03-07

### Added
- `uda clean [--force]` command to remove UDA from a project
- Removes .uda/ directory and all adapter-generated files (CLAUDE.md, .cursorrules, AGENTS.md, .claude/commands/uda/, .claude/agents/uda-*.md)
- Interactive confirmation prompt with --force bypass

### Fixed
- Test runner: sequential execution (`--test-concurrency=1`) to prevent deserialization errors

## [0.2.1] - 2026-03-07

### Added
- CLAUDE.md project context hub with rule links
- CI workflow: test on push/PR with Node 18+22 matrix
- docs/VERSIONING.md, RELEASING.md, BRANCHING.md project rules
- CHANGELOG.md with Keep a Changelog format
- `preversion`/`postversion` npm scripts for safe releases
- Version consistency check in publish workflow

### Fixed
- Hardcoded version string in `uda init` — now reads from package.json
- .gitignore: added coverage/, .claude/, .tmp-plugin/, *.log

## [0.2.0] - 2026-03-07

### Added
- Interactive plugin installation prompt during `uda init`
- AI-native Claude adapter (CLAUDE.md, skills, agents generation)
- Plugin capability system with manifest validation
- `uda logs` command with --errors, --warnings, --last filters
- `--skip-plugin` flag for CI/automation
- npm publish workflow with provenance

### Fixed
- CI: Node 22 for test compatibility
- CI: sequential test execution for Linux
- package.json: repository URL for npm provenance
