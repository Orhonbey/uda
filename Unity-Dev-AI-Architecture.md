# Unity Dev AI (UDA) — Unity için Context Engineering Sistemi

## Claude Code ile Çalışan, Dosya Tabanlı Meta-Prompting Sistemi

---

## Ne Bu?

**UDA**, Claude Code'u **Unity oyun geliştirme** için güçlendiren bir context engineering sistemidir.

- **Backend yok**, API yok, Vercel yok
- **Tamamen dosya tabanlı** — markdown dosyaları + klasör yapısı
- Claude Code bu dosyaları okuyarak Unity projen hakkında derin context kazanır
- Slash komutları ile Unity'ye özel iş akışları tetiklenir
- Özelleştirilmiş subagent'lar Unity görevlerini izole context'te çözer

---

## Repo Yapısı

```
unity-dev-ai/
├── bin/
│   └── install.js                    # npx installer
├── commands/uda/                     # Slash komutları
│   ├── analyze-logs.md               # /uda:analyze-logs
│   ├── new-feature.md                # /uda:new-feature
│   ├── debug.md                      # /uda:debug
│   ├── plan-system.md                # /uda:plan-system
│   ├── execute-plan.md               # /uda:execute-plan
│   ├── map-project.md                # /uda:map-project
│   ├── optimize.md                   # /uda:optimize
│   ├── review-code.md                # /uda:review-code
│   ├── quick.md                      # /uda:quick
│   ├── progress.md                   # /uda:progress
│   ├── help.md                       # /uda:help
│   └── settings.md                   # /uda:settings
├── agents/                           # Subagent tanımları
│   ├── uda-log-analyzer.md           # Konsol log analizi uzmanı
│   ├── uda-csharp-expert.md          # C# ve Unity API uzmanı
│   ├── uda-performance.md            # Performans profiler/optimizer
│   ├── uda-shader-debugger.md        # Shader ve rendering uzmanı
│   ├── uda-architect.md              # Sistem mimarisi planlayıcı
│   ├── uda-planner.md                # Görev planlayıcı
│   ├── uda-executor.md               # Plan uygulayıcı
│   ├── uda-researcher.md             # Unity ekosistem araştırmacı
│   └── uda-verifier.md               # Doğrulama ve test agent'ı
├── hooks/                            # Otomatik tetiklenen aksiyonlar
│   └── post-execute.sh               # Plan sonrası otomatik commit
├── templates/                        # Context dosya şablonları
│   ├── PROJECT.md                    # Proje profili şablonu
│   ├── STATE.md                      # Durum şablonu
│   ├── PLAN.md                       # Plan şablonu (XML yapılı)
│   └── UNITY-KNOWLEDGE.md            # Unity bilgi tabanı
├── scripts/
│   └── collect-unity-info.sh         # Unity proje bilgisi toplama
├── CLAUDE.md                         # Ana CLAUDE.md şablonu
├── package.json
├── README.md
└── LICENSE
```

---

## Kurulum

```bash
# Tek komutla kur
npx unity-dev-ai@latest

# Veya lokal
npx unity-dev-ai --local

# Veya global (tüm Unity projelerde)
npx unity-dev-ai --global
```

Installer şunları yapar:
1. `.claude/commands/uda/` → Slash komutlarını kopyalar
2. `.claude/agents/` → Subagent'ları kopyalar  
3. `.claude/hooks/` → Hook'ları kopyalar
4. `CLAUDE.md` → Proje kökünde oluşturur (varsa merge eder)
5. `.planning/` → Context klasörünü oluşturur

---

## 1. CLAUDE.md — Proje Hafızası

Claude Code her oturum başında bu dosyayı okur — projenin hafızasıdır.

