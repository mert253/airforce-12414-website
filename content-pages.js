import { siteConfig as content } from './site-config.js';
import { selectUpcomingEvent, formatContentDate } from './season-utils.js';
import { localizeRecord, siteContent, translator } from './locale.js';

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const e = escapeHtml;

// Only deliberately published records enter public pages or generated routes.
export const publishedRecords = (items = []) => (Array.isArray(items) ? items : []).filter(item => item && typeof item === 'object' && item.status === 'published');
export function safeHref(value) {
  if (typeof value !== 'string' || !value || /[\\\u0000-\u0020]/.test(value)) return '';
  if ((value.startsWith('/') && !value.startsWith('//')) || /^#[a-zA-Z0-9_-]+$/.test(value)) return value;
  try { const url = new URL(value); return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? value : ''; } catch { return ''; }
}
export function safeImageSrc(value) { const href = safeHref(value); return href && !href.startsWith('mailto:') && !href.startsWith('#') ? href : ''; }
export function safeObjectPosition(value) {
  const tokens = typeof value === 'string' ? value.trim().split(/\s+/) : [];
  return tokens.length >= 1 && tokens.length <= 2 && tokens.every(token => /^(left|right|top|bottom|center)$/.test(token) || (/^\d+(?:\.\d+)?%$/.test(token) && parseFloat(token) <= 100)) ? tokens.join(' ') : 'center';
}
function anchor(label, url, className = 'text-link', external = false) {
  const href = safeHref(url);
  return href ? `<a class="${className}" href="${e(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${e(label)}${arrow()}</a>` : '';
}
function arrow() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'; }
function icon(type = 'camera') {
  const shape = {
    camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4Z"/><circle cx="12" cy="13" r="4"/>',
    robot: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M12 3v4M8 12h1m6 0h1m-8 4h8"/>',
    book: '<path d="M12 5v15M12 5C8 2 4 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-2-1-6-2-10 1Z"/>',
    medal: '<circle cx="12" cy="10" r="6"/><path d="m7 14-2 8 7-4 7 4-2-8"/>',
    people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 6 9 7 9-7"/>',
    play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M7 2v6m10-6v6M3 11h18"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${shape[type] || shape.camera}</svg>`;
}
function image(source, alt, width = 1600, height = 1000, className = '', position = '') {
  const src = safeImageSrc(source);
  if (!src) return '';
  const sizes = Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0 ? ` width="${width}" height="${height}"` : '';
  return `<img${className ? ` class="${className}"` : ''} src="${e(src)}" alt="${e(alt)}"${sizes}${position ? ` style="object-position:${safeObjectPosition(position)}"` : ''} loading="lazy" decoding="async">`;
}
function placeholder(label, type = 'camera', extra = '') { return `<div class="media-placeholder ${extra}">${icon(type)}<span>${e(label)}</span></div>`; }
function itemImage(item, label = 'AIR FORCE #12414', type = 'camera') { return image(item?.image, item?.imageAlt || item?.title || item?.name, item?.imageWidth, item?.imageHeight) || placeholder(label, type); }
function heading(kicker, title, copy = '', link = '') { return `<div class="section-heading"><div><p class="eyebrow">${e(kicker)}</p><h2>${e(title)}</h2>${copy ? `<p>${e(copy)}</p>` : ''}</div>${link}</div>`; }
function para(value) { return value ? `<p>${e(value)}</p>` : ''; }
function specList(items) { return `<dl class="spec-list">${items.map(([key, val]) => `<div><dt>${e(key)}</dt><dd>${e(val || '—')}</dd></div>`).join('')}</dl>`; }
function sectionNav(items, t) { return `<nav class="section-nav" aria-label="${t('Bu sayfada', 'On this page')}">${items.map(([label, id]) => `<a href="#${e(id)}">${e(label)}</a>`).join('')}</nav>`; }
function status(text) { return `<span class="status-label">${e(text)}</span>`; }
function filterBar(categories, label, t) { return `<div class="filter-bar"><div class="filter-options" role="group" aria-label="${t('Kategori seçin', 'Choose a category')}"><button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true">${t('Tümü', 'All')}</button>${categories.map(name => `<button class="filter-button" type="button" data-filter="${e(name)}" aria-pressed="false">${e(name)}</button>`).join('')}</div><label class="search-label"><span class="sr-only">${e(label)}</span><input class="search-input" type="search" data-search placeholder="${e(label)}"></label><p class="filter-count" data-filter-count role="status" aria-live="polite"></p></div>`; }
function filterAttrs(category, text) { return `data-filter-item data-category="${e(category)}" data-search-text="${e(text)}"`; }
function filterEmpty(t) { return `<p class="empty-note filter-empty" data-filter-empty hidden>${t('Bu aramada sonuç bulunamadı. Başka bir kelime veya kategori deneyin.', 'No results found. Try a different search term or category.')}</p>`; }
function emptyCollection(title, copy, label, href) {
  return `<section class="section"><div class="archive-empty"><h2>${e(title)}</h2><p>${e(copy)}</p>${anchor(label, href)}</div></section>`;
}
function allPhotos(data, t) {
  return [...(safeImageSrc(data.teamPhoto) ? [{ src: data.teamPhoto, alt: data.teamPhotoAlt, width: data.teamPhotoWidth, height: data.teamPhotoHeight, category: t('Takım', 'Team'), status: 'published' }] : []), ...publishedRecords(data.gallery)].filter(item => safeImageSrc(item.src));
}
function galleryPhotos(items) {
  return publishedRecords(items).filter(item => safeImageSrc(item.src));
}
const titledRecords = items => publishedRecords(items).filter(item => String(item.title || '').trim());
const publicResources = items => titledRecords(items).filter(item => safeHref(item.url));
const publicVideos = items => titledRecords(items).filter(item => safeHref(item.url));
function galleryPhoto(photo, t) {
  const caption = photo.caption || photo.alt;
  const action = t('Fotoğrafı büyüt', 'Enlarge photo');
  const label = photo.alt ? `${action}: ${photo.alt}` : action;
  return `<figure class="gallery-card" ${filterAttrs(photo.category || t('Takım', 'Team'), `${photo.alt || ''} ${photo.caption || ''} ${photo.category || ''}`)}>
    <a class="gallery-image" href="${e(safeImageSrc(photo.src))}" data-gallery-image data-src="${e(safeImageSrc(photo.src))}" data-alt="${e(photo.alt)}" data-caption="${e(caption)}" aria-label="${e(label)}">
      ${image(photo.src, photo.alt, photo.width, photo.height)}<span class="gallery-expand" aria-hidden="true">↗</span>
    </a>${caption ? `<figcaption>${e(caption)}</figcaption>` : ''}
  </figure>`;
}
function validSlug(item) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item?.slug ?? ''); }
function routable(items) { return publishedRecords(items).filter(item => validSlug(item) && String(item.title || item.name || '').trim()); }
function projectAlbums(projects) {
  return routable(projects).sort(newestDate)
    .map(project => ({ project, photos: galleryPhotos(project.photos) }))
    .filter(album => album.photos.length);
}
export const galleryLinks = [
  ['Takım galerisi', '/galeri/'],
  ['Proje galerisi', '/proje-galerisi/'],
];
function galleryNav(currentPath, t) {
  const links = t(galleryLinks, [['Team gallery', '/galeri/'], ['Project gallery', '/proje-galerisi/']]);
  return `<nav class="gallery-nav" aria-label="${t('Galeriler', 'Galleries')}">${links.map(([label, path]) =>
    `<a href="${path}"${path === currentPath ? ' aria-current="page"' : ''}>${e(label)}</a>`).join('')}</nav>`;
}
export const newestYear = (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0);
export const newestDate = (a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0);
const yearLabels = (items) => [...new Set(items.map(item => item.year).filter(year => year != null && year !== '').map(year => String(year).trim()).filter(Boolean))];
const routes = [
  ['team', '/takim/', 'Takımımız', 'AIR FORCE 12414', 'AIR FORCE #12414, İSTEK Ankara Okulları bünyesinde 2027 FRC sezonuna hazırlanan robotik takımı.'],
  ['history', '/takim/tarihce/', 'Hikâyemiz', 'Dünden bugüne', 'AIR FORCE #12414 takımının sezonlara göre hikâyesi.'],
  ['awards', '/takim/basarilar/', 'Başarılarımız', 'Sezon arşivi', 'AIR FORCE #12414 yarışma sonuçları ve ödülleri için sezon arşivi.'],
  ['robots', '/robotlar/', 'Sezon ve robotlar', 'AIR FORCE 12414', 'AIR FORCE sezon durumu, yarışma takvimi ve yayımlanan robot kayıtları.'],
  ['robot', '/robotlar/ilk-robot/', 'İlk robotumuz', 'Robot tanıtımı', 'AIR FORCE #12414 ilk robotu için teknik bilgiler, sezon sonuçları ve medya alanı.'],
  ['impact', '/toplumsal-etki/', 'Toplumsal etki', 'Robotun ötesinde', 'AIR FORCE eğitim, paylaşım ve toplumsal etki projeleri.'],
  ['resources', '/kaynaklar/', 'Kaynaklar', 'Öğren. Üret. Paylaş.', 'AIR FORCE teknik kaynakları: mekanik, elektronik, yazılım, strateji ve takım çalışmaları.'],
  ['news', '/haberler/', 'Takımdan haberler', 'AIR FORCE günlüğü', 'AIR FORCE #12414 atölye, sezon ve takım haberleri.'],
  ['gallery', '/galeri/', 'Takım galerisi', 'Takım ve etkinlik fotoğrafları', 'AIR FORCE #12414 takım, atölye ve yarışma fotoğrafları ile videoları.'],
  ['projectGallery', '/proje-galerisi/', 'Proje galerisi', 'Sosyal sorumluluk', 'AIR FORCE #12414 sosyal sorumluluk projelerinin fotoğraf albümleri.'],
  ['frc', '/frc/', 'FIRST & FRC', 'Bir robotun ötesi', 'FIRST Robotics Competition ve AIR FORCE takımının yer aldığı robotik programı.'],
  ['sponsors', '/sponsorluk/', 'Sponsorlar ve kurumlar', 'Sponsorluk', 'AIR FORCE #12414 sponsorları, okulumuz ve Türkiye’deki FRC organizatörü.'],
  ['support', '/destek-ol/', 'Destek olun', 'AIR FORCE ile', 'AIR FORCE için malzeme, üretim ve yarışma desteği seçenekleri ve sponsorluk iletişimi.'],
  ['contact', '/iletisim/', 'İletişim', 'Ankara, Türkiye', 'AIR FORCE #12414: airforce@istek.k12.tr ve Instagram airforce12414.'],
];
const englishMetadata = {
  team: ['Our team', 'AIR FORCE 12414', 'AIR FORCE #12414 is the robotics team at İSTEK Ankara Schools, preparing for the 2027 FIRST Robotics Competition season.'],
  history: ['Our story', 'Season by season', 'Follow the history of AIR FORCE #12414 season by season.'],
  awards: ['Results and awards', 'Season archive', 'Competition results and awards for AIR FORCE #12414.'],
  robots: ['Season and robots', 'AIR FORCE 12414', 'Our season status, competition schedule and published robot records.'],
  robot: ['Our first robot', 'Robot profile', 'Technical information, competition results and media for the first AIR FORCE #12414 robot.'],
  impact: ['Community impact', 'Beyond the robot', 'Education, outreach and community projects by AIR FORCE.'],
  resources: ['Resources', 'Learning and sharing', 'AIR FORCE resources for mechanical design, electronics, software, strategy and team operations.'],
  news: ['Team news', 'AIR FORCE updates', 'AIR FORCE #12414 news from the workshop, the season and the team.'],
  gallery: ['Team gallery', 'Team and event photos', 'Photos and videos of AIR FORCE #12414 in the workshop and at competitions.'],
  projectGallery: ['Project gallery', 'Community outreach', 'Photo albums from AIR FORCE #12414 community outreach projects.'],
  frc: ['FIRST & FRC', 'Beyond the robot', 'Learn about FIRST Robotics Competition, the robotics program AIR FORCE takes part in.'],
  sponsors: ['Sponsors and organizations', 'Sponsorship', 'Our sponsors, our school and the FIRST Robotics Competition organizer in Türkiye.'],
  support: ['Support the team', 'AIR FORCE 12414', 'Support AIR FORCE with materials, fabrication or competition expenses, or contact us about sponsorship.'],
  contact: ['Contact', 'Ankara, Türkiye', 'Contact AIR FORCE #12414 at airforce@istek.k12.tr or on Instagram at @airforce12414.'],
};
export function buildContentRoutes(data = content, lang = 'tr') {
  const t = translator(lang);
  const emptyPages = {
    history: !titledRecords(data.history).length,
    awards: !titledRecords(data.awards).length,
    robot: !routable(data.robots).some(item => item.slug === 'ilk-robot'),
    impact: !routable(data.projects).length,
    resources: !publicResources(data.resources).length,
    news: !routable(data.news).length,
    gallery: !allPhotos(data, t).length && !publicVideos(data.videos).length,
    projectGallery: !projectAlbums(data.projects).length,
  };
  const result = routes.map(([kind, path, ...metadata]) => {
    const [title, kicker, description] = t(metadata, englishMetadata[kind]);
    return { kind, path, file: `${path.slice(1)}index.html`, title, kicker, description, noindex: Boolean(emptyPages[kind]) };
  });
  for (const [kind, items, prefix] of [['robot', data.robots, '/robotlar/'], ['project', data.projects, '/toplumsal-etki/'], ['article', data.news, '/haberler/']]) {
    const seenSlugs = new Set();
    for (const item of publishedRecords(items).filter(validSlug)) {
      if (seenSlugs.has(item.slug)) throw new Error(`${prefix} içeriğinde aynı slug birden fazla kez yayımlandı: "${item.slug}". Her kayda benzersiz bir slug verin.`);
      seenSlugs.add(item.slug);
    }
    const entries = routable(items).sort(kind === 'robot' ? newestYear : newestDate);
    for (const entry of entries) {
      const path = `${prefix}${entry.slug}/`;
      const item = lang === 'en' ? localizeRecord(entry, lang) : entry;
      const record = { kind, path, file: `${path.slice(1)}index.html`, title: item.title || item.name, kicker: item.year || item.category || 'AIR FORCE 12414', description: item.description || item.summary || item.title || item.name, noindex: false, item };
      const existing = result.findIndex(route => route.path === path);
      if (existing >= 0) result[existing] = record;
      else result.push(record);
    }
  }
  return result;
}
export const contentRoutes = buildContentRoutes();

