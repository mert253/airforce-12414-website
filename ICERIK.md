# AIR FORCE içerik rehberi

Takım içeriği `site-config.js` dosyasından yönetilir. Fotoğraf, PDF ve diğer dosyaları `public/assets/` klasörüne koyun. Tüm ana bölümlerin sayfaları hazırdır; içerik gelince yeniden tasarım gerekmez.

## Taslak → yayın

Dosyanın sonundaki `contentTemplates` örneklerinden ihtiyacınız olan kaydı kopyalayın ve ilgili listeye ekleyin. Bu şablonlar kendiliğinden yayımlanmaz.

1. `status: "draft"` olarak başlayın. Taslak, sitede ve arşiv aramasında görünmez.
2. Gerçek metinleri, görselleri ve bağlantıları doldurun.
3. Hazır olduğunda `status: "published"` yapın.
4. `npm run build` ile yeniden üretin. Robot/proje/haber sayfası ve arşiv bağlantısı oluşur.

**Durumu olmayan kayıtlar da yayımlanmaz.** Bu kural öğrenci, mentor, tarihçe, ödül, kaynak, galeri, video, etkinlik ve SSS kayıtlarında da geçerlidir. Genel takım kimliği, ana takım fotoğrafı ve mevcut sponsor listesi bağımsızdır.

Haber, proje ve kaynak arşivlerinin bağlantıları yayımlanmış içerik eklendiğinde menüye gelir. Takım galerisi ve Proje galerisi, **Galeriler** menüsünde her zaman erişilebilir. Fotoğraf veya video gelene kadar kısa bir açıklama gösterilir.

## Türkçe ve İngilizce içerik

Bir kaydın Türkçe metnini doğrudan ilgili alanlara yazın. İngilizce karşılıkları aynı kayıttaki `en` nesnesine ekleyin. Örneğin `subteams` kaydında `name` ve `description`, `resources` kaydında `title`, `description`, `topic`, `category` ve `level` alanlarına çeviri gerekir. İngilizce dosya ayrıysa `en.url` alanını da girin. Yayın durumu, içerik adresini belirleyen `slug` ve ISO biçimindeki tarihler iki dilde ortaktır. İngilizce sayfaların adresleri `/en/` ile başlar.

Sezon ve okul bilgisi, ana takım fotoğrafının alternatif metni ve sponsorluk sunumu gibi genel alanların karşılıkları `siteConfig.en` nesnesine yazılır. Sponsorluk PDF’sinin iki dildeki sürümlerini birlikte güncelleyin.

## Hangi liste neyi yönetir?

| Liste / alan | Kullanıldığı yer |
| --- | --- |
| `school` | Okul adı ve resmî bağlantısı |
| `siteUrl` | Gerçek HTTPS alan adı; yerelde boş kalabilir |
| `seasonStatus` | Kısa sezon açıklaması |
| `season` | Sezon yılı, mevcut durum, açıklama ve gerçek son güncelleme tarihi |
| `teamPhoto`, `teamPhotoAlt` | Ana sayfa takım görseli, takım sayfası ve galeri |
| `students`, `mentors`, `subteams` | Kadro, mentorlar ve çalışma alanları |
| `history`, `awards` | Tarihçe ve başarı arşivi |
| `robots` | Robot arşivi ve detayları |
| `projects` | Toplumsal etki arşivi ve detayları |
| `resources` | Konuya göre filtrelenen kaynak kütüphanesi |
| `news` | Haber arşivi ve ayrı yazı sayfaları |
| `gallery`, `videos` | Fotoğraf galerisi ve video bağlantıları |
| `sponsors` | Gerçek takım sponsorları; okul `schoolMark`, organizatör `frcOrganizer` alanındadır |
| `sponsorNeeds` | Sponsorlar ve Destek olun sayfalarının ortak ihtiyaç listesi |
| `sponsorshipFile` | Destek sayfasındaki indirilebilir takım sunumu |
| `email`, `instagram` | İletişim ve destek bağlantıları |
| `events`, `faq` | Takvim ve sık sorulanlar |

## Takım fotoğrafı