```markdown
# CLAUDE.md

## Proje Bilgisi
- **Proje Adı**: [Otomatik algılanır — ProjectSettings'ten]
- **Unity Versiyonu**: [Otomatik — ProjectVersion.txt'den]
- **Render Pipeline**: [URP / HDRP / Built-in]
- **Scripting Backend**: [Mono / IL2CPP]
- **Hedef Platform**: [Android / iOS / PC / WebGL]
- **Aktif Sahne**: [Son çalışılan sahne]

## Proje Yapısı
- `Assets/Scripts/` — Oyun scriptleri
- `Assets/Prefabs/` — Prefab'lar
- `Assets/Scenes/` — Sahneler
- `Assets/Plugins/` — 3rd party eklentiler
- [Projeye özel klasör açıklamaları]

## Mimari Kararlar
- [Kullanılan pattern'ler: Singleton, ECS, MVC vb.]
- [Networking: Mirror, Netcode, Photon vb.]
- [UI sistemi: UGUI, UI Toolkit]
- [DI framework: Zenject, VContainer, yok]

## Bilinen Sorunlar
- [Aktif bug'lar ve workaround'lar]

## Kurallar
- Her zaman Türkçe yanıt ver
- Unity coding conventions'a uy (PascalCase metotlar, camelCase değişkenler)
- SerializeField kullan, public field'lar yerine
- Null check için ?. ve ?? operatörlerini tercih et
- Her yeni script'e namespace ekle
- MonoBehaviour yerine ScriptableObject tercih et (uygun olduğunda)

## UDA Sistemi Aktif
Bu proje Unity Dev AI (UDA) context engineering sistemi kullanıyor.
Komutlar: /uda:help ile tüm komutları gör.
Durum: .planning/ klasöründe.
```

---

## 2. Dosya Tabanlı Veri Yönetimi (.planning/)

Sistemin kalbi burasıdır. Tüm state, context ve geçmiş markdown dosyalarında tutulur.

```
.planning/
├── PROJECT.md              # Proje vizyonu ve kapsamı
├── STATE.md                # Anlık durum — ne yapıldı, ne yapılacak
├── config.json             # UDA ayarları
│
├── unity-profile/          # Unity projesine özel context
│   ├── UNITY-INFO.md       # Otomatik toplanan Unity bilgileri
│   ├── PACKAGES.md         # Package Manager paketleri listesi
│   ├── ARCHITECTURE.md     # Mimari analiz sonucu
│   └── KNOWN-ISSUES.md     # Bilinen Unity bug'ları ve workaround'lar
│
├── logs/                   # Log analizi geçmişi
│   ├── analysis-001.md     # Her analiz bir dosya
│   ├── analysis-002.md
│   └── patterns.md         # Tekrarlayan hata pattern'leri
│
├── research/               # Araştırma notları
│   ├── networking.md       # Örn: Mirror vs Netcode araştırması
│   └── ui-toolkit.md       # Örn: UI Toolkit best practices
│
├── features/               # Feature geliştirme planları
│   ├── 01-inventory-system/
│   │   ├── CONTEXT.md      # Kullanıcı tercihleri
│   │   ├── RESEARCH.md     # Araştırma
│   │   ├── PLAN-01.md      # Görev planı 1
│   │   ├── PLAN-02.md      # Görev planı 2
│   │   └── SUMMARY.md      # Tamamlanan iş özeti
│   └── 02-combat-system/
│       └── ...
│
├── quick/                  # Hızlı görevler (bug fix, küçük feature)
│   ├── 001-fix-null-ref.md
│   └── 002-add-sound.md
│
└── todos/                  # Ertelenmiş fikirler
    └── backlog.md
```

### PROJECT.md Örneği

```markdown
# Dead Colony — Proje Tanımı

## Vizyon
2D isometrik koloni hayatta kalma oyunu. Zombi salgını sonrası hayatta kalan
bir grup insanı yönetiyorsun.

## Teknik Stack
- Unity 2022.3 LTS
- URP 2D Renderer
- Mirror Networking (multiplayer)
- UI Toolkit (menüler)
- Addressables (asset management)

## V1 Kapsamı
- Koloni inşaat sistemi
- Kaynak yönetimi
- Basit AI (zombi pathing)
- Gündüz/gece döngüsü

## V1 Dışında
- Multiplayer
- Modding desteği
- Procedurel harita
```

