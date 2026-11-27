import { siteConfig as content } from './site-config.js';
import { selectUpcomingEvent, isUpcomingEvent, isCalendarDate, formatContentDate, eventPhase } from './season-utils.js';
import { localizeRecord, siteContent, translator } from './locale.js';
import { icon, linkIconName, labelWithIcon } from './icons.js';

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
// Optional smaller copies of one photo, [{ src, width }], become a srcset so phones download a smaller file.
export function responsiveSources(sources) {
  const list = (Array.isArray(sources) ? sources : []).filter(item => safeImageSrc(item?.src) && !/,/.test(item.src) && Number.isInteger(item.width) && item.width > 0);
  return list.map(item => `${safeImageSrc(item.src)} ${item.width}w`).join(', ');
}
export function safeObjectPosition(value) {
  const tokens = typeof value === 'string' ? value.trim().split(/\s+/) : [];
  return tokens.length >= 1 && tokens.length <= 2 && tokens.every(token => /^(left|right|top|bottom|center)$/.test(token) || (/^\d+(?:\.\d+)?%$/.test(token) && parseFloat(token) <= 100)) ? tokens.join(' ') : 'center';
}
function anchor(label, url, className = 'text-link', external = false, back = false) {
  const href = safeHref(url);
  if (!href) return '';
  const iconName = linkIconName(href, { external, back, button: /\bbutton\b/.test(className) && !back });
  return `<a class="${className}" href="${e(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${labelWithIcon(e(label), iconName)}</a>`;
}
function copyEmailControl(email, t) {
  if (!email) return '';
  return `<span class="copy-email-wrap"><button type="button" class="copy-email-btn" data-copy-email="${e(email)}" aria-label="${e(t('E-posta adresini kopyala', 'Copy email address'))}">${icon('copy')}<span>${t('Kopyala', 'Copy')}</span></button><span class="sr-only" role="status" aria-live="polite" data-copy-status></span></span>`;
}
function image(source, alt, width = 1600, height = 1000, className = '', position = '', extra = '') {
  const src = safeImageSrc(source);
  if (!src) return '';
  const sizes = Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0 ? ` width="${width}" height="${height}"` : '';
  return `<img${className ? ` class="${className}"` : ''} src="${e(src)}" alt="${e(alt)}"${sizes}${position ? ` style="object-position:${safeObjectPosition(position)}"` : ''}${extra} loading="lazy" decoding="async">`;
}
function placeholder(label, type = 'camera', extra = '') { return `<div class="media-placeholder ${extra}">${icon(type)}<span>${e(label)}</span></div>`; }
function itemImage(item, label = 'AIR FORCE #12414', type = 'camera') { return image(item?.image, item?.imageAlt || item?.title || item?.name, item?.imageWidth, item?.imageHeight) || placeholder(label, type); }
function heading(title, copy = '', link = '') { return `<div class="section-heading"><div><h2>${e(title)}</h2>${copy ? `<p>${e(copy)}</p>` : ''}</div>${link}</div>`; }
function para(value) { return value ? `<p>${e(value)}</p>` : ''; }
function specList(items) { return `<dl class="spec-list">${items.map(([key, val]) => `<div><dt>${e(key)}</dt><dd>${e(val || '—')}</dd></div>`).join('')}</dl>`; }
function sectionNav(items, t) { return `<nav class="section-nav" aria-label="${t('Bu sayfada', 'On this page')}">${items.map(([label, id]) => `<a href="#${e(id)}">${e(label)}</a>`).join('')}</nav>`; }
function status(text) { return `<span class="status-label">${e(text)}</span>`; }
function filterBar(categories, label, t) { return `<div class="filter-bar"><div class="filter-options" role="group" aria-label="${t('Kategori seçin', 'Choose a category')}"><button class="filter-button is-active" type="button" data-filter="all" aria-pressed="true">${t('Tümü', 'All')}</button>${categories.map(name => `<button class="filter-button" type="button" data-filter="${e(name)}" aria-pressed="false">${e(name)}</button>`).join('')}</div><label class="search-label"><span class="sr-only">${e(label)}</span><input class="search-input" type="search" data-search placeholder="${e(label)}"></label><p class="filter-count" data-filter-count role="status" aria-live="polite"></p></div>`; }
function filterAttrs(category, text) { return `data-filter-item data-category="${e(category)}" data-search-text="${e(text)}"`; }
function filterEmpty(t) { return `<p class="empty-note filter-empty" data-filter-empty hidden>${t('Bu aramada sonuç bulunamadı. Başka bir kelime veya kategori deneyin.', 'No results found. Try a different search term or category.')}</p>`; }
function emptyCollection(title, copy, label, href) {
  return `<section class="section"><div class="archive-empty"><h2>${e(title)}</h2><p>${e(copy)}</p>${anchor(label, href, 'text-link', /^https?:/i.test(href))}</div></section>`;
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
  return `<figure class="gallery-card">
    <a class="gallery-image" href="${e(safeImageSrc(photo.src))}" data-gallery-image data-src="${e(safeImageSrc(photo.src))}" data-alt="${e(photo.alt)}" data-caption="${e(caption)}" aria-label="${e(label)}">
      ${image(photo.src, photo.alt, photo.width, photo.height)}<span class="gallery-expand" aria-hidden="true">${icon('external')}</span>
    </a>${caption ? `<figcaption>${e(caption)}</figcaption>` : ''}
  </figure>`;
}
function validSlug(item) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item?.slug ?? ''); }
function routable(items) { return publishedRecords(items).filter(item => validSlug(item) && String(item.title || item.name || '').trim()); }
const eventPhotos = event => galleryPhotos(event?.photos);
const publishedProgram = event => publishedRecords(event?.program).filter(item => String(item.title || '').trim());
const publishedResults = event => publishedRecords(event?.results).filter(item => String(item.label || '').trim() && String(item.result || '').trim());
export function eventPath(event) {
  return event?.status === 'published' && validSlug(event) && String(event.title || '').trim() ? `/etkinlikler/${event.slug}/` : '';
}
// Event label that follows the event: written for the phase at build time, switched in the browser by main.js.
export function phaseEyebrow(t, event, set = 'season') {
  const labels = {
    home: { upcoming: t('Yarışma takvimi', 'Competition schedule'), live: t('Yarışma takvimi', 'Competition schedule'), ended: t('Tamamlanan etkinlik', 'Completed event') },
    season: { upcoming: t('Yaklaşan etkinlik', 'Upcoming event'), live: t('Etkinlik devam ediyor', 'Event in progress'), ended: t('Tamamlanan etkinlik', 'Completed event') },
  }[set];
  const phase = eventPhase(event);
  if (!phase) return `<p class="eyebrow">${e(t('Etkinlik', 'Event'))}</p>`;
  const data = ['upcoming', 'live', 'ended'].map(key => ` data-label-${key}="${e(labels[key])}"`).join('');
  return `<p class="eyebrow" data-event-phase data-start="${e(event.startDate)}" data-end="${e(event.endDate)}"${data}>${e(labels[phase])}</p>`;
}
export function sponsorshipMailto(content, t) {
  return `mailto:${content.email}?subject=${encodeURIComponent(t('AIR FORCE 12414 Sponsorluk', 'AIR FORCE 12414 Sponsorship'))}`;
}
const newestStart = (a, b) => String(b.startDate || '').localeCompare(String(a.startDate || ''));
function eventAlbums(data) {
  return routable(data.events).sort(newestStart)
    .map(event => ({ event, photos: eventPhotos(event) }))
    .filter(album => album.photos.length);
}
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
export const journalCategories = [['Takımdan', 'From the team'], ['Özel Günler', 'Special days'], ['FRC Gelişmeleri', 'FRC updates'], ['Teknik', 'Technical']];
export function journalCategory(value, lang = 'tr') {
  const text = String(value ?? '').trim();
  const match = journalCategories.find(pair => pair.includes(text)) || journalCategories[0];
  return lang === 'en' ? match[1] : match[0];
}
export const newestYear =(a, b) => (Number(b.year) || 0) - (Number(a.year) || 0);
export const newestDate = (a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0);
// The English brand name keeps its own language so Turkish uppercase rules do not turn it into "ROBOTİCS".
const FRC_NAME = '<span lang="en">FIRST Robotics Competition</span>';
const yearLabels = (items) => [...new Set(items.map(item => item.year).filter(year => year != null && year !== '').map(year => String(year).trim()).filter(Boolean))];
const routes = [
  ['team', '/takim/', 'Takımımız', 'AIR FORCE 12414', 'AIR FORCE #12414, İSTEK Ankara Okulları bünyesinde 2027 FRC sezonuna hazırlanan robotik takımı.'],
  ['history', '/takim/tarihce/', 'Hikâyemiz', 'Dünden bugüne', 'AIR FORCE #12414 takımının sezonlara göre hikâyesi.'],
  ['awards', '/takim/basarilar/', 'Başarılarımız', 'Sezon arşivi', 'AIR FORCE #12414 yarışma sonuçları ve ödülleri için sezon arşivi.'],
  ['robots', '/robotlar/', 'Sezon ve robotlar', 'AIR FORCE 12414', 'AIR FORCE sezon durumu, yarışma takvimi ve yayımlanan robot kayıtları.'],
  ['robot', '/robotlar/ilk-robot/', 'İlk robotumuz', 'Robot tanıtımı', 'AIR FORCE #12414 ilk robotu için teknik bilgiler, sezon sonuçları ve medya alanı.'],
  ['impact', '/toplumsal-etki/', 'Toplumsal etki', 'Robotun ötesinde', 'AIR FORCE eğitim, paylaşım ve toplumsal etki projeleri.'],
  ['resources', '/kaynaklar/', 'Kaynaklar', 'Öğren, üret, paylaş', 'AIR FORCE teknik kaynakları: mekanik, elektronik, yazılım, strateji ve takım çalışmaları.'],
  ['events', '/etkinlikler/', 'Etkinlikler', 'Sezon takvimi', 'AIR FORCE #12414’ün katıldığı FIRST Robotics Competition etkinlikleri: tarih, konum ve resmî bağlantılar.'],
  ['news', '/gunluk/', 'Takım Günlüğü', 'AIR FORCE günlüğü', 'AIR FORCE #12414 takım günlüğü: takımdan haberler, özel günler, FRC gelişmeleri ve teknik yazılar.'],
  ['gallery', '/galeri/', 'Takım galerisi', 'Takım ve etkinlik fotoğrafları', 'AIR FORCE #12414 takım, atölye ve yarışma fotoğrafları ile videoları.'],
  ['projectGallery', '/proje-galerisi/', 'Proje galerisi', 'Sosyal sorumluluk', 'AIR FORCE #12414 sosyal sorumluluk projelerinin fotoğraf albümleri.'],
  ['frc', '/frc/', 'FIRST & FRC', 'Bir robotun ötesi', 'FIRST Robotics Competition ve AIR FORCE takımının yer aldığı robotik programı.'],
  ['sponsors', '/sponsorluk/', 'Sponsorlarımız', 'Sponsorluk', 'AIR FORCE #12414 sponsorları, okulumuz ve Türkiye’deki FRC organizatörü.'],
  ['support', '/destek-ol/', 'Sponsor olun', 'AIR FORCE ile', 'AIR FORCE için malzeme, üretim ve yarışma desteği seçenekleri ve sponsorluk iletişimi.'],
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
  events: ['Events', 'Season calendar', 'FIRST Robotics Competition events AIR FORCE #12414 takes part in: dates, venues and official links.'],
  news: ['Team journal', 'AIR FORCE journal', 'The AIR FORCE #12414 team journal: team news, special days, FRC updates and technical posts.'],
  gallery: ['Team gallery', 'Team and event photos', 'Photos and videos of AIR FORCE #12414 in the workshop and at competitions.'],
  projectGallery: ['Project gallery', 'Community outreach', 'Photo albums from AIR FORCE #12414 community outreach projects.'],
  frc: ['FIRST & FRC', 'Beyond the robot', 'Learn about FIRST Robotics Competition, the robotics program AIR FORCE takes part in.'],
  sponsors: ['Our sponsors', 'Sponsorship', 'Our sponsors, our school and the FIRST Robotics Competition organizer in Türkiye.'],
  support: ['Sponsor the team', 'AIR FORCE 12414', 'Support AIR FORCE with materials, fabrication or competition expenses, or contact us about sponsorship.'],
  contact: ['Contact', 'Ankara, Türkiye', 'Contact AIR FORCE #12414 at airforce@istek.k12.tr or on Instagram at @airforce12414.'],
};
// Summary, date and place joined by " · ". The place is the first part dropped when the line would be cut off in search results.
function eventDescription(item) {
  const parts = [item.summary, item.date, item.location].filter(Boolean).map(part => String(part).trim().replace(/[.\s]+$/, ''));
  while (parts.length > 2 && parts.join(' · ').length > 155) parts.pop();
  return parts.join(' · ') || item.title;
}
export function buildContentRoutes(data = content, lang = 'tr') {
  const t = translator(lang);
  const emptyPages = {
    history: !titledRecords(data.history).length,
    awards: !titledRecords(data.awards).length,
    robot: !routable(data.robots).some(item => item.slug === 'ilk-robot'),
    impact: !routable(data.projects).length,
    resources: !publicResources(data.resources).length,
    events: !publishedRecords(data.events).filter(item => String(item.title || '').trim()).length,
    news: !routable(data.news).length,
    gallery: !allPhotos(data, t).length && !publicVideos(data.videos).length && !eventAlbums(data).length,
    projectGallery: !projectAlbums(data.projects).length,
  };
  const result = routes.map(([kind, path, ...metadata]) => {
    const [title, kicker, description] = t(metadata, englishMetadata[kind]);
    return { kind, path, file: `${path.slice(1)}index.html`, title, kicker, description, noindex: Boolean(emptyPages[kind]) };
  });
  for (const [kind, items, prefix] of [['robot', data.robots, '/robotlar/'], ['project', data.projects, '/toplumsal-etki/'], ['event', data.events, '/etkinlikler/'], ['article', data.news, '/gunluk/']]) {
    const seenSlugs = new Set();
    for (const item of publishedRecords(items).filter(validSlug)) {
      if (seenSlugs.has(item.slug)) throw new Error(`${prefix} içeriğinde aynı slug birden fazla kez yayımlandı: "${item.slug}". Her kayda benzersiz bir slug verin.`);
      seenSlugs.add(item.slug);
    }
    const entries = routable(items).sort(kind === 'robot' ? newestYear : kind === 'event' ? newestStart : newestDate);
    const parent = { robot: [t('Sezon ve robotlar', 'Season and robots'), '/robotlar/'], project: [t('Toplumsal etki', 'Community impact'), '/toplumsal-etki/'], event: [t('Etkinlikler', 'Events'), '/etkinlikler/'], article: [t('Takım Günlüğü', 'Team journal'), '/gunluk/'] }[kind];
    for (const entry of entries) {
      const path = `${prefix}${entry.slug}/`;
      const item = lang === 'en' ? localizeRecord(entry, lang) : entry;
      const record = { kind, path, file: `${path.slice(1)}index.html`, title: item.title || item.name, kicker: kind === 'article' ? journalCategory(item.category, lang) : kind === 'event' ? t('Etkinlik', 'Event') : item.year || item.category || 'AIR FORCE 12414', description: kind === 'event' ? eventDescription(item) : item.description || item.summary || item.title || item.name, noindex: false, item, parent: { title: parent[0], path: parent[1] } };
      const existing = result.findIndex(route => route.path === path);
      if (existing >= 0) result[existing] = record;
      else result.push(record);
    }
  }
  return result;
}
export const contentRoutes = buildContentRoutes();

