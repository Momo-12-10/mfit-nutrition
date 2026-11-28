/* MFit v193 Part B — merge duplicate UI sections without changing storage keys or data. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const cardOf=el=>el?.closest?.('.card')||el;
const rootOf=id=>$(id);
function unwrapCollapse(card){
 const head=card.querySelector(':scope > .mfit-card-collapse-head');
 const body=card.querySelector(':scope > .mfit-card-collapse-body');
 if(body){const fragment=document.createDocumentFragment();while(body.firstChild)fragment.appendChild(body.firstChild);body.replaceWith(fragment);}
 if(head)head.remove();
}
function mergeGroup({title,root,items,extra=[]}){
 const host=rootOf(root);if(!host)return null;
 const nodes=[],previousGroups=new Set();
 const existing=document.querySelectorAll('.mfit193-merged-card');
 let wrap=[...existing].find(x=>x.dataset.mfit193Group===title)||null;
 for(const item of items){
  const raw=typeof item==='string'?$(item):document.querySelector(item.selector);
  let el=raw;
  const currentGroup=raw?.closest?.('.mfit193-merged-card');
  if(currentGroup?.dataset.mfit193Group===title)continue;
  if(currentGroup){
   if(raw.classList?.contains('card')||raw.classList?.contains('mfit193-merged-section')){el=raw;previousGroups.add(currentGroup);}
   else continue;
  }else el=cardOf(raw);
  if(el?.closest?.('.mfit193-merged-card')?.dataset.mfit193Group===title)continue;
  if(el&&el!==host&&!nodes.includes(el)&&!nodes.some(n=>n.contains(el))&&!nodes.some(n=>el.contains(n)))nodes.push(el);
 }
 for(const el of extra){if(!el)continue;const currentGroup=el.closest?.('.mfit193-merged-card');if(currentGroup?.dataset.mfit193Group===title)continue;if(currentGroup){previousGroups.add(currentGroup);if(!el.classList.contains('mfit193-merged-section')&&!el.classList.contains('card'))continue;}if(!nodes.includes(el)&&!nodes.some(n=>n.contains(el))&&!nodes.some(n=>el.contains(n)))nodes.push(el);}
 if(!nodes.length){window.__mfit193Debug=window.__mfit193Debug||{};window.__mfit193Debug[title]={root,found:[],existing:!!wrap};return wrap;}
 if(!wrap){
  wrap=document.createElement('article');
  wrap.className='card mfit193-merged-card';
  wrap.dataset.mfit193Group=title;
  const toggle=document.createElement('button');toggle.type='button';toggle.className='mfit193-merged-toggle';toggle.setAttribute('aria-expanded','false');
  toggle.innerHTML='<span>'+title+'</span><span class="mfit193-chevron" aria-hidden="true">⌄</span>';
  const content=document.createElement('div');content.className='mfit193-merged-content';content.hidden=true;
  const contentId='mfit193-content-'+title.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-');
  content.id=contentId;toggle.setAttribute('aria-controls',contentId);
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));content.hidden=!open;});
  wrap.append(toggle,content);
  const first=nodes.find(n=>n.parentNode===host)||nodes[0];
  if(first.closest?.('.mfit193-merged-card'))host.appendChild(wrap);
  else if(first.parentNode)first.parentNode.insertBefore(wrap,first);
  else host.appendChild(wrap);
 }
 const content=wrap.querySelector(':scope > .mfit193-merged-content');
 for(const node of nodes){
  unwrapCollapse(node);
  node.querySelectorAll('.card').forEach(child=>{unwrapCollapse(child);child.classList.remove('card','mfit-card-collapsed');child.classList.add('mfit193-merged-section')});
  node.classList.remove('card','mfit-card-collapsed');
  node.classList.add('mfit193-merged-section');
  node.removeAttribute('style');
  node.querySelectorAll(':scope > h2').forEach(h=>{const sub=document.createElement('h3');sub.className=h.className;sub.textContent=h.textContent;h.replaceWith(sub)});
  content.appendChild(node);
 }
 previousGroups.forEach(group=>{const body=group.querySelector(':scope > .mfit193-merged-content');if(body&&!body.children.length)group.remove()});
 window.__mfit193Debug=window.__mfit193Debug||{};window.__mfit193Debug[title]={root,found:nodes.map(n=>n.id||n.className),existing:!!wrap};
 return wrap;
}
function init(){


 // 1. One home quick-access area: today's overview, pinned actions and older shortcuts.
 mergeGroup({title:'Dein Tag & Schnellzugriff',root:'home',items:['mfitTodayPanel','mfitQuickActions','mfit181YesterdayCopy']});

 // 2. One daily calories/macros overview. The source nodes and their IDs remain intact.
 mergeGroup({title:'Kalorien & Makros heute',root:'home',items:[
  {selector:'#kcalTotal'}, {selector:'#home > .grid.three'}, {selector:'#macroProtein'},
  'mfitDailyRings','mfitMealSplit'
 ]});

 // 3. Weekly/monthly reporting is kept together; report options and exports remain available.
 mergeGroup({title:'Wochen- & Monatsauswertung',root:'home',items:[
  'mfitProgressDashboard','.weekly-momentum-card','mfitProWeek','mfitNutritionAnalytics',
  'mfit165Weekly','mfit165NutritionWeek','mfitMonthlyReport','mfit191CoachReport'
 ]});

 // 4. Coaching/tips are collected in one place. Existing advice and assistant controls are retained.
 mergeGroup({title:'Performance-Coach & Ernährungstipps',root:'home',items:[
  'mfitSmartCoach','mfitProCoach','mfit165SmartMeals','mfitNutritionPro',
  'mfitSmartNutritionAssistant',{selector:'#tip'}
 ]});

 // 5. All food/meal templates and favorites live together in the food tracking area.
 mergeGroup({title:'Lebensmittel & Mahlzeiten-Favoriten',root:'track',items:[
  'mfitFoodFavorites','mfitQuickMeals','mfit165SavedMeals','mfitAustrianFood',
  {selector:'#presets'}
 ]});

 // 6. Keep the primary barcode controls in the food form and move the recent-scan history beside them.
 const foodForm=cardOf($('foodName'));
 const recentScans=$('mfitRecentScans');
 if(foodForm&&recentScans){
  recentScans.classList.remove('card');recentScans.classList.add('mfit193-merged-section');
  const h=recentScans.querySelector(':scope > h2');if(h){const sub=document.createElement('h3');sub.textContent='Zuletzt gescannte Produkte';h.replaceWith(sub)}
  if(recentScans.parentElement!==foodForm)foodForm.appendChild(recentScans);
 }

 // 7. The main anatomical exercise library is the single library; remove the older parallel search card.
 const library=$('mfitExerciseLibrary');
 if(library){
  const adjacent=[];
  let n=library.nextElementSibling;
  while(n&&n.matches('.anatomy-browser,.exercise-library-search,#mfitExerciseCatalog,.custom-exercise-details,#mfitCustomExerciseList,.workout-image-credit')){
   const next=n.nextElementSibling;adjacent.push(n);n=next;
  }
  adjacent.forEach(el=>{el.classList.add('mfit193-merged-section');library.appendChild(el)});
 }

 // 8. Training analytics, history, PRs and both muscle summaries become one training overview.
 mergeGroup({title:'Trainingsauswertung',root:'fitness',items:[
  'mfitTrainingAnalytics','workoutHistoryCard','mfitPRCenter','mfitMuscleBalance',
  'mfitTrainingCommand','mfitWorkload' ,'mfit181Gpx','mfit181Share'
 ]});

 // 9. Sleep, subjective recovery and check-in history are one recovery area; storage remains separate and untouched.
 mergeGroup({title:'Erholung & Check-in',root:'fitness',items:[
  'mfitProRecovery','mfitRecoveryPro','mfit165Sleep','mfit165Goals','mfitRecoveryTrend',
  {selector:'#recoverySummary'}
 ]});

 // 10. Body measurements and body-weight history are presented together.
 mergeGroup({title:'Körper & Gewicht',root:'profile',items:[
  'weightHistory','bodyMeasurements','mfitBodyAnalytics','mfitBodyTrend'
 ]});

 // 11. Weekly goals, XP/levels, achievements and the optional four-week challenge share one goals area.
 mergeGroup({title:'Ziele, Level & Meilensteine',root:'profile',items:[
  'mfitChallenges','mfit191Challenge','mfitAchievementCenter'
 ]});

 // 12. All appearance controls are grouped under the existing settings tab.
 mergeGroup({title:'Darstellung & App-Design',root:'settings',items:['appAppearance']});

 // 13. One data-control area. Keep backup/export/restore tools; remove only the duplicate local-delete action.
 $('privacyCenter')?.querySelector('.privacy-danger-zone')?.remove();
 mergeGroup({title:'Daten, Datenschutz & Backup',root:'settings',items:[
  'privacyCenter','dataBackup','mfitDataTools','mfit165Backup','mfitDataCare','mfitReportShortcuts'
 ]});

 // 14. Timer tools use a shared visual component shell while each existing timer keeps its own working controls/state.
 mergeGroup({title:'Timer-Werkzeuge',root:'fitness',items:[
  'mfitIntervalTimer','mfitWarmup','mfit181Mobility','mfitLiveWorkout'
 ]});
 document.querySelectorAll('#fitness [id^="mfitInt"],#fitness [id^="mfitWarm"],#fitness [id^="mfit181Mobility"],#fitness .mfit-rest-panel').forEach(el=>{
  const section=el.closest('.mfit193-merged-section');if(section)section.classList.add('mfit193-timer-section');
 });

 // 15. Tracking history, calendar, season phases and matchday planning share one planning section.
 mergeGroup({title:'Kalender & Trainingsplanung',root:'fitness',items:[
  'mfit191Calendar','mfitSeasonPlan','mfitMatchday',{selector:'.tracking-history-card'}
 ]});

 // The older separate meal/week exercise search UI is now redundant; its saved data keys are not touched.
 document.querySelectorAll('#fitness .mfit193-merged-section').forEach(section=>{
  section.querySelectorAll(':scope > .mfit-advanced-heading,:scope > .mfit-pro-head,:scope > .mfit-extras-head,:scope > .mfit165-head').forEach(h=>{
   h.querySelectorAll('h2').forEach(t=>{const sub=document.createElement('h3');sub.className=t.className;sub.textContent=t.textContent;t.replaceWith(sub)});
  });
 });
}
let queued=false;
function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;init()},0)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',schedule,{once:true});
[150,500,1100,2200].forEach(delay=>setTimeout(init,delay));
})();