### STATE.md Örneği

```markdown
# Proje Durumu

## Son Güncelleme: 2026-03-03

## Aktif Feature
**Feature 02: Combat System** — Faz: Planlama tamamlandı, execute bekleniyor

## Tamamlanan
- [x] Feature 01: Inventory System (4 plan, hepsi tamamlandı)

## Blocker'lar
- iOS build'de IL2CPP strip bug'ı — Unity 2022.3.20f1'de fix bekleniyor

## Son Kararlar
- ECS yerine klasik MonoBehaviour pattern ile devam
- Reason: Proje boyutu ECS gerektirmiyor, complexity artırmaya gerek yok

## Son Log Analizi
- NullReferenceException PlayerController.cs:42 — çözüldü (analysis-003)
- Performance: Update loop'ta GC allocation — çözüldü (analysis-005)
```

---

## 3. Slash Komutları

### /uda:analyze-logs — Konsol Log Analizi

```markdown
---
description: Unity konsol loglarını analiz et. Hata, exception veya 
  performans sorunlarını Claude Code ile çöz.
---

# Log Analizi

Kullanıcıdan log bilgisini al veya Unity Editor log dosyasından oku.

## Adımlar

1. **Log Toplama**
   Kullanıcıya sor: "Hatayı yapıştır veya 'auto' de — Editor.log'dan okuyayım."
   
   Eğer 'auto':
   - macOS: `~/Library/Logs/Unity/Editor.log`
   - Windows: `%LOCALAPPDATA%\Unity\Editor\Editor.log`
   - Son 50 satırı oku, Error/Exception içerenleri filtrele

2. **Context Toplama**
   `.planning/unity-profile/UNITY-INFO.md` dosyasını oku.
   Eğer yoksa, önce /uda:map-project çalıştır.
   
   Hata mesajındaki dosya yollarından kaynak kodu oku:
   - Stack trace'den .cs dosya yolunu ve satır numarasını çıkar
   - İlgili dosyanın hata satırı ± 20 satırını oku
   - Max 3 dosya (token budget)

3. **Analiz**
   uda-log-analyzer subagent'ına delege et:
   
   <analysis_request>
   <error type="[Error/Exception/Warning]">
     <message>[hata mesajı]</message>
     <stack_trace>[stack trace]</stack_trace>
   </error>
   <source_code>
     <file name="[dosya]" line="[satır]">
       [kod snippet'i]
     </file>
   </source_code>
   <unity_context>
     [UNITY-INFO.md içeriği]
   </unity_context>
   <recent_logs>
     [önceki 10 log]
   </recent_logs>
   </analysis_request>

4. **Sonuç Kaydetme**
   Analiz sonucunu `.planning/logs/analysis-NNN.md` olarak kaydet.
   `STATE.md`'yi güncelle.
   
   Eğer benzer hata daha önce analiz edildiyse, `patterns.md`'ye ekle.

5. **Çıktı Formatı**
   Kullanıcıya göster:
   - 🔴 Sorun Özeti (1 cümle)
   - 📋 Root Cause
   - ✅ Çözüm (kopyala-yapıştır hazır kod)
   - 🛡️ Önleme (bu hatanın tekrar oluşmaması için)
```

### /uda:map-project — Proje Haritalama

