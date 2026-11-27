# Cila planı (P1–P8)

> Uygulama sırası ve bağımlılıklar için aşağıdaki "Sıra" bölümüne bakın. Her P ayrı commit olarak `feat/polish-plan` dalına işlenir.

**Amaç:** Doğruluk, erişilebilirlik, bağlantı dili, yazım, SEO, performans, altyapı, sezon işletmesi ve görsel tutarlılığı mevcut marka kararlarını bozmadan toparlamak.

**Yaklaşım:** Mevcut yapı korunur (Vite MPA, içerik `site-config.js`, sayfalar `content-pages.js`/`site-pages.js` içinde üretilir). Davranış değişiklikleri testle, görsel değerler gözle ve ölçümle doğrulanır. Tasarım değerlerini (renk, boşluk) sabitleyen test eklenmez.

## Verilen kararlar

1. Takım fotoğrafı bölümünün yerleşimi ve 16:9 oranı kalır. Yer tutucu hafifletilir. Gerçek fotoğraf için uygun boyutlar, responsive görseller ve doğru yükleme önceliği kullanılır.
2. Günlük otomatik derleme **kurulmaz**. Etiket, geri sayım ve Event şeması birlikte tutarlı kalır. Yeniden derleme gerektiren noktalar açıkça belgelenir.
3. İngilizce tarih biçimi: `19–21 March 2027`.
4. `Referrer-Policy: strict-origin-when-cross-origin`.
5. Tekrarlanan bölüm giriş animasyonları kalkar. Pegasus açılışı ve parlaması kalır. Hero eğimi hafif olur, `prefers-reduced-motion` desteklenir.
6. Bağlantı ikonları yalnızca anlam kattıkları yerde: dış bağlantı, e-posta, geri.
7. Takım fotoğrafı, iki galeri bağlantısı (boş olsa da menüde), önceki içerik kararları (form yok, sponsor seviyesi/fiyatı yok, PDF yok, e-posta düz metin) korunur.

## Sıra ve bağımlılıklar

| Sıra | Dilim | Neden bu noktada |
| --- | --- | --- |
| 1 | P1 Doğruluk ve erişilebilirlik | Küçük, bağımsız hatalar. Sonraki dilimlerin metin çıktısına dokunur (tarih, meta). |
| 2 | P2 Bağlantı dili | Tek bağlantı/ikon yardımcısı kurulur. P3 ve P8 bunun üzerine yazar. |
| 3 | P3 UX yazımı | P2'deki etiketlere dayanır. Sponsor seviyesi/PDF için hazır alanlar da burada. |
| 4 | P4 SEO | P1 (meta düzeltmesi) ve P3 (metinler) sonrası title/description yazılır. |
| 5 | P5 Performans | Yer tutucu ve fotoğraf yolu. P8'in CSS işinden önce kesinleşmeli. |
| 6 | P6 Altyapı | Bağımsız. `vercel.json` ve 404 sunumu. |
| 7 | P7 Sezon işletmesi | Etkinlik evresi tek yardımcıdan gelir. P4 şema kontrolünü tamamlar. Belgeler son hâli anlatır. |
| 8 | P8 Görsel cila | Tüm metin ve işaretleme oturduktan sonra CSS/animasyon. |

## P1 — Doğruluk ve erişilebilirlik

- `content-pages.js` `renderContent`: TR'de `date()` ham ISO değeri döndürüyordu (`2026-11-23`). `formatContentDate(value, lang) || value` kullanılır; her iki dilde okunabilir tarih.
- `season-utils.js` `formatContentDate`: EN çıktısı `19 March 2027` (en-GB). `site-config.js` etkinlik `en.date` değeri `19–21 March 2027` olur.
- Galeri albüm kartı: `1 photos` → `pluralize` (TR: `1 fotoğraf`; EN: `1 photo` / `N photos`).
- Etkinlik detay meta açıklaması: özet nokta ile bitince `". ·"` oluşuyordu. Parçalar sondaki noktalama kırpılarak `" · "` ile birleştirilir.
- Yazdırma: `.page-heading h1` beyaz renkte kalıp görünmüyor. `content-extras.css` `@media print` içinde başlık, yol ve açıklama siyah olur.
- Dil düğmesi: görünen metin (`EN`/`TR`) erişilebilir adın içinde yer alır (`EN – Switch to English`, `TR – Türkçeye geç`).
- Dokunma hedefleri: `pointer: coarse` altında kopyala düğmesi, filtre düğmesi ve altbilgi bağlantıları en az 44 px.
- Arama kutusu kenarlığı: `--control-line` token'ı eklenir (beyaz zeminde ≥3:1); yalnızca `.search-input` kullanır.
- Kontrol listesi (kod değişmeyebilir, bulgu raporlanır): başlık sırası (tüm sayfalarda h1→h2→h3 atlamadan), klavye odağı, mobil menü odağı.
- Testler: TR ve EN tarih biçimi, çoğul, meta açıklamada `. ·` yok, dil düğmesi adı görünen metni içerir.

