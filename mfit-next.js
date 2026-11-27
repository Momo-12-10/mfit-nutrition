/* MFit Performance v121–130 — visual progress, training overview and quality-of-life improvements */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10);
const foods=()=>typeof data!=='undefined'&&Array.isArray(data)?data:[];
const workouts=()=>typeof workoutLogs!=='undefined'&&Array.isArray(workoutLogs)?workoutLogs:[];
const recoveries=()=>typeof recoveryLogs!=='undefined'&&Array.isArray(recoveryLogs)?recoveryLogs:[];
const weights=()=>typeof weightHistory!=='undefined'&&Array.isArray(weightHistory)?weightHistory:[];
const getGoals=()=>typeof goals!=='undefined'&&goals?goals:{kcal:2800,protein:150};
const dayKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const days=(n=7)=>{const a=[],d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-n+1);for(let i=0;i<n;i++){const x=new Date(d);x.setDate(d.getDate()+i);a.push(dayKey(x));}return a;};
const sum=(arr,key)=>arr.reduce((n,x)=>n+(Number(x&&x[key])||0),0);
function addCard(parent,id,kicker,title,html,after){
 if(!parent||$(id))return;
 const el=document.createElement('article');el.id=id;el.className='card mfit-next-card';
 el.innerHTML='<div class="mfit-next-head"><div><span class="settings-kicker">'+kicker+'</span><h2>'+title+'</h2></div><span class="mfit-next-mark" aria-hidden="true">✦</span></div>'+html;
 if(after&&after.parentNode===parent)after.insertAdjacentElement('afterend',el);else parent.appendChild(el);
}
function ring(label,value,target,unit,kind){
 const pct=target>0?Math.max(0,Math.min(100,value/target*100)):0;
 const r=39,c=2*Math.PI*r,offset=c-(pct/100*c);
 return '<div class="mfit-ring-item"><div class="mfit-ring '+kind+'" role="img" aria-label="'+esc(label)+': '+Math.round(value)+' von '+Math.round(target)+' '+unit+'">'+
 '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="mfit-ring-track" cx="50" cy="50" r="'+r+'"></circle><circle class="mfit-ring-value" cx="50" cy="50" r="'+r+'" stroke-dasharray="'+c.toFixed(2)+'" stroke-dashoffset="'+offset.toFixed(2)+'"></circle></svg>'+
 '<div class="mfit-ring-center"><b>'+Math.round(pct)+'%</b><small>'+esc(unit)+'</small></div></div><div class="mfit-ring-label"><b>'+esc(label)+'</b><span>'+Math.round(value)+' / '+Math.round(target)+' '+esc(unit)+'</span></div></div>';
}
function install(){
 const home=$('home');
 if(home&&!$('mfitDailyRings')){
  const html='<p class="muted">Dein heutiger Stand im Vergleich zu deinen gespeicherten Zielen.</p><div id="mfitDailyRingGrid" class="mfit-ring-grid"></div><p class="mfit-next-note" id="mfitDailyRingNote">Die Anzeige aktualisiert sich automatisch mit deinen Einträgen.</p>';
  addCard(home,'mfitDailyRings','DEIN TAGESZIEL','Kalorien & Makros',html,$('mfitProgressDashboard'));
 }
 const fitness=$('fitness');
 if(fitness&&!$('mfitTrainingCommand')){
  const html='<p class="muted">Deine dokumentierte Trainingswoche auf einen Blick.</p><div class="mfit-training-kpis"><div><small>TRAININGSTAGE</small><b id="mfitNextTrainDays">0 / 7</b></div><div><small>ARBEITSSÄTZE</small><b id="mfitNextTrainSets">0</b></div><div><small>VOLUMEN</small><b id="mfitNextTrainVolume">0 kg</b></div></div><div class="mfit-next-chart-title"><b>Trainingsaktivität</b><span>letzte 7 Tage</span></div><div id="mfitNextTrainChart" class="mfit-week-bars" role="img" aria-label="Trainingsaktivität der letzten sieben Tage"></div><div class="mfit-next-chart-title"><b>Muskelgruppen</b><span>Arbeitssätze</span></div><div id="mfitNextMuscles" class="mfit-muscle-bars"></div><p class="mfit-next-note">Nur gespeicherte Einträge werden gezählt. Trainingsvolumen ist ein grober Vergleichswert und zwischen verschiedenen Übungen nur eingeschränkt vergleichbar.</p>';
  addCard(fitness,'mfitTrainingCommand','TRAINING COMMAND CENTER','Deine Trainingsübersicht',html,$('mfitTrainingAnalytics')||$('workoutHistoryCard'));
 }
 const homeQuick=$('home');
 if(homeQuick&&!$('mfitQuickActions')){
  const html='<div class="mfit-quick-actions"><button type="button" data-mfit-action="track">＋ Ernährung tracken</button><button type="button" data-mfit-action="fitness">＋ Training eintragen</button><button type="button" data-mfit-action="recipes">Rezeptideen ansehen</button><button type="button" data-mfit-water="250">＋ 250 ml Wasser</button></div>';
  addCard(homeQuick,'mfitQuickActions','SCHNELLZUGRIFF','Direkt weitermachen',html,$('mfitDailyRings')||$('mfitProgressDashboard'));
  $('mfitQuickActions')?.querySelectorAll('[data-mfit-action]').forEach(b=>b.addEventListener('click',()=>{if(typeof showTab==='function')showTab(b.dataset.mfitAction);}));
  $('mfitQuickActions')?.querySelector('[data-mfit-water]')?.addEventListener('click',()=>{if(typeof addWater==='function')addWater(250);refresh();});
 }
 if(home&&!$('mfitMealSplit')){const html='<p class="muted">So verteilen sich deine eingetragenen Kalorien auf die Mahlzeiten.</p><div id="mfitMealSplitRows" class="mfit-meal-split"></div><p class="mfit-next-note">Nur Mahlzeiten mit gespeicherten Einträgen werden angezeigt.</p>';addCard(home,'mfitMealSplit','ERNÄHRUNGSÜBERSICHT','Kalorien nach Mahlzeit',html,$('mfitDailyRings'));}
 if(fitness&&!$('mfitRecoveryTrend')){const html='<p class="muted">Deine letzten Check-ins zu Schlaf, Energie und Muskelkater.</p><div id="mfitRecoveryTrendRows" class="mfit-recovery-trend"></div><p class="mfit-next-note">Selbsteinschätzung zur Orientierung – keine medizinische Bewertung.</p>';addCard(fitness,'mfitRecoveryTrend','REGENERATION','Deine letzten Check-ins',html,$('mfitTrainingCommand'));}
 const profile=$('profile');
 if(profile&&!$('mfitBodyTrend')){const html='<p class="muted">Dein dokumentierter Gewichtsverlauf. Einzelne Messungen können durch Wasser und Tageszeit schwanken.</p><div id="mfitBodyTrendChart" class="mfit-weight-trend"></div><div id="mfitBodyTrendHint" class="mfit-next-note"></div>';addCard(profile,'mfitBodyTrend','KÖRPERFORTSCHRITT','Gewichtsverlauf',html,$('mfitDataCare'));}
 if(profile&&!$('mfitDataCare')){
  const html='<p class="muted">Ein kurzer Überblick zu deinen lokal gespeicherten Einträgen.</p><div class="mfit-data-care-grid"><div><small>ERNÄHRUNGSEINTRÄGE</small><b id="mfitDataFoodCount">0</b></div><div><small>TRAININGSEINTRÄGE</small><b id="mfitDataWorkoutCount">0</b></div><div><small>RECOVERY-CHECK-INS</small><b id="mfitDataRecoveryCount">0</b></div></div><p class="mfit-next-note">Diese Anzeige liest deine vorhandenen Daten nur aus. Sie verändert oder löscht nichts.</p>';
  addCard(profile,'mfitDataCare','DATENÜBERBLICK','Deine MFit-Aktivität',html);
 }
}
function renderNutritionRings(){
 const el=$('mfitDailyRingGrid');if(!el)return;
 const date=typeof selectedDate==='string'?selectedDate:today(),entries=foods().filter(x=>(x.date||today())===date);
 const vals={kcal:sum(entries,'kcal'),protein:sum(entries,'protein'),carbs:sum(entries,'carbs'),fat:sum(entries,'fat')};
 const g=getGoals(),targets={kcal:Number(g.kcal)||2800,protein:Number(g.protein)||150,carbs:Math.round(((Number(g.kcal)||2800)*.5)/4),fat:Math.round(((Number(g.kcal)||2800)*.25)/9)};
 el.innerHTML=ring('Kalorien',vals.kcal,targets.kcal,'kcal','is-kcal')+ring('Protein',vals.protein,targets.protein,'g','is-protein')+ring('Kohlenhydrate',vals.carbs,targets.carbs,'g','is-carbs')+ring('Fett',vals.fat,targets.fat,'g','is-fat');
 const note=$('mfitDailyRingNote');if(note)note.textContent=entries.length?entries.length+' Einträge für '+date+' · Werte sind Schätzungen und dienen der Orientierung.':'Noch keine Ernährungseinträge für '+date+'.';
}
function renderTrainingCommand(){
 const chart=$('mfitNextTrainChart');if(!chart)return;
 const range=days(7),recent=workouts().filter(x=>range.includes(String(x.date||'')));
 const active=new Set(recent.map(x=>x.date)).size,sets=sum(recent,'sets'),volume=recent.reduce((n,x)=>n+(Number(x.sets)||0)*(Number(x.reps)||0)*(Number(x.weight)||0),0);
 if($('mfitNextTrainDays'))$('mfitNextTrainDays').textContent=active+' / 7';
 if($('mfitNextTrainSets'))$('mfitNextTrainSets').textContent=String(sets);
 if($('mfitNextTrainVolume'))$('mfitNextTrainVolume').textContent=Math.round(volume).toLocaleString('de-AT')+' kg';
 chart.innerHTML=range.map((d,i)=>{const n=recent.filter(x=>x.date===d).length,h=Math.max(5,Math.min(100,n*28));const label=['So','Mo','Di','Mi','Do','Fr','Sa'][new Date(d+'T12:00:00').getDay()];return '<div class="mfit-week-bar"><span>'+n+'</span><i style="height:'+h+'%"></i><small>'+label+'</small></div>';}).join('');
 const muscleEl=$('mfitNextMuscles');if(!muscleEl)return;
 const groups=['Brust','Rücken','Schultern','Bizeps','Trizeps','Beine','Gesäß','Bauch','Waden','Ganzkörper'];
 const counts=groups.map(name=>({name,n:recent.filter(x=>x.muscle===name).reduce((a,x)=>a+(Number(x.sets)||0),0)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
 muscleEl.innerHTML=counts.length?counts.slice(0,6).map(x=>'<div class="mfit-muscle-row"><span>'+esc(x.name)+'</span><div><i style="width:'+Math.min(100,x.n/Math.max(1,counts[0].n)*100)+'%"></i></div><b>'+x.n+'</b></div>').join(''):'<p class="muted">Noch keine Muskelgruppen dokumentiert.</p>';
}
function renderDataCare(){
 if($('mfitDataFoodCount'))$('mfitDataFoodCount').textContent=String(foods().length);
 if($('mfitDataWorkoutCount'))$('mfitDataWorkoutCount').textContent=String(workouts().length);
 if($('mfitDataRecoveryCount'))$('mfitDataRecoveryCount').textContent=String(recoveries().length);
}

function renderMealSplit(){
 const el=$('mfitMealSplitRows');if(!el)return;
 const date=typeof selectedDate==='string'?selectedDate:today(),entries=foods().filter(x=>(x.date||today())===date);
 const names=['Frühstück','Mittagessen','Abendessen','Snack','Sonstiges'];
 const rows=names.map(name=>({name,kcal:entries.filter(x=>String(x.meal||'').toLowerCase()===name.toLowerCase()).reduce((n,x)=>n+(Number(x.kcal)||0),0)})).filter(x=>x.kcal>0);
 const max=Math.max(1,...rows.map(x=>x.kcal));
 el.innerHTML=rows.length?rows.map(x=>'<div class="mfit-meal-row"><span>'+esc(x.name)+'</span><div><i style="width:'+Math.min(100,x.kcal/max*100)+'%"></i></div><b>'+Math.round(x.kcal)+' kcal</b></div>').join(''):'<p class="muted">Noch keine Mahlzeiten für '+date+' erfasst.</p>';
}
function renderRecoveryTrend(){
 const el=$('mfitRecoveryTrendRows');if(!el)return;
 const rows=recoveries().slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,7);
 if(!rows.length){el.innerHTML='<p class="muted">Noch keine Recovery-Check-ins gespeichert.</p>';return;}
 const avg=k=>rows.reduce((n,x)=>n+(Number(x[k])||0),0)/rows.length;
 el.innerHTML='<div class="mfit-recovery-kpis"><div><small>Ø SCHLAF</small><b>'+avg('sleep').toFixed(1)+' h</b></div><div><small>Ø ENERGIE</small><b>'+avg('energy').toFixed(1)+'/10</b></div><div><small>Ø MUSKELKATER</small><b>'+avg('soreness').toFixed(1)+'/10</b></div></div>'+rows.slice(0,4).map(x=>'<div class="mfit-recovery-row"><span>'+esc(x.date||'')+'</span><span>'+Number(x.sleep||0)+' h Schlaf</span><span>Energie '+Number(x.energy||0)+'/10</span></div>').join('');
}
function renderBodyTrend(){
 const el=$('mfitBodyTrendChart');if(!el)return;
 const rows=weights().filter(x=>Number(x.weight)>0&&x.date).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-10);
 if(!rows.length){el.innerHTML='<p class="muted">Noch keine Gewichtseinträge. Du kannst dein Gewicht im Profil dokumentieren.</p>';if($('mfitBodyTrendHint'))$('mfitBodyTrendHint').textContent='';return;}
 const vals=rows.map(x=>Number(x.weight)),min=Math.min(...vals),max=Math.max(...vals),range=Math.max(.5,max-min);
 const points=vals.map((v,i)=>{const x=8+(i/Math.max(1,vals.length-1))*284,y=84-((v-min)/range)*64;return x.toFixed(1)+','+y.toFixed(1)}).join(' ');
 el.innerHTML='<svg viewBox="0 0 300 100" role="img" aria-label="Gewichtsverlauf mit '+rows.length+' Messungen"><polyline points="'+points+'" fill="none" stroke="#79e2a0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+vals.map((v,i)=>{const x=8+(i/Math.max(1,vals.length-1))*284,y=84-((v-min)/range)*64;return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.5" fill="#b5f3c7"/>'}).join('')+'</svg><div class="mfit-weight-endpoints"><span>'+esc(rows[0].date)+' · '+vals[0].toFixed(1)+' kg</span><b>'+vals[vals.length-1].toFixed(1)+' kg</b></div>';
 const delta=vals[vals.length-1]-vals[0];if($('mfitBodyTrendHint'))$('mfitBodyTrendHint').textContent=rows.length>1?'Veränderung über die angezeigten Messungen: '+(delta>0?'+':'')+delta.toFixed(1)+' kg.':'Bisher eine Messung gespeichert.';
}

function refresh(){renderNutritionRings();renderTrainingCommand();renderMealSplit();renderRecoveryTrend();renderBodyTrend();renderDataCare();}
function boot(){
 install();refresh();
 ['render','renderFitness','saveRecovery','addWorkout','removeWorkout','saveWeightLog','removeEntry'].forEach(name=>{
  const original=window[name];if(typeof original==='function'&&!original.__mfitNextHook){
   const wrapped=function(){const result=original.apply(this,arguments);refresh();return result;};
   wrapped.__mfitNextHook=true;window[name]=wrapped;
  }
 });
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 window.mfitNextRefresh=refresh;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