```markdown
---
description: Unity projesini analiz et. Yapı, paketler, mimari ve 
  conventions'ı haritalayıp .planning/unity-profile/ altına kaydet.
  Diğer tüm UDA komutlarından önce bir kez çalıştır.
---

# Proje Haritalama

Projeyi derinlemesine analiz et.

## Paralel Analiz Agent'ları

4 agent'ı paralel spawn et:

### Agent 1: Yapı Analizi
- `Assets/` klasör yapısını tara
- Kaç script, prefab, sahne, material var say
- Assembly Definition (.asmdef) dosyalarını listele
- Namespace organizasyonunu analiz et

### Agent 2: Paket ve Bağımlılık Analizi
- `Packages/manifest.json` oku
- Her paketin versiyonunu ve ne için kullanıldığını belirle
- 3rd party asset'leri (`Assets/Plugins/`) tara
- Uyumluluk sorunlarını işaretle

### Agent 3: Mimari Analizi
- MonoBehaviour vs ScriptableObject kullanım oranı
- Singleton pattern kullanımı
- Event sistemi (UnityEvent, C# event, ScriptableObject event)
- Dependency injection kullanılıyor mu
- Networking yapısı

### Agent 4: Conventions ve Kalıplar
- Naming conventions (PascalCase, camelCase tutarlılık)
- Kodlama stili (brace placement, spacing)
- Yaygın pattern'ler (Object pooling, Factory, Observer)
- Test yapısı (varsa)

## Çıktı

Sonuçları birleştir ve şu dosyaları oluştur:
- `.planning/unity-profile/UNITY-INFO.md`
- `.planning/unity-profile/PACKAGES.md`
- `.planning/unity-profile/ARCHITECTURE.md`
- `CLAUDE.md`'yi güncelle (proje yapısı bölümü)
```

### /uda:new-feature — Yeni Feature Geliştirme

```markdown
---
description: Yeni bir oyun feature'ı planla ve geliştir.
  Keşif → araştırma → tartışma → planlama → uygulama → doğrulama döngüsü.
---

# Yeni Feature

## Akış

1. **Keşif**
   Kullanıcıya sor:
   - "Ne yapmak istiyorsun?" (feature açıklaması)
   - "Bu hangi oyun mekaniklerini etkiliyor?"
   - "Mevcut sistemlerle nasıl etkileşecek?"
   - "Performans kısıtı var mı?" (mobil, çok sayıda nesne vb.)
   - "Hangi sahnelerde çalışacak?"

2. **Araştırma** (opsiyonel ama önerilen)
   uda-researcher agent'ını spawn et:
   - Unity'de bu feature nasıl implement edilir araştır
   - Yaygın pitfall'ları bul
   - Asset Store'da hazır çözüm var mı kontrol et
   - `.planning/unity-profile/` bilgilerini dikkate al
   
   Sonuç → `.planning/features/NN-feature-name/RESEARCH.md`

3. **Tartışma**
   Feature'ın gri alanlarını belirle ve kullanıcıya sor:
   - Oyun mekaniği detayları
   - UI/UX tercihleri
   - Data yapısı (ScriptableObject, JSON, binary)
   - Multiplayer sync gereksinimi
   
   Sonuç → `.planning/features/NN-feature-name/CONTEXT.md`

4. **Planlama**
   uda-planner agent'ını spawn et:
   - Feature'ı atomic task'lara böl
   - Her task XML yapılandırılmış PLAN dosyası
   - Task'lar arası dependency graph
   
   Sonuç → `.planning/features/NN-feature-name/PLAN-01.md` vb.

5. **Kullanıcı Onayı**
   Plan özetini göster, onay iste.
   Onay sonrası → /uda:execute-plan ile devam et.
```

### /uda:debug — Sistematik Debugging

```markdown
---
description: Bir bug'ı sistematik şekilde debug et.
  Sadece loglardan değil, tam akış analizi yaparak root cause bul.
---

# Sistematik Debug

## Adımlar

1. **Bug Tanımı**
   - "Ne olması gerekiyor?"
   - "Ne oluyor?"  
   - "Her zaman mı, bazen mi?"
   - "Hangi sahnede / hangi aksiyonda?"

2. **Hipotez Üretimi**
   `.planning/unity-profile/ARCHITECTURE.md` oku.
   İlgili scriptleri tara.
   3-5 olası neden sırala (en olasıdan başla).

3. **Doğrulama**
   Her hipotez için:
   - İlgili kodu oku
   - Debug.Log eklenecek noktaları öner
   - Veya direkt fix öner (bariz ise)

4. **Fix ve Kayıt**
   Fix'i uygula.
   `.planning/logs/` altına debug kaydı yaz.
   `STATE.md`'yi güncelle.
```

### /uda:quick — Hızlı Görev

```markdown
---
description: Küçük görevler için hızlı akış.
  Bug fix, küçük feature, config değişikliği.
  Full planlama gerekmez.
---

# Quick Task

"Ne yapmak istiyorsun?" sorusunu sor.

1. Plan yaz → `.planning/quick/NNN-slug/PLAN.md`
2. Uygula
3. Git commit (atomic)
4. Summary yaz → `.planning/quick/NNN-slug/SUMMARY.md`
5. `STATE.md` güncelle
```

### /uda:optimize — Performans Optimizasyonu

```markdown
---
description: Unity projesinde performans analizi ve optimizasyon yap.
  GC allocation, draw call, physics, script execution.
---

# Performans Optimizasyonu

uda-performance agent'ını spawn et.

## Analiz Alanları

1. **Update Loop Analizi**
   - Tüm Update/FixedUpdate/LateUpdate metotlarını tara
   - GC allocation yapan satırları bul (string concat, LINQ, foreach on list)
   - Her frame çağrılan GetComponent, Find, FindObjectOfType tespit et

2. **Rendering**
   - Draw call tahminleri (material sayısı, batching uyumluluğu)
   - Shader complexity
   - Overdraw riski olan sahneler

3. **Physics**
   - Rigidbody sayısı ve tipi
   - Collision matrix kontrolü
   - FixedUpdate rate

4. **Memory**
   - Texture boyutları ve compression
   - Mesh vertex sayıları
   - Addressables vs Resources kullanımı

## Çıktı
- Sorunları priority sırasıyla listele
- Her sorun için fix kodu ver
- Tahmini performans etkisini belirt
```

---

## 4. Subagent Tanımları

### uda-log-analyzer.md

```markdown
---
name: uda-log-analyzer
description: >
  Unity konsol loglarını analiz eden uzman agent.
  Error, Exception, Warning ve performans loglarını parse edip
  root cause analizi yapar. PROACTIVELY kullan:
  Unity hata analizi, stack trace okuma, NullReference debug.
tools: Read, Grep, Glob
model: sonnet
---

Sen bir Unity konsol log analiz uzmanısın.

## Görevin
Sana verilen Unity konsol loglarını analiz et ve çözüm öner.

## Analiz Süreci

1. **Hata Sınıflandırma**
   - NullReferenceException → Null check eksikliği, yıkılmış obje referansı
   - MissingReferenceException → Destroy edilmiş objeye erişim
   - IndexOutOfRangeException → Array/List index hatası
   - InvalidOperationException → Yanlış zamanda çağrı
   - Shader/Material hatası → Render pipeline uyumsuzluğu
   - Build hatası → Platform-spesifik sorun

2. **Stack Trace Okuma**
   - En üstteki frame = hatanın oluştuğu yer
   - Aşağıya doğru = çağrı zinciri
   - "at UnityEngine.*" satırları = Unity internal, skip et
   - "at [ProjeAdı].*" satırları = bizim kod, buraya odaklan

3. **Context Kullanımı**
   - <unity_context> tag'inden Unity versiyonu ve platform bilgisini al
   - <source_code> tag'inden ilgili kodu oku
   - <recent_logs> tag'inden hata öncesi akışı anla

4. **Yanıt Formatı**
   Her zaman şu yapıda yanıt ver:

   🔴 **Sorun**: [Tek cümle özet]
   
   📋 **Neden**: [Root cause açıklaması]
   
   ✅ **Çözüm**:
   ```csharp
   // Düzeltilmiş kod — kopyala yapıştır hazır
   ```
   
   🛡️ **Önleme**: [Bu hatanın tekrar oluşmaması için ne yapılmalı]

## Unity-Spesifik Bilgi

- Awake → OnEnable → Start sıralamasına dikkat et
- DontDestroyOnLoad objeleri sahne geçişinde sorun yaratabilir
- Coroutine'ler obje disable/destroy olunca durur
- SerializeField null olabilir — Inspector'da atanmamış olabilir
- Prefab instantiate sonrası GetComponent gerekebilir
- Async/await Unity main thread'de değilse UI erişemez
```

### uda-csharp-expert.md

```markdown
---
name: uda-csharp-expert
description: >
  Unity C# scripting uzmanı. MonoBehaviour lifecycle, coroutine,
  async/await, ScriptableObject, Editor scripting konularında
  derin bilgi. Kod yazma ve refactor görevlerinde kullan.
tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---

Sen bir Unity C# uzmanısın.

## Uzmanlık Alanların
- MonoBehaviour lifecycle (Awake, Start, Update, OnDestroy sıralaması)
- Coroutine ve async/await pattern'leri
- ScriptableObject tabanlı mimari
- Unity Editor scripting (CustomEditor, EditorWindow, PropertyDrawer)
- DOTS/ECS (gerektiğinde)
- Performanslı C# (struct vs class, Span<T>, NativeArray)

## Kod Yazma Kuralları
- Namespace kullan (ProjeAdı.Modül)
- [SerializeField] private field'lar (public değil)
- Null-conditional (?.) ve null-coalescing (??) operatörleri
- Region'lar kullanma — metot gruplamayı iyi isimlendirme ile yap
- Summary XML comment'ler public metotlara
- Unity event fonksiyonlarını (Awake, Start, Update) en üste koy
```

### uda-performance.md

```markdown
---
name: uda-performance
description: >
  Unity performans optimizasyon uzmanı. GC allocation, draw call,
  physics optimization, memory profiling. Performans sorunlarında
  PROACTIVELY kullan.
tools: Read, Grep, Glob
model: sonnet
---

Sen bir Unity performans optimizasyon uzmanısın.

## Bildiğin Anti-Pattern'ler

### Update Loop
- string concatenation (+) → StringBuilder veya interpolation cache
- GetComponent<T>() her frame → Awake'de cache'le
- FindObjectOfType → referansı Awake/Start'ta al
- foreach (List<T>) → for loop (GC allocation önleme)
- LINQ ifadeleri → manuel loop
- new List/Array her frame → pool veya cache

### Rendering
- Farklı material = farklı draw call → Atlas/Material share
- Dynamic batching limitleri (300 vertex)
- SRP Batcher uyumluluğu
- Shader variant sayısı kontrolü

### Physics
- MeshCollider convex olmadan → primitive collider tercih et
- Rigidbody.MovePosition vs transform.position
- Layer-based collision matrix

### Memory
- Resources.Load cache'lemeden → Addressables
- Texture Read/Write enabled gereksiz → kapat
- Sprite Atlas kullanımı
```

### uda-architect.md

```markdown
---
name: uda-architect
description: >
  Unity oyun mimarisi uzmanı. Sistem tasarımı, pattern seçimi,
  modül organizasyonu. Yeni feature planlamada kullan.
tools: Read, Grep, Glob
model: sonnet
---

Sen bir Unity oyun mimarı uzmanısın.

## Görevin
Oyun sistemlerinin mimarisini planla. Mevcut kod tabanını analiz et
ve yeni feature'ların nasıl entegre edileceğini tasarla.

## Mimari Kararlar İçin Kontrol Listesi

1. **Data mı Behaviour mı?**
   - Sadece veri tutan şey → ScriptableObject
   - Davranış gerektiren → MonoBehaviour
   - İkisi birden → ScriptableObject + MonoBehaviour

2. **Coupling Seviyesi**
   - Sistemler birbirini direkt referans etmemeli
   - Event/Observer pattern veya ScriptableObject event kullan
   - Interface üzerinden bağımlılık (testability)

3. **Lifecycle Soruları**
   - Bu obje sahne değişiminde ne olacak?
   - Birden fazla instance olabilir mi?
   - Save/Load gerekiyor mu?

4. **Performans Bütçesi**
   - Mobil hedef var mı? → Daha agresif optimizasyon
   - Kaç aynı anda aktif obje? → Object pooling gerekli mi?
   - Network sync gerekli mi? → Hangi veriler sync olacak?
```

### uda-researcher.md

```markdown
---
name: uda-researcher
description: >
  Unity ekosistem araştırmacısı. Best practice, paket karşılaştırma,
  Unity bilinen sorunlar araştırması. Feature planlama öncesi kullan.
tools: Read, Grep, Glob, Bash
model: sonnet
---

Sen bir Unity ekosistem araştırmacısısın.

## Görevin
Verilen konu hakkında Unity ekosistemindeki best practice'leri,
yaygın çözümleri ve potansiyel sorunları araştır.

## Araştırma Formatı

Her araştırma için şu yapıda rapor üret:

### 1. Mevcut Yaklaşımlar
- Yaklaşım A: [açıklama, artılar, eksiler]
- Yaklaşım B: [açıklama, artılar, eksiler]

### 2. Bu Proje İçin Öneri
- Projenin mevcut mimarisi dikkate alınarak en uygun yaklaşım
- Gerekçe

### 3. Dikkat Edilecekler
- Bilinen Unity bug'ları
- Platform-spesifik sorunlar
- Performans etkileri

### 4. Referans Kaynaklar
- Unity dökümantasyon sayfaları
- Bilinen iyi implementasyonlar
```

---

## 5. Plan Dosyası Formatı (XML Yapılandırılmış)

XML yapılandırılmış task formatı, Unity'ye uyarlanmış:

```markdown
# Feature 01 — Inventory System — Plan 01

## Frontmatter
- feature: 01-inventory-system
- plan: 01
- requirements: REQ-01, REQ-02
- estimated_tasks: 4
- dependencies: none

## Tasks

<task type="auto" id="01-01">
  <name>InventoryItem ScriptableObject oluştur</name>
  <files>
    Assets/Scripts/Inventory/InventoryItem.cs
    Assets/ScriptableObjects/Items/
  </files>
  <action>
    ScriptableObject tabanlı InventoryItem oluştur.
    Field'lar: itemName (string), icon (Sprite), stackable (bool),
    maxStack (int), description (string), itemType (enum).
    CreateAssetMenu attribute ekle.
    Namespace: DeadColony.Inventory
  </action>
  <verify>
    Unity Editor'da Create > DeadColony > Inventory Item menüsü çalışıyor.
    Test item oluştur ve Inspector'da tüm field'lar görünüyor.
  </verify>
  <done>
    ScriptableObject oluşturulabilir, Inspector'da düzenlenebilir.
  </done>
</task>

<task type="auto" id="01-02">
  <name>Inventory Manager sistemi</name>
  <files>
    Assets/Scripts/Inventory/InventoryManager.cs
    Assets/Scripts/Inventory/InventorySlot.cs
  </files>
  <depends>01-01</depends>
  <action>
    InventoryManager: Singleton pattern ile.
    List<InventorySlot> slots. AddItem, RemoveItem, HasItem metotları.
    InventorySlot: InventoryItem referansı + quantity.
    Event: OnInventoryChanged (UnityEvent veya C# event).
    SerializeField ile slot sayısı configurable.
  </action>
  <verify>
    Test script ile AddItem çağır, OnInventoryChanged event fire ediyor.
    Max stack aşımında yeni slot'a geçiyor.
  </verify>
  <done>
    Item ekleme/çıkarma çalışıyor, event sistemi aktif.
  </done>
</task>
```

---

## 6. Konfigurasyon

```json
// .planning/config.json
{
  "language": "tr",
  "mode": "interactive",
  "depth": "standard",
  "profiles": {
    "quality": {
      "planning": "opus",
      "execution": "sonnet",
      "verification": "sonnet"
    },
    "balanced": {
      "planning": "sonnet",
      "execution": "sonnet",
      "verification": "haiku"
    },
    "budget": {
      "planning": "sonnet",
      "execution": "haiku",
      "verification": "haiku"
    }
  },
  "active_profile": "balanced",
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "auto_commit": true
  },
  "unity": {
    "log_file_path": "auto",
    "max_log_history": 500,
    "auto_analyze_errors": false,
    "source_context_lines": 20,
    "max_source_files": 3
  }
}
```

