import './test-clock.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pages, renderPage } from './site-pages.js';
import { siteConfig } from './site-config.js';
import { buildContentRoutes, renderContent } from './content-pages.js';

const root = import.meta.dirname;
const turkishFiles = new Map(pages.filter(page => page.lang === 'tr').map(page => [page.originalPath, page.file]));
const rendered = new Map(pages.map(page => [page.path, renderPage(readFileSync(resolve(root,turkishFiles.get(page.originalPath)),'utf8'),page)]));

test('all page shells produce one heading and no unresolved template markers', () => {
  for (const [path,html] of rendered) {
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
    assert.match(html, /<main id="main"/);
    assert.doesNotMatch(html, /<!-- (?:site-|school-)/);
    assert.match(html, path.startsWith('/en/') ? /<html lang="en"/ : /<html lang="tr"/);
    for (const image of html.matchAll(/<img\b[^>]*>/g)) assert.match(image[0], /\balt="[^"]*"/, path);
  }
});

test('every page gets one shared loader and the early bootstrap', () => {
  for (const [path, html] of rendered) {
    assert.equal((html.match(/class="page-loader"/g) || []).length, 1, path);
    assert.ok(html.indexOf('function preparePageLoader') < html.indexOf('<body'), path);
    assert.match(html, /href="\/page-loader.css"/, path);
    assert.doesNotMatch(html, /pegasus-intro/, path);
    assert.match(html, /src="\/assets\/pegasus-480.webp"/, path);
  }
});

test('internal navigation, fragment targets and public assets resolve', () => {
  for (const [path,html] of rendered) {
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const value = match[1].replaceAll('&amp;', '&');
      if (!value.startsWith('/') && !value.startsWith('#')) continue;
      const target = new URL(value,'https://local.test'+path);
      const destination = rendered.get(target.pathname);
      if (destination) {
        if (target.hash) assert(destination.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `${path} -> ${value}`);
      } else {
        const file = target.pathname.slice(1);
        assert(existsSync(resolve(root,'public',file)) || existsSync(resolve(root,file)), `${path} -> ${value}`);
      }
    }
  }
});

test('home never leaks unpublished or invalid detail cards', () => {
  const oldNews = siteConfig.news;
  const oldRobots = siteConfig.robots;
  try {
    siteConfig.news = [{status:'draft',slug:'private',title:'PRIVATE_NEWS'},{status:'published',slug:'../bad',title:'INVALID_NEWS'}];
    siteConfig.robots = [{status:'draft',slug:'private',name:'PRIVATE_ROBOT'},{status:'published',slug:'../bad',name:'INVALID_ROBOT'}];
    const home = renderPage(readFileSync(resolve(root,'index.html'),'utf8'),pages[0]);
    assert.doesNotMatch(home,/PRIVATE_NEWS|INVALID_NEWS|PRIVATE_ROBOT|INVALID_ROBOT/);
    assert.match(home,/href="\/robotlar\/"/);
  } finally {siteConfig.news=oldNews;siteConfig.robots=oldRobots;}
});

