import test from 'node:test';
import assert from 'node:assert/strict';
import { isUpcomingEvent, selectUpcomingEvent,formatContentDate, isCalendarDate, getEventCountdown } from './season-utils.js';

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

test('event countdown computes upcoming, live and ended states in Istanbul time', () => {
  assert.deepEqual(
    getEventCountdown('2027-03-19', '2027-03-21', new Date('2027-03-17T20:59:59+03:00')),
    { state: 'upcoming', days: 1, hours: 3, minutes: 0, seconds: 1 },
  );
  assert.deepEqual(
    getEventCountdown('2027-03-19', '2027-03-21', new Date('2027-03-19T00:00:00+03:00')),
    { state: 'live', days: 0, hours: 0, minutes: 0, seconds: 0 },
  );
  assert.deepEqual(
    getEventCountdown('2027-03-19', '2027-03-21', new Date('2027-03-22T00:00:00+03:00')),
    { state: 'ended', days: 0, hours: 0, minutes: 0, seconds: 0 },
  );
  assert.equal(getEventCountdown('2027-03-21', '2027-03-19', new Date()), null);
  assert.equal(getEventCountdown('invalid', '2027-03-21', new Date()), null);
});

test('isUpcomingEvent keeps an event through its last Istanbul day and rejects drafts and bad dates', () => {
  const event = { status: 'published', startDate: '2027-03-19', endDate: '2027-03-21' };
  assert.equal(isUpcomingEvent(event, new Date('2027-03-21T20:59:59Z')), true);
  assert.equal(isUpcomingEvent(event, new Date('2027-03-21T21:00:00Z')), false);
  assert.equal(isUpcomingEvent({ ...event, status: 'draft' }, new Date('2027-01-01T00:00:00Z')), false);
  assert.equal(isUpcomingEvent({ ...event, startDate: '2027-02-30' }, new Date('2027-01-01T00:00:00Z')), false);
  assert.equal(isUpcomingEvent({ ...event, endDate: '2027-03-01' }, new Date('2027-01-01T00:00:00Z')), false);
  assert.equal(isUpcomingEvent(undefined), false);
});

import { eventPhase, phaseLabel, rebuildNeededFrom } from './season-utils.js';

test('event phase is upcoming, live or ended in Istanbul time, and empty for invalid dates', () => {
  const event = { startDate: '2027-03-19', endDate: '2027-03-21' };
  assert.equal(eventPhase(event, new Date('2027-03-18T20:59:59Z')), 'upcoming');
  assert.equal(eventPhase(event, new Date('2027-03-18T21:00:00Z')), 'live');
  assert.equal(eventPhase(event, new Date('2027-03-21T20:59:58Z')), 'live');
  assert.equal(eventPhase(event, new Date('2027-03-21T21:00:00Z')), 'ended');
  assert.equal(eventPhase({ startDate: '2027-02-30', endDate: '2027-03-21' }), '');
  assert.equal(eventPhase(undefined), '');
});

test('phase labels switch with the date and stay empty without a matching label', () => {
  const labels = { upcoming: 'Yaklaşan', live: 'Devam ediyor', ended: 'Tamamlandı' };
  assert.equal(phaseLabel(labels, '2027-03-19', '2027-03-21', new Date('2027-01-01T00:00:00Z')), 'Yaklaşan');
  assert.equal(phaseLabel(labels, '2027-03-19', '2027-03-21', new Date('2027-03-20T12:00:00Z')), 'Devam ediyor');
  assert.equal(phaseLabel(labels, '2027-03-19', '2027-03-21', new Date('2027-04-01T00:00:00Z')), 'Tamamlandı');
  assert.equal(phaseLabel({ upcoming: 'x' }, '2027-03-19', '2027-03-21', new Date('2027-04-01T00:00:00Z')), '');
  assert.equal(phaseLabel(labels, 'bad', '2027-03-21'), '');
});

test('the rebuild date is the day after the earliest promoted event ends', () => {
  const events = [
    { status: 'published', startDate: '2027-03-19', endDate: '2027-03-21' },
    { status: 'published', startDate: '2027-04-10', endDate: '2027-04-12' },
    { status: 'published', startDate: '2026-01-01', endDate: '2026-01-03' },
    { status: 'draft', startDate: '2026-12-01', endDate: '2026-12-02' },
  ];
  assert.equal(rebuildNeededFrom(events, new Date('2026-11-26T09:00:00Z')), '2027-03-22');
  assert.equal(rebuildNeededFrom(events, new Date('2027-03-25T09:00:00Z')), '2027-04-13');
  assert.equal(rebuildNeededFrom([], new Date()), '');
});
