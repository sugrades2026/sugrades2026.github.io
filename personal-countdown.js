/* A student's own dates, stored on this device only. No institutional dates are assumed. */
(() => {
  'use strict';
  const dashboard = document.querySelector('#student-dashboard');
  if (!dashboard || document.querySelector('#dashboard-countdown')) return;
  const key = 'sugrades-personal-countdown-v1';
  const words = {
    tr:{heading:'Kişisel sınav geri sayımı',intro:'Kendi sınavını veya etkinliğini ekle. Bu, resmî üniversite takvimi değildir.',title:'Sınav veya etkinlik adı',date:'Tarih',save:'Kaydet / güncelle',remove:'Sil',privacy:'Kayıt bu tarayıcıda saklanır; sunucuya gönderilmez. Hassas bilgi yazma.',empty:'Henüz bir tarih eklenmedi.',missing:'Bir ad ve geçerli bir tarih gir.',saved:'Kayıt bu cihazda saklandı.',session:'Tarayıcı depolaması kullanılamıyor; bu kayıt yalnızca bu oturumda kalır.',deleted:'Kişisel kayıt silindi.',deleteFailed:'Bu oturumdaki kayıt temizlendi, ancak tarayıcı depolamasından silinemedi.',today:'Bugün',future:'gün kaldı',past:'gün önceydi',invalid:'Kayıtlı tarih okunamadı; lütfen yeniden gir.'},
    en:{heading:'Personal exam countdown',intro:'Add your own exam or event. This is not the official university calendar.',title:'Exam or event name',date:'Date',save:'Save / update',remove:'Delete',privacy:'Your entry is stored in this browser and is not sent to a server. Do not enter sensitive information.',empty:'No date has been added yet.',missing:'Enter a name and a valid date.',saved:'Saved on this device.',session:'Browser storage is unavailable; this entry will last only for this session.',deleted:'Personal entry deleted.',deleteFailed:'The session entry was cleared, but browser storage could not be updated.',today:'Today',future:'days remaining',past:'days ago',invalid:'The saved date could not be read; please enter it again.'}
  };
  const language = () => document.documentElement.lang === 'en' ? 'en' : 'tr';
  const element = (tag, name) => { const node=document.createElement(tag); if(name) node.className='dashboard-countdown-'+name; return node; };
  const style=element('style');
  style.textContent='.dashboard-countdown-box{grid-column:1/-1;margin-top:20px;padding-top:20px;border-top:1px solid #dce4f2}.dashboard-countdown-title{font-size:16px;margin:0 0 6px}.dashboard-countdown-intro,.dashboard-countdown-privacy{font-size:12px;line-height:1.5;margin:5px 0 12px;color:#586780}.dashboard-countdown-fields{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,180px);gap:12px}.dashboard-countdown-label{margin:0;display:block;font-size:12px}.dashboard-countdown-input{margin-top:6px;min-width:0;width:100%}.dashboard-countdown-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.dashboard-countdown-button{font:inherit;font-size:12px;font-weight:700;min-height:42px;padding:9px 14px;border:1px solid #aabbd7;border-radius:8px;color:#002776;background:#f8faff;cursor:pointer}.dashboard-countdown-button:hover{background:#e8eef9}.dashboard-countdown-button:focus-visible{outline:3px solid #e37222;outline-offset:2px}.dashboard-countdown-output{color:#20385f;font-size:14px;font-weight:700;margin:14px 0 6px;line-height:1.5;overflow-wrap:anywhere}.dashboard-countdown-status{font-size:12px;color:#586780;min-height:1em;margin:4px 0}.dashboard-countdown-privacy{margin-bottom:0}html[data-theme="dark"] .dashboard-countdown-box{border-color:#444}html[data-theme="dark"] .dashboard-countdown-output{color:#e9efff}html[data-theme="dark"] .dashboard-countdown-intro,html[data-theme="dark"] .dashboard-countdown-status,html[data-theme="dark"] .dashboard-countdown-privacy{color:#bac7da}html[data-theme="dark"] .dashboard-countdown-button{background:#222;color:#eff5ff;border-color:#667186}html[data-theme="dark"] .dashboard-countdown-button:hover{background:#333}@media(max-width:480px){.dashboard-countdown-fields{grid-template-columns:1fr}}';
  document.head.append(style);
  const section=element('section','box'); section.id='dashboard-countdown';
  const heading=element('h3','title'),intro=element('p','intro'),form=element('form','form'),fields=element('div','fields');
  const titleLabel=element('label','label'),titleCaption=element('span'),title=element('input','input'); title.type='text';title.maxLength=100;title.autocomplete='off';titleLabel.append(titleCaption,title);
  const dateLabel=element('label','label'),dateCaption=element('span'),date=element('input','input');date.type='date';dateLabel.append(dateCaption,date);fields.append(titleLabel,dateLabel);
  const actions=element('div','actions'),save=element('button','button'),remove=element('button','button');save.type='submit';remove.type='button';actions.append(save,remove);form.append(fields,actions);
  const output=element('p','output'); output.setAttribute('aria-live','polite');
  const status=element('p','status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const privacy=element('p','privacy');section.append(heading,intro,form,output,status,privacy);dashboard.append(section);
  function parseDate(raw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    const [year,month,day]=raw.split('-').map(Number);
    if(year<1||month<1||month>12||day<1||day>31)return null;
    const value=new Date(0);value.setUTCHours(0,0,0,0);value.setUTCFullYear(year,month-1,day);
    return value.getUTCFullYear()===year&&value.getUTCMonth()===month-1&&value.getUTCDate()===day?value:null;
  }
  let entry=null, statusKey='';
  try {
    const raw=localStorage.getItem(key);
    if(raw){const parsed=JSON.parse(raw); if(parsed && typeof parsed.title==='string' && parsed.title.trim() && parsed.title.length<=100 && typeof parsed.date==='string' && parseDate(parsed.date))entry={title:parsed.title.trim(),date:parsed.date}; else statusKey='invalid';}
  } catch (_) { /* Keep the widget usable when storage is blocked or malformed. */ }
  if(entry){title.value=entry.title;date.value=entry.date;}
  function render() {
    const lng=language(),t=words[lng];heading.textContent=t.heading;intro.textContent=t.intro;titleCaption.textContent=t.title;dateCaption.textContent=t.date;save.textContent=t.save;remove.textContent=t.remove;privacy.textContent=t.privacy;status.textContent=statusKey?t[statusKey]:'';
    if(!entry){output.textContent=t.empty;return;}
    const eventDate=parseDate(entry.date);
    if(!eventDate){output.textContent=t.invalid;return;}
    const now=new Date();const today=new Date(0);today.setUTCHours(0,0,0,0);today.setUTCFullYear(now.getFullYear(),now.getMonth(),now.getDate());
    const days=Math.round((eventDate.getTime()-today.getTime())/86400000);
    const formatted=new Intl.DateTimeFormat(lng==='en'?'en-GB':'tr-TR',{dateStyle:'long',timeZone:'UTC'}).format(eventDate);
    const remaining=days===0?t.today:Math.abs(days)+' '+(days>0?t.future:t.past);
    output.textContent=entry.title+' · '+formatted+' · '+remaining;
  }
  form.addEventListener('submit',event=>{
    event.preventDefault(); const name=title.value.trim();const selected=date.value;
    if(!name||name.length>100||!parseDate(selected)){statusKey='missing';render();return;}
    entry={title:name,date:selected};
    try{localStorage.setItem(key,JSON.stringify(entry));statusKey='saved';}catch(_){statusKey='session';}
    render();
  });
  remove.addEventListener('click',()=>{entry=null;title.value='';date.value='';try{localStorage.removeItem(key);statusKey='deleted';}catch(_){statusKey='deleteFailed';}render();});
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
  render();
})();
