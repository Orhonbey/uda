# Branch ve Commit Kuralları

Bu belge UDA CLI'nin Git workflow'unu ve commit standartlarını tanımlar.

## 1. Trunk-Based Development

UDA CLI **Trunk-Based Development** kullanır:

### İlkeler:
- `main` branch her zaman **deployable** (yayına hazır) durumdadır
- Küçük, tek commit'lik değişiklikler doğrudan `main`'e gider
- Çok commit'li işler için kısa ömürlü feature branch'ler kullanılır
- Branch ömrü **maksimum 2-3 gün**

### Akış:

```bash
# Tek commit'lik değişiklik
git checkout main
git pull origin main
# değişiklik yap...
git add .
git commit -m "fix(cli): correct log filtering logic"
git push origin main
```

```bash
# Çok commit'li özellik (branch gerekirse)
git checkout -b feat/logs-command
# commit 1
git commit -m "feat(cli): add logs command structure"
# commit 2
git commit -m "feat(cli): implement error filter"
# commit 3
git commit -m "test(cli): add logs command tests"
git push origin feat/logs-command
# → PR aç, review, squash merge
git checkout main
git branch -d feat/logs-command
```

### Branch İsimlendirme:

| Prefix | Kullanım |
|--------|----------|
| `feat/` | Yeni özellik |
| `fix/` | Bug düzeltmesi |
| `docs/` | Dokümantasyon |
| `ci/` | CI/CD değişikliği |
| `refactor/` | Kod refactor |
| `test/` | Test ekleme/düzeltme |

## 2. Commit Mesaj Kuralı

### Format:
```
type(scope): açıklama

[opsiyonel body]

[opsiyonel footer]
```

### Types:

| Type | Açıklama |
|------|----------|
| `feat` | Yeni özellik |
| `fix` | Bug düzeltmesi |
| `chore` | Bakım işleri (release, build vb.) |
| `ci` | CI/CD değişikliği |
| `test` | Test ekleme/düzeltme |
| `docs` | Dokümantasyon |
| `refactor` | Kod refactor (davranış değişmez) |

### Scopes (opsiyonel):

- `cli` — Komut satırı arayüzü
- `rag` — RAG sistemi
- `plugins` — Plugin sistemi
- `adapters` — AI adaptörleri
- `core` — Çekirdek işlemler
- `ci` — CI/CD
- `release` — Release işlemleri

### Kurallar:

- ✅ Küçük harf başlat
- ✅ Emir kipi kullan ("Add" değil "add")
- ✅ Nokta koyma sonuna
- ✅ 50 karakteri geçme (başlık)

### Örnekler:

```bash
# ✅ İyi
feat(cli): add logs command with filters
fix(rag): resolve vector search pagination bug
docs: update installation instructions
chore(release): v0.3.0
ci: add Node 22 to test matrix

# ❌ Kötü
added new feature
fix bug
Update README.md
feat: Added logs command.
```

## 3. PR Süreci (Branch Kullanıldığında)

### Gereksinimler:
- [ ] CI geçiyor (testler)
- [ ] Kod review yapıldı (opsiyonel küçük PR'lerde)
- [ ] Commit mesajları uygun formatta

### Merge Stratejisi:
- **Squash merge** tercih edilir (tek commit'e indirger)
- Branch merge sonrası silinir
- Commit mesajı PR başlığından alınır

### GitHub CLI ile:
```bash
# PR oluştur
gh pr create --title "feat(cli): add logs command" --body "Closes #123"

# PR merge (squash)
gh pr merge --squash --delete-branch
```

## 4. Commit Emoji (Opsiyonel)

Tercihe bağlı:

| Emoji | Type |
|-------|------|
| ✨ | feat |
| 🐛 | fix |
| 📚 | docs |
| 🏗️ | chore |
| 🧪 | test |
| 🔧 | ci |
| ♻️ | refactor |

```bash
✨ feat(cli): add interactive init prompt
🐛 fix(rag): handle empty query case
```
