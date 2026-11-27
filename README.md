# AIR FORCE #12414

İSTEK Ankara Okulları’nın FIRST Robotics Competition takımı AIR FORCE’un Türkçe ve İngilizce web sitesi.

- Ana adres: https://team12414.com (alan adı henüz bağlı değil; DNS kaydı yok)
- Çalışan geçici adres: https://air-force-12414-v2.vercel.app/

## Yerelde çalıştırma

Node.js 24 ile:

```sh
npm ci
npm run dev
```

`npm test` site testlerini çalıştırır. `npm run build` statik siteyi `dist/` klasörüne üretir.

Yayına aldıktan sonra (önizleme veya canlı adres) sunucu davranışını denetlemek için: `npm run check:deploy -- https://team12414.com`. Bilinmeyen `/en/` adreslerinin İngilizce 404 sayfasını 404 koduyla sunması, eğik çizgi yönlendirmesi, güvenlik başlıkları ve yazı tipi önbelleği kontrol edilir. Yerelde `vite preview` yalnızca ilk üç denetimi geçer; başlık denetimleri Vercel'e özgüdür.

Takım içeriği `site-config.js` üzerinden düzenlenir. [İçerik kılavuzu](ICERIK.md) ve [görsel kaynakları](ASSET-SOURCES.md) depoda yer alır.
