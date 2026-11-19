// Retain the shared entry point; document navigation is entirely browser-managed.
export function installPageTransitions(browser = window) {
  const { document } = browser;
  const root = document.documentElement;
  const loader = document.querySelector('.page-loader');
  if (!loader || root.dataset.loader !== 'intro') {
    delete root.dataset.loader;
    delete root.dataset.loaderStarted;
    return;
  }

  const reducedMotion = browser.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = browser.navigator.connection;
  let entryActive = true;
  let readyDispatched = false;
  let entryTimer;
  let exitTimer;
  const entrances = [...document.querySelectorAll('.hero-copy, .hero-art')]
    .flatMap(element => element.getAnimations?.() || [])
    .filter(animation => animation.animationName === 'arrive');
  entrances.forEach(animation => { animation.pause(); animation.currentTime = 0; });

  function resumeEntrances() {
    if (readyDispatched) return;
    readyDispatched = true;
    entrances.splice(0).forEach(animation => {
      if (reducedMotion.matches || document.hidden || connection?.saveData) animation.finish();
      else animation.play();
    });
    document.dispatchEvent(new browser.Event('airforce:page-ready'));
  }

  function reset() {
    browser.clearTimeout(entryTimer);
    browser.clearTimeout(exitTimer);
    entryActive = false;
    delete root.dataset.loader;
    delete root.dataset.loaderStarted;
    resumeEntrances();
  }

  function finishEntry() {
    if (!entryActive) return;
    entryActive = false;
    root.dataset.loader = 'leaving';
    resumeEntrances();
    exitTimer = browser.setTimeout(reset, 220);
  }

  if (reducedMotion.matches || document.hidden || connection?.saveData) {
    reset();
    return;
  }

  const started = Number(root.dataset.loaderStarted) || 0;
  const mark = loader.querySelector('img');
  // Decode can reject or throw synchronously; either failure releases the page.
  const imageReady = Promise.resolve().then(() => mark?.decode?.());
  Promise.all([imageReady, document.fonts?.ready]).catch(() => { if (entryActive) reset(); });
  // Asset readiness never extends the opening, even if this module loads late.
  const remaining = Math.max(0, 1000 - (browser.performance.now() - started));
  entryTimer = browser.setTimeout(finishEntry, remaining);

  // The decorative overlay never takes focus or intercepts link activation.
  for (const type of ['pointerdown', 'keydown', 'wheel']) {
    document.addEventListener(type, reset, { passive: true });
  }
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) reset(); });
  connection?.addEventListener?.('change', () => { if (connection.saveData) reset(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  browser.addEventListener('pagehide', reset);
  browser.addEventListener('pageshow', event => { if (event.persisted) reset(); });
}
