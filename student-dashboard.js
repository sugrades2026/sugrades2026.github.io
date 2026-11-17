/* Session overview and explicit, preview-first course import. Data stays in the browser. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const gpa = byId('gpaScore'), diploma = byId('diplomaScore');
  const refresh = () => {
    byId('dashboard-gpa').textContent = gpa.textContent;
    byId('dashboard-diploma').textContent = diploma.textContent;
    const en = document.documentElement.lang === 'en';
    byId('dashboard-gpa-info').textContent = gpa.textContent === '—' ? (en ? 'Not calculated yet' : 'Henüz hesaplanmadı') : byId('gpaInfo').textContent;
  };
  const observer = new MutationObserver(refresh);
  [gpa,diploma,byId('gpaInfo')].forEach(node => observer.observe(node,{subtree:true,childList:true,characterData:true}));
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  refresh();
  const panel = document.createElement('details'); panel.className='paste-panel';
  const summary=document.createElement('summary'), hint=document.createElement('p'), label=document.createElement('label');
  const input=document.createElement('textarea'); input.id='coursePaste'; input.maxLength=20000; input.spellcheck=false; label.htmlFor=input.id;
  const actions=document.createElement('div'); actions.className='paste-actions';
  const preview=document.createElement('button'), apply=document.createElement('button');
  [preview,apply].forEach(b=>{b.type='button';b.className='picker-button'}); apply.disabled=true;
  const result=document.createElement('p'); result.className='paste-preview';result.setAttribute('role','status');result.setAttribute('aria-live','polite');
  actions.append(preview,apply);panel.append(summary,hint,label,input,actions,result);byId('rows').after(panel);
  let parsed=[],status=null;
  const words={title:['Ders listesini yapıştır','Paste a course list'],hint:['Her satıra ders kodu, SÜ kredisi ve harf notunu gir. Örnek: CS 201, 3, B+. Önce listeyi kontrol et; bilgiler cihazından gönderilmez. Bu araç bütün transkript biçimlerini otomatik tanımaz.','Enter a course code, SU credits and letter grade on each line. Example: CS 201, 3, B+. Review before adding; data stays on your device. Not all transcript formats are recognized.'],label:['Ders listesi','Course list'],preview:['Önizle','Preview'],apply:['Dersleri GPA hesabına ekle','Add courses to GPA'],empty:['Önizleme için en az bir ders gir.','Enter at least one course to preview.'],bad:['Geçersiz satırlar var. Her satırı KOD, KREDİ, HARF biçiminde kontrol et:','Some lines are invalid. Check each line uses CODE, CREDIT, GRADE:'],ok:['Ders önizlemesi; eklemeden önce kontrol et:','Course preview; review before adding:'],added:['Dersler GPA hesabına eklendi. Tekrarlanan derslerin sırasını kontrol et.','Courses added to GPA. Check the order of repeated courses.']};
  const lang=()=>document.documentElement.lang==='en'?1:0;const text=k=>words[k][lang()];
  function localize(){summary.textContent=text('title');hint.textContent=text('hint');label.textContent=text('label');preview.textContent=text('preview');apply.textContent=text('apply');if(status)show(status.key,status.extra)}
  function show(key,extra=''){status={key,extra};result.textContent=text(key)+(extra?'\n'+extra:'')}
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});localize();
  input.addEventListener('input',()=>{parsed=[];apply.disabled=true;status=null;result.textContent=''});
  preview.addEventListener('click',()=>{
    parsed=[];apply.disabled=true;const lines=input.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    if(!lines.length){show('empty');return}
    const bad=[];if(lines.length>100){show('bad','Maximum: 100');return}
    lines.forEach((line,i)=>{
      const m=line.match(/^\s*([A-Za-z]{2,8})\s*(\d{3,8}[A-Za-z]?)\s*[,;\t]\s*(\d+(?:[.]\d+)?)\s*[,;\t]\s*(A[-−]?|B[+\-−]?|C[+\-−]?|D\+?|F|NA-IN|NA-OUT|P|S|U|T|W)\s*$/i);
      if(!m || !(Number(m[3])>0 && Number(m[3])<=30)){bad.push(String(i+1));return}
      let grade=m[4].toUpperCase().replace('-', '−');if(grade==='NA−IN')grade='NA';else if(grade==='NA−OUT')grade='NA_OUT';else if(['P','S','U','T','W'].includes(grade))grade='P / S / U / T / W';
      parsed.push({code:m[1].toUpperCase()+' '+m[2].toUpperCase(),credit:m[3],grade});
    });
    if(bad.length){parsed=[];show('bad',bad.join(', '));return}
    const gradeNames={NA:'NA · GPA içi',NA_OUT:'NA · GPA dışı'};show('ok',parsed.map(x=>`${x.code} · ${x.credit} · ${gradeNames[x.grade]||x.grade}`).join('\n'));apply.disabled=false;
  });
  apply.addEventListener('click',()=>{
    if(!parsed.length)return;
    for(const entry of parsed){byId('add').click();const row=byId('rows').lastElementChild;const fields=row.querySelectorAll('input');fields[0].value=entry.code;fields[0].dispatchEvent(new Event('input',{bubbles:true}));fields[1].value=entry.credit;fields[1].dispatchEvent(new Event('input',{bubbles:true}));const grade=row.querySelector('select');grade.value=entry.grade;grade.dispatchEvent(new Event('change',{bubbles:true}));grade.dispatchEvent(new Event('input',{bubbles:true}));}
    parsed=[];apply.disabled=true;input.value='';show('added');
  });
})();
