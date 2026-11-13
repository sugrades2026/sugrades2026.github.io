(() => {
  const list = document.querySelector('#termRows');
  const score = document.querySelector('#diplomaScore');
  const info = document.querySelector('#diplomaInfo');
  const error = document.querySelector('#termError');
  let extraCount = 0;

  function addTerm(year, semester, extra = false) {
    const row = document.createElement('div');
    row.className = 'term-row';
    const name = document.createElement('div');
    name.className = 'term-name';
    const heading = document.createElement('strong');
    heading.textContent = extra ? 'Ek dönem' : `${year}. yıl`;
    const subtitle = document.createElement('span');
    subtitle.textContent = extra ? String(++extraCount) : semester;
    name.append(heading, subtitle);
    const gpaLabel = document.createElement('label');
    gpaLabel.append(document.createTextNode('Dönem GPA'));
    const gpa = document.createElement('input');
    gpa.type = 'text'; gpa.inputMode = 'decimal'; gpa.placeholder = '0,00';
    gpaLabel.append(gpa);
    const creditLabel = document.createElement('label');
    creditLabel.append(document.createTextNode('GPA kredisi'));
    const credit = document.createElement('input');
    credit.type = 'text'; credit.inputMode = 'decimal'; credit.placeholder = '0';
    creditLabel.append(credit);
    row.append(name, gpaLabel, creditLabel);
    if (extra) {
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'remove';
      remove.setAttribute('aria-label', 'Ek dönemi sil'); remove.textContent = '×';
      remove.addEventListener('click', () => {row.remove(); calculate();});
      row.append(remove);
    } else {
      const spacer = document.createElement('span'); spacer.className = 'spacer'; row.append(spacer);
    }
    gpa.addEventListener('input', calculate);
    credit.addEventListener('input', calculate);
    list.append(row);
  }
  function parse(value) {
    const v = value.trim().replace(',', '.');
    return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(v) ? Number(v) : NaN;
  }
  function calculate() {
    let weighted = 0, credits = 0, invalid = false;
    for (const row of list.querySelectorAll('.term-row')) {
      const [gpa, credit] = row.querySelectorAll('input');
      const gv = gpa.value.trim(), cv = credit.value.trim();
      const untouched = !gv && !cv;
      const g = parse(gv), c = parse(cv);
      const bad = !untouched && (!gv || !cv || !Number.isFinite(g) || g < 0 || g > 4 || !Number.isFinite(c) || c <= 0);
      gpa.setAttribute('aria-invalid', String(bad)); credit.setAttribute('aria-invalid', String(bad));
      if (bad) { invalid = true; continue; }
      if (!untouched) { weighted += g * c; credits += c; }
    }
    error.textContent = invalid ? 'Dolu satırlarda GPA 0–4 arasında ve kredi sıfırdan büyük olmalı; iki alanı da doldur.' : '';
    score.textContent = !invalid && credits > 0 ? (weighted / credits).toFixed(2) : '—';
    info.textContent = !invalid && credits > 0 ? 'Girilen dönemlerin kredi ağırlıklı tahmini' : 'Hesaplamak için dönem bilgilerini gir.';
  }
  for (let year=1; year<=4; year++) {
    addTerm(year, 'Güz dönemi'); addTerm(year, 'Bahar dönemi');
  }
  document.querySelector('#addTerm').addEventListener('click', () => addTerm(null, null, true));
})();
