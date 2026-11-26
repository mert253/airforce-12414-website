import './test-clock.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRobotsTxt, generateSitemapXml, normalizeSiteUrl } from './seo-utils.js';
import { pages } from './site-pages.js';

test('normalizeSiteUrl accepts only valid HTTPS origins', () => {
  assert.equal(normalizeSiteUrl(''), '');
  assert.equal(normalizeSiteUrl('http://example.com'), '');
  assert.equal(normalizeSiteUrl('https://air-force-12414-v2.vercel.app/'), 'https://air-force-12414-v2.vercel.app');
  assert.equal(normalizeSiteUrl('not-a-url'), '');
});

test('generateRobotsTxt omits sitemap when siteUrl is empty and includes it when set', () => {
  const local = generateRobotsTxt('');
  assert.match(local, /User-agent: \*/);
  assert.match(local, /Allow: \//);
  assert.doesNotMatch(local, /Sitemap:/);

  const live = generateRobotsTxt('https://air-force-12414-v2.vercel.app');
  assert.match(live, /Sitemap: https:\/\/air-force-12414-v2\.vercel\.app\/sitemap\.xml/);
});

test('generateSitemapXml includes only indexable pages with TR/EN hreflang alternates', () => {
  assert.equal(generateSitemapXml(pages, ''), '');

  const xml = generateSitemapXml(pages, 'https://air-force-12414-v2.vercel.app');
  assert.match(xml, /<loc>https:\/\/air-force-12414-v2\.vercel\.app\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/air-force-12414-v2\.vercel\.app\/en\/<\/loc>/);
  assert.match(xml, /hreflang="tr" href="https:\/\/air-force-12414-v2\.vercel\.app\/takim\/"/);
  assert.match(xml, /hreflang="en" href="https:\/\/air-force-12414-v2\.vercel\.app\/en\/team\/"/);
  assert.match(xml, /hreflang="x-default" href="https:\/\/air-force-12414-v2\.vercel\.app\/takim\/"/);
  assert.doesNotMatch(xml, /404\.html/);
  assert.doesNotMatch(xml, /\/kaynaklar\//);
});

test('sitemap lists the event detail page with its English alternate and leaves out the empty journal', () => {
  const xml = generateSitemapXml(pages, 'https://team12414.com');
  assert.match(xml, /<loc>https:\/\/team12414\.com\/etkinlikler\/ankara-regional\/<\/loc>/);
  assert.match(xml, /hreflang="en" href="https:\/\/team12414\.com\/en\/events\/ankara-regional\/"/);
  assert.doesNotMatch(xml, /\/gunluk\/|\/en\/journal\//);
});
