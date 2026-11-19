# Görsel ve tasarım kaynakları

Yayın incelemesinde 3M logosu, önceki İSTEK görseli ve sponsorluk sunumları `.publication-review/` klasörüne taşındı. Daha sonra okul ve FRC organizatörü için kendi sitelerindeki görseller yayına alındı.

- `public/assets/sponsors/istek-ankara-logo.png`: https://ankara.istek.k12.tr/sites/default/files/istek-ankara-logo.png
- `public/assets/sponsors/fikret-yuksel-egitim-vakfi.png`: https://fyf.org.tr/wp-content/uploads/2025/05/FYV-Egitim-LOGO-300x288.png

## Güncel düzen — 11 Kasım 2026, Team 254 × Simbotics

- https://www.team254.com/ : gruplanmış menü, robot arşivi ve sezon detayı, sponsor/destek ayrımı, geniş alt menü.
- https://www.simbotics.org/about/ : ferah takım tanıtımı, büyük fotoğraf/metin eşleşmeleri ve sade içerik akışı. Tarihçe ve robot sayfaları arşiv yapısı için incelendi.
- Bu referanslardan takım fotoğrafı, metin, başarı, robot veya kişi bilgisi kopyalanmadı. AIR FORCE içeriği ve kullanıcı görselleri korundu.
- Güncel tipografi Inter. Önceki Barlow dosyaları diskte bulunuyor ancak yeni başlıklarda kullanılmıyor.
- 3M logosunun kendi kırmızı rengi korundu. Beyaz İSTEK logosu lacivert bir zeminle gösteriliyor; mevcut kaynak görseller yeniden boyanmadı.
- Yerel figür, logo ve okul görseli Figma'daki yeni native tasarıma da aktarıldı. Masaüstü ana sayfa, takım sayfası ve mobil tasarım: https://www.figma.com/design/D6HrQH1o9uWoF7ESKsUrQF?node-id=13-240

Önceki düzenlere ait aşağıdaki notlar varlıkların kökenini korumak içindir.

## Güncel üst bant: yalnızca Anıtkabir ve Kocatepe

- Kullanıcının son düzeltmesiyle önceki şehir silüeti kullanım dışı bırakıldı. Kullanılan dosya: `public/assets/anitkabir-kocatepe.png`.
- Yerleşik görsel üretim aracıyla, önceki silüet referans alınarak üretildi. Son yönergenin amacı: yalnızca solda Anıtkabir, yanında sağda Kocatepe; başka bina veya kule olmadan şeffaf zeminde sade gümüş silüet, doğal mimari oranlar, metinsiz.
- Bant ve mobil menü sitenin `--navy` rengini kullanır. Görsel `--muted` gümüş rengine maskelenir; `contain` oranı korur ve iki yapının tamamını gösterir. Önceki mavi zemin kaldırıldı.
- Görsel üretim yönergesi: "Replace this cluttered Ankara skyline with a beautifully clean minimal architectural silhouette of ONLY TWO LANDMARKS: Anitkabir mausoleum on the left, Kocatepe Mosque on the right. REMOVE Atakule, castle, every house and every other building completely. Two buildings next to each other on one baseline, with a small clean gap. Anitkabir must have its correct broad rectangular flat roof, colonnaded facade and shallow stepped base. Kocatepe has its central dome, smaller half-domes and four slender minarets. Preserve elegant believable architectural proportions, do NOT squash vertically. Single flat pale silver silhouette, with sharp transparent negative-space openings, clean vector-like contours, ZERO texture, no shadows, no colored fringe, no stray pixels. Transparent background, no sky, no lettering, no scene. Wide 3:1 landscape canvas; tight composition, buildings occupy 90 percent of width and tallest minarets reach near top of canvas. All bases aligned at bottom. This is a refined subtle silhouette decoration for a dark navy website header. Must contain ONLY the mausoleum and mosque."

## Ankara üst bandı — 11 Kasım 2026

- Kullanıcının gönderdiği Team 254 üst menü ekran görüntüsü, 78 px civarı lacivert bant ve arkasındaki silüetin yerleşim referansıdır.
- `public/assets/ankara-skyline.png`: Yerleşik görsel üretim aracıyla oluşturulan dekoratif Ankara yorumu. Ankara Kalesi, Anıtkabir, Atakule ve Kocatepe içerir. Fotoğraf veya ölçekli mimari çizim değildir.
- Son üretim yönergesi: "Refine this into a clean website skyline strip. Keep Ankara Castle, broad flat roofed Anitkabir with columns, Atakule and Kocatepe silhouettes in their same left-to-right order. CRITICAL: ALL architectural artwork occupies ONLY the bottom 20 percent of this wide canvas. Top 80 percent completely transparent empty. The architecture forms a very low, very wide panoramic band approximately 12:1 width to tallest building height. Compress and simplify the buildings to suit that shallow band. Use ONLY one solid flat silver color, perfectly clean edges and transparent cutouts. Remove EVERY blue/cyan/purple noisy halo and white speckle. No shading, no glowing edges, no textures, no pale opaque sky. Simple professional vector-style single color silhouette with clear rectangular Anitkabir columns. Flat bottom edge exactly flush with bottom canvas. Do not add text."
- CSS alfa maskesiyle tek gümüş renk, masaüstünde %20 opaklık ve lacivert zemin kullanılır. İlk sürümdeki bağımsız genişlik/yükseklik ölçeklemesi kaldırıldı: `mask-size: 100% auto` görselin doğal oranını korur. Üst bant masaüstünde 112 px, mobilde 88 px. Mobil menü aynı zeminde açılır. Pegasus dosyası ve hareketi değiştirilmedi.
- Derleme ve yerel dosya sunumu kontrol edildi. Önceki kayıtlı tarayıcı erişim engeli nedeniyle bu düzenlemenin tarayıcı görsel doğrulaması yapılmadı.

11 Kasım 2026 tarihli yerel düzenleme.

## Tasarım referansı

- https://irs5993.com/ ve https://irs5993.com/sponsors
- İncelenen davranışlar: 64 px sabit başlık, masaüstünde 1152 px içerik genişliği, tam ekran açılış, Barlow Condensed başlıklar, iki sütunlu tanıtım ve sezon bölümleri, kayan sponsor şeridi, fotoğraf galerisi, mobil açılır menü.
- AIR FORCE için lacivert / altın / gümüş renkler, Türkçe içerik, mevcut hareketli Pegasus ve gerçek takım bilgileri kullanıldı. IRS takım fotoğrafları, ödülleri, robot bilgileri veya metinleri taşınmadı.

## Logolar

- `public/assets/logo.png` ve `pegasus.png`: Kullanıcının sağladığı mevcut AIR FORCE varlıkları; bu düzenlemede değiştirilmedi.
- `public/assets/sponsors/3m.svg`: https://upload.wikimedia.org/wikipedia/commons/1/15/3M_wordmark.svg
  - Dosya kaydı ve 3M kurumsal kimlik kaynağı: https://commons.wikimedia.org/wiki/File:3M_wordmark.svg
  - Kontrol edilen resmî medya galerisi: https://news.3m.com/media-gallery . Bu sayfanın yüksek çözünürlüklü dosya bağlantısı 404 döndüğü için kurumsal kaynağı belirten SVG kopyası kullanıldı.
- `public/assets/sponsors/istek-okullari-reference.png`: https://irs5993.com/images/sponsors/sponsor_0_2.png
  - Referans sitenin şeffaf, daha büyük İSTEK logosu. İSTEK'in resmî logo sayfasındaki işaretle karşılaştırıldı: https://www.istek.k12.tr/logolarimiz
  - Resmî küçük şeffaf sürüm: https://www.istek.k12.tr/dist/images/istek_logo.png
  - Resmî renkli referans: https://www.istek.k12.tr/userfiles/files/stek-okullari-ana-logo-1(1).jpg
- Sponsor logoları kaynak sitenin görünümüne uygun olarak CSS ile tek renk gösterilir; kaynak dosyaların geometrisi değiştirilmedi. Site İSTEK'i okul, 3M'i sponsor olarak tanımlar.

## Yazı tipleri

- Barlow Condensed normal 700 / 900 ve Inter: referansın açık kaynak yazı tipleri yerel WOFF2 dosyaları olarak saklanır.
- Kaynak stil: https://irs5993.com/_next/static/css/e4dde1a961cb9f7f.css
- Türkçe karakterler için Latin Extended alt kümeleri de indirildi. Kullanılan yüzler ve dosya yolları `public/assets/fonts/reference-fonts.css` içinde kayıtlıdır.
- Barlow lisansı: `public/assets/fonts/OFL.txt`; Inter lisansı: `public/assets/fonts/Inter-OFL.txt`.

## Sonradan eklenecek fotoğraflar

Takım fotoğrafı henüz sağlanmadı. `site-config.js` içindeki `teamPhoto` ve `gallery` alanları gerçek fotoğraflar geldiğinde doldurulur. Hazır fotoğraf ya da başka takımın fotoğrafı kullanılmaz.
