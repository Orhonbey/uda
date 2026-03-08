# 005 — Tagged Trace Logging

Tarih: 2026-03-08
Durum: Aktif
Yerine: #001
Ilgili: src/commands/logs.js, uda-unity-plugin/UdaLogBridge.cs

## Baglam

AI araçları debug sırasında Unity'ye log yazdırıp sonra okumak istiyor. Mevcut sistem (Karar 001) sadece Error/Warning yakalıyordu. Warning'ler Unity'de çok fazla üretilip token israfına yol açıyor.

## Karar

- console.jsonl: Sadece Error + Exception (Warning çıktı)
- trace.jsonl: `[uda:kanal]` prefix'li loglar yakalanır (100KB rotation)
- CLI: `--trace`, `--channel <name>` flag'leri eklenir, `--warnings` kaldırılır

## Neden

- Warning'ler token israfı yapıyor (shader, deprecated API vs.)
- AI araçları debug verisi üretip okumak istiyor ama düz loglar yakalanmıyordu
- Tagged sistem ile sadece bilinçli loglar yakalanır, disk/token sorunu olmaz
- 100KB rotation AI-dostu (~500-1000 satır)

## Alternatifler

- Tüm logları yakalamak → Reddedildi: disk dolması, token israfı (Karar 001 ile aynı neden)
- Tek dosyada trace level → Reddedildi: error logları kirlenir
- Ayrı bridge sınıfı → Reddedildi: gereksiz karmaşıklık, aynı callback kullanılabilir
