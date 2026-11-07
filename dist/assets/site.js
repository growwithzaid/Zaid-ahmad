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

  // Oneko-style pixel companion, adapted from adryd325/oneko.js (MIT).
  // The supplied cat-face cursor remains an independent desktop interaction.
  const companion = document.createElement('div');
  const spriteSets = {
    idle: [[-3,-3]], alert: [[-7,-3]], scratchSelf: [[-5,0],[-6,0],[-7,0]],
    N:[[-1,-2],[-1,-3]], NE:[[0,-2],[0,-3]], E:[[-3,0],[-3,-1]],
    SE:[[-5,-1],[-5,-2]], S:[[-6,-3],[-7,-2]], SW:[[-5,-3],[-6,-1]],
    W:[[-4,-2],[-4,-3]], NW:[[-1,0],[-1,-1]], sleeping:[[-2,0],[-2,-1]], tired:[[-3,-2]]
  };
  const styleLink = document.querySelector('link[rel="stylesheet"]');
  const assetRoot = styleLink ? new URL('.', styleLink.href) : new URL('./assets/', location.href);
  const spriteUrl = new URL('oneko.gif', assetRoot).href;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchOnly = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  let x = Math.max(16, innerWidth - 38), y = Math.max(16, innerHeight - 38);
  let targetX = x, targetY = y, frame = 0, petFrames = 0, lastTime = 0;
  companion.className = 'oneko-companion';
  companion.setAttribute('role','button');
  companion.setAttribute('tabindex','0');
  companion.setAttribute('aria-label','Playful companion pet. Click to pet.');
  companion.title = 'Click to pet';
  companion.style.backgroundImage = `url("${spriteUrl}")`;
  document.body.append(companion);

  const setSprite = (name, index = 0) => {
    const [sx, sy] = spriteSets[name][index % spriteSets[name].length];
    companion.style.backgroundPosition = `${sx * 32}px ${sy * 32}px`;
  };
  let petResetTimer;
  const pet = () => {
    petFrames = 14;
    setSprite('scratchSelf');
    if (reducedMotion || touchOnly) {
      window.clearTimeout(petResetTimer);
      petResetTimer = window.setTimeout(() => setSprite('idle'), 850);
    }
  };
  companion.addEventListener('click', pet);
  companion.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pet(); }
  });
  document.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'touch') {
      targetX = event.clientX; targetY = event.clientY;
    }
  }, { passive: true });
  window.addEventListener('resize', () => {
    x = Math.min(Math.max(16, x), innerWidth - 16);
    y = Math.min(Math.max(16, y), innerHeight - 16);
    targetX = Math.min(Math.max(16, targetX), innerWidth - 16);
    targetY = Math.min(Math.max(16, targetY), innerHeight - 16);
  });
  const animate = (time) => {
    if (time - lastTime > 115) {
      lastTime = time;
      frame++;
      if (petFrames > 0) {
        petFrames--;
        setSprite('scratchSelf', Math.floor(frame / 2));
      } else if (!reducedMotion && !touchOnly) {
        const dx = x - targetX, dy = y - targetY, distance = Math.hypot(dx,dy);
        if (distance > 56) {
          const dir = (dy / distance > .5 ? 'N' : '') + (dy / distance < -.5 ? 'S' : '') + (dx / distance > .5 ? 'W' : '') + (dx / distance < -.5 ? 'E' : '');
          setSprite(dir || 'idle', Math.floor(frame / 2));
          x -= dx / distance * Math.min(7, distance - 48);
          y -= dy / distance * Math.min(7, distance - 48);
        } else setSprite('idle');
      } else setSprite('idle');
      companion.style.left = `${Math.max(0, Math.min(innerWidth - 32, x - 16))}px`;
      companion.style.top = `${Math.max(0, Math.min(innerHeight - 32, y - 16))}px`;
    }
    if (!reducedMotion && !touchOnly) requestAnimationFrame(animate);
  };
  setSprite('idle');
  companion.style.left = `${x - 16}px`;
  companion.style.top = `${y - 16}px`;
  if (!reducedMotion && !touchOnly) requestAnimationFrame(animate);
})();
