(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('#mobile-panel');
  const siteNav = document.querySelector('#site-nav');

  const closeMenu = (restoreFocus = false) => {
    if (!menuButton || !mobilePanel) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    mobilePanel.hidden = true;
    document.body.classList.remove('menu-open');
    document.querySelectorAll('#main, .site-footer').forEach((item) => { item.inert = false; });
    if (restoreFocus) menuButton.focus();
  };

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      mobilePanel.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      document.querySelectorAll('#main, .site-footer').forEach((item) => { item.inert = open; });
      if (open) mobilePanel.querySelector('a')?.focus();
    });
    mobilePanel.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    mobilePanel.addEventListener('keydown', (event) => {
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
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
  }

  const catButton = document.querySelector('.floating-cat');
  const catTip = document.querySelector('#cat-tip');
  if (catButton && catTip) {
    const toggleCatTip = (open) => {
      catButton.setAttribute('aria-expanded', String(open));
      catTip.classList.toggle('show', open);
    };
    catButton.addEventListener('click', () => {
      toggleCatTip(catButton.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('pointerdown', (event) => {
      if (!event.target.closest('.floating-cat, .cat-tip')) toggleCatTip(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') toggleCatTip(false);
    });
  }

  const primaryLinks = [...document.querySelectorAll('.nav a')];
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  primaryLinks.forEach((link) => {
    const target = new URL(link.href, window.location.href);
    const targetPath = target.pathname.replace(/\/$/, '') || '/';
    if (targetPath !== '/' && targetPath === currentPath) link.setAttribute('aria-current', 'true');
  });
  const isHomePage = !currentPath.endsWith('/development') && !currentPath.endsWith('/seo');
  if (isHomePage && 'IntersectionObserver' in window) {
    const sectionLinks = primaryLinks.filter((link) => link.hash && document.querySelector(link.hash));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        primaryLinks.forEach((link) => link.removeAttribute('aria-current'));
        const active = sectionLinks.find((link) => link.hash === `#${entry.target.id}`);
        active?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-20% 0px -65% 0px' });
    sectionLinks.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section) sectionObserver.observe(section);
    });
  }

  document.querySelectorAll('[data-year]').forEach((item) => {
    item.textContent = String(new Date().getFullYear());
  });

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
    const updateNav = () => {
      const currentY = window.scrollY;
      const movingDown = currentY > lastY + 8;
      const movingUp = currentY < lastY - 8;
      if (currentY < 100 || movingUp) siteNav.classList.remove('is-hidden');
      else if (movingDown && currentY > 160 && !document.body.classList.contains('menu-open')) siteNav.classList.add('is-hidden');
      lastY = currentY;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateNav);
    }, { passive: true });
  }

  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    const dot = document.createElement('span');
    const ring = document.createElement('span');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.classList.add('has-custom-cursor');
    document.body.append(dot, ring);
    let x = -50;
    let y = -50;
    let ringX = -50;
    let ringY = -50;
    window.addEventListener('pointermove', (event) => {
      x = event.clientX;
      y = event.clientY;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
    }, { passive: true });
    const animateRing = () => {
      ringX += (x - ringX) * 0.18;
      ringY += (y - ringY) * 0.18;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);
    document.querySelectorAll('a, button, input, textarea').forEach((item) => {
      item.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
      item.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
    });
  }

  const form = document.querySelector('#contact-form');
  if (form) {
    const endpoint = window.PORTFOLIO_CONFIG?.appsScriptEndpoint?.trim();
    const submitButton = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');
    if (endpoint && submitButton && status) {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send enquiry <span>↗</span>';
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
          if (!response.ok) throw new Error('The service returned an error.');
          form.reset();
          delete form.dataset.submissionId;
          status.textContent = 'Your message was sent. Thank you!';
        } catch {
          status.textContent = 'We could not confirm delivery. Please email growwithzaid.gazi@gmail.com instead.';
        } finally {
          form.dataset.sending = 'false';
          submitButton.disabled = false;
          submitButton.innerHTML = 'Send enquiry <span>↗</span>';
        }
      });
    }
  }
})();
