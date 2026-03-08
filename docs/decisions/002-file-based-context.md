# 002 — Dosya-Bazli Context Muhendisligi (MCP Degil)

Tarih: 2026-03-08
Durum: Aktif
Ilgili: src/adapters/, CLAUDE.md, .cursorrules

## Baglam

AI araclarina context saglama yontemi secilmesi gerekiyor. Iki ana yaklasim var: MCP (Model Context Protocol) server veya dosya-bazli (CLAUDE.md, .cursorrules, AGENTS.md).

## Karar

Dosya-bazli yaklasim kullanilir. Her AI araci icin adapter, ilgili aracin okudugu dosya formatinda context uretir.

## Neden

- Endustri trendi dosya-bazli context'e kayiyor (skills, rules, AGENTS.md)
- MCP server calistirmak ekstra bagimlilk ve proses yonetimi gerektirir
- Dosya-bazli yaklasim zero-dependency, her AI araciyla uyumlu
- Kullanici dosyalari gorup duzenleyebilir — seffaf

## Alternatifler

- MCP server → Reddedildi: ekstra complexity, her AI araci desteklemiyor
- Her ikisi birden → Reddedildi: YAGNI, bakim yuku ikiye katlanir