## P2 — Bağlantı dili

- Yeni `icons.js`: tek ikon seti ve `linkIcon(kind)`. `site-pages.js` ve `content-pages.js` bunu kullanır (şu an iki ayrı `icon()` ve `arrow()` var).
- Kurallar: dış bağlantı → `↗`; `mailto:` → zarf; geri bağlantısı → sol ok; iç metin bağlantısı → sağ ok; iç **düğme** → ikon yok (hero "Takımı tanıyın" oku kalkar).
- Aynı hedef, aynı etiket:
  - `/takim/` → "Takımı tanıyın" / "Meet the team"
  - `/robotlar/` → "Sezon sayfası" / "Season page" (geri: "Sezon sayfasına dön")
  - `/frc/` → "FIRST ve FRC hakkında" / "About FIRST and FRC"
  - `/etkinlikler/` → "Etkinlik takvimi" / "Event calendar"
  - `/destek-ol/` → birincil eylem "Sponsor olun"; ikincil "Destek seçenekleri" / "Ways to support the team"
- Test: etiket → hedef eşlemesi tutarlı; dış bağlantı ikonlu, mailto ikonlu, `rel="noopener noreferrer"` korunur.

## P3 — UX yazımı

- Yayınlanmış robot yokken: FRC sayfası son düğmesi "AIR FORCE robotlarını keşfedin" yerine "2027 sezonunu inceleyin"; ana sayfa etiketi "Robotlar ve sezon" yerine "Sezon". Robot yayımlanınca eski metin döner.
- Ana sayfa sponsor bölümü başlığı: sponsor yokken "Okulumuz ve FRC organizatörü" / "Our school and FRC organizer"; sponsor eklenince "Sponsorlarımız ve kurumlar". Menü ve sayfa adı değişmez.
- İngilizce 404: kısa başlık + açıklama + "Back to home" ve "Season page"; TR karşılığı aynı yapıda.
- TR/EN başlık, açıklama ve boş durum metinleri taranır; tutarsızlıklar düzeltilir (`dist` çıktısından metin dökümü).
- Sponsorluk seviyeleri ve PDF için **boş** hazır alanlar: `siteConfig.sponsorshipTiers: []` ve `siteConfig.sponsorshipPdf: null`. Boşken hiçbir şey çizilmez; dolunca `/destek-ol/` sayfasında bölüm/bağlantı çıkar. `contentTemplates` ve `ICERIK.md` güncellenir.
- Test: boşken seviye/PDF yok (mevcut test geçmeli); yayımlı kayıtla görünür.

## P4 — SEO

- Ana sayfa title ve description: AIR FORCE #12414, Ankara, FRC robotik takımı doğal biçimde geçer (TR/EN; title ≤60, description ≤160 karakter).
- `twitter:title`, `twitter:description`, `twitter:image`, `og:image:alt`, `og:image:width/height` eklenir.
- Organization şemasına `address` (Ankara, TR).
- Doğrulama: canonical, hreflang (karşılıklı), sitemap, manifest (ad/açıklama ana sayfayla uyumlu), JSON-LD geçerli JSON.
- Event şeması: `startDate`/`endDate` ile görünen tarih aynı günleri anlatır (testle).

## P5 — Performans

- Yer tutucu: iki PNG isteği yerine CSS ile çizilen hafif yer tutucu (aynı 16:9 çerçeve). Görsel isteği ve ~23 KB kalkar.
- Gerçek fotoğraf yolu: `siteConfig.teamPhotoSources` (isteğe bağlı `[{src, width}]`) → `srcset` + `sizes`. Bölüm ilk ekranın altında olduğu için `loading="lazy"`, `decoding="async"`; LCP öğesi Pegasus (`fetchpriority="high"`) kalır. Genişlik/yükseklik zorunlu (CLS).
- LCP: Chrome ile ölçülür (masaüstü ve mobil), sonuç rapora yazılır.
- Font: hero başlığındaki Barlow Condensed 900 latin alt kümesi preload edilir (ölçerek). Inter latin-ext dosyası Türkçe için (İ, Ş, Ğ) indiriliyor; Türkçe alt kümesi `fonttools` ile üretilebiliyorsa uygulanır.
- Logo: `logo-440.webp` en çok 152 px gösteriliyor; 2x için küçük sürüm üretilir ve kullanılır.
- Başlangıç JS: `main.js` modül boyutu ve ağır başlangıç işleri incelenir; `hero-motion.js` zaten ayrı modül.
- Kullanılmayan `public` dosyaları: her aday için tüm repoda referans araması yapılır, sonra silinir (`BarlowCondensed-ExtraBoldItalic.ttf`, `reference-fonts.css`, yinelenen `Inter-OFL.txt` vb.).
- Gerçek fotoğraf henüz yok: performansı **ölçülemez**. Yalnızca yer tutuculu hâl ölçülür; gerçek fotoğraf için bütçe ve yükleme kuralı belgelenir.

