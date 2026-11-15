/* Local-only syllabus text extraction. Untrusted PDF text is never inserted as HTML. */
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_PAGES = 40;
const MAX_CHARS = 300000;
const MAX_CANDIDATES = 30;
const PARSE_TIMEOUT = 25000;

/* This deliberately recognises only explicit percentages adjacent to known labels.
   A candidate is a suggestion, never an authoritative assessment. */
const LABEL = String.raw`(?:lecture\s+attendance|recitation\s+attendance|group\s+project|grup\s+projesi|ara\s+s[ıi]nav|final\s+(?:exam|s[ıi]nav[ıi])|mid[- ]?term(?:\s+exam)?|exam|vize|final|quizzes|quiz|homeworks?|home\s*work|assignments?|[öo]dev(?:ler)?|recitations?|recitation|laboratory|laboratuvar|labs?|participation|attendance|kat[ıi]l[ıi]m|devam|projects?|proje(?:ler)?|presentations?|sunum)`;
const candidateRE = new RegExp(String.raw`(${LABEL})(?:\s+(?:no\.?\s*)?(\d{1,2})(?=\s|[:\-–—=]))?\s*[:\-–—=]?\s*(?:\(\s*)?(?:(\d{1,3}(?:[.,]\d{1,2})?)\s*%|%\s*(\d{1,3}(?:[.,]\d{1,2})?))`, 'giu');

export function extractAssessmentCandidates(text) {
  const results = [];
  const seen = new Set();
  for (const raw of String(text).slice(0, MAX_CHARS).split(/\r?\n/)) {
    const line = raw.replace(/\s+/g, ' ').trim().slice(0, 1200);
    if (!line) continue;
    candidateRE.lastIndex = 0;
    for (const match of line.matchAll(candidateRE)) {
      const value = Number((match[3] || match[4]).replace(',', '.'));
      if (!Number.isFinite(value) || value <= 0 || value > 100) continue;
      const label = (match[1] + (match[2] ? ' ' + match[2] : '')).trim().slice(0, 60);
      const key = label.toLocaleLowerCase('tr-TR') + ':' + value;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ name: label, weight: value, context: line.slice(0, 180) });
      if (results.length >= MAX_CANDIDATES) return results;
    }
  }
  return results;
}

if (typeof document !== 'undefined') {
  initPdfImport();
}

