(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('#mobile-panel');
  const siteNav = document.querySelector('#site-nav');
  const pageBackground = document.querySelectorAll('#main, .site-footer');

  const closeMenu = (restoreFocus = false) => {
    if (!menuButton || !mobilePanel) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    mobilePanel.hidden = true;
    document.body.classList.remove('menu-open');
    pageBackground.forEach((item) => { item.inert = false; });
    if (restoreFocus) menuButton.focus();
  };

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      mobilePanel.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      pageBackground.forEach((item) => { item.inert = open; });
      if (open) mobilePanel.querySelector('a')?.focus();
    });
    mobilePanel.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    mobilePanel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const links = [...mobilePanel.querySelectorAll('a[href]')];
      const first = links[0];
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((item) => {
    item.textContent = String(new Date().getFullYear());
  });

  const routePath = window.location.pathname.replace(/\/$/, '') || '/';
  const primaryLinks = [...document.querySelectorAll('.nav a')];
  primaryLinks.forEach((link) => {
    const route = link.dataset.route;
    if (route && routePath.endsWith(`/${route}`)) link.setAttribute('aria-current', 'true');
  });
  const isSubpage = routePath.endsWith('/development') || routePath.endsWith('/seo');
  if (!isSubpage && 'IntersectionObserver' in window) {
    const sections = primaryLinks
      .filter((link) => link.dataset.section)
      .map((link) => ({ link, section: document.getElementById(link.dataset.section) }))
      .filter((entry) => entry.section);
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        primaryLinks.forEach((link) => link.removeAttribute('aria-current'));
        sections.find((item) => item.section === entry.target)?.link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-22% 0px -68% 0px' });
    sections.forEach(({ section }) => activeObserver.observe(section));
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  if (siteNav && !reduceMotion) {
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const movingDown = currentY > lastY + 8;
        const movingUp = currentY < lastY - 8;
        if (currentY < 100 || movingUp || document.body.classList.contains('menu-open')) siteNav.classList.remove('is-hidden');
        else if (movingDown && currentY > 160) siteNav.classList.add('is-hidden');
        lastY = currentY;
        ticking = false;
      });
    }, { passive: true });
  }

  document.querySelectorAll('[data-palette]').forEach((button) => {
    button.addEventListener('click', () => {
      const palette = button.dataset.palette;
      document.body.dataset.palette = palette === 'lavender' ? '' : palette;
      document.querySelectorAll('[data-palette]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
    });
  });

  document.querySelectorAll('[data-skill-search]').forEach((input) => {
    const cards = [...document.querySelectorAll('.skill-card')];
    input.addEventListener('input', () => {
      const query = input.value.trim().toLocaleLowerCase();
      cards.forEach((card) => {
        const matches = !query || card.textContent.toLocaleLowerCase().includes(query);
        card.hidden = !matches;
        if (query && matches) card.open = true;
      });
    });
  });

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    const cursor = document.createElement('span');
    const face = document.createElement('img');
    const stylesheet = document.querySelector('link[rel="stylesheet"]');
    const assetRoot = new URL('.', stylesheet.href);
    const closedFace = new URL('memes/cursor-cat-closed-transparent.png', assetRoot).href;
    const openFace = new URL('memes/cursor-cat-open-transparent.png', assetRoot).href;
    const clickableSelector = 'a,button,input,textarea,select,summary,[role="button"],[data-cursor-clickable]';
    let pointerOnClickable = false;
    let focusOnClickable = false;
    let currentMouthOpen = false;
    let lastX = 0;
    let lastY = 0;

    cursor.className = 'cursor-cat';
    cursor.setAttribute('aria-hidden', 'true');
    face.src = closedFace;
    face.alt = '';
    cursor.append(face);
    document.body.classList.add('has-custom-cursor');
    document.body.append(cursor);

    const updateMouth = () => {
      const open = pointerOnClickable || focusOnClickable;
      if (currentMouthOpen === open) return;
      currentMouthOpen = open;
      face.src = open ? openFace : closedFace;
      cursor.classList.toggle('is-open', open);
    };

    const syncPointerTarget = (target) => {
      pointerOnClickable = target instanceof Element && Boolean(target.closest(clickableSelector));
      updateMouth();
    };

    window.addEventListener('pointermove', (event) => {
      lastX = event.clientX;
      lastY = event.clientY;
      cursor.style.left = lastX + 'px';
      cursor.style.top = lastY + 'px';
      cursor.classList.add('is-visible');
      syncPointerTarget(event.target);
    }, { passive: true });
    window.addEventListener('scroll', () => {
      syncPointerTarget(document.elementFromPoint(lastX, lastY));
    }, { passive: true });
    document.addEventListener('focusin', (event) => {
      focusOnClickable = event.target instanceof Element && event.target.matches(clickableSelector);
      updateMouth();
    });
    document.addEventListener('focusout', (event) => {
      focusOnClickable = event.relatedTarget instanceof Element && event.relatedTarget.matches(clickableSelector);
      updateMouth();
    });
    window.addEventListener('blur', () => {
      pointerOnClickable = false;
      focusOnClickable = false;
      updateMouth();
    });
  }

  const form = document.querySelector('#contact-form');
  if (form) {
    const endpoint = window.PORTFOLIO_CONFIG?.appsScriptEndpoint?.trim();
    const submitButton = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');
    if (endpoint && submitButton && status) {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send message <span>↗</span>';
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!form.reportValidity() || form.dataset.sending === 'true') return;
        const payload = Object.fromEntries(new FormData(form));
        payload.submissionId = form.dataset.submissionId || (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
        form.dataset.submissionId = payload.submissionId;
        form.dataset.sending = 'true';
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
        status.textContent = 'Sending your message…';
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            redirect: 'follow',
          });
          if (!response.ok) throw new Error('The form service returned an error.');
          form.reset();
          delete form.dataset.submissionId;
          status.textContent = 'Your message was sent. Thank you!';
        } catch {
          status.textContent = 'We could not confirm delivery. Please email growwithzaid.gazi@gmail.com instead.';
        } finally {
          form.dataset.sending = 'false';
          submitButton.disabled = false;
          submitButton.innerHTML = 'Send message <span>↗</span>';
        }
      });
    }
  }
})();
