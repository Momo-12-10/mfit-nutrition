/* MFit v193 Part B — merge duplicate UI sections without changing storage keys or data. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const cardOf=el=>el?.closest?.('.card')||el;
const rootOf=id=>$(id);
function mergeGroup({title,root,items,extra=[]}){
 const host=rootOf(root);if(!host)return null;
 const nodes=[];
 const existing=document.querySelectorAll('.mfit193-merged-card');
 let wrap=[...existing].find(x=>x.dataset.mfit193Group===title)||null;
 for(const item of items){
  let el=typeof item==='string'?$(item):document.querySelector(item.selector);
  if(item&&typeof item==='object'&&item.node)el=item.node;
  if(el?.closest?.('.mfit193-merged-card'))continue;
  el=cardOf(el);
  if(el?.closest?.('.mfit193-merged-card'))continue;
  if(el&&el!==host&&!nodes.includes(el)&&!nodes.some(n=>n.contains(el))&&!nodes.some(n=>el.contains(n)))nodes.push(el);
 }
 for(const el of extra)if(el&&!nodes.includes(el)&&!nodes.some(n=>n.contains(el))&&!nodes.some(n=>el.contains(n)))nodes.push(el);
 if(!nodes.length)return wrap;
 if(!wrap){
  wrap=document.createElement('article');
  wrap.className='card mfit193-merged-card';
  wrap.dataset.mfit193Group=title;
  const heading=document.createElement('h2');heading.textContent=title;
  const content=document.createElement('div');content.className='mfit193-merged-content';
  wrap.append(heading,content);
  const first=nodes.find(n=>n.parentNode===host)||nodes[0];
  if(first.parentNode)first.parentNode.insertBefore(wrap,first);
  else host.appendChild(wrap);
 }
 const content=wrap.querySelector(':scope > .mfit193-merged-content');
 for(const node of nodes){
  node.classList.remove('card');
  node.classList.add('mfit193-merged-section');
  node.querySelectorAll('.card').forEach(child=>{child.classList.remove('card');child.classList.add('mfit193-merged-section')});
  node.removeAttribute('style');
  node.querySelectorAll(':scope > h2').forEach(h=>{const sub=document.createElement('h3');sub.className=h.className;sub.textContent=h.textContent;h.replaceWith(sub)});
  content.appendChild(node);
 }
 return wrap;
}
function init(){


 // Keep the existing achievement content, but place it with goals rather than coaching tips.
 const achievementHead=$('mfitSmartCoach')?.querySelector('.mfit-achievement-head');
 const achievementNode=$('mfitAchievementList');
 const achievementList=achievementNode?.closest('.mfit193-merged-card')?null:achievementNode;
 if(achievementHead)achievementHead.remove();
 if(achievementList)achievementList.remove();

 // 1. One home quick-access area: today's overview, pinned actions and older shortcuts.
 mergeGroup({title:'Dein Tag & Schnellzugriff',root:'home',items:['mfitTodayPanel','mfitQuickActions','.quick-start-card','mfit181YesterdayCopy']});

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
 $('mfit165Barcode')?.remove();

 // 7. The main anatomical exercise library is the single library; remove the older parallel search card.
 $('mfit165ExerciseLibrary')?.remove();
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
  'mfitTrainingCommand','mfitWorkload',{selector:'#muscleTracker'}
 ]});

 // 9. Sleep, subjective recovery and check-in history are one recovery area; storage remains separate and untouched.
 mergeGroup({title:'Erholung & Check-in',root:'fitness',items:[
  'mfitProRecovery','mfitRecoveryPro','mfit165Sleep','mfitRecoveryTrend',
  {selector:'#recoverySummary'}
 ]});

 // 10. Body measurements and body-weight history are presented together.
 mergeGroup({title:'Körper & Gewicht',root:'profile',items:[
  'weightHistory','bodyMeasurements','mfitBodyAnalytics','mfitBodyTrend'
 ]});

 // 11. Weekly goals, XP/levels, achievements and the optional four-week challenge share one goals area.
 mergeGroup({title:'Ziele, Level & Meilensteine',root:'profile',items:[
  'mfitChallenges','mfit165Goals','mfit191Challenge','mfitAchievementCenter'
 ],extra:[achievementHead,achievementList]});

 // 12. All appearance controls are grouped under the existing settings tab.
 mergeGroup({title:'Darstellung & App-Design',root:'settings',items:[
  'appAppearance','mfitAdvancedPreferences','mfitThemeStudio'
 ]});

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
})();