## P6 — Altyapı

- `vercel.json`: `Referrer-Policy: strict-origin-when-cross-origin`; `trailingSlash: true` (kanonik URL'ler zaten `/`); hash'li `assets/*.js|css` ve font dosyaları için uzun ömürlü önbellek.
- `/en/` altında bilinmeyen adresler İngilizce 404 içeriğiyle **404 durum kodu** ile sunulur (Vercel yapılandırması doğrulanarak; yerel `vite preview` zaten ayırıyor).
- Güvenlik başlıkları kontrol edilir (CSP, XFO, nosniff, HSTS, Permissions-Policy). `site-integrity.test.js` CSP hash'ini zaten denetler.

## P7 — Sezon işletmesi

- Günlük derleme/Deploy Hook **kurulmaz** (karar 2).
- `season-utils.js`: `eventPhase(event, now)` → `upcoming | live | ended`. Hem derleme hem tarayıcı aynı mantığı kullanır.
- Tarayıcıda (`main.js`): etiket ("Yaklaşan etkinlik") ve geri sayım aynı evreden beslenir; etkinlik bitince yeniden derleme beklemeden "Etkinlik tamamlandı" ve geri sayım gizlenir.
- Event şeması: `eventStatus` yalnızca yaklaşan/süren etkinlikte yazılır; bitince tarih ve içerik doğru kalır. Etkinlik sayfası bitmiş etkinliği "Etkinlik" olarak etiketler.
- Derleme günlüğü: hangi etkinliğin "yaklaşan" seçildiği ve hangi tarihten sonra yeniden derleme gerektiği yazdırılır.
- `ICERIK.md` yeni bölüm "Sezon işletmesi": yeniden derleme gerektiren noktalar (Gündem menü bağlantısı, ana sayfa sezon paneli, destek sayfası cümlesi, altbilgi yılı, Event şeması içeriği) ve adımlar (Vercel → Deployments → Redeploy veya `git push`).
- `README.md` canlı adres `https://team12414.com`; belgelerdeki bağlantılar kontrol edilir.

## P8 — Görsel cila

- Tekrarlanan bölüm giriş animasyonları: `main.js` reveal bloğu ve `data-reveal` işaretleri kalkar. Hero girişi (`@keyframes arrive`), Pegasus açılışı ve parlaması kalır.
- Hero eğimi (`hero-motion.js`): açılar yaklaşık yarıya iner; `prefers-reduced-motion` ve ince imleç kontrolü korunur.
- Bilgi tekrarlayan bölüm etiketleri (`eyebrow`) kalkar: `heading()` yalnızca başlık alır; kartlardaki "Sponsorluk", "Takvim", "Arşiv" gibi başlığı tekrarlayanlar silinir. Bilgi taşıyanlar (yıl/oyun, "Etkinlik") kalır.
- Altın: düğme, aktif menü, canlı rozet ve odak halkasında kalır. Eyebrow, bağlantı hover ve kart hover kenarlığı nötr (lacivert/gri) olur.
- Düğme köşeleri: hepsi `--radius-control` (4 px); sapan varsa düzeltilir.
- Dekoratif başlık sonu noktaları: başlıklar/etiketler taranır, bulunanlar kaldırılır.
- Ana sayfa sezon bölümü açık zeminde; FIRST açıklaması beyaz bir kartın içine alınır.
- FRC numaralı sezon akışı mobilde (≤720 px) dikey ray; 375 px'te okunaklılığı ekran görüntüsüyle doğrulanır.
- Renk/boşluk/kart/panel/etkileşim: yeni değer yok, mevcut token'lar; kart hover ve odak durumları tutarlı.

## Doğrulama (her dilim)

1. `npm test` ve `npm run build` yeşil.
2. TR ve EN sayfalar 375, 820, 1440 px'te Chrome ile kontrol edilir (ana sayfa, takım, sezon, etkinlik, FRC, sponsor, destek, iletişim, 404).
3. Son: LCP ölçümü, yer tutucu hâli. Gerçek fotoğraf ölçümü yapılamaz (fotoğraf yok).

## Değişmeyenler

Marka (lacivert/altın/gümüş, Barlow Condensed + Inter, Pegasus açılışı), form yok, "katıl" sayfası yok, sponsor seviyesi/fiyat/PDF yayımlanmaz (yalnızca eklenebilir alan), sponsor logosu yalnızca onaylı sponsorlar için, e-posta düz metin, takım fotoğrafı yeri ve iki galeri bağlantısı.
