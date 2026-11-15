/* Register the offline shell and let visitors opt in to an available update. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  let updateRegistration = null, reloadRequested = false;
  const style=document.createElement('style');
  style.textContent='.offline-update{position:fixed;z-index:100;left:50%;bottom:16px;transform:translateX(-50%);width:max-content;max-width:calc(100vw - 32px);display:flex;gap:12px;align-items:center;background:#002776;color:#fff;padding:12px 14px;border-radius:12px;box-shadow:0 4px 25px #0006;font:inherit;font-size:13px}.offline-update[hidden]{display:none}.offline-update button{border:1px solid #fff;border-radius:7px;background:transparent;color:#fff;font:inherit;font-weight:700;padding:7px 11px;cursor:pointer}.offline-update button:focus-visible{outline:2px solid white;outline-offset:3px}';
  document.head.append(style);
  const banner=document.createElement('div'); banner.className='offline-update'; banner.hidden=true; banner.setAttribute('role','status');
  const label=document.createElement('span'); const button=document.createElement('button'); button.type='button'; banner.append(label,button); document.body.append(banner);
  let lastLanguage = null;
  function updateText(){const lang=document.documentElement.lang;if(lang===lastLanguage)return;lastLanguage=lang;const en=lang==='en';const msg=en?'An updated version is available. Save your work before updating.':'Yeni bir sürüm hazır. Güncellemeden önce notlarını kaydet.';const action=en?'Update':'Güncelle';if(label.textContent!==msg)label.textContent=msg;if(button.textContent!==action)button.textContent=action;}
  new MutationObserver(updateText).observe(document.documentElement,{attributes:true,attributeFilter:['lang']}); updateText();
  button.addEventListener('click',()=>{if(updateRegistration&&updateRegistration.waiting){reloadRequested=true;updateRegistration.waiting.postMessage({type:'SKIP_WAITING'});button.disabled=true;}});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloadRequested) window.location.reload();});
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(reg=>{
      updateRegistration=reg;
      const show=()=>{if(reg.waiting&&navigator.serviceWorker.controller)banner.hidden=false;};
      show();
      reg.addEventListener('updatefound',()=>{const installing=reg.installing;if(!installing)return;installing.addEventListener('statechange',()=>{if(installing.state==='installed')show();});});
    }).catch(()=>{/* The calculator still works without offline support. */});
  });
})();
