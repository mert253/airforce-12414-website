// ISO dates let the season overview stop promoting completed events.
export function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function formatContentDate(value, lang = 'tr') {
  if (!isCalendarDate(value)) return '';
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export function isUpcomingEvent(event, now = new Date()) {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(now);
  return event?.status === 'published' &&
    isCalendarDate(event.startDate) && isCalendarDate(event.endDate) &&
    event.endDate >= event.startDate && event.endDate >= today;
}

export function selectUpcomingEvent(events = [], now = new Date()) {
  return events.filter(event => isUpcomingEvent(event, now))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
}

export function getEventCountdown(startDate, endDate, now = new Date()) {
  if (!isCalendarDate(startDate) || !isCalendarDate(endDate) || endDate < startDate) return null;
  const nowMs = now instanceof Date ? now.getTime() : Number(now);
  if (!Number.isFinite(nowMs)) return null;
  // Türkiye observes permanent UTC+3 (Europe/Istanbul).
  const startMs = Date.parse(`${startDate}T00:00:00+03:00`);
  const endMs = Date.parse(`${endDate}T23:59:59+03:00`);
  if (nowMs >= endMs) return { state: 'ended', days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (nowMs >= startMs) return { state: 'live', days: 0, hours: 0, minutes: 0, seconds: 0 };
  const remaining = Math.max(0, Math.floor((startMs - nowMs) / 1000));
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  return { state: 'upcoming', days, hours, minutes, seconds };
}


// One definition of "where is this event in time", shared by the build and the browser.
// Returns 'upcoming', 'live', 'ended', or '' when the dates are not valid.
export function eventPhase(event, now = new Date()) {
  return getEventCountdown(event?.startDate, event?.endDate, now)?.state || '';
}

// The page is static, so labels are written for the phase at build time and carry the other phases
// in data attributes. The browser picks the right one for today without a rebuild.
export function phaseLabel(labels, startDate, endDate, now = new Date()) {
  const phase = getEventCountdown(startDate, endDate, now)?.state;
  return (phase && labels?.[phase]) || '';
}

// First day (Istanbul) on which a build made before it becomes out of date for event promotion,
// which is the day after the earliest end date among events still promoted at build time.
export function rebuildNeededFrom(events = [], now = new Date()) {
  const ends = events.filter(event => isUpcomingEvent(event, now)).map(event => event.endDate).sort();
  if (!ends.length) return '';
  const next = new Date(`${ends[0]}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}
