/* Semester GPA chart. Displays only entries the student has supplied locally. */
(() => {
  'use strict';
  const rows = document.querySelector('#termRows');
  const result = document.querySelector('#diploma .result');
  if (!rows || !result) return;
  const messages = {
    tr: {title:'Dönem GPA grafiği', empty:'Grafik için dönem GPA ve kredi bilgilerini gir.', table:'Girilen dönem ortalamaları', term:'Dönem', gpa:'Dönem GPA', credits:'Kredi', dataset:'Dönem GPA', unavailable:'Grafik yüklenemedi; dönem bilgileri aşağıdaki tabloda gösteriliyor.'},
    en: {title:'Semester GPA chart', empty:'Enter a semester GPA and credits to see your chart.', table:'Entered semester averages', term:'Semester', gpa:'Semester GPA', credits:'Credits', dataset:'Semester GPA', unavailable:'The chart could not be loaded; semester details are shown in the table below.'}
  };
  const style = document.createElement('style');
  style.textContent = '.grade-chart{margin-top:24px;padding-top:20px;border-top:1px solid #d4dfef}.grade-chart h3{font-size:17px;margin:0 0 8px}.grade-chart p{font-size:13px;margin:0 0 12px}.grade-chart-canvas{position:relative;height:230px;width:100%}.grade-chart canvas{display:block;width:100%}.grade-chart table{width:100%;border-collapse:collapse;font-size:12px;margin-top:14px}.grade-chart caption{text-align:left;font-weight:700;margin-bottom:8px}.grade-chart th,.grade-chart td{border-bottom:1px solid #d4dfef;padding:6px 4px;text-align:left}.grade-chart th:last-child,.grade-chart td:last-child{text-align:right}html[data-theme="dark"] .grade-chart,html[data-theme="dark"] .grade-chart th,html[data-theme="dark"] .grade-chart td{border-color:#40516d}';
  document.head.append(style);
  const section = document.createElement('section');
  section.className = 'grade-chart';
  const title = document.createElement('h3');
  const message = document.createElement('p');
  message.setAttribute('role', 'status');
  const holder = document.createElement('div'); holder.className = 'grade-chart-canvas';
  const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden','true'); holder.append(canvas);
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  const head = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(caption,head,tbody); section.append(title,message,holder,table); result.append(section);
  let chart = null;
  const parse = raw => {
    const normalized = raw.trim().replace(',', '.');
    return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) ? Number(normalized) : NaN;
  };
  const language = () => document.documentElement.lang === 'en' ? 'en' : 'tr';
  function getRows() {
    const lang = language();
    return [...rows.querySelectorAll('.term-row')].map((row, index) => {
      const fields = row.querySelectorAll('input');
      if (fields.length < 2) return null;
      const gpa = parse(fields[0].value), credits = parse(fields[1].value);
      if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4 || !Number.isFinite(credits) || credits <= 0) return null;
      const strong = row.querySelector('.term-name strong');
      const span = row.querySelector('.term-name span');
      let label = [strong && strong.textContent, span && span.textContent].filter(Boolean).join(' ');
      if (!label) label = (lang === 'en' ? 'Semester ' : 'Dönem ') + (index + 1);
      return {label,gpa,credits};
    }).filter(Boolean);
  }
  function render() {
    const lang = language(), t = messages[lang], data = getRows();
    title.textContent = t.title;
    caption.textContent = t.table;
    message.textContent = !data.length ? t.empty : (typeof window.Chart !== 'function' ? t.unavailable : '');
    message.hidden = !message.textContent;
    holder.hidden = !data.length || typeof window.Chart !== 'function';
    table.hidden = !data.length;
    head.replaceChildren(); tbody.replaceChildren();
    const rowHead = document.createElement('tr');
    [t.term,t.gpa,t.credits].forEach(label=>{const th=document.createElement('th');th.scope='col';th.textContent=label;rowHead.append(th)});
    head.append(rowHead);
    for (const entry of data) {
      const tr = document.createElement('tr');
      [entry.label, entry.gpa.toFixed(2), String(entry.credits)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td)});
      tbody.append(tr);
    }
    if (chart) { chart.destroy(); chart = null; }
    if (!data.length || typeof window.Chart !== 'function') return;
    const dark = document.documentElement.dataset.theme === 'dark';
    const fg = dark ? '#d9e4f6' : '#364c72';
    const grid = dark ? '#40516d' : '#d4dfef';
    chart = new window.Chart(canvas, {
      type:'line',
      data:{labels:data.map(x=>x.label),datasets:[{label:t.dataset,data:data.map(x=>x.gpa),borderColor:dark?'#ffa668':'#002776',backgroundColor:dark?'#ffa668':'#002776',borderWidth:3,pointRadius:4,tension:0.15}]},
      options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:fg,maxRotation:45,minRotation:0,autoSkip:true},grid:{color:grid}},y:{min:0,max:4,ticks:{color:fg,stepSize:1},grid:{color:grid}}}}
    });
  }
  rows.addEventListener('input',render);
  rows.addEventListener('change',render);
  new MutationObserver(render).observe(rows,{childList:true,subtree:true,characterData:true});
  let lastLanguage = document.documentElement.lang, lastTheme = document.documentElement.dataset.theme;
  new MutationObserver(() => {
    const lang = document.documentElement.lang, theme = document.documentElement.dataset.theme;
    if (lang === lastLanguage && theme === lastTheme) return;
    lastLanguage = lang; lastTheme = theme; render();
  }).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-theme']});
  window.addEventListener('su:navigate',event=>{if(event.detail.page==='diploma')requestAnimationFrame(()=>{if(chart) chart.resize();});});
  render();
})();
