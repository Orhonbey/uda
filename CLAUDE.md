# UDA CLI — Claude Context

> Universal Dev AI: AI-agnostic context engineering + RAG for game development

## Quick Reference

```bash
# Kurulum
npm install -g uda-cli

# Test
npm test  # 184 test

# CLI
uda init [--engine unity|godot|unreal] [--skip-plugin]
uda search "query"
uda learn <file.md>
uda logs [--errors|--trace] [--channel <name>] [--last N]
```

## Kural Linkleri

| Belge | Ne Zaman Bakılır |
|-------|------------------|
| [docs/VERSIONING.md](docs/VERSIONING.md) | Versiyon bump yapmadan önce |
| [docs/RELEASING.md](docs/RELEASING.md) | Release oluşturmadan önce |
| [docs/BRANCHING.md](docs/BRANCHING.md) | Commit yapmadan önce |
| [docs/decisions/INDEX.md](docs/decisions/INDEX.md) | Teknik/mimari karar almadan önce |

## Kritik Kurallar (Her Zaman Uy)

1. **Versiyon tek kaynak:** `package.json` — asla hardcode etme
2. **Version bump son adım:** Feature'lardan sonra, push öncesi
3. **Commit format:** `type(scope): description` — küçük harf, emir kipi
4. **main her zaman deployable:** Test geçmeyen kod pushlanmaz
5. **CHANGELOG güncel:** Her değişiklikte `[Unreleased]` bölümü

## Key Directories

```
src/
├── cli.js              # Entry point
├── commands/           # CLI komutları (init, search, learn, logs, plugin)
├── core/               # Çekirdek işlemler (RAG, sync, validators)
├── utils/              # Yardımcılar (git, embeddings, lancedb)
└── adapters/           # AI aracı adaptörleri (claude, cursor, windsurf)
```

## Karar Kaydi Kurali

Brainstorming veya design sirasinda teknik/mimari karar alindiginda:

1. `docs/decisions/INDEX.md` oku — sonraki numararayi bul
2. `docs/decisions/NNN-kisa-baslik.md` olustur (format: Baglam, Karar, Neden, Alternatifler)
3. INDEX.md'ye satirini ekle
4. Design doc'tan karar dosyasina link ver

Bu adim design doc commit'inden once yapilir. Karar olmadan design tamamlanmaz.

## Conventions

- **Dil:** Kod İngilizce, yorum/doküman Türkçe/İngilizce karışık (tercih)
- **Modüller:** ES modules (`"type": "module"`)
- **Test:** Node.js native test runner, `--test-concurrency=1`
- **Stil:** 2 space indent, no semicolon (mevcut kodu takip et)