function team({ content, t }) {
  const sources = responsiveSources(content.teamPhotoSources);
  const photo = image(content.teamPhoto, content.teamPhotoAlt, content.teamPhotoWidth, content.teamPhotoHeight, 'team-photo-image', content.teamPhotoPosition, sources ? ` srcset="${e(sources)}" sizes="(min-width: 981px) 540px, 92vw"` : '');
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
    <div class="af-editorial-copy">
      <p class="eyebrow">Ankara İstech Robotics Force</p>
      <h2>${t('İSTEK Ankara’dan', 'From İSTEK Ankara to')}<br>${t('FIRST Robotics Competition’a', 'FIRST Robotics Competition')}</h2>
      <p class="lead">${e(t(`AIR FORCE #12414, ${content.school.name} robotik takımıdır.`, `AIR FORCE #12414 is the robotics team at ${content.school.name}.`))}</p>
      <p>${t('2027, FIRST Robotics Competition’daki ilk sezonumuz. Sezon durumumuzu ve yarışma takvimimizi sezon sayfasından izleyebilirsiniz.', '2027 is our first season in FIRST Robotics Competition. Find our latest update and competition schedule on the season page.')}</p>
      <div class="entry-actions">${anchor(t('Sezon sayfası', 'Season page'), '/robotlar/')}${anchor(t('Resmî FIRST takım profili', 'Official FIRST team profile'), content.firstProfile, 'text-link', true)}</div>
    </div>
    ${photo ? `<figure class="af-team-photo" data-team-photo>${photo}<figcaption>AIR FORCE #12414 · ${e(content.school.name)}</figcaption></figure>` : `<aside class="af-identity" aria-label="${t('Takım bilgileri', 'Team details')}">
      ${image('/assets/logo-440.webp', 'AIR FORCE Ankara İstech Robotics', 440, 197)}
      <dl><div><dt>${t('Takım numarası', 'Team number')}</dt><dd>12414</dd></div><div><dt>${t('Okul', 'School')}</dt><dd>${e(content.school.name)}</dd></div><div><dt>${t('Konum', 'Location')}</dt><dd>Ankara, Türkiye</dd></div><div><dt>${t('İlk FRC sezonu', 'First FRC season')}</dt><dd>2027</dd></div></dl>
    </aside>`}
  </section>
  ${subteams.length ? `<section class="section af-work-section" id="calisma-alanlari">
    <div class="af-section-intro"><h2>${t('Çalışma alanlarımız', 'How we work')}</h2></div>
    <div class="af-work-list">${subteams.map(item => `<article><h3>${e(item.name)}</h3>${para(item.description)}</article>`).join('')}</div>
  </section>` : ''}
  <section class="section af-school-section${content.schoolMark.logo ? ' af-school-section--with-mark' : ''}" id="okulumuz">
    ${content.schoolMark.logo ? `<div class="af-school-mark">${image(content.schoolMark.logo, content.school.name, content.schoolMark.width, content.schoolMark.height)}</div>` : ''}
    <div><p class="eyebrow">${t('Okulumuz', 'Our school')}</p><h2>${e(content.school.name)}</h2><p>${t('Takımımız Ankara, Türkiye’de faaliyet gösterir.', 'Our team is based in Ankara, Türkiye.')}</p><div class="entry-actions">${anchor(t('İSTEK Ankara’yı tanıyın', 'Visit İSTEK Ankara'), content.school.url, 'text-link', true)}${anchor(t('FIRST ve FRC hakkında', 'About FIRST and FRC'), '/frc/')}</div></div>
  </section>
  ${roster(t('Öğrencilerimiz', 'Our students'), 'ekip', students)}
  ${roster(t('Mentorlarımız', 'Our mentors'), 'mentorlar', mentors)}
  <section class="section af-contact-strip"><div><h2>${t('AIR FORCE’a ulaşın', 'Get in touch with AIR FORCE')}</h2></div>${anchor(content.email, `mailto:${content.email}`, 'text-link')}</section>`;
}
function history({ content, t }) {
  const entries = titledRecords(content.history).sort(newestYear);
  if (!entries.length) return emptyCollection(t('Tarihçe kaydı henüz yayımlanmadı', 'No season history published yet'), t('AIR FORCE’un takım bilgilerini ve ilk sezon durumunu inceleyebilirsiniz.', 'Meet AIR FORCE and follow our first season.'), t('Sezon sayfası', 'Season page'), '/robotlar/');
  return `<section class="section">${heading(t('Takımın yolculuğu', 'The team’s journey'))}<div class="timeline">${entries.map(item => `<article class="timeline-item"><div class="timeline-date">${e(item.year)}</div><div><h3>${e(item.title)}</h3>${para(item.description)}${image(item.image, item.imageAlt || item.title)}${item.robotSlug && routable(content.robots).some(robot => robot.slug === item.robotSlug) ? anchor(t('Sezonun robotu', 'View the season’s robot'), `/robotlar/${item.robotSlug}/`) : ''}</div></article>`).join('')}</div>${anchor(t('Takımı tanıyın', 'Meet the team'), '/takim/')}</section>`;
}
function awards({ content, t }) {
  const entries = titledRecords(content.awards).sort(newestYear), years = yearLabels(entries);
  if (!entries.length) return emptyCollection(t('Sonuç kaydı henüz yayımlanmadı', 'No results yet'), t('Bu arşivde henüz yarışma sonucu veya ödül bulunmuyor.', 'Competition results and awards will appear here once published.'), t('Sezon sayfası', 'Season page'), '/robotlar/');
  return `<section class="section" data-collection>${heading(t('Yarışma sonuçları ve ödüller', 'Competition results and awards'))}${filterBar(years, t('Ödül veya etkinlik ara', 'Search awards or events'), t)}<div class="archive-grid">${entries.map(item => `<article class="archive-card award-card" ${filterAttrs(String(item.year || ''), `${item.title} ${item.event || ''} ${item.year || ''}`)}>${icon('medal')}<span class="tag">${e(item.year)}</span><h3>${e(item.title)}</h3>${para(item.event)}${anchor(t('Resmî sonuçlar', 'Official results'), item.url, 'text-link', true)}</article>`).join('')}</div>${filterEmpty(t)}</section>`;
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
  const detailPath = eventPath(event);
  const season = content.season || {};
  const updated = formatContentDate(season.updatedAt, lang);
  const year = e(season.year || 2027);
  const emptyRobotMessage = t('Henüz robot tanıtımı veya teknik kayıt yayımlanmadı.', 'We haven’t published a robot profile or technical documentation yet.');
  return `${entries.length ? sectionNav([[t('Sezon', 'Season'), 'sezon'], [t('Robot arşivi', 'Robot archive'), 'robot-arsivi']], t) : ''}
  <section class="section af-robot-season" id="sezon">
    <div class="af-season-intro">
      <p class="eyebrow">${FRC_NAME}</p>
      <h2>${t(`${year} sezonu`, `${year} season`)}</h2>
      ${season.status ? status(season.status) : ''}
      <p class="lead">${e(season.description || content.seasonStatus)}</p>
      ${updated ? `<p>${t('Son güncelleme', 'Last updated')} <time datetime="${e(season.updatedAt)}">${e(updated)}</time></p>` : ''}
      ${!entries.length ? para(emptyRobotMessage) : ''}
      <div class="entry-actions">${anchor(t('FIRST ve FRC hakkında', 'About FIRST and FRC'), '/frc/')}${anchor(t('Resmî FIRST takım profili', 'Official FIRST team profile'), content.firstProfile, 'text-link', true)}</div>
    </div>
    ${event ? `<aside class="af-event-panel" aria-label="${t('Yarışma takvimi', 'Competition schedule')}">
      ${phaseEyebrow(t, event)}<h3>${e(event.title)}</h3>
      <p class="af-event-date">${e(event.date)}</p>
      <p class="af-event-location">${e(event.location)}</p>
      <div class="event-countdown" data-countdown-start="${e(event.startDate)}" data-countdown-end="${e(event.endDate)}" aria-live="off" hidden></div>
      ${detailPath ? `<div class="entry-actions">${anchor(t('Etkinlik ayrıntıları', 'Event details'), detailPath, 'button button-gold')}${anchor(t('FIRST etkinlik sayfası', 'FIRST event page'), event.url, 'text-link', true)}</div>` : anchor(t('FIRST etkinlik sayfası', 'FIRST event page'), event.url, 'button button-gold', true)}
    </aside>` : `<aside class="af-season-reference"><p class="eyebrow">${t('Yarışma takvimi', 'Competition schedule')}</p><h3>${t('Yaklaşan etkinlik kaydı yok', 'No upcoming events listed')}</h3><p>${t('Takımın resmî etkinlik kayıtlarını FIRST üzerinden inceleyebilirsiniz.', 'Visit FIRST for the team’s official event listings.')}</p>${anchor(t('FIRST takım profili', 'FIRST team profile'), content.firstProfile, 'text-link', true)}</aside>`}
  </section>
  ${entries.length ? `<section class="section af-robot-archive" id="robot-arsivi" data-collection>${heading(t('Robot arşivi', 'Robot archive'))}
    ${entries.length > 1 ? filterBar(years, t('Robot veya oyun ara', 'Search robots or games'), t) : ''}
    <div class="af-robot-list">${entries.map(entry => robotCard(entry, t)).join('')}</div>${filterEmpty(t)}</section>` : ''}
  <section class="section af-contact-strip"><div><h2>${t('Üretime katkı sağlayın', 'Help us build our robot')}</h2></div>${anchor(t('Destek seçenekleri', 'Ways to support the team'), '/destek-ol/', 'button button-gold')}</section>`;
}
function robot({ content, t, date }, item) {
  const entry = item || routable(content.robots).find(record => record.slug === 'ilk-robot');
  if (!entry) return `<section class="section"><div class="season-summary" id="genel-bakis"><h2>${t('İlk sezonumuz', 'Our first season')}</h2>
    <p>${t('Henüz robot tanıtımı veya teknik kayıt yayımlanmadı.', 'We haven’t published a robot profile or technical documentation yet.')}</p><p>${e(content.season?.description || content.seasonStatus)}</p>${anchor(t('Sezon sayfasına dön', 'Back to the season page'), '/robotlar/', 'text-link', false, true)}
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
  <section class="section">${anchor(t('Tüm robotlara dön', 'Back to all robots'), '/robotlar/', 'text-link', false, true)}</section>`;
}
function impact({ content, t }) {
  const fallbackCategory = t('Toplum', 'Community');
  const entries = routable(content.projects), categories = [...new Set(entries.map(item => item.category || fallbackCategory))];
  if (!entries.length) return emptyCollection(t('Proje kaydı henüz yayımlanmadı', 'No projects published yet'), t('Toplumsal etki projeleri hakkında takımımızla iletişime geçebilirsiniz.', 'Contact us to learn about our community outreach.'), t('İletişime geçin', 'Get in touch'), '/iletisim/');
  return `<section class="section" data-collection>${heading(t('Proje arşivi', 'Project archive'))}${filterBar(categories, t('Proje ara', 'Search projects'), t)}<div class="archive-grid">${entries.map(item => `<article class="archive-card" ${filterAttrs(item.category || fallbackCategory, `${item.title} ${item.description || ''} ${item.category || ''}`)}><a class="card-media" href="/toplumsal-etki/${e(item.slug)}/" aria-label="${e(t(`${item.title} projesini inceleyin`, `View the ${item.title} project`))}">${itemImage(item)}</a><div class="card-body"><span class="tag">${e(item.category || fallbackCategory)}</span><h3>${e(item.title)}</h3>${para(item.goal || item.description)}${anchor(t('Projeyi inceleyin', 'View project'), `/toplumsal-etki/${item.slug}/`)}</div></article>`).join('')}</div>${filterEmpty(t)}</section>`;
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
  ${hasProcess ? `<section class="section" id="amac">${heading(t('Amaç ve süreç', 'Purpose and approach'))}${para(item.goal)}${paragraphs.map(para).join('')}</section>` : ''}
  ${hasResults ? `<section class="section" id="sonuclar">${heading(t('Projenin etkisi', 'Project impact'))}${para(item.results)}${anchor(t('Proje belgesi', 'Project documentation'), item.evidenceUrl, 'button button-outline', true)}</section>` : ''}
  ${photos.length ? `<section class="section" id="proje-galeri">${heading(t('Proje fotoğrafları', 'Project photos'))}<div class="gallery-grid">${photos.map(photo => galleryPhoto(photo, t)).join('')}</div></section>` : ''}
  <div class="section entry-actions">${anchor(t('Tüm projelere dön', 'Back to all projects'), '/toplumsal-etki/', 'button button-outline', false, true)}${photos.length ? anchor(t('Proje galerisi', 'Project gallery'), '/proje-galerisi/') : ''}</div>`;
}
function resources({ content, t }) {
  const entries = publicResources(content.resources);
  const fallbackTopic = t('Genel', 'General');
  const categories = [...new Set(entries.map(item => item.topic || fallbackTopic))];
  if (!entries.length) return emptyCollection(t('Kaynak henüz yayımlanmadı', 'No resources published yet'), t('Yarışma programını ve sezonun işleyişini FIRST & FRC sayfasında inceleyebilirsiniz.', 'Learn about the competition and how the season works on our FIRST & FRC page.'), t('FIRST ve FRC hakkında', 'About FIRST and FRC'), '/frc/');
  const cards = entries.map(item => {
    const href = safeHref(item.url);
    const link = item.download === true && href.startsWith('/')
      ? `<a class="text-link" href="${e(href)}" download>${t('Şablonu indir', 'Download template')}</a>`
      : anchor(t('Kaynağı aç', 'Open resource'), href, 'text-link', true);
    const topic = item.topic || fallbackTopic;
    return `<article class="content-card resource-card" ${filterAttrs(topic, `${item.title} ${item.description || ''} ${topic} ${item.category || ''} ${item.level || ''} ${item.year || ''}`)}>
      <div class="resource-icon">${icon('book')}</div>
      <div class="resource-meta"><span class="tag">${e(topic)}</span>${[item.level, item.year, item.category].filter(Boolean).map(value => `<span>${e(value)}</span>`).join('')}</div>
      <h3>${e(item.title)}</h3>${para(item.description)}<div class="card-bottom">${link}<span>${e(item.format)}</span></div>
    </article>`;
  });
  return `<section class="section" data-collection>${heading(t('Teknik belgeler ve eğitim kaynakları', 'Technical documents and learning resources'))}${filterBar(categories, t('Kaynak ara', 'Search resources'), t)}<div class="archive-grid resources-grid">${cards.join('')}</div>${filterEmpty(t)}</section>`;
}
function events({ content, t }) {
  const items = publishedRecords(content.events).filter(item => String(item.title || '').trim());
  if (!items.length) return emptyCollection(t('Etkinlik kaydı henüz yayımlanmadı', 'No events published yet'), t('Güncel sezon durumuna sezon sayfasından ulaşabilirsiniz.', 'Visit the season page for our latest update.'), t('Sezon sayfası', 'Season page'), '/robotlar/');
  const upcoming = items.filter(item => isUpcomingEvent(item)).sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
  const hasDates = item => isCalendarDate(item.startDate) && isCalendarDate(item.endDate);
  const past = items.filter(item => hasDates(item) && !isUpcomingEvent(item)).sort(newestStart);
  // Events with missing or invalid dates are neither upcoming nor past; list them last without inventing a date.
  const undated = items.filter(item => !hasDates(item));
  const row = item => {
    const path = eventPath(item);
    return `<article class="event-row">${icon('calendar')}<div><h3>${e(item.title)}</h3>${para([item.date, item.location].filter(Boolean).join(' · '))}</div><div class="entry-actions">${path ? anchor(t('Etkinlik ayrıntıları', 'Event details'), path) : ''}${anchor(t('FIRST etkinlik sayfası', 'FIRST event page'), item.url, 'text-link', true)}</div></article>`;
  };
  const block = (id, title, list) => list.length ? `<section class="section" id="${id}">${heading(title)}<div class="event-list">${list.map(row).join('')}</div></section>` : '';
  return `${upcoming.length && past.length ? sectionNav([[t('Yaklaşan', 'Upcoming'), 'yaklasan'], [t('Geçmiş', 'Past'), 'gecmis']], t) : ''}
  ${block('yaklasan', t('Yaklaşan etkinlikler', 'Upcoming events'), upcoming)}
  ${block('gecmis', t('Geçmiş etkinlikler', 'Past events'), past)}
  ${block('tarihsiz', t('Diğer etkinlikler', 'Other events'), undated)}`;
}
function event({ content, t, date, lang }, item = {}) {
  const upcoming = isUpcomingEvent(item);
  const program = publishedProgram(item), results = publishedResults(item), photos = eventPhotos(item);
  const season = content.season || {};
  const datesValid = isCalendarDate(item.startDate) && isCalendarDate(item.endDate);
  const sections = [
    [t('Genel bakış', 'Overview'), 'genel-bakis'],
    ...(program.length ? [[t('Program', 'Schedule'), 'program']] : []),
    ...(results.length ? [[t('Sonuçlar', 'Results'), 'sonuclar']] : []),
    ...(photos.length ? [[t('Fotoğraflar', 'Photos'), 'fotograflar']] : []),
  ];
  const specs = [[t('Konum', 'Location'), item.location], [t('Organizatör', 'Organizer'), content.frcOrganizer?.name]].filter(([, value]) => value);
  return `<section class="section af-robot-season" id="genel-bakis">
    <div class="af-season-intro">
      <p class="eyebrow">${FRC_NAME} · ${e(season.year || 2027)}</p>
      ${item.summary ? `<p class="lead">${e(item.summary)}</p>` : ''}
      ${specs.length ? specList(specs) : ''}
      <div class="entry-actions">${anchor(t('FIRST etkinlik sayfası', 'FIRST event page'), item.url, 'button button-gold', true)}${anchor(t('Sezon sayfası', 'Season page'), '/robotlar/')}</div>
    </div>
    <aside class="af-event-panel" aria-label="${t('Etkinlik bilgileri', 'Event information')}">
      ${phaseEyebrow(t, item)}
      ${item.date ? `<p class="af-event-date">${e(item.date)}</p>` : ''}
      ${datesValid ? `<div class="event-countdown" data-countdown-start="${e(item.startDate)}" data-countdown-end="${e(item.endDate)}" aria-live="off" hidden></div>` : ''}
    </aside>
  </section>
  ${sections.length > 1 ? sectionNav(sections, t) : ''}
  ${program.length ? `<section class="section" id="program"><h2 class="section-heading">${t('Etkinlik programı', 'Event schedule')}</h2>
    <div class="timeline">${program.map(entry => `<article class="timeline-item"><div class="timeline-date">${e([formatContentDate(entry.date, lang) || entry.date, entry.time].filter(Boolean).join(' · '))}</div><div><h3>${e(entry.title)}</h3>${para(entry.description)}</div></article>`).join('')}</div>
  </section>` : ''}
  ${results.length ? `<section class="section" id="sonuclar"><h2 class="section-heading">${t('Etkinlik sonuçları', 'Event results')}</h2>
    <div class="table-scroll"><table class="results-table">
      <caption class="sr-only">${t('Etkinlik sonuçları', 'Event results')}</caption>
      <thead><tr><th scope="col">${t('Başlık', 'Item')}</th><th scope="col">${t('Sonuç', 'Result')}</th></tr></thead>
      <tbody>${results.map(entry => `<tr><th scope="row">${e(entry.label)}</th><td>${anchor(entry.result, entry.url, 'text-link', true) || e(entry.result)}</td></tr>`).join('')}</tbody>
    </table></div>
    ${anchor(t('Resmî sonuçlar', 'Official results'), item.url, 'text-link', true)}
  </section>` : ''}
  ${photos.length ? `<section class="section" id="fotograflar">${heading(t('Etkinlik fotoğrafları', 'Event photos'))}<div class="gallery-grid">${photos.map(photo => galleryPhoto(photo, t)).join('')}</div></section>` : ''}
  <div class="section entry-actions">${anchor(t('Tüm etkinlikler', 'All events'), '/etkinlikler/', 'button button-outline', false, true)}${anchor(t('Takım galerisi', 'Team gallery'), '/galeri/')}</div>`;
}
function news({ content, t, date, lang }) {
  const entries = routable(content.news).sort(newestDate);
  if (!entries.length) return emptyCollection(t('Yazı henüz yayımlanmadı', 'No posts published yet'), t('Güncel sezon durumuna ve yarışma takvimine sezon sayfasından ulaşabilirsiniz.', 'Visit the season page for our latest update and competition schedule.'), t('Sezon sayfası', 'Season page'), '/robotlar/');
  const present = new Set(entries.map(item => journalCategory(item.category, lang)));
  const categories = journalCategories.map(pair => journalCategory(pair[0], lang)).filter(name => present.has(name));
  return `<section class="section" data-collection>${filterBar(categories, t('Yazı ara', 'Search posts'), t)}<div class="archive-grid news-grid">${entries.map(item => { const category = journalCategory(item.category, lang); return `<article class="archive-card" ${filterAttrs(category, `${item.title} ${item.summary || ''} ${category}`)}><a class="card-media" href="/gunluk/${e(item.slug)}/" aria-label="${e(t(`${item.title} yazısını okuyun`, `Read ${item.title}`))}">${itemImage(item)}</a><div class="card-body"><div class="article-meta"><span class="tag">${e(category)}</span><span>${e(date(item.date))}</span></div><h3>${e(item.title)}</h3>${para(item.summary)}${anchor(t('Yazıyı okuyun', 'Read the post'), `/gunluk/${item.slug}/`)}</div></article>`; }).join('')}</div>${filterEmpty(t)}</section>`;
}
function article({ t, date, lang }, item = {}) { return `<article class="article-content section"><div class="article-meta"><span class="tag">${e(journalCategory(item.category, lang))}</span><span>${e(date(item.date))}</span></div>${item.image ? `<figure class="article-cover">${itemImage(item)}</figure>` : ''}<p class="lead">${e(item.summary)}</p><div class="article-body">${(item.paragraphs || []).map(para).join('')}</div>${item.url ? anchor(t('İlgili bağlantı', 'Related link'), item.url, 'text-link', true) : ''}</article><div class="section">${anchor(t('Takım Günlüğü’ne dön', 'Back to the journal'), '/gunluk/', 'button button-outline', false, true)}</div>`; }
function gallery({ content, t }) {
  const photos = allPhotos(content, t), videos = publicVideos(content.videos), albums = eventAlbums(content);
  const navigation = galleryNav('/galeri/', t);
  if (!photos.length && !videos.length && !albums.length) return navigation + emptyCollection(t('Fotoğraf veya video henüz yayımlanmadı', 'No photos or videos published yet'), t('Takımımızı Instagram hesabından takip edebilirsiniz.', 'Follow the team on Instagram.'), t('Instagram’a gidin', 'Visit Instagram'), content.instagram);
  const groups = new Map();
  for (const photo of photos) {
    const name = photo.album || photo.category || t('Takım', 'Team');
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(photo);
  }
  const photoAlbums = [...groups];
  const sections = [
    ...photoAlbums.map(([name], index) => [name, `album-${index + 1}`]),
    ...(albums.length ? [[t('Etkinlik albümleri', 'Event albums'), 'etkinlik-albumleri']] : []),
    ...(videos.length ? [[t('Videolar', 'Videos'), 'videolar']] : []),
  ];
  return `${navigation}${sections.length > 1 ? sectionNav(sections, t) : ''}
    ${photoAlbums.length ? `<div id="fotograflar">${photoAlbums.map(([name, list], index) => `<section class="section photo-album" aria-labelledby="album-${index + 1}">
      <div class="section-heading project-album-heading"><div><h2 id="album-${index + 1}">${e(name)}</h2></div>${index === 0 ? anchor('Instagram', content.instagram, 'text-link', true) : ''}</div>
      <div class="gallery-grid">${list.map(photo => galleryPhoto(photo, t)).join('')}</div>
    </section>`).join('')}</div>` : ''}
    ${albums.length ? `<section class="section" id="etkinlik-albumleri">${heading(t('Etkinlik albümleri', 'Event albums'))}<div class="archive-grid">${albums.map(({ event, photos: list }) => {
      const href = `/etkinlikler/${event.slug}/#fotograflar`;
      const cover = list[0];
      return `<article class="archive-card"><a class="card-media" href="${e(href)}" aria-label="${e(t(`${event.title} albümünü açın`, `Open the ${event.title} album`))}">${image(cover.src, cover.alt, cover.width, cover.height)}</a><div class="card-body">${event.date ? `<span class="tag">${e(event.date)}</span>` : ''}<h3>${e(event.title)}</h3>${para(t(`${list.length} fotoğraf`, `${list.length} ${list.length === 1 ? 'photo' : 'photos'}`))}${anchor(t('Albümü açın', 'Open album'), href)}</div></article>`;
    }).join('')}</div></section>` : ''}
    ${videos.length ? `<section class="section" id="videolar">${heading(t('Videolar', 'Videos'))}<div class="content-grid cols-2">${videos.map(video => `<article class="archive-card">${safeImageSrc(video.thumbnail) ? `<div class="card-media">${image(video.thumbnail, video.title)}</div>` : ''}<div class="card-body"><span class="tag">${e(video.category)}</span><h3>${e(video.title)}</h3>${para(video.description)}${anchor(t('Videoyu izleyin', 'Watch the video'), video.url, 'text-link', true)}</div></article>`).join('')}</div></section>` : ''}`;
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
function frc({ content, t }) {
  const stages = [
    [t('Tasarım', 'Design'), t('Takımlar oyunu analiz eder, stratejilerini belirler ve robotu tasarlar.', 'Teams study the game, choose a strategy and design their robot.')],
    [t('Üretim ve test', 'Build and test'), t('Takımlar robotu üretir, programlar ve performansını test eder.', 'Teams build, program and test their robot.')],
    [t('Yarışma', 'Compete'), t('Takımlar ittifaklar kurarak yarışır ve edindikleri deneyimi paylaşır.', 'Teams compete in alliances and share what they’ve learned.')],
  ];
  return `<section class="section split-layout">
    <div><p class="eyebrow">${FRC_NAME}</p><p class="lead">${t('Lise öğrencileri için robotik yarışması', 'A robotics competition for high school students')}</p></div>
    <div>
      <p>${t('FRC, lise öğrencilerinin mentorlarıyla birlikte robot tasarladığı, ürettiği ve programladığı uluslararası bir robotik yarışmasıdır.', 'FRC is an international robotics competition where high school students work with mentors to design, build and program robots.')}</p>
      <p>${t('Her sezon açıklanan oyun, yeni bir mühendislik problemi getirir. Takımlar kendi robotlarını geliştirir ve sahada ittifaklar halinde yarışır.', 'Each season introduces a new game and engineering challenge. Teams develop their own robots and compete on the field in alliances.')}</p>
      ${anchor(t('FIRST’ün resmî sitesini inceleyin', 'Visit the official FIRST website'), 'https://www.firstinspires.org/programs/frc/', 'text-link', true)}
    </div>
  </section>
  <section class="section">${heading(t('Robot geliştirme ve yarışma süreci', 'From design to competition'))}
    <div class="content-grid cols-3 frc-stages">${stages.map(([title, description]) => `<article class="content-card"><h3>${e(title)}</h3><p>${e(description)}</p></article>`).join('')}</div>
  </section>
  <section class="section split-layout frc-values">
    <div>${heading(t('FIRST’ün takım çalışması ilkeleri', 'How teams work together'))}</div>
    <div><h3>Gracious Professionalism®</h3><p>${t('İşe özen göstermek ve diğer insanlara saygı duymak.', 'Do your work with care and treat others with respect.')}</p><h3>Coopertition®</h3><p>${t('Yarışma sırasında diğer takımlarla yardımlaşmak ve birlikte öğrenmek.', 'Help and learn from other teams while competing with them.')}</p>${anchor(t('FIRST’ün yaklaşımı', 'Learn about the FIRST approach'), 'https://www.firstinspires.org/about/vision-and-mission', 'text-link', true)}</div>
  </section>
  <section class="section">${routable(content.robots).length ? anchor(t('AIR FORCE robotlarını keşfedin', 'Explore AIR FORCE robots'), '/robotlar/', 'button button-gold') : anchor(t('Sezon sayfası', 'Season page'), '/robotlar/', 'button button-gold')}</section>`;
}
function sponsorCard(item, t) {
  const mark = image(item.logo, item.name, item.width, item.height) || `<strong>${e(item.name)}</strong>`;
  const label = t(`${item.name} resmî sitesi`, `${item.name} official website`);
  return `<article class="sponsor-card">${safeHref(item.url) ? `<a class="sponsor-logo" href="${e(safeHref(item.url))}" target="_blank" rel="noopener" aria-label="${e(label)}">${mark}</a>` : `<div class="sponsor-logo">${mark}</div>`}<div class="sponsor-caption"><h3>${e(item.name)}</h3><p>${e(item.role)}</p></div></article>`;
}
function sponsors({ content, t }) {
  const organizer = content.frcOrganizer;
  const needs = (Array.isArray(content.sponsorNeeds) ? content.sponsorNeeds : []).filter(need => need?.title);
  return `${content.sponsors.length ? `<section class="section">
    <h2 class="section-heading">${t('Takım sponsorları', 'Team sponsors')}</h2>
    <div class="sponsor-grid">${content.sponsors.map(item => sponsorCard(item, t)).join('')}</div>
  </section>` : ''}
  <section class="section">
    <h2 class="section-heading">${t('Okul ve FRC organizasyonu', 'Our school and FRC organizer')}</h2>
    <div class="sponsor-grid">${[content.schoolMark, organizer].filter(Boolean).map(item => sponsorCard(item, t)).join('')}</div>
    ${organizer ? `<p class="organization-note">${e(t(`${organizer.name}, Türkiye’deki FRC etkinliklerinin organizatörüdür.`, `${organizer.name} organizes FRC events in Türkiye.`))}</p>` : ''}
  </section>
  <section class="section contact-callout" id="destek">
    <div><h2>${t('Takıma destek olun', 'Sponsor the team')}</h2>${needs.length ? `<p>${needs.map(need => e(need.title)).join(' · ')}</p>` : ''}</div>
    ${anchor(t('Destek seçenekleri', 'Ways to support the team'), '/destek-ol/', 'button button-gold')}
  </section>`;
}
const sponsorshipTiers = items => publishedRecords(items).filter(tier => String(tier.name || '').trim());
function sponsorshipFile(file) {
  return file?.status === 'published' && safeHref(file.url) && String(file.label || '').trim() ? file : null;
}
function support({ content, t }) {
  const tiers = sponsorshipTiers(content.sponsorshipTiers);
  const file = sponsorshipFile(content.sponsorshipPdf);
  const needs = (Array.isArray(content.sponsorNeeds) ? content.sponsorNeeds : []).filter(need => need?.title);
  const mailto = sponsorshipMailto(content, t);
  const upcoming = selectUpcomingEvent(content.events);
  const school = content.school.name, year = content.season?.year || 2027;
  const place = upcoming ? `${upcoming.date}${upcoming.city ? `, ${upcoming.city}` : ''}` : '';
  const context = upcoming
    ? t(`${school} robotik takımı AIR FORCE #12414, ${year}’de ilk FRC sezonuna çıkıyor; sezonun ilk etkinliği ${upcoming.title} (${place}).`, `AIR FORCE #12414, the robotics team of ${school}, enters its first FRC season in ${year}, starting at the ${upcoming.title} (${place}).`)
    : t(`${school} robotik takımı AIR FORCE #12414, ${year}’de ilk FRC sezonuna çıkıyor.`, `AIR FORCE #12414, the robotics team of ${school}, enters its first FRC season in ${year}.`);
  return `<section class="section support-intro">
    <div class="support-copy">
      <p class="lead">${t('İlk FRC sezonumuz için robot parçaları, üretim hizmetleri ve yarışma giderleri konusunda desteğe ihtiyacımız var.', 'For our first FRC season, we’re looking for help with robot parts, fabrication and competition expenses.')}</p>
      <p class="support-context">${e(context)} ${anchor(t('Etkinlik takvimi', 'Event calendar'), '/etkinlikler/')}</p>
    </div>
    <div class="support-contact">
      <div class="entry-actions">${anchor(t('Sponsorluk için yazın', 'Email us about sponsorship'), mailto, 'button button-gold')}</div>
      <p class="support-email"><span>${e(content.email)}</span>${content.emailIsPlaceholder ? '' : copyEmailControl(content.email, t)}</p>
      ${file ? anchor(file.label, file.url, 'text-link', /^https?:/i.test(file.url)) : ''}
    </div>
  </section>
  ${needs.length ? `<section class="section support-needs" aria-labelledby="support-needs-title">
    <h2 class="section-heading" id="support-needs-title">${t('Destek alanları', 'Ways to help')}</h2>
    <div class="content-grid cols-3">${needs.map(need => `<article class="content-card">
      <h3>${e(need.title)}</h3>${para(need.description)}
      ${Array.isArray(need.examples) && need.examples.length ? `<ul>${need.examples.filter(Boolean).map(example => `<li>${e(example)}</li>`).join('')}</ul>` : ''}
    </article>`).join('')}</div>
    <p class="support-note">${t('E-postanızda katkı sağlayabileceğiniz alanı ve destek biçimini belirtebilirsiniz.', 'Tell us which area you’d like to support and how you can help.')}</p>
    ${anchor(t('Sponsorlarımız', 'Our sponsors'), '/sponsorluk/')}
  </section>` : ''}
  ${tiers.length ? `<section class="section support-needs support-tiers" aria-labelledby="support-tiers-title">
    <h2 class="section-heading" id="support-tiers-title">${t('Sponsorluk seviyeleri', 'Sponsorship levels')}</h2>
    <div class="content-grid cols-3">${tiers.map(tier => `<article class="content-card">
      <h3>${e(tier.name)}</h3>${tier.amount ? `<p class="tier-amount">${e(tier.amount)}</p>` : ''}${para(tier.description)}
      ${Array.isArray(tier.benefits) && tier.benefits.length ? `<ul>${tier.benefits.filter(Boolean).map(benefit => `<li>${e(benefit)}</li>`).join('')}</ul>` : ''}
    </article>`).join('')}</div>
  </section>` : ''}`;
}
function contact({ content, t }) {
  const events = publishedRecords(content.events).filter(item => String(item.title || '').trim());
  const faqs = publishedRecords(content.faq);

  return `<section class="section"><p class="lead">${t('Takım, projeler ve sponsorluk hakkında e-posta veya Instagram üzerinden bize ulaşabilirsiniz.', 'Contact us by email or Instagram about the team, our projects or sponsorship.')}</p>
    <div class="contact-grid">
      <article class="contact-card"><h2>${t('E-posta', 'Email')}</h2>
        <div class="contact-email-row">${content.emailIsPlaceholder ? para(content.email) : anchor(content.email, `mailto:${content.email}`, 'contact-value') + copyEmailControl(content.email, t)}</div>
      </article>
      <article class="contact-card"><h2>Instagram</h2>
        ${anchor('@airforce12414', content.instagram, 'contact-value', true)}
      </article>
    </div>
    <div class="contact-callout" id="sponsorluk-is-birligi">
      <div><h2>${t('Sponsorluk ve iş birliği', 'Sponsorship and partnerships')}</h2><p>${t('Sponsorluk ve iş birliği önerilerinizi hazır konu satırlı e-postayla iletebilirsiniz.', 'Send sponsorship and partnership enquiries with a pre-filled subject line.')}</p></div>
      <div class="entry-actions">${anchor(t('Sponsorluk için yazın', 'Email us about sponsorship'), sponsorshipMailto(content, t), 'button button-gold')}${anchor(t('Sponsor olun', 'Sponsor the team'), '/destek-ol/')}</div>
    </div>
    <div class="section-actions entry-actions">${events.length ? anchor(t('Etkinlik takvimi', 'Event calendar'), '/etkinlikler/', 'text-link') : ''}${anchor(content.school.name, content.school.url, 'text-link', true)}</div>
  </section>
  <section class="section" id="gizlilik">
    <h2 class="section-heading">${t('Site ve gizlilik', 'Website and privacy')}</h2>
    <p>${t('Bu tanıtım sitesi form, reklam veya ziyaretçi analitiği kullanmaz. Açılış animasyonunun aynı sekmede tekrarlanmaması için tarayıcının oturum belleğine bir tercih kaydedilir.', 'This informational site uses no forms, advertising or visitor analytics. Your browser stores a session flag to avoid repeating the opening animation in the same tab.')}</p>
    <p>${t('Site Vercel üzerinden sunulur. Takıma e-posta gönderirseniz adresiniz ve iletiniz takıma ulaşır. Instagram bağlantısı sizi Instagram’a götürür.', 'Vercel hosts this site. If you email the team, the team receives your address and message. The Instagram link takes you to Instagram.')}</p>
    <div class="entry-actions">${anchor(t('Vercel gizlilik bildirimi', 'Vercel Privacy Notice'), 'https://vercel.com/legal/privacy-notice', 'text-link', true)}${anchor(t('Okulun kişisel veri aydınlatma metni', 'School privacy notice (Turkish)'), 'https://ankara.istek.k12.tr/sites/default/files/2024-01/aydinlatma-formu.pdf', 'text-link', true)}</div>
  </section>
  ${faqs.length ? `<section class="section"><h2 class="section-heading">${t('Sık sorulanlar', 'Frequently asked questions')}</h2>
    <div class="accordion-list">${faqs.map(faq => `<details class="accordion"><summary>${e(faq.question)}</summary><div>${para(faq.answer)}</div></details>`).join('')}</div>
  </section>` : ''}`;
}

const renderers = { team, history, awards, robots, robot, impact, project, resources, events, event, news, article, gallery, projectGallery, frc, sponsors, support, contact };
export function renderContent(kind, item, lang = 'tr') {
  if (!Object.hasOwn(renderers, kind)) throw new Error(`Unknown content page: ${kind}`);
  const content = siteContent(lang);
  const t = translator(lang);
  const date = (value) => formatContentDate(value, lang) || value;
  return renderers[kind]({ content, t, date, lang }, item && lang === 'en' ? localizeRecord(item, lang) : item);
}