function initPdfImport() {
  const $ = (selector, root = document) => root.querySelector(selector);
  const anchor = $('#catalogCourse');
  if (!anchor) return;

  const tr = {
    open: 'Syllabus PDF’inden ağırlık bul', title: 'Syllabus PDF’ini incele',
    description: 'PDF yalnızca bu cihazda okunur; sunucuya gönderilmez. Bulunan yüzdeler öneridir, syllabus ve dönem bilgisiyle karşılaştır.',
    reading: 'PDF inceleniyor…', noText: 'PDF’de okunabilir metin bulunamadı. Taranmış veya görsel içeren dosyalar desteklenmiyor; ağırlıkları elle girebilirsin.',
    noCandidates: 'Açıkça yazılmış değerlendirme yüzdesi bulunamadı. Ağırlıkları elle girebilirsin.',
    error: 'PDF açılamadı. Dosyanın geçerli, şifresiz ve desteklenen bir PDF olduğundan emin ol.',
    tooBig: 'PDF en fazla 8 MB olabilir.', tooMany: 'PDF en fazla 40 sayfa olabilir.',
    timeout: 'PDF incelemesi zaman aşımına uğradı. Daha küçük bir dosya dene.',
    help: 'Kullanılacak satırları seçip ad ve yüzdelerini kontrol et. Toplamın %100 olması gerekir. Uygulama mevcut özel ders alanlarının üzerine yazar.',
    label: 'Değerlendirme adı', weight: 'Ağırlık %', use: 'Bu satırı kullan', total: 'Seçilen toplam',
    close: 'Vazgeç', apply: 'Seçilenleri özel derse uygula', applied: 'Öneriler özel ders alanlarına aktarıldı. Hesaplamadan önce syllabus ile tekrar karşılaştır.',
    invalid: 'En az bir geçerli değerlendirme seç ve seçilen ağırlıkların toplamını %100 yap.',
    scanned: 'Seçilen dosya geçerli bir PDF değil.', loadingLibrary: 'PDF okuma aracı yüklenemedi; internet bağlantını kontrol edip tekrar dene.',
  };
  const en = {
    open: 'Find weights in syllabus PDF', title: 'Review syllabus PDF',
    description: 'The PDF is read only on this device; it is not sent to a server. Detected percentages are suggestions: compare them with your syllabus and semester.',
    reading: 'Reading PDF…', noText: 'No readable text was found. Scanned or image-only PDFs are not supported; you can enter weights manually.',
    noCandidates: 'No explicit assessment percentages were found. You can enter the weights manually.',
    error: 'Could not open this PDF. Check that it is valid, unencrypted, and supported.',
    tooBig: 'The PDF must be no larger than 8 MB.', tooMany: 'The PDF must contain no more than 40 pages.',
    timeout: 'Reading the PDF timed out. Try a smaller file.',
    help: 'Select the rows to use and review their names and percentages. The total must be 100%. Applying replaces your current custom course fields.',
    label: 'Assessment name', weight: 'Weight %', use: 'Use this row', total: 'Selected total',
    close: 'Cancel', apply: 'Apply selection to custom course', applied: 'Suggestions were added to your custom course. Compare them with the syllabus before calculating.',
    invalid: 'Select at least one valid assessment and make sure the selected weights total 100%.',
    scanned: 'The selected file is not a valid PDF.', loadingLibrary: 'The PDF reader could not be loaded. Check your connection and try again.',
  };
  const strings = () => document.documentElement.lang === 'en' ? en : tr;
  const setText = (node, value) => { if (node.textContent !== value) node.textContent = value; };
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'picker-button'; button.id = 'pdfImportOpen';
  const fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = '.pdf,application/pdf'; fileInput.hidden = true; fileInput.id = 'pdfImportFile';
  anchor.after(button, fileInput);

  const css = document.createElement('style');
  css.textContent = '.pdf-import-dialog{max-height:min(85vh,850px);overflow:auto}.pdf-import-dialog .pdf-status{min-height:1.4em;font-size:13px}.pdf-import-dialog .pdf-candidate{display:grid;grid-template-columns:24px minmax(0,1fr) minmax(60px,100px);gap:8px;align-items:end;padding:12px 0;border-bottom:1px solid #d8e0ee}.pdf-import-dialog .pdf-candidate label{margin:0}.pdf-import-dialog .pdf-candidate input[type=checkbox]{width:auto;min-height:36px}.pdf-import-dialog .pdf-context{grid-column:2/-1;font-size:11px;line-height:1.4;overflow-wrap:anywhere;opacity:.75}.pdf-import-dialog .pdf-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.pdf-import-dialog .pdf-actions button{margin-top:4px}.pdf-import-dialog .pdf-total{font-weight:700;font-size:13px}.pdf-import-dialog .pdf-notice{font-size:13px;line-height:1.5}html[data-theme="dark"] .pdf-import-dialog .pdf-candidate{border-color:#383838}@media(max-width:480px){.pdf-import-dialog{padding:18px}.pdf-import-dialog .pdf-candidate{grid-template-columns:24px minmax(0,1fr) 70px}}';
  document.head.append(css);
  const dialog = document.createElement('dialog');
  dialog.className = 'picker-dialog pdf-import-dialog'; dialog.id = 'pdfImportDialog';
  dialog.setAttribute('aria-labelledby', 'pdfImportTitle');
  /* Fixed markup only; PDF content and file names are always assigned via textContent/value. */
  dialog.innerHTML = '<h2 id="pdfImportTitle"></h2><p class="pdf-description"></p><p class="pdf-status" role="status" aria-live="polite"></p><p class="pdf-notice"></p><div class="pdf-candidates"></div><p class="pdf-total"></p><div class="pdf-actions"><button type="button" class="add pdf-apply"></button><button type="button" class="report-close pdf-close"></button></div>';
  document.body.append(dialog);
  const title = $('#pdfImportTitle', dialog), description = $('.pdf-description', dialog), status = $('.pdf-status', dialog);
  const notice = $('.pdf-notice', dialog), list = $('.pdf-candidates', dialog), total = $('.pdf-total', dialog);
  const apply = $('.pdf-apply', dialog), close = $('.pdf-close', dialog);
  let statusKey = '', results = [], generation = 0, activeTask = null;
  const localize = () => {
    const t = strings();
    setText(button, t.open); setText(title, t.title); setText(description, t.description);
    setText(close, t.close); setText(apply, t.apply);
    setText(status, statusKey ? t[statusKey] : '');
    setText(notice, results.length ? t.help : '');
    list.querySelectorAll('.pdf-candidate').forEach(row => {
      setText(row.querySelector('.pdf-name-label'), t.label);
      setText(row.querySelector('.pdf-weight-label'), t.weight);
      const check = row.querySelector('input[type=checkbox]');
      if (check.getAttribute('aria-label') !== t.use) check.setAttribute('aria-label', t.use);
    });
    updateTotal();
  };
  function selectedRows() {
    return [...list.querySelectorAll('.pdf-candidate')].filter(row => row.querySelector('input[type=checkbox]').checked);
  }
  function updateTotal() {
    const selected = selectedRows();
    const sum = selected.reduce((acc, row) => acc + (Number(row.querySelector('.pdf-weight').value) || 0), 0);
    setText(total, results.length ? `${strings().total}: %${Number(sum.toFixed(2))}` : '');
    apply.hidden = !results.length;
  }
  function drawResults() {
    list.replaceChildren();
    results.forEach((candidate, i) => {
      const row = document.createElement('div'); row.className = 'pdf-candidate';
      const check = document.createElement('input'); check.type = 'checkbox'; check.checked = true;
      const nameLabel = document.createElement('label'), nameText = document.createElement('span'), nameInput = document.createElement('input');
      nameText.className = 'pdf-name-label'; nameInput.type = 'text'; nameInput.maxLength = 60; nameInput.value = candidate.name;
      nameLabel.append(nameText, nameInput);
      const weightLabel = document.createElement('label'), weightText = document.createElement('span'), weightInput = document.createElement('input');
      weightText.className = 'pdf-weight-label'; weightInput.className = 'pdf-weight'; weightInput.type = 'number'; weightInput.min = '0.01'; weightInput.max = '100'; weightInput.step = 'any'; weightInput.value = String(candidate.weight);
      weightLabel.append(weightText, weightInput);
      const context = document.createElement('div'); context.className = 'pdf-context'; context.textContent = candidate.context;
      row.append(check, nameLabel, weightLabel, context); list.append(row);
      check.addEventListener('change', updateTotal); weightInput.addEventListener('input', updateTotal);
    });
    localize();
  }
  function reset() {
    results = []; list.replaceChildren(); statusKey = ''; localize();
  }
  function cancelRead() {
    generation++;
    const task = activeTask;
    activeTask = null;
    if (task) Promise.resolve(task.destroy()).catch(() => {});
  }
  button.addEventListener('click', () => { fileInput.value = ''; fileInput.click(); });
  close.addEventListener('click', () => { cancelRead(); dialog.close(); });
  dialog.addEventListener('cancel', cancelRead);
  // The browser queues close events. Ignore a stale event if the dialog has already reopened.
  dialog.addEventListener('close', () => { if (!dialog.open) cancelRead(); });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const current = ++generation;
    reset();
    if (!dialog.open) dialog.showModal();
    const fail = key => { if (current === generation) { statusKey = key; localize(); } };
    if (file.size > MAX_BYTES) { fail('tooBig'); return; }
    if (file.size < 5) { fail('scanned'); return; }
    let pdfjs;
    try { pdfjs = await import('./pdf.min.mjs'); }
    catch (_) { fail('loadingLibrary'); return; }
    if (current !== generation) return;
    statusKey = 'reading'; localize();
    let timer, ownTask;
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      if (current !== generation) return;
      const header = new TextDecoder('latin1').decode(data.slice(0, 1024));
      if (!header.includes('%PDF-')) { fail('scanned'); return; }
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('./pdf.worker.min.mjs', import.meta.url).toString();
      const task = pdfjs.getDocument({ data, enableScripting: false, isEvalSupported: false, enableXfa: false, disableFontFace: true, useSystemFonts: false, useWasm: false, disableAutoFetch: true, disableStream: true });
      activeTask = task; ownTask = task;
      const read = async () => {
        const pdf = await task.promise;
        if (pdf.numPages > MAX_PAGES) throw new Error('tooMany');
        let all = '';
        for (let pageNo = 1; pageNo <= pdf.numPages && all.length < MAX_CHARS; pageNo++) {
          const page = await pdf.getPage(pageNo);
          const content = await page.getTextContent();
          let lastY = null;
          for (const item of content.items) {
            if (typeof item.str !== 'string') continue;
            const y = item.transform && item.transform[5];
            if (lastY !== null && Number.isFinite(y) && Math.abs(y - lastY) > 3) all += '\n';
            all += item.str + (item.hasEOL ? '\n' : ' ');
            if (Number.isFinite(y)) lastY = y;
            if (all.length >= MAX_CHARS) break;
          }
          all += '\n';
          page.cleanup();
        }
        return all;
      };
      const text = await Promise.race([read(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), PARSE_TIMEOUT); })]);
      if (current !== generation) return;
      if (!text.trim()) { fail('noText'); return; }
      results = extractAssessmentCandidates(text);
      statusKey = results.length ? '' : 'noCandidates'; drawResults();
    } catch (err) {
      fail(err && (err.message === 'timeout' || err.message === 'tooMany') ? err.message : 'error');
    } finally {
      clearTimeout(timer);
      if (ownTask) { await ownTask.destroy().catch(() => {}); if (activeTask === ownTask) activeTask = null; }
    }
  });
  apply.addEventListener('click', () => {
    const rows = selectedRows();
    const values = rows.map(row => ({ name: row.querySelector('input[type=text]').value.trim().slice(0, 60), weight: Number(row.querySelector('.pdf-weight').value) }));
    if (!values.length || values.some(item => !item.name || !Number.isFinite(item.weight) || item.weight <= 0 || item.weight > 100) || Math.abs(values.reduce((sum, item) => sum + item.weight, 0) - 100) > 0.001) {
      statusKey = 'invalid'; localize(); return;
    }
    /* Existing calculator receives plain strings only. No file data or PDF content is uploaded. */
    const customIndex = courses.findIndex(course => course.custom);
    if (customIndex < 0) { statusKey = 'error'; localize(); return; }
    const custom = courses[customIndex];
    custom.components = values.map(item => ({ name: item.name, weight: String(item.weight), score: '' }));
    // A newly selected PDF need not match a previously entered course code.
    custom.code = ''; custom.name = 'Kendi dersini oluştur';
    sel.value = String(customIndex);
    renderCourse();
    if (typeof window.suTranslationRefresh === 'function') window.suTranslationRefresh();
    cancelRead(); dialog.close();
    const confirmation = document.createElement('p'); confirmation.className = 'note'; confirmation.setAttribute('role', 'status');
    confirmation.textContent = strings().applied;
    $('#fields').before(confirmation);
    setTimeout(() => confirmation.remove(), 12000);
  });
  let lastLanguage = document.documentElement.lang;
  new MutationObserver(() => {
    if (document.documentElement.lang !== lastLanguage) {
      lastLanguage = document.documentElement.lang;
      localize();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  localize();
}
