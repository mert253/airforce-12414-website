import test from 'node:test';
import assert from 'node:assert/strict';
import { siteConfig } from './site-config.js';

test('project gallery shows only published project photos and keeps them out of the team gallery', () => {
  const previous = { projects: siteConfig.projects, gallery: siteConfig.gallery, teamPhoto: siteConfig.teamPhoto };
  const photo = { status: 'published', src: '/assets/PROJECT_PHOTO.webp', alt: 'Atölyede robotik eğitimi' };
  const project = { status: 'published', slug: 'robotik-atolyesi', title: 'Robotik atölyesi', date: '2026-11-16' };
  try {
    siteConfig.gallery = [{ ...photo, src: '/assets/TEAM_PHOTO.webp' }];
    siteConfig.teamPhoto = '';
    siteConfig.projects = [
      { ...project, photos: [photo, { ...photo, status: 'draft', src: '/assets/DRAFT_PHOTO.webp' }, { ...photo, src: 'mailto:INVALID_PHOTO' }] },
      { ...project, slug: 'bos-proje', title: 'EMPTY_PROJECT', photos: [] },
      { ...project, status: 'draft', slug: 'taslak', title: 'DRAFT_PROJECT', photos: [photo] },
    ];
    const html = renderContent('projectGallery');
    assert.match(html, /href="\/toplumsal-etki\/robotik-atolyesi\/"/);
    assert.match(html, /datetime="2026-11-16"/);
    assert.match(html, /data-gallery-image[^>]+PROJECT_PHOTO\.webp/);
    assert.doesNotMatch(html, /DRAFT_PHOTO|INVALID_PHOTO|EMPTY_PROJECT|DRAFT_PROJECT|TEAM_PHOTO/);
    const teamGallery = renderContent('gallery');
    assert.match(teamGallery, /TEAM_PHOTO/);
    assert.doesNotMatch(teamGallery, /PROJECT_PHOTO/);
    assert.equal(buildContentRoutes().find(route => route.kind === 'projectGallery')?.noindex, false);
    siteConfig.projects[0].photos = [{ ...photo, status: 'draft' }];
    assert.equal(buildContentRoutes().find(route => route.kind === 'projectGallery')?.noindex, true);
    assert.doesNotMatch(renderContent('projectGallery'), /data-gallery-image|data-search/);
  } finally { Object.assign(siteConfig, previous); }
});
import { renderContent, publishedRecords, safeHref, safeImageSrc, safeObjectPosition, contentRoutes, buildContentRoutes } from './content-pages.js';

test('draft and statusless records never enter public collections', () => {
  const items = [{ status: 'draft', title: 'Private' }, { title: 'Unreviewed' }, { status: 'published', title: 'Public' }];
  assert.deepEqual(publishedRecords(items), [items[2]]);
  assert.deepEqual(publishedRecords(), []);
  assert.deepEqual(publishedRecords(null), []);
  assert.deepEqual(publishedRecords({}), []);
});

test('links reject script schemes, protocol-relative paths, and controls', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', '//example.com', '/\\evil.test', '\nhttps://example.com', 'https://exa mple.com']) assert.equal(safeHref(value), '');
  for (const value of ['/assets/guide.pdf', 'https://example.com/file.pdf', 'mailto:airforce@istek.k12.tr', '#teknik']) assert.equal(safeHref(value), value);
  assert.equal(safeImageSrc('mailto:person@example.com'), '');
  assert.equal(safeImageSrc('#teknik'), '');
});

test('resource publication excludes drafts and escapes edited text', () => {
  const previous = siteConfig.resources;
  try {
    siteConfig.resources = [
      { status: 'draft', title: 'PRIVATE_RESOURCE', url: '/assets/private.pdf' },
      { status: 'published', title: 'INVALID_RESOURCE', url: 'javascript:alert(1)' },
      { status: 'published', title: '<script>alert("x")</script>', topic: 'Yazılım', description: 'A & B', url: '/assets/guide.pdf' },
    ];
    const html = renderContent('resources');
    assert.doesNotMatch(html, /PRIVATE_RESOURCE|INVALID_RESOURCE|<script>/);
    assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
    assert.match(html, /A &amp; B/);
    assert.match(html, /href="\/assets\/guide.pdf"/);
  } finally { siteConfig.resources = previous; }
});

