import { localizedPath } from './locale.js';

function escapeXml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[char]);
}

export function normalizeSiteUrl(siteUrl) {
  if (typeof siteUrl !== 'string' || !siteUrl.trim()) return '';
  try {
    const parsed = new URL(siteUrl.trim());
    return parsed.protocol === 'https:' ? parsed.origin : '';
  } catch {
    return '';
  }
}

export function generateRobotsTxt(siteUrl = '') {
  const origin = normalizeSiteUrl(siteUrl);
  const lines = ['User-agent: *', 'Allow: /'];
  if (origin) lines.push('', `Sitemap: ${origin}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}

export function generateSitemapXml(pages = [], siteUrl = '') {
  const origin = normalizeSiteUrl(siteUrl);
  if (!origin) return '';
  const indexable = pages.filter(page => page && !page.hidden && !page.noindex);
  const urls = indexable.map(page => {
    const originalPath = page.originalPath || page.path;
    const loc = new URL(page.path, origin).href;
    const trHref = new URL(localizedPath(originalPath, 'tr'), origin).href;
    const enHref = new URL(localizedPath(originalPath, 'en'), origin).href;
    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <xhtml:link rel="alternate" hreflang="tr" href="${escapeXml(trHref)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enHref)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(trHref)}"/>`,
      '  </url>',
    ].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
