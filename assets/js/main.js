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


  /* 3. En-tête : couleur du texte selon le bloc sous la barre
     La barre de verre reste toujours visible. Quand elle passe sur un bloc
     sombre (data-theme="inverse" : hero, Contact, footer), elle prend le
     thème inverse (texte blanc) ; sur un bloc clair, texte encre.
     Sans JS, la barre reste en thème clair.
     ======================================================================== */

  const header = document.querySelector('[data-header]');

  if (header) {
    const darkZones = Array.from(document.querySelectorAll('main [data-theme="inverse"], footer[data-theme="inverse"]'));
    let ticking = false;

    const update = () => {
      const probe = header.offsetHeight / 2;
      const onDark = darkZones.some((zone) => {
        const r = zone.getBoundingClientRect();
        return r.top <= probe && r.bottom >= probe;
      });
      if (onDark) header.setAttribute('data-theme', 'inverse');
      else header.removeAttribute('data-theme');
      ticking = false;
    };

    const request = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
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
        theme: 'dark', // section Contact sur fond noir
        hideEventTypeDetails: true, // pas de colonne de gauche : le titre de la section présente déjà l'appel
        layout: 'month_view',
        styles: { branding: { brandColor: '#FFFFFF' } },
        cssVarsPerTheme: { dark: { 'cal-brand': '#FFFFFF' } },
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



  /* 8. Section IA : lecture au fil du scroll
     Les mots du texte s'allument un à un pendant la lecture (l'orbe, elle,
     reste fixe). Rien ne bouge si l'utilisateur réduit les animations ; sans
     JS, tout reste visible et immobile. */
  const ai = document.querySelector('[data-ai]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (ai && !reduceMotion.matches) {
    const read = ai.querySelector('[data-ai-read]');
    const words = [];

    // Découpe les nœuds texte en mots (espaces insécables conservés)
    const split = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part) && !/\u00a0/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement('span');
              span.className = 'ai-word';
              span.textContent = part;
              words.push(span);
              frag.appendChild(span);
            }
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          split(child);
        }
      });
    };
    if (read) split(read);

    const clamp = (v) => Math.min(1, Math.max(0, v));
    let ticking = false;

    const update = () => {
      const vh = window.innerHeight;
      const r = ai.getBoundingClientRect();
      if (read && words.length) {
        const b = read.getBoundingClientRect();
        // Début : haut du texte à 95 % de l'écran ; fin : centre du texte
        // à 65 % de l'écran (tout est lisible avant d'arriver au milieu)
        const p = clamp((vh * .95 - b.top) / (vh * .3 + b.height / 2));
        const lit = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    // N'écoute le scroll que lorsque la section est proche de l'écran
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true });
          update();
        } else {
          window.removeEventListener('scroll', onScroll);
        }
      });
    }, { rootMargin: '200px 0px' }).observe(ai);

    update();
  }



  /* 9. Chiffres clés : reflet qui glisse sur les chiffres au rythme du
     défilement. --shine (0 → 1) suit la traversée du bloc dans l'écran ;
     le CSS déplace la bande claire en conséquence. Les chiffres eux-mêmes
     ne bougent pas. Rien si les animations sont réduites. */
  const statsBlock = document.querySelector('.stats');

  if (statsBlock && !reduceMotion.matches) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      const r = statsBlock.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      statsBlock.style.setProperty('--shine', p.toFixed(3));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    }, { rootMargin: '100px 0px' }).observe(statsBlock);
    statsBlock.classList.add('has-shine');
    update();
  }


  /* 9 bis. Méthode en cartes empilées : chaque étape se fige sous
     l'en-tête et la suivante la recouvre. --cover (0 → 1) mesure à quel
     point une carte est recouverte, pour la faire légèrement reculer.
     Rien si animations réduites (la liste verticale reste affichée). */
  const stepsList = document.querySelector('#methode .steps');
  const stepItems = stepsList ? [...stepsList.querySelectorAll('.step')] : [];

  if (stepsList && stepItems.length > 1 && !reduceMotion.matches) {
    stepsList.classList.add('is-stacked');
    stepItems.forEach((el, i) => el.style.setProperty('--i', i));

    // Titre de la section figé au-dessus de la pile : les cartes se figent
    // juste sous lui (sa hauteur + un petit écart)
    const methodeSection = document.querySelector('#methode');
    const methodeHead = methodeSection.querySelector('.section-head');
    if (methodeHead) {
      methodeSection.classList.add('has-stack');
      const setTop = () => {
        methodeSection.style.setProperty('--stack-top', (methodeHead.offsetHeight + 24) + 'px');
      };
      setTop();
      window.addEventListener('resize', setTop);
    }

    let ticking = false;
    const update = () => {
      stepItems.forEach((el, i) => {
        const next = stepItems[i + 1];
        if (!next) return;
        const a = el.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        const t = Math.min(1, Math.max(0, 1 - (b.top - a.top) / a.height));
        el.style.setProperty('--cover', t.toFixed(3));
      });
      // Quand la dernière carte repart vers le haut, le titre part avec elle
      // (sinon il resterait figé par-dessus la pile qui s'en va)
      if (methodeHead) {
        const last = stepItems[stepItems.length - 1];
        const stuckAt = parseFloat(getComputedStyle(last).top) || 0;
        const shift = Math.min(0, last.getBoundingClientRect().top - stuckAt);
        methodeHead.style.transform = shift ? `translateY(${shift.toFixed(1)}px)` : '';
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }


  /* 10. Photo du hero au défilement : zoom, flou et assombrissement
     progressifs pendant qu'on quitte le hero (--hero-p de 0 à 1, posé
     sur le hero). Rien si animations réduites. */
  const heroPhoto = document.querySelector('img.hero__photo');

  if (heroPhoto && !reduceMotion.matches) {
    const hero = heroPhoto.closest('.hero');
    let ticking = false;
    const update = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * .85)));
      hero.style.setProperty('--hero-p', p.toFixed(3));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking && window.scrollY < hero.offsetHeight + 100) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }


  /* 11. CV : bouton « Télécharger en PDF » (impression du navigateur, mise
     en page dédiée dans sections.css, @media print) */
  document.querySelectorAll('[data-print]').forEach((btn) => {
    btn.addEventListener('click', () => window.print());
  });


  /* 12. FAQ : ouverture et fermeture en douceur
     La réponse se déplie (hauteur animée, 0,35 s) au lieu d'apparaître
     d'un coup. Une seule question ouverte à la fois : celle qui était
     ouverte se replie pendant que l'autre s'ouvre. Sans JS ou avec
     animations réduites : comportement natif des <details>. */
  const faqItems = [...document.querySelectorAll('.faq__item')];

  if (faqItems.length && !reduceMotion.matches && 'animate' in Element.prototype) {
    const opts = { duration: 350, easing: 'cubic-bezier(.16, .84, .32, 1)' };

    const collapse = (item) => {
      const answer = item.querySelector('.faq__answer');
      const h = answer.offsetHeight;
      const anim = answer.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], opts);
      answer.style.overflow = 'hidden';
      anim.onfinish = () => {
        item.open = false;
        answer.style.overflow = '';
      };
    };

    const expand = (item) => {
      // name="faq" fermerait les autres d'un coup : on le retire le temps
      // de l'animation, et on replie nous-mêmes celle qui était ouverte
      const name = item.getAttribute('name');
      if (name) item.removeAttribute('name');
      faqItems.forEach((other) => { if (other !== item && other.open) collapse(other); });
      item.open = true;
      const answer = item.querySelector('.faq__answer');
      const h = answer.offsetHeight;
      answer.style.overflow = 'hidden';
      const anim = answer.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], opts);
      anim.onfinish = () => {
        answer.style.overflow = '';
        if (name) item.setAttribute('name', name);
      };
    };

    faqItems.forEach((item) => {
      item.querySelector('.faq__question').addEventListener('click', (e) => {
        e.preventDefault();
        if (item.open) collapse(item);
        else expand(item);
      });
    });
  }

})();
