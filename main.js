import { matchesCollectionItem } from './collection-utils.js';
import { installPageTransitions } from './page-transitions.js';
import { getEventCountdown, phaseLabel } from './season-utils.js';

installPageTransitions();

const messages = document.documentElement.lang === 'en' ? {
  menu: 'Menu',
  openMenu: 'Open menu',
  close: 'Close',
  closeMenu: 'Close menu',
  publishedItems: count => `${count} published ${count === 1 ? 'item' : 'items'}`,
  copy: 'Copy',
  copied: 'Copied',
  copiedAnnouncement: 'Email address copied to clipboard.',
  copyFailed: 'Could not copy email address.',
  countdownDays: 'Days',
  countdownHours: 'Hours',
  countdownMinutes: 'Min',
  countdownSeconds: 'Sec',
  eventLive: 'Event in progress',
} : {
  menu: 'Menü',
  openMenu: 'Menüyü aç',
  close: 'Kapat',
  closeMenu: 'Menüyü kapat',
  publishedItems: count => `${count} yayımlanmış içerik`,
  copy: 'Kopyala',
  copied: 'Kopyalandı',
  copiedAnnouncement: 'E-posta adresi panoya kopyalandı.',
  copyFailed: 'E-posta adresi kopyalanamadı.',
  countdownDays: 'Gün',
  countdownHours: 'Saat',
  countdownMinutes: 'Dk',
  countdownSeconds: 'Sn',
  eventLive: 'Etkinlik devam ediyor',
};

// Hide the photo slot if the team photo fails to load.
document.querySelectorAll('[data-team-photo]').forEach(frame => {
  const photo = frame.querySelector('.team-photo-image');
  if (!photo) return;
  const fallback = () => { frame.hidden = true; };
  photo.addEventListener('error', fallback);
  if (photo.complete && !photo.naturalWidth) fallback();
});

const menuToggle = document.querySelector('.menu-toggle');
const menuLabel = menuToggle.querySelector('span');
const navigation = document.querySelector('#navigation');
const mobile = window.matchMedia('(max-width: 980px)');
const navGroups = [...navigation.querySelectorAll('.nav-group')];
function closeGroups(except) {
  navGroups.forEach(group => { if (group !== except) group.open = false; });
}
navGroups.forEach(group => group.addEventListener('toggle', () => {
  if (group.open) closeGroups(group);
}));
function setMenuOpen(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? messages.closeMenu : messages.openMenu);
  menuLabel.textContent = open ? messages.close : messages.menu;
  navigation.classList.toggle('is-open', open);
  if (!open) closeGroups();
  else if (mobile.matches) (navGroups.find(group => group.hasAttribute('data-current')) || {}).open = true;
}
function closeMenu() {
  setMenuOpen(false);
}
menuToggle.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.header-inner')) closeMenu(); });
document.addEventListener('focusin', event => { if (!event.target.closest('.header-inner')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const openGroup = navGroups.find(group => group.open);
  if (openGroup) {
    closeGroups();
    openGroup.querySelector('summary').focus();
  } else if (menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
mobile.addEventListener('change', closeMenu);
document.documentElement.classList.add('menu-ready');
menuToggle.hidden = false;

// Category and Turkish-aware text filters stay independent for each collection.
document.querySelectorAll('[data-collection]').forEach(collection => {
  const buttons = [...collection.querySelectorAll('[data-filter]')];
  const search = collection.querySelector('[data-search]');
  const items = [...collection.querySelectorAll('[data-filter-item], [data-placeholder-item]')];
  const empty = collection.querySelector('[data-filter-empty]');
  const count = collection.querySelector('[data-filter-count]');
  let category = 'all';
  function update() {
    let matches = 0;
    let publishedMatches = 0;
    for (const item of items) {
      const visible = matchesCollectionItem(item.dataset.category, item.dataset.searchText, category, search?.value || '');
      item.hidden = !visible;
      if (visible) {
        matches++;
        if (item.hasAttribute('data-filter-item')) publishedMatches++;
      }
    }
    if (empty) empty.hidden = matches > 0 || !items.length;
    if (count) count.textContent = messages.publishedItems(publishedMatches);
    buttons.forEach(button => {
      const selected = button.dataset.filter === category;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-active', selected);
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; update(); }));
  search?.addEventListener('input', update);
  update();
});

// Native modal dialog supplies focus trapping and Escape; arrow keys browse visible images.
const dialog = document.querySelector('.lightbox');
const galleryLinks = [...document.querySelectorAll('[data-gallery-image]')];
if (dialog && galleryLinks.length && typeof dialog.showModal === 'function') {
  const photo = dialog.querySelector('.lightbox-image');
  const caption = dialog.querySelector('.lightbox-caption');
  const position = dialog.querySelector('.lightbox-position');
  const previous = dialog.querySelector('.lightbox-prev');
  const next = dialog.querySelector('.lightbox-next');
  let images = [];
  let index = 0;
  let trigger;
  function show(offset = 0) {
    index = (index + offset + images.length) % images.length;
    const link = images[index];
    photo.src = link.dataset.src;
    photo.alt = link.dataset.alt || '';
    caption.textContent = link.dataset.caption || link.dataset.alt || '';
    position.textContent = `${index + 1} / ${images.length}`;
    previous.hidden = next.hidden = images.length < 2;
  }
  galleryLinks.forEach(link => link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    trigger = link;
    const group = link.closest('.gallery-grid') || document;
    images = [...group.querySelectorAll('[data-gallery-image]')].filter(item => !item.closest('[hidden]'));
    index = images.indexOf(link);
    show();
    dialog.showModal();
  }));
  previous.addEventListener('click', () => show(-1));
  next.addEventListener('click', () => show(1));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('close', () => { trigger?.focus(); photo.removeAttribute('src'); });
}

// The site is built once, so anything that depends on today is settled in the browser:
// event labels move from upcoming to completed, and the footer year follows the calendar.
document.querySelectorAll('[data-event-phase]').forEach(el => {
  const label = phaseLabel({ upcoming: el.dataset.labelUpcoming, live: el.dataset.labelLive, ended: el.dataset.labelEnded }, el.dataset.start, el.dataset.end);
  if (label) el.textContent = label;
});
document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });

