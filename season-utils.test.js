import test from 'node:test';
import assert from 'node:assert/strict';
import { selectUpcomingEvent, formatContentDate, isCalendarDate } from './season-utils.js';

test('season promotes the nearest published event and excludes expired or invalid dates', () => {
  const upcoming = { status: 'published', title: 'Ankara', startDate: '2027-03-19', endDate: '2027-03-21' };
  const events = [
    { ...upcoming, title: 'Later', startDate: '2027-04-01', endDate: '2027-04-03', featured: true },
    { ...upcoming, title: 'Past', startDate: '2026-03-19', endDate: '2026-03-21', featured: true },
    { ...upcoming, status: 'draft', startDate: '2026-12-01' },
    { ...upcoming, startDate: '2027-02-30' },
    { ...upcoming, startDate: '2027-04-10', endDate: '2027-04-01' },
    upcoming,
  ];
  assert.equal(selectUpcomingEvent(events, new Date('2026-11-16T12:00:00Z')), upcoming);
});

test('an event stays visible throughout its final day in Istanbul, then expires', () => {
  const event = { status: 'published', startDate: '2027-03-19', endDate: '2027-03-21' };
  assert.equal(selectUpcomingEvent([event], new Date('2027-03-21T20:59:59Z')), event);
  assert.equal(selectUpcomingEvent([event], new Date('2027-03-21T21:00:00Z')), undefined);
  assert.equal(selectUpcomingEvent([], new Date('2027-03-21T21:00:00Z')), undefined);
});

test('display dates reject invalid calendar dates and preserve Turkish month names', () => {
  assert.equal(isCalendarDate('2027-02-29'), false);
  assert.equal(isCalendarDate('2028-02-29'), true);
  assert.equal(formatContentDate('2026-11-16'), '16 Kasım 2026');
  assert.equal(formatContentDate('<invalid>'), '');
});