Fotoğrafı örneğin `public/assets/takim.jpg` olarak kaydedin:

```js
teamPhoto: "/assets/takim.jpg",
teamPhotoAlt: "AIR FORCE 12414 takımı okul atölyesinde",
teamPhotoWidth: 1600,
teamPhotoHeight: 900,
teamPhotoPosition: "center",
```

Gerçek piksel ölçülerini ve fotoğrafı açıklayan kısa metni yazın. İngilizce alternatif metni `siteConfig.en.teamPhotoAlt` alanına ekleyin. Fotoğraf eklendiğinde ana sayfada Pegasus açılışının hemen altında, Takımımız sayfasında ve takım galerisinde görünür. Telefon görünümünde fotoğrafın tamamı gösterilir.

Ana sayfa ve sezon sayfasında, yayımlanmış etkinlikler arasından tarihi en yakın ve henüz bitmemiş olan gösterilir. `startDate` ve `endDate` alanlarını `2027-03-19` biçiminde yazın. Görünen tarih metni `date`, konum `location`, resmî bağlantı `url` alanından gelir. Tarih seçimi Türkiye saatine göre site üretilirken yapılır; takvim değiştiğinde veya bir etkinlik bittikten sonra siteyi yeniden üretin. Tamamlanan etkinlikler iletişim sayfasındaki takvim kaydında korunur.

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

Robotlar sezon yılına göre yeniden eskiye sıralanır. Haber tarihlerini `YYYY-MM-DD` (yıl-ay-gün) biçiminde yazın; haberler de yeniden eskiye sıralanır. Başlığı veya robot adı boş kayıtlar, yayımlanmış olarak işaretlense bile detay sayfası oluşturmaz. Aynı listede iki yayımlanmış kaydın slug değeri aynıysa derleme açıklayıcı bir hata ile durur; slug değerlerinden birini düzeltin.

## Proje ve haber sayfaları

`contentTemplates.project` ve `contentTemplates.news` örneklerini kullanın. `slug`, başlık ve `status` gereklidir. Yayımlanan proje `/toplumsal-etki/slug/`, haber `/haberler/slug/` adresini alır.

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

3. Bir sosyal sorumluluk etkinliğinin fotoğrafları için aynı kayıt biçimini ilgili `projects` kaydının `photos` listesinde kullanın. Fotoğraflar projenin kendi sayfasında ve `/proje-galerisi/` adresindeki albümünde otomatik görünür. Proje kaydı ve fotoğrafları `published` olmalıdır. Proje tarihini `YYYY-AA-GG` biçiminde yazın.

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

Takım fotoğrafı, galeri ve öğrenci bilgileri eklenmeden önce okulun yayın onayını ve geçerli kişisel veri işleme koşullarını doğrulayın. Okul, siteye özel KVKK bilgilendirmesini hazırlarken barındırma ve takım e-postasının nasıl işlendiğini de değerlendirmeli. Üçüncü taraf görsellerini doğrudan yüklemek yerine yayını onaylanmış dosyaları kendi sitenizden sunun.

E-posta `airforce@istek.k12.tr`. `emailIsPlaceholder: false` gerçek adresi tıklanabilir yapar. Takıma katılım veya öğrenci/mentor başvuru formu yoktur.

## Kontrol ve yayın

```text
npm run dev
node --test content-pages.test.js
npm run build
```

İçerik değişikliklerini kaydedin; gerekirse geliştirme sunucusunu yeniden başlatın. Yayın dosyaları `dist` klasöründedir. Her yeni kayıt için yeniden derleyip yeni çıktıyı yükleyin.

**Özel belgeleri ve taslak dosyaları `public` içine koymayın.** Bu klasördeki dosyalar bağlantısı olmasa da yayımlanır. Yayımlanmayacak dosyalar için `public` dışındaki bir klasör kullanın.

Bilinmeyen adresler `404.html` sayfasını 404 durum koduyla döndürmeli. Domain bağlandığında `siteUrl` alanına gerçek HTTPS adresini yazın. Sosyal paylaşım ve canonical adresler bu alanı kullanır.
