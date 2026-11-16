/* Shareable views within one application: keep calculations intact while navigating. */
(() => {
  'use strict';
  const pages = ['home', 'course', 'gpa', 'diploma'];
  const menu = document.querySelector('#menuPanel');
  const toggle = document.querySelector('#menuToggle');
  const menuButtons = pages.map(page => document.querySelector('#tab-' + page));
  const wrap = document.querySelector('.menu-wrap');
  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
  let currentPage = null;
  let closeTimer;
  let hoverOpened = false;
  let suppressHover = false;
  function openMenu(fromHover = false) {
    clearTimeout(closeTimer);
    if (menu.hidden) hoverOpened = fromHover;
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closeMenu(returnFocus = false) {
    clearTimeout(closeTimer);
    menu.hidden = true;
    hoverOpened = false;
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }
  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (!wrap.contains(document.activeElement) && !(hoverCapable.matches && wrap.matches(':hover'))) closeMenu();
    }, 220);
  }
  wrap.addEventListener('pointerenter', event => {
    if (hoverCapable.matches && event.pointerType === 'mouse') {
      clearTimeout(closeTimer);
      if (!suppressHover) openMenu(true);
    }
  });
  wrap.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') {
      suppressHover = false;
      scheduleClose();
    }
  });
  wrap.addEventListener('focusout', event => {
    if (!wrap.contains(event.relatedTarget)) scheduleClose();
  });
  function pageFromHash() {
    const part = location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
    return pages.includes(part) ? part : 'home';
  }
  function showPage(page) {
    const changed = page !== currentPage;
    currentPage = page;
    pages.forEach(id => {
      document.getElementById(id).classList.toggle('hidden', id !== page);
      const heading = document.getElementById('heading-' + id);
      if (heading) heading.classList.toggle('hidden', id !== page);
      const button = document.getElementById('tab-' + id);
      button.classList.toggle('active', id === page);
      if (id === page) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    closeMenu();
    if (changed) {
      window.scrollTo(0, 0);
      window.dispatchEvent(new CustomEvent('su:navigate', {detail: {page}}));
    }
  }
  function navigate(page) {
    const hash = page === 'home' ? '#/' : '#/' + page;
    if (location.hash === hash) showPage(page);
    else location.hash = hash;
  }
  menuButtons.forEach((button, i) => button.addEventListener('click', () => navigate(pages[i])));
  toggle.addEventListener('click', event => {
    if (menu.hidden) openMenu();
    else if (hoverOpened && event.detail > 0) hoverOpened = false;
    else { suppressHover = hoverCapable.matches && wrap.matches(':hover'); closeMenu(); }
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.menu-wrap')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { suppressHover = hoverCapable.matches && wrap.matches(':hover'); closeMenu(true); event.preventDefault(); }
  });
  document.querySelector('#openReport').addEventListener('click', () => closeMenu());
  window.addEventListener('hashchange', () => showPage(pageFromHash()));
  showPage(pageFromHash());
})();