---

## 7. İş Akışı (Tam Döngü)

```
1. /uda:map-project          ← Projeyi bir kez analiz et
       │
2. /uda:new-feature           ← Yeni feature başlat
       │
   ┌───▼───┐
   │ Keşif  │ → Sorular sor, feature'ı anla
   └───┬───┘
       │
   ┌───▼──────┐
   │ Araştırma │ → uda-researcher → RESEARCH.md
   └───┬──────┘
       │
   ┌───▼──────┐
   │ Tartışma  │ → Gri alanları netleştir → CONTEXT.md
   └───┬──────┘
       │
   ┌───▼──────┐
   │ Planlama  │ → uda-planner → PLAN-01.md, PLAN-02.md
   └───┬──────┘
       │
3. /uda:execute-plan          ← Planları çalıştır
       │
   ┌───▼──────┐
   │ Uygulama  │ → uda-executor → Kod yaz + git commit
   └───┬──────┘
       │
   ┌───▼──────┐
   │ Doğrulama │ → uda-verifier → Çalışıyor mu kontrol et
   └───┬──────┘
       │
4. /uda:analyze-logs          ← Hata varsa analiz et
       │
5. /uda:progress              ← Neredeyiz?
       │
   Tekrarla veya yeni feature'a geç
```

---

## 8. Temel Prensipler

| Prensip | UDA Uygulaması |
|---|---|
| **Context Engineering** | `.planning/` dosyaları her komutta okunur, her zaman zengin context |
| **Fresh Context Per Task** | Her plan fresh subagent'ta çalışır, context rot yok |
| **XML Prompt Formatting** | Plan dosyaları XML `<task>` yapısında, Claude bunu çok iyi parse eder |
| **File-Based State** | Veritabanı yok, her şey markdown — git ile versiyonlanır |
| **Multi-Agent Orchestration** | İnce orchestrator (komut) → uzman agent'lar (iş) |
| **Atomic Git Commits** | Her task = 1 commit, bisect ile hata bulma kolaylığı |
| **Token Budget** | Source code context max 3 dosya, max 20 satır ±, log buffer max 10 |
| **Size Limits** | CLAUDE.md < 150 satır, her plan < 2000 token |

---

## 9. Geliştirme Yol Haritası

### Faz 1 — MVP (ilk hafta)
- [ ] `CLAUDE.md` şablonu (Unity-spesifik)
- [ ] `/uda:analyze-logs` komutu
- [ ] `/uda:map-project` komutu
- [ ] `uda-log-analyzer` agent'ı
- [ ] `uda-csharp-expert` agent'ı
- [ ] `.planning/` klasör yapısı
- [ ] Basit `install.js`

### Faz 2 — Planlama Sistemi (2. hafta)
- [ ] `/uda:new-feature` komutu (keşif + araştırma + planlama)
- [ ] `/uda:execute-plan` komutu
- [ ] `uda-planner` ve `uda-executor` agent'ları
- [ ] `uda-researcher` agent'ı
- [ ] XML plan dosyası formatı
- [ ] Atomic git commit hook'u

### Faz 3 — Gelişmiş Özellikler (3. hafta)
- [ ] `/uda:optimize` komutu
- [ ] `/uda:debug` komutu
- [ ] `uda-performance` ve `uda-architect` agent'ları
- [ ] `uda-verifier` agent'ı
- [ ] Log pattern tanıma
- [ ] `/uda:progress` ve `/uda:settings`

### Faz 4 — Paket ve Yayın
- [ ] npm paketi (`npx unity-dev-ai`)
- [ ] GitHub repo + README
- [ ] Örnek Unity projesi ile demo
- [ ] Discord/Community
