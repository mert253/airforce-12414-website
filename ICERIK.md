# AIR FORCE içerik rehberi

Takım içeriği `site-config.js` dosyasından yönetilir. Fotoğraf, PDF ve diğer dosyaları `public/assets/` klasörüne koyun. Tüm ana bölümlerin sayfaları hazırdır; içerik gelince yeniden tasarım gerekmez.

## Taslak → yayın

Dosyanın sonundaki `contentTemplates` örneklerinden ihtiyacınız olan kaydı kopyalayın ve ilgili listeye ekleyin. Bu şablonlar kendiliğinden yayımlanmaz.

1. `status: "draft"` olarak başlayın. Taslak, sitede ve arşiv aramasında görünmez.
2. Gerçek metinleri, görselleri ve bağlantıları doldurun.
3. Hazır olduğunda `status: "published"` yapın.
4. `npm run build` ile yeniden üretin. Robot/proje/Takım Günlüğü yazısı/etkinlik sayfası ve arşiv bağlantısı oluşur.

**Durumu olmayan kayıtlar da yayımlanmaz.** Bu kural öğrenci, mentor, tarihçe, ödül, kaynak, galeri, video, etkinlik ve SSS kayıtlarında da geçerlidir. Genel takım kimliği, ana takım fotoğrafı ve mevcut sponsor listesi bağımsızdır.

Takım Günlüğü, proje ve kaynak arşivlerinin bağlantıları yayımlanmış içerik eklendiğinde menüye gelir (Takım Günlüğü menüde **Gündem** grubunda, Etkinlikler ile birlikte yer alır). Yayımlanmış etkinlik varsa `/etkinlikler/` sayfası açılır. Takım galerisi ve Proje galerisi, **Galeriler** menüsünde her zaman erişilebilir. Fotoğraf veya video gelene kadar kısa bir açıklama gösterilir.

## Türkçe ve İngilizce içerik

Bir kaydın Türkçe metnini doğrudan ilgili alanlara yazın. İngilizce karşılıkları aynı kayıttaki `en` nesnesine ekleyin. Örneğin `subteams` kaydında `name` ve `description`, `resources` kaydında `title`, `description`, `topic`, `category` ve `level` alanlarına çeviri gerekir. İngilizce dosya ayrıysa `en.url` alanını da girin. Yayın durumu, içerik adresini belirleyen `slug` ve ISO biçimindeki tarihler iki dilde ortaktır. İngilizce sayfaların adresleri `/en/` ile başlar.

Sezon ve okul bilgisi, ana takım fotoğrafının alternatif metni ve sponsorluk sunumu gibi genel alanların karşılıkları `siteConfig.en` nesnesine yazılır. Sponsorluk PDF’sinin iki dildeki sürümlerini birlikte güncelleyin.

## Hangi liste neyi yönetir?

| Liste / alan | Kullanıldığı yer |
| --- | --- |
| `school` | Okul adı ve resmî bağlantısı |
| `siteUrl` | Asıl adres: `https://team12414.com`. Canonical, hreflang, sitemap ve paylaşım görseli buna bağlıdır. `team12414.org` ve `www` adresleri `vercel.json` ile bu adrese yönlenir |
| `seasonStatus` | Kısa sezon açıklaması |
| `season` | Sezon yılı, mevcut durum, açıklama ve gerçek son güncelleme tarihi |
| `teamPhoto`, `teamPhotoAlt` | Ana sayfa takım görseli, takım sayfası ve galeri |
| `students`, `mentors`, `subteams` | Kadro, mentorlar ve çalışma alanları |
| `history`, `awards` | Tarihçe ve başarı arşivi |
| `robots` | Robot arşivi ve detayları |
| `projects` | Toplumsal etki arşivi ve detayları |
| `resources` | Konuya göre filtrelenen kaynak kütüphanesi |
| `news` | Takım Günlüğü (`/gunluk/`) ve ayrı yazı sayfaları |
| `gallery`, `videos` | Fotoğraf galerisi ve video bağlantıları |
| `sponsors` | Gerçek takım sponsorları; okul `schoolMark`, organizatör `frcOrganizer` alanındadır |
| `sponsorNeeds` | Sponsorlarımız ve Sponsor olun sayfalarının ortak ihtiyaç listesi |
| `email`, `instagram` | İletişim ve destek bağlantıları |
| `events`, `faq` | Etkinlikler (`/etkinlikler/`, her etkinlik için ayrı sayfa) ve sık sorulanlar |

