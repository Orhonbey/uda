# 003 — Git-Bazli Plugin Dagitimi (npm Degil)

Tarih: 2026-03-08
Durum: Aktif
Ilgili: src/plugins/manager.js, src/commands/plugin.js

## Baglam

Engine-specific bilgi paketleri (Unity, Godot, Unreal) plugin olarak dagitilacak. Dagitim mekanizmasi secilmesi gerekiyor.

## Karar

Pluginler git repo olarak dagitilir: `uda plugin add <repo-url>`. simple-git ile klonlanir.

## Neden

- Game dev toplulugu git'e asina, npm'e degil
- Plugin icerigi kod degil, bilgi dosyalari (markdown, yaml, json) — npm paketi icin overqualified
- Versiyon kontrolu git tag/branch ile dogal olarak saglanir
- Fork/contribute akisi GitHub uzerinden kolay

## Alternatifler

- npm paketi → Reddedildi: bilgi dosyalari icin gereksiz complexity, publish sureci agir
- Manuel kopyalama → Reddedildi: guncelleme mekanizmasi yok
