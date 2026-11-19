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
