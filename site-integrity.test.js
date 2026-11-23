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
  for (const path of ['/takim/tarihce/', '/takim/basarilar/', '/robotlar/ilk-robot/', '/toplumsal-etki/', '/haberler/', '/galeri/', '/proje-galerisi/', '/kaynaklar/', '/en/resources/']) {
    assert.match(rendered.get(path), /name="robots" content="noindex, follow"/, path);
  }
  for (const path of ['/', '/takim/', '/robotlar/', '/frc/', '/sponsorluk/', '/destek-ol/', '/iletisim/']) {
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

  assert.match(home, /rel="manifest" href="\/manifest\.webmanifest"/);
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

