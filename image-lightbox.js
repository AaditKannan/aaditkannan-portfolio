(() => {
  'use strict';

  const IGNORE_SELECTOR = '[data-lightbox-ignore], .project-card, .board-layer-viewer, .board-layer-lightbox, .gallery-thumb, .about-preview, .project-hover-preview';
  let activeItems = [];
  let activeIndex = 0;
  let previousFocus = null;

  const overlay = document.createElement('div');
  overlay.className = 'image-lightbox';
  overlay.hidden = true;
  overlay.tabIndex = -1;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Expanded image viewer');
  overlay.innerHTML = `
    <button class="lightbox-button lightbox-close" type="button" aria-label="Close expanded image">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <button class="lightbox-button lightbox-previous" type="button" aria-label="Previous image">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <figure class="lightbox-figure">
      <img class="lightbox-image" alt="">
      <figcaption class="lightbox-caption" aria-live="polite"></figcaption>
    </figure>
    <button class="lightbox-button lightbox-next" type="button" aria-label="Next image">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <span class="lightbox-counter" aria-live="polite"></span>
  `;
  document.body.appendChild(overlay);

  const image = overlay.querySelector('.lightbox-image');
  const caption = overlay.querySelector('.lightbox-caption');
  const counter = overlay.querySelector('.lightbox-counter');
  const closeButton = overlay.querySelector('.lightbox-close');
  const previousButton = overlay.querySelector('.lightbox-previous');
  const nextButton = overlay.querySelector('.lightbox-next');

  function isEligible(img) {
    if (!(img instanceof HTMLImageElement)) return false;
    if (img.closest(IGNORE_SELECTOR)) return false;
    if (img.getAttribute('aria-hidden') === 'true') return false;
    if (!img.getAttribute('alt') && !img.closest('figure')) return false;
    return true;
  }

  function sourceFor(img) {
    return img.dataset.lightboxSrc || img.getAttribute('src') || img.currentSrc;
  }

  function captionFor(img) {
    if (img.dataset.lightboxCaption) return img.dataset.lightboxCaption;
    const figureCaption = img.closest('figure')?.querySelector('figcaption');
    return figureCaption?.textContent.trim() || img.getAttribute('alt') || '';
  }

  function itemFor(img, captionOverride = '') {
    return {
      source: sourceFor(img),
      alt: img.getAttribute('alt') || captionOverride || 'Expanded image',
      caption: captionOverride || captionFor(img),
    };
  }

  function isRendered(img) {
    return img.getClientRects().length > 0;
  }

  function uniqueItems(items) {
    const seen = new Set();
    return items.filter((item) => {
      if (!item.source || seen.has(item.source)) return false;
      seen.add(item.source);
      return true;
    });
  }

  function itemsFor(trigger) {
    const gallery = trigger.closest('.detail-gallery');
    if (gallery) {
      const title = document.getElementById('detailTitle')?.textContent.trim() || trigger.alt;
      const thumbnails = [...gallery.querySelectorAll('.gallery-thumb img')];
      if (thumbnails.length) {
        return uniqueItems(thumbnails.map((thumb) => itemFor(thumb, title)));
      }
    }

    const description = trigger.closest('.detail-description');
    if (description) {
      return uniqueItems([...description.querySelectorAll('img')]
        .filter((img) => isEligible(img) && isRendered(img))
        .map((img) => itemFor(img)));
    }

    const projectGrid = trigger.closest('.projects-grid');
    if (projectGrid) {
      return uniqueItems([...projectGrid.querySelectorAll('img')]
        .filter((img) => isEligible(img) && isRendered(img))
        .map((img) => itemFor(img)));
    }

    const scope = trigger.closest('main, .content, .layout') || document.body;
    return uniqueItems([...scope.querySelectorAll('img')]
      .filter((img) => isEligible(img) && isRendered(img))
      .map((img) => itemFor(img)));
  }

  function render() {
    const item = activeItems[activeIndex];
    if (!item) return;
    image.src = item.source;
    image.alt = item.alt;
    caption.textContent = item.caption;
    const hasMultiple = activeItems.length > 1;
    previousButton.hidden = !hasMultiple;
    nextButton.hidden = !hasMultiple;
    counter.textContent = hasMultiple ? `${activeIndex + 1} / ${activeItems.length}` : '';
  }

  function open(trigger) {
    activeItems = itemsFor(trigger);
    if (!activeItems.length) activeItems = [itemFor(trigger)];
    const triggerSource = sourceFor(trigger);
    const initialIndex = activeItems.findIndex((item) => item.source === triggerSource);
    activeIndex = initialIndex >= 0 ? initialIndex : 0;
    previousFocus = document.activeElement;
    render();
    overlay.hidden = false;
    overlay.classList.add('is-opening');
    document.body.classList.add('image-lightbox-open');
    requestAnimationFrame(() => overlay.classList.remove('is-opening'));
    closeButton.focus({ preventScroll: true });
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('image-lightbox-open');
    image.removeAttribute('src');
    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  }

  function move(delta) {
    if (activeItems.length < 2) return;
    activeIndex = (activeIndex + delta + activeItems.length) % activeItems.length;
    render();
  }

  function enableImages(root = document) {
    const images = root instanceof HTMLImageElement ? [root] : root.querySelectorAll?.('img') || [];
    images.forEach((img) => {
      if (!isEligible(img) || img.dataset.lightboxReady === 'true') return;
      img.dataset.lightboxReady = 'true';
      img.classList.add('is-lightbox-enabled');
      if (!img.hasAttribute('tabindex')) img.tabIndex = 0;
      if (!img.hasAttribute('role')) img.setAttribute('role', 'button');
      if (!img.hasAttribute('aria-label')) img.setAttribute('aria-label', `Enlarge ${img.alt || 'image'}`);
    });
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest?.('img');
    if (!trigger || !isEligible(trigger)) return;
    event.preventDefault();
    event.stopPropagation();
    open(trigger);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (overlay.hidden) {
      if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLImageElement && isEligible(event.target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        open(event.target);
      }
      return;
    }

    event.stopImmediatePropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
    if (event.key === 'Tab') {
      const controls = [...overlay.querySelectorAll('button:not([hidden])')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }, true);

  closeButton.addEventListener('click', close);
  previousButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  enableImages();
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) enableImages(node);
    }));
  }).observe(document.body, { childList: true, subtree: true });
})();
