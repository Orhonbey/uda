# Changelog

Tüm UDA CLI projesinin önemli değişiklikleri bu dosyada belgelenmektedir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) baz alınmıştır ve bu proje [Semantic Versioning](https://semver.org/lang/tr/) kullanmaktadır.

## [Unreleased]

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
