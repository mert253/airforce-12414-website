import { matchesCollectionItem } from './collection-utils.js';
import { installPageTransitions } from './page-transitions.js';

installPageTransitions();

const messages = document.documentElement.lang === 'en' ? {
  menu: 'Menu',
  openMenu: 'Open menu',
  close: 'Close',
  closeMenu: 'Close menu',
  publishedItems: count => `${count} published ${count === 1 ? 'item' : 'items'}`,
} : {
  menu: 'Menü',
  openMenu: 'Menüyü aç',
  close: 'Kapat',
  closeMenu: 'Menüyü kapat',
  publishedItems: count => `${count} yayımlanmış içerik`,
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

// Content stays visible without JavaScript; each entrance animation runs once.
if ('IntersectionObserver' in window && 'animate' in Element.prototype) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const activeAnimations = new Set();
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal.unobserve(entry.target);
      if (reducedMotion.matches || document.hidden) continue;
      const requestedDelay = Number(entry.target.dataset.revealDelay) || 0;
      const animation = entry.target.animate([
        { opacity: 0.2, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 560,
        delay: Math.max(0, Math.min(requestedDelay, 240)),
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards',
      });
      activeAnimations.add(animation);
      animation.finished.then(
        () => activeAnimations.delete(animation),
        () => activeAnimations.delete(animation),
      );
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  function observeSections() {
    document.querySelectorAll('[data-reveal]').forEach(section => {
      if (!section.parentElement.closest('[data-reveal]')) reveal.observe(section);
    });
  }
  if (document.documentElement.dataset.loader === 'intro') {
    document.addEventListener('airforce:page-ready', observeSections, { once: true });
  } else observeSections();
  function finishReveals() {
    for (const animation of activeAnimations) animation.cancel();
    activeAnimations.clear();
  }
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finishReveals(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishReveals(); });
  window.addEventListener('pagehide', finishReveals);
}

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
