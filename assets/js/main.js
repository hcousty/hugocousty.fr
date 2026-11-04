/* ==========================================================================
   MAIN.JS — hugocousty.fr
   --------------------------------------------------------------------------
   JavaScript natif, sans dépendance. Chaque module ne s'active que si ses
   éléments (attributs data-*) sont présents dans la page : le fichier peut
   donc être chargé sur toutes les pages.

   Sommaire
   1. Menu burger (mobile / tablette)
   2. Barre CTA mobile : masquée quand un bloc data-sticky-cta-hide ou le
      footer sont visibles (boutons du hero, section Contact)
   3. En-tête : barre blanche en haut de page, pilule de verre sombre dès
      qu'on défile
   4. Réalisations (mobile) : 3 cartes, les autres derrière un bouton
   5. Formulaire de contact (Brevo) : envoi en arrière-plan, puis /merci/

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

    // Fermeture au clic en dehors du menu et du bouton
    document.addEventListener('click', (event) => {
      if (toggle.getAttribute('aria-expanded') === 'true'
        && !nav.contains(event.target) && !toggle.contains(event.target)) {
        setMenu(false);
      }
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
     Inutile quand un bouton « Réserver » est déjà à l'écran (hero, Contact)
     ou quand le footer est visible.
     ======================================================================== */

  const stickyCta = document.querySelector('[data-sticky-cta]');
  const ctaTargets = [
    ...document.querySelectorAll('[data-sticky-cta-hide]'),
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


  /* 3. En-tête au défilement
     En haut de page : barre blanche (thème clair). Dès qu'on défile : classe
     is-scrolled + thème inverse, la barre devient une pilule de verre sombre.
     Sans JS, la barre blanche reste en place.
     ======================================================================== */

  const header = document.querySelector('[data-header]');

  if (header) {
    // Desktop : on attend que le hero soit passé entièrement sous la barre
    // blanche (défilement = hauteur de la barre). Mobile : dès les premiers px.
    const barHeight = () => parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-height-top')
    ) || 72;
    const threshold = () => (desktop.matches ? barHeight() : 8);
    let ticking = false;

    const update = () => {
      const scrolled = window.scrollY >= threshold();
      header.classList.toggle('is-scrolled', scrolled);
      if (scrolled) header.setAttribute('data-theme', 'inverse');
      else header.removeAttribute('data-theme');
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update(); // page rechargée en milieu de page ou ouverte sur une ancre
  }



  /* 4. Réalisations : sur mobile, seules les 3 premières cartes sont visibles.
     Le bouton affiche les autres puis disparaît. Sans JS, tout reste visible. */
  const projects = document.querySelector('[data-projects]');
  const projectsMore = document.querySelector('[data-projects-more]');

  if (projects && projectsMore) {
    projects.classList.add('is-collapsed');
    projectsMore.hidden = false;

    projectsMore.addEventListener('click', () => {
      projects.classList.remove('is-collapsed');
      projectsMore.setAttribute('aria-expanded', 'true');
      projectsMore.hidden = true;
      const first = projects.querySelector('.project-card--extra');
      if (first) {
        first.setAttribute('tabindex', '-1');
        first.focus({ preventScroll: true });
      }
    });
  }



  /* 5. Formulaire de contact (Brevo)
     Envoi en arrière-plan vers le formulaire Brevo, puis redirection vers la
     page /merci/. Si la réponse de Brevo ne peut pas être lue (réseau,
     navigateur), on bascule sur l'envoi classique : Brevo affiche alors sa
     propre page de confirmation. Sans JS, c'est ce même envoi classique. */
  const contactForm = document.querySelector('[data-contact-form]');

  if (contactForm && window.fetch && window.FormData) {
    const status = contactForm.querySelector('[data-form-status]');
    const button = contactForm.querySelector('[type="submit"]');
    const setStatus = (text) => { if (status) status.textContent = text; };

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Brevo attend le numéro sans le 0 initial ni séparateurs (06 12… → 612…)
      const phone = contactForm.elements.SMS;
      if (phone) phone.value = phone.value.replace(/\D/g, '').replace(/^0+/, '');

      button.disabled = true;
      setStatus('Envoi en cours…');

      // Téléphone facultatif : sans numéro, on n'envoie pas non plus l'indicatif
      const data = new FormData(contactForm);
      if (!data.get('SMS')) {
        data.delete('SMS');
        data.delete('SMS__COUNTRY_CODE');
      }

      let response;
      try {
        response = await fetch(contactForm.action + '?isAjax=1', {
          method: 'POST',
          body: data,
        });
      } catch (error) {
        contactForm.submit();
        return;
      }

      let result = {};
      try { result = await response.json(); } catch (error) { /* réponse non JSON */ }

      if (response.ok && result.success !== false) {
        window.location.href = '/merci/';
        return;
      }

      button.disabled = false;
      setStatus("L’envoi n’a pas abouti. Vérifiez vos informations, le téléphone notamment, ou écrivez-moi à hello@hugocousty.fr.");
    });
  }

})();
