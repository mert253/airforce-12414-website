import { siteConfig as content } from './site-config.js';
import { readFileSync } from 'node:fs';
import { localizedPath, siteContent, translator } from './locale.js';
import { renderHomeHero } from './home-hero.js';
import { selectUpcomingEvent, formatContentDate } from './season-utils.js';
import { buildContentRoutes, contentRoutes, renderContent, publishedRecords, safeImageSrc, safeObjectPosition, newestDate, newestYear } from './content-pages.js';

const teamName = 'AIR FORCE #12414';
const organization = 'Ankara İstech Robotics';
const logoPath = '/assets/logo-440.webp';
// Read the original script bytes so the bundler cannot change the hosting CSP hash.
const loaderBootstrap = readFileSync(new URL('./page-loader-bootstrap.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n').trim();
const e = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const published = items => publishedRecords(items).filter(item => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug || '') && String(item.title || item.name || '').trim());
const availableContent = new Set(contentRoutes.filter(route => !route.noindex).map(route => route.path));

function url(value) {
  if (typeof value !== 'string' || /[\x00-\x20\\]/.test(value)) return '';
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try { const parsed = new URL(value); return ['https:', 'http:', 'mailto:'].includes(parsed.protocol) ? value : ''; } catch { return ''; }
}
function a(label, href, attributes = '') {
  const safe = url(href);
  return safe ? `<a href="${e(safe)}" ${attributes}>${label}</a>` : `<span>${label}</span>`;
}
function icon(name = 'arrow') {
  const paths = {
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    external: '<path d="M5 19 19 5M5 5h14v14"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
}
function dims(w, h) { return Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0 ? ` width="${w}" height="${h}"` : ''; }
function img(src, alt, cls = '', w, h, lazy = true) {
  return safeImageSrc(src) ? `<img src="${e(safeImageSrc(src))}" alt="${e(alt)}" class="${cls}"${cls==='team-photo-image' ? ` style="object-position:${e(safeObjectPosition(content.teamPhotoPosition))}"` : ''}${dims(w,h)} ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">` : '';
}
function teamPhoto(content) {
  const photo = img(content.teamPhoto, content.teamPhotoAlt, 'team-photo-image', content.teamPhotoWidth, content.teamPhotoHeight);
  return photo ? `<figure class="home-team-photo" data-team-photo>
    <div class="photo-stage">${photo}</div>
    <figcaption>${teamName} · ${e(content.school.name)}</figcaption>
  </figure>` : '';
}
function teamPhotoPlaceholder(t) {
  const src = t('/assets/team-photo-placeholder-tr.png', '/assets/team-photo-placeholder-en.png');
  return `<figure class="home-team-photo">
    <div class="photo-stage">${img(src, t('Takım Fotoğrafı', 'Team Photo'), 'team-photo-image', 1280, 720)}</div>
  </figure>`;
}
function sponsorMark(sponsor) {
  return `<div class="home-partner">
    ${a(img(sponsor.logo, sponsor.name, '', sponsor.width, sponsor.height) || `<strong>${e(sponsor.name)}</strong>`, sponsor.url, 'target="_blank" rel="noopener noreferrer"')}
    <span>${e(sponsor.role)}</span>
  </div>`;
}

function archiveLinks(t) {
  return [
    [t('Haberler', 'News'), '/haberler/'],
    [t('Toplumsal etki', 'Outreach'), '/toplumsal-etki/'],
  ].filter(([, path]) => availableContent.has(path));
}
const galleryLinks = t => [[t('Takım galerisi', 'Team gallery'), '/galeri/'], [t('Proje galerisi', 'Project gallery'), '/proje-galerisi/']];

function homeContent(lang = 'tr') {
  const t = translator(lang);
  const content = siteContent(lang);
  const event = selectUpcomingEvent(content.events);
  const photo = teamPhoto(content);
  const robot = published(content.robots).sort(newestYear)[0];
  const news = published(content.news).sort(newestDate).slice(0, 3);
  const robotPhoto = robot && img(robot.image, robot.imageAlt || robot.name, 'robot-stage-image', robot.imageWidth, robot.imageHeight);
  const explore = archiveLinks(t).filter(([, href]) => href !== '/haberler/');
  if (availableContent.has('/kaynaklar/')) explore.push([t('Kaynaklar', 'Resources'), '/kaynaklar/']);
  const updated = formatContentDate(content.season?.updatedAt, lang);

  return `<section class="home-photo" aria-labelledby="team-photo-title"><div class="container">
    <div class="section-heading home-photo-heading"><h2 id="team-photo-title">${t('Takımımız', 'Our team')}</h2>
      <a class="text-link" href="/takim/">${t('Takımımızı tanıyın', 'Meet the team')} ${icon()}</a>
    </div>${photo || teamPhotoPlaceholder(t)}</div></section>
  <section class="section home-season-feature" id="sezon"><div class="container">
    <div class="editorial-label"><span>${t('Robotlar ve sezon', 'Robots and season')}</span></div>
    <div class="season-feature-grid" data-reveal>
      <div class="season-feature-title">
        <h2>${e(content.season?.year || '2027')}</h2>
        <p class="season-subtitle">${e(content.season?.status || t('Sezon durumu', 'Season status'))}</p>
        <a class="text-link" href="/robotlar/">${t('Sezonun ayrıntıları', 'Season details')} ${icon()}</a>
      </div>
      <div class="season-feature-body">
        <p>${e(content.season?.description || content.seasonStatus)}</p>
        ${updated ? `<dl class="home-season-summary"><div><dt>${t('Son güncelleme', 'Last updated')}</dt><dd><time datetime="${e(content.season.updatedAt)}">${e(updated)}</time></dd></div></dl>` : ''}
        ${event ? `<article class="season-event">
          <p class="eyebrow">${t('Yarışma takvimi', 'Competition schedule')}</p>
          <h3>${e(event.title)}</h3>
          <p class="season-date">${e(event.date)}</p>
          <p class="season-location">${e(event.location)}</p>
          <div class="event-countdown" data-countdown-start="${e(event.startDate)}" data-countdown-end="${e(event.endDate)}" aria-live="off" hidden></div>
          ${a(t('Resmî etkinlik bilgisi ', 'Official event information ') + icon('external'), event.url, 'class="text-link" target="_blank" rel="noopener noreferrer"')}
        </article>` : ''}
      </div>
    </div>
  </div></section>
  ${robot ? `<section class="section home-robot"><div class="container home-robot-grid" data-reveal>
    <div class="home-robot-copy"><h2>${e(robot.name || robot.title)}</h2>${robot.description ? `<p>${e(robot.description)}</p>` : ''}<a class="text-link" href="/robotlar/${e(robot.slug)}/">${t('Robotun teknik ayrıntıları', 'Robot specifications')} ${icon()}</a></div>
    ${robotPhoto ? `<div class="robot-stage">${robotPhoto}</div>` : ''}
  </div></section>` : ''}
  <section class="section home-frc home-frc-strip"><div class="container home-frc-grid" data-reveal>
    <div><p class="eyebrow">${t('Yarışmayı tanıyın', 'About the competition')}</p><h2>FIRST Robotics Competition</h2></div>
    <div><p>${t('Lise takımlarının her sezon yeni bir oyun için robot geliştirdiği uluslararası program.', 'An international program where high school teams build robots for a new game each season.')}</p><a class="text-link" href="/frc/">${t('FRC nasıl işliyor?', 'How does FRC work?')} ${icon()}</a></div>
  </div></section>
  <section class="section home-partners" id="sponsorlar"><div class="container" data-reveal>
    <div class="partners-layout"><div><h2>${t('Sponsorlarımız<br>ve kurumlar', 'Sponsors and<br>organizations')}</h2><a class="text-link" href="/sponsorluk/">${t('Kurumları tanıyın', 'Meet the organizations')} ${icon()}</a></div><div class="partner-marks">${[...content.sponsors, content.schoolMark, content.frcOrganizer].map(sponsorMark).join('')}</div></div>
    <div class="home-support"><div><h3>${t('AIR FORCE’a destek olun.', 'Support AIR FORCE.')}</h3><p>${t('Malzeme, üretim hizmeti veya yarışma desteği için bizimle iletişime geçin.', 'Get in touch to support the team with materials, manufacturing services or competition costs.')}</p></div><a class="button button-gold" href="/destek-ol/">${t('Sponsorluk seçenekleri', 'Ways to support')} ${icon()}</a></div>
  </div></section>
  ${explore.length ? `<section class="section home-explore"><div class="container" data-reveal>
    <h2 class="section-heading">${t('Takım arşivi', 'Team archive')}</h2><div class="explore-grid">
      ${explore.map(([label, href]) => `<a class="explore-card" href="${href}"><h3>${label}</h3>${icon()}</a>`).join('')}
    </div>
  </div></section>` : ''}
  ${news.length ? `<section class="section home-news"><div class="container">
    <div class="section-heading"><h2>${t('Haberler', 'News')}</h2><a class="text-link" href="/haberler/">${t('Tüm haberler', 'All news')} ${icon()}</a></div>
    <div class="content-grid cols-3">${news.map(item => { const date = formatContentDate(item.date, lang); return `<article class="content-card">
      ${item.image ? `<div class="card-media">${img(item.image, item.imageAlt || item.title)}</div>` : ''}
      <div class="card-body">${date ? `<time class="news-date" datetime="${e(item.date)}">${e(date)}</time>` : ''}<h3><a href="/haberler/${e(item.slug)}/">${e(item.title)}</a></h3>${item.summary ? `<p>${e(item.summary)}</p>` : ''}</div>
    </article>`; }).join('')}</div>
  </div></section>` : ''}`;
}

function buildPages(lang) {
  const t = translator(lang);
  const routes = lang === 'tr' ? contentRoutes : buildContentRoutes(content, lang);
  return [
    {path:'/', title:t('Ana Sayfa', 'Home'), description:t('AIR FORCE #12414, İSTEK Ankara Okulları FIRST Robotics Competition takımı.', 'AIR FORCE #12414, the FIRST Robotics Competition team of İSTEK Ankara Schools.'), body:()=>homeContent(lang)},
    ...routes.map(route => ({...route,body:()=>renderContent(route.kind,route.item,lang)})),
    {path:'/404.html',title:t('Sayfa bulunamadı', 'Page not found'),hidden:true,description:t('Bu adreste bir sayfa bulunamadı.', 'There is no page at this address.'),body:()=>`<div class="not-found"><p class="lead">${t('Bu adreste bir sayfa bulunamadı.', 'There is no page at this address.')}</p><a class="button button-gold" href="/">${t('Ana sayfaya dön', 'Back to home')}</a></div>`},
  ].map(page => {
    const path = localizedPath(page.path, lang);
    return {...page, lang, originalPath:page.path, path, file:path.slice(1) + (path.endsWith('/') ? 'index.html' : '')};
  });
}

export const pages = ['tr', 'en'].flatMap(buildPages);
const originalPaths = new Set(pages.filter(page => page.lang === 'tr').map(page => page.path));

export function pageLinks(html, lang) {
  if (lang !== 'en') return html;
  // Scope URL conversion to HTML href attributes and known page routes; files and hashes stay intact.
  return html.replace(/(\shref=")(\/(?!\/)[^"#?]*)([^\"]*)"/g, (all, prefix, path, suffix) =>
    originalPaths.has(path) ? `${prefix}${localizedPath(path, lang)}${suffix}"` : all);
}
function navHTML(page) {
  const t = translator(page.lang);
  const teamLinks = [
    [t('Biz kimiz?', 'About the team'), '/takim/'],
    [t('İSTEK Ankara Okulları', 'İSTEK Ankara Schools'), '/takim/#okulumuz'],
  ];
  if (publishedRecords(content.subteams).length) teamLinks.splice(1, 0, [t('Takım nasıl çalışıyor?', 'How the team works'), '/takim/#calisma-alanlari']);
  if (publishedRecords(content.students).length) teamLinks.push([t('Öğrenciler', 'Students'), '/takim/#ekip']);
  if (publishedRecords(content.mentors).length) teamLinks.push([t('Mentorlar', 'Mentors'), '/takim/#mentorlar']);
  if (availableContent.has('/takim/tarihce/')) teamLinks.push([t('Tarihçe', 'History'), '/takim/tarihce/']);
  if (availableContent.has('/takim/basarilar/')) teamLinks.push([t('Başarılar', 'Awards'), '/takim/basarilar/']);
  const robotLinks = [[t('Sezona genel bakış', 'Season overview'), '/robotlar/']];
  if (published(content.robots).length) robotLinks.push([t('Robot arşivi', 'Robot archive'), '/robotlar/#robot-arsivi']);
  const link = ([label, href], cls = 'nav-link') =>
    `<a href="${href}" class="${cls}${page.originalPath === href ? ' is-active' : ''}"${page.originalPath === href ? ' aria-current="page"' : ''}>${e(label)}</a>`;
  const group = (label, links) => `<details class="nav-group"${links.some(([, href]) => href.split('#')[0] === page.originalPath) ? ' data-current' : ''}>
    <summary>${label}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5"/></svg></summary>
    <div class="nav-dropdown">${links.map(item => link(item, 'nav-sub-link')).join('')}</div>
  </details>`;
  const archives = archiveLinks(t);
  const robotsLabel = t('Sezon ve robotlar', 'Season and robots');
  return group(t('Takımımız', 'Our team'), teamLinks) + (robotLinks.length > 1 ? group(robotsLabel, robotLinks) : link([robotsLabel, '/robotlar/'])) +
    link(['FIRST & FRC', '/frc/']) +
    group(t('Galeriler', 'Galleries'), galleryLinks(t)) +
    (archives.length ? group(t('Takımdan', 'Team updates'), archives) : '') +
    (availableContent.has('/kaynaklar/') ? link([t('Kaynaklar', 'Resources'), '/kaynaklar/']) : '') +
    group(t('Sponsorlar', 'Sponsors'), [[t('Sponsorlar ve kurumlar', 'Sponsors and organizations'), '/sponsorluk/'], [t('Sponsor olun', 'Sponsor the team'), '/destek-ol/']]) +
    link([t('İletişim', 'Contact'), '/iletisim/']);
}
function publicUrl(path) {
  try { const base=new URL(content.siteUrl);return base.protocol==='https:' ? new URL(path,base).href : ''; } catch {return '';}
}
function footerNavigation(t) {
  const teamLinks = [[t('Takımımız', 'Our team'), '/takim/'], [t('Robotlarımız', 'Our robots'), '/robotlar/'], ['FIRST & FRC', '/frc/']];
  if (availableContent.has('/takim/tarihce/')) teamLinks.push([t('Tarihçemiz', 'Our history'), '/takim/tarihce/']);
  if (availableContent.has('/takim/basarilar/')) teamLinks.push([t('Başarılarımız', 'Our awards'), '/takim/basarilar/']);
  const archive = [...galleryLinks(t), ...archiveLinks(t)];
  if (availableContent.has('/kaynaklar/')) archive.push([t('Kaynaklar', 'Resources'), '/kaynaklar/']);
  const links = items => items.map(([label, href]) => a(e(label), href)).join('');
  return `<nav aria-label="${t('Takım bağlantıları', 'Team links')}"><h2>${t('Takım', 'Team')}</h2>${links(teamLinks)}</nav>
    <nav aria-label="${t('Arşiv bağlantıları', 'Archive links')}"><h2>${t('Arşiv', 'Archive')}</h2>${links(archive)}</nav>
    <nav aria-label="${t('Destek ve iletişim', 'Support and contact')}"><h2>${t('Destek ve iletişim', 'Support and contact')}</h2>
      ${links([[t('Sponsorlarımız', 'Our sponsors'), '/sponsorluk/'], [t('Sponsor olun', 'Sponsor the team'), '/destek-ol/'], [t('İletişim', 'Contact'), '/iletisim/']])}
    </nav>`;
}
function siteHeader(page) {
  const lang = page.lang || 'tr';
  const t = translator(lang);
  const otherLang = t('en', 'tr');
  const alternate = localizedPath(page.hidden ? '/' : (page.originalPath || page.path), otherLang);
  return `<div class="page-loader" aria-hidden="true">
    <div class="page-loader-content">
      <div class="page-loader-emblem"><img class="page-loader-pegasus" src="/assets/pegasus-480.webp" alt="" width="480" height="480" decoding="async"><span class="page-loader-shine"></span></div>
      <p class="page-loader-brand">AIR <span>FORCE</span></p><span class="page-loader-number">FRC 12414</span>
    </div>
  </div>
  <div id="top" aria-hidden="true"></div>
  <a class="skip-link" href="#main">${t('İçeriğe geç', 'Skip to content')}</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${localizedPath('/', lang)}" aria-label="${t('AIR FORCE ana sayfa', 'AIR FORCE home')}"><img src="${logoPath}" alt="" width="440" height="197"></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation" aria-label="${t('Menüyü aç', 'Open menu')}" hidden>
        <span>${t('Menü', 'Menu')}</span><i aria-hidden="true"></i>
      </button>
      <nav id="navigation" aria-label="${t('Ana menü', 'Main menu')}">${pageLinks(navHTML(page), lang)}</nav>
      <a class="language-switch" href="${e(alternate)}" hreflang="${otherLang}" lang="${otherLang}" aria-label="${t('Switch to English', 'Türkçeye geç')}">${t('EN', 'TR')}</a>
    </div>
  </header>`;
}
function siteFooter(lang) {
  const t = translator(lang);
  const content = siteContent(lang);
  return `<footer class="site-footer">
    <figure class="footer-location">
      <div class="container footer-location-inner">
        <figcaption class="footer-location-caption">
          <span>Ankara</span>
          <small>Türkiye</small>
        </figcaption>
        <div class="footer-skyline" data-reveal>
          <img src="/assets/anitkabir-kocatepe-620.webp" alt="${t('Anıtkabir ve Kocatepe Camii silüeti', 'Silhouette of Anıtkabir and Kocatepe Mosque')}" width="620" height="207" loading="lazy" decoding="async">
        </div>
      </div>
    </figure>
    <div class="container">
      <div class="footer-main">
        <div class="footer-identity">
          <a href="${localizedPath('/', lang)}" class="footer-brand"><img src="${logoPath}" alt="AIR FORCE Ankara İstech Robotics" width="440" height="197" loading="lazy"></a>
          <p>${e(content.school.name)}<br>FIRST Robotics Competition · #12414</p>
          <div class="footer-contact">
            <span class="footer-email-row">${a(e(content.email), `mailto:${content.email}`)}${content.emailIsPlaceholder ? '' : `<span class="copy-email-wrap"><button type="button" class="copy-email-btn copy-email-btn--dark" data-copy-email="${e(content.email)}" aria-label="${e(t('E-posta adresini kopyala', 'Copy email address'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>${t('Kopyala', 'Copy')}</span></button><span class="sr-only" role="status" aria-live="polite" data-copy-status></span></span>`}</span>
            ${a('Instagram ' + icon('external'), content.instagram, 'target="_blank" rel="noopener noreferrer"')}
          </div>
        </div>
        ${pageLinks(footerNavigation(t), lang)}
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} AIR FORCE #12414</span><a href="#top">${t('Sayfanın başına dön', 'Back to top')} ↑</a></div>
    </div>
  </footer>
  <button type="button" class="back-to-top" data-back-to-top aria-label="${t('Sayfanın başına dön', 'Back to top')}" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></button>
  <dialog class="lightbox" aria-label="${t('Galeri fotoğrafı', 'Gallery photo')}">
    <div class="lightbox-toolbar"><span class="lightbox-position"></span><button type="button" class="lightbox-close" aria-label="${t('Fotoğrafı kapat', 'Close photo')}">${t('Kapat', 'Close')} ×</button></div>
    <div class="lightbox-stage"><button type="button" class="lightbox-prev" aria-label="${t('Önceki fotoğraf', 'Previous photo')}">←</button><img class="lightbox-image" alt=""><button type="button" class="lightbox-next" aria-label="${t('Sonraki fotoğraf', 'Next photo')}">→</button></div>
    <p class="lightbox-caption"></p>
  </dialog>
  <script type="module" src="/main.js"></script>`;
}
function pageIntroduction(page) {
  if (page.kind === 'resources' && page.noindex) return '';
  const t = translator(page.lang);
  const introductions = {
    team: t('Ankara İstech Robotics Force. İSTEK Ankara Okulları’nın FIRST Robotics Competition takımı.', 'Ankara İstech Robotics Force, the FIRST Robotics Competition team of İSTEK Ankara Schools.'),
    robots: t('AIR FORCE’un sezonları, robot geliştirme çalışmaları ve yarışma takvimi.', 'AIR FORCE seasons, robot development and competition schedule.'),
    sponsors: t('Robot geliştirme ve yarışma hazırlıklarımızı destekleyen kurumlarla tanışın.', 'Meet the organizations that support our robot development and competition preparation.'),
    support: t('Malzeme, üretim ve yarışma desteğinizle öğrencilerin mühendislik çalışmalarına katkı sağlayın.', 'Help students build and compete by supporting materials, manufacturing or competition costs.'),
    frc: t('Bir mühendislik problemi, bir robot ve birlikte çalışan takımlar.', 'An engineering challenge, a robot and teams working together.'),
    contact: t('Takım çalışmaları ve sponsorluk için bize ulaşın.', 'Contact us about team projects and sponsorship.'),
    gallery: t('AIR FORCE’un takım, atölye ve yarışma fotoğrafları ile videoları.', 'AIR FORCE photos and videos from the team, workshop and competitions.'),
    projectGallery: t('AIR FORCE’un sosyal sorumluluk çalışmalarından fotoğraflar.', 'Photos from AIR FORCE community outreach projects.'),
    resources: t('FRC takımlarının kendi çalışmalarına uyarlayabileceği dosyalar.', 'Files that FRC teams can adapt for their own work.'),
  };
  return introductions[page.kind] ? `<p>${e(introductions[page.kind])}</p>` : '';
}
function buildStructuredData(page, lang) {
  const t = translator(lang);
  const localized = siteContent(lang);
  const originalPath = page.originalPath || page.path;
  const home = originalPath === '/';
  const graph = [];

  if (home) {
    graph.push({
      '@type': 'Organization',
      name: teamName,
      alternateName: organization,
      email: localized.email,
      parentOrganization: { '@type': 'EducationalOrganization', name: localized.school.name, url: localized.school.url },
      sameAs: [localized.instagram],
      ...(publicUrl('/') ? { url: publicUrl('/'), logo: publicUrl(logoPath) } : {}),
    });
  } else if (!page.hidden) {
    const homeUrl = publicUrl(localizedPath('/', lang));
    const currentUrl = publicUrl(page.path);
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('Ana sayfa', 'Home'), ...(homeUrl ? { item: homeUrl } : {}) },
        { '@type': 'ListItem', position: 2, name: page.title, ...(currentUrl ? { item: currentUrl } : {}) },
      ],
    });
  }

  if (home || page.kind === 'robots') {
    const event = selectUpcomingEvent(localized.events);
    if (event) {
      graph.push({
        '@type': 'Event',
        name: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: { '@type': 'Place', name: event.location },
        ...(url(event.url) ? { url: event.url } : {}),
        organizer: { '@type': 'Organization', name: localized.frcOrganizer.name, url: localized.frcOrganizer.url },
      });
    }
  }

  if (page.kind === 'contact') {
    const faqs = publishedRecords(localized.faq).filter(item => item.question && item.answer);
    if (faqs.length) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      });
    }
  }

  if (!graph.length) return '';
  const payload = graph.length === 1
    ? { '@context': 'https://schema.org', ...graph[0] }
    : { '@context': 'https://schema.org', '@graph': graph };
  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;
}
export function renderPage(html,page) {
  const lang = page.lang || 'tr';
  const t = translator(lang);
  const originalPath = page.originalPath || page.path;
  const home=originalPath==='/';
  const title=home ? `${teamName} | ${organization}` : `${page.title} | ${teamName}`;
  const canonical=publicUrl(page.path);
  const ogImage=publicUrl('/assets/pegasus.png');
  const noindex = page.hidden || page.noindex;
  const alternates = noindex ? '' : ['tr', 'en', 'x-default'].map(code => {
    const path = localizedPath(originalPath, code === 'x-default' ? 'tr' : code);
    return `<link rel="alternate" hreflang="${code}" href="${e(publicUrl(path) || path)}" vite-ignore>`;
  }).join('');
  const structuredData = buildStructuredData(page, lang);
  return html
    .replace('<html lang="tr">', `<html lang="${lang}">`)
    .replace('<!-- site-hero -->', () => pageLinks(renderHomeHero(lang), lang))
    .replace('<!-- site-head -->',()=>`<meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#0b1728"><meta name="description" content="${e(page.description)}"><title>${e(title)}</title><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(page.description)}"><meta property="og:type" content="website"><meta property="og:site_name" content="${teamName}"><meta property="og:locale" content="${t('tr_TR', 'en_GB')}"><meta property="og:locale:alternate" content="${t('en_GB', 'tr_TR')}"><meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">${noindex ? '<meta name="robots" content="noindex, follow">':''}${canonical&&!noindex ? `<link rel="canonical" href="${e(canonical)}"><meta property="og:url" content="${e(canonical)}">`:''}${ogImage ? `<meta property="og:image" content="${e(ogImage)}">`:''}${structuredData}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/logo.png"><link rel="manifest" href="/manifest.webmanifest"><link rel="preload" href="/assets/fonts/e4af272ccee01ff0-s.p.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/fonts/reference-fonts.css"><link rel="stylesheet" href="/styles.css">`)
    .replace('<meta charset="UTF-8">', () => `<meta charset="UTF-8"><script>${loaderBootstrap}</script>`)
    .replace('<!-- site-header -->',()=>siteHeader(page))
    .replace('<link rel="stylesheet" href="/styles.css">', '<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/content-extras.css"><link rel="stylesheet" href="/redesign.css"><link rel="stylesheet" href="/page-redesign.css"><link rel="stylesheet" href="/page-loader.css">')
    .replace('<!-- site-content -->',()=>pageLinks(home ? page.body() : `<header class="page-heading${['support', 'sponsors', 'contact'].includes(page.kind) ? ' page-heading-compact' : ''}"><nav class="breadcrumb" aria-label="${t('Sayfa yolu', 'Breadcrumb')}"><a href="/">${t('Ana sayfa', 'Home')}</a><span aria-hidden="true">/</span><span>${e(page.title)}</span></nav><h1>${e(page.title)}</h1>${pageIntroduction(page)}</header>${page.body()}`, lang))
    .replace('<!-- site-footer -->',()=>siteFooter(lang))
    .replace('</head>', () => `${alternates}</head>`);
}
