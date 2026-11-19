import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { installPageTransitions } from './page-transitions.js';

const seenKey = 'airforce:loading-seen';
const loaderBootstrap = readFileSync(new URL('./page-loader-bootstrap.js', import.meta.url), 'utf8');

class EventTargetStub {
  listeners = new Map();

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    for (const listener of this.listeners.get(event.type) || []) listener(event);
  }
}

async function flushPromises() {
  for (let index = 0; index < 12; index++) await Promise.resolve();
}

function createHarness(options = {}) {
  let now = 0;
  let nextTimer = 1;
  let readyEvents = 0;
  const timers = new Map();
  const values = new Map(Object.entries(options.storage || {}));
  const root = { dataset: { ...(options.dataset || {}) } };
  const media = new EventTargetStub();
  media.matches = options.reducedMotion || false;
  const connection = new EventTargetStub();
  connection.saveData = options.saveData || false;
  const document = new EventTargetStub();
  document.documentElement = root;
  document.hidden = options.hidden || false;
  document.fonts = { ready: options.fontsReady || Promise.resolve() };
  document.addEventListener('airforce:page-ready', () => readyEvents++);
  const loader = {
    querySelector: () => ({ decode: options.decode || (() => Promise.resolve()) }),
  };
  document.querySelector = () => options.missingLoader ? null : loader;
  document.querySelectorAll = () => options.animations ? [{ getAnimations: () => options.animations }] : [];
  const assigned = [];
  const location = new URL(options.url || 'https://airforce.test/');
  location.assign = url => assigned.push(url);
  const browser = new EventTargetStub();
  Object.assign(browser, {
    document,
    location,
    navigator: { connection },
    performance: {
      now: () => now,
      getEntriesByType: () => [{ type: options.navigation || 'navigate' }],
    },
    matchMedia: () => media,
    Event: class { constructor(type) { this.type = type; } },
    sessionStorage: {
      getItem(key) {
        if (options.storageDenied) throw new Error('Storage denied');
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        if (options.storageDenied || options.storageFull) throw new Error('Storage unavailable');
        values.set(key, value);
      },
    },
    setTimeout(callback, delay = 0) {
      const id = nextTimer++;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  });

  function bootstrap() {
    vm.runInNewContext(loaderBootstrap, {
      window: browser,
      document,
      sessionStorage: browser.sessionStorage,
      matchMedia: browser.matchMedia,
      navigator: browser.navigator,
      performance: browser.performance,
    });
  }

  function click(href, options = {}) {
    const anchor = {
      href,
      target: options.target || '',
      hasAttribute: name => name === 'download' && Boolean(options.download),
    };
    const event = {
      type: 'click',
      button: 0,
      defaultPrevented: false,
      ...options,
      target: { closest: () => anchor },
      preventDefault() { this.defaultPrevented = true; },
    };
    document.dispatchEvent(event);
    return event;
  }

  async function advance(milliseconds) {
    await flushPromises();
    const end = now + milliseconds;
    while (true) {
      const next = [...timers.entries()]
        .filter(([, timer]) => timer.at <= end)
        .sort((left, right) => left[1].at - right[1].at)[0];
      if (!next) break;
      const [id, timer] = next;
      now = timer.at;
      timers.delete(id);
      timer.callback();
      await flushPromises();
    }
    now = end;
    await flushPromises();
  }

  return {
    browser, document, root, media, connection, values, assigned, bootstrap, click, advance,
    get readyEvents() { return readyEvents; },
  };
}

function introHarness(options = {}) {
  const harness = createHarness(options);
  harness.bootstrap();
  installPageTransitions(harness.browser);
  return harness;
}

test('first eligible visit opens the intro, and a missing main module cannot leave it covering the page', async () => {
  const harness = createHarness();
  harness.bootstrap();
  assert.equal(harness.root.dataset.loader, 'intro');
  assert.equal(harness.values.get(seenKey), '1');
  await harness.advance(2400);
  assert.deepEqual(harness.root.dataset, {});
});

test('later page visits remain uncovered, including a leftover marker from the old navigation effect', () => {
  for (const marker of [undefined, '{broken', JSON.stringify({ url: 'https://airforce.test/takim/', time: Date.now() })]) {
    const harness = createHarness({
      url: 'https://airforce.test/takim/',
      storage: { [seenKey]: '1', ...(marker ? { 'airforce:page-transition': marker } : {}) },
    });
    harness.bootstrap();
    installPageTransitions(harness.browser);
    assert.deepEqual(harness.root.dataset, {});
  }
});

test('reload, history, hidden tabs, reduced motion, data saving and unavailable storage skip the intro', () => {
  for (const options of [
    { navigation: 'reload' }, { navigation: 'back_forward' }, { hidden: true },
    { reducedMotion: true }, { saveData: true }, { storageDenied: true }, { storageFull: true },
  ]) {
    const harness = introHarness(options);
    assert.deepEqual(harness.root.dataset, {}, JSON.stringify(options));
    assert.equal(harness.click('https://airforce.test/takim/').defaultPrevented, false);
  }
});

test('the one-second intro reveals content once and finishes its short fade', async () => {
  const animationCalls = [];
  const animation = {
    animationName: 'arrive',
    pause: () => animationCalls.push('pause'),
    play: () => animationCalls.push('play'),
    finish: () => animationCalls.push('finish'),
  };
  const harness = introHarness({ animations: [animation] });
  assert.deepEqual(animationCalls, ['pause']);
  await harness.advance(999);
  assert.equal(harness.root.dataset.loader, 'intro');
  assert.equal(harness.readyEvents, 0);
  await harness.advance(1);
  assert.equal(harness.root.dataset.loader, 'leaving');
  assert.deepEqual(animationCalls, ['pause', 'play']);
  assert.equal(harness.readyEvents, 1);
  await harness.advance(220);
  assert.deepEqual(harness.root.dataset, {});
  harness.document.dispatchEvent({ type: 'pointerdown' });
  harness.browser.dispatchEvent({ type: 'pageshow', persisted: true });
  await harness.advance(3000);
  assert.equal(harness.readyEvents, 1);
});

test('a late main module and slow assets do not restart the intro clock', async () => {
  const pending = new Promise(() => {});
  const harness = createHarness({ decode: () => pending, fontsReady: pending });
  harness.bootstrap();
  await harness.advance(800);
  installPageTransitions(harness.browser);
  await harness.advance(200);
  assert.equal(harness.root.dataset.loader, 'leaving');
  await harness.advance(220);
  assert.deepEqual(harness.root.dataset, {});
});

test('internal, fragment, external, modified and download links retain native behavior during and after the intro', async () => {
  const variants = [
    ['https://airforce.test/takim/', {}],
    ['https://airforce.test/robotlar/', {}],
    ['https://airforce.test/takim/#calisma-alanlari', {}],
    ['https://airforce.test/takim/?lang=en', {}],
    ['https://airforce.test/takim/', { ctrlKey: true }],
    ['https://airforce.test/takim/', { metaKey: true }],
    ['https://airforce.test/takim/', { shiftKey: true }],
    ['https://airforce.test/takim/', { altKey: true }],
    ['https://airforce.test/takim/', { button: 1 }],
    ['https://airforce.test/takim/', { download: true }],
    ['https://airforce.test/takim/', { target: '_blank' }],
    ['https://airforce.test/takim/', { target: 'named-window' }],
    ['https://instagram.com/airforce12414/', {}],
    ['mailto:airforce@istek.k12.tr', {}],
    ['https://airforce.test/assets/sponsor.pdf', {}],
    ['https://airforce.test/#sezon', {}],
    ['https://airforce.test/', {}],
  ];
  for (const options of [{}, { storage: { [seenKey]: '1' } }, { storageDenied: true }]) {
    const harness = introHarness(options);
    for (const [href, clickOptions] of variants) {
      assert.equal(harness.click(href, clickOptions).defaultPrevented, false, href);
    }
    assert.deepEqual(harness.assigned, []);
    await harness.advance(5000);
    assert.deepEqual(harness.assigned, [], 'The module must never initiate delayed navigation');
    assert.deepEqual(harness.root.dataset, {});
    assert.equal(harness.values.has('airforce:page-transition'), false);
    assert.equal(harness.click('https://airforce.test/takim/').defaultPrevented, false);
    assert.deepEqual(harness.root.dataset, {});
  }
});

test('unresolved images and fonts cannot extend the intro', async () => {
  const pending = new Promise(() => {});
  for (const options of [
    { decode: () => pending }, { fontsReady: pending }, { decode: () => pending, fontsReady: pending },
  ]) {
    const harness = introHarness(options);
    await harness.advance(1000);
    assert.equal(harness.root.dataset.loader, 'leaving');
    assert.equal(harness.readyEvents, 1);
    await harness.advance(220);
    assert.deepEqual(harness.root.dataset, {});
  }
});

test('failed image decoding or fonts release the page without timer revival', async () => {
  for (const failure of ['rejected image', 'throwing image', 'rejected font']) {
    const options = failure === 'rejected image'
      ? { decode: () => Promise.reject(new Error(failure)) }
      : failure === 'throwing image'
        ? { decode: () => { throw new Error(failure); } }
        : { fontsReady: Promise.reject(new Error(failure)) };
    const harness = introHarness(options);
    await flushPromises();
    assert.deepEqual(harness.root.dataset, {}, failure);
    assert.equal(harness.readyEvents, 1);
    await harness.advance(3000);
    assert.deepEqual(harness.root.dataset, {});
    assert.equal(harness.readyEvents, 1);
  }
});

test('pointer, keyboard and scroll input dismiss both the intro and its fade immediately', async () => {
  for (const elapsed of [0, 1000]) {
    for (const type of ['pointerdown', 'keydown', 'wheel']) {
      const harness = introHarness();
      await harness.advance(elapsed);
      const input = { type, key: 'Tab', defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      harness.document.dispatchEvent(input);
      assert.deepEqual(harness.root.dataset, {});
      assert.equal(input.defaultPrevented, false);
      assert.equal(harness.readyEvents, 1);
      await harness.advance(3000);
      assert.deepEqual(harness.root.dataset, {});
    }
  }
});

test('late image rejection after input dismissal cannot replay the intro or alter navigation', async () => {
  let rejectImage;
  const imageReady = new Promise((resolve, reject) => { rejectImage = reject; });
  const harness = introHarness({ decode: () => imageReady });
  harness.document.dispatchEvent({ type: 'pointerdown' });
  assert.equal(harness.click('https://airforce.test/robotlar/').defaultPrevented, false);
  rejectImage(new Error('Late image failure'));
  await harness.advance(3000);
  assert.deepEqual(harness.root.dataset, {});
  assert.deepEqual(harness.assigned, []);
  assert.equal(harness.readyEvents, 1);
});

test('motion or data preferences changing before or during initialization immediately release the intro', async () => {
  for (const beforeInstall of [true, false]) {
    for (const preference of ['motion', 'data']) {
      const calls = [];
      const harness = createHarness({ animations: [{
        animationName: 'arrive', pause() {}, play: () => calls.push('play'), finish: () => calls.push('finish'),
      }] });
      harness.bootstrap();
      if (!beforeInstall) installPageTransitions(harness.browser);
      if (preference === 'motion') {
        harness.media.matches = true;
        harness.media.dispatchEvent({ type: 'change' });
      } else {
        harness.connection.saveData = true;
        harness.connection.dispatchEvent({ type: 'change' });
      }
      if (beforeInstall) installPageTransitions(harness.browser);
      assert.deepEqual(harness.root.dataset, {});
      assert.deepEqual(calls, ['finish']);
      await harness.advance(3000);
      assert.deepEqual(harness.root.dataset, {});
      assert.equal(harness.readyEvents, 1);
    }
  }
});

test('hidden documents, page departures and BFCache restoration never revive the intro', async () => {
  for (const event of ['visibilitychange', 'pagehide', 'pageshow']) {
    const harness = introHarness();
    if (event === 'visibilitychange') {
      harness.document.hidden = true;
      harness.document.dispatchEvent({ type: event });
    } else harness.browser.dispatchEvent({ type: event, persisted: true });
    assert.deepEqual(harness.root.dataset, {});
    await harness.advance(3000);
    harness.browser.dispatchEvent({ type: 'pageshow', persisted: true });
    assert.deepEqual(harness.root.dataset, {});
    assert.equal(harness.readyEvents, 1);
  }
});

test('missing decorative markup leaves the page immediately usable', async () => {
  const harness = introHarness({ missingLoader: true });
  assert.deepEqual(harness.root.dataset, {});
  assert.equal(harness.click('https://airforce.test/takim/').defaultPrevented, false);
  await harness.advance(3000);
  assert.deepEqual(harness.root.dataset, {});
});
