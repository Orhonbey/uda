# Release Süreci

Bu belge UDA CLI'nin güvenli, tekrarlanabilir release sürecini tanımlar.

## 1. Pre-Release Checklist

Release yapmadan önce aşağıdaki kontrolleri yapın:

- [ ] Tüm feature'lar `main` branch'te ve çalışır durumda
- [ ] `npm test` geçiyor (184 test)
- [ ] `git status` temiz (uncommitted değişiklik yok)
- [ ] `CHANGELOG.md` `[Unreleased]` bölümü dolu ve tarihli
- [ ] `npm pack --dry-run` doğru dosyaları gösteriyor

## 2. Release Akışı

### Adım 1: CHANGELOG Güncelle
`[Unreleased]` başlığını yeni versiyona çevir:

```markdown
## [Unreleased]

## [0.3.0] - 2026-03-15

### Added
- Yeni feature açıklaması
```

### Adım 2: Version Bump
```bash
npm version <patch|minor|major> -m "chore(release): v%s"
```

Bu komut otomatik olarak:
- `preversion` scriptini çalıştırır (`npm test`)
- `package.json` versiyonunu günceller
- Commit oluşturur: `chore(release): v0.3.0`
- Git tag ekler: `v0.3.0`
- `postversion` scriptini çalıştırır (`git push`)

### Adım 3: Push ve Tag
```bash
git push origin main --follow-tags
```

### Adım 4: GitHub Release Oluştur
```bash
gh release create v0.3.0 --title "v0.3.0" --notes-from-tag
```

### Adım 5: CI İzle
```bash
gh run watch
```

### Adım 6: Doğrulama
```bash
npm view uda-cli version
```

## 3. Otomasyon (package.json)

```json
{
  "scripts": {
    "preversion": "npm test",
    "postversion": "git push origin main --follow-tags"
  }
}
```

`npm version minor` artık:
1. Test çalıştırır → başarısızsa durur
2. Versiyon bump yapar
3. Tag oluşturur
4. Push eder

## 4. Rollback Prosedürleri

### Başarısız Publish
GitHub Release oluştu ama npm'e düşmedi:

```bash
# Release'i sil
gh release delete v0.3.0 --yes

# Tag'i sil
git push --delete origin v0.3.0
git tag -d v0.3.0

# Düzelt, commit, tekrar dene
git add .
git commit -m "ci: fix publish workflow"
npm version patch  # veya aynı versiyonu force
```

### Kötü Kod Yayınlandı
Kritik bug yayınlandı ve kullanıcılar indirdi:

```bash
# Versiyonu deprecate et
npm deprecate uda-cli@0.3.0 "Critical bug in logs command, use 0.3.1"

# Patch hazırla, fix'i uygula
git add .
git commit -m "fix(cli): resolve critical bug"
npm version patch
```

### npm'den Kaldırma (extreme)
```bash
npm unpublish uda-cli@0.3.0 --force  # Sadece 24 saat içinde!
```

> ⚠️ **Uyarı:** `unpublish` 24 saat sonra çalışmaz. O zaman tek yol `deprecate` + patch.

## 5. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `E403` — Already exists | Versiyon zaten publish edilmiş, patch/minor/major seç |
| `E404` — Package not found | npm login kontrol et, token geçerli mi? |
| `E400` — Invalid package | `npm pack --dry-run` ile içeriği kontrol et |
| CI timeout | `gh run watch` yerine GitHub Actions sekmesinden izle |
