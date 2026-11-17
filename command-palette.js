/* Accessible quick commands for the existing hash-routed application. */
(() => {
  'use strict';

  const dialog = document.createElement('dialog');
  dialog.className = 'command-dialog';
  dialog.setAttribute('aria-labelledby', 'command-title');
  const head = document.createElement('div');
  head.className = 'command-head';
  const title = document.createElement('h2');
  title.id = 'command-title';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'command-close';
  close.textContent = '×';
  head.append(title, close);
  const input = document.createElement('input');
  input.className = 'command-search';
  input.type = 'search';
  input.autocomplete = 'off';
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'true');
  input.setAttribute('aria-controls', 'command-results');
  const results = document.createElement('div');
  results.id = 'command-results';
  results.className = 'command-results';
  results.setAttribute('role', 'listbox');
  const empty = document.createElement('p');
  empty.className = 'command-empty';
  empty.setAttribute('role', 'status');
  const hint = document.createElement('p');
  hint.className = 'command-hint';
  dialog.append(head, input, results, empty, hint);
  document.body.append(dialog);

  // An ordinary menu item makes the palette discoverable and usable on touch devices.
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = 'commandToggle';
  trigger.className = 'command-trigger';
  const menu = document.querySelector('#menuPanel');
  const firstPreference = menu && menu.querySelector('.menu-heading-settings');
  if (menu) menu.insertBefore(trigger, firstPreference || null);

  const commands = [
    { tr: 'Ana sayfa', en: 'Home', terms: 'home ana sayfa', hash: '#/' },
    { tr: 'Ders notu', en: 'Course grade', terms: 'ders course grade not', hash: '#/course' },
    { tr: 'GPA hesapla', en: 'Calculate GPA', terms: 'gpa ortalama average', hash: '#/gpa' },
    { tr: 'Mezuniyet ortalaması', en: 'Graduation average', terms: 'mezuniyet diploma graduation', hash: '#/diploma' },
    { tr: 'Akademik planlama', en: 'Academic planning', terms: 'plan hedef target cgpa planning', hash: '#/planning' },
    { tr: 'Açık / koyu tema', en: 'Switch light / dark theme', terms: 'theme tema gorunum dark light koyu acik', control: 'themeToggle' },
    { tr: 'Dili değiştir', en: 'Change language', terms: 'dil language english turkce ingilizce', control: 'languageToggle' }
  ];
  let visible = [];
  let selected = 0;
  let restoreFocus = null;
  const english = () => document.documentElement.lang === 'en';
  const label = (tr, en) => english() ? en : tr;
  const normal = value => value.replace(/[ıİ]/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function select(index) {
    if (!visible.length) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    selected = (index + visible.length) % visible.length;
    Array.from(results.children).forEach((option, i) => option.setAttribute('aria-selected', String(i === selected)));
    const active = results.children[selected];
    input.setAttribute('aria-activedescendant', active.id);
    if (dialog.open && typeof active.scrollIntoView === 'function') active.scrollIntoView({ block: 'nearest' });
  }
  function run(command) {
    if (!command) return;
    dialog.close();
    if (command.hash) {
      location.hash = command.hash;
    } else {
      const control = document.getElementById(command.control);
      if (control) control.click();
    }
  }
  function render() {
    const query = normal(input.value.trim());
    visible = commands.filter(command => normal(`${command.tr} ${command.en} ${command.terms}`).includes(query));
    selected = 0;
    results.replaceChildren();
    visible.forEach((command, index) => {
      const option = document.createElement('div');
      option.id = `command-option-${index}`;
      option.className = 'command-option';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      option.textContent = label(command.tr, command.en);
      option.addEventListener('click', () => run(command));
      option.addEventListener('pointermove', () => { if (selected !== index) select(index); });
      results.append(option);
    });
    empty.hidden = visible.length > 0;
    empty.textContent = label('Komut bulunamadı.', 'No commands found.');
    select(0);
  }
  function localize() {
    title.textContent = label('Hızlı komutlar', 'Quick commands');
    trigger.textContent = label('Hızlı komutlar', 'Quick commands');
    close.setAttribute('aria-label', label('Kapat', 'Close'));
    input.placeholder = label('Sayfa veya işlem ara…', 'Search pages or actions…');
    input.setAttribute('aria-label', label('Komut ara', 'Search commands'));
    hint.textContent = label('↑ ↓ ile seç · Enter ile aç · Esc ile kapat', 'Use ↑ ↓ to select · Enter to open · Esc to close');
    render();
  }
  function open() {
    if (dialog.open) {
      input.focus();
      return;
    }
    restoreFocus = menu && menu.contains(document.activeElement)
      ? document.getElementById('menuToggle') : document.activeElement;
    input.value = '';
    localize();
    // Close the navigation first so its focus and Escape handling do not conflict.
    const menuToggle = document.getElementById('menuToggle');
    if (menu && !menu.hidden && menuToggle) menuToggle.click();
    dialog.showModal();
    input.focus();
  }
  trigger.addEventListener('click', open);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (restoreFocus && restoreFocus.isConnected && typeof restoreFocus.focus === 'function') restoreFocus.focus();
    restoreFocus = null;
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  input.addEventListener('input', render);
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); select(selected + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); select(selected - 1); }
    else if (event.key === 'Enter' && visible.length) { event.preventDefault(); run(visible[selected]); }
  });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    }
  });
  new MutationObserver(localize).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  localize();
})();
