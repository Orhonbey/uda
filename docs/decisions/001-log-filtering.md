# 001 — Log Filtering: Sadece Error/Warning

Tarih: 2026-03-08
Durum: Geçersiz
Yerine: #005
Ilgili: src/commands/logs.js, uda-unity-plugin/UdaLogBridge.cs

## Baglam

Unity console'dan log yakalama sistemi tasarlaniyor. Unity'de her frame Debug.Log uretebilir — oyun calisirken saniyede yuzlerce satir olusabilir.

## Karar

Sadece Error, Warning ve Exception loglari yakalanir. Duz Log (informational) mesajlari atlanir.

## Neden

- Duz loglar cok yer kaplar — 5MB rotation bile dakikalar icinde dolar
- Oyun gelistirmede asil deger hata ve uyarilarda, bilgi loglari genelde gecici debug icin
- Disk dolmasi riski kullanici deneyimini bozar

## Alternatifler

- Tumunu al → Reddedildi: disk dolmasi, performans etkisi
- Duz loglari ayri dosyaya al → Reddedildi: gereksiz karmasiklik, ayni disk sorunu
- Kullaniciya seviye sectir (config) → Gelecekte degerlendirilabilir
