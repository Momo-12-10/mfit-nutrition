// Release v137: small-screen responsive layout
// Release v136: recent foods quick-entry shortcuts
// Release v138: accessibility labels and keyboard support
// Release v137: small-screen responsive layout
// Release v136: recent foods quick-entry shortcuts
// Release v135: save reusable food favorites
// Release v134: four-category settings navigation
// Release v133: bottom navigation and iPhone safe-area polish
// Release v132: food favorites and simplified settings
// Release v131: compact settings and restored bottom navigation
// Release v130: final cache and install manifest validation
// Release v129: installability and cache validation
// Release v128: dashboard visibility controls
// Release v127: accessibility and reduced-motion refinements
// Release v126: mobile layout refinements
// Release v125: daily nutrition ring polish
// Release v124: one-tap hydration quick action
// Release v123: weekly training activity and muscle-group overview
// Release v122: bodyweight, recovery and meal split views
const CACHE='mfit-performance-v138';
const FILES=['./','./index.html','./manifest.webmanifest','./icon.svg','./apple-touch-icon.png','./styles.css','./app-core.js','./app.js','./mfit-plus.js','./i18n.js','./workout-planner.js','./mfit-advanced.js','./mfit-cloud.js','./mfit-pro.js','./mfit-ultimate.js','./mfit-extras.js','./mfit-next.js','./mfit-ui.js','./mfit-enhancements.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 const isPage=event.request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/mfit-nutrition/');
 if(isPage){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
   return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
 }else{
  const cleanUrl=new URL(event.request.url);cleanUrl.search='';
  event.respondWith(caches.match(event.request).then(cached=>cached||caches.match(cleanUrl.href).then(baseCached=>baseCached||fetch(event.request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
   return response;
  }))));
 }
});