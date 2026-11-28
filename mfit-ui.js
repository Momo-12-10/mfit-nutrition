/* MFit v131 — compact settings navigation and restored native-style bottom bar */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const groups=[
 {id:'personal',icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="7" cy="18" r="2"/></svg>',title:'Darstellung & Bedienung',desc:'Design, Sprache und App-Verhalten',items:['appAppearance','mfitAppPreferences','mfitLanguageSettings']},
 {id:'reminders',icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',title:'Erinnerungen',desc:'Trink- und Mahlzeiten-Erinnerungen',items:['appReminders']},
 {id:'privacy',icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',title:'Datenschutz & Daten',desc:'Privatsphäre, Backup und Speicher',items:['privacyCenter','dataBackup','mfitDataTools']},
 {id:'about',icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/></svg>',title:'Über MFit',desc:'Installation, Status und Version',items:['mfitAppStatus','mfitAboutSettings','mfitReleaseReadiness']}
];
let active='home';
function makeButton(g){
 const b=document.createElement('button');b.type='button';b.className='mfit-settings-category';b.innerHTML='<span class="mfit-category-icon">'+g.icon+'</span><span class="mfit-category-copy"><b>'+g.title+'</b><small>'+g.desc+'</small></span><span class="mfit-category-arrow">›</span>';b.addEventListener('click',()=>openGroup(g.id));return b;
}
function ensureSettings(){
 const root=$('settings'),hub=$('settingsHub');if(!root||!hub||$('mfitSettingsPages'))return;
 const grid=hub.querySelector('.settings-shortcuts');if(grid)grid.remove();
 const pages=document.createElement('div');pages.id='mfitSettingsPages';pages.className='mfit-settings-pages';
 const landing=document.createElement('div');landing.id='mfitSettingsLanding';landing.className='mfit-settings-landing';
 groups.forEach(g=>landing.appendChild(makeButton(g)));
 pages.appendChild(landing);
 groups.forEach(g=>{
  const page=document.createElement('div');page.id='mfitSettingsPage-'+g.id;page.className='mfit-settings-page hidden';
  const back=document.createElement('button');back.type='button';back.className='mfit-settings-back';back.innerHTML='<span>‹</span> Zurück zu Einstellungen';back.addEventListener('click',showLanding);page.appendChild(back);
  const heading=document.createElement('div');heading.className='mfit-settings-page-heading';heading.innerHTML='<span>'+g.icon+'</span><div><h3>'+g.title+'</h3><p>'+g.desc+'</p></div>';page.appendChild(heading);
  g.items.forEach(id=>{const el=$(id);if(el){el.classList.add('mfit-settings-detail');page.appendChild(el);}});
  pages.appendChild(page);
 });
 hub.insertAdjacentElement('afterend',pages);
 // The category destinations now live inside Settings, not scattered down the Profile page.
}
function showLanding(){
 active='home';const landing=$('mfitSettingsLanding');if(landing)landing.classList.remove('hidden');
 groups.forEach(g=>{const p=$('mfitSettingsPage-'+g.id);if(p)p.classList.add('hidden');});
 const hub=$('settingsHub');if(hub)hub.classList.remove('hidden');
}
function openGroup(id,focusId){
 ensureSettings();active=id;
 const hub=$('settingsHub');if(hub)hub.classList.add('hidden');
 const landing=$('mfitSettingsLanding');if(landing)landing.classList.add('hidden');
 groups.forEach(g=>{const p=$('mfitSettingsPage-'+g.id);if(p)p.classList.toggle('hidden',g.id!==id);});
 const page=$('mfitSettingsPage-'+id);if(page){page.classList.remove('hidden');if(focusId){const el=$(focusId);el?.scrollIntoView({behavior:'smooth',block:'start'});}else page.scrollIntoView({behavior:'smooth',block:'start'});}
}
window.mfitInitSettings=function(){ensureSettings();if(active==='home')showLanding();};
window.mfitCloseSettingsMenu=function(){
 const menu=$('mfitSettingsMenu');if(menu){menu.classList.add('hidden');menu.setAttribute('aria-hidden','true');}
 const trigger=document.querySelector('.header-settings');if(trigger)trigger.setAttribute('aria-expanded','false');
};
window.mfitToggleSettingsMenu=function(){
 const menu=$('mfitSettingsMenu');if(!menu)return;
 const willOpen=menu.classList.contains('hidden');
 menu.classList.toggle('hidden',!willOpen);menu.setAttribute('aria-hidden',String(!willOpen));
 const trigger=document.querySelector('.header-settings');if(trigger)trigger.setAttribute('aria-expanded',String(willOpen));
};
window.mfitOpenSettingsSection=function(id){
 ensureSettings();
 const g=groups.find(x=>x.items.includes(id));
 if(!g)return;
 window.mfitOpenFullSettings();openGroup(g.id,id);
};
window.mfitOpenFullSettings=function(){
 if(typeof window.mfitCloseSettingsMenu==='function')window.mfitCloseSettingsMenu();
 if(typeof window.showTab==='function')window.showTab('settings');
 ensureSettings();showLanding();
};
window.mfitSettingsBack=showLanding;
function boot(){
 ensureSettings();
 const nav=document.querySelector('nav.mfit-nav');
 if(nav){
  nav.setAttribute('aria-label','Hauptnavigation');
  nav.querySelectorAll('button[data-tab]').forEach(b=>{
   b.setAttribute('aria-label',b.querySelector('.nav-label')?.textContent?.trim()||b.dataset.tab);
  });
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
