(() => {
  const root = document.documentElement;
  const storageKey = 'aadit-site-transition';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  root.dataset.siteTransitions = 'ready';

  try {
    if (sessionStorage.getItem(storageKey) === '1') {
      sessionStorage.removeItem(storageKey);
      root.classList.add('site-entering');
      window.setTimeout(() => root.classList.remove('site-entering'), 220);
    }
  } catch {
    // Navigation still works when storage is unavailable.
  }

  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = event.target.closest('a[href]');
    if (
      !link ||
      (link.target && link.target !== '_self') ||
      link.hasAttribute('download')
    ) {
      return;
    }

    const destination = new URL(link.href, window.location.href);
    if (
      destination.origin !== window.location.origin ||
      !['http:', 'https:'].includes(destination.protocol)
    ) {
      return;
    }

    const sameDocument =
      destination.pathname === window.location.pathname &&
      destination.search === window.location.search;

    if (sameDocument || root.classList.contains('site-leaving')) {
      return;
    }

    event.preventDefault();

    if (reducedMotion.matches) {
      window.location.assign(destination.href);
      return;
    }

    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // The destination can still animate its own initial render.
    }

    root.classList.add('site-leaving');
    window.setTimeout(() => window.location.assign(destination.href), 145);
  }, true);

  window.addEventListener('pageshow', () => {
    root.classList.remove('site-leaving');
  });
})();
