// One icon set for every page. Link icons only carry meaning: ↗ leaves the site, the envelope opens email,
// ← goes back, → continues to another page. Internal buttons stay icon-free.
const shapes = {
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  previous: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  external: '<path d="M5 19 19 5M5 5h14v14"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 6 9 7 9-7"/>',
  up: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4Z"/><circle cx="12" cy="13" r="4"/>',
  robot: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M12 3v4M8 12h1m6 0h1m-8 4h8"/>',
  book: '<path d="M12 5v15M12 5C8 2 4 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-2-1-6-2-10 1Z"/>',
  medal: '<circle cx="12" cy="10" r="6"/><path d="m7 14-2 8 7-4 7 4-2-8"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>',
  play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M7 2v6m10-6v6M3 11h18"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
};

export function icon(name = 'arrow') {
  const key = Object.hasOwn(shapes, name) ? name : 'arrow';
  return `<svg viewBox="0 0 24 24" data-icon="${key}" aria-hidden="true">${shapes[key]}</svg>`;
}

// Which icon, if any, a link gets. Internal buttons are already clearly actions, so they get none.
export function linkIconName(href, { external = false, back = false, button = false } = {}) {
  if (back) return 'previous';
  if (/^mailto:/i.test(href)) return 'mail';
  if (external || /^https?:/i.test(href)) return 'external';
  return button ? '' : 'arrow';
}

// Back links lead with the icon; every other link ends with it.
export function labelWithIcon(labelHtml, name) {
  if (!name) return labelHtml;
  return name === 'previous' ? `${icon(name)}${labelHtml}` : `${labelHtml}${icon(name)}`;
}
