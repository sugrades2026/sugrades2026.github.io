/* Personal credit goal; the student sets the target, not the university. */
(() => {
  'use strict';
  const dashboard = document.querySelector('#student-dashboard');
  if (!dashboard || document.querySelector('#dashboard-progress')) return;
  const key = 'sugrades-personal-credit-goal-v1';
  const words = {
    tr:{heading:'Kişisel kredi hedefi',intro:'Tamamladığın ve hedeflediğin krediyi gir. Bu gösterge resmî mezuniyet uygunluğunu hesaplamaz.',unit:'Kredi türü',completed:'Tamamlanan kredi',goal:'Kendi kredi hedefin',save:'Kaydet / güncelle',remove:'Sil',privacy:'Kaydettiğinde bilgiler yalnızca bu tarayıcıda saklanır; sunucuya gönderilmez.',empty:'İlerlemeyi görmek için kredi bilgilerini gir.',invalid:'Tamamlanan kredi 0–10.000, hedef ise 0’dan büyük ve en fazla 10.000 olmalı.',progress:'Hedefin',of:'/',reached:'Hedefine ulaştın veya hedefini aştın.',saved:'Kredi hedefin bu cihazda saklandı.',session:'Tarayıcı depolaması kullanılamıyor; bilgiler yalnızca bu oturumda kalır.',deleted:'Kredi hedefi silindi.',deleteFailed:'Bu oturumdaki hedef temizlendi, ancak tarayıcı depolamasından silinemedi.',unsaved:'Değişiklikleri saklamak için Kaydet / güncelle seçeneğini kullan.',aria:'Kişisel kredi hedefine ilerleme'},
    en:{heading:'Personal credit goal',intro:'Enter completed and target credits. This indicator does not determine official graduation eligibility.',unit:'Credit type',completed:'Completed credits',goal:'Your credit goal',save:'Save / update',remove:'Delete',privacy:'If saved, this information stays in this browser and is not sent to a server.',empty:'Enter your credits to see your progress.',invalid:'Completed credits must be 0–10,000; your goal must be greater than 0 and no more than 10,000.',progress:'Goal',of:'/',reached:'You have reached or exceeded your goal.',saved:'Your credit goal was saved on this device.',session:'Browser storage is unavailable; this information will last only for this session.',deleted:'Credit goal deleted.',deleteFailed:'The session goal was cleared, but browser storage could not be updated.',unsaved:'Select Save / update to keep your changes.',aria:'Progress towards your personal credit goal'}
  };
  const lang=()=>document.documentElement.lang==='en'?'en':'tr';
  const make=(tag,name)=>{const node=document.createElement(tag);if(name)node.className='dashboard-progress-'+name;return node};
  const style=make('style');
  style.textContent='.dashboard-progress-box{grid-column:1/-1;margin-top:20px;padding-top:20px;border-top:1px solid #dce4f2}.dashboard-progress-title{font-size:16px;margin:0 0 6px}.dashboard-progress-intro,.dashboard-progress-privacy{font-size:12px;line-height:1.5;margin:5px 0 12px;color:#586780}.dashboard-progress-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.dashboard-progress-label{margin:0;font-size:12px}.dashboard-progress-input,.dashboard-progress-select{width:100%;min-width:0;margin-top:6px}.dashboard-progress-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.dashboard-progress-button{font:inherit;font-size:12px;font-weight:700;min-height:42px;padding:9px 14px;border:1px solid #aabbd7;border-radius:8px;color:#002776;background:#f8faff;cursor:pointer}.dashboard-progress-button:hover{background:#e8eef9}.dashboard-progress-button:focus-visible{outline:3px solid #e37222;outline-offset:2px}.dashboard-progress-result{color:#20385f;font-size:14px;font-weight:700;margin:14px 0 6px;line-height:1.5}.dashboard-progress-meter{width:100%;height:12px;accent-color:#275bc0;display:block}.dashboard-progress-status{font-size:12px;color:#586780;min-height:1em;margin:6px 0}.dashboard-progress-privacy{margin-bottom:0}html[data-theme="dark"] .dashboard-progress-box{border-color:#444}html[data-theme="dark"] .dashboard-progress-result{color:#e9efff}html[data-theme="dark"] .dashboard-progress-intro,html[data-theme="dark"] .dashboard-progress-status,html[data-theme="dark"] .dashboard-progress-privacy{color:#bac7da}html[data-theme="dark"] .dashboard-progress-button{background:#222;color:#eff5ff;border-color:#667186}html[data-theme="dark"] .dashboard-progress-button:hover{background:#333}@media(max-width:480px){.dashboard-progress-fields{grid-template-columns:1fr}}';
  document.head.append(style);
  const section=make('section','box');section.id='dashboard-progress';
  const heading=make('h3','title'),intro=make('p','intro'),form=make('form','form'),fields=make('div','fields');
  const unitLabel=make('label','label'),unitCaption=make('span'),unit=make('select','select');
  [['SU','SÜ / SU'],['ECTS','AKTS / ECTS']].forEach(([value,text])=>{const option=make('option');option.value=value;option.textContent=text;unit.append(option)});unitLabel.append(unitCaption,unit);
  function field(){const label=make('label','label'),caption=make('span'),input=make('input','input');input.type='text';input.inputMode='decimal';input.maxLength=12;input.autocomplete='off';label.append(caption,input);return {label,caption,input}}
  const completed=field(),goal=field();fields.append(unitLabel,completed.label,goal.label);
  const actions=make('div','actions'),save=make('button','button'),remove=make('button','button');save.type='submit';remove.type='button';actions.append(save,remove);form.append(fields,actions);
  const result=make('p','result');result.setAttribute('aria-live','polite');
  const meter=make('progress','meter');meter.max=100;meter.value=0;meter.hidden=true;
  const status=make('p','status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const privacy=make('p','privacy');section.append(heading,intro,form,result,meter,status,privacy);dashboard.append(section);
  const parse=raw=>{const text=String(raw).trim();return /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)?Number(text.replace(',','.')):NaN};
  function read(){const done=parse(completed.input.value),target=parse(goal.input.value);return Number.isFinite(done)&&done>=0&&done<=10000&&Number.isFinite(target)&&target>0&&target<=10000&&['SU','ECTS'].includes(unit.value)?{completed:done,goal:target,unit:unit.value}:null}
  let statusKey='';
  try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(stored&&typeof stored.completed==='number'&&stored.completed>=0&&stored.completed<=10000&&typeof stored.goal==='number'&&stored.goal>0&&stored.goal<=10000&&['SU','ECTS'].includes(stored.unit)){completed.input.value=String(stored.completed);goal.input.value=String(stored.goal);unit.value=stored.unit}}catch(_){}
  function render(){const lng=lang(),t=words[lng],value=read();heading.textContent=t.heading;intro.textContent=t.intro;unitCaption.textContent=t.unit;completed.caption.textContent=t.completed;goal.caption.textContent=t.goal;save.textContent=t.save;remove.textContent=t.remove;privacy.textContent=t.privacy;meter.setAttribute('aria-label',t.aria);status.textContent=statusKey?t[statusKey]:'';
    if(!completed.input.value.trim()&&!goal.input.value.trim()){result.textContent=t.empty;meter.hidden=true;return}
    if(!value){result.textContent=t.invalid;meter.hidden=true;return}
    const format=n=>new Intl.NumberFormat(lng==='en'?'en-US':'tr-TR',{maximumFractionDigits:2}).format(n);
    const percent=value.completed/value.goal*100;const unitName=value.unit==='SU'?(lng==='en'?'SU':'SÜ'):(lng==='en'?'ECTS':'AKTS');
    result.textContent=t.progress+': '+format(value.completed)+' '+t.of+' '+format(value.goal)+' '+unitName+' · '+format(percent)+'%'+(percent>=100?' · '+t.reached:'');
    meter.hidden=false;meter.value=Math.min(100,percent);meter.setAttribute('aria-valuetext',format(percent)+'%');
  }
  form.addEventListener('input',()=>{statusKey='unsaved';render()});
  form.addEventListener('change',()=>{statusKey='unsaved';render()});
  form.addEventListener('submit',event=>{event.preventDefault();const value=read();if(!value){statusKey='invalid';render();return}try{localStorage.setItem(key,JSON.stringify(value));statusKey='saved'}catch(_){statusKey='session'}render()});
  remove.addEventListener('click',()=>{completed.input.value='';goal.input.value='';unit.value='SU';try{localStorage.removeItem(key);statusKey='deleted'}catch(_){statusKey='deleteFailed'}render()});
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
})();
