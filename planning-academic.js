/* Client-side academic planning estimates. No transcript data leaves the page. */
(() => {
  'use strict';

  const copy = {
    tr: {
      heading: 'Akademik simülasyonlar', intro: 'Bilgileri kendin girerek olası sonuçları karşılaştır. Hesaplar bu cihazda yapılır ve resmî sonuç veya akademik uygunluk kararı değildir.',
      target: 'Hedef genel GPA', targetHint: 'Mevcut genel GPA ve GPA’ya dahil kredi toplamını gir. Bu dönemki derslerin kredilerini ve öngördüğün katsayıları ekle.',
      currentGpa: 'Mevcut genel GPA', currentCredit: 'Tamamlanmış GPA kredisi', targetGpa: 'Hedef genel GPA',
      courseCredit: 'Ders kredisi', courseGrade: 'Tahmini not katsayısı (0–4)', addCourse: '+ Ders ekle', remove: 'Dersi kaldır',
      course: 'Ders', gradeOptional: 'Katsayılar öngörülen genel GPA için gereklidir; hedef dönem GPA’sı için boş bırakılabilir.',
      waitTarget: 'Hedefi görmek için mevcut bilgilerini, hedefi ve dönem kredilerini gir.', invalidTarget: 'GPA değerleri 0–4 arasında, ders kredileri sıfırdan büyük olmalı. Önceki kredin varsa mevcut GPA’nı da gir.', invalidGrade: 'Her tahmini not katsayısı 0–4 arasında olmalı.',
      required: 'Hedef için gereken dönem GPA’sı', projected: 'Girilen derslerle tahmini genel GPA', missingGrades: 'Tahmini genel GPA için her dersin not katsayısını gir.', unreachable: 'Bu kredi yüküyle hedefe yalnızca bu dönemde ulaşmak mümkün görünmüyor (gereken dönem GPA’sı 4.00 üzeri).', already: 'Bu dönem 0.00 ortalamayla bile hedef karşılanır.', rounded: 'Mevcut GPA iki basamağa yuvarlanmışsa sonuç küçük farklar gösterebilir. Bu hesap yeni dersler varsayar; tekrarları ayrı hesapla.',
      repeat: 'Ders tekrarı etkisi', repeatHint: 'Aynı kodlu, aynı kredili ve önceki notu GPA hesabında bulunan tek bir dersin değişimini tahmin et.', oldGrade: 'Önceki not katsayısı (0–4)', newGrade: 'Yeni not katsayısı (0–4)', repeatedCredit: 'Tekrarlanan dersin SÜ kredisi',
      waitRepeat: 'Tekrar etkisini görmek için tüm alanları doldur.', invalidRepeat: 'GPA ve not katsayıları 0–4 arasında olmalı; toplam ve ders kredisi sıfırdan büyük, ders kredisi toplam krediden fazla olmamalı.', incompatibleRepeat: 'Mevcut GPA, kredi ve eski not birbirleriyle uyuşmuyor. GPA kredisine dahil edilmiş doğru eski notu kontrol et.', repeatResult: 'Tekrar sonrası tahmini genel GPA', difference: 'Tahmini değişim', repeatNote: 'Eski dersin kredisi ve notu mevcut GPA içinde kabul edilir; yeni not eski notun yerini alır, kredi aynı kalır. Tekrar hakkı, eşdeğer ders ve diğer kurallar kontrol edilmez. Yuvarlama sonucu değiştirebilir.',
      withdrawal: 'Dersten çekilme senaryosu', withdrawalHint: 'GPA’ya dahil bir ders çıkarıldığında yalnızca dönem ortalamasının nasıl değişebileceğini karşılaştır.', semesterGpa: 'Mevcut dönem GPA’sı', semesterCredit: 'Dönemin GPA kredisi', withdrawnCredit: 'Çıkarılacak dersin kredisi', withdrawnGrade: 'Dersin mevcut not katsayısı (0–4)',
      waitW: 'Karşılaştırma için dönem bilgilerini ve çıkarılacak dersi gir.', invalidW: 'GPA ve katsayı 0–4 arasında olmalı; krediler sıfırdan büyük ve çıkarılan kredi dönem toplamından fazla olmamalı.', incompatibleW: 'Dönem GPA’sı, kredi ve ders notu birbiriyle uyuşmuyor. Değerleri kontrol et.', noRemaining: 'Ders çıkarıldığında GPA’ya dahil kredi kalmadığı için yeni dönem GPA’sı hesaplanamaz.', before: 'Ders dahil dönem GPA’sı', after: 'Ders çıkarılırsa tahmini dönem GPA’sı', withdrawalNote: 'Bu yalnızca sayısal bir senaryodur; W hakkı, son tarih, onur durumu ve ön koşulları belirlemez. Dersin dönem GPA’sına dahil olduğu ve diğer notların değişmediği varsayılır. Yuvarlama fark yaratabilir.'
    },
    en: {
      heading: 'Academic simulations', intro: 'Enter your own details to compare possible outcomes. Calculations stay on this device and are not official results or eligibility decisions.',
      target: 'Target cumulative GPA', targetHint: 'Enter your current cumulative GPA and GPA credits. Add this semester’s course credits and expected grade points.',
      currentGpa: 'Current cumulative GPA', currentCredit: 'Completed GPA credits', targetGpa: 'Target cumulative GPA',
      courseCredit: 'Course credits', courseGrade: 'Expected grade points (0–4)', addCourse: '+ Add course', remove: 'Remove course',
      course: 'Course', gradeOptional: 'Grade points are needed for the projected cumulative GPA; leave them blank to calculate only the required semester GPA.',
      waitTarget: 'Enter your current details, target and semester credits.', invalidTarget: 'GPA values must be between 0 and 4 and course credits must be greater than zero. Enter your current GPA if you have prior credits.', invalidGrade: 'Each expected grade point must be between 0 and 4.',
      required: 'Semester GPA required for your target', projected: 'Projected cumulative GPA with these courses', missingGrades: 'Enter expected grade points for every course to see the projected cumulative GPA.', unreachable: 'This target cannot be reached in this semester with these credits alone (required semester GPA exceeds 4.00).', already: 'The target would be met even with a 0.00 semester GPA.', rounded: 'A current GPA rounded to two decimal places can cause small differences. This calculation assumes new courses; calculate repeats separately.',
      repeat: 'Effect of repeating a course', repeatHint: 'Estimate a single repeat of a course with the same code and credits, whose previous grade is included in GPA.', oldGrade: 'Previous grade points (0–4)', newGrade: 'New grade points (0–4)', repeatedCredit: 'Repeated course SU credits',
      waitRepeat: 'Complete all fields to estimate the effect of a repeat.', invalidRepeat: 'GPA and grade points must be between 0 and 4; total and course credits must be positive, and course credits cannot exceed the total.', incompatibleRepeat: 'Current GPA, credits and the previous grade are inconsistent. Check the old grade included in the GPA credits.', repeatResult: 'Estimated cumulative GPA after repeat', difference: 'Estimated change', repeatNote: 'The old course credit and grade are assumed to be included in the current GPA; the new grade replaces the old one with unchanged credits. Repeat eligibility, equivalent courses and other rules are not checked. Rounding can affect results.',
      withdrawal: 'Course withdrawal scenario', withdrawalHint: 'Compare only how the semester GPA might change if a GPA-included course is removed.', semesterGpa: 'Current semester GPA', semesterCredit: 'Semester GPA credits', withdrawnCredit: 'Credits of the removed course', withdrawnGrade: 'Current grade points for the course (0–4)',
      waitW: 'Enter the semester details and the course to be removed.', invalidW: 'GPA and grade points must be between 0 and 4; credits must be positive and removed credits cannot exceed the total.', incompatibleW: 'Semester GPA, credits and course grade are inconsistent. Check the values.', noRemaining: 'The new semester GPA cannot be calculated because no GPA credits remain.', before: 'Semester GPA with the course', after: 'Estimated semester GPA without the course', withdrawalNote: 'This is only a numerical scenario; it does not determine withdrawal eligibility, deadlines, honors or prerequisites. The course is assumed to count toward the semester GPA and other grades remain unchanged. Rounding can affect results.'
    }
  };

  window.suAcademicInit = function suAcademicInit(root) {
    if (!root || root.dataset.academicInitialized === 'true') return;
    root.dataset.academicInitialized = 'true';
    const bindings = [];
    const lang = () => document.documentElement.lang === 'en' ? 'en' : 'tr';
    const msg = key => copy[lang()][key];
    function el(tag, className, parent) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (parent) parent.appendChild(node);
      return node;
    }
    function text(parent, tag, className, key) {
      const node = el(tag, className, parent);
      bindings.push([node, key]);
      node.textContent = msg(key);
      return node;
    }
    function field(parent, key, opts = {}) {
      const label = el('label', 'planning-field', parent);
      text(label, 'span', '', key);
      const input = el('input', '', label);
      input.type = 'number';
      input.inputMode = 'decimal';
      input.step = 'any';
      if (opts.min !== undefined) input.min = String(opts.min);
      if (opts.max !== undefined) input.max = String(opts.max);
      input.autocomplete = 'off';
      return input;
    }
    function section(key, hint) {
      const container = el('section', 'planning-section', root);
      text(container, 'h3', '', key);
      text(container, 'p', 'planning-hint', hint);
      const form = el('form', 'planning-form', container);
      form.addEventListener('submit', event => event.preventDefault());
      const fields = el('div', 'planning-fields', form);
      const result = el('div', 'planning-result', container);
      result.setAttribute('aria-live', 'polite');
      result.setAttribute('aria-atomic', 'true');
      return {container, form, fields, result};
    }
    function num(input) {
      if (input.value.trim() === '') return null;
      const value = input.valueAsNumber;
      return Number.isFinite(value) ? value : NaN;
    }
    const gradeValid = value => Number.isFinite(value) && value >= 0 && value <= 4;
    const creditValid = value => Number.isFinite(value) && value > 0 && value <= 10000;
    const format = value => value.toLocaleString(lang() === 'en' ? 'en-US' : 'tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    function show(result, lines) {
      result.replaceChildren();
      for (const line of lines) {
        const p = el('p', '', result);
        p.textContent = line;
      }
    }
    function consistent(totalGpa, totalCredits, excludedGrade, excludedCredits) {
      const remainder = totalGpa * totalCredits - excludedGrade * excludedCredits;
      const possible = 4 * (totalCredits - excludedCredits);
      const tolerance = totalCredits * 0.0050001 + 1e-9;
      return remainder >= -tolerance && remainder <= possible + tolerance;
    }
    const clamp = n => Math.min(4, Math.max(0, n));

    text(root, 'h2', '', 'heading');
    text(root, 'p', 'planning-intro', 'intro');
    const target = section('target', 'targetHint');
    const current = field(target.fields, 'currentGpa', {min: 0, max: 4});
    const completed = field(target.fields, 'currentCredit', {min: 0, max: 10000});
    const desired = field(target.fields, 'targetGpa', {min: 0, max: 4});
    const rowList = el('div', 'planning-courses', target.form);
    text(target.form, 'p', 'planning-hint', 'gradeOptional');
    const add = text(target.form, 'button', 'planning-add', 'addCourse');
    add.type = 'button';
    const rows = [];
    function addRow() {
      if (rows.length >= 25) return;
      const container = el('fieldset', 'planning-course', rowList);
      const legend = el('legend', '', container);
      const credit = field(container, 'courseCredit', {min: 0, max: 10000});
      const grade = field(container, 'courseGrade', {min: 0, max: 4});
      const remove = text(container, 'button', 'planning-remove', 'remove');
      remove.type = 'button';
      const row = {container, legend, credit, grade, remove};
      rows.push(row);
      remove.addEventListener('click', () => {
        if (rows.length === 1) { credit.value = ''; grade.value = ''; }
        else {
          rows.splice(rows.indexOf(row), 1);
          for (let i = bindings.length - 1; i >= 0; i--) {
            if (container.contains(bindings[i][0])) bindings.splice(i, 1);
          }
          container.remove();
        }
        labelRows(); updateTarget();
      });
      labelRows(); updateTarget();
    }
    function labelRows() {
      rows.forEach((row, i) => { row.legend.textContent = msg('course') + ' ' + (i + 1); });
      add.disabled = rows.length >= 25;
    }
    function updateTarget() {
      const cgpa = num(current), credits = num(completed), goal = num(desired);
      const values = rows.map(row => ({credit: num(row.credit), grade: num(row.grade)}));
      if (credits === null || goal === null || (credits > 0 && cgpa === null) || values.some(row => row.credit === null)) { show(target.result, [msg('waitTarget')]); return; }
      if (!Number.isFinite(credits) || credits < 0 || credits > 10000 || !gradeValid(goal) || (credits > 0 && !gradeValid(cgpa)) || (credits === 0 && cgpa !== null && !gradeValid(cgpa)) || values.some(row => !creditValid(row.credit))) { show(target.result, [msg('invalidTarget')]); return; }
      if (values.some(row => row.grade !== null && !gradeValid(row.grade))) { show(target.result, [msg('invalidGrade')]); return; }
      const newCredits = values.reduce((sum, row) => sum + row.credit, 0);
      const required = (goal * (credits + newCredits) - (cgpa || 0) * credits) / newCredits;
      const lines = [msg('required') + ': ' + format(required)];
      if (required > 4 + 1e-9) lines.push(msg('unreachable'));
      else if (required <= 0) lines.push(msg('already'));
      if (values.every(row => row.grade !== null)) {
        const points = values.reduce((sum, row) => sum + row.credit * row.grade, 0);
        lines.push(msg('projected') + ': ' + format(((cgpa || 0) * credits + points) / (credits + newCredits)));
      } else lines.push(msg('missingGrades'));
      lines.push(msg('rounded'));
      show(target.result, lines);
    }
    target.form.addEventListener('input', updateTarget);
    add.addEventListener('click', addRow);
    addRow();

    const repeat = section('repeat', 'repeatHint');
    const repeatGpa = field(repeat.fields, 'currentGpa', {min: 0, max: 4});
    const repeatCredits = field(repeat.fields, 'currentCredit', {min: 0, max: 10000});
    const repeatCourse = field(repeat.fields, 'repeatedCredit', {min: 0, max: 10000});
    const oldGrade = field(repeat.fields, 'oldGrade', {min: 0, max: 4});
    const newGrade = field(repeat.fields, 'newGrade', {min: 0, max: 4});
    function updateRepeat() {
      const values = [repeatGpa, repeatCredits, repeatCourse, oldGrade, newGrade].map(num);
      if (values.some(v => v === null)) { show(repeat.result, [msg('waitRepeat')]); return; }
      const [gpa, credits, course, oldPoint, newPoint] = values;
      if (!gradeValid(gpa) || !creditValid(credits) || !creditValid(course) || course > credits || !gradeValid(oldPoint) || !gradeValid(newPoint)) { show(repeat.result, [msg('invalidRepeat')]); return; }
      if (!consistent(gpa, credits, oldPoint, course)) { show(repeat.result, [msg('incompatibleRepeat')]); return; }
      const estimate = clamp(gpa + course * (newPoint - oldPoint) / credits);
      show(repeat.result, [msg('repeatResult') + ': ' + format(estimate), msg('difference') + ': ' + (estimate - gpa > 0 ? '+' : '') + format(estimate - gpa), msg('repeatNote')]);
    }
    repeat.form.addEventListener('input', updateRepeat);
    updateRepeat();

    const withdrawal = section('withdrawal', 'withdrawalHint');
    const semGpa = field(withdrawal.fields, 'semesterGpa', {min: 0, max: 4});
    const semCredits = field(withdrawal.fields, 'semesterCredit', {min: 0, max: 10000});
    const wCredits = field(withdrawal.fields, 'withdrawnCredit', {min: 0, max: 10000});
    const wGrade = field(withdrawal.fields, 'withdrawnGrade', {min: 0, max: 4});
    function updateWithdrawal() {
      const values = [semGpa, semCredits, wCredits, wGrade].map(num);
      if (values.some(v => v === null)) { show(withdrawal.result, [msg('waitW')]); return; }
      const [gpa, credits, course, point] = values;
      if (!gradeValid(gpa) || !creditValid(credits) || !creditValid(course) || course > credits || !gradeValid(point)) { show(withdrawal.result, [msg('invalidW')]); return; }
      if (!consistent(gpa, credits, point, course)) { show(withdrawal.result, [msg('incompatibleW')]); return; }
      if (Math.abs(credits - course) < 1e-9) { show(withdrawal.result, [msg('noRemaining'), msg('withdrawalNote')]); return; }
      const result = clamp((gpa * credits - course * point) / (credits - course));
      show(withdrawal.result, [msg('before') + ': ' + format(gpa), msg('after') + ': ' + format(result), msg('withdrawalNote')]);
    }
    withdrawal.form.addEventListener('input', updateWithdrawal);
    updateWithdrawal();

    const observer = new MutationObserver(() => {
      bindings.forEach(([node, key]) => { node.textContent = msg(key); });
      labelRows(); updateTarget(); updateRepeat(); updateWithdrawal();
    });
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  };
})();
