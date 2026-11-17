/* Local, user-supplied final-grade and quiz-average planning tools. */
(() => {
  'use strict';
  const messages = {
    tr: {
      finalTitle: 'Hedef not için final hesabı', finalIntro: 'Tamamlanan değerlendirmeleri ve ağırlıklarını gir. Boş notlar sıfır sayılmaz.', component: 'Tamamlanan değerlendirme', score: 'Not (0–100)', weight: 'Ağırlık (%)', remove: 'Kaldır', add: '+ Değerlendirme ekle', finalWeight: 'Final ağırlığı (%)', target: 'Hedef ders notu (0–100)', finalHint: 'Final ve diğer değerlendirmelerin ağırlıkları toplamı %100 olmalı.', missing: 'Hesaplamak için tüm not ve ağırlıkları doldur.', range: 'Notlar ve ağırlıklar 0 ile 100 arasında olmalı; final ağırlığı sıfırdan büyük olmalı.', total: 'Ağırlıkların toplamı %100 olmalı. Şu an: %', needed: 'Hedef için gereken final notu: ', impossible: 'Bu hedefe finalden 100 alarak ulaşılamıyor. Gereken not: ', achieved: 'Hedefe mevcut notlarınla ulaştın. Gereken final notu: 0', quizTitle: 'Quiz ortalaması', quizIntro: 'Quizler eşit ağırlıklı kabul edilir. Notları virgül, noktalı virgül veya yeni satırla ayır; ondalıklarda nokta kullan.', quizLabel: 'Quiz notları', dropLabel: 'Düşürülecek en düşük not sayısı', quizEmpty: 'Ortalama için en az bir quiz notu gir.', quizInvalid: 'Her quiz notu 0 ile 100 arasında bir sayı olmalı.', dropInvalid: 'Düşürülecek sayı sıfır veya daha büyük bir tam sayı olmalı ve tüm notları düşürmemeli.', quizResult: 'Hesaplanan ortalama: ', kept: 'Dahil edilen not sayısı: ', placeholder: 'Örn. 80, 65, 90, 75'
    },
    en: {
      finalTitle: 'Final exam target', finalIntro: 'Enter completed assessments and their weights. Empty scores are not treated as zero.', component: 'Completed assessment', score: 'Score (0–100)', weight: 'Weight (%)', remove: 'Remove', add: '+ Add assessment', finalWeight: 'Final exam weight (%)', target: 'Target course score (0–100)', finalHint: 'The final and other assessment weights must add up to 100%.', missing: 'Complete every score and weight to calculate.', range: 'Scores and weights must be between 0 and 100; final weight must be greater than zero.', total: 'Weights must add up to 100%. Current total: ', needed: 'Final exam score needed: ', impossible: 'This target cannot be reached even with a final score of 100. Required score: ', achieved: 'You have already reached the target. Final score needed: 0', quizTitle: 'Quiz average', quizIntro: 'Scores are weighted equally. Separate them with commas, semicolons or new lines; use a dot for decimals.', quizLabel: 'Quiz scores', dropLabel: 'Number of lowest scores to drop', quizEmpty: 'Enter at least one quiz score to calculate the average.', quizInvalid: 'Every quiz score must be a number between 0 and 100.', dropInvalid: 'The number to drop must be a non-negative whole number and cannot remove all scores.', quizResult: 'Calculated average: ', kept: 'Scores included: ', placeholder: 'E.g. 80, 65, 90, 75'
    }
  };
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'tr';
  const number = value => {
    const s = value.trim();
    if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s)) return NaN;
    return Number(s.replace(',', '.'));
  };
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function field(parent, labelKey, type = 'number') {
    const label = el('label', 'planning-label');
    const caption = el('span', 'planning-caption');
    const input = el(type === 'textarea' ? 'textarea' : 'input', 'planning-input');
    if (type !== 'textarea') { input.type = type; input.min = '0'; input.max = '100'; input.step = 'any'; input.inputMode = 'decimal'; }
    label.append(caption, input); parent.append(label);
    return {label, caption, input, key: labelKey};
  }
  window.suFinalInit = function init(root) {
    if (!root || root.dataset.suFinalInitialized === 'true') return;
    root.dataset.suFinalInitialized = 'true';
    root.classList.add('planning-final');
    const finalSection = el('section', 'planning-card');
    const title = el('h2', 'planning-title'), intro = el('p', 'planning-description');
    const rows = el('div', 'planning-assessments');
    const addButton = el('button', 'planning-add'); addButton.type = 'button';
    const finalFields = el('div', 'planning-fields');
    const finalWeight = field(finalFields, 'finalWeight');
    const target = field(finalFields, 'target');
    const hint = el('p', 'planning-hint');
    const finalResult = el('p', 'planning-result'); finalResult.setAttribute('role', 'status'); finalResult.setAttribute('aria-live', 'polite');
    finalSection.append(title, intro, rows, addButton, finalFields, hint, finalResult);
    const quizSection = el('section', 'planning-card');
    const quizTitle = el('h2', 'planning-title'), quizIntro = el('p', 'planning-description');
    const quizFields = el('div', 'planning-fields');
    const quizScores = field(quizFields, 'quizLabel', 'textarea'); quizScores.input.rows = 3;
    const drop = field(quizFields, 'dropLabel'); drop.input.step = '1'; drop.input.max = ''; drop.input.value = '0'; drop.input.inputMode = 'numeric';
    const quizResult = el('p', 'planning-result'); quizResult.setAttribute('role', 'status'); quizResult.setAttribute('aria-live', 'polite');
    quizSection.append(quizTitle, quizIntro, quizFields, quizResult);
    root.append(finalSection, quizSection);
    const assessments = [];
    function addAssessment() {
      const group = el('div', 'planning-assessment');
      const heading = el('strong', 'planning-assessment-title');
      const fields = el('div', 'planning-fields');
      const score = field(fields, 'score'), weight = field(fields, 'weight');
      const remove = el('button', 'planning-remove'); remove.type = 'button';
      const record = {group, heading, score, weight, remove}; assessments.push(record);
      remove.addEventListener('click', () => {
        const index = assessments.indexOf(record);
        if (index !== -1) assessments.splice(index, 1);
        group.remove(); translate(); renderFinal();
      });
      group.append(heading, fields, remove); rows.append(group); translate();
    }
    function renderFinal() {
      const t = messages[lang()];
      const values = [finalWeight.input.value, target.input.value, ...assessments.flatMap(x => [x.score.input.value, x.weight.input.value])];
      if (values.some(v => !v.trim())) { finalResult.textContent = t.missing; return; }
      const finalPercent = number(values[0]), targetValue = number(values[1]);
      const parsed = assessments.map(x => ({score:number(x.score.input.value), weight:number(x.weight.input.value)}));
      if (![finalPercent, targetValue, ...parsed.flatMap(x => [x.score, x.weight])].every(n => Number.isFinite(n) && n >= 0 && n <= 100) || finalPercent <= 0) { finalResult.textContent = t.range; return; }
      const total = finalPercent + parsed.reduce((sum, item) => sum + item.weight, 0);
      if (Math.abs(total - 100) > 0.00001) { finalResult.textContent = t.total + total.toFixed(2) + (lang() === 'en' ? '%' : ''); return; }
      const achieved = parsed.reduce((sum, item) => sum + item.score * item.weight / 100, 0);
      const needed = (targetValue - achieved) * 100 / finalPercent;
      finalResult.textContent = needed <= 0 ? t.achieved : (needed > 100 + 1e-9 ? t.impossible : t.needed) + needed.toFixed(2) + ' / 100';
    }
    function renderQuiz() {
      const t = messages[lang()], raw = quizScores.input.value.trim();
      if (!raw) { quizResult.textContent = t.quizEmpty; return; }
      const tokens = raw.split(/[,;\n]/).map(x => x.trim());
      const scores = tokens.map(s => /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) ? Number(s) : NaN);
      if (scores.some(n => !Number.isFinite(n) || n < 0 || n > 100)) { quizResult.textContent = t.quizInvalid; return; }
      const count = number(drop.input.value);
      if (!Number.isInteger(count) || count < 0 || count >= scores.length) { quizResult.textContent = t.dropInvalid; return; }
      const kept = scores.sort((a,b) => a-b).slice(count);
      const average = kept.reduce((sum, n) => sum+n, 0) / kept.length;
      quizResult.textContent = t.quizResult + average.toFixed(2) + ' / 100 · ' + t.kept + kept.length;
    }
    function translate() {
      const t = messages[lang()];
      title.textContent=t.finalTitle; intro.textContent=t.finalIntro; addButton.textContent=t.add; hint.textContent=t.finalHint;
      quizTitle.textContent=t.quizTitle; quizIntro.textContent=t.quizIntro;
      [finalWeight,target,quizScores,drop].forEach(x => { x.caption.textContent=t[x.key]; });
      quizScores.input.placeholder=t.placeholder;
      assessments.forEach((x,i) => { x.heading.textContent=t.component + ' ' + (i+1); x.score.caption.textContent=t.score; x.weight.caption.textContent=t.weight; x.remove.textContent=t.remove; x.remove.setAttribute('aria-label', t.remove + ' ' + (i+1)); });
      renderFinal(); renderQuiz();
    }
    addButton.addEventListener('click', () => { addAssessment(); renderFinal(); });
    root.addEventListener('input', () => { renderFinal(); renderQuiz(); });
    new MutationObserver(translate).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
    addAssessment(); translate();
  };
})();
