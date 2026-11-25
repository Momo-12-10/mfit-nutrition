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
card($('fitness'),'mfitProRecovery','Regeneration im Überblick','RECOVERY CHECK','<div class="mfit-pro-kpis"><div><small>Ø SCHLAF</small><b id="mfitProSleepAvg">–</b></div><div><small>Ø ENERGIE</small><b id="mfitProEnergyAvg">–</b></div><div><small>Ø MUSKELKATER</small><b id="mfitProSorenessAvg">–</b></div><div><small>CHECK-INS</small><b id="mfitProRecoveryDays">0/7</b></div></div><p id="mfitProRecoveryInsight" class="mfit-pro-note">Erfasse regelmäßig deinen Schlaf, deine Energie und deinen Muskelkater.</p>',$('mfitTrainingAnalytics')||$('workoutTrackerCard'));
}
function refresh(){
const ds=days(),f=foods(),w=workouts(),r=recovery(),tracked=ds.filter(d=>f.some(x=>(x.date||today())===d)),recent=f.filter(x=>ds.includes(x.date||today()));
const perDay=field=>tracked.length?tracked.reduce((sum,d)=>sum+f.filter(x=>(x.date||today())===d).reduce((s,x)=>s+(Number(x[field])||0),0),0)/tracked.length:0;
const trainDays=new Set(w.filter(x=>ds.includes(x.date)).map(x=>x.date)).size;
const recoveryWeek=r.filter(x=>ds.includes(x.date)),avgRecovery=k=>recoveryWeek.length?recoveryWeek.reduce((s,x)=>s+(Number(x[k])||0),0)/recoveryWeek.length:null;
const sleepAvg=avgRecovery('sleep'),energyAvg=avgRecovery('energy'),sorenessAvg=avgRecovery('soreness');
if($('mfitProSleepAvg'))$('mfitProSleepAvg').textContent=sleepAvg===null?'–':sleepAvg.toFixed(1).replace('.',',')+' h';
if($('mfitProEnergyAvg'))$('mfitProEnergyAvg').textContent=energyAvg===null?'–':energyAvg.toFixed(1).replace('.',',')+'/10';
if($('mfitProSorenessAvg'))$('mfitProSorenessAvg').textContent=sorenessAvg===null?'–':sorenessAvg.toFixed(1).replace('.',',')+'/10';
if($('mfitProRecoveryDays'))$('mfitProRecoveryDays').textContent=recoveryWeek.length+'/7';
if($('mfitProRecoveryInsight'))$('mfitProRecoveryInsight').textContent=!recoveryWeek.length?'Noch keine Check-ins in den letzten sieben Tagen. Ein kurzer Eintrag hilft dir, Veränderungen wahrzunehmen.':(sleepAvg<7||energyAvg<5||sorenessAvg>=7?'Deine letzten Einträge können auf zusätzlichen Erholungsbedarf hindeuten. Achte auf dein Wohlbefinden und passe die Belastung bei Bedarf an.':'Deine dokumentierten Werte geben dir einen Überblick. Behalte Schlaf, Energie und Muskelkater über mehrere Wochen im Blick.');
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

}
function hook(name){const fn=window[name];if(typeof fn!=='function'||fn.__mfitProHook)return;const wrapped=function(){const result=fn.apply(this,arguments);try{refresh();}catch(e){console.warn(e);}return result;};wrapped.__mfitProHook=true;window[name]=wrapped;}