## Takım fotoğrafı

Fotoğrafı örneğin `public/assets/takim.jpg` olarak kaydedin:

```js
teamPhoto: "/assets/takim.jpg",
teamPhotoAlt: "AIR FORCE 12414 takımı okul atölyesinde",
teamPhotoWidth: 1600,
teamPhotoHeight: 900,
teamPhotoPosition: "center",
```

Hazırlık ve hız:

- Ana dosyayı WebP olarak, en çok 1600 piksel genişlikte kaydedin (hedef: 250 KB altı). Fotoğraf 16:9 çerçevede `cover` ile kırpılır, `teamPhotoPosition` ile odak noktasını seçebilirsiniz.
- Telefonlar için daha küçük kopyalar üretip `teamPhotoSources` alanına yazın: `[{ src: "/assets/takim-800.webp", width: 800 }, { src: "/assets/takim-1200.webp", width: 1200 }]` (800 piksel için hedef: 100 KB altı). Tarayıcı ekrana uygun olanı seçer; alan boşsa yalnızca ana dosya kullanılır.
- Ana sayfada fotoğraf ilk ekranın içinde kaldığı için hemen ve yüksek öncelikle yüklenir (tembel yükleme yok). Bu yüzden dosya boyutu doğrudan ilk görünüm hızını etkiler. Fotoğrafı ekledikten sonra Lighthouse ile mobilde bir kez ölçün.
- Fotoğraf eklenene kadar çerçeve görsel isteği yapmayan hafif bir yer tutucudur.

Gerçek piksel ölçülerini ve fotoğrafı açıklayan kısa metni yazın. İngilizce alternatif metni `siteConfig.en.teamPhotoAlt` alanına ekleyin. Fotoğraf eklendiğinde ana sayfada Pegasus açılışının hemen altında, Takımımız sayfasında ve takım galerisinde görünür. Telefon görünümünde fotoğrafın tamamı gösterilir.

