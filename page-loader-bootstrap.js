(function preparePageLoader() {
  const root = document.documentElement;
  const seenKey = 'airforce:loading-seen';
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.hidden || navigator.connection?.saveData) return;
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation?.type === 'reload' || navigation?.type === 'back_forward' ||
        sessionStorage.getItem(seenKey)) return;
    // If storage is unavailable, keep the page immediately usable instead.
    sessionStorage.setItem(seenKey, '1');
    root.dataset.loader = 'intro';
    root.dataset.loaderStarted = String(performance.now());
    // Release the page even when the main module cannot load.
    window.setTimeout(() => {
      if (root.dataset.loader === 'intro') {
        delete root.dataset.loader;
        delete root.dataset.loaderStarted;
      }
    }, 2400);
  } catch {
    delete root.dataset.loader;
    delete root.dataset.loaderStarted;
  }
})();
