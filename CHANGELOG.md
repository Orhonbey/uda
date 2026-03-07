# Changelog

Tüm UDA CLI projesinin önemli değişiklikleri bu dosyada belgelenmektedir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) baz alınmıştır ve bu proje [Semantic Versioning](https://semver.org/lang/tr/) kullanmaktadır.

## [Unreleased]

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