const austrianFoods=[
{name:'Semmel',kcal:270,protein:9,carbs:53,fat:2.2,fiber:2.7},
{name:'Vollkornbrot',kcal:235,protein:9,carbs:41,fat:3.5,fiber:7},
{name:'Erdäpfel, gekocht',kcal:77,protein:2,carbs:17,fat:.1,fiber:2.2},
{name:'Topfen mager',kcal:67,protein:12,carbs:4,fat:.2,fiber:0},
{name:'Gouda',kcal:356,protein:25,fat:27,carbs:2.2,fiber:0},
{name:'Milch 1,5 %',kcal:47,protein:3.4,carbs:4.8,fat:1.5,fiber:0},
{name:'Apfel',kcal:52,protein:.3,carbs:14,fat:.2,fiber:2.4},
{name:'Reis, gekocht',kcal:130,protein:2.7,carbs:28,fat:.3,fiber:.4},
{name:'Nudeln, gekocht',kcal:158,protein:5.8,carbs:30.9,fat:.9,fiber:1.8},
{name:'Linsen, gekocht',kcal:116,protein:9,carbs:20,fat:.4,fiber:7.9},
{name:'Putenbrust, gegart',kcal:135,protein:29,carbs:0,fat:1.5,fiber:0},
{name:'Käferbohnen, gekocht',kcal:127,protein:8.7,carbs:23,fat:.5,fiber:6.4}
];
function installExtra(){
 const track=$('track');
 if(track&&!$('mfitAustrianFood')){
  const n=document.createElement('div');n.className='card mfit-pro-card';n.id='mfitAustrianFood';
  n.innerHTML='<div class="mfit-pro-head"><div><span class="settings-kicker">QUICK FOOD DATABASE</span><h2>Österreichische Lebensmittel</h2></div><span class="mfit-pro-symbol">🥨</span></div><p class="muted">Schnellauswahl mit ungefähren Durchschnittswerten pro 100 g. Produktetikett hat immer Vorrang.</p><div class="mfit-austrian-food-grid">'+austrianFoods.map((f,i)=>'<button type="button" class="secondary" onclick="mfitUseAustrianFood('+i+')"><b>'+esc(f.name)+'</b><small>'+f.kcal+' kcal · '+f.protein+' g Protein / 100 g</small></button>').join('')+'</div>';
  const anchor=$('mfitQuickMeals'); if(anchor)anchor.insertAdjacentElement('afterend',n);else track.appendChild(n);
 }
 const week=$('mfitProWeek');
 if(week&&!$('mfitExportWeek')){const b=document.createElement('button');b.id='mfitExportWeek';b.type='button';b.className='secondary mfit-export-button';b.textContent='Wochenreport als CSV exportieren ↓';b.addEventListener('click',exportWeek);week.appendChild(b);}
}
window.mfitUseAustrianFood=function(i){
 const f=austrianFoods[Number(i)];if(!f)return;
 const set=(id,v)=>{const e=$(id);if(e)e.value=String(v??0)};
 set('foodName',f.name);set('amount',100);set('unit','g');set('meal','Snack');
 if(typeof nutritionBase!=='undefined'){nutritionBase={...nutritionBase,kcal:f.kcal,protein:f.protein,carbs:f.carbs||0,fat:f.fat||0,fiber:f.fiber||0,sugar:0,addedSugar:0,freeSugar:0};}
 if(typeof recalculateNutrition==='function')recalculateNutrition();
 $('foodName')?.scrollIntoView({behavior:'smooth',block:'center'});
 const status=$('barcodeStatus');if(status)status.textContent='Vorlage geladen. Menge und Mahlzeit anpassen und anschließend „Eintrag speichern“ drücken.';
};
function exportWeek(){
 const ds=days(),f=foods(),w=workouts();
 const rows=[['Datum','Lebensmittel-Einträge','Kalorien_kcal','Protein_g','Kohlenhydrate_g','Fett_g','Trainingseinträge','Trainingsvolumen_kg']];
 ds.forEach(d=>{const fd=f.filter(x=>(x.date||today())===d),wd=w.filter(x=>x.date===d);const sum=k=>fd.reduce((s,x)=>s+(Number(x[k])||0),0);rows.push([d,fd.length,Math.round(sum('kcal')),Math.round(sum('protein')*10)/10,Math.round(sum('carbs')*10)/10,Math.round(sum('fat')*10)/10,wd.length,Math.round(wd.reduce((s,x)=>s+(Number(x.sets)||0)*(Number(x.reps)||0)*(Number(x.weight)||0),0))]);});
 const csv='\\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\\r\\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mfit-wochenreport-'+today()+'.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

function boot(){install();installExtra();refresh();['render','renderFitness','saveRecovery','addWorkout','removeWorkout'].forEach(hook);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.mfitProRefresh=refresh;window.mfitExportWeek=exportWeek;
})();