/* Local-only, opt-in course scenarios. Requires the locally hosted Dexie bundle. */
(() => {
  'use strict';
  const host = document.querySelector('#course .card');
  if (!host) return;
  const t = {
    heading:['Kaydedilmiş dersler ve senaryolar','Saved courses and scenarios'],
    hint:['Kayıtlar yalnızca bu tarayıcıda saklanır. Tarayıcı verileri silinirse kaybolabilir; yedek indirmen önerilir. İndirdiğin yedek notlarını içerir ve şifrelenmez.','Saved only in this browser. Clearing browser data may remove them; download a backup. Your downloaded backup contains your grades and is not encrypted.'],
    label:['Kayıt adı','Name'],placeholder:['Örn. CS 300 – final hedefi','e.g. CS 300 – final goal'],
    save:['Bu senaryoyu kaydet','Save this scenario'],choose:['Kayıt seç','Choose a saved scenario'],load:['Yükle','Load'],remove:['Sil','Delete'],
    export:['Yedek indir','Download backup'],import:['Yedekten yükle','Import backup'],
    empty:['Henüz kayıt yok','No saved scenarios'],saved:['Senaryo kaydedildi.','Scenario saved.'],loaded:['Senaryo yüklendi.','Scenario loaded.'],
    deleted:['Senaryo silindi.','Scenario deleted.'],noName:['Kayıt için bir ad gir.','Enter a name for the scenario.'],
    noSelection:['Önce bir kayıt seç.','Choose a saved scenario first.'],confirm:['Bu kayıt silinsin mi?','Delete this saved scenario?'],
    bad:['Yedek dosyası geçersiz veya desteklenmiyor.','The backup is invalid or unsupported.'],
    badState:['Bu senaryoda geçersiz değerler var. Lütfen değerleri kontrol et.','This scenario contains invalid values. Please check the fields.'],
    changed:['Bu kaydın ders şablonu değişmiş veya doğrulanamıyor. Yanlış hesaplamayı önlemek için yüklenmedi; kaydın korunuyor.','The course template for this saved scenario has changed or cannot be verified. It was not loaded to prevent an incorrect calculation; the saved scenario is kept.'],
    imported:['Yedek içe aktarıldı. Mevcut kayıtlar korundu.','Backup imported. Existing records were kept.'],
    noData:['İndirilecek kayıt yok.','There are no saved scenarios to export.'],limit:['En fazla 200 kayıt saklanabilir. Önce bazı kayıtları sil.','A maximum of 200 scenarios can be stored. Delete some first.'],
    unavailable:['Cihazda kayıt kullanılamıyor. Tarayıcı izinlerini veya depolama alanını kontrol et.','Local storage is unavailable. Check browser permissions and storage space.'],
    importLabel:['Bir JSON yedek dosyası seç','Choose a JSON backup file']
  };
  const lang = () => document.documentElement.lang === 'en' ? 1 : 0;
  const tr = key => t[key][lang()];
  const el = (tag, attributes = {}) => {
    const node = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => key === 'className' ? node.className = value : node.setAttribute(key,value));
    return node;
  };
  const panel=el('details',{className:'scenario-panel'}), summary=el('summary'), body=el('div'), hint=el('p',{className:'muted'}), label=el('label',{for:'scenarioName'}), name=el('input',{id:'scenarioName',type:'text',maxlength:'80',autocomplete:'off'}), save=el('button',{type:'button',className:'picker-button'}), selectLabel=el('label',{for:'scenarioSelect'}), select=el('select',{id:'scenarioSelect'}), buttons=el('div',{className:'scenario-actions'}), load=el('button',{type:'button',className:'picker-button'}), remove=el('button',{type:'button',className:'picker-button'}), exp=el('button',{type:'button',className:'picker-button'}), imp=el('button',{type:'button',className:'picker-button'}), file=el('input',{id:'scenarioImport',type:'file',accept:'application/json,.json',hidden:''}), status=el('p',{className:'scenario-status',role:'status','aria-live':'polite'});
  buttons.append(load,remove,exp,imp);body.append(hint,label,name,save,selectLabel,select,buttons,file,status);panel.append(summary,body);
  const source = document.querySelector('#syllabusSource');
  if (source && source.parentElement===host) source.insertAdjacentElement('afterend',panel); else host.append(panel);
  const style=el('style');style.textContent='.scenario-panel{border-top:1px solid #d8e0ee;margin-top:20px;padding-top:4px}.scenario-panel summary{cursor:pointer;font-size:14px;font-weight:700;color:#245aaa}.scenario-panel .muted{margin:10px 0 0}.scenario-panel label{margin-top:14px}.scenario-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}.scenario-panel .picker-button{margin-top:7px}.scenario-status{min-height:1.3em;font-size:12px;margin:10px 0 0}.scenario-panel input[hidden]{display:none}html[data-theme="dark"] .scenario-panel{border-color:#40516d}html[data-theme="dark"] .scenario-panel summary{color:#a9caff}';document.head.append(style);
  let lastLang=-1;function localize(){if(lang()===lastLang)return;lastLang=lang();summary.textContent=tr('heading');hint.textContent=tr('hint');label.textContent=tr('label');name.placeholder=tr('placeholder');save.textContent=tr('save');selectLabel.textContent=tr('choose');load.textContent=tr('load');remove.textContent=tr('remove');exp.textContent=tr('export');imp.textContent=tr('import');file.setAttribute('aria-label',tr('importLabel'));if(select.options.length && !select.options[0].value)select.options[0].textContent=tr(select.options.length===1?'empty':'choose');if(status.dataset.msg) status.textContent=tr(status.dataset.msg);}
  const setStatus=k=>{status.dataset.msg=k;status.textContent=tr(k)};
  let db;
  try { if(!window.Dexie) throw Error('Dexie unavailable'); db=new window.Dexie('su-grades-scenarios');db.version(1).stores({scenarios:'id,updatedAt'}); }
  catch (_) { setStatus('unavailable'); }
  const plainText=(v,max)=>typeof v==='string' && v.length<=max && !/[<>\u0000-\u001f\u007f]/.test(v);
  const score=(v,max=100)=>typeof v==='string' && (v==='' || (/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(v) && Number.isFinite(Number(v)) && +v>=0 && +v<=max));
  const normalizeFields = fields => fields.map(f=>[f[0],f[1],f[2]??null]);
  function validateTemplateFields(fields){
    return Array.isArray(fields) && fields.length>0 && fields.length<=30 && fields.every(f=>Array.isArray(f) && f.length===3 && plainText(f[0],100) && typeof f[1]==='number' && Number.isFinite(f[1]) && f[1]>=0 && f[1]<=100 && [null,'ns','bonus3','bonus5'].includes(f[2]));
  }
  function validateRecord(x){
    if(!x || typeof x!=='object' || Array.isArray(x) || x.version!==1 || !plainText(x.name,80) || !x.name.trim() || !plainText(x.courseName,100) || !['builtin','custom'].includes(x.kind) || !Array.isArray(x.thresholds) || x.thresholds.length!==10 || !x.thresholds.every(v=>score(v)))return false;
    if(x.kind==='builtin'){
      if(!Array.isArray(x.scores) || !x.scores.length || x.scores.length>30 || !x.scores.every(v=>score(v)))return false;
      if(x.templateFields===undefined)return true; // Old records are preserved, but cannot be loaded blindly.
      return validateTemplateFields(x.templateFields) && x.scores.length===x.templateFields.length && x.scores.every((v,i)=>score(v,x.templateFields[i][2]==='bonus5'?5:x.templateFields[i][2]==='bonus3'?3:100));
    }
    return plainText(x.code,80) && Array.isArray(x.components) && x.components.length<=30 && x.components.every(c=>c && typeof c==='object' && !Array.isArray(c) && plainText(c.name,100) && score(c.weight) && score(c.score));
  }
  function compatibleRecord(x){
    if(x.kind==='custom')return true;
    const c=courses.find(c=>!c.custom && c.name===x.courseName);
    return !!c && !!x.templateFields && JSON.stringify(x.templateFields)===JSON.stringify(normalizeFields(c.fields));
  }
  const uid=()=>{if(crypto.randomUUID)return crypto.randomUUID();const x=new Uint8Array(16);crypto.getRandomValues(x);return [...x].map(n=>n.toString(16).padStart(2,'0')).join('')};
  function snapshot(){
    const c=courses[sel.value], record={version:1,name:name.value.trim(),kind:c.custom?'custom':'builtin',courseName:c.custom?'Kendi dersini oluştur':c.name,thresholds:[...document.querySelectorAll('#scale input')].map(x=>x.value)};
    if(c.custom){record.code=c.code||'';record.components=c.components.map(({name,weight,score})=>({name:String(name),weight:String(weight),score:String(score)}));}
    else {record.scores=[...fields.querySelectorAll('input')].map(x=>x.value);record.templateFields=normalizeFields(c.fields);}
    return record;
  }
  function restore(r){
    if(r.kind==='custom'){
      const index=courses.findIndex(c=>c.custom);if(index<0)throw Error('missing custom');
      const c=courses[index];c.code=r.code;c.name=r.code||'Kendi dersini oluştur';c.components=r.components.map(x=>({...x}));sel.value=String(index);renderCourse();
    }else{
      const index=courses.findIndex(c=>!c.custom && c.name===r.courseName);if(index<0 || courses[index].fields.length!==r.scores.length)throw Error('missing course');
      sel.value=String(index);renderCourse();[...fields.querySelectorAll('input')].forEach((x,i)=>{x.value=r.scores[i]});
    }
    [...document.querySelectorAll('#scale input')].forEach((x,i)=>{x.value=r.thresholds[i]});
    const selected=courses[sel.value];if(selected.custom)calcCustom(selected);else calc();
    if(typeof window.suTranslationRefresh==='function')window.suTranslationRefresh();
    document.querySelector('#tab-course').click();
  }
  async function refresh(selected){
    if(!db)throw Error('unavailable');const rows=await db.scenarios.orderBy('updatedAt').reverse().toArray();
    select.replaceChildren();if(!rows.length){const option=el('option',{value:''});option.textContent=tr('empty');select.append(option)}
    else {const option=el('option',{value:''});option.textContent=tr('choose');select.append(option);rows.forEach(row=>{if(!validateRecord(row))return;const opt=el('option',{value:row.id});opt.textContent=row.name;select.append(opt)});}
    if(selected)select.value=selected;
  }
  save.addEventListener('click',async()=>{try{if(!name.value.trim()){setStatus('noName');name.focus();return;}const data=snapshot();if(!validateRecord(data)){setStatus('badState');return;}if(!db)throw Error('db');if(await db.scenarios.count()>=200){setStatus('limit');return;}data.id=uid();data.updatedAt=Date.now();await db.scenarios.add(data);await refresh(data.id);setStatus('saved')}catch(_){setStatus('unavailable')}});
  load.addEventListener('click',async()=>{try{if(!select.value){setStatus('noSelection');return}const r=await db.scenarios.get(select.value);if(!validateRecord(r)){setStatus('bad');return}if(!compatibleRecord(r)){setStatus('changed');return}restore(r);name.value=r.name;setStatus('loaded')}catch(_){setStatus('unavailable')}});
  remove.addEventListener('click',async()=>{try{if(!select.value){setStatus('noSelection');return}if(!window.confirm(tr('confirm')))return;await db.scenarios.delete(select.value);await refresh();setStatus('deleted')}catch(_){setStatus('unavailable')}});
  exp.addEventListener('click',async()=>{try{const rows=await db.scenarios.toArray();if(!rows.length){setStatus('noData');return}if(!rows.every(validateRecord)){setStatus('bad');return}const sanitized=rows.map(({version,name,kind,courseName,thresholds,code,components,scores,templateFields})=>({version,name,kind,courseName,thresholds,...(kind==='custom'?{code,components}:{scores,...(templateFields===undefined?{}:{templateFields})})}));const blob=new Blob([JSON.stringify({format:'su-grades-scenarios',version:1,scenarios:sanitized},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=el('a',{href:url,download:'su-grades-yedek.json'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(_){setStatus('unavailable')}});
  imp.addEventListener('click',()=>file.click());file.addEventListener('change',async()=>{try{const f=file.files?.[0];if(!f)return;if(f.size>1024*1024)throw Error('size');const parsed=JSON.parse(await f.text());if(!parsed || parsed.format!=='su-grades-scenarios' || parsed.version!==1 || !Array.isArray(parsed.scenarios) || parsed.scenarios.length>200 || !parsed.scenarios.every(validateRecord))throw Error('invalid');if((await db.scenarios.count())+parsed.scenarios.length>200){setStatus('limit');return;}const fresh=parsed.scenarios.map(r=>({version:1,name:r.name,kind:r.kind,courseName:r.courseName,thresholds:r.thresholds,...(r.kind==='custom'?{code:r.code,components:r.components.map(c=>({name:c.name,weight:c.weight,score:c.score}))}:{scores:r.scores,...(r.templateFields===undefined?{}:{templateFields:r.templateFields.map(f=>[...f])})}),id:uid(),updatedAt:Date.now()}));await db.transaction('rw',db.scenarios,()=>db.scenarios.bulkAdd(fresh));await refresh();setStatus('imported')}catch(error){setStatus(error instanceof SyntaxError || error.message==='invalid' || error.message==='size'?'bad':'unavailable')}finally{file.value=''}});
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});localize();refresh().catch(()=>setStatus('unavailable'));
})();
