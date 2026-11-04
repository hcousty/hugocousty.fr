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
   6. Calendrier de réservation (Cal.com) : chargé à l'approche de la section
   7. Logos clients (mobile) : bandeau qui défile en continu

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



  /* 6. Calendrier de réservation (Cal.com)
     Code d'intégration fourni par Cal.com, réglé aux couleurs du site (thème
     sombre, couleur principale blanche, comme la section Contact). Le script de Cal.com n'est chargé qu'à
     l'approche du calendrier : il ne pèse pas sur le reste de la page.
     Le lien et l'espace de noms viennent des attributs data-cal-* du bloc. */
  const booking = document.querySelector('[data-cal-link]');

  if (booking) {
    const loadCal = () => {
      const ns = booking.dataset.calNamespace || 'rdv';

      /* eslint-disable */
      (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
      /* eslint-enable */

      const Cal = window.Cal;
      Cal('init', ns, { origin: 'https://app.cal.com' });
      Cal.config = Cal.config || {};
      Cal.config.forwardQueryParams = true;

      Cal.ns[ns]('inline', {
        elementOrSelector: '#' + booking.id,
        config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true', theme: 'dark' },
        calLink: booking.dataset.calLink,
      });

      Cal.ns[ns]('ui', {
        theme: 'dark', // section Contact sur fond bordeaux
        hideEventTypeDetails: true, // pas de colonne de gauche : le titre de la section présente déjà l'appel
        layout: 'month_view',
        styles: { branding: { brandColor: '#FF9D33' } },
        cssVarsPerTheme: { dark: {
          'cal-brand': '#FF9D33', 'cal-brand-emphasis': '#FFB25E', 'cal-brand-text': '#550C11',
          'cal-bg': '#550C11', 'cal-bg-muted': '#681820', 'cal-bg-subtle': '#681820', 'cal-bg-emphasis': '#7E2A30',
          'cal-border': '#8E3A3A', 'cal-border-subtle': '#74262A', 'cal-border-booker': '#74262A',
          'cal-text': '#F6E3D3', 'cal-text-emphasis': '#FFFDF9', 'cal-text-subtle': '#D9A98A', 'cal-text-muted': '#D9A98A'
        } },
      });

      Cal.ns[ns]('on', {
        action: 'linkReady',
        callback: () => booking.classList.remove('is-loading'),
      });
    };

    booking.classList.add('is-loading');

    if ('IntersectionObserver' in window) {
      const calObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          calObserver.disconnect();
          loadCal();
        }
      }, { rootMargin: '800px 0px' });
      calObserver.observe(booking);
    } else {
      loadCal();
    }
  }



  /* 7. Logos clients : bandeau défilant en mobile
     La liste est doublée (copies masquées aux lecteurs d'écran) pour que le
     défilement boucle sans à-coup. Le CSS ne fait défiler qu'en mobile et
     respecte la préférence « mouvement réduit ». */
  const marquee = document.querySelector('[data-marquee]');

  if (marquee) {
    [...marquee.children].forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('data-clone', '');
      clone.querySelectorAll('[role="img"]').forEach((img) => img.removeAttribute('aria-label'));
      marquee.appendChild(clone);
    });
    marquee.classList.add('is-marquee');
  }

})();