test('detail routes are generated only for published valid slugs', async () => {
  const previous = siteConfig.news;
  try {
    siteConfig.news = [
      { status: 'published', slug: 'atolye-gunlugu', title: 'Atölye günlüğü' },
      { status: 'draft', slug: 'private-story', title: 'Private' },
      { status: 'published', slug: '../outside', title: 'Invalid' },
    ];
    const module = await import(`./content-pages.js?route-test=${Date.now()}`);
    assert(module.contentRoutes.some(route => route.path === '/haberler/atolye-gunlugu/' && route.item.title === 'Atölye günlüğü'));
    assert(!module.contentRoutes.some(route => route.path.includes('private-story') || route.path.includes('outside')));
  } finally { siteConfig.news = previous; }
});

test('unfilled robot page shows the season update without empty technical sections', () => {
  const html = renderContent('robot');
  assert(html.includes(siteConfig.season?.description || siteConfig.seasonStatus));
  assert.match(html, /href="\/robotlar\/"/);
  assert.doesNotMatch(html, /id="(?:teknik|medya)"|data-filter|CAD modeli|download/);
});

test('empty archives show a truthful explanation and navigation without controls or dummy cards', () => {
  const previous = siteConfig.resources;
  try {
    siteConfig.resources = [];
    for (const kind of ['history', 'awards', 'impact', 'resources', 'news', 'gallery']) {
      const html = renderContent(kind);
      assert.match(html, /henüz yayımlanmadı/, kind);
      assert.match(html, /<a[^>]*href="[^\"]+"/, kind);
      assert.doesNotMatch(html, /data-filter|data-search|data-collection|data-placeholder-item|hazırlanıyor|class="(?:archive-card|content-card|gallery-card)/, kind);
    }
  } finally { siteConfig.resources = previous; }
});

test('all base content pages render with unique routes', () => {
  assert.equal(new Set(contentRoutes.map(route => route.path)).size, contentRoutes.length);
  for (const route of contentRoutes) {
    assert(renderContent(route.kind, route.item).length > 200, route.path);
    assert(!route.path.includes('..'));
  }
});

test('reserved first robot route receives published metadata', () => {
  const robot = { status: 'published', slug: 'ilk-robot', name: 'Gerçek robot adı', year: '2027', description: 'Gerçek açıklama' };
  const route = buildContentRoutes({ robots: [robot], projects: [], news: [] }).find(item => item.path === '/robotlar/ilk-robot/');
  assert.equal(route.title, robot.name);
  assert.equal(route.item, robot);
  assert.equal(route.kicker, '2027');
  assert.equal(route.description, robot.description);
  assert.equal(route.noindex, false);
});

test('duplicate published slugs stop route generation with an actionable error', () => {
  const robot = { status: 'published', slug: 'test-robot', name: 'Robot' };
  assert.throws(() => buildContentRoutes({ robots: [robot, { ...robot }], projects: [], news: [] }), /aynı slug.*test-robot/);
  assert.doesNotThrow(() => buildContentRoutes({ robots: [robot, { ...robot, status: 'draft' }], projects: [], news: [] }));
});

test('published entries with blank titles do not create routes', () => {
  const routes = buildContentRoutes({ robots: [{ status: 'published', slug: 'empty', name: ' ' }], news: [{ status: 'published', slug: 'empty-title', title: '' }], projects: [] });
  assert(!routes.some(route => route.path.includes('/empty')));
});

test('robot and news archives put the newest content first', () => {
  const previousRobots = siteConfig.robots, previousNews = siteConfig.news;
  try {
    siteConfig.robots = [{ status: 'published', slug: 'old-robot', name: 'Old robot', year: '2025' }, { status: 'published', slug: 'new-robot', name: 'New robot', year: '2027' }];
    siteConfig.news = [{ status: 'published', slug: 'old-news', title: 'Old news', date: '2025-12-31' }, { status: 'published', slug: 'new-news', title: 'New news', date: '2026-01-01' }];
    const robots = renderContent('robots'), news = renderContent('news');
    assert(robots.indexOf('New robot') < robots.indexOf('Old robot'));
    assert(news.indexOf('New news') < news.indexOf('Old news'));
  } finally { siteConfig.robots = previousRobots; siteConfig.news = previousNews; }
});

test('photo positions allow a crop without accepting injected styles', () => {
  assert.equal(safeObjectPosition('center 35%'), 'center 35%');
  assert.equal(safeObjectPosition('20% 80%'), '20% 80%');
  assert.equal(safeObjectPosition('center; color:red'), 'center');
  assert.equal(safeObjectPosition('120%'), 'center');
});

test('published robot and project pages never disclose nested draft photos', () => {
  const item = {
    status: 'published', slug: 'published-entry', name: 'Robot', title: 'Project',
    photos: [
      { status: 'draft', src: '/assets/PRIVATE_DRAFT.jpg', alt: 'PRIVATE_DRAFT_CAPTION' },
      { src: '/assets/UNREVIEWED.jpg', alt: 'UNREVIEWED_CAPTION' },
      { status: 'published', src: '/assets/public-photo.jpg', alt: 'Public photo caption', width: 1600, height: 900 },
    ],
  };
  for (const kind of ['robot', 'project']) {
    const html = renderContent(kind, item);
    assert.doesNotMatch(html, /PRIVATE_DRAFT|UNREVIEWED/, kind);
    assert.match(html, /\/assets\/public-photo.jpg/, kind);
    assert.match(html, /Public photo caption/, kind);
  }
});

test('missing years never appear as undefined or empty archive filters', () => {
  const previousRobots = siteConfig.robots, previousAwards = siteConfig.awards;
  try {
    siteConfig.robots = [undefined, null, '', ' ', 2027].map((year, i) => ({ status: 'published', slug: `robot-${i}`, name: `Robot ${i}`, year }));
    siteConfig.awards = [undefined, null, '', ' ', 2027].map((year, i) => ({ status: 'published', title: `Award ${i}`, year }));
    for (const kind of ['robots', 'awards']) {
      const html = renderContent(kind);
      const filters = [...html.matchAll(/\sdata-filter="([^"]*)"/g)].map(match => match[1]);
      assert.deepEqual(filters, ['all', '2027'], kind);
    }
  } finally { siteConfig.robots = previousRobots; siteConfig.awards = previousAwards; }
});

test('empty archives are noindex while the main information pages remain indexable', () => {
  const routes = buildContentRoutes({});
  for (const kind of ['history', 'awards', 'robot', 'impact', 'resources', 'news', 'gallery']) {
    assert.equal(routes.find(route => route.kind === kind).noindex, true, kind);
  }
  for (const kind of ['team', 'robots', 'frc', 'contact', 'support', 'sponsors']) {
    assert.equal(routes.find(route => route.kind === kind).noindex, false, kind);
  }
});

test('archives become indexable only when usable records are published', () => {
  const cases = [
    ['history', 'history', { title: 'İlk kayıt', year: 2027 }],
    ['awards', 'awards', { title: 'Doğrulanmış sonuç', year: 2027 }],
    ['robot', 'robots', { name: 'İlk robot', slug: 'ilk-robot' }],
    ['impact', 'projects', { title: 'Proje kaydı', slug: 'proje-kaydi' }],
    ['resources', 'resources', { title: 'Kaynak kaydı', url: '/assets/guide.pdf' }],
    ['news', 'news', { title: 'Haber kaydı', slug: 'haber-kaydi' }],
    ['gallery', 'gallery', { src: '/assets/photo.webp', alt: 'Takım fotoğrafı' }],
  ];
  for (const [kind, collection, record] of cases) {
    const draft = { [collection]: [{ ...record, status: 'draft' }] };
    const published = { [collection]: [{ ...record, status: 'published' }] };
    assert.equal(buildContentRoutes(draft).find(route => route.kind === kind).noindex, true, `${kind} draft`);
    assert.equal(buildContentRoutes(published).find(route => route.kind === kind).noindex, false, `${kind} published`);
  }
  const invalid = buildContentRoutes({
    history: [{ status: 'published', title: ' ' }],
    awards: [{ status: 'published' }],
    resources: [{ status: 'published', title: 'Unsafe', url: 'javascript:alert(1)' }],
    news: [{ status: 'published', title: 'Invalid slug', slug: '../invalid' }],
    gallery: [{ status: 'published', src: 'data:image/png,invalid' }],
    videos: [{ status: 'published', title: 'Unsafe', url: 'javascript:alert(1)' }],
  });
  for (const kind of ['history', 'awards', 'resources', 'news', 'gallery']) assert.equal(invalid.find(route => route.kind === kind).noindex, true, kind);
  assert.equal(buildContentRoutes({ teamPhoto: '/assets/team.webp' }).find(route => route.kind === 'gallery').noindex, false);
  assert.equal(buildContentRoutes({ videos: [{ status: 'published', title: 'Video', url: 'https://example.com/video' }] }).find(route => route.kind === 'gallery').noindex, false);
});

test('published archive records restore filters, detail links and gallery controls', () => {
  const fixtures = [
    ['awards', 'awards', { status: 'published', title: 'Public award', year: 2027, url: 'https://example.com/result' }, /href="https:\/\/example.com\/result"/],
    ['impact', 'projects', { status: 'published', slug: 'public-project', title: 'Public project', category: 'Eğitim' }, /href="\/toplumsal-etki\/public-project\/"/],
    ['resources', 'resources', { status: 'published', title: 'Public guide', topic: 'Yazılım', url: '/assets/guide.pdf' }, /href="\/assets\/guide.pdf"/],
    ['news', 'news', { status: 'published', slug: 'public-news', title: 'Public news', category: 'Atölye' }, /href="\/haberler\/public-news\/"/],
    ['gallery', 'gallery', { status: 'published', src: '/assets/photo.webp', alt: 'Public photo', category: 'Takım' }, /data-gallery-image/],
  ];
  for (const [kind, collection, record, destination] of fixtures) {
    const previous = siteConfig[collection];
    try {
      siteConfig[collection] = [{ ...record, status: 'draft', title: 'PRIVATE_ENTRY', alt: 'PRIVATE_ENTRY' }];
      assert.doesNotMatch(renderContent(kind), /PRIVATE_ENTRY|data-search|data-filter/);
      siteConfig[collection] = [record];
      const html = renderContent(kind);
      assert.match(html, /data-search/);
      assert.match(html, /data-filter-item/);
      assert.match(html, destination);
      assert.doesNotMatch(html, /data-placeholder-item/);
    } finally { siteConfig[collection] = previous; }
  }
});

test('video-only gallery has a working video link and no empty photo tools', () => {
  const previous = { videos: siteConfig.videos, gallery: siteConfig.gallery, teamPhoto: siteConfig.teamPhoto };
  try {
    Object.assign(siteConfig, { videos: [{ status: 'published', title: 'Public video', url: 'https://example.com/video' }], gallery: [], teamPhoto: '' });
    const html = renderContent('gallery');
    assert.match(html, /href="https:\/\/example.com\/video"/);
    assert.match(html, /Public video/);
    assert.doesNotMatch(html, /data-search|data-filter|id="fotograflar"|hazırlanıyor/);
  } finally { Object.assign(siteConfig, previous); }
});

test('sponsor and support pages share needs while preserving institution roles', () => {
  const previous = { sponsorNeeds: siteConfig.sponsorNeeds, sponsorshipFile: siteConfig.sponsorshipFile };
  try {
    siteConfig.sponsorNeeds = [
      { title: 'Test malzeme', description: 'A & B', examples: ['Parça <örneği>'] },
      { title: 'Test hizmet', description: 'Üretim desteği' },
    ];
    siteConfig.sponsorshipFile = '';
    const sponsors = renderContent('sponsors'), support = renderContent('support');
    for (const title of ['Test malzeme', 'Test hizmet']) {
      assert(sponsors.includes(title));
      assert(support.includes(title));
    }
    for (const institution of [...siteConfig.sponsors, siteConfig.schoolMark, siteConfig.frcOrganizer]) {
      assert(sponsors.includes(institution.name));
      assert(sponsors.includes(institution.role));
    }
    assert.match(support, /A &amp; B/);
    assert.match(support, /Parça &lt;örneği&gt;/);
    assert.match(support, /href="mailto:airforce@istek.k12.tr\?subject=AIR%20FORCE%2012414%20Sponsorluk"/);
    assert.doesNotMatch(support, /Sponsorluk dosyası|\.pdf|tanıtım detaylarını/);
    siteConfig.sponsorshipFile = '/assets/sponsorship.pdf';
    assert.match(renderContent('support'), /href="\/assets\/sponsorship.pdf"/);
  } finally { Object.assign(siteConfig, previous); }
});

test('season page shows shared dated status and the next event instead of an expired featured event', () => {
  const previous = { season: siteConfig.season, events: siteConfig.events };
  try {
    siteConfig.season = { year: 2027, status: 'Sezon hazırlıkları', updatedAt: '2026-11-16', description: 'Doğrulanmış sezon açıklaması.' };
    siteConfig.events = [
      { status: 'published', featured: true, title: 'EXPIRED_EVENT', startDate: '2000-01-01', endDate: '2000-01-02' },
      { status: 'published', title: 'LATER_EVENT', startDate: '2999-04-01', endDate: '2999-04-02' },
      { status: 'draft', title: 'DRAFT_EVENT', startDate: '2999-01-01', endDate: '2999-01-02' },
      { status: 'published', title: 'NEXT_EVENT', date: '1–2 Mart 2999', startDate: '2999-03-01', endDate: '2999-03-02', url: 'https://example.com/event' },
    ];
    const html = renderContent('robots');
    assert.match(html, /Doğrulanmış sezon açıklaması/);
    assert.match(html, /datetime="2026-11-16"/);
    assert.match(html, /NEXT_EVENT/);
    assert.doesNotMatch(html, /EXPIRED_EVENT|LATER_EVENT|DRAFT_EVENT/);
  } finally { Object.assign(siteConfig, previous); }
});

test('team sections require published people and work areas', () => {
  const previous = { students: siteConfig.students, mentors: siteConfig.mentors, subteams: siteConfig.subteams };
  try {
    Object.assign(siteConfig, { students: [], mentors: [], subteams: [] });
    assert.doesNotMatch(renderContent('team'), /id="(?:ekip|mentorlar|calisma-alanlari)"/);
    Object.assign(siteConfig, {
      students: [{ status: 'published', name: 'Public student', role: 'Yazılım' }, { status: 'draft', name: 'PRIVATE_PERSON' }],
      mentors: [{ status: 'published', name: 'Public mentor' }],
      subteams: [{ status: 'published', name: 'Public work area', description: 'Onaylı çalışma alanı.' }],
    });
    const html = renderContent('team');
    assert.match(html, /Public student/);
    assert.match(html, /Public mentor/);
    assert.match(html, /Public work area/);
    assert.doesNotMatch(html, /PRIVATE_PERSON/);
  } finally { Object.assign(siteConfig, previous); }
});