test('empty archives are noindex while an added public record makes its archive indexable', () => {
  for (const path of ['/takim/tarihce/', '/takim/basarilar/', '/robotlar/ilk-robot/', '/toplumsal-etki/', '/gunluk/', '/galeri/', '/proje-galerisi/', '/kaynaklar/', '/en/resources/']) {
    assert.match(rendered.get(path), /name="robots" content="noindex, follow"/, path);
  }
  for (const path of ['/', '/takim/', '/robotlar/', '/frc/', '/sponsorluk/', '/destek-ol/', '/iletisim/', '/etkinlikler/', '/etkinlikler/ankara-regional/', '/en/events/', '/en/events/ankara-regional/']) {
    assert.doesNotMatch(rendered.get(path), /name="robots" content="noindex/, path);
  }
  const route = buildContentRoutes({ ...siteConfig, news: [{ status: 'published', title: 'Atölye kaydı', slug: 'atolye-kaydi', date: '2026-11-16' }] }).find(item => item.kind === 'news');
  const page = { ...route, body: () => '<p>Atölye kaydı</p>' };
  const html = renderPage(readFileSync(resolve(root, route.file), 'utf8'), page);
  assert.doesNotMatch(html, /name="robots" content="noindex/);
});

test('language switch links every page to its equivalent and English navigation stays in English', () => {
  for (const page of pages.filter(page => page.lang === 'en' && !page.hidden)) {
    const english = rendered.get(page.path);
    const turkish = rendered.get(page.originalPath);
    assert(english.includes(`class="language-switch" href="${page.originalPath}" hreflang="tr"`), page.path);
    assert(turkish.includes(`class="language-switch" href="${page.path}" hreflang="en"`), page.path);
    const nav = english.match(/<nav id="navigation"[^>]*>[\s\S]*?<\/nav>/)?.[0];
    assert(nav, page.path);
    for (const [, href] of nav.matchAll(/href="([^"]+)"/g)) assert(href.startsWith('/en/'), `${page.path} -> ${href}`);
  }
});

test('both languages expose published work areas while keeping empty resource library hidden from navigation', () => {
  assert.match(rendered.get('/takim/'), /id="calisma-alanlari"/);
  assert.match(rendered.get('/takim/'), /Mekanik/);
  assert.match(rendered.get('/en/team/'), /id="calisma-alanlari"/);
  assert.match(rendered.get('/en/team/'), /Mechanical/);
  assert.doesNotMatch(rendered.get('/'), /href="\/kaynaklar\/"/);
  assert.doesNotMatch(rendered.get('/en/'), /href="\/en\/resources\/"/);
});

test('unapproved publication files are neither linked nor publicly copied', () => {
  const privateFiles = [
    'assets/air-force-takim-sunumu.pdf',
    'assets/air-force-team-overview.pdf',
    'assets/sponsors/3m.svg',
    'assets/sponsors/istek-okullari-reference.png',
  ];
  for (const file of privateFiles) {
    assert(!existsSync(resolve(root, 'public', file)), file);
    for (const html of rendered.values()) assert(!html.includes(file), file);
  }
});

test('the hosting CSP allows the loader bootstrap on every rendered page', () => {
  const config = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));
  const csp = config.headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  assert.match(csp, /frame-ancestors 'none'/);
  for (const [path, html] of rendered) {
    const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert(bootstrap, path);
    const hash = createHash('sha256').update(bootstrap).digest('base64');
    assert(csp.includes(`'sha256-${hash}'`), path);
  }
});

test('both galleries are reachable from the main menu before photos are published', () => {
  const nav = rendered.get('/').match(/<nav id="navigation"[^>]*>[\s\S]*?<\/nav>/)?.[0];
  assert.match(nav, /Galeriler/);
  for (const path of ['/galeri/', '/proje-galerisi/']) {
    assert(nav.includes(`href="${path}"`));
    assert(rendered.get(path).includes(`href="${path}" aria-current="page"`));
  }
});

