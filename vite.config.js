import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { defineConfig } from 'vite';
import { pages, renderPage } from './site-pages.js';
import { siteConfig } from './site-config.js';
import { rebuildNeededFrom, selectUpcomingEvent } from './season-utils.js';
import { generateRobotsTxt, generateSitemapXml } from './seo-utils.js';

// Every published detail receives the same shell automatically on build/restart.
const pageShell = `<!doctype html>
<html lang="tr"><head><meta charset="UTF-8"><!-- site-head --></head>
<body><!-- site-header --><main id="main" class="container page"><!-- site-content --></main><!-- site-footer --></body></html>`;
for (const page of pages) {
  const filename = resolve(import.meta.dirname, page.file);
  if (page.lang === 'en' && page.originalPath === '/') {
    const template = readFileSync(resolve(import.meta.dirname, 'index.html'), 'utf8');
    mkdirSync(dirname(filename), { recursive: true });
    if (!existsSync(filename) || readFileSync(filename, 'utf8') !== template) writeFileSync(filename, template, 'utf8');
  } else if (!existsSync(filename)) {
    mkdirSync(dirname(filename), { recursive: true });
    writeFileSync(filename, pageShell, 'utf8');
  }
}

function notFoundMiddleware(loadHtml) {
  return async (request, response, next) => {
    if (!['GET', 'HEAD'].includes(request.method) || !request.headers.accept?.includes('text/html')) return next();
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { return next(); }
    if (pages.some((page) => !page.hidden && [page.path, `/${page.file}`].includes(pathname))) return next();
    const canonical = pages.find(page => !page.hidden && page.path !== '/' && page.path === `${pathname}/`);
    if (canonical) {
      response.statusCode = 301;
      response.setHeader('Location', canonical.path);
      return response.end();
    }
    // Let Vite handle scripts/assets, but never serve an obsolete draft page shell.
    if (!pathname.endsWith('/') && /\.[^/]+$/.test(pathname) && !pathname.endsWith('.html')) return next();
    try {
      const html = await loadHtml(pathname === '/en' || pathname.startsWith('/en/') ? 'en/404.html' : '404.html');
      response.statusCode = 404;
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader('Cache-Control', 'no-store');
      response.end(request.method === 'HEAD' ? undefined : html);
    } catch (error) { next(error); }
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [{
    name: 'air-force-pages',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url === '/robots.txt') {
          response.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return response.end(generateRobotsTxt(siteConfig.siteUrl));
        }
        if (request.url === '/sitemap.xml') {
          const xml = generateSitemapXml(pages, siteConfig.siteUrl);
          if (xml) {
            response.setHeader('Content-Type', 'application/xml; charset=utf-8');
            return response.end(xml);
          }
        }
        next();
      });
      server.middlewares.use(notFoundMiddleware(async (file) => {
        const template = await readFile(resolve(server.config.root, file), 'utf8');
        return server.transformIndexHtml(`/${file}`, template);
      }));
    },
    configurePreviewServer(server) {
      server.middlewares.use(notFoundMiddleware(file =>
        readFile(resolve(server.config.root, server.config.build.outDir, file), 'utf8')));
    },
    buildStart() {
      const event = selectUpcomingEvent(siteConfig.events);
      const stale = rebuildNeededFrom(siteConfig.events);
      console.log(event
        ? `Sezon: yaklaşan etkinlik "${event.title}" (${event.date}). Etkinlik menüsü, ana sayfa paneli ve şemalar ${stale} tarihinden itibaren eskir; o gün siteyi yeniden derleyin.`
        : 'Sezon: yaklaşan etkinlik yok; takvim değişince (yeni etkinlik ya da yeni yıl) yeniden derleyin.');
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const page = pages.find(({ file }) => resolve(import.meta.dirname, file) === resolve(context.filename));
        return page ? renderPage(html, page) : html;
      },
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: generateRobotsTxt(siteConfig.siteUrl) });
      const sitemap = generateSitemapXml(pages, siteConfig.siteUrl);
      if (sitemap) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  }],
  build: {
    rolldownOptions: {
      input: pages.map(({ file }) => resolve(import.meta.dirname, file)),
    },
  },
});
