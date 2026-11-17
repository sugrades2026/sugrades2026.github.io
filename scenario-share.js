/* Explicitly shared GPA rows; data is decoded and applied only in this browser. */
(() => {
  'use strict';
  const MAX_ROWS = 100, MAX_PAYLOAD = 12000, MAX_CODE = 120;
  const allowedGrades = new Set(['', 'A', 'A−', 'B+', 'B', 'B−', 'C+', 'C', 'C−', 'D+', 'D', 'F', 'NA', 'NA_OUT', 'P / S / U / T / W']);
  const labels = {
    title: ['GPA senaryosunu paylaş', 'Share a GPA scenario'],
    privacy: ['Bağlantıyı alan herkes içindeki dersleri, kredileri ve notları görebilir. Bağlantı tarayıcı geçmişine veya site sunucusu kayıtlarına da geçebilir. Özel bilgi paylaşma.', 'Anyone with the link can see its courses, credits and grades. The link may also appear in browser history or site server logs. Do not share private information.'],
    create: ['Bağlantı oluştur', 'Create link'],
    png: ['PNG özeti indir', 'Download PNG summary'],
    pngInfo: ['Görsel derslerini ve notlarını içerir; yalnız güvendiğin kişilerle paylaş. En fazla 30 ders gösterilir; uzun ders adları kısaltılabilir.', 'The image contains your courses and grades; share it only with people you trust. Up to 30 courses are shown; long course names may be shortened.'],
    pngMax: ['PNG için en fazla 30 ders girilebilir.', 'The PNG supports up to 30 courses.'],
    pngFail: ['Görsel oluşturulamadı. Lütfen tekrar dene.', 'The image could not be created. Please try again.'],
    pngScore: ['GPA özeti', 'GPA summary'],
    pngCourse: ['Ders', 'Course'],
    pngCredit: ['SU kredisi', 'SU credits'],
    pngGrade: ['Harf notu', 'Grade'],
    url: ['Paylaşım bağlantısı', 'Share link'],
    select: ['Bağlantıyı seç', 'Select link'],
    empty: ['Paylaşmak için önce ders bilgilerini gir.', 'Enter course information before sharing.'],
    invalid: ['Ders bilgilerinden biri geçersiz veya bağlantı çok uzun. Kontrol edip tekrar dene.', 'A course entry is invalid or the link is too long. Check the entries and try again.'],
    max: ['En fazla 100 ders paylaşılabilir.', 'You can share up to 100 courses.'],
    preview: ['Paylaşılan GPA senaryosu', 'Shared GPA scenario'],
    review: ['Aşağıdaki bilgileri kontrol et. Onaylarsan mevcut derslerini silmeden sona eklenir. Tekrarlanan ders kodları GPA sonucunu etkileyebilir.', 'Review the information below. If you confirm, it will be appended without deleting your existing courses. Repeated course codes can affect your GPA.'],
    malformed: ['Bu paylaşım bağlantısı geçersiz veya desteklenen sınırı aşıyor. Hiçbir veri eklenmedi.', 'This share link is invalid or exceeds the supported limit. No data was added.'],
    add: ['Dersleri ekle', 'Add courses'],
    cancel: ['Vazgeç', 'Cancel'],
    close: ['Kapat', 'Close'],
    added: ['Paylaşılan dersler GPA hesabına eklendi.', 'Shared courses were added to the GPA calculator.'],
    estimated: ['tahmini', 'estimated'],
    missing: ['belirtilmedi', 'not specified']
  };
  const t = key => labels[key][document.documentElement.lang === 'en' ? 1 : 0];
  const create = (tag, className) => { const node = document.createElement(tag); if (className) node.className = className; return node; };
  const container = document.querySelector('#gpa > section');
  const rowArea = document.getElementById('rows');
  const addRow = document.getElementById('add');
  if (!container || !rowArea || !addRow) return;

  const panel = create('section', 'share-panel');
  const heading = create('h3', 'share-title');
  const privacy = create('p', 'share-privacy');
  const make = create('button', 'share-create picker-button'); make.type = 'button';
  const png = create('button', 'share-png picker-button'); png.type = 'button';
  const pngInfo = create('p', 'share-png-info');
  const outputLabel = create('label', 'share-label'); outputLabel.htmlFor = 'share-url';
  const output = create('textarea', 'share-url'); output.id = 'share-url'; output.readOnly = true; output.rows = 3; output.spellcheck = false;
  const selectButton = create('button', 'share-select picker-button'); selectButton.type = 'button';
  const outputGroup = create('div', 'share-output'); outputGroup.hidden = true;
  outputGroup.append(outputLabel, output, selectButton);
  const status = create('p', 'share-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  panel.append(heading, privacy, make, outputGroup, pngInfo, png, status);
  container.append(panel);

  const dialog = create('dialog', 'share-dialog'); dialog.setAttribute('aria-labelledby', 'share-dialog-title');
  const dialogTitle = create('h2', 'share-dialog-title'); dialogTitle.id = 'share-dialog-title';
  const intro = create('p', 'share-review');
  const preview = create('ol', 'share-preview');
  const actions = create('div', 'share-actions');
  const confirm = create('button', 'share-confirm add'); confirm.type = 'button';
  const cancel = create('button', 'share-cancel report-close'); cancel.type = 'button';
  actions.append(confirm, cancel); dialog.append(dialogTitle, intro, preview, actions); document.body.append(dialog);
  let statusKey = '', incoming = null;

  function localize() {
    heading.textContent = t('title'); privacy.textContent = t('privacy'); make.textContent = t('create');
    png.textContent = t('png'); pngInfo.textContent = t('pngInfo');
    outputLabel.textContent = t('url'); selectButton.textContent = t('select'); dialogTitle.textContent = t('preview');
    intro.textContent = t(incoming === false ? 'malformed' : 'review'); confirm.textContent = t('add');
    cancel.textContent = t(incoming === false ? 'close' : 'cancel');
    status.textContent = statusKey ? t(statusKey) : '';
    if (Array.isArray(incoming)) renderPreview(incoming);
  }
  const setStatus = key => { statusKey = key; status.textContent = key ? t(key) : ''; };
  function validate(row) {
    if (!Array.isArray(row) || row.length !== 4) return false;
    const [code, credit, grade, estimated] = row;
    if (typeof code !== 'string' || code.length > MAX_CODE || /[\u0000-\u001f\u007f-\u009f]/.test(code)) return false;
    if (typeof credit !== 'string' || credit.length > 16 || (credit !== '' && (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(credit) || !Number.isFinite(Number(credit)) || Number(credit) > 1000))) return false;
    return typeof grade === 'string' && allowedGrades.has(grade) && typeof estimated === 'boolean' && Boolean(code || credit || grade);
  }
  function readRows() {
    return Array.from(rowArea.querySelectorAll('.gpa-row')).map(row => {
      const inputs = row.querySelectorAll('input');
      const select = row.querySelector('select');
      return [inputs[0].value, inputs[1].value, select.value, row.dataset.estimate === 'true'];
    }).filter(row => row[0] || row[1] || row[2]);
  }
  function encode(data) {
    const bytes = new TextEncoder().encode(JSON.stringify({v: 1, r: data}));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(value) {
    if (typeof value !== 'string' || !value || value.length > MAX_PAYLOAD || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid');
    const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const data = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data) || data.v !== 1 || !Array.isArray(data.r) || data.r.length < 1 || data.r.length > MAX_ROWS || !data.r.every(validate)) throw new Error('invalid');
    return data.r;
  }
  function renderPreview(rows) {
    preview.replaceChildren();
    for (const [code, credit, grade, estimated] of rows) {
      const item = create('li', 'share-preview-row');
      item.textContent = `${code || t('missing')} · ${credit || t('missing')} · ${grade || t('missing')}${estimated ? ` · ${t('estimated')}` : ''}`;
      preview.append(item);
    }
  }
  make.addEventListener('click', () => {
    outputGroup.hidden = true; output.value = '';
    const rows = readRows();
    if (!rows.length) { setStatus('empty'); return; }
    if (rows.length > MAX_ROWS) { setStatus('max'); return; }
    if (!rows.every(validate)) { setStatus('invalid'); return; }
    try {
      const encoded = encode(rows);
      if (encoded.length > MAX_PAYLOAD) throw new Error('size');
      const url = new URL(location.href);
      url.search = '';
      url.searchParams.set('share', encoded);
      url.hash = '#/gpa';
      output.value = url.href;
      outputGroup.hidden = false;
      setStatus('');
    } catch (_) { setStatus('invalid'); }
  });
  png.addEventListener('click', () => {
    const rows = readRows();
    if (!rows.length) { setStatus('empty'); return; }
    if (rows.length > 30) { setStatus('pngMax'); return; }
    if (!rows.every(validate)) { setStatus('invalid'); return; }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 245 + rows.length * 56;
      const ctx = canvas.getContext('2d');
      if (!ctx || typeof canvas.toBlob !== 'function') throw new Error('canvas');
      ctx.fillStyle = '#f7f9fc'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#002776'; ctx.fillRect(0, 0, canvas.width, 90);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px sans-serif'; ctx.fillText('su.grades', 48, 57);
      ctx.fillStyle = '#15264b'; ctx.font = 'bold 30px sans-serif'; ctx.fillText(t('pngScore'), 48, 140);
      const current = document.getElementById('gpaScore');
      ctx.textAlign = 'right'; ctx.font = 'bold 34px sans-serif'; ctx.fillText(`GPA: ${current ? current.textContent : '—'}`, 1152, 140); ctx.textAlign = 'left';
      if (rows.some(row => row[3])) { ctx.font = '16px sans-serif'; ctx.fillStyle = '#566680'; ctx.fillText(`* ${t('estimated')}`, 48, 165); }
      ctx.font = 'bold 19px sans-serif'; ctx.fillStyle = '#566680';
      ctx.fillText(t('pngCourse'), 48, 192); ctx.fillText(t('pngCredit'), 758, 192); ctx.fillText(t('pngGrade'), 1000, 192);
      function ellipsis(value, width) {
        const chars = Array.from(value);
        if (ctx.measureText(value).width <= width) return value;
        while (chars.length && ctx.measureText(chars.join('') + '…').width > width) chars.pop();
        return chars.join('') + '…';
      }
      rows.forEach(([code, credit, grade, estimated], index) => {
        const y = 230 + index * 56;
        ctx.fillStyle = index % 2 ? '#edf2fa' : '#ffffff'; ctx.fillRect(32, y - 23, 1136, 50);
        ctx.font = '22px sans-serif'; ctx.fillStyle = '#15264b';
        ctx.fillText(ellipsis(code || t('missing'), 670), 48, y + 9);
        ctx.fillText(credit || '—', 758, y + 9);
        ctx.fillText(ellipsis(grade || '—', 120), 1000, y + 9);
        if (estimated) ctx.fillText('*', 1140, y + 9);
      });
      canvas.toBlob(blob => {
        if (!blob) { setStatus('pngFail'); return; }
        try {
          const fileUrl = URL.createObjectURL(blob);
          const link = document.createElement('a'); link.href = fileUrl; link.download = 'su-grades-gpa.png';
          document.body.append(link); link.click(); link.remove();
          setTimeout(() => URL.revokeObjectURL(fileUrl), 30000);
          setStatus('');
        } catch (_) { setStatus('pngFail'); }
      }, 'image/png');
    } catch (_) { setStatus('pngFail'); }
  });
  selectButton.addEventListener('click', () => { output.focus(); output.select(); });
  cancel.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  confirm.addEventListener('click', () => {
    if (!Array.isArray(incoming)) return;
    // Validate again and never reuse or clear existing inputs.
    if (incoming.length > MAX_ROWS || !incoming.every(validate)) { incoming = false; localize(); confirm.hidden = true; preview.replaceChildren(); return; }
    for (const [code, credit, grade, estimated] of incoming) {
      addRow.click();
      const row = rowArea.lastElementChild;
      const inputs = row.querySelectorAll('input');
      inputs[0].value = code; inputs[0].dispatchEvent(new Event('input', {bubbles: true}));
      inputs[1].value = credit;
      const gradeControl = row.querySelector('select'); gradeControl.value = grade;
      gradeControl.dispatchEvent(new Event('change', {bubbles: true}));
      if (estimated) row.dataset.estimate = 'true';
      inputs[1].dispatchEvent(new Event('input', {bubbles: true}));
    }
    incoming = null; dialog.close(); setStatus('added');
  });
  new MutationObserver(localize).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  localize();
  // Merely opening a link never changes GPA rows. Import always requires confirmation.
  const search = location.search;
  if (search.includes('share=')) {
    try {
      if (search.length > MAX_PAYLOAD + 2000) throw new Error('size');
      const params = new URLSearchParams(search), all = params.getAll('share');
      if (all.length !== 1) throw new Error('invalid');
      incoming = decode(all[0]);
    } catch (_) { incoming = false; }
    confirm.hidden = incoming === false;
    localize();
    dialog.showModal();
    cancel.focus();
  }
})();
