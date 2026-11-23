/* MFit Performance v79 — five training methods and progressive 7-day plans */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const storeKey='mfit_workout_plan_v79';
const methods={
 hypertrophy:{name:'Hypertrophietraining',sets:3,reps:'6–12',rest:'90–150 Sek.',method:['Klassische Arbeitssätze','Kontrollierte Wiederholungen','Letzter Satz mit sauberer Nähe zur technischen Grenze'],hint:'Muskelaufbau durch ausreichend fordernde, technisch saubere Arbeitssätze und schrittweise Steigerung.'},
 endurance:{name:'Kraftausdauertraining',sets:2,reps:'15–25',rest:'45–75 Sek.',method:['Zirkeltraining','Supersätze für passende Muskelgruppen','Gleichmäßiges Tempo mit kurzer Pause'],hint:'Längere Belastungen mit leichterem bis mittlerem Widerstand. Technik und gleichmäßige Bewegung bleiben wichtiger als Tempo.'},
 maxstrength:{name:'Maximalkrafttraining',sets:3,reps:'3–5',rest:'2–3 Min.',method:['Wenige saubere Wiederholungen','Lange Satzpausen','Kleine Laststeigerungen bei stabiler Technik'],hint:'Kraftorientiertes Training mit kontrollierter Ausführung und ausreichend Erholung. Keine 1RM-Tests oder erzwungenen Wiederholungen.'},
 reactive:{name:'Reaktivkrafttraining',sets:3,reps:'3–5',rest:'90–150 Sek.',method:['Kurze Sprungserien','Wurf- und Abdruckvarianten','Volle Erholung zwischen den Serien'],hint:'Explosive, kurze Aktionen mit leisen, stabilen Landungen. Sofort beenden, wenn Sprunghöhe, Kontrolle oder Landetechnik nachlassen.'},
 adaptation:{name:'Gewöhnungstraining',sets:2,reps:'10–15',rest:'60–90 Sek.',method:['Techniklernen mit leichtem Widerstand','Ganzkörper-Grundübungen','Belastung schrittweise erhöhen'],hint:'Einstieg und Anpassung: Bewegungen lernen, Bewegungsumfang kontrollieren und erst nach und nach mehr Belastung hinzufügen.'},
 mixed:{name:'Kombinationstraining',sets:2,reps:'8–12',rest:'75–120 Sek.',method:['Kombination aus Muskelaufbau und Grundkraft','Abwechslung über die Woche','Erholung gezielt einplanen'],hint:'Eine ausgewogene Mischung. Die Einheiten wechseln den Schwerpunkt, statt alle Trainingsreize gleichzeitig maximal auszureizen.'}
};
const exercises={
 upper:[
  ['Brustpresse','Brust','Maschine'],['Schrägbankdrücken mit Kurzhanteln','Brust','Kurzhanteln'],['Kabel-Flys','Brust','Kabelzug'],['Latzug zur Brust','Rücken','Maschine / Kabelzug'],['Brustgestütztes Rudern','Rücken','Maschine'],['Sitzendes Kabelrudern','Rücken','Kabelzug'],['Schulterdrücken','Schultern','Maschine / Kurzhanteln'],['Seitheben','Schultern','Kurzhanteln'],['Bizepscurls','Bizeps','Kurzhanteln'],['Trizepsdrücken am Kabel','Trizeps','Kabelzug']
 ],
 lower:[
  ['Beinpresse','Beine','Maschine'],['Goblet Squat','Beine','Kurzhantel'],['Rumänisches Kreuzheben','Beinrückseite','Kurzhanteln'],['Sitzender Beinbeuger','Beinrückseite','Maschine'],['Beinstrecker','Quadrizeps','Maschine'],['Hip Thrust','Gesäß','Maschine / Langhantel'],['Wadenheben','Waden','Maschine'],['Ausfallschritte','Beine','Kurzhanteln']
 ],
 body:[
  ['Kniebeuge','Beine','Langhantel / Körpergewicht'],['Liegestütze','Brust','Körpergewicht'],['Latzug oder assistierter Klimmzug','Rücken','Maschine'],['Rudern','Rücken','Maschine / Kurzhantel'],['Hip Hinge / rumänisches Kreuzheben','Beinrückseite','Kurzhanteln'],['Schulterdrücken','Schultern','Kurzhanteln'],['Plank','Rumpf','Körpergewicht'],['Glute Bridge','Gesäß','Körpergewicht']
 ],
 reactive:[
  ['Countermovement Jump','Beine','Körpergewicht'],['Standweitsprung mit stabiler Landung','Beine','Körpergewicht'],['Niedrige Pogos / Fußgelenkssprünge','Waden','Körpergewicht'],['Medizinball-Brustpass','Brust','Medizinball'],['Medizinball-Rotationswurf','Rumpf','Medizinball'],['Explosiver Liegestütz an erhöhter Ablage','Brust','Körpergewicht']
 ]
};
const splitDays={
 full:[['Ganzkörper', 'body'],['Ganzkörper', 'body'],['Ganzkörper', 'body'],['Ganzkörper', 'body'],['Ganzkörper', 'body']],
 upperlower:[['Oberkörper','upper'],['Unterkörper','lower'],['Oberkörper','upper'],['Unterkörper','lower'],['Ganzkörper','body']],
 pushpull:[['Push','upper'],['Pull','upper'],['Beine','lower'],['Push','upper'],['Pull','upper']]
};
const dayNames=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
function pick(arr,n,offset){const out=[];for(let i=0;i<n;i++)out.push(arr[(i+offset)%arr.length]);return out;}
function equipmentOK(ex,equip){if(equip==='body')return /Körpergewicht|Plank|Liegestütz|Glute Bridge/i.test(ex[2]);if(equip==='machines')return /Maschine|Kabelzug/i.test(ex[2]);if(equip==='free')return /Kurzhantel|Langhantel|Körpergewicht|Kabelzug/i.test(ex[2]);return true;}
function prescription(type){const m=methods[type]||methods.hypertrophy;return {sets:m.sets,reps:m.reps,rest:m.rest};}
function methodsForDay(type,index){const m=methods[type]||methods.hypertrophy;return m.method[index%m.method.length];}
function phasePlan(months,goal,type){
 if(months==='steady')return [{t:'Startphase',d:'Technik und Regelmäßigkeit festigen.'},{t:'Aufbauphase',d:'Belastung langsam und passend zur Erholung steigern.'},{t:'Regelmäßiger Check-in',d:'Alle 6–8 Wochen Fortschritt, Motivation und Belastbarkeit prüfen und den Plan bei Bedarf anpassen.'}];
 const muscle=goal==='muscle', strength=goal==='strength', ath=goal==='athletic';
 if(months==='3')return [{t:'Monat 1',d:'Technik festigen und passende Belastung finden.'},{t:'Monat 2',d:'Wiederholungen oder Sätze vorsichtig steigern.'},{t:'Monat 3',d:'Fortschritt vergleichen und Plan angepasst fortführen.'}];
 if(months==='12')return [{t:'Monate 1–3',d:'Grundlage und saubere Technik aufbauen.'},{t:'Monate 4–6',d:'Trainingsumfang schrittweise entwickeln.'},{t:'Monate 7–9',d:'Schwerpunkte gezielt variieren und Fortschritt prüfen.'},{t:'Monate 10–12',d:'Belastung konsolidieren, Erholung sichern und neu planen.'}];
 return [{t:'Monate 1–2',d:'Technik, Regelmäßigkeit und Erholung etablieren.'},{t:'Monate 3–4',d:'Belastung langsam erhöhen und Übungen sinnvoll variieren.'},{t:'Monate 5–6',d:'Fortschritt auswerten und den nächsten Trainingsblock planen.'}];
}
function build(){
 const type=$('mfitTrainingType')?.value||'hypertrophy',goal=$('mfitTrainingGoal')?.value||'muscle',horizon=$('mfitGoalHorizon')?.value||'6',count=Number($('mfitTrainingDays')?.value)||3,split=$('mfitTrainingSplit')?.value||'full',equip=$('mfitTrainingEquipment')?.value||'gym';
 const days=splitDays[split]||splitDays.full,activeSlots=count===2?[0,3]:count===3?[0,2,4]:count===4?[0,1,3,5]:[0,1,3,4,5];
 let plan=[];
 for(let i=0;i<7;i++){
  const slot=activeSlots.indexOf(i);
  if(slot<0){plan.push({day:dayNames[i],rest:true,title:'Regeneration',note:i===6?'Erholung, lockere Bewegung oder Spaziergang':'Ruhetag – Muskeln und Nervensystem erholen sich'});continue;}
  const pair=days[slot%days.length],focus=pair[1];
  const base=type==='reactive'?exercises.reactive:focus==='lower'?exercises.lower:focus==='upper'?exercises.upper:exercises.body;
  let pool=base.filter(e=>equipmentOK(e,equip));
  if(type==='reactive'&&equip!=='gym'&&equip!=='body')pool=exercises.reactive.filter(e=>equipmentOK(e,equip));
  if(pool.length<3)pool=base;
  const take=type==='reactive'?3:(type==='endurance'?5:4);
  const chosen=pick(pool,take,(slot*2)%pool.length);
  const rx=prescription(type);
  plan.push({day:dayNames[i],rest:false,title:pair[0],type,method:methodsForDay(type,slot),exercises:chosen.map((e,j)=>({name:e[0],muscle:e[1],equipment:e[2],sets:rx.sets,reps:rx.reps,rest:rx.rest}))});
 }
 const data={type,goal,horizon,count,split,equip,plan,created:new Date().toISOString()};
 render(data);try{localStorage.setItem(storeKey,JSON.stringify(data));}catch(e){}
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(data){
 const out=$('mfitTrainingPlanOutput');if(!out)return;
 const type=methods[data.type]||methods.hypertrophy;
 const goalNames={muscle:'Muskelaufbau',strength:'Kraft steigern',endurance:'Kraftausdauer',athletic:'Athletik & Explosivität',balanced:'Allgemeine Fitness'};
 const horizon=data.horizon==='steady'?'kontinuierlich und ohne unrealistische Deadline':data.horizon+' Monate';
 const phase=phasePlan(data.horizon, data.goal,data.type);
 out.innerHTML='<div class="workout-goal-card"><h3>🎯 Dein Ziel: '+esc(goalNames[data.goal]||goalNames.muscle)+'</h3><p>Trainingsschwerpunkt: <b>'+esc(type.name)+'</b> · Zeitraum: <b>'+esc(horizon)+'</b></p><p>'+esc(type.hint)+'</p><div class="workout-phase-list">'+phase.map(p=>'<div class="workout-phase"><b>'+esc(p.t)+'</b>'+esc(p.d)+'</div>').join('')+'</div></div><div class="workout-week-head"><h3>Deine 7-Tage-Woche</h3><span class="pill">'+data.count+' Trainingstage</span></div>'+data.plan.map((d,di)=>d.rest?'<div class="workout-day-card is-rest"><div class="workout-day-top"><b>'+esc(d.day)+'</b><span>REGENERATION</span></div><div class="workout-method-line">'+esc(d.note)+'</div></div>':'<div class="workout-day-card"><div class="workout-day-top"><b>'+esc(d.day)+' · '+esc(d.title)+'</b><span>TRAINING '+(di+1)+'</span></div><div class="workout-method-line">'+esc(type.name)+' · '+esc(d.method)+'</div>'+d.exercises.map((e,ei)=>'<div class="workout-exercise-item"><div><b>'+esc(e.name)+'</b><small>'+esc(e.muscle)+' · '+esc(e.equipment)+' · '+e.sets+' Sätze × '+esc(e.reps)+' Wdh. · Pause '+esc(e.rest)+'</small></div><button type="button" class="secondary smallbtn" onclick="mfitLoadPlanExercise('+di+','+ei+')">Tracken</button></div>').join('')+'</div>').join('')+'<div class="workout-plan-actions"><button type="button" class="secondary" onclick="mfitSavePlan()">Plan speichern</button><button type="button" class="secondary" onclick="mfitBuildTrainingPlan()">Neue Variante</button></div><p class="muted" style="font-size:10px;margin-top:9px">Die Zeiträume sind Planungsblöcke, keine Garantie für ein bestimmtes Ergebnis. Passe Umfang und Intensität an dein tatsächliches Sportpensum und deine Erholung an.</p>';
 window.mfitCurrentTrainingPlan=data;
}
window.mfitBuildTrainingPlan=build;
window.generateWorkoutPlan=build;
window.mfitLoadPlanExercise=function(dayIndex,exerciseIndex){
 const d=window.mfitCurrentTrainingPlan?.plan?.[dayIndex],e=d?.exercises?.[exerciseIndex];if(!e)return;
 const set=(id,v)=>{const el=$(id);if(el)el.value=v;};
 set('workoutExercise',e.name);set('workoutMuscle',e.muscle==='Beinrückseite'||e.muscle==='Quadrizeps'?'Beine':e.muscle==='Rumpf'?'Bauch':e.muscle);
 set('workoutSets',e.sets);set('workoutReps',parseInt(e.reps,10)||10);set('workoutWeight',0);
 const status=$('workoutStatus');if(status)status.textContent='Übernommen: '+e.name+' · '+e.sets+' Sätze × '+e.reps+' Wiederholungen. Gewicht passend zur sauberen Technik wählen.';
 $('workoutExercise')?.scrollIntoView({behavior:'smooth',block:'center'});
};
window.mfitSavePlan=function(){const data=window.mfitCurrentTrainingPlan;if(!data)return;try{localStorage.setItem(storeKey,JSON.stringify(data));const status=$('mfitTrainingPlanOutput');if(status){const note=document.createElement('p');note.className='muted';note.textContent='✓ Dein Trainingsplan ist auf diesem Gerät gespeichert.';status.appendChild(note);}}catch(e){alert('Der Plan konnte auf diesem Gerät nicht gespeichert werden.');}};
try{const saved=JSON.parse(localStorage.getItem(storeKey)||'null');if(saved&&saved.plan?.length===7){window.mfitCurrentTrainingPlan=saved;render(saved);}}catch(e){}
})();
