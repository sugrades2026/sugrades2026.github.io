/* Register the offline shell and let visitors opt in to an available update. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  let updateRegistration = null, reloadRequested = false, dismissedWorker = null;
  const style = document.createElement('style');
  style.textContent = '.offline-update{box-sizing:border-box;max-width:1052px;width:calc(100% - 48px);margin:16px auto 0;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;background:#002776;color:#fff;padding:12px 14px;border-radius:12px;box-shadow:0 4px 25px #0003;font:inherit;font-size:13px}.offline-update[hidden]{display:none}.offline-update-message{flex:1 1 260px;line-height:1.5}.offline-update-actions{display:flex;flex-wrap:wrap;gap:8px}.offline-update button{min-height:44px;border:1px solid #fff;border-radius:7px;background:transparent;color:#fff;font:inherit;font-weight:700;padding:8px 12px;cursor:pointer}.offline-update button:disabled{opacity:.65;cursor:default}.offline-update button:focus-visible{outline:2px solid white;outline-offset:3px}@media(max-width:480px){.offline-update{width:calc(100% - 32px)}}';
  document.head.append(style);
  const banner = document.createElement('section');
  banner.className = 'offline-update'; banner.hidden = true; banner.setAttribute('role','region');
  const label = document.createElement('span'); label.className = 'offline-update-message'; label.setAttribute('role','status');
  const actions = document.createElement('div'); actions.className = 'offline-update-actions';
  const button = document.createElement('button'); button.type = 'button';
  const later = document.createElement('button'); later.type = 'button';
  actions.append(button,later); banner.append(label,actions);
  const main = document.querySelector('main');
  if (main && main.parentNode === document.body) document.body.insertBefore(banner,main); else document.body.append(banner);
  let lastLanguage = null;
  function updateText() {
    const lang = document.documentElement.lang;
    if (lang === lastLanguage) return;
    lastLanguage = lang;
    const en = lang === 'en';
    banner.setAttribute('aria-label',en ? 'Update notification' : 'Güncelleme bildirimi');
    label.textContent = en ? 'An updated version is available. Save your work before updating.' : 'Yeni bir sürüm hazır. Güncellemeden önce notlarını kaydet.';
    button.textContent = en ? 'Update' : 'Güncelle';
    later.textContent = en ? 'Later' : 'Daha sonra';
  }
  new MutationObserver(updateText).observe(document.documentElement,{attributes:true,attributeFilter:['lang']}); updateText();
  button.addEventListener('click',()=>{
    if (updateRegistration && updateRegistration.waiting) {
      reloadRequested = true;
      updateRegistration.waiting.postMessage({type:'SKIP_WAITING'});
      button.disabled = true; later.disabled = true;
    }
  });
  later.addEventListener('click',()=>{
    dismissedWorker = updateRegistration && updateRegistration.waiting;
    const hadFocus = document.activeElement === later;
    banner.hidden = true;
    if (hadFocus && main) {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex','-1');
      main.focus({preventScroll:true});
    }
  });
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloadRequested) window.location.reload();});
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(reg=>{
      updateRegistration = reg;
      const show=()=>{if(reg.waiting && navigator.serviceWorker.controller && reg.waiting!==dismissedWorker) banner.hidden=false;};
      show();
      reg.addEventListener('updatefound',()=>{
        const installing=reg.installing;
        if(!installing)return;
        installing.addEventListener('statechange',()=>{if(installing.state==='installed')show();});
      });
    }).catch(()=>{/* The calculator still works without offline support. */});
  });
})();
