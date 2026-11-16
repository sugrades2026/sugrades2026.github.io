/* su.grades offline application shell. Personal entries remain in IndexedDB. */
'use strict';
importScripts('./workbox-sw.js');
workbox.setConfig({modulePathPrefix:new URL('./',self.registration.scope).href,debug:false});
const CACHE_NAME='sugrades-offline-v4';
const SCOPE_URL=new URL(self.registration.scope);
const CORE_ASSETS=['./','./index.html','./course-catalog.js','./diploma.js','./translations.js','./navigation.js','./scenario-storage.js','./dexie.min.js','./grade-chart.js','./chart.umd.js','./offline.js','./manifest.webmanifest','./pwa-icon.svg','./favicon.png'];
const OPTIONAL_ASSETS=['./pdf-import.mjs','./pdf.min.mjs','./pdf.worker.min.mjs'];
const ALL_ASSETS=[...CORE_ASSETS,...OPTIONAL_ASSETS];
const allowedPaths=new Set(ALL_ASSETS.map(path=>new URL(path,SCOPE_URL).pathname));
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS.map(path=>new URL(path,SCOPE_URL).href));
    await Promise.allSettled(OPTIONAL_ASSETS.map(path=>cache.add(new URL(path,SCOPE_URL).href)));
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('sugrades-offline-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting();
});
const canonicalKey={
  cacheKeyWillBeUsed:async({request})=>{
    const url=new URL(request.url);
    return new Request(url.origin+url.pathname,{method:'GET'});
  },
  cacheWillUpdate:async({response})=>response&&response.status===200&&response.type==='basic'?response:null
};
const strategy=new workbox.strategies.NetworkFirst({cacheName:CACHE_NAME,networkTimeoutSeconds:3,plugins:[canonicalKey]});
workbox.routing.registerRoute(({request,url})=>request.method==='GET'&&url.origin===SCOPE_URL.origin&&allowedPaths.has(url.pathname),({event,request})=>strategy.handle({event,request}));
