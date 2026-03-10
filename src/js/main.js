(function () {
  'use strict';

  /* --- Mobile navigation toggle --- */

  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      navLinks.setAttribute('data-visible', String(!open));
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('data-visible', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (
        navLinks.getAttribute('data-visible') === 'true' &&
        !e.target.closest('nav') &&
        !e.target.closest('.nav-toggle')
      ) {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('data-visible', 'false');
      }
    });
  }

  /* --- Smooth scroll for anchor links --- */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* --- Header scroll effect --- */

  var header = document.querySelector('.site-header');

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Image lightbox --- */

  var overlay = null;
  var overlayImg = null;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.85);' +
      'display:none;align-items:center;justify-content:center;' +
      'z-index:9999;cursor:pointer;opacity:0;transition:opacity .25s ease';

    overlayImg = document.createElement('img');
    overlayImg.style.cssText =
      'max-width:90vw;max-height:90vh;object-fit:contain;border-radius:4px;' +
      'box-shadow:0 0 30px rgba(0,0,0,.5)';

    overlay.appendChild(overlayImg);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeLightbox);
  }

  function openLightbox(src) {
    if (!overlay) createOverlay();
    overlayImg.src = src;
    overlay.style.display = 'flex';
    overlay.offsetHeight; // force reflow
    overlay.style.opacity = '1';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(function () {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 250);
  }

  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function () {
      var src = this.getAttribute('src') || this.querySelector('img')?.getAttribute('src');
      if (src) openLightbox(src);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();
