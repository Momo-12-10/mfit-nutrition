/* MFit v194 Part C — five-area navigation over the existing screens; no storage migration. */
(function(){
'use strict';
const legacyShowTab=window.showTab;
if(typeof legacyShowTab!=='function')return;
const navItems=[
 {id:'today',label:'Heute',icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',legacy:'home'},
 {id:'nutrition',label:'Ernährung',icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3v7m4-7v7M6 3v18M17 3c-3 4-3 8 0 9v9m0-18v9"/></svg>',legacy:'track'},
 {id:'training',label:'Training',icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7v10M3 9v6m15-8v10m3-8v6M6 12h12"/></svg>',legacy:'fitness'},
 {id:'progress',label:'Fortschritt',icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5m0 14h17M8 15l4-4 3 2 5-7"/></svg>',legacy:'home'},
 {id:'profile',label:'Profil',icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',legacy:'profile'}
];
const subpages={
 today:[],
 nutrition:[
  {id:'diary',label:'Tagebuch',legacy:'track'},
  {id:'recipes',label:'Rezepte',legacy:'recipes'},
  {id:'shopping',label:'Einkauf',legacy:'shop'}
 ],
 training:[
  {id:'workout',label:'Workout',legacy:'fitness',target:'workoutTrackerCard'},
  {id:'plan',label:'Plan',legacy:'fitness',target:'mfitTrainingPlanControls'},
  {id:'exercises',label:'Übungen',legacy:'fitness',target:'mfitExerciseLibrary'},
  {id:'tools',label:'Werkzeuge',legacy:'fitness',target:'mfitIntervalTimer'}
 ],
 progress:[
  {id:'strength',label:'Kraft',legacy:'fitness',target:'workoutHistoryCard'},
  {id:'endurance',label:'Ausdauer',legacy:'fitness',target:'workoutHistoryCard'},
  {id:'body',label:'Körper',legacy:'profile',target:'weightHistory'},
  {id:'recovery',label:'Erholung',legacy:'fitness',target:'recoverySleep'},
  {id:'goals',label:'Ziele',legacy:'profile',target:'profileGoals'},
  {id:'reports',label:'Berichte',legacy:'home',target:'mfitProgressDashboard'}
 ],
 profile:[
  {id:'details',label:'Angaben',legacy:'profile',target:'profileGoals'},
  {id:'account',label:'Konto',legacy:'profile',target:'mfitCloudAccount'},
  {id:'settings',label:'Einstellungen',legacy:'settings'}
 ]
};
let activeMain='today',activeSub={nutrition:'diary',training:'workout',progress:'reports',profile:'details'},routing=false;
const nav=document.createElement('nav');nav.className='mfit194-nav';nav.setAttribute('aria-label','Hauptnavigation');
nav.innerHTML=navItems.map(x=>'<button type="button" data-main="'+x.id+'" aria-label="'+x.label+'">'+x.icon+'<span>'+x.label+'</span></button>').join('');
const sub=document.createElement('nav');sub.className='mfit194-subnav';sub.setAttribute('aria-label','Bereichsnavigation');
function detailWrap(targetId,id,title){
 const target=document.getElementById(targetId);if(!target)return null;
 let wrap=document.getElementById(id);if(!wrap){wrap=document.createElement('section');wrap.id=id;wrap.className='mfit194-detail-list';const h=document.createElement('h2');h.textContent=title;wrap.appendChild(h);target.appendChild(wrap);}
 return wrap;
}
function relocateHomeDetails(){
 const home=document.getElementById('home');if(!home)return;
 const nutrition=detailWrap('track','mfit194NutritionDetails','Weitere Tagebuchdetails');
 const profile=detailWrap('profile','mfit194ProfileTools','Dashboard-Einstellungen');
 if(nutrition){
  ['sugarTotal','todayList','sumVitC','customWaterAmount','mfit165Search'].forEach(id=>{
   const el=document.getElementById(id);const card=el?.closest('.card')||el;
   if(card&&home.contains(card)&&!card.dataset.mfit194Moved){card.dataset.mfit194Moved='true';nutrition.appendChild(card);}
  });
 }
 if(profile){
  const card=[...home.querySelectorAll('.card')].find(el=>/Dashboard anpassen/i.test(el.querySelector('h2,h3')?.textContent||''));
  if(card&&!card.dataset.mfit194Moved){card.dataset.mfit194Moved='true';profile.appendChild(card);}
 }
}
function renderSub(){
 const items=subpages[activeMain]||[];sub.replaceChildren();
 if(!items.length){sub.hidden=true;return;}
 sub.hidden=false;
 items.forEach(item=>{const b=document.createElement('button');b.type='button';b.textContent=item.label;b.dataset.sub=item.id;b.classList.toggle('active',activeSub[activeMain]===item.id);b.setAttribute('aria-current',activeSub[activeMain]===item.id?'page':'false');b.addEventListener('click',()=>navigate(activeMain,item.id));sub.appendChild(b)});
}
function setActive(main){activeMain=main;nav.querySelectorAll('button').forEach(b=>{const on=b.dataset.main===main;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});renderSub();}
function navigate(main,subId){
 const item=(subpages[main]||[]).find(x=>x.id===subId);
 const base=item?.legacy||navItems.find(x=>x.id===main)?.legacy||'home';
 if(item)activeSub[main]=item.id;
 routing=true;legacyShowTab(base);routing=false;setActive(main);
 if(item?.target)requestAnimationFrame(()=>document.getElementById(item.target)?.scrollIntoView({behavior:'smooth',block:'start'}));
}
nav.addEventListener('click',e=>{const b=e.target.closest('button[data-main]');if(!b)return;const main=b.dataset.main;const first=(subpages[main]||[]).find(x=>x.id===activeSub[main])||(subpages[main]||[])[0];navigate(main,first?.id);});
const oldNav=document.querySelector('nav.mfit-nav');
if(oldNav){oldNav.replaceWith(nav);}else document.body.appendChild(nav);
const header=document.querySelector('.mfit-app-header,header.brand-header');
const firstSection=document.getElementById('home');
if(firstSection?.parentNode)firstSection.parentNode.insertBefore(sub,firstSection);
window.showTab=function(t){
 const map={home:'today',track:'nutrition',recipes:'nutrition',shop:'nutrition',fitness:'training',profile:'profile',settings:'profile'};
 const main=map[t]||activeMain;
 if(!routing){
  if(main!==activeMain){const first=(subpages[main]||[]).find(x=>x.legacy===t)||subpages[main]?.[0];if(first)activeSub[main]=first.id;}
  routing=true;legacyShowTab(t);routing=false;setActive(main);
 }else legacyShowTab(t);
};
window.mfit194Navigate=navigate;
setActive('today');
relocateHomeDetails();
const homeObserver=new MutationObserver(()=>relocateHomeDetails());
const homeRoot=document.getElementById('home');if(homeRoot)homeObserver.observe(homeRoot,{childList:true,subtree:true});
})();