test('adding the supplied team photo exposes it in home, team and gallery without an empty photo slot', () => {
  const original = { photo: siteConfig.teamPhoto, alt: siteConfig.teamPhotoAlt };
  try {
    siteConfig.teamPhoto = '';
    const preview = renderPage(readFileSync(resolve(root, 'index.html'), 'utf8'), pages[0]);
    assert.match(preview, /team-photo-placeholder-tr\.png[^>]*alt="Takım Fotoğrafı"/);
    assert.doesNotMatch(preview, /data-team-photo/);
    assert.doesNotMatch(renderContent('gallery'), /team-photo-placeholder/);
    siteConfig.teamPhoto = '/assets/logo-440.webp'; // Existing local image used only as a test fixture.
    siteConfig.teamPhotoAlt = 'TEST_TEAM_PHOTO';
    const home = renderPage(readFileSync(resolve(root, 'index.html'), 'utf8'), pages[0]);
    assert.match(home, /data-team-photo/);
    assert.match(home, /alt="TEST_TEAM_PHOTO"/);
    assert.doesNotMatch(home, /team-photo-placeholder/);
    assert.match(renderContent('team'), /alt="TEST_TEAM_PHOTO"/);
    assert.match(renderContent('gallery'), /alt="TEST_TEAM_PHOTO"/);
    const englishHome = renderPage(readFileSync(resolve(root, 'index.html'), 'utf8'), pages.find(page => page.path === '/en/'));
    assert.match(englishHome, /data-team-photo/);
    assert.match(englishHome, /alt="AIR FORCE 12414 team photo"/);
    assert(englishHome.indexOf('data-team-photo') < englishHome.indexOf('id="sezon"'));
  } finally { siteConfig.teamPhoto = original.photo; siteConfig.teamPhotoAlt = original.alt; }
});

test('pages emit enriched JSON-LD schemas, manifest, og:locale:alternate, countdown, copy-email and back-to-top', () => {
  const home = rendered.get('/');
  const homeEn = rendered.get('/en/');
  const robots = rendered.get('/robotlar/');
  const contact = rendered.get('/iletisim/');
  const contactEn = rendered.get('/en/contact/');
  const support = rendered.get('/destek-ol/');

  assert.match(home, /rel="manifest" href="\/manifest\.webmanifest\?v=2"/);
  assert.match(home, /property="og:locale" content="tr_TR"/);
  assert.match(home, /property="og:locale:alternate" content="en_GB"/);
  assert.match(homeEn, /property="og:locale" content="en_GB"/);
  assert.match(homeEn, /property="og:locale:alternate" content="tr_TR"/);

  assert.match(home, /"@type":"Organization"/);
  assert.match(home, /"@type":"Event"/);
  assert.match(robots, /"@type":"BreadcrumbList"/);
  assert.match(robots, /"@type":"Event"/);
  assert.match(contact, /"@type":"FAQPage"/);
  assert.match(contactEn, /"@type":"FAQPage"/);
  assert.match(contactEn, /What is AIR FORCE #12414\?/);

  assert.match(home, /data-countdown-start="2027-03-19" data-countdown-end="2027-03-21"/);
  assert.match(robots, /data-countdown-start="2027-03-19" data-countdown-end="2027-03-21"/);
  assert.match(contact, /data-copy-email="airforce@istek\.k12\.tr"/);
  assert.match(support, /data-copy-email="airforce@istek\.k12\.tr"/);
  assert.match(home, /data-back-to-top/);
});


test('production URL drives canonical, absolute hreflang, share image and sitemap', () => {
  assert.equal(siteConfig.siteUrl, 'https://team12414.com');
  const home = rendered.get('/');
  assert.ok(home.includes('<link rel="canonical" href="https://team12414.com/">'));
  assert.ok(home.includes('hreflang="en" href="https://team12414.com/en/"'));
  assert.ok(home.includes('property="og:image" content="https://team12414.com/assets/og-image.jpg"'));
  for (const [path, html] of rendered) for (const ref of html.matchAll(new RegExp('(?:src|href)="(/assets/[^"?#]+)"', 'g')))
    assert.ok(existsSync(resolve(root, 'public', ref[1].slice(1))), `${path} references missing ${ref[1]}`);
  const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'));
  for (const icon of manifest.icons) assert.ok(existsSync(resolve(root, 'public', icon.src.split('?')[0].slice(1))), icon.src);
});

test('sponsor pages use the same names everywhere and the domain aliases redirect to .com', () => {
  for (const [path, html] of rendered) {
    assert.doesNotMatch(html, /Destek olun|Support the team/, path);
  }
  const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));
  const hostRedirects = vercel.redirects.filter(r => r.has);
  const hosts = hostRedirects.map(r => r.has[0].value).sort();
  assert.deepEqual(hosts, ['team12414.org', 'www.team12414.com', 'www.team12414.org']);
  assert.ok(hostRedirects.every(r => r.destination === 'https://team12414.com/$1' && r.permanent));
  for (const [source, destination] of [['/haberler/:path*', '/gunluk/:path*'], ['/en/news/:path*', '/en/journal/:path*']]) {
    assert.ok(vercel.redirects.some(r => r.source === source && r.destination === destination && r.permanent && !r.has), source);
  }
  assert.ok(vercel.headers[0].headers.some(h => h.key === 'Strict-Transport-Security'));
});

