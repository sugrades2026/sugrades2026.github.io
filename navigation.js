/* Shareable views within one application: keep calculations intact while navigating. */
(() => {
  'use strict';
  const pages = ['home', 'course', 'gpa', 'diploma'];
  const menu = document.querySelector('#menuPanel');
  const toggle = document.querySelector('#menuToggle');
  const menuButtons = pages.map(page => document.querySelector('#tab-' + page));
  let currentPage = null;
  function closeMenu(returnFocus = false) {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }
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
  toggle.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.menu-wrap')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(true); event.preventDefault(); }
  });
  document.querySelector('#openReport').addEventListener('click', () => closeMenu());
  window.addEventListener('hashchange', () => showPage(pageFromHash()));
  showPage(pageFromHash());
})();
