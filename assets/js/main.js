/* ==========================================================================
   MAIN.JS — hugocousty.fr
   --------------------------------------------------------------------------
   JavaScript natif, sans dépendance. Chaque module ne s'active que si ses
   éléments (attributs data-*) sont présents dans la page : le fichier peut
   donc être chargé sur toutes les pages.

   Sommaire
   1. Menu burger (mobile / tablette)
   2. Barre CTA mobile : masquée quand Contact ou le footer sont visibles
   3. Slider des réalisations : flèches

   Pas d'animation d'apparition au scroll : le design system l'exclut
   (« jamais d'animation d'entrée au défilement »).
   ========================================================================== */

(() => {
  'use strict';

  const desktop = window.matchMedia('(min-width: 64em)');


  /* 1. Menu burger
     ======================================================================== */

  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    const label = toggle.querySelector('[data-nav-toggle-label]');

    const setMenu = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('has-menu-open', open);
      if (label) label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    };

    toggle.addEventListener('click', () => {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Fermeture au clic sur un lien d'ancre
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });

    // Fermeture avec Échap, focus rendu au bouton
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    // Passage en desktop : le menu redevient une barre de liens classique
    desktop.addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }


  /* 2. Barre CTA mobile
     Inutile quand la section Contact (ou le footer) est déjà à l'écran.
     ======================================================================== */

  const stickyCta = document.querySelector('[data-sticky-cta]');
  const ctaTargets = [
    document.getElementById('contact'),
    document.querySelector('[data-footer]'),
  ].filter(Boolean);

  if (stickyCta && ctaTargets.length && 'IntersectionObserver' in window) {
    const visible = new Set();

    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      stickyCta.classList.toggle('is-hidden', visible.size > 0);
    });

    ctaTargets.forEach((target) => ctaObserver.observe(target));
  }


  /* 3. Slider des réalisations
     Le défilement est natif (CSS scroll-snap, swipe, clavier).
     Les flèches font avancer d'une carte et se désactivent aux extrémités.
     ======================================================================== */

  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const viewport = slider.querySelector('[data-slider-viewport]');
    const prev = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    if (!viewport || !prev || !next) return;

    const track = viewport.firstElementChild;

    // Distance d'une carte + l'espace entre deux cartes
    const step = () => {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : viewport.clientWidth;
    };

    const updateButtons = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      prev.disabled = viewport.scrollLeft <= 1;
      next.disabled = viewport.scrollLeft >= max - 1;
    };

    prev.addEventListener('click', () => viewport.scrollBy({ left: -step() }));
    next.addEventListener('click', () => viewport.scrollBy({ left: step() }));

    let ticking = false;
    viewport.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateButtons();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener('resize', updateButtons);
    updateButtons();
  });

})();