test('sponsor pages stay in the menu and show no invented sponsors, tiers or file area, in either language', () => {
  assert.equal(siteConfig.sponsors.length, 0);
  for (const [path, html] of rendered) {
    for (const word of ['Bronz', 'Gümüş', 'Altın', 'Bronze', ' download', 'Takım sunumu', 'Team presentation', 'Takım sponsorları', 'Team sponsors']) assert.ok(!html.includes(word), `${path} shows ${word}`);
  }
  for (const [path, link] of [['/', 'href="/sponsorluk/"'], ['/en/', 'href="/en/sponsors/"'], ['/destek-ol/', 'href="/sponsorluk/"']]) assert.ok(rendered.get(path).includes(link), `${path} lacks ${link}`);
  assert.ok(rendered.get('/destek-ol/').includes('mailto:airforce@istek.k12.tr'));
});

test('the Ankara Regional detail page carries Event schema, a three-level breadcrumb and a countdown', () => {
  const detail = rendered.get('/etkinlikler/ankara-regional/');
  assert.match(detail, /"@type":"Event"/);
  assert.match(detail, /"addressLocality":"Ankara"/);
  const breadcrumb = JSON.parse(detail.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(item => item['@type'] === 'BreadcrumbList');
  assert.equal(breadcrumb.itemListElement.length, 3);
  assert.equal(breadcrumb.itemListElement[1].item, 'https://team12414.com/etkinlikler/');
  assert.match(detail, /data-countdown-start="2027-03-19"/);
  assert.match(detail, /<a href="\/etkinlikler\/">Etkinlikler<\/a><span aria-hidden="true">\/<\/span><span>Ankara Regional<\/span>/);
  assert.match(rendered.get('/en/events/ankara-regional/'), /<a href="\/en\/events\/">Events<\/a>/);
  assert.match(rendered.get('/robotlar/'), /"url":"https:\/\/team12414\.com\/etkinlikler\/ankara-regional\/"/);
  assert.match(rendered.get('/en/robots/'), /"url":"https:\/\/team12414\.com\/en\/events\/ankara-regional\/"/);
});

test('home and season pages point their countdown to the event detail page in both languages', () => {
  for (const path of ['/', '/robotlar/']) assert.match(rendered.get(path), /href="\/etkinlikler\/ankara-regional\/"/, path);
  for (const path of ['/en/', '/en/robots/']) assert.match(rendered.get(path), /href="\/en\/events\/ankara-regional\/"/, path);
});

test('the main menu groups events and the journal under Gündem and drops the old Takımdan group', () => {
  const navOf = html => html.match(/<nav id="navigation"[^>]*>[\s\S]*?<\/nav>/)[0];
  const home = navOf(rendered.get('/'));
  assert.match(home, /<summary>Gündem</);
  assert.match(home, /href="\/etkinlikler\/"/);
  assert.match(home, /href="\/etkinlikler\/ankara-regional\/"/);
  assert.doesNotMatch(home, /href="\/gunluk\/"/);
  assert.doesNotMatch(home, /<summary>Takımdan</);
  const english = navOf(rendered.get('/en/'));
  assert.match(english, /<summary>News &amp; events</);
  assert.match(english, /href="\/en\/events\/ankara-regional\/"/);
  const events = rendered.get('/etkinlikler/');
  assert.ok(navOf(events).includes('href="/etkinlikler/" class="nav-sub-link is-active" aria-current="page"'));
  const detail = navOf(rendered.get('/etkinlikler/ankara-regional/'));
  assert.match(detail, /<details class="nav-group" data-current>\s*<summary>Gündem/);
});

test('the footer has Galeriler and Gündem columns instead of Arşiv, in both languages', () => {
  const footerOf = html => html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];
  const tr = footerOf(rendered.get('/'));
  assert.match(tr, /<h2>Galeriler<\/h2>/);
  assert.match(tr, /<h2>Gündem<\/h2>/);
  assert.doesNotMatch(tr, /<h2>Arşiv<\/h2>/);
  assert.match(tr, /href="\/etkinlikler\/"/);
  const en = footerOf(rendered.get('/en/'));
  assert.match(en, /<h2>Galleries<\/h2>/);
  assert.match(en, /<h2>News &amp; events<\/h2>|<h2>News & events<\/h2>/);
});

