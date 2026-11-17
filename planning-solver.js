/* Exact discrete grade combination solver for new-course planning. */
(() => {
  'use strict';
  const grades = [
    ['A', 40], ['A−', 37], ['B+', 33], ['B', 30], ['B−', 27],
    ['C+', 23], ['C', 20], ['C−', 17], ['D+', 13], ['D', 10], ['F', 0]
  ];
  const strings = {
    tr: {
      title: 'Hedef GPA için harf planı',
      intro: 'Mevcut genel GPA’nı, hedefini ve bu dönem alacağın yeni dersleri gir. İstersen her ders için tercih ettiğin harfi seç; hesaplayıcı tercihlerinle arasındaki sayısal farkları en aza indiren bir kombinasyon arar.',
      note: 'Yalnızca yeni, GPA’ya dahil dersler varsayılır. Tekrar veya ders saydırma hesaba katılmaz. Krediler 0,5 adımla girilir (ders başına en fazla 10); en çok 8 ders eklenebilir. Sonuç tahmindir; yuvarlanmış mevcut GPA küçük farklar yaratabilir ve harflerin alınabilirliğini garanti etmez. Tercih girilmezse hedefi en az aşan planlardan biri gösterilir.',
      current: 'Mevcut genel GPA (0–4, en fazla iki ondalık)', past: 'Tamamlanmış GPA kredisi (0–1000, 0,5 adımla)', goal: 'Hedef genel GPA (0–4, en fazla iki ondalık)',
      course: 'Ders', name: 'Ders adı (isteğe bağlı)', credit: 'SÜ kredisi (0,5–10)', preferred: 'Tercih edilen harf (isteğe bağlı)', none: 'Tercihim yok',
      add: '+ Ders ekle', remove: 'Dersi kaldır', solve: 'Harf planını hesapla',
      enter: 'Harf planını görmek için alanları doldur ve hesapla.', invalid: 'GPA’lar 0–4 arasında ve en fazla iki ondalıklı olmalı; tamamlanmış kredi 0–1000 arasında ve 0,5 adımlı olmalı. Önceki kredin varsa mevcut GPA’nı gir.', invalidCourse: 'Her dersin kredisi 0,5–10 arasında ve 0,5 adımlı olmalı.',
      impossible: 'Bu hedefe girilen yeni derslerle tümünden A alınsa bile ulaşılamıyor.', found: 'Hedefe ulaşan bir harf planı', projected: 'Bu plana göre tahmini genel GPA', semester: 'Bu plana göre tahmini dönem GPA’sı',
      warning: 'Bu plan yalnızca matematiksel bir senaryodur. Resmî GPA, ders tekrarı, çan eğrisi ve gerçek notlandırma koşulları ayrıca kontrol edilmelidir.',
      preference: 'Tercihlerden toplam kareli katsayı farkı', changed: 'Girdiler değişti; güncel plan için yeniden hesapla.'
    },
    en: {
      title: 'Letter-grade plan for your target GPA',
      intro: 'Enter your current cumulative GPA, target and new courses for this semester. Optionally choose a preferred grade per course; the calculator looks for a combination that minimizes squared numerical differences from your preferences.',
      note: 'Only new, GPA-included courses are assumed. Repeats and substitutions are excluded. Credits use 0.5 increments (maximum 10 per course); add up to 8 courses. This is an estimate: a rounded current GPA can cause small differences, and the grades are not guaranteed. Without preferences, a plan that exceeds the target by the smallest amount is shown.',
      current: 'Current cumulative GPA (0–4, at most two decimals)', past: 'Completed GPA credits (0–1000, in 0.5 increments)', goal: 'Target cumulative GPA (0–4, at most two decimals)',
      course: 'Course', name: 'Course name (optional)', credit: 'SU credits (0.5–10)', preferred: 'Preferred grade (optional)', none: 'No preference',
      add: '+ Add course', remove: 'Remove course', solve: 'Calculate grade plan',
      enter: 'Complete the fields and calculate your grade plan.', invalid: 'GPAs must be 0–4 with at most two decimals; completed credits must be 0–1000 in 0.5 increments. Enter your current GPA if you have prior credits.', invalidCourse: 'Each course must have 0.5–10 credits in 0.5 increments.',
      impossible: 'This target cannot be reached with these new courses even with an A in every course.', found: 'One grade plan that reaches your target', projected: 'Estimated cumulative GPA with this plan', semester: 'Estimated semester GPA with this plan',
      warning: 'This is a mathematical scenario only. Check your official GPA, repeats, grading curves and actual course grading policies separately.',
      preference: 'Total squared deviation from preferred grade points', changed: 'Inputs changed; calculate again for an updated plan.'
    }
  };
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'tr';
  const t = key => strings[lang()][key];
  function el(tag, cls, parent) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (parent) parent.appendChild(node);
    return node;
  }
  function hundredths(raw) {
    if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(raw)) return null;
    const parts = raw.split('.');
    const n = Number(parts[0] || '0') * 100 + Number(((parts[1] || '') + '00').slice(0, 2));
    return Number.isSafeInteger(n) && n >= 0 && n <= 400 ? n : null;
  }
  function halves(raw, min, max) {
    if (raw.trim() === '') return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < min || value > max || !Number.isInteger(value * 2)) return null;
    return value * 2;
  }
  function numberFormat(value) {
    return value.toLocaleString(lang() === 'en' ? 'en-US' : 'tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
  function solve(pastHundred, pastHalf, targetHundred, courses) {
    const totalNewHalf = courses.reduce((sum, course) => sum + course.half, 0);
    // Each grade-point sum is stored in tenths times half-credit units.
    const required = Math.ceil((targetHundred * (pastHalf + totalNewHalf) - pastHundred * pastHalf) / 10);
    const max = totalNewHalf * 40;
    if (required > max) return null;
    let states = new Map([[0, {cost: 0, previous: null, grade: null}]]);
    for (const course of courses) {
      const next = new Map();
      for (const [sum, state] of states) {
        grades.forEach(([letter, grade]) => {
          const total = sum + course.half * grade;
          const delta = course.preference === null ? 0 : grade - course.preference;
          const cost = state.cost + delta * delta;
          const old = next.get(total);
          if (!old || cost < old.cost) next.set(total, {cost, previous: state, grade: {letter, grade}});
        });
      }
      states = next;
    }
    let best = null, bestSum = 0;
    for (const [sum, state] of states) {
      if (sum < required) continue;
      if (!best || state.cost < best.cost || (state.cost === best.cost && sum < bestSum)) { best = state; bestSum = sum; }
    }
    if (!best) return null;
    const chosen = [];
    for (let state = best; state && state.grade; state = state.previous) chosen.push(state.grade);
    chosen.reverse();
    return {
      chosen, cost: best.cost, sum: bestSum, totalNewHalf,
      cumulative: (pastHundred * pastHalf + bestSum * 10) / ((pastHalf + totalNewHalf) * 100),
      semester: bestSum / (totalNewHalf * 10)
    };
  }
  window.suSolverInit = function suSolverInit(root) {
    if (!root || root.dataset.solverInitialized === 'true') return;
    root.dataset.solverInitialized = 'true';
    const bindings = [];
    function text(parent, tag, cls, key) {
      const node = el(tag, cls, parent); node.textContent = t(key); bindings.push([node, key]); return node;
    }
    function field(parent, key, type, min, max, step) {
      const label = el('label', 'planning-field', parent);
      text(label, 'span', '', key);
      const input = el('input', '', label);
      input.type = type;
      input.autocomplete = 'off';
      if (type === 'number') { input.min = String(min); input.max = String(max); input.step = String(step); input.inputMode = 'decimal'; }
      else input.maxLength = 80;
      return input;
    }
    const card = el('section', 'planning-section planning-solver', root);
    text(card, 'h2', '', 'title');
    text(card, 'p', 'planning-hint', 'intro');
    text(card, 'p', 'planning-hint', 'note');
    const form = el('form', 'planning-form', card); form.noValidate = true;
    const fields = el('div', 'planning-fields', form);
    const current = field(fields, 'current', 'number', 0, 4, .01);
    const past = field(fields, 'past', 'number', 0, 1000, .5);
    const goal = field(fields, 'goal', 'number', 0, 4, .01);
    const rowList = el('div', 'planning-solver-courses', form);
    const add = text(form, 'button', 'planning-solver-add', 'add'); add.type = 'button';
    const submit = text(form, 'button', 'planning-solver-submit', 'solve'); submit.type = 'submit';
    const result = el('div', 'planning-result planning-solver-result', card);
    result.setAttribute('aria-live', 'polite'); result.setAttribute('aria-atomic', 'true');
    const rows = [];
    let state = {kind: 'enter'};
    function updateLabels() {
      bindings.forEach(([node, key]) => { node.textContent = t(key); });
      rows.forEach((row, index) => {
        row.legend.textContent = t('course') + ' ' + (index + 1);
        row.none.textContent = t('none');
        row.remove.setAttribute('aria-label', t('remove') + ' ' + (index + 1));
        row.remove.disabled = rows.length === 1;
      });
      add.disabled = rows.length === 8;
    }
    function clearResult(kind) { state = {kind}; render(); }
    function addRow() {
      if (rows.length >= 8) return;
      const row = el('fieldset', 'planning-solver-course', rowList);
      const legend = el('legend', '', row);
      const name = field(row, 'name', 'text');
      const credit = field(row, 'credit', 'number', .5, 10, .5);
      const prefLabel = el('label', 'planning-field', row);
      text(prefLabel, 'span', '', 'preferred');
      const select = el('select', '', prefLabel);
      const none = el('option', '', select); none.value = '';
      grades.forEach(([letter, points]) => { const option = el('option', '', select); option.value = String(points); option.textContent = letter + ' (' + (points / 10).toFixed(1) + ')'; });
      const remove = text(row, 'button', 'planning-solver-remove', 'remove'); remove.type = 'button';
      const record = {row, legend, name, credit, select, none, remove}; rows.push(record);
      remove.addEventListener('click', () => {
        if (rows.length <= 1) return;
        rows.splice(rows.indexOf(record), 1);
        for (let i = bindings.length - 1; i >= 0; i--) if (row.contains(bindings[i][0])) bindings.splice(i, 1);
        row.remove(); updateLabels(); clearResult('changed');
      });
      updateLabels();
    }
    function render() {
      result.replaceChildren();
      if (state.kind !== 'found') { const p = el('p', '', result); p.textContent = t(state.kind); return; }
      textResult('found');
      const list = el('ul', 'planning-solver-list', result);
      state.solution.chosen.forEach((grade, i) => {
        const item = el('li', '', list);
        item.textContent = (state.names[i] || t('course') + ' ' + (i + 1)) + ': ' + grade.letter;
      });
      line('semester', numberFormat(state.solution.semester));
      line('projected', numberFormat(state.solution.cumulative));
      if (state.hasPreferences) line('preference', numberFormat(state.solution.cost / 100));
      textResult('warning');
    }
    function textResult(key) { const p = el('p', '', result); p.textContent = t(key); }
    function line(key, value) { const p = el('p', '', result); p.textContent = t(key) + ': ' + value; }
    add.addEventListener('click', () => { addRow(); clearResult('changed'); });
    form.addEventListener('input', () => clearResult('changed'));
    form.addEventListener('change', () => clearResult('changed'));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const pastHalf = halves(past.value, 0, 1000);
      const currentGpa = current.value.trim() === '' && pastHalf === 0 ? 0 : hundredths(current.value.trim());
      const goalGpa = hundredths(goal.value.trim());
      if (pastHalf === null || currentGpa === null || goalGpa === null) { clearResult('invalid'); return; }
      const data = rows.map(row => ({
        half: halves(row.credit.value, .5, 10),
        preference: row.select.value === '' ? null : Number(row.select.value)
      }));
      if (data.some(row => row.half === null || (row.preference !== null && !grades.some(grade => grade[1] === row.preference)))) { clearResult('invalidCourse'); return; }
      const solution = solve(currentGpa, pastHalf, goalGpa, data);
      if (!solution) { clearResult('impossible'); return; }
      state = {kind: 'found', solution, names: rows.map(row => row.name.value.trim()), hasPreferences: data.some(row => row.preference !== null)};
      render();
    });
    addRow(); updateLabels(); render();
    new MutationObserver(() => { updateLabels(); render(); }).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  };
  const root = document.getElementById('solver-tools');
  if (root) window.suSolverInit(root);
})();