Ana sayfa ve sezon sayfasında, yayımlanmış etkinlikler arasından tarihi en yakın ve henüz bitmemiş olan gösterilir. `startDate` ve `endDate` alanlarını `2027-03-19` biçiminde yazın. Görünen tarih metni `date`, konum `location`, resmî bağlantı `url` alanından gelir. Tarih seçimi Türkiye saatine göre site üretilirken yapılır. Etkinlik bittikten sonra yapılacaklar için [Sezon işletmesi](#sezon-işletmesi-ne-kendiliğinden-güncellenir-ne-zaman-yeniden-derlenir) bölümüne bakın. Tamamlanan etkinlikler `/etkinlikler/` sayfasında "Geçmiş etkinlikler" altında korunur.

`season.updatedAt`, içeriği gerçekten güncellediğiniz tarihi taşımalıdır; güncelmiş gibi görünmesi için otomatik değiştirilmez. Boş arşivler menüde görünmez, kısa bir boş durum açıklaması sunar ve `noindex` ile arama motorlarından dışlanır. İlk geçerli yayımlanmış kayıt eklendiğinde yeniden derleme ile bu kısıt kalkar.

## Robot ekleme

`robots` listesine kayıt örneği:

```js
{
  status: "draft",
  slug: "robot-adi",
  name: "",
  year: "",
  game: "",
  description: "",
  image: "",
  imageAlt: "",
  imageWidth: 1600,
  imageHeight: 1000,
  specs: [
    { label: "Sürüş sistemi", value: "" },
    { label: "Ağırlık", value: "" }
  ],
  mechanisms: [],
  results: [],
  photos: [],
  cadUrl: "",
  codeUrl: "",
  videoUrl: "",
  gameUrl: ""
}
```

`slug` yalnızca küçük Latin harfleri, rakamlar ve araya konan kısa çizgiler içermeli. Her kayıt benzersiz olmalı: `robot-adi` → `/robotlar/robot-adi/`. Baştaki ve sondaki kısa çizgiler geçersizdir. `ilk-robot` mevcut tanıtım sayfasıdır; ilk gerçek robotta bu adresi koruyabilir veya başka bir adres seçebilirsiniz.

`results`: `{ event: "Etkinlik adı", date: "Gerçek tarih", result: "Doğrulanmış sonuç" }`.
`mechanisms` metin listesi olabilir. `photos` aşağıdaki galeri biçimini kullanır. Boş CAD/kod/video bağlantıları aktif düğme oluşturmaz.

Robotlar sezon yılına göre yeniden eskiye sıralanır. Günlük yazılarının tarihlerini `YYYY-MM-DD` (yıl-ay-gün) biçiminde yazın; yazılar da yeniden eskiye sıralanır. Başlığı veya robot adı boş kayıtlar, yayımlanmış olarak işaretlense bile detay sayfası oluşturmaz. Aynı listede iki yayımlanmış kaydın slug değeri aynıysa derleme açıklayıcı bir hata ile durur; slug değerlerinden birini düzeltin.

## Proje, Takım Günlüğü ve etkinlik sayfaları

`contentTemplates.project` ve `contentTemplates.news` örneklerini kullanın. `slug`, başlık ve `status` gereklidir. Yayımlanan proje `/toplumsal-etki/slug/`, Takım Günlüğü yazısı (`news`) `/gunluk/slug/` adresini alır. Eski `/haberler/...` ve `/en/news/...` adresleri `vercel.json` içindeki kalıcı yönlendirmelerle `/gunluk/...` ve `/en/journal/...` adreslerine gider.

Takım Günlüğü yazılarında `category` yalnızca şu dört değerden biri olmalıdır: `Takımdan`, `Özel Günler`, `FRC Gelişmeleri`, `Teknik` (İngilizce karşılıkları sayfada otomatik gösterilir). Boş veya tanımsız kategori "Takımdan" olarak yayımlanır. Filtre düğmeleri bu sırayı izler ve yalnızca kullanılan kategorileri gösterir.

**Etkinlikler (`events`).** `contentTemplates.event` örneğini kullanın. `slug` (küçük harf, rakam, tire), `title` ve `status: "published"` olan etkinlik `/etkinlikler/slug/` adresinde ayrı sayfa alır; slug veya başlık yoksa yalnızca `url` ile resmî FIRST bağlantısı gösterilir. Alanlar: `summary`, `date`, `startDate`/`endDate` (`YYYY-AA-GG`), `location`, `city`, `country`, `url`, `program`, `results`, `photos` ve `en` (`date`, `location`, `summary`). `program` maddeleri `contentTemplates.eventProgramItem`, sonuçlar `contentTemplates.eventResult` biçimindedir; her biri yalnızca `status: "published"` ve başlık/sonuç alanı doluysa görünür. Program, Sonuçlar ve Fotoğraflar bölümleri içerik yoksa sayfada hiç yer almaz. İki yayımlanmış etkinliğe aynı slug verilirse derleme hata ile durur.

Projeler: `goal`, `audience`, `description`, `date`, `results`, `evidenceUrl`, `photos`. Uzun anlatım için `paragraphs: ["İlk paragraf", "İkinci paragraf"]` eklenebilir. Haberlerde `summary` kısa giriş, `paragraphs` yazının tamamıdır. Metinler HTML olarak çalıştırılmaz; ayrı paragraflar kullanın.

Etki sayıları, ödüller ve yarışma sonuçları doğrulandıktan sonra yayımlanmalı. Deneme isimleri veya uydurma sonuçlar doldurmayın.

## Galerilere fotoğraf ekleme

1. Yayımlanacak fotoğrafı `public/assets/galeri/` altına koyun. Dosya adında boşluk kullanmayın.
2. Takım, atölye ve yarışma fotoğraflarını `site-config.js` içindeki `gallery` listesine ekleyin. Örneğin:

   ```js
   { status: "draft", src: "/assets/galeri/atolye-01.webp",
     alt: "Takım üyeleri atölyede robot şasisini kuruyor",
     caption: "Şasi montajı", category: "Atölye", width: 1600, height: 1000,
     en: { alt: "Team members assemble the robot chassis in the workshop",
       caption: "Chassis assembly", category: "Workshop" } }
   ```

3. Takım galerisinde fotoğraflar albümlere ayrılır: `album` alanı doluysa o albüm adı, yoksa `category`, o da yoksa "Takım" kullanılır. Albümler ilk görülme sırasıyla listelenir. İsteğe bağlı `album` alanı `contentTemplates.photo` içinde bulunur.
4. Bir yarışma etkinliğinin fotoğraflarını ilgili `events` kaydının `photos` listesine ekleyin. Fotoğraflar etkinliğin sayfasındaki Fotoğraflar bölümünde ve `/galeri/` sayfasındaki "Etkinlik albümleri" bölümünde görünür. Etkinlik kaydı ve fotoğrafları `published` olmalıdır.
5. Bir sosyal sorumluluk etkinliğinin fotoğrafları için aynı kayıt biçimini ilgili `projects` kaydının `photos` listesinde kullanın. Fotoğraflar projenin kendi sayfasında ve `/proje-galerisi/` adresindeki albümünde otomatik görünür. Proje kaydı ve fotoğrafları `published` olmalıdır. Proje tarihini `YYYY-AA-GG` biçiminde yazın.

`caption` isteğe bağlıdır. `alt` fotoğrafta ne olduğunu açıklamalı, `width` ve `height` gerçek piksel boyutlarını göstermelidir. Yukarıdaki dosya adı ve açıklama örnektir; yayımlamadan önce kendi fotoğrafınızla değiştirin.

## Kaynak, kişi ve video

```js
// resources
{ status: "draft", title: "", topic: "Yazılım", category: "", year: "", level: "Başlangıç",
  description: "", format: "PDF", url: "", download: false,
  en: { title: "", topic: "Software", category: "", level: "Beginner", description: "" } }

// students veya mentors
{ status: "draft", name: "", role: "", team: "", image: "",
  imageAlt: "", imageWidth: 600, imageHeight: 750 }

// videos
{ status: "draft", title: "", category: "Robot", url: "",
  thumbnail: "", description: "" }
```

Kaynaklarda `category` (ör. eğitim notu), `year` ve `level` isteğe bağlıdır. Bu bilgiler kartta görünür ve aramaya dahil edilir. İndirilebilir yerel dosyaları `public/assets/resources/` altında saklayın ve `download: true` olarak işaretleyin.


Fotoğrafları Takım, Atölye ve Yarışma gibi kategorilerle etiketleyin. Kaynakları Mekanik, Elektronik, Yazılım, Strateji ve Takım yönetimi gibi konularla etiketleyebilirsiniz. Filtreler yayımlanmış fotoğrafların kategorilerinden ve kaynakların konularından oluşur. Fotoğraf büyütme yayımlanmış fotoğraflarda etkinleşir. Videolar gerçek video adresine yönlendirir.

## Sponsor ve iletişim

Sponsor kaydı `{ name, logo, url, role, width, height }` biçimindedir. `sponsors` alanına okulun yayımlanmasını onayladığı sponsor bilgilerini yazın. Okul ve FRC organizatörünün rollerini ayrı gösterin. Kurum adını düz metin olarak göstermek için `logo` alanını boş bırakabilirsiniz. Logo kullanılacaksa kullanım iznini ve marka rehberini kontrol edin. `width` ve `height` gerçek görsel ölçüleridir.

Sponsor sunumunun her iki dildeki sürümünü okul onayından sonra yayımlayın. Önceki sunum ve üçüncü taraf logo dosyaları yerel `.publication-review/` klasöründe durur. `public/` içindeki dosyalar, bir sayfaya bağlanmasalar bile yayımlanır. Taslakları ve özel dosyaları bu klasöre koymayın.

**Sponsorluk seviyeleri ve dosyası** hazır olduğunda `sponsorshipTiers` ve `sponsorshipPdf` alanlarını doldurun; ikisi de boşken sayfada hiçbir şey görünmez. Örnekler `contentTemplates.sponsorshipTier` ve `contentTemplates.sponsorshipPdf` içindedir.

- Seviye: `{ status: "published", name, amount, description, benefits: [], en: { ... } }`. `amount` isteğe bağlıdır. Seviyeler Sponsor olun sayfasında "Sponsorluk seviyeleri" başlığıyla, destek alanlarının altında çıkar.
- Dosya: `{ status: "published", label, url, en: { label } }`. Bağlantı Sponsor olun sayfasında e-posta kutusunun altında görünür. PDF'yi `public/assets/` altına koyun ve iki dilde ayrı dosya gerekiyorsa `en.url` alanını da yazın.
- Seviye adı, tutar ve yardımlar okulun onayından sonra yazılır; ekip kendi başına yeni vaat eklemez.

Takım fotoğrafı, galeri ve öğrenci bilgileri eklenmeden önce okulun yayın onayını ve geçerli kişisel veri işleme koşullarını doğrulayın. Site, okulun KVKK metinlerine `/kvkk/` sayfasıyla yönlendirir (bkz. [Kişisel verilerin korunması sayfası](#kişisel-verilerin-korunması-sayfası)). Okul siteye özel bir bilgilendirme hazırlarsa barındırma (Vercel) ve takım e-postasının nasıl işlendiği de kapsanmalı. Üçüncü taraf görsellerini doğrudan yüklemek yerine yayını onaylanmış dosyaları kendi sitenizden sunun.

E-posta `airforce@istek.k12.tr`. `emailIsPlaceholder: false` gerçek adresi tıklanabilir yapar. Takıma katılım veya öğrenci/mentor başvuru formu yoktur.

## Kişisel verilerin korunması sayfası

- Türkçe sayfa `/kvkk/` ("Kişisel Verilerin Korunması"), okulun KVKK sayfasına (https://ankara.istek.k12.tr/tr/kvkk) yeni sekmede bağlanır.
- İngilizce sayfa `/en/personal-data-protection/`, `public/documents/kvkk/` altındaki iki İngilizce PDF'ye bağlanır: `personal-data-processing-privacy-notice.pdf` ve `personal-data-retention-and-destruction-policy.pdf`. Sayfada bunların İngilizce çeviri olduğu, Türkçe metinlerin esas olduğu belirtilir (PDF'lerde de "The Turkish text is the original" yazar).
- Altbilgide "KVKK" / "Personal Data Protection" bağlantısı bu sayfalara gider; iletişim sayfasındaki gizlilik bölümü `/kvkk/` adresine bağlanır.
- Kodda: metin ve bağlantılar `content-pages.js` içindeki `privacy` çiziminde (`routes` listesi ve `englishMetadata`), altbilgi bağlantısı `site-pages.js` içindeki `siteFooter` işlevindedir.

**Güncelleme.** Bir PDF'yi değiştirmek için `public/documents/kvkk/` altındaki dosyanın üzerine aynı adla yazın; ad değişecekse `privacy` çizimindeki yolu ve `site-integrity.test.js` içindeki testi de güncelleyin. Okul KVKK adresini değiştirirse aynı çizimde ve testte düzeltin. Bağlantılara asla `download` özniteliği eklemeyin; bütünlük testi bu ifadeyi yasaklar.

## Kontrol ve yayın

```text
npm run dev
node --test content-pages.test.js
npm run build
```

İçerik değişikliklerini kaydedin; gerekirse geliştirme sunucusunu yeniden başlatın. Yayın dosyaları `dist` klasöründedir. Her yeni kayıt için yeniden derleyip yeni çıktıyı yükleyin.

**Özel belgeleri ve taslak dosyaları `public` içine koymayın.** Bu klasördeki dosyalar bağlantısı olmasa da yayımlanır. Yayımlanmayacak dosyalar için `public` dışındaki bir klasör kullanın.

Bilinmeyen adresler `404.html`, bilinmeyen `/en/` adresleri `en/404.html` sayfasını 404 durum koduyla döndürmeli. Yayından sonra `npm run check:deploy -- https://team12414.com` ile denetleyin. Domain bağlandığında `siteUrl` alanına gerçek HTTPS adresini yazın. Sosyal paylaşım ve canonical adresler bu alanı kullanır.

## Sezon işletmesi: ne kendiliğinden güncellenir, ne zaman yeniden derlenir

Site statik dosyalardan oluşur; "bugün"e bağlı her şey ya derleme anında ya da ziyaretçinin tarayıcısında hesaplanır. **Günlük otomatik derleme bilinçli olarak kurulmamıştır.** Aşağıdaki liste, neyin kendi kendine güncel kaldığını ve neyin elle yeniden yayın gerektirdiğini gösterir.

**Yeniden derleme gerekmeden, tarayıcıda güncellenenler**

- Geri sayım: etkinlik başlayınca "Etkinlik devam ediyor", bitince gizlenir.
- Etkinlik etiketi: "Yaklaşan etkinlik" → "Etkinlik devam ediyor" → "Tamamlanan etkinlik". Ana sayfada "Yarışma takvimi" etiketi bitince "Tamamlanan etkinlik" olur.
- Altbilgideki © yılı.

**Etkinlik bittikten sonraki gün yeniden derleme gerektirenler** (Ankara Regional için 22 Mart 2027)

- Ana sayfadaki sezon paneli ve sezon sayfasındaki etkinlik kutusu bitmiş etkinliği göstermeyi bırakıp sonraki yaklaşan etkinliğe geçer; yoksa "Yaklaşan etkinlik kaydı yok" görünür.
- Menüdeki Gündem altındaki etkinlik bağlantısı.
- Sponsor olun sayfasındaki "ilk etkinliğimiz…" cümlesi.
- Ana sayfa ve sezon sayfasındaki Event şeması. Bitmiş bir etkinlik şemada tarihleriyle kalır ama `eventStatus` yazılmaz; etkinlik sayfası arama motorlarında doğru kalır.
- Yeni sezon içeriği: `season.year`, `season.status`, `season.description` ve `season.updatedAt`.

**Nasıl yeniden derlenir**

1. Yeni etkinliği `events` listesine ekleyin (`startDate`, `endDate`, `date`, `location`, `url`, `status: "published"`), bitenin kaydını silmeyin; `/etkinlikler/` altında "Geçmiş etkinlikler"de kalır.
2. Sonuç, program ve fotoğraflar onaylanınca etkinliğin `results`, `program`, `photos` alanlarına yazın.
3. Değişikliği `main` dalına gönderin; Vercel kendiliğinden derler. İçerik değişmediyse Vercel → Deployments → son dağıtım → Redeploy ile ya da `git commit --allow-empty -m "chore: rebuild"` ve push ile yeniden derleyin.
4. Derleme günlüğünün başındaki `Sezon:` satırı, hangi tarihten itibaren yeniden derlemek gerektiğini yazar.
5. Yayından sonra `npm run check:deploy -- https://team12414.com` çalıştırın.

İleride günlük derleme istenirse Vercel'de bir Deploy Hook oluşturup bir zamanlayıcıyla (örneğin günde bir GitHub Actions işi) çağırmak yeterlidir; bu ekip kararıyla şimdilik kurulmamıştır.

## Siteyi güncel tutmak: sorumlular ve sıklık

Eski içerik, hiç içerik olmamasından kötüdür. Bir kanalı en az ayda bir güncelleyemiyorsanız menüden kaldırın (boş arşivler zaten kendiliğinden gizlenir).

| Sorumluluk | Kim | Ne sıklıkla |
| --- | --- | --- |
| Site sahibi (teknik bakım, yayın) | Yazılım ekibinden 1 öğrenci + 1 mentor | Ayda bir kontrol |
| Takım Günlüğü, fotoğraf ve video | Medya ekibi | Her etkinlikten sonraki 1 hafta içinde |
| Robot sayfası | Teknik lider | Robot tanıtımında, her etkinlikten sonra |
| Sponsor sayfaları ve dosyası | İş geliştirme ekibi | Yeni sponsor geldiğinde; dosya yılda bir |
| İngilizce çeviriler | Her bölümün sorumlusu | Türkçe içerikle aynı gün |
| Devir teslim | Mezun olan site sahibi | Mezuniyetten önce, yazılı bir kılavuzla |

| Sezon dönemi | Siteye eklenecekler |
| --- | --- |
| Ocak başı (Kickoff) | Oyunun tanıtımı, Kickoff haberi; geri sayımı ilk etkinliğe çevir (`events`) |
| Ocak–Şubat (üretim) | Haftalık kısa üretim günlüğü, fotoğraflar |
| Robot tanıtımı | Yeni robot sayfası: fotoğraf, özellikler, tanıtım videosu |
| Mart–Nisan (turnuvalar) | Her turnuvadan sonra sonuç, ödül, etkinlik fotoğrafları (`events[].photos`), TBA bağlantısı |
| Mayıs–Haziran | Sezon özeti, CAD ve kod yayını; `season.updatedAt` güncelle |
| Yaz–sonbahar | Yeni liderler, sponsorluk dosyasının yeni yıl sürümü, outreach etkinlikleri |

Her yayından önce: `npm test`, `npm run build`, ana sayfayı 375 px genişlikte kontrol edin.
