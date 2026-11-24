/* MFit Performance v101 — coaching insights, milestones, measurements and CSV export */
(function(){
 const $m=id=>document.getElementById(id);
 let measurements=[];
 try{const raw=JSON.parse(localStorage.getItem('mfit_body_measurements')||'[]');measurements=Array.isArray(raw)?raw.filter(x=>x&&typeof x==='object'):[]}catch(e){}
 const fields=[['waist','Taille'],['chest','Brust'],['arm','Oberarm'],['thigh','Oberschenkel']];
 const safe=n=>String(n??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.mfitSaveMeasurements=function(){
  const date=$m('mfitMeasureDate')?.value||(typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10)),entry={date};let count=0;
  for(const [key] of fields){const el=$m('mfitMeasure'+key[0].toUpperCase()+key.slice(1)),raw=el?.value;if(raw==='')continue;const value=Number(raw);if(!Number.isFinite(value)||value<=0||value>250){$m('mfitMeasurementStatus').textContent='Bitte prüfe die eingetragenen Werte.';return;}entry[key]=Math.round(value*10)/10;count++;}
  if(!count){$m('mfitMeasurementStatus').textContent='Trage mindestens ein Körpermaß ein.';return;}
  measurements=measurements.filter(x=>x.date!==date);measurements.push(entry);measurements.sort((a,b)=>a.date.localeCompare(b.date));measurements=measurements.slice(-120);
  localStorage.setItem('mfit_body_measurements',JSON.stringify(measurements));
  for(const [key] of fields){const el=$m('mfitMeasure'+key[0].toUpperCase()+key.slice(1));if(el)el.value='';}
  $m('mfitMeasurementStatus').textContent='Messung gespeichert. Deine bisherigen Einträge bleiben erhalten.';window.mfitRenderBodyMeasurements();
 };
 window.mfitRenderBodyMeasurements=function(){
  const el=$m('mfitMeasurementHistory');if(!el)return;
  if(!measurements.length){el.textContent='Noch keine Körpermaße gespeichert.';return;}
  el.innerHTML=measurements.slice().reverse().slice(0,8).map(x=>'<div class="mfit-measurement-entry"><div><b>'+safe(new Date(x.date+'T12:00:00').toLocaleDateString('de-AT'))+'</b><span class="muted">Messung</span></div><div class="mfit-measurement-values">'+fields.filter(([k])=>Number(x[k])>0).map(([k,label])=>'<span>'+label+': '+Number(x[k]).toLocaleString('de-AT')+' cm</span>').join('')+'</div></div>').join('');
 };
 window.mfitExportCsv=function(){
  const headers=['Datum','Taille_cm','Brust_cm','Oberarm_cm','Oberschenkel_cm'],rows=measurements.map(x=>[x.date,...fields.map(([k])=>x[k]??'')]);
  const csv=[headers,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mfit-koerpermasse-'+(typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10))+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 window.mfitRenderSmartCoach=function(){
  const insight=$m('mfitCoachInsights'),ach=$m('mfitAchievementList');if(!insight||!ach||typeof data==='undefined'||typeof workoutLogs==='undefined')return;
  const today=new Date(),key=d=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  const recent=[];for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);const k=key(d),foods=data.filter(x=>(x.date||key(new Date()))===k),workouts=workoutLogs.filter(x=>x.date===k);recent.push({k,foods,workouts,protein:foods.reduce((s,x)=>s+(Number(x.protein)||0),0)});}
  const tracked=recent.filter(x=>x.foods.length),training=recent.filter(x=>x.workouts.length),average=tracked.length?tracked.reduce((s,x)=>s+x.protein,0)/tracked.length:null;
  const recovery=typeof recoveryLogs!=='undefined'&&recoveryLogs.length?recoveryLogs.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]:null,cards=[];
  if(!tracked.length)cards.push(['Ernährung eintragen','Mit ein paar Einträgen kann MFit deine tatsächlichen Durchschnittswerte zeigen.']);
  else if(average!==null)cards.push(['Protein im Überblick','Dein dokumentierter Schnitt liegt bei '+Math.round(average)+' g pro getracktem Tag. '+(typeof goals!=='undefined'&&average<goals.protein*.8?'Prüfe, ob über den Tag verteilt passende Proteinquellen dabei sind.':'Vergleiche den Wert mit deinem persönlichen Ziel und deinem Hungergefühl.')]);
  if(training.length)cards.push(['Trainingsrhythmus','Du hast an '+training.length+' von 7 Tagen Training eingetragen. Plane auch ausreichend Erholung ein.']);
  else cards.push(['Training dokumentieren','Erfasse deine Einheiten mit Übung, Sätzen, Wiederholungen und Gewicht, damit Fortschritte sichtbar werden.']);
  if(recovery)cards.push(['Regeneration','Letzter Check-in: '+recovery.sleep+' h Schlaf, Energie '+recovery.energy+'/10 und Muskelkater '+recovery.soreness+'/10. Nutze das als Orientierung, nicht als medizinische Bewertung.']);
  else cards.push(['Erholung ergänzen','Ein kurzer Check-in zu Schlaf, Energie und Muskelkater macht deine Trainingsdaten aussagekräftiger.']);
  insight.innerHTML=cards.slice(0,3).map(x=>'<div class="mfit-coach-item"><b>'+safe(x[0])+'</b><small>'+safe(x[1])+'</small></div>').join('');
  const totalFoods=data.length,totalWorkouts=workoutLogs.length,earned=[totalFoods>=1,totalFoods>=25,totalWorkouts>=1,totalWorkouts>=10,new Set(data.map(x=>x.date)).size>=7];
  const milestones=[['🥗','Erster Eintrag','1 Ernährungseintrag',earned[0]],['📘','Dranbleiben','25 Ernährungseinträge',earned[1]],['🏋️','Erstes Workout','1 Trainingseintrag',earned[2]],['💪','Trainingsroutine','10 Trainingseinträge',earned[3]],['📅','Konstanz','7 dokumentierte Tage',earned[4]]];
  ach.innerHTML=milestones.map(x=>'<div class="mfit-achievement '+(x[3]?'is-earned':'')+'"><span>'+x[0]+'</span><b>'+x[1]+'</b><small>'+(x[3]?'Erreicht':x[2])+'</small></div>').join('');
  const summary=$m('mfitCoachSummary');if(summary)summary.textContent=totalWorkouts+' Trainingseinträge · '+totalFoods+' Ernährungseinträge gespeichert';
 };
 const banner=$m('mfitOfflineBanner'),updateNetwork=()=>{if(banner)banner.hidden=!!navigator.onLine;};
 window.addEventListener('online',updateNetwork);window.addEventListener('offline',updateNetwork);updateNetwork();
 const date=$m('mfitMeasureDate');if(date)date.value=typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10);
 window.mfitRenderBodyMeasurements();window.mfitRenderSmartCoach();
 if(typeof render==='function')render();
})();
