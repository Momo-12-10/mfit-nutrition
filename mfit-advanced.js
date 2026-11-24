/* MFit Performance v104 — deeper analytics, quick meals, goals and challenges */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch(e){return f}};
 const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
 const today=()=>typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10);
 const dayOffset=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return todayDate(d)};
 const todayDate=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 let quickMeals=read('mfit_quick_meals_v104',[]);
 let challenge=Object.assign({workouts:3,tracking:5},read('mfit_challenge_v104',{}));
 let themeMode=localStorage.getItem('mfit_theme_mode_v104')||'dark';

 function card(id,title,body,cls){
  return '<div class="card mfit-advanced-card '+(cls||'')+'" id="'+id+'"><div class="mfit-advanced-heading"><div><span class="settings-kicker">MFIT PERFORMANCE TOOLS</span><h2>'+title+'</h2></div><span class="mfit-advanced-mark">✦</span></div>'+body+'</div>';
 }
 function install(){
  const home=$('home');
  if(home&&!$('mfitNutritionAnalytics')){
   const body='<p class="muted">Deine letzten sieben Tage im Vergleich – nur aus den Einträgen, die du gespeichert hast.</p><div class="mfit-analytics-kpis"><div><small>Ø KALORIEN</small><b id="mfitAnaKcal">–</b></div><div><small>Ø PROTEIN</small><b id="mfitAnaProtein">–</b></div><div><small>TRACKING-TAGE</small><b id="mfitAnaDays">0/7</b></div></div><div class="mfit-chart-title"><b>Protein pro Tag</b><small>Gramm</small></div><div id="mfitProteinChart" class="mfit-bars" role="img" aria-label="Proteinverlauf der letzten sieben Tage"></div><div class="mfit-analytics-note" id="mfitAnaInsight">Sobald du Einträge speicherst, erscheint hier deine Analyse.</div>';
   const node=document.createElement('div');node.innerHTML=card('mfitNutritionAnalytics','Ernährungsanalyse',body,'mfit-nutrition-analytics').trim();home.insertBefore(node.firstChild,$('mfitSmartCoach')?.nextSibling||null);
  }
  const track=$('track');
  if(track&&!$('mfitQuickMeals')){
   const body='<p class="muted">Speichere häufige Mahlzeiten und übernimm sie später mit einem Tipp. Nährwerte werden aus deinem aktuellen Eintrag übernommen.</p><div class="mfit-quick-meal-form"><label for="mfitQuickMealName">Name der Mahlzeit</label><input id="mfitQuickMealName" placeholder="z. B. Skyr-Bowl"><button type="button" onclick="mfitSaveQuickMeal()">Aktuellen Eintrag als Favorit speichern</button></div><div id="mfitQuickMealList" class="mfit-quick-meal-list"></div>';
   const node=document.createElement('div');node.innerHTML=card('mfitQuickMeals','Mahlzeiten-Favoriten',body,'mfit-quick-meals').trim();track.appendChild(node.firstChild);
  }
  const fitness=$('fitness');
  if(fitness&&!$('mfitTrainingAnalytics')){
   const body='<p class="muted">Trainingsbelastung und Bestleistungen aus deinen gespeicherten Einheiten.</p><div class="mfit-analytics-kpis"><div><small>WORKOUTS · 7 TAGE</small><b id="mfitTrainDays">0</b></div><div><small>ARBEITSSÄTZE</small><b id="mfitTrainSets">0</b></div><div><small>VOLUMEN</small><b id="mfitTrainVolume">0 kg</b></div></div><div class="mfit-chart-title"><b>Trainingsvolumen · 7 Tage</b><small>kg</small></div><div id="mfitVolumeChart" class="mfit-bars" role="img" aria-label="Trainingsvolumen der letzten sieben Tage"></div><div id="mfitPRHighlights" class="mfit-pr-highlights"></div><p class="mfit-analytics-note">Das Volumen ist eine rechnerische Orientierung (Sätze × Wiederholungen × Gewicht), kein vollständiges Maß für Trainingsbelastung. Geräte und Körpergewichtsübungen sind nur eingeschränkt vergleichbar.</p>';
   const node=document.createElement('div');node.innerHTML=card('mfitTrainingAnalytics','Trainingsanalyse',body,'mfit-training-analytics').trim();fitness.insertBefore(node.firstChild,$('workoutHistoryCard')||null);
  }
  const profile=$('profile');
  if(profile&&!$('mfitChallenges')){
   const body='<p class="muted">Setze realistische Wochenziele. MFit zählt deine dokumentierten Aktivitäten – ohne tägliche Perfektion zu verlangen.</p><div class="mfit-challenge-grid"><div><label for="mfitChallengeWorkouts">Trainings pro Woche</label><select id="mfitChallengeWorkouts"><option value="2">2 Einheiten</option><option value="3">3 Einheiten</option><option value="4">4 Einheiten</option><option value="5">5 Einheiten</option><option value="6">6 Einheiten</option></select></div><div><label for="mfitChallengeTracking">Ernährung tracken</label><select id="mfitChallengeTracking"><option value="3">3 Tage</option><option value="4">4 Tage</option><option value="5">5 Tage</option><option value="6">6 Tage</option><option value="7">7 Tage</option></select></div></div><button type="button" onclick="mfitSaveChallenges()">Wochenziele speichern</button><div id="mfitChallengeProgress" class="mfit-challenge-progress"></div><div id="mfitXPProgress" class="mfit-xp-progress"></div>';
   const node=document.createElement('div');node.innerHTML=card('mfitChallenges','Wochenziele & Level',body,'mfit-challenges').trim();profile.insertBefore(node.firstChild,$('appAppearance')||null);
  }
  const settings=$('settings');
  if(settings&&!$('mfitAdvancedPreferences')){
   const body='<p class="muted">Passe die Darstellung an. Die Auswahl wird lokal auf diesem Gerät gespeichert.</p><label for="mfitThemeMode">Darstellung</label><select id="mfitThemeMode" onchange="mfitSetThemeMode(this.value)"><option value="dark">Dark Performance</option><option value="light">Light Performance</option><option value="system">Wie Geräteeinstellung</option></select><div class="mfit-theme-preview"><span></span><div><b>Dein MFit-Workspace</b><small>Deine Daten bleiben auf diesem Gerät.</small></div></div><div class="mfit-analytics-note">Hinweis: MFit hat weiterhin kein Nutzerkonto und keine automatische Cloud-Synchronisierung. Exportiere regelmäßig ein Backup.</div>';
   const node=document.createElement('div');node.innerHTML=card('mfitAdvancedPreferences','Darstellung & Workspace',body,'mfit-advanced-preferences').trim();settings.insertBefore(node.firstChild,$('mfitAboutSettings')||null);
  }
  $('mfitChallengeWorkouts')&&($('mfitChallengeWorkouts').value=String(challenge.workouts));
  $('mfitChallengeTracking')&&($('mfitChallengeTracking').value=String(challenge.tracking));
  $('mfitThemeMode')&&($('mfitThemeMode').value=themeMode);
  applyThemeMode();
  renderAll();
 }
 function lastSeven(){
  const days=[];for(let i=6;i>=0;i--){const key=dayOffset(-i),foods=(typeof data!=='undefined'?data:[]).filter(x=>(x.date||today())===key),workouts=(typeof workoutLogs!=='undefined'?workoutLogs:[]).filter(x=>x.date===key);
   days.push({key,foods,workouts,kcal:foods.reduce((s,x)=>s+(Number(x.kcal)||0),0),protein:foods.reduce((s,x)=>s+(Number(x.protein)||0),0),volume:workouts.reduce((s,x)=>s+(Number(x.sets)||0)*(Number(x.reps)||0)*(Number(x.weight)||0),0),sets:workouts.reduce((s,x)=>s+(Number(x.sets)||0),0)});
  }return days;
 }
 function bars(id,days,field){
  const el=$(id);if(!el)return;const max=Math.max(1,...days.map(d=>d[field]));
  el.innerHTML=days.map(d=>'<div class="mfit-bar-col"><div class="mfit-bar-value">'+(d[field]?Math.round(d[field]):'')+'</div><div class="mfit-bar-track"><i style="height:'+Math.max(d[field]?5:0,d[field]/max*100)+'%"></i></div><small>'+new Date(d.key+'T12:00:00').toLocaleDateString('de-AT',{weekday:'short'}).replace('.','')+'</small></div>').join('');
 }
 function renderNutrition(){
  const days=lastSeven(),tracked=days.filter(d=>d.foods.length),avgK=tracked.length?tracked.reduce((s,d)=>s+d.kcal,0)/tracked.length:0,avgP=tracked.length?tracked.reduce((s,d)=>s+d.protein,0)/tracked.length:0;
  if($('mfitAnaKcal'))$('mfitAnaKcal').textContent=tracked.length?Math.round(avgK).toLocaleString('de-AT'):'–';
  if($('mfitAnaProtein'))$('mfitAnaProtein').textContent=tracked.length?Math.round(avgP)+' g':'–';
  if($('mfitAnaDays'))$('mfitAnaDays').textContent=tracked.length+'/7';
  bars('mfitProteinChart',days,'protein');
  const hint=$('mfitAnaInsight');if(hint)hint.textContent=!tracked.length?'Noch keine Ernährungsdaten der letzten sieben Tage.':avgP<((typeof goals!=='undefined'?goals.protein:120)*.75)?'Dein dokumentierter Proteinschnitt liegt unter deinem eingestellten Ziel. Prüfe die Daten und verteile Proteinquellen passend über den Tag.':'Deine Einträge zeigen einen durchschnittlichen Proteinzufuhr von '+Math.round(avgP)+' g an getrackten Tagen. Vergleiche den Verlauf mit deinem persönlichen Bedarf.';
 }
 function renderTraining(){
  const days=lastSeven(),logs=typeof workoutLogs!=='undefined'?workoutLogs:[],recent=days.flatMap(d=>d.workouts),sets=recent.reduce((s,x)=>s+(Number(x.sets)||0),0),volume=recent.reduce((s,x)=>s+(Number(x.sets)||0)*(Number(x.reps)||0)*(Number(x.weight)||0),0);
  if($('mfitTrainDays'))$('mfitTrainDays').textContent=String(new Set(recent.map(x=>x.date)).size);
  if($('mfitTrainSets'))$('mfitTrainSets').textContent=String(sets);
  if($('mfitTrainVolume'))$('mfitTrainVolume').textContent=Math.round(volume).toLocaleString('de-AT')+' kg';
  bars('mfitVolumeChart',days,'volume');
  const best={};logs.forEach(x=>{const n=String(x.exercise||'');if(n&&Number(x.weight)>0&&(!best[n]||Number(x.weight)>best[n].weight))best[n]={weight:Number(x.weight),reps:Number(x.reps)||0};});
  const top=Object.entries(best).sort((a,b)=>b[1].weight-a[1].weight).slice(0,3),host=$('mfitPRHighlights');
  if(host)host.innerHTML=top.length?'<b>Deine höchsten dokumentierten Gewichte</b>'+top.map(([n,v])=>'<div><span>'+esc(n)+' · '+v.reps+' Wdh.</span><strong>'+v.weight.toLocaleString('de-AT')+' kg</strong></div>').join(''):'Noch keine gewichteten Übungen gespeichert. Körpergewichtsübungen ohne Zusatzgewicht sind hier nicht abgebildet.';
 }
 function weekProgress(){
  const days=lastSeven(),trained=new Set(days.flatMap(d=>d.workouts.map(x=>x.date))).size,tracked=days.filter(d=>d.foods.length).length;
  const pct=Math.min(100,trained/Math.max(1,Number(challenge.workouts))*100),pct2=Math.min(100,tracked/Math.max(1,Number(challenge.tracking))*100);
  if($('mfitChallengeProgress'))$('mfitChallengeProgress').innerHTML='<div class="mfit-goal-line"><div><b>Training</b><span>'+trained+' / '+challenge.workouts+' Einheiten</span></div><div class="mfit-goal-track"><i style="width:'+pct+'%"></i></div></div><div class="mfit-goal-line"><div><b>Ernährung dokumentieren</b><span>'+tracked+' / '+challenge.tracking+' Tage</span></div><div class="mfit-goal-track"><i style="width:'+pct2+'%"></i></div></div>';
  const workouts=typeof workoutLogs!=='undefined'?workoutLogs.length:0,foods=typeof data!=='undefined'?data.length:0,recovery=typeof recoveryLogs!=='undefined'?recoveryLogs.length:0,xp=workouts*30+foods*5+recovery*10,level=Math.floor(xp/250)+1,into=xp%250;
  if($('mfitXPProgress'))$('mfitXPProgress').innerHTML='<div class="mfit-level-head"><span>LEVEL '+level+'</span><b>'+xp+' XP</b></div><div class="mfit-goal-track"><i style="width:'+(into/250*100)+'%"></i></div><small>'+into+' / 250 XP bis Level '+(level+1)+' · Training 30 XP · Ernährung 5 XP · Check-in 10 XP</small>';
 }
 function renderQuickMeals(){
  const host=$('mfitQuickMealList');if(!host)return;
  host.innerHTML=quickMeals.length?quickMeals.map((m,i)=>'<div class="mfit-quick-meal"><div><b>'+esc(m.name)+'</b><small>'+Math.round(m.kcal)+' kcal · '+Math.round(m.protein)+' g Protein · '+Math.round(m.amount)+' '+esc(m.unit)+'</small></div><button type="button" class="secondary" onclick="mfitUseQuickMeal('+i+')">Übernehmen</button><button type="button" class="danger smallbtn" onclick="mfitDeleteQuickMeal('+i+')">×</button></div>').join(''):'<p class="muted">Noch keine Favoriten. Trage zuerst ein Lebensmittel ein und speichere es als Vorlage.</p>';
 }
 window.mfitSaveQuickMeal=function(){
  const name=$('mfitQuickMealName')?.value.trim(),food=$('foodName')?.value.trim(),amount=Number($('amount')?.value);
  if(!name||!food||!amount){alert('Bitte zuerst Lebensmittel, Menge und einen Namen im Tracking-Bereich eintragen.');return;}
  const m={name,food,amount,unit:$('unit').value,meal:$('meal').value,kcal:Number($('kcal').value)||0,protein:Number($('protein').value)||0,carbs:Number($('carbs').value)||0,fat:Number($('fat').value)||0,fiber:Number($('fiber').value)||0,sugar:Number($('sugar').value)||0,addedSugar:Number($('addedSugar').value)||0,drink:Number($('drink').value)||0};
  quickMeals=quickMeals.filter(x=>x.name.toLowerCase()!==name.toLowerCase());quickMeals.unshift(m);quickMeals=quickMeals.slice(0,20);write('mfit_quick_meals_v104',quickMeals);$('mfitQuickMealName').value='';renderQuickMeals();$('mfitQuickMealList').insertAdjacentHTML('afterbegin','<p class="mfit-analytics-note">Favorit auf diesem Gerät gespeichert.</p>');
 };
 window.mfitUseQuickMeal=function(i){
  const m=quickMeals[i];if(!m)return;showTab('track');
  const set=(id,v)=>{if($(id))$(id).value=v;};
  set('foodName',m.food);set('amount',m.amount);set('unit',m.unit);set('meal',m.meal);set('kcal',m.kcal);set('protein',m.protein);set('carbs',m.carbs);set('fat',m.fat);set('fiber',m.fiber);set('sugar',m.sugar);set('addedSugar',m.addedSugar);set('drink',m.drink);
  $('foodName')?.scrollIntoView({behavior:'smooth',block:'center'});
 };
 window.mfitDeleteQuickMeal=function(i){quickMeals.splice(i,1);write('mfit_quick_meals_v104',quickMeals);renderQuickMeals();};
 window.mfitSaveChallenges=function(){
  challenge={workouts:Number($('mfitChallengeWorkouts').value)||3,tracking:Number($('mfitChallengeTracking').value)||5};write('mfit_challenge_v104',challenge);weekProgress();
 };
 window.mfitSetThemeMode=function(mode){themeMode=['dark','light','system'].includes(mode)?mode:'dark';localStorage.setItem('mfit_theme_mode_v104',themeMode);applyThemeMode();};
 function applyThemeMode(){
  const actual=themeMode==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):themeMode;
  document.documentElement.dataset.mfitTheme=actual;
  if($('mfitThemeMode'))$('mfitThemeMode').value=themeMode;
 }
 if(window.matchMedia){matchMedia('(prefers-color-scheme: light)').addEventListener?.('change',()=>{if(themeMode==='system')applyThemeMode();});}
 function renderAll(){renderNutrition();renderTraining();weekProgress();renderQuickMeals();}
 function hook(name){
  const fn=window[name];if(typeof fn!=='function'||fn.__mfitAdvanced)return;
  const wrapped=function(){const out=fn.apply(this,arguments);renderAll();return out;};wrapped.__mfitAdvanced=true;window[name]=wrapped;
 }
 function boot(){install();hook('render');hook('renderFitness');hook('saveRecovery');renderAll();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
