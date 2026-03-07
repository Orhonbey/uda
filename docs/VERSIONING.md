# Versiyonlama Kuralları

Bu belge UDA CLI projesinin Semantic Versioning (SemVer) politikalarını ve uygulama kurallarını açıklar.

## 1. SemVer Politikası

UDA CLI [Semantic Versioning 2.0.0](https://semver.org/lang/tr/) kullanır: `MAJOR.MINOR.PATCH`

| Bileşen | Ne Zaman Artar? | Örnekler |
|---------|-----------------|----------|
| **MAJOR** | CLI komut API'si değişir, config formatı kırılır, plugin API'si kırılır | Komut kaldırma, zorunlu argüman değişimi |
| **MINOR** | Yeni komut, yeni adapter, yeni plugin yeteneği (geriye uyumlu) | `uda logs` komutu, yeni oyun motoru desteği |
| **PATCH** | Bug fix, CI düzeltmesi, dokümantasyon, bağımlılık güncellemesi | Test hatası düzeltmesi, README güncellemesi |

> **Önemli:** Pre-1.0 (v0.x.x) döneminde MINOR versiyonlar kırıcı değişiklikler içerebilir. Bu SemVer'ın kuralıdır.

## 2. Versiyon Konumu — Tek Kaynak

**`package.json` içindeki `"version"` alanı TEK yetkilidir.**

### Kurallar:
- Kod içinde versiyon göstermeniz gerekirse `package.json`'dan dinamik olarak okuyun
- **Asla hardcode etmeyin** — `v0.2.0` gibi stringler koda gömülemez
- Versiyon tek bir yerden yönetilir, tutarsızlık riskini ortadan kaldırır

### Örnek (Node.js):
```javascript
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));

console.log(`UDA v${pkg.version}\n`);
```

## 3. Version Bump Zamanlama (KRİTİK)

Version bump **her zaman release öncesi SON commit** olarak yapılır.

### Doğru Akış:
1. Tüm feature'ları ve fix'leri tamamla → commit
2. CHANGELOG.md `[Unreleased]` bölümünü doldur → commit
3. **Version bump (patch/minor/major)** → commit + tag

### Version Bump Commit:
- Sadece `package.json` ve `CHANGELOG.md` değişir
- Commit mesajı: `chore(release): v0.3.0`
- Push: `git push origin main --follow-tags`

### Yanlış (Kaos Yaratır):
```bash
# ❌ Version bump'ı feature'lardan önce yapma
npm version minor
git push
# ...5 commit sonra...
# Versiyon ile gerçek durum uyuşmuyor!
```

### Doğru:
```bash
# ✅ Version bump release öncesi son adım
git add .
git commit -m "feat(cli): logs command with filters"
git add CHANGELOG.md
git commit -m "docs: update changelog for v0.3.0"
npm version minor  # ← Son adım, commit + tag birlikte
```
