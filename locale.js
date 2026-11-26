import { siteConfig } from './site-config.js';

// Keep operational fields (slugs, dates, URLs) unless an English override is supplied.
export function localizeRecord(record, lang = 'tr') {
  if (lang !== 'en' || !record || typeof record !== 'object') return record;
  if (Array.isArray(record)) return record.map(item => localizeRecord(item, lang));

  const { en, ...original } = record;
  const merged = { ...original };
  for (const [key, value] of Object.entries(en || {})) {
    const base = original[key];
    // Translations cannot publish records or change their IDs.
    if (key === 'slug' || (key === 'status' && ['published', 'draft'].some(state => state === base || state === value))) continue;
    if (typeof value === 'string' && !value.trim()) continue;
    merged[key] = base && value && typeof base === 'object' && typeof value === 'object' &&
      !Array.isArray(base) && !Array.isArray(value) ? { ...base, ...value } : value;
  }
  return Object.fromEntries(Object.entries(merged).map(([key, value]) => [key, localizeRecord(value, lang)]));
}

export const siteContent = (lang = 'tr') => localizeRecord(siteConfig, lang);
export const translator = lang => (turkish, english) => lang === 'en' ? english : turkish;

const englishSections = {
  takim: 'team', tarihce: 'history', basarilar: 'awards',
  robotlar: 'robots', 'toplumsal-etki': 'outreach',
  kaynaklar: 'resources', etkinlikler: 'events', gunluk: 'journal', galeri: 'gallery',
  'proje-galerisi': 'project-gallery', sponsorluk: 'sponsors', 'destek-ol': 'support', iletisim: 'contact',
};

export function localizedPath(path, lang = 'tr') {
  if (lang !== 'en') return path;
  const [, section, child, ...remaining] = path.split('/');
  const translatedChild = section === 'takim' && ['tarihce', 'basarilar'].includes(child) ? englishSections[child] : child;
  return ['/en', englishSections[section] || section, translatedChild, ...remaining].filter(value => value !== undefined).join('/');
}
