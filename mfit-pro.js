/* MFit Performance v108 — smart weekly report and strength insights */
(function(){
'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10);
const days=()=>{const a=[];for(let i=6;i>=0;i--){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);a.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'));}return a;};
const foods=()=>typeof data!=='undefined'&&Array.isArray(data)?data:[];
const workouts=()=>typeof workoutLogs!=='undefined'&&Array.isArray(workoutLogs)?workoutLogs:[];
const recovery=()=>typeof recoveryLogs!=='undefined'&&Array.isArray(recoveryLogs)?recoveryLogs:[];
function card(parent,id,title,kicker,body,after){if(!parent||$(id))return;const n=document.createElement('article');n.id=id;n.className='card mfit-pro-card';n.innerHTML='<div class="mfit-pro-head"><div><span class="settings-kicker">'+kicker+'</span><h2>'+title+'</h2></div><span class="mfit-pro-symbol">✦</span></div>'+body;if(after&&after.parentNode===parent)after.insertAdjacentElement('afterend',n);else parent.appendChild(n);}
function install(){
const home=$('home');
card(home,'mfitProCoach','Dein nächster sinnvoller Schritt','MFIT SMART COACH','<p class="muted">Konkrete Hinweise aus deinen Einträgen – keine medizinische Diagnose.</p><div id="mfitProCoachItems" class="mfit-pro-list" aria-live="polite"></div><p id="mfitProCoachFoot" class="mfit-pro-note">Deine Einträge werden lokal ausgewertet.</p>',$('mfitNutritionAnalytics')||$('mfitProgressDashboard'));
card(home,'mfitProWeek','Dein Wochenreport','7-TAGE-REPORT','<div class="mfit-pro-kpis"><div><small>TRAINING</small><b id="mfitProWeekWorkouts">0</b></div><div><small>TRACKING-TAGE</small><b id="mfitProWeekFood">0/7</b></div><div><small>Ø PROTEIN</small><b id="mfitProWeekProtein">–</b></div><div><small>Ø KALORIEN</small><b id="mfitProWeekKcal">–</b></div></div><p id="mfitProWeekInsight" class="mfit-pro-note">Deine Wochenwerte erscheinen nach den ersten Einträgen.</p>',$('weekly-momentum-card')||$('mfitSmartCoach'));
card($('fitness'),'mfitProStrength','Kraftentwicklung & Progression','STRENGTH LAB','<p class="muted">Geschätzte Kraftwerte aus dokumentierten Sätzen. Kein echter Maximaltest.</p><div id="mfitProStrengthList" class="mfit-pro-strength-list"></div><p id="mfitProProgression" class="mfit-pro-note">Speichere mehrere Einheiten derselben Übung, um Trends zu erkennen.</p>',$('mfitTrainingAnalytics')||$('workoutTrackerCard'));
}
function refresh(){
const ds=days(),f=foods(),w=workouts(),r=recovery(),tracked=ds.filter(d=>f.some(x=>(x.date||today())===d)),recent=f.filter(x=>ds.includes(x.date||today()));
const perDay=field=>tracked.length?tracked.reduce((sum,d)=>sum+f.filter(x=>(x.date||today())===d).reduce((s,x)=>s+(Number(x[field])||0),0),0)/tracked.length:0;
const trainDays=new Set(w.filter(x=>ds.includes(x.date)).map(x=>x.date)).size;
if($('mfitProWeekWorkouts'))$('mfitProWeekWorkouts').textContent=trainDays;
if($('mfitProWeekFood'))$('mfitProWeekFood').textContent=tracked.length+'/7';
if($('mfitProWeekProtein'))$('mfitProWeekProtein').textContent=tracked.length?Math.round(perDay('protein'))+' g':'–';
if($('mfitProWeekKcal'))$('mfitProWeekKcal').textContent=tracked.length?Math.round(perDay('kcal')).toLocaleString('de-AT'):'–';
if($('mfitProWeekInsight'))$('mfitProWeekInsight').textContent=recent.length?recent.length+' Lebensmittel-Einträge an '+tracked.length+' Tagen und '+trainDays+' Trainingstage dokumentiert. Nicht getrackte Tage werden nicht als null gewertet.':'Noch keine Daten für den Wochenreport.';
const tips=[];
if(!recent.length)tips.push(['Ernährung erfassen','Tracke eine Mahlzeit, damit MFit deinen Wochenverlauf einordnen kann.']);
else if(typeof goals!=='undefined'&&Number(goals.protein)>0&&perDay('protein')<Number(goals.protein)*.8)tips.push(['Protein im Blick behalten','Dein dokumentierter Schnitt liegt bei '+Math.round(perDay('protein'))+' g pro getracktem Tag. Prüfe, ob dein persönliches Ziel realistisch und passend ist.']);
else tips.push(['Ernährung dokumentiert','Dein Proteinschnitt liegt bei '+Math.round(perDay('protein'))+' g an '+tracked.length+' getrackten Tagen.']);
tips.push(trainDays?['Trainingsrhythmus',trainDays+' Trainingstage in den letzten sieben Tagen dokumentiert. Plane Erholung genauso bewusst wie Belastung.']:['Training ergänzen','Erfasse deine Einheit, wenn du trainiert hast, damit dein Report vollständig bleibt.']);
const latest=r.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0];
if(latest&&(Number(latest.sleep)<7||Number(latest.energy)<=4||Number(latest.soreness)>=8))tips.push(['Regeneration beachten','Dein letzter Check-in könnte auf Erholungsbedarf hinweisen. Passe die Belastung an dein Wohlbefinden an.']);
else tips.push(['Regeneration','Ein regelmäßiger Check-in zu Schlaf, Energie und Muskelkater macht deine Auswertung aussagekräftiger.']);
if($('mfitProCoachItems'))$('mfitProCoachItems').innerHTML=tips.slice(0,3).map((x,i)=>'<div class="mfit-pro-item"><span>'+(i+1)+'</span><div><b>'+esc(x[0])+'</b><p>'+esc(x[1])+'</p></div></div>').join('');
if($('mfitProCoachFoot'))$('mfitProCoachFoot').textContent=recent.length+' Ernährungseinträge · '+w.filter(x=>ds.includes(x.date)).length+' Trainingseinträge · '+r.length+' Regenerations-Check-ins ausgewertet.';
const best={};w.forEach(x=>{const n=String(x.exercise||'').trim(),kg=Number(x.weight)||0,reps=Number(x.reps)||0;if(!n||kg<=0||reps<1||reps>12)return;const estimate=kg*(1+reps/30);if(!best[n]||estimate>best[n].estimate)best[n]={kg,reps,estimate,date:x.date};});
const top=Object.entries(best).sort((a,b)=>b[1].estimate-a[1].estimate).slice(0,6);
if($('mfitProStrengthList'))$('mfitProStrengthList').innerHTML=top.length?top.map(([n,x])=>'<div class="mfit-pro-strength-row"><div><b>'+esc(n)+'</b><small>'+x.kg+' kg × '+x.reps+' · '+esc(x.date||'')+'</small></div><strong>~'+Math.round(x.estimate)+' kg</strong></div>').join(''):'<p class="muted">Noch keine Sätze mit Zusatzgewicht gespeichert. Körpergewichtsübungen sind hier nicht abgebildet.</p>';
const last=w.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0],prev=last&&w.filter(x=>x.exercise===last.exercise&&x.date<last.date).sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0];
if($('mfitProProgression'))$('mfitProProgression').textContent=last?(prev&&Number(last.weight)>Number(prev.weight)?'Bei '+last.exercise+' ist dein dokumentiertes Gewicht gegenüber dem vorherigen Eintrag gestiegen. Achte weiterhin auf saubere Technik.':'Letzte erfasste Übung: '+last.exercise+'. Vergleiche Gewicht und Wiederholungen über mehrere Einheiten und steigere nur bei stabiler Technik.'):'Deine Trainingshistorie erscheint nach dem ersten Workout.';
}
function hook(name){const fn=window[name];if(typeof fn!=='function'||fn.__mfitProHook)return;const wrapped=function(){const result=fn.apply(this,arguments);try{refresh();}catch(e){console.warn(e);}return result;};wrapped.__mfitProHook=true;window[name]=wrapped;}
function boot(){install();refresh();['render','renderFitness','saveRecovery','addWorkout','removeWorkout'].forEach(hook);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.mfitProRefresh=refresh;
})();