function team({ content, t }) {
  const photo = image(content.teamPhoto, content.teamPhotoAlt, content.teamPhotoWidth, content.teamPhotoHeight, 'team-photo-image', content.teamPhotoPosition);
  const students = publishedRecords(content.students);
  const mentors = publishedRecords(content.mentors);
  const subteams = publishedRecords(content.subteams);
  const roster = (title, id, people) => people.length ? `<section class="section" id="${id}">
    <h2 class="section-heading">${e(title)}</h2><div class="roster-grid">${people.map(person => {
      const portrait = image(person.image, person.imageAlt || person.name, person.imageWidth, person.imageHeight);
      return `<article class="person-card">${portrait ? `<div class="card-media">${portrait}</div>` : ''}<h3>${e(person.name)}</h3>${para([person.role, person.team].filter(Boolean).join(' · '))}</article>`;
    }).join('')}</div></section>` : '';

  return `${sectionNav([
    [t('Takım hakkında', 'About the team'), 'genel-bakis'],
    ...(subteams.length ? [[t('Çalışma alanları', 'Work areas'), 'calisma-alanlari']] : []),
    [t('Okulumuz', 'Our school'), 'okulumuz'],
    ...(students.length ? [[t('Öğrenciler', 'Students'), 'ekip']] : []),
    ...(mentors.length ? [[t('Mentorlar', 'Mentors'), 'mentorlar']] : []),
  ], t)}
  <section class="section af-editorial" id="genel-bakis">
    <div class="af-editorial-copy" data-reveal>
      <p class="eyebrow">Ankara İstech Robotics Force</p>
      <h2>${t('İSTEK Ankara’dan', 'From İSTEK Ankara to')}<br>${t('FIRST Robotics Competition’a.', 'FIRST Robotics Competition.')}</h2>
      <p class="lead">${e(t(`AIR FORCE #12414, ${content.school.name} robotik takımıdır.`, `AIR FORCE #12414 is the robotics team at ${content.school.name}.`))}</p>
      <p>${t('2027, FIRST Robotics Competition’daki ilk sezonumuz. Sezon durumumuzu ve yarışma takvimimizi sezon sayfasından izleyebilirsiniz.', '2027 is our first season in FIRST Robotics Competition. Find our latest update and competition schedule on the season page.')}</p>
      <div class="entry-actions">${anchor(t('2027 sezonu', '2027 season'), '/robotlar/')}${anchor(t('Resmî FIRST takım profili', 'Official FIRST team profile'), content.firstProfile, 'text-link', true)}</div>
    </div>
    ${photo ? `<figure class="af-team-photo" data-team-photo data-reveal data-reveal-delay="100">${photo}<figcaption>AIR FORCE #12414 · ${e(content.school.name)}</figcaption></figure>` : `<aside class="af-identity" aria-label="${t('Takım bilgileri', 'Team details')}" data-reveal data-reveal-delay="100">
      ${image('/assets/logo-440.webp', 'AIR FORCE Ankara İstech Robotics', 440, 197)}
      <dl><div><dt>${t('Takım numarası', 'Team number')}</dt><dd>12414</dd></div><div><dt>${t('Okul', 'School')}</dt><dd>${e(content.school.name)}</dd></div><div><dt>${t('Konum', 'Location')}</dt><dd>Ankara, Türkiye</dd></div><div><dt>${t('İlk FRC sezonu', 'First FRC season')}</dt><dd>2027</dd></div></dl>
    </aside>`}
  </section>
  ${subteams.length ? `<section class="section af-work-section" id="calisma-alanlari">
    <div class="af-section-intro" data-reveal><p class="eyebrow">${t('Takım düzeni', 'Team structure')}</p><h2>${t('Çalışma alanlarımız', 'How we work')}</h2></div>
    <div class="af-work-list">${subteams.map(item => `<article data-reveal><h3>${e(item.name)}</h3>${para(item.description)}</article>`).join('')}</div>
  </section>` : ''}
  <section class="section af-school-section${content.schoolMark.logo ? ' af-school-section--with-mark' : ''}" id="okulumuz" data-reveal>
    ${content.schoolMark.logo ? `<div class="af-school-mark">${image(content.schoolMark.logo, content.school.name, content.schoolMark.width, content.schoolMark.height)}</div>` : ''}
    <div><p class="eyebrow">${t('Okulumuz', 'Our school')}</p><h2>${e(content.school.name)}</h2><p>${t('Takımımız Ankara, Türkiye’de faaliyet gösterir.', 'Our team is based in Ankara, Türkiye.')}</p><div class="entry-actions">${anchor(t('İSTEK Ankara’yı tanıyın', 'Visit İSTEK Ankara'), content.school.url, 'text-link', true)}${anchor(t('FIRST ve FRC hakkında', 'About FIRST and FRC'), '/frc/')}</div></div>
  </section>
  ${roster(t('Öğrencilerimiz', 'Our students'), 'ekip', students)}
  ${roster(t('Mentorlarımız', 'Our mentors'), 'mentorlar', mentors)}
  <section class="section af-contact-strip" data-reveal><div><p class="eyebrow">${t('Takımla iletişim', 'Contact the team')}</p><h2>${t('AIR FORCE’a ulaşın.', 'Get in touch with AIR FORCE.')}</h2></div>${anchor(content.email, `mailto:${content.email}`, 'text-link')}</section>`;
}
function history({ content, t }) {
  const entries = titledRecords(content.history).sort(newestYear);
  if (!entries.length) return emptyCollection(t('Tarihçe kaydı henüz yayımlanmadı', 'No season history published yet'), t('AIR FORCE’un takım bilgilerini ve ilk sezon durumunu inceleyebilirsiniz.', 'Meet AIR FORCE and follow our first season.'), t('2027 sezonuna gidin', 'View the 2027 season'), '/robotlar/');
  return `<section class="section">${heading(t('Sezonlar', 'Seasons'), t('Takımın yolculuğu', 'The team’s journey'))}<div class="timeline">${entries.map(item => `<article class="timeline-item"><div class="timeline-date">${e(item.year)}</div><div><h3>${e(item.title)}</h3>${para(item.description)}${image(item.image, item.imageAlt || item.title)}${item.robotSlug && routable(content.robots).some(robot => robot.slug === item.robotSlug) ? anchor(t('Sezonun robotu', 'View the season’s robot'), `/robotlar/${item.robotSlug}/`) : ''}</div></article>`).join('')}</div>${anchor(t('Takımımızı tanıyın', 'Meet the team'), '/takim/')}</section>`;
}
function awards({ content, t }) {
  const entries = titledRecords(content.awards).sort(newestYear), years = yearLabels(entries);
  if (!entries.length) return emptyCollection(t('Sonuç kaydı henüz yayımlanmadı', 'No results yet'), t('Bu arşivde henüz yarışma sonucu veya ödül bulunmuyor.', 'Competition results and awards will appear here once published.'), t('Sezon durumunu inceleyin', 'View the season update'), '/robotlar/');
  return `<section class="section" data-collection>${heading(t('Sonuçlar', 'Results'), t('Yarışma sonuçları ve ödüller', 'Competition results and awards'))}${filterBar(years, t('Ödül veya etkinlik ara', 'Search awards or events'), t)}<div class="archive-grid">${entries.map(item => `<article class="archive-card award-card" ${filterAttrs(String(item.year || ''), `${item.title} ${item.event || ''} ${item.year || ''}`)}>${icon('medal')}<span class="tag">${e(item.year)}</span><h3>${e(item.title)}</h3>${para(item.event)}${anchor(t('Resmî sonuçlar', 'Official results'), item.url, 'text-link', true)}</article>`).join('')}</div>${filterEmpty(t)}</section>`;
}
function robotCard(robot, t) {
  const photo = image(robot.image, robot.imageAlt || robot.name || robot.title, robot.imageWidth, robot.imageHeight);
  const name = robot.name || robot.title;
  return `<article class="af-robot-card" ${filterAttrs(String(robot.year || 'FRC'), `${robot.name || robot.title} ${robot.game || ''} ${robot.year || ''}`)}>
    <a class="af-robot-media" href="/robotlar/${e(robot.slug)}/" aria-label="${e(t(`${name} robotunu inceleyin`, `View the ${name} robot`))}">${photo || '<span class="af-robot-monogram" aria-hidden="true">12414</span>'}</a>
    <div class="af-robot-copy"><p class="eyebrow">${e(robot.year || 'FRC')}${robot.game ? ` · ${e(robot.game)}` : ''}</p><h3>${e(name)}</h3>${para(robot.description)}${anchor(t('Robotun teknik ayrıntıları', 'Explore the robot'), `/robotlar/${robot.slug}/`)}</div>
  </article>`;
}
function robots({ content, t, lang }) {
  const entries = routable(content.robots).sort(newestYear), years = yearLabels(entries);
  const event = selectUpcomingEvent(content.events);
  const season = content.season || {};
  const updated = formatContentDate(season.updatedAt, lang);
  const year = e(season.year || 2027);
  const emptyRobotMessage = t('Henüz robot tanıtımı veya teknik kayıt yayımlanmadı.', 'We haven’t published a robot profile or technical documentation yet.');
  return `${sectionNav([
    [t('Sezon', 'Season'), 'sezon'],
    ...(entries.length ? [[t('Robot arşivi', 'Robot archive'), 'robot-arsivi']] : []),
  ], t)}
  <section class="section af-robot-season" id="sezon">
    <div class="af-season-intro" data-reveal>
      <p class="eyebrow">FIRST Robotics Competition</p>
      <h2>${t(`${year} sezonu`, `${year} season`)}</h2>
      ${season.status ? status(season.status) : ''}
      <p class="lead">${e(season.description || content.seasonStatus)}</p>
      ${updated ? `<p>${t('Son güncelleme', 'Last updated')} <time datetime="${e(season.updatedAt)}">${e(updated)}</time></p>` : ''}
      ${!entries.length ? para(emptyRobotMessage) : ''}
      ${anchor(t('Resmî FIRST takım profili', 'Official FIRST team profile'), content.firstProfile, 'text-link', true)}
    </div>
    ${event ? `<aside class="af-event-panel" aria-label="${t('Yarışma takvimi', 'Competition schedule')}" data-reveal data-reveal-delay="100">
      <p class="eyebrow">${t('Yaklaşan etkinlik', 'Upcoming event')}</p><h3>${e(event.title)}</h3>
      <p class="af-event-date">${e(event.date)}</p>
      <p class="af-event-location">${e(event.location)}</p>
      ${anchor(t('FIRST etkinlik sayfası', 'FIRST event page'), event.url, 'button button-gold', true)}
    </aside>` : `<aside class="af-season-reference" data-reveal><p class="eyebrow">${t('Yarışma takvimi', 'Competition schedule')}</p><h3>${t('Yaklaşan etkinlik kaydı yok', 'No upcoming events listed')}</h3><p>${t('Takımın resmî etkinlik kayıtlarını FIRST üzerinden inceleyebilirsiniz.', 'Visit FIRST for the team’s official event listings.')}</p>${anchor(t('FIRST takım profili', 'FIRST team profile'), content.firstProfile, 'text-link', true)}</aside>`}
  </section>
  ${entries.length ? `<section class="section af-robot-archive" id="robot-arsivi" data-collection>${heading(t('AIR FORCE robotları', 'AIR FORCE robots'), t('Sezon arşivi', 'Season archive'))}
    ${entries.length > 1 ? filterBar(years, t('Robot veya oyun ara', 'Search robots or games'), t) : ''}
    <div class="af-robot-list">${entries.map(entry => robotCard(entry, t)).join('')}</div>${filterEmpty(t)}</section>` : ''}
  <section class="section">${anchor(t('FRC’de sezon nasıl ilerler?', 'How does an FRC season work?'), '/frc/')}</section>
  <section class="section af-contact-strip" data-reveal><div><p class="eyebrow">${t('Teknik destek ve sponsorluk', 'Technical support and sponsorship')}</p><h2>${t('Üretime katkı sağlayın.', 'Help us build our robot.')}</h2></div>${anchor(t('Destek seçenekleri', 'Ways to support the team'), '/destek-ol/', 'button button-gold')}</section>`;
}
function robot({ content, t, date }, item) {
  const entry = item || routable(content.robots).find(record => record.slug === 'ilk-robot');
  if (!entry) return `<section class="section"><div class="season-summary" id="genel-bakis"><h2>${t('İlk sezonumuz', 'Our first season')}</h2>
    <p>${t('Henüz robot tanıtımı veya teknik kayıt yayımlanmadı.', 'We haven’t published a robot profile or technical documentation yet.')}</p><p>${e(content.season?.description || content.seasonStatus)}</p>${anchor(t('Sezon sayfasına dön', 'Back to the season page'), '/robotlar/')}
  </div></section>`;

  const photo = image(entry.image, entry.imageAlt || entry.name || entry.title, entry.imageWidth, entry.imageHeight);
  const specs = (entry.specs || []).filter(spec => spec.label && spec.value).map(spec => [spec.label, spec.value]);
  const mechanisms = entry.mechanisms || [];
  const results = entry.results || [];
  const photos = publishedRecords(entry.photos).filter(record => safeImageSrc(record.src));
  const files = [
    [t('CAD modeli', 'CAD model'), entry.cadUrl], [t('Robot kodu', 'Robot code'), entry.codeUrl], [t('Oyun kılavuzu', 'Game manual'), entry.gameUrl],
  ].filter(([, href]) => safeHref(href));
  const hasTechnical = specs.length || mechanisms.length || files.length;
  const hasMedia = photos.length || safeHref(entry.videoUrl);
  const sections = [
    [t('Genel bakış', 'Overview'), 'genel-bakis'],
    ...(hasTechnical ? [[t('Teknik', 'Technical details'), 'teknik']] : []),
    ...(results.length ? [[t('Sonuçlar', 'Results'), 'sezon']] : []),
    ...(hasMedia ? [[t('Medya', 'Media'), 'medya']] : []),
  ];

  return `<section class="section ${photo ? 'split-layout' : ''}" id="genel-bakis">
    <div>${para(entry.description)}${specList([[t('Sezon', 'Season'), entry.year], [t('Oyun', 'Game'), entry.game]].filter(([, value]) => value))}</div>
    ${photo ? `<div class="card-media robot-main-image">${photo}</div>` : ''}
  </section>
  ${sections.length > 1 ? sectionNav(sections, t) : ''}
  ${hasTechnical ? `<section class="section" id="teknik"><h2 class="section-heading">${t('Teknik bilgiler', 'Technical details')}</h2>
    ${specs.length ? specList(specs) : ''}
    ${mechanisms.length ? `<ul class="mechanism-list">${mechanisms.map(value => `<li>${e(typeof value === 'string' ? value : [value.title, value.description].filter(Boolean).join(' — '))}</li>`).join('')}</ul>` : ''}
    ${files.length ? `<ul class="file-list">${files.map(([label, href]) => `<li>${anchor(label, href, 'text-link', true)}</li>`).join('')}</ul>` : ''}
  </section>` : ''}
  ${results.length ? `<section class="section" id="sezon"><h2 class="section-heading">${t('Yarışma sonuçları', 'Competition results')}</h2>
    <div class="table-scroll"><table class="results-table">
      <caption class="sr-only">${t('Sezon sonuçları', 'Season results')}</caption>
      <thead><tr><th scope="col">${t('Etkinlik', 'Event')}</th><th scope="col">${t('Tarih', 'Date')}</th><th scope="col">${t('Sonuç', 'Result')}</th></tr></thead>
      <tbody>${results.map(result => `<tr><th scope="row">${e(result.event)}</th><td>${e(date(result.date))}</td><td>${e(result.result)}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>` : ''}
  ${hasMedia ? `<section class="section" id="medya"><h2 class="section-heading">${t('Fotoğraf ve video', 'Photos and video')}</h2>
    ${photos.length ? `<div class="gallery-grid">${photos.map(photo => galleryPhoto(photo, t)).join('')}</div>` : ''}
    ${anchor(t('Robot videosunu izleyin', 'Watch the robot video'), entry.videoUrl, 'text-link', true)}
  </section>` : ''}
  <section class="section">${anchor(t('Tüm robotlara dön', 'Back to all robots'), '/robotlar/')}</section>`;
}
function impact({ content, t }) {
  const fallbackCategory = t('Toplum', 'Community');
  const entries = routable(content.projects), categories = [...new Set(entries.map(item => item.category || fallbackCategory))];
  if (!entries.length) return emptyCollection(t('Proje kaydı henüz yayımlanmadı', 'No projects published yet'), t('Toplumsal etki projeleri hakkında takımımızla iletişime geçebilirsiniz.', 'Contact us to learn about our community outreach.'), t('İletişime geçin', 'Get in touch'), '/iletisim/');
  return `<section class="section" data-collection>${heading(t('Çalışmalarımız', 'Our work'), t('Proje arşivi', 'Project archive'))}${filterBar(categories, t('Proje ara', 'Search projects'), t)}<div class="archive-grid">${entries.map(item => `<article class="archive-card" ${filterAttrs(item.category || fallbackCategory, `${item.title} ${item.description || ''} ${item.category || ''}`)}><a class="card-media" href="/toplumsal-etki/${e(item.slug)}/" aria-label="${e(t(`${item.title} projesini inceleyin`, `View the ${item.title} project`))}">${itemImage(item)}</a><div class="card-body"><span class="tag">${e(item.category || fallbackCategory)}</span><h3>${e(item.title)}</h3>${para(item.goal || item.description)}${anchor(t('Projeyi inceleyin', 'View project'), `/toplumsal-etki/${item.slug}/`)}</div></article>`).join('')}</div>${filterEmpty(t)}</section>`;
}
function project({ t, date }, item = {}) {
  const photo = image(item.image, item.imageAlt || item.title, item.imageWidth, item.imageHeight);
  const photos = galleryPhotos(item.photos);
  const paragraphs = Array.isArray(item.paragraphs) ? item.paragraphs : [];
  const hasProcess = Boolean(item.goal || paragraphs.length);
  const hasResults = Boolean(item.results || safeHref(item.evidenceUrl));
  const sections = [...(hasProcess ? [[t('Amaç', 'Purpose'), 'amac']] : []), ...(hasResults ? [[t('Sonuçlar', 'Results'), 'sonuclar']] : []), ...(photos.length ? [[t('Galeri', 'Gallery'), 'proje-galeri']] : [])];
  return `<section class="section ${photo ? 'split-layout' : ''}">${photo ? `<div class="card-media">${photo}</div>` : ''}<div><p class="eyebrow">${e(item.category)}</p><p class="lead">${e(item.goal || item.title)}</p>${para(item.description)}${specList([[t('Tarih', 'Date'), date(item.date)], [t('Hedef kitle', 'Who it’s for'), item.audience]].filter(([, value]) => value))}</div></section>
  ${sections.length > 1 ? sectionNav(sections, t) : ''}
  ${hasProcess ? `<section class="section" id="amac">${heading(t('Proje', 'Project'), t('Amaç ve süreç', 'Purpose and approach'))}${para(item.goal)}${paragraphs.map(para).join('')}</section>` : ''}
  ${hasResults ? `<section class="section" id="sonuclar">${heading(t('Belgelenmiş sonuçlar', 'Documented results'), t('Projenin etkisi', 'Project impact'))}${para(item.results)}${anchor(t('Proje belgesi', 'Project documentation'), item.evidenceUrl, 'button button-outline', true)}</section>` : ''}
  ${photos.length ? `<section class="section" id="proje-galeri">${heading(t('Sahadan', 'In the field'), t('Proje fotoğrafları', 'Project photos'))}<div class="gallery-grid">${photos.map(photo => galleryPhoto(photo, t)).join('')}</div></section>` : ''}
  <div class="section entry-actions">${anchor(t('Tüm projelere dön', 'Back to all projects'), '/toplumsal-etki/', 'button button-outline')}${photos.length ? anchor(t('Proje galerisi', 'Project gallery'), '/proje-galerisi/') : ''}</div>`;
}
function resources({ content, t }) {
  const entries = publicResources(content.resources);
  const fallbackTopic = t('Genel', 'General');
  const categories = [...new Set(entries.map(item => item.topic || fallbackTopic))];
  if (!entries.length) return emptyCollection(t('Kaynak henüz yayımlanmadı', 'No resources published yet'), t('Yarışma programını ve sezonun işleyişini FIRST & FRC sayfasında inceleyebilirsiniz.', 'Learn about the competition and how the season works on our FIRST & FRC page.'), t('FIRST ve FRC hakkında', 'About FIRST and FRC'), '/frc/');
  const cards = entries.map(item => {
    const href = safeHref(item.url);
    const link = item.download === true && href.startsWith('/')
      ? `<a class="text-link" href="${e(href)}" download>${t('Şablonu indir', 'Download template')}${arrow()}</a>`
      : anchor(t('Kaynağı aç', 'Open resource'), href, 'text-link', true);
    const topic = item.topic || fallbackTopic;
    return `<article class="content-card resource-card" ${filterAttrs(topic, `${item.title} ${item.description || ''} ${topic} ${item.category || ''} ${item.level || ''} ${item.year || ''}`)}>
      <div class="resource-icon">${icon('book')}</div>
      <div class="resource-meta"><span class="tag">${e(topic)}</span>${[item.level, item.year, item.category].filter(Boolean).map(value => `<span>${e(value)}</span>`).join('')}</div>
      <h3>${e(item.title)}</h3>${para(item.description)}<div class="card-bottom">${link}<span>${e(item.format)}</span></div>
    </article>`;
  });
  return `<section class="section" data-collection>${heading(t('Kaynak kütüphanesi', 'Resource library'), t('Teknik belgeler ve eğitim kaynakları', 'Technical documents and learning resources'))}${filterBar(categories, t('Kaynak ara', 'Search resources'), t)}<div class="archive-grid resources-grid">${cards.join('')}</div>${filterEmpty(t)}</section>`;
}
function news({ content, t, date }) {
  const fallbackCategory = t('Takımdan', 'Team update');
  const entries = routable(content.news).sort(newestDate), categories = [...new Set(entries.map(item => item.category || fallbackCategory))];
  if (!entries.length) return emptyCollection(t('Haber henüz yayımlanmadı', 'No news published yet'), t('Güncel sezon durumuna ve yarışma takvimine sezon sayfasından ulaşabilirsiniz.', 'Visit the season page for our latest update and competition schedule.'), t('Sezon durumunu inceleyin', 'View the season update'), '/robotlar/');
  return `<section class="section" data-collection>${filterBar(categories, t('Haber ara', 'Search news'), t)}<div class="archive-grid news-grid">${entries.map(item => `<article class="archive-card" ${filterAttrs(item.category || fallbackCategory, `${item.title} ${item.summary || ''} ${item.category || ''}`)}><a class="card-media" href="/haberler/${e(item.slug)}/" aria-label="${e(t(`${item.title} haberini okuyun`, `Read ${item.title}`))}">${itemImage(item)}</a><div class="card-body"><div class="article-meta"><span class="tag">${e(item.category || fallbackCategory)}</span><span>${e(date(item.date))}</span></div><h3>${e(item.title)}</h3>${para(item.summary)}${anchor(t('Haberi okuyun', 'Read the story'), `/haberler/${item.slug}/`)}</div></article>`).join('')}</div>${filterEmpty(t)}</section>`;
}
function article({ t, date }, item = {}) { return `<article class="article-content section"><div class="article-meta"><span class="tag">${e(item.category)}</span><span>${e(date(item.date))}</span></div>${item.image ? `<figure class="article-cover">${itemImage(item)}</figure>` : ''}<p class="lead">${e(item.summary)}</p><div class="article-body">${(item.paragraphs || []).map(para).join('')}</div>${item.url ? anchor(t('İlgili bağlantı', 'Related link'), item.url, 'text-link', true) : ''}</article><div class="section">${anchor(t('Tüm haberlere dön', 'Back to all news'), '/haberler/', 'button button-outline')}</div>`; }
function gallery({ content, t }) {
  const photos = allPhotos(content, t), videos = publicVideos(content.videos);
  const categories = [...new Set(photos.map(photo => photo.category || t('Takım', 'Team')))];
  const navigation = galleryNav('/galeri/', t);
  if (!photos.length && !videos.length) return navigation + emptyCollection(t('Fotoğraf veya video henüz yayımlanmadı', 'No photos or videos published yet'), t('Takımımızı Instagram hesabından takip edebilirsiniz.', 'Follow the team on Instagram.'), t('Instagram’a gidin', 'Visit Instagram'), content.instagram);
  return `${navigation}${photos.length && videos.length ? sectionNav([[t('Fotoğraflar', 'Photos'), 'fotograflar'], [t('Videolar', 'Videos'), 'videolar']], t) : ''}
    ${photos.length ? `<section class="section" id="fotograflar" data-collection>${heading(t('Fotoğraflar', 'Photos'), t('Takım ve etkinlik fotoğrafları', 'Team and event photos'), '', anchor('Instagram', content.instagram, 'text-link', true))}${filterBar(categories, t('Fotoğraf ara', 'Search photos'), t)}<div class="gallery-grid">${photos.map(photo => galleryPhoto(photo, t)).join('')}</div>${filterEmpty(t)}</section>` : ''}
    ${videos.length ? `<section class="section" id="videolar">${heading(t('Video arşivi', 'Video archive'), t('Videolar', 'Videos'))}<div class="content-grid cols-2">${videos.map(video => `<article class="archive-card">${safeImageSrc(video.thumbnail) ? `<div class="card-media">${image(video.thumbnail, video.title)}</div>` : ''}<div class="card-body"><span class="tag">${e(video.category)}</span><h3>${e(video.title)}</h3>${para(video.description)}${anchor(t('Videoyu izleyin', 'Watch the video'), video.url, 'text-link', true)}</div></article>`).join('')}</div></section>` : ''}`;
}
function projectGallery({ content, t, lang }) {
  const albums = projectAlbums(content.projects);
  const navigation = galleryNav('/proje-galerisi/', t);
  if (!albums.length) return navigation + emptyCollection(t('Proje fotoğrafları henüz yayımlanmadı', 'No project photos published yet'), t('Sosyal sorumluluk çalışmalarımızdan fotoğraflar burada proje bazında yer alacak.', 'Photos from our community work will appear here by project.'), t('Toplumsal etki sayfası', 'Community impact'), '/toplumsal-etki/');

  return navigation + albums.map(({ project, photos }) => {
    const date = formatContentDate(project.date, lang);
    const url = `/toplumsal-etki/${project.slug}/`;
    return `<section class="section project-album" aria-labelledby="album-${e(project.slug)}">
      <div class="section-heading project-album-heading">
        <div>${date ? `<time class="news-date" datetime="${e(project.date)}">${e(date)}</time>` : ''}<h2 id="album-${e(project.slug)}">${e(project.title || project.name)}</h2></div>
        ${anchor(t('Proje ayrıntıları', 'Project details'), url)}
      </div>
      <div class="gallery-grid">${photos.map(photo => galleryPhoto(photo, t)).join('')}</div>
    </section>`;
  }).join('');
}
function frc({ t }) {
  const stages = [
    [t('Tasarım', 'Design'), t('Takımlar oyunu analiz eder, stratejilerini belirler ve robotu tasarlar.', 'Teams study the game, choose a strategy and design their robot.')],
    [t('Üretim ve test', 'Build and test'), t('Takımlar robotu üretir, programlar ve performansını test eder.', 'Teams build, program and test their robot.')],
    [t('Yarışma', 'Compete'), t('Takımlar ittifaklar kurarak yarışır ve edindikleri deneyimi paylaşır.', 'Teams compete in alliances and share what they’ve learned.')],
  ];
  return `<section class="section split-layout">
    <div><p class="eyebrow">FIRST Robotics Competition</p><p class="lead">${t('Lise öğrencileri için robotik yarışması', 'A robotics competition for high school students')}</p></div>
    <div>
      <p>${t('FRC, lise öğrencilerinin mentorlarıyla birlikte robot tasarladığı, ürettiği ve programladığı uluslararası bir robotik yarışmasıdır.', 'FRC is an international robotics competition where high school students work with mentors to design, build and program robots.')}</p>
      <p>${t('Her sezon açıklanan oyun, yeni bir mühendislik problemi getirir. Takımlar kendi robotlarını geliştirir ve sahada ittifaklar halinde yarışır.', 'Each season introduces a new game and engineering challenge. Teams develop their own robots and compete on the field in alliances.')}</p>
      ${anchor(t('FIRST’ün resmî sitesini inceleyin', 'Visit the official FIRST website'), 'https://www.firstinspires.org/programs/frc/', 'text-link', true)}
    </div>
  </section>
  <section class="section">${heading(t('Bir sezonun akışı', 'The season'), t('Robot geliştirme ve yarışma süreci', 'From design to competition'))}
    <div class="content-grid cols-3">${stages.map(([title, description]) => `<article class="content-card"><h3>${e(title)}</h3><p>${e(description)}</p></article>`).join('')}</div>
  </section>
  <section class="section split-layout frc-values">
    <div>${heading(t('FIRST kültürü', 'FIRST culture'), t('FIRST’ün takım çalışması ilkeleri', 'How teams work together'))}</div>
    <div><h3>Gracious Professionalism®</h3><p>${t('İşe özen göstermek ve diğer insanlara saygı duymak.', 'Do your work with care and treat others with respect.')}</p><h3>Coopertition®</h3><p>${t('Yarışma sırasında diğer takımlarla yardımlaşmak ve birlikte öğrenmek.', 'Help and learn from other teams while competing with them.')}</p>${anchor(t('FIRST’ün yaklaşımı', 'Learn about the FIRST approach'), 'https://www.firstinspires.org/about/vision-and-mission', 'text-link', true)}</div>
  </section>
  <section class="section">${anchor(t('AIR FORCE robotlarını keşfedin', 'Explore AIR FORCE robots'), '/robotlar/', 'button button-gold')}</section>`;
}
function sponsorCard(item, t) {
  const mark = image(item.logo, item.name, item.width, item.height) || `<strong>${e(item.name)}</strong>`;
  const label = t(`${item.name} resmî sitesi`, `${item.name} official website`);
  return `<article class="sponsor-card">${safeHref(item.url) ? `<a class="sponsor-logo" href="${e(safeHref(item.url))}" target="_blank" rel="noopener noreferrer" aria-label="${e(label)}">${mark}</a>` : `<div class="sponsor-logo">${mark}</div>`}<div class="sponsor-caption"><h3>${e(item.name)}</h3><p>${e(item.role)}</p></div></article>`;
}
function sponsors({ content, t }) {
  const organizer = content.frcOrganizer;
  const needs = (Array.isArray(content.sponsorNeeds) ? content.sponsorNeeds : []).filter(need => need?.title);
  return `${content.sponsors.length ? `<section class="section" data-reveal>
    <h2 class="section-heading">${t('Takım sponsorları', 'Team sponsors')}</h2>
    <div class="sponsor-grid">${content.sponsors.map(item => sponsorCard(item, t)).join('')}</div>
  </section>` : ''}
  <section class="section" data-reveal>
    <h2 class="section-heading">${t('Okul ve FRC organizasyonu', 'Our school and FRC organizer')}</h2>
    <div class="sponsor-grid">${[content.schoolMark, organizer].filter(Boolean).map(item => sponsorCard(item, t)).join('')}</div>
    ${organizer ? `<p class="organization-note">${e(t(`${organizer.name}, Türkiye’deki FRC etkinliklerinin organizatörüdür.`, `${organizer.name} organizes FRC events in Türkiye.`))}</p>` : ''}
  </section>
  <section class="section contact-callout" id="destek" data-reveal>
    <div><p class="eyebrow">${t('Sponsorluk', 'Sponsorship')}</p><h2>${t('Takıma destek olun.', 'Support the team.')}</h2>${needs.length ? `<p>${needs.map(need => e(need.title)).join(' · ')}</p>` : ''}</div>
    ${anchor(t('İhtiyaçları ve destek seçeneklerini inceleyin', 'See how you can help'), '/destek-ol/', 'button button-gold')}
  </section>`;
}
function support({ content, t }) {
  const needs = (Array.isArray(content.sponsorNeeds) ? content.sponsorNeeds : []).filter(need => need?.title);
  const subject = encodeURIComponent(t('AIR FORCE 12414 Sponsorluk', 'AIR FORCE 12414 Sponsorship'));
  const mailto = `mailto:${content.email}?subject=${subject}`;
  const file = safeHref(content.sponsorshipFile);
  const localFile = file.startsWith('/');
  const documentLink = file ? `<a class="button button-outline" href="${e(file)}"${localFile ? ' download' : ' target="_blank" rel="noopener noreferrer"'}>${t('Takım sunumu (PDF)', 'Team presentation (PDF)')}</a>` : '';
  return `<section class="section support-intro">
    <p class="lead">${t('İlk FRC sezonumuz için robot parçaları, üretim hizmetleri ve yarışma giderleri konusunda desteğe ihtiyacımız var.', 'For our first FRC season, we’re looking for help with robot parts, fabrication and competition expenses.')}</p>
    <div class="entry-actions">${anchor(t('Sponsorluk için yazın', 'Email us about sponsorship'), mailto, 'button button-gold')}${documentLink}</div>
    <p class="support-email">${e(content.email)}</p>
  </section>
  ${needs.length ? `<section class="section support-needs" aria-labelledby="support-needs-title">
    <h2 class="section-heading" id="support-needs-title">${t('Destek alanları', 'Ways to help')}</h2>
    <div class="content-grid cols-3">${needs.map(need => `<article class="content-card">
      <h3>${e(need.title)}</h3>${para(need.description)}
      ${Array.isArray(need.examples) && need.examples.length ? `<ul>${need.examples.filter(Boolean).map(example => `<li>${e(example)}</li>`).join('')}</ul>` : ''}
    </article>`).join('')}</div>
    <p class="support-note">${t('E-postanızda katkı sağlayabileceğiniz alanı ve destek biçimini belirtebilirsiniz.', 'Tell us which area you’d like to support and how you can help.')}</p>
    ${anchor(t('Sponsorlar ve kurumlar', 'Sponsors and organizations'), '/sponsorluk/')}
  </section>` : ''}`;
}
function contact({ content, t }) {
  const events = publishedRecords(content.events);
  const faqs = publishedRecords(content.faq);

  return `<section class="section"><p class="lead">${t('Takım, projeler ve sponsorluk hakkında e-posta veya Instagram üzerinden bize ulaşabilirsiniz.', 'Contact us by email or Instagram about the team, our projects or sponsorship.')}</p>
    <div class="contact-grid">
      <article class="contact-card"><h2>${t('E-posta', 'Email')}</h2>
        ${content.emailIsPlaceholder ? para(content.email) : anchor(content.email, `mailto:${content.email}`, 'contact-value')}
      </article>
      <article class="contact-card"><h2>Instagram</h2>
        ${anchor('@airforce12414', content.instagram, 'contact-value', true)}
      </article>
    </div>
    <div class="section-actions">${anchor(content.school.name, content.school.url, 'text-link', true)}</div>
  </section>
  <section class="section" id="gizlilik">
    <h2 class="section-heading">${t('Site ve gizlilik', 'Website and privacy')}</h2>
    <p>${t('Bu tanıtım sitesi form, reklam veya ziyaretçi analitiği kullanmaz. Açılış animasyonunun aynı sekmede tekrarlanmaması için tarayıcının oturum belleğine bir tercih kaydedilir.', 'This informational site uses no forms, advertising or visitor analytics. Your browser stores a session flag to avoid repeating the opening animation in the same tab.')}</p>
    <p>${t('Site Vercel üzerinden sunulur. Takıma e-posta gönderirseniz adresiniz ve iletiniz takıma ulaşır. Instagram bağlantısı sizi Instagram’a götürür.', 'Vercel hosts this site. If you email the team, the team receives your address and message. The Instagram link takes you to Instagram.')}</p>
    <div class="entry-actions">${anchor(t('Vercel gizlilik bildirimi', 'Vercel Privacy Notice'), 'https://vercel.com/legal/privacy-notice', 'text-link', true)}${anchor(t('Okulun kişisel veri aydınlatma metni', 'School privacy notice (Turkish)'), 'https://ankara.istek.k12.tr/sites/default/files/2024-01/aydinlatma-formu.pdf', 'text-link', true)}</div>
  </section>
  ${events.length ? `<section class="section"><h2 class="section-heading">${t('Etkinlikler', 'Events')}</h2>
    <div class="event-list">${events.map(event => `<article class="event-row">${icon('calendar')}<div><h3>${e(event.title)}</h3>${para([event.date, event.location].filter(Boolean).join(' · '))}</div>${anchor(t('Etkinlik bilgisi', 'Event details'), event.url, 'text-link', true)}</article>`).join('')}</div>
  </section>` : ''}
  ${faqs.length ? `<section class="section"><h2 class="section-heading">${t('Sık sorulanlar', 'Frequently asked questions')}</h2>
    <div class="accordion-list">${faqs.map(faq => `<details class="accordion"><summary>${e(faq.question)}</summary><div>${para(faq.answer)}</div></details>`).join('')}</div>
  </section>` : ''}`;
}

const renderers = { team, history, awards, robots, robot, impact, project, resources, news, article, gallery, projectGallery, frc, sponsors, support, contact };
export function renderContent(kind, item, lang = 'tr') {
  if (!Object.hasOwn(renderers, kind)) throw new Error(`Unknown content page: ${kind}`);
  const content = siteContent(lang);
  const t = translator(lang);
  const date = (value) => lang === 'en' ? formatContentDate(value, lang) || value : value;
  return renderers[kind]({ content, t, date, lang }, item && lang === 'en' ? localizeRecord(item, lang) : item);
}