test('home folds the FRC explainer into the season block and shows at most three journal cards when posts exist', () => {
  const home = rendered.get('/');
  assert.doesNotMatch(home, /home-frc-strip|home-frc/);
  const season = home.match(/id="sezon"[\s\S]*?<\/section>/)[0];
  assert.match(season, /href="\/frc\/"/);
  assert.match(season, /class="season-frc-note"/);
  assert.doesNotMatch(home, /class="section home-news"/);
  const previous = siteConfig.news;
  try {
    siteConfig.news = [1, 2, 3, 4].map(n => ({ status: 'published', slug: `yazi-${n}`, title: `Yazı ${n}`, category: 'Teknik', date: `2026-11-0${n}` }));
    const html = renderPage(readFileSync(resolve(root, 'index.html'), 'utf8'), pages[0]);
    const news = html.match(/<section class="section home-news">[\s\S]*?<\/section>/)[0];
    assert.equal((news.match(/<article class="content-card">/g) || []).length, 3);
    assert.match(news, /href="\/gunluk\/yazi-4\/"/);
    assert.match(news, /<span class="tag">Teknik<\/span>/);
    assert.match(news, /href="\/gunluk\/"/);
    assert.doesNotMatch(news, /\/haberler\//);
  } finally { siteConfig.news = previous; }
});

test('every TR and EN page uses the Pegasus icon set with a cache version, at the right pixel sizes', () => {
  const png = (file) => {
    const bytes = readFileSync(resolve(root, 'public', file));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', file);
    return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  };
  const expected = {
    'assets/favicon-16.png': [16, 16],
    'assets/favicon-32.png': [32, 32],
    'assets/apple-touch-icon.png': [180, 180],
    'assets/icon-192.png': [192, 192],
    'assets/icon-512.png': [512, 512],
  };
  for (const [file, size] of Object.entries(expected)) assert.deepEqual(png(file), size, file);
  const ico = readFileSync(resolve(root, 'public/favicon.ico'));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.ok(ico.readUInt16LE(4) >= 2, 'favicon.ico holds several sizes');
  assert.ok(!existsSync(resolve(root, 'public/assets/favicon.svg')), 'the old AF favicon is gone');
  for (const [path, html] of rendered) {
    for (const link of [
      '<link rel="icon" href="/favicon.ico?v=2" sizes="48x48">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png?v=2">',
      '<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png?v=2">',
      '<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png?v=2">',
      '<link rel="manifest" href="/manifest.webmanifest?v=2">',
    ]) assert.ok(html.includes(link), `${path} lacks ${link}`);
    assert.ok(!html.includes('favicon.svg'), `${path} still links the old favicon`);
  }
  const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'));
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512']);
  assert.ok(manifest.icons.every(icon => icon.src.endsWith('?v=2')));
});

test('the language switch names its visible text so voice control and screen readers agree', () => {
  for (const [path, html] of rendered) {
    const link = html.match(/<a class="language-switch"[^>]*aria-label="([^"]+)"[^>]*>([^<]+)<\/a>/);
    assert.ok(link, path);
    assert.ok(link[1].startsWith(link[2]), `${path}: "${link[1]}" should start with "${link[2]}"`);
  }
});