// Live countdown for upcoming FRC events (progressively enhanced, pauses when tab is hidden).
const countdownElements = [...document.querySelectorAll('[data-countdown-start][data-countdown-end]')];
if (countdownElements.length) {
  const pad = value => String(value).padStart(2, '0');
  let countdownTimer = 0;
  function buildUnit(value, label) {
    const unit = document.createElement('span');
    unit.className = 'countdown-unit';
    const num = document.createElement('strong');
    num.textContent = value;
    const text = document.createElement('small');
    text.textContent = label;
    unit.append(num, text);
    return unit;
  }
  function updateCountdowns() {
    let hasUpcoming = false;
    const now = new Date();
    for (const el of countdownElements) {
      const state = getEventCountdown(el.dataset.countdownStart, el.dataset.countdownEnd, now);
      if (!state || state.state === 'ended') {
        el.hidden = true;
        continue;
      }
      el.hidden = false;
      el.textContent = '';
      if (state.state === 'live') {
        const badge = document.createElement('span');
        badge.className = 'countdown-live';
        badge.textContent = messages.eventLive;
        el.append(badge);
      } else {
        hasUpcoming = true;
        el.append(
          buildUnit(String(state.days), messages.countdownDays),
          buildUnit(pad(state.hours), messages.countdownHours),
          buildUnit(pad(state.minutes), messages.countdownMinutes),
          buildUnit(pad(state.seconds), messages.countdownSeconds),
        );
      }
    }
    return hasUpcoming;
  }
  function stopCountdown() {
    if (countdownTimer) {
      window.clearInterval(countdownTimer);
      countdownTimer = 0;
    }
  }
  function startCountdown() {
    stopCountdown();
    if (document.hidden) return;
    if (updateCountdowns()) {
      countdownTimer = window.setInterval(() => {
        if (!updateCountdowns()) stopCountdown();
      }, 1000);
    }
  }
  startCountdown();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopCountdown();
    else startCountdown();
  });
  window.addEventListener('pagehide', stopCountdown);
}

// One-click email copy with accessible confirmation.
async function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  return ok;
}
document.querySelectorAll('[data-copy-email]').forEach(button => {
  let resetTimer = 0;
  button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail;
    if (!email) return;
    const label = button.querySelector('span');
    const statusEl = button.parentElement?.querySelector('[data-copy-status]');
    try {
      const ok = await copyText(email);
      if (!ok) throw new Error('copy failed');
      button.classList.add('is-copied');
      if (label) label.textContent = messages.copied;
      if (statusEl) statusEl.textContent = messages.copiedAnnouncement;
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        button.classList.remove('is-copied');
        if (label) label.textContent = messages.copy;
        if (statusEl) statusEl.textContent = '';
      }, 2200);
    } catch {
      if (statusEl) statusEl.textContent = messages.copyFailed;
    }
  });
});

// Subtle floating back-to-top button once the visitor scrolls down.
const backToTop = document.querySelector('[data-back-to-top]');
if (backToTop) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function syncBackToTop() {
    backToTop.hidden = window.scrollY < 420;
  }
  syncBackToTop();
  window.addEventListener('scroll', syncBackToTop, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });
}

