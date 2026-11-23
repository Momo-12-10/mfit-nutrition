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
 out.innerHTML='<div class="workout-goal-card"><h3>🎯 Dein Ziel: '+esc(goalNames[data.goal]||goalNames.muscle)+'</h3><p>Trainingsschwerpunkt: <b>'+esc(type.name)+'</b> · Zeitraum: <b>'+esc(horizon)+'</b></p><p>'+esc(type.hint)+'</p><div class="workout-phase-list">'+phase.map(p=>'<div class="workout-phase"><b>'+esc(p.t)+'</b>'+esc(p.d)+'</div>').join('')+'</div></div><div class="workout-week-head"><h3>Deine 7-Tage-Woche</h3><span class="pill">'+data.count+' Trainingstage</span></div>'+data.plan.map((d,di)=>d.rest?'<div class="workout-day-card is-rest"><div class="workout-day-top"><b>'+esc(d.day)+'</b><span>REGENERATION</span></div><div class="workout-method-line">'+esc(d.note)+'</div></div>':'<div class="workout-day-card"><div class="workout-day-top"><b>'+esc(d.day)+' · '+esc(d.title)+'</b><span>TRAINING '+(di+1)+'</span></div><div class="workout-method-line">'+esc(type.name)+' · '+esc(d.method)+'</div>'+d.exercises.map((e,ei)=>'<div class="workout-exercise-item mfit-exercise-card"><div><b>'+esc(e.name)+'</b><small>'+esc(e.muscle)+' · '+esc(e.equipment)+' · '+e.sets+' Sätze × '+esc(e.reps)+' Wdh. · Pause '+esc(e.rest)+'</small></div><button type="button" class="secondary smallbtn" onclick="mfitLoadPlanExercise('+di+','+ei+')">Tracken</button><button type="button" class="secondary exercise-detail-toggle" data-name="'+esc(e.name)+'" data-muscle="'+esc(e.muscle)+'" data-secondary="'+esc((e.secondary||exerciseCatalog.find(x=>x.name.toLowerCase()===e.name.toLowerCase())?.secondary||secondaryForExercise(e.name)).join('|'))+'" onclick="mfitToggleExerciseDetail(this)">Muskeln & Ausführung</button></div>').join('')+'</div>').join('')+'<div class="workout-plan-actions"><button type="button" class="secondary" onclick="mfitSavePlan()">Plan speichern</button><button type="button" class="secondary" onclick="mfitBuildTrainingPlan()">Neue Variante</button></div><p class="muted" style="font-size:10px;margin-top:9px">Die Zeiträume sind Planungsblöcke, keine Garantie für ein bestimmtes Ergebnis. Passe Umfang und Intensität an dein tatsächliches Sportpensum und deine Erholung an.</p>';
 window.mfitCurrentTrainingPlan=data;
}

