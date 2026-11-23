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

export function selectUpcomingEvent(events = [], now = new Date()) {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(now);
  return events.filter(event => event?.status === 'published' &&
    isCalendarDate(event.startDate) && isCalendarDate(event.endDate) &&
    event.endDate >= event.startDate && event.endDate >= today)
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

