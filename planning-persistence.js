/* Local-only planning draft persistence and explicit, scoped undo/redo. */
(() => {
  'use strict';
  const KEY = 'sugrades-planning-draft-v1';
  const MAX_JSON = 50000, MAX_ASSESSMENTS = 50, MAX_COURSES = 25;
  const words = {
    tr: {
      title: 'Planını bu cihazda sakla',
      privacy: 'Hedef GPA, ders tekrarı, çekilme, final ve quiz alanları bu tarayıcıya otomatik kaydedilir; sınıf karşılaştırması ve harf planı kaydedilmez. Kayıt başka cihazlara aktarılmaz. Paylaşılan cihazda işin bitince silebilirsin.',
      undo: 'Geri al', redo: 'Yinele', clear: 'Kaydedilen planı sil',
      confirm: 'Bu cihazdaki kayıtlı planı ve kaydedilen hedef GPA, tekrar, çekilme, final ve quiz alanlarını silmek istiyor musun? Bu işlem geri alınamaz.',
      saved: 'Plan bu cihazda kaydedildi.', loaded: 'Bu cihazdaki kayıtlı plan geri yüklendi.', empty: 'Planlama alanları bu cihazda otomatik kaydedilir.',
      unavailable: 'Tarayıcı yerel depolamaya izin vermiyor. Plan yalnızca bu sayfa açıkken kullanılabilir.',
      bad: 'Kayıtlı plan okunamadı; verinin üzerine yazılmadı. Yeni kayıt için önce kayıtlı planı sil.',
      tooLarge: 'Plan kaydedilemedi: veri veya değerlendirme sayısı izin verilen sınırı aşıyor. Önceki kayıt korundu.',
      cleared: 'Kayıtlı plan ve kaydedilen alanlar silindi.'
    },
    en: {
      title: 'Keep your plan on this device',
      privacy: 'Target GPA, repeat, withdrawal, final and quiz fields are saved automatically in this browser; class comparisons are not saved. Data does not transfer to other devices. You can delete it when finished on a shared device.',
      undo: 'Undo', redo: 'Redo', clear: 'Delete saved plan',
      confirm: 'Delete this device’s saved plan and clear the saved target GPA, repeat, withdrawal, final and quiz fields? This cannot be undone.',
      saved: 'Plan saved on this device.', loaded: 'Saved plan restored from this device.', empty: 'Planning fields are saved automatically on this device.',
      unavailable: 'The browser does not allow local storage. Your plan is available only while this page is open.',
      bad: 'The saved plan could not be read and has not been overwritten. Delete the saved plan before saving a new one.',
      tooLarge: 'The plan could not be saved because the data or number of assessments exceeds the limit. The previous save was preserved.',
      cleared: 'The saved plan and saved fields have been deleted.'
    }
  };
  const isString = (v, max) => typeof v === 'string' && v.length <= max;
  const isNumberText = v => isString(v, 32) && (v === '' || /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(v)) && (v === '' || Number.isFinite(Number(v)));
  const vector = (v, n) => Array.isArray(v) && v.length === n && v.every(isNumberText);
  const pairs = (v, min, max) => Array.isArray(v) && v.length >= min && v.length <= max && v.every(x => vector(x, 2));
  function valid(s) {
    return !!s && s.version === 1 && !!s.academic && !!s.final &&
      vector(s.academic.target, 3) && pairs(s.academic.courses, 1, MAX_COURSES) &&
      vector(s.academic.repeat, 5) && vector(s.academic.withdrawal, 4) &&
      pairs(s.final.assessments, 0, MAX_ASSESSMENTS) && vector(s.final.final, 2) &&
      Array.isArray(s.final.quiz) && s.final.quiz.length === 2 &&
      isString(s.final.quiz[0], 4096) && isNumberText(s.final.quiz[1]);
  }
  const allValues = (node, selector = 'input') => Array.from(node.querySelectorAll(selector), x => x.value);
  const valuesInto = (node, values, selector = 'input') => {
    const fields = node.querySelectorAll(selector);
    if (fields.length !== values.length) throw new Error('Unexpected planning fields');
    fields.forEach((field, index) => { field.value = values[index]; });
  };
  function element(tag, cls, parent) {
    const node = document.createElement(tag);
    node.className = cls;
    if (parent) parent.appendChild(node);
    return node;
  }

  window.suPlanningPersistenceInit = function suPlanningPersistenceInit(root) {
    if (!root || root.dataset.planningPersistenceInitialized === 'true') return;
    const academic = root.querySelector('#academic-tools');
    const final = root.querySelector('#final-tools');
    if (!academic || !final) return;
    const sections = academic.querySelectorAll('.planning-section');
    const cards = final.querySelectorAll('.planning-card');
    const courses = academic.querySelector('.planning-courses');
    const assessments = final.querySelector('.planning-assessments');
    if (sections.length !== 3 || cards.length !== 2 || !courses || !assessments) return;
    const targetFields = sections[0].querySelector('.planning-fields');
    const repeatFields = sections[1].querySelector('.planning-fields');
    const withdrawalFields = sections[2].querySelector('.planning-fields');
    const finalFields = cards[0].querySelector(':scope > .planning-fields');
    const quizFields = cards[1].querySelector('.planning-fields');
    const addCourse = sections[0].querySelector('.planning-add');
    const addAssessment = cards[0].querySelector(':scope > .planning-add');
    if (!targetFields || !repeatFields || !withdrawalFields || !finalFields || !quizFields || !addCourse || !addAssessment) return;
    root.dataset.planningPersistenceInitialized = 'true';
    const lang = () => document.documentElement.lang === 'en' ? 'en' : 'tr';
    const t = key => words[lang()][key];
    const ui = element('section', 'planning-persistence');
    root.prepend(ui);
    const title = element('h3', '', ui), privacy = element('p', 'planning-hint', ui);
    const controls = element('div', 'planning-persistence-actions', ui);
    const undo = element('button', 'planning-undo', controls);
    const redo = element('button', 'planning-redo', controls);
    const clear = element('button', 'planning-clear', controls);
    [undo, redo, clear].forEach(button => { button.type = 'button'; });
    const status = element('p', 'planning-persistence-status', ui);
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    let statusKey = 'empty', locked = false, replaying = false;
    let history = [], position = -1, lastSerialized = '';
    function showStatus(key) { statusKey = key; status.textContent = t(key); }
    function labels() {
      title.textContent = t('title'); privacy.textContent = t('privacy');
      undo.textContent = t('undo'); redo.textContent = t('redo'); clear.textContent = t('clear');
      status.textContent = t(statusKey);
      undo.disabled = position <= 0;
      redo.disabled = position >= history.length - 1;
    }
    function snapshot() {
      return {
        version: 1,
        academic: {
          target: allValues(targetFields),
          courses: Array.from(courses.querySelectorAll('.planning-course'), x => allValues(x)),
          repeat: allValues(repeatFields), withdrawal: allValues(withdrawalFields)
        },
        final: {
          assessments: Array.from(assessments.querySelectorAll('.planning-assessment'), x => allValues(x)),
          final: allValues(finalFields), quiz: allValues(quizFields, 'textarea,input')
        }
      };
    }
    function resizeRows(list, selector, add, count) {
      let rows = list.querySelectorAll(selector);
      while (rows.length < count) {
        const before = rows.length;
        add.click();
        rows = list.querySelectorAll(selector);
        if (rows.length === before) throw new Error('Cannot add planning row');
      }
      while (rows.length > count) {
        const remove = rows[rows.length - 1].querySelector('.planning-remove');
        if (!remove) throw new Error('Cannot remove planning row');
        remove.click();
        rows = list.querySelectorAll(selector);
      }
    }
    function apply(data) {
      if (!valid(data)) throw new Error('Invalid planning record');
      replaying = true;
      try {
        resizeRows(courses, '.planning-course', addCourse, data.academic.courses.length);
        resizeRows(assessments, '.planning-assessment', addAssessment, data.final.assessments.length);
        valuesInto(targetFields, data.academic.target);
        courses.querySelectorAll('.planning-course').forEach((row, i) => valuesInto(row, data.academic.courses[i]));
        valuesInto(repeatFields, data.academic.repeat);
        valuesInto(withdrawalFields, data.academic.withdrawal);
        assessments.querySelectorAll('.planning-assessment').forEach((row, i) => valuesInto(row, data.final.assessments[i]));
        valuesInto(finalFields, data.final.final);
        valuesInto(quizFields, data.final.quiz, 'textarea,input');
        sections.forEach(section => section.querySelector('form').dispatchEvent(new Event('input', {bubbles: true})));
        final.dispatchEvent(new Event('input', {bubbles: true}));
      } finally { replaying = false; }
    }
    const initial = snapshot();
    if (!valid(initial)) { ui.remove(); delete root.dataset.planningPersistenceInitialized; return; }
    function serialize(s) {
      if (!valid(s)) return null;
      const json = JSON.stringify(s);
      return json.length <= MAX_JSON ? json : null;
    }
    function remember(s) {
      const json = serialize(s);
      if (json === null) { showStatus('tooLarge'); return false; }
      if (json === lastSerialized) return false;
      history = history.slice(0, position + 1);
      history.push(json);
      if (history.length > 60) history.shift();
      position = history.length - 1;
      lastSerialized = json;
      labels();
      return true;
    }
    function persist(s) {
      if (locked) { showStatus('bad'); return; }
      const json = serialize(s);
      if (json === null) { showStatus('tooLarge'); return; }
      try { localStorage.setItem(KEY, json); showStatus('saved'); }
      catch (_) { showStatus('unavailable'); }
    }
    let saved = null;
    try { saved = localStorage.getItem(KEY); }
    catch (_) { showStatus('unavailable'); }
    if (saved !== null) {
      try {
        if (saved.length > MAX_JSON) throw new Error('Invalid planning record');
        const parsed = JSON.parse(saved);
        if (!valid(parsed)) throw new Error('Invalid planning record');
        apply(parsed);
        showStatus('loaded');
      } catch (_) {
        // Keep an unreadable record intact until the user chooses to remove it.
        locked = true; showStatus('bad');
      }
    }
    remember(snapshot());
    function capture() {
      if (replaying) return;
      const s = snapshot();
      const json = serialize(s);
      if (json === null) { showStatus('tooLarge'); return; }
      if (json === lastSerialized) {
        if (statusKey === 'tooLarge') persist(s);
        return;
      }
      if (remember(s)) persist(s);
    }
    root.addEventListener('input', capture);
    root.addEventListener('change', capture);
    root.addEventListener('click', event => {
      if (replaying || ui.contains(event.target)) return;
      const button = event.target.closest('button');
      if (button && (button.classList.contains('planning-add') || button.classList.contains('planning-remove'))) capture();
    });
    function navigateHistory(delta) {
      const next = position + delta;
      if (next < 0 || next >= history.length) return;
      try {
        const state = JSON.parse(history[next]);
        apply(state); position = next; lastSerialized = history[next];
        persist(state); labels();
      } catch (_) { showStatus('bad'); }
    }
    undo.addEventListener('click', () => navigateHistory(-1));
    redo.addEventListener('click', () => navigateHistory(1));
    clear.addEventListener('click', () => {
      if (!window.confirm(t('confirm'))) return;
      try {
        localStorage.removeItem(KEY);
        apply(initial);
        locked = false; history = []; position = -1; lastSerialized = '';
        remember(snapshot()); showStatus('cleared'); labels();
      } catch (_) { showStatus('unavailable'); }
    });
    new MutationObserver(labels).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
    labels();
  };
})();