const mainOf = html => html.match(/<main[\s\S]*?<\/main>/)[0].replace(/<nav class="breadcrumb"[\s\S]*?<\/nav>/, '');
const mainLinks = html => [...mainOf(html).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attributes, inner]) => ({
  attributes,
  href: attributes.match(/href="([^"]*)"/)?.[1] || '',
  label: inner.replace(/<[^>]+>/g, '').trim(),
  icon: inner.match(/data-icon="([a-z]+)"/)?.[1] || '',
  logo: inner.includes('<img'),
}));

test('links to the same page use the same label in Turkish', () => {
  const allowed = {
    '/takim/': ['Takımı tanıyın'],
    '/frc/': ['FIRST ve FRC hakkında'],
    '/etkinlikler/': ['Etkinlik takvimi', 'Tüm etkinlikler'],
    '/destek-ol/': ['Sponsor olun', 'Destek seçenekleri'],
    '/robotlar/': ['Sezon sayfası', 'Sezon sayfasına dön', 'Tüm robotlara dön', 'AIR FORCE robotlarını keşfedin'],
  };
  for (const [path, html] of rendered) {
    if (path.startsWith('/en/')) continue;
    for (const link of mainLinks(html)) if (allowed[link.href]) assert.ok(allowed[link.href].includes(link.label), `${path}: "${link.label}" -> ${link.href}`);
  }
});

test('link icons carry meaning: external, email and back links have one, internal buttons do not', () => {
  for (const [path, html] of rendered) {
    // Logo links are recognisable by their image, so only text links need an external marker.
    for (const link of mainLinks(html).filter(item => !item.logo)) {
      if (link.attributes.includes('target="_blank"')) {
        assert.equal(link.icon, 'external', `${path}: ${link.label}`);
        assert.match(link.attributes, /rel="noopener noreferrer"/, `${path}: ${link.label}`);
      }
      if (link.href.startsWith('mailto:')) assert.equal(link.icon, 'mail', `${path}: ${link.label}`);
      if (/class="button\b/.test(link.attributes) && link.href.startsWith('/') && !/^(Tüm|Back|All)/.test(link.label)) assert.equal(link.icon, '', `${path}: ${link.label}`);
    }
  }
});

test('the home sponsor block names what it actually shows, in both languages', () => {
  assert.equal(siteConfig.sponsors.length, 0);
  assert.match(rendered.get('/'), /Okulumuz ve<br>FRC organizatörü/);
  assert.match(rendered.get('/en/'), /Our school and<br>FRC organizer/);
  assert.doesNotMatch(rendered.get('/'), /Sponsorlarımız<br>ve kurumlar/);
  const previous = siteConfig.sponsors;
  try {
    siteConfig.sponsors = [{ name: 'Örnek A.Ş.', role: 'Destekçi', url: 'https://example.com' }];
    const html = renderPage(readFileSync(resolve(root, 'index.html'), 'utf8'), pages[0]);
    assert.match(html, /Sponsorlarımız<br>ve kurumlar/);
  } finally { siteConfig.sponsors = previous; }
});

test('the 404 page is written in both languages and links onward', () => {
  const tr = rendered.get('/404.html'), en = rendered.get('/en/404.html');
  assert.match(tr, /Sayfa bulunamadı/);
  assert.match(en, /Page not found/);
  assert.match(en, /may have moved or may never have existed/);
  assert.match(en, /href="\/en\/"[^>]*>Back to home/);
  assert.match(en, /href="\/en\/robots\/"/);
  assert.doesNotMatch(en, /Ana sayfaya dön|Sayfa bulunamadı/);
});