const exerciseCatalog=[
{name:'Kniebeuge (Körpergewicht)',muscle:'Beine',secondary:['Gesäß','Rumpf'],id:'bodyweight-squat',equipment:'Körpergewicht',note:'Kontrolliert absenken und nur so tief gehen, wie es schmerzfrei und kontrolliert möglich ist.'},
{name:'Goblet Squat',muscle:'Beine',secondary:['Gesäß','Rumpf'],id:'goblet-squat',equipment:'Kurzhantel'},
{name:'Beinpresse',muscle:'Beine',secondary:['Gesäß'],id:'leg-press',equipment:'Maschine'},
{name:'Kreuzheben',muscle:'Gesäß',secondary:['Beinrückseite','Rumpf','unterer Rücken'],id:'deadlift',equipment:'Langhantel'},
{name:'Bankdrücken',muscle:'Brust',secondary:['Trizeps','Schultern'],id:'bench-press',equipment:'Langhantel'},
{name:'Liegestütze',muscle:'Brust',secondary:['Trizeps','Schultern','Rumpf'],id:'push-up',equipment:'Körpergewicht'},
{name:'Latzug',muscle:'Rücken',secondary:['Bizeps'],id:'lat-pulldown',equipment:'Kabelzug'},
{name:'Rudern',muscle:'Rücken',secondary:['Bizeps','hintere Schulter'],id:'chest-supported-dumbbell-row',equipment:'Maschine / Kabelzug'},
{name:'Schulterdrücken',muscle:'Schultern',secondary:['Trizeps'],id:'dumbbell-shoulder-press',equipment:'Kurzhanteln'},
{name:'Bizepscurls',muscle:'Bizeps',secondary:['Unterarme'],id:'biceps-curl',equipment:'Kurzhanteln'},
{name:'Hip Thrust',muscle:'Gesäß',secondary:['Beinrückseite'],id:'hip-thrusts',equipment:'Bank / Langhantel'},
{name:'Plank',muscle:'Bauch',secondary:['Schultern','Gesäß'],id:'plank',equipment:'Körpergewicht'}
];
function muscleKey(s){return ({'Brust':'chest','Rücken':'back','Schultern':'shoulders','Bizeps':'biceps','Trizeps':'triceps','Beine':'quads','Quadrizeps':'quads','Beinrückseite':'hamstrings','Gesäß':'glutes','Bauch':'core','Rumpf':'core','Waden':'calves','unterer Rücken':'lowerback','hintere Schulter':'shoulders','Unterarme':'forearms'})[s]||'core';}
function secondaryForExercise(name){const n=String(name).toLowerCase();if(/kniebeuge|squat|ausfallschritt|lunge|beinpresse/.test(n))return ['Gesäß','Beinrückseite','Rumpf'];if(/kreuzheben|deadlift|rumänisch|hip hinge|beinbeuger/.test(n))return ['Gesäß','Rumpf','unterer Rücken'];if(/brust|bankdrück|liegestütz|push.?up|fly/.test(n))return ['Trizeps','Schultern'];if(/latzug|klimmzug|rudern|row/.test(n))return ['Bizeps','hintere Schulter'];if(/schulterdrück|seitheben/.test(n))return ['Trizeps','oberer Rücken'];if(/bizeps|curl/.test(n))return ['Unterarme'];if(/trizeps/.test(n))return ['Schultern'];if(/plank|rumpf/.test(n))return ['Schultern','Gesäß'];if(/waden/.test(n))return ['Fußgelenk'];return [];}
function exerciseImageId(name){const n=String(name).toLowerCase();if(/goblet/.test(n))return 'goblet-squat';if(/kniebeuge|squat/.test(n))return 'bodyweight-squat';if(/kreuzheben|deadlift|hinge/.test(n))return 'deadlift';if(/bankdrücken|brustpresse|bench/.test(n))return 'bench-press';if(/liegestütz|push.?up/.test(n))return 'push-up';if(/latzug|klimmzug|pulldown/.test(n))return 'lat-pulldown';if(/rudern|row/.test(n))return 'chest-supported-dumbbell-row';if(/bizeps|curl/.test(n))return 'biceps-curl';if(/schulterdrücken|shoulder press/.test(n))return 'dumbbell-shoulder-press';if(/beinpresse|leg press/.test(n))return 'leg-press';if(/hip thrust|glute bridge/.test(n))return 'hip-thrusts';if(/plank/.test(n))return 'plank';return '';}
function muscleSvg(primary,secondary){
 const p=new Set((primary||[]).map(muscleKey)),s=new Set((secondary||[]).map(muscleKey));
 function el(k,shape,attrs){return '<'+shape+' class="muscle-shape '+(p.has(k)?'primary':s.has(k)?'secondary':'')+'" '+attrs+'/>';}
 function body(x,back){
  let a='<g transform="translate('+x+' 14)"><circle class="muscle-base" cx="49" cy="17" r="11"/><path class="muscle-base" d="M42 29 L56 29 L61 39 L70 45 L65 88 L59 100 L62 126 L58 185 L49 190 L40 185 L36 126 L39 100 L33 88 L28 45 L37 39Z"/><path class="muscle-base" d="M31 42 Q21 42 18 58 L10 104 L16 108 L27 73 L36 55Z M66 42 Q77 42 80 58 L88 104 L82 108 L71 73 L61 55Z"/><path class="muscle-base" d="M40 184 L32 230 L40 233 L51 197 L58 233 L66 230 L58 184Z"/>';
  a+=el('shoulders','ellipse','cx="34" cy="46" rx="10" ry="9"')+el('shoulders','ellipse','cx="64" cy="46" rx="10" ry="9"');
  if(back){a+=el('traps','path','d="M38 38 L49 31 L60 38 L57 55 L49 60 L41 55"')+el('back','path','d="M38 55 Q49 61 60 55 L64 85 L58 99 L40 99 L34 85Z"')+el('glutes','ellipse','cx="42" cy="107" rx="9" ry="10"')+el('glutes','ellipse','cx="57" cy="107" rx="9" ry="10"')+el('hamstrings','ellipse','cx="42" cy="139" rx="8" ry="25"')+el('hamstrings','ellipse','cx="57" cy="139" rx="8" ry="25"')+el('lowerback','path','d="M41 83 L57 83 L57 101 L41 101"');}
  else{a+=el('chest','path','d="M35 52 Q49 45 63 52 L60 69 Q49 76 38 69Z')+el('core','path','d="M40 72 L58 72 L57 99 Q49 106 41 99Z')+el('quads','ellipse','cx="42" cy="132" rx="8" ry="27"')+el('quads','ellipse','cx="57" cy="132" rx="8" ry="27"');}
  a+=el('biceps','ellipse','cx="21" cy="68" rx="6" ry="15"')+el('biceps','ellipse','cx="77" cy="68" rx="6" ry="15"')+el('triceps','ellipse','cx="17" cy="84" rx="4" ry="13"')+el('triceps','ellipse','cx="81" cy="84" rx="4" ry="13"')+el('calves','ellipse','cx="37" cy="198" rx="6" ry="20"')+el('calves','ellipse','cx="63" cy="198" rx="6" ry="20"')+'</g>';
  return a;
 }
 return '<svg class="muscle-map-svg" viewBox="0 0 220 246" role="img" aria-label="Vereinfachte Muskelkarte Vorder- und Rückseite"><defs><linearGradient id="muscleBase" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#9aabba"/><stop offset=".48" stop-color="#53677b"/><stop offset="1" stop-color="#26394b"/></linearGradient><filter id="muscleGlow"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><text x="53" y="10" fill="#b9c7d6" font-size="8" text-anchor="middle">VORNE</text><text x="166" y="10" fill="#b9c7d6" font-size="8" text-anchor="middle">HINTEN</text>'+body(4,false)+body(116,true)+'</svg>';
}
function detailHtml(name,muscle,secondary,id){
 const img=id||exerciseImageId(name),base='https://raw.githubusercontent.com/MarvinNazari/exercise-images/main/images/'+img+'/';let frames='';
 if(/kniebeuge|squat/i.test(name)){frames='<img class="photo-demo" src="https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Fitness_enthusiast_performs_a_single-leg_squat_exercise_in_an_indoor_gym_setting.jpg/500px-Fitness_enthusiast_performs_a_single-leg_squat_exercise_in_an_indoor_gym_setting.jpg" alt="Foto einer Kniebeugenvariante" loading="lazy"><small>Foto: Shixart1985 · CC BY 2.0</small>';}
 else if(/kreuzheben|deadlift/i.test(name)){frames='<img class="photo-demo" src="https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Fit_young_man_doing_deadlift_exercise_in_gym.jpg/960px-Fit_young_man_doing_deadlift_exercise_in_gym.jpg" alt="Foto Kreuzheben" loading="lazy"><small>Foto: Nenad Stojkovic · CC BY 2.0</small>';}
 else if(img==='plank'){frames='<img src="'+base+'hold.webp" alt="'+esc(name)+' Halteposition" loading="lazy"><small>Halteposition · CC0 1.0</small>';}
 else if(img){frames='<img src="'+base+'start.webp" alt="'+esc(name)+' Startposition" loading="lazy"><img src="'+base+'end.webp" alt="'+esc(name)+' Endposition" loading="lazy"><small>Bewegungsdarstellung · CC0 1.0</small>';}
 else{frames='<small>Für diese Übung ist derzeit keine passende Bilddatei hinterlegt.</small>';}
 return '<div class="exercise-detail-panel"><div class="exercise-demo-frames">'+frames+'</div><div class="muscle-map-wrap"><div class="muscle-map-title">BEANSPRUCHTE MUSKELN</div>'+muscleSvg([muscle],secondary||[])+'<div class="muscle-labels"><span>Hauptmuskel: '+esc(muscle)+'</span>'+(secondary||[]).map(x=>'<span class="secondary-label">'+esc(x)+'</span>').join('')+'</div></div><div class="exercise-detail-copy">Die farbigen Bereiche zeigen eine vereinfachte Orientierung. Die Belastung hängt auch von Technik, Bewegungsumfang und Variante ab. Bei Schmerzen nicht durch die Bewegung trainieren.</div></div>';
}
window.mfitToggleExerciseDetail=function(btn){const card=btn.closest('.mfit-exercise-card,.workout-exercise-item');if(!card)return;let panel=card.querySelector('.workout-exercise-detail');if(panel){panel.remove();btn.textContent='Muskeln & Ausführung';return;}panel=document.createElement('div');panel.className='workout-exercise-detail';panel.innerHTML=detailHtml(btn.dataset.name||'',btn.dataset.muscle||'Ganzkörper',(btn.dataset.secondary||'').split('|').filter(Boolean),btn.dataset.image||'');card.appendChild(panel);btn.textContent='Details schließen';};
window.mfitRenderExerciseLibrary=function(){const host=$('mfitExerciseCatalog');if(!host)return;const q=($('mfitExerciseSearch')?.value||'').toLowerCase();const list=exerciseCatalog.filter(e=>(e.name+' '+e.muscle+' '+e.secondary.join(' ')).toLowerCase().includes(q));host.innerHTML=list.map(e=>'<div class="mfit-exercise-card"><div class="mfit-exercise-card-head"><div><b>'+esc(e.name)+'</b><small>'+esc(e.muscle)+' · '+esc(e.equipment)+'</small></div><button type="button" class="secondary" onclick="mfitLoadCatalogExercise('+exerciseCatalog.indexOf(e)+')">Tracken</button><button type="button" class="secondary" onclick="mfitAddCatalogToPlan('+exerciseCatalog.indexOf(e)+')">Zum Plan</button><button type="button" class="secondary" data-name="'+esc(e.name)+'" data-muscle="'+esc(e.muscle)+'" data-secondary="'+esc(e.secondary.join('|'))+'" data-image="'+esc(e.id)+'" onclick="mfitToggleExerciseDetail(this)">Details</button></div></div>').join('')||'<p class="muted">Keine passende Übung gefunden.</p>';};
function loadExerciseToTracker(name,muscle,sets,reps){const set=(id,v)=>{const el=$(id);if(el)el.value=v;};set('workoutExercise',name);set('workoutMuscle',muscle==='Beinrückseite'||muscle==='Quadrizeps'?'Beine':muscle==='Rumpf'?'Bauch':muscle);set('workoutSets',sets||3);set('workoutReps',reps||10);set('workoutWeight',0);const status=$('workoutStatus');if(status)status.textContent='Übung übernommen: '+name+'. Gewicht passend zu deiner Technik eintragen.';$('workoutTrackerCard')?.scrollIntoView({behavior:'smooth',block:'start'});}
window.mfitLoadCatalogExercise=function(i){const e=exerciseCatalog[i];if(e)loadExerciseToTracker(e.name,e.muscle,3,10);};
window.mfitAddCatalogToPlan=function(i){const e=exerciseCatalog[i],plan=window.mfitCurrentTrainingPlan;if(!e)return;if(!plan?.plan?.some(d=>!d.rest)){alert('Erstelle zuerst deinen 7-Tage-Plan. Danach kannst du die Übung direkt hinzufügen.');return;}const day=plan.plan.find(d=>!d.rest);day.exercises.push({name:e.name,muscle:e.muscle,equipment:e.equipment,sets:3,reps:'10',rest:'90 Sek.',secondary:e.secondary});render(plan);try{localStorage.setItem(storeKey,JSON.stringify(plan));}catch(err){}$('mfitTrainingPlanOutput')?.scrollIntoView({behavior:'smooth',block:'start'});};
function readCustomExercises(){try{return JSON.parse(localStorage.getItem('mfit_custom_exercises_v80')||'[]');}catch(e){return [];}}
function saveCustomExercises(items){try{localStorage.setItem('mfit_custom_exercises_v80',JSON.stringify(items));}catch(e){}}
window.mfitAddCustomExercise=function(){const name=$('mfitCustomExerciseName')?.value.trim(),muscle=$('mfitCustomExerciseMuscle')?.value||'Ganzkörper';if(!name){alert('Bitte gib zuerst einen Übungsnamen ein.');return;}const item={name:name,muscle:muscle,equipment:$('mfitCustomExerciseEquipment')?.value||'Sonstiges',sets:Math.max(1,Number($('mfitCustomExerciseSets')?.value)||3),reps:Math.max(1,Number($('mfitCustomExerciseReps')?.value)||10),kneeCare:!!$('mfitKneeCare')?.checked};const items=readCustomExercises();items.unshift(item);saveCustomExercises(items);if(window.mfitCurrentTrainingPlan?.plan?.some(d=>!d.rest)){const target=window.mfitCurrentTrainingPlan.plan.find(d=>!d.rest);target.exercises.push({name:item.name,muscle:item.muscle,equipment:item.equipment,sets:item.sets,reps:String(item.reps),rest:'90 Sek.',custom:true,kneeCare:item.kneeCare});render(window.mfitCurrentTrainingPlan);try{localStorage.setItem(storeKey,JSON.stringify(window.mfitCurrentTrainingPlan));}catch(e){}}$('mfitCustomExerciseName').value='';window.mfitRenderCustomExercises();const msg=$('mfitCustomExerciseList');if(msg){const p=document.createElement('p');p.className='muted';p.textContent=window.mfitCurrentTrainingPlan?'Übung gespeichert und zum ersten Trainingstag hinzugefügt.':'Übung gespeichert. Erstelle einen Plan, um sie einem Trainingstag zuzuordnen.';msg.prepend(p);}};
window.mfitRenderCustomExercises=function(){const host=$('mfitCustomExerciseList');if(!host)return;const items=readCustomExercises();host.innerHTML=items.map((e,i)=>'<div class="mfit-custom-exercise-row"><div><b>'+esc(e.name)+'</b><small>'+esc(e.muscle)+' · '+esc(e.equipment)+' · '+e.sets+' × '+e.reps+(e.kneeCare?' · Knie/Kreuzband beachten':'')+'</small></div><button type="button" class="secondary" onclick="mfitLoadCustomExercise('+i+')">Tracken</button></div>').join('');};
window.mfitLoadCustomExercise=function(i){const e=readCustomExercises()[i];if(e)loadExerciseToTracker(e.name,e.muscle,e.sets,e.reps);};

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
window.mfitRenderExerciseLibrary();window.mfitRenderCustomExercises();
})();
