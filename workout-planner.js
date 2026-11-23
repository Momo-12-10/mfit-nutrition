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
 out.innerHTML='<div class="workout-goal-card"><h3>🎯 Dein Ziel: '+esc(goalNames[data.goal]||goalNames.muscle)+'</h3><p>Trainingsschwerpunkt: <b>'+esc(type.name)+'</b> · Zeitraum: <b>'+esc(horizon)+'</b></p><p>'+esc(type.hint)+'</p><div class="workout-phase-list">'+phase.map(p=>'<div class="workout-phase"><b>'+esc(p.t)+'</b>'+esc(p.d)+'</div>').join('')+'</div></div><div class="workout-week-head"><h3>Deine 7-Tage-Woche</h3><span class="pill">'+data.count+' Trainingstage</span></div>'+data.plan.map((d,di)=>d.rest?'<div class="workout-day-card is-rest"><div class="workout-day-top"><b>'+esc(d.day)+'</b><span>REGENERATION</span></div><div class="workout-method-line">'+esc(d.note)+'</div></div>':'<div class="workout-day-card"><div class="workout-day-top"><b>'+esc(d.day)+' · '+esc(d.title)+'</b><span>TRAINING '+(di+1)+'</span></div><div class="workout-method-line">'+esc(type.name)+' · '+esc(d.method)+'</div>'+d.exercises.map((e,ei)=>'<div class="workout-exercise-item mfit-exercise-card"><div><b>'+esc(e.name)+'</b><small>'+esc(e.muscle)+' · '+esc(e.equipment)+' · '+e.sets+' Sätze × '+esc(e.reps)+' Wdh. · Pause '+esc(e.rest)+(e.kneeCare?' · Knie/Kreuzband beachten':'')+'</small></div><button type="button" class="secondary smallbtn" onclick="mfitLoadPlanExercise('+di+','+ei+')">Tracken</button><button type="button" class="secondary exercise-detail-toggle" data-name="'+esc(e.name)+'" data-muscle="'+esc(e.muscle)+'" data-secondary="'+esc((e.secondary||exerciseCatalog.find(x=>x.name.toLowerCase()===e.name.toLowerCase())?.secondary||secondaryForExercise(e.name)).join('|'))+'" onclick="mfitToggleExerciseDetail(this)">Muskeln & Ausführung</button></div>').join('')+'</div>').join('')+'<div class="workout-plan-actions"><button type="button" class="secondary" onclick="mfitSavePlan()">Plan speichern</button><button type="button" class="secondary" onclick="mfitBuildTrainingPlan()">Neue Variante</button></div><p class="muted" style="font-size:10px;margin-top:9px">Die Zeiträume sind Planungsblöcke, keine Garantie für ein bestimmtes Ergebnis. Passe Umfang und Intensität an dein tatsächliches Sportpensum und deine Erholung an.</p>';
 window.mfitCurrentTrainingPlan=data;
}

const exerciseCatalog=[
{name:'Kniebeuge (Körpergewicht)',muscle:'Quadrizeps',secondary:['Gesäß','Rumpf'],id:'bodyweight-squat',equipment:'Körpergewicht',note:'Füße etwa schulterbreit, Fußspitzen leicht nach außen. Hüfte und Knie kontrolliert beugen, Knie folgen der Richtung der Zehen. Fersen bleiben am Boden; nur so tief gehen, wie du stabil bleibst.'},
{name:'Goblet Squat',muscle:'Quadrizeps',secondary:['Gesäß','Rumpf'],id:'goblet-squat',equipment:'Kurzhantel',note:'Kurzhantel nah vor der Brust halten. Rumpf stabilisieren, kontrolliert absenken und über den ganzen Fuß wieder aufstehen.'},
{name:'Kniebeuge mit Langhantel',muscle:'Quadrizeps',secondary:['Gesäß','Rumpf','oberer Rücken'],id:'barbell-squat',equipment:'Langhantel',note:'Stange sicher ablegen, Rumpf anspannen und mit kontrollierter Tiefe beugen. Erst mit leichtem Gewicht und guter Anleitung lernen.'},
{name:'Front Squat',muscle:'Quadrizeps',secondary:['Gesäß','Rumpf','oberer Rücken'],id:'front-squat',equipment:'Langhantel',note:'Stange vorne sicher auf den Schultern ablegen, Ellbogen oben halten und aufrecht kontrolliert beugen.'},
{name:'Box Squat',muscle:'Quadrizeps',secondary:['Gesäß','Rumpf'],id:'box-squat',equipment:'Körpergewicht / Langhantel',note:'Kontrolliert zu einer passenden Box zurücksetzen, kurz kontrollieren und ohne Schwung aufstehen.'},
{name:'Bulgarian Split Squat',muscle:'Quadrizeps',secondary:['Gesäß','Rumpf'],id:'bulgarian-split-squat',equipment:'Körpergewicht / Kurzhanteln',note:'Hinteren Fuß erhöht ablegen, vorderes Bein stabil halten und kontrolliert absenken. Beide Seiten trainieren.'},
{name:'Ausfallschritte',muscle:'Quadrizeps',secondary:['Gesäß','Rumpf'],id:'lunges',equipment:'Körpergewicht / Kurzhanteln',note:'Einen ausreichend großen Schritt setzen, Oberkörper stabil halten und kontrolliert absenken. Vorderes Knie folgt den Zehen.'},
{name:'Step-ups',muscle:'Quadrizeps',secondary:['Gesäß','Waden'],id:'step-ups',equipment:'Körpergewicht / Kurzhanteln',note:'Auf eine stabile, niedrige Erhöhung steigen. Über das obere Bein kontrolliert hochdrücken, nicht vom hinteren Fuß abspringen.'},
{name:'Beinpresse',muscle:'Quadrizeps',secondary:['Gesäß','Beinrückseite'],id:'leg-press',equipment:'Maschine',note:'Rücken am Polster lassen, Knie kontrolliert beugen und nicht ruckartig durchdrücken.'},
{name:'Beinstrecker',muscle:'Quadrizeps',secondary:[],id:'leg-extension',equipment:'Maschine',note:'Polster passend einstellen und das Knie kontrolliert strecken und beugen.'},
{name:'Beinbeuger sitzend',muscle:'Beinrückseite',secondary:[],id:'seated-leg-curl',equipment:'Maschine',note:'Hüfte am Sitz halten und das Polster kontrolliert nach unten ziehen.'},
{name:'Rumänisches Kreuzheben',muscle:'Beinrückseite',secondary:['Gesäß','Rumpf','unterer Rücken'],id:'romanian-deadlift',equipment:'Langhantel / Kurzhanteln',note:'Knie leicht beugen, Hüfte nach hinten schieben und Gewicht eng am Körper führen. Rücken neutral halten.'},
{name:'Kreuzheben',muscle:'Gesäß',secondary:['Beinrückseite','Rumpf','unterer Rücken'],id:'deadlift',equipment:'Langhantel',note:'Gewicht nah am Körper, Rücken neutral und Rumpf fest. Vom Boden kontrolliert aufrichten; Technik zuerst mit leichtem Gewicht lernen.'},
{name:'Hip Thrust',muscle:'Gesäß',secondary:['Beinrückseite','Rumpf'],id:'hip-thrusts',equipment:'Langhantel / Maschine',note:'Schulterblätter auf der Bank, Kinn leicht zur Brust und Hüfte kontrolliert strecken, ohne den unteren Rücken zu überstrecken.'},
{name:'Glute Bridge',muscle:'Gesäß',secondary:['Beinrückseite','Rumpf'],id:'glute-bridge',equipment:'Körpergewicht',note:'Rückenlage, Füße aufstellen und Becken anheben, bis Hüfte und Oberkörper eine Linie bilden.'},
{name:'Wadenheben stehend',muscle:'Waden',secondary:[],id:'standing-calf-raise',equipment:'Maschine / Körpergewicht',note:'Über den Fußballen anheben, oben kurz halten und die Fersen kontrolliert absenken.'},
{name:'Bankdrücken',muscle:'Brust',secondary:['Trizeps','Schultern'],id:'bench-press',equipment:'Langhantel',note:'Schulterblätter stabil, Füße fest am Boden. Gewicht kontrolliert zur Brust führen und ohne Abprallen hochdrücken.'},
{name:'Schrägbankdrücken',muscle:'Brust',secondary:['Trizeps','Schultern'],id:'incline-bench-press',equipment:'Kurzhanteln',note:'Bank leicht schräg einstellen, Hanteln kontrolliert absenken und über der Brust hochdrücken.'},
{name:'Brustpresse',muscle:'Brust',secondary:['Trizeps','Schultern'],id:'chest-press',equipment:'Maschine',note:'Sitz und Griffe einstellen, Schulterblätter stabil halten und gleichmäßig drücken.'},
{name:'Liegestütze',muscle:'Brust',secondary:['Trizeps','Schultern','Rumpf'],id:'push-up',equipment:'Körpergewicht',note:'Körper bildet eine Linie. Hände ungefähr unter den Schultern, Brust kontrolliert absenken und den Boden wegdrücken.'},
{name:'Kabel-Flys',muscle:'Brust',secondary:['Schultern'],id:'cable-fly',equipment:'Kabelzug',note:'Ellbogen leicht gebeugt lassen und Arme in einem Bogen vor dem Körper zusammenführen.'},
{name:'Latzug zur Brust',muscle:'Rücken',secondary:['Bizeps'],id:'lat-pulldown',equipment:'Kabelzug',note:'Brust aufrichten und Stange kontrolliert vor dem Körper Richtung obere Brust ziehen.'},
{name:'Klimmzüge',muscle:'Rücken',secondary:['Bizeps','Unterarme'],id:'pull-up',equipment:'Klimmzugstange',note:'Aus kontrolliertem Hang hochziehen, ohne zu schwingen. Bei Bedarf mit Unterstützung arbeiten.'},
{name:'Brustgestütztes Rudern',muscle:'Rücken',secondary:['Bizeps','hintere Schulter'],id:'chest-supported-row',equipment:'Maschine / Kurzhanteln',note:'Brust am Polster lassen, Ellbogen nach hinten führen und Schulterblätter kontrolliert bewegen.'},
{name:'Sitzendes Kabelrudern',muscle:'Rücken',secondary:['Bizeps','hintere Schulter'],id:'seated-cable-row',equipment:'Kabelzug',note:'Aufrecht sitzen, Griff zum Bauch ziehen und den Oberkörper nicht nach hinten reißen.'},
{name:'Einarmiges Kurzhantelrudern',muscle:'Rücken',secondary:['Bizeps','hintere Schulter'],id:'one-arm-row',equipment:'Kurzhantel',note:'Mit einer Hand abstützen, Rücken stabil halten und Hantel kontrolliert zur Hüfte ziehen.'},
{name:'Schulterdrücken',muscle:'Schultern',secondary:['Trizeps'],id:'shoulder-press',equipment:'Kurzhanteln / Maschine',note:'Rumpf stabilisieren und Hanteln kontrolliert über Kopf drücken, ohne ins Hohlkreuz auszuweichen.'},
{name:'Seitheben',muscle:'Schultern',secondary:['oberer Rücken'],id:'lateral-raise',equipment:'Kurzhanteln',note:'Arme leicht gebeugt seitlich bis etwa Schulterhöhe anheben, ohne Schwung.'},
{name:'Reverse Fly',muscle:'hintere Schulter',secondary:['Rücken'],id:'reverse-fly',equipment:'Kurzhanteln / Maschine',note:'Oberkörper stabil nach vorne neigen und Arme kontrolliert seitlich öffnen.'},
{name:'Bizepscurls',muscle:'Bizeps',secondary:['Unterarme'],id:'biceps-curl',equipment:'Kurzhanteln',note:'Ellbogen nah am Körper halten und Hanteln ohne Schwung beugen und senken.'},
{name:'Hammer Curls',muscle:'Bizeps',secondary:['Unterarme'],id:'hammer-curl',equipment:'Kurzhanteln',note:'Hanteln neutral halten, Ellbogen ruhig lassen und kontrolliert beugen.'},
{name:'Trizepsdrücken am Kabel',muscle:'Trizeps',secondary:[],id:'triceps-pushdown',equipment:'Kabelzug',note:'Ellbogen am Körper halten und Unterarme kontrolliert nach unten strecken.'},
{name:'Überkopf-Trizepsstrecken',muscle:'Trizeps',secondary:[],id:'overhead-triceps-extension',equipment:'Kurzhantel / Kabelzug',note:'Oberarme ruhig neben dem Kopf halten und Ellbogen kontrolliert beugen und strecken.'},
{name:'Plank',muscle:'Bauch',secondary:['Schultern','Gesäß'],id:'plank',equipment:'Körpergewicht',note:'Unterarme am Boden, Körper in einer Linie und Bauch sowie Gesäß anspannen. Nicht ins Hohlkreuz sinken.'},
{name:'Crunches',muscle:'Bauch',secondary:[],id:'crunch',equipment:'Körpergewicht',note:'Bauch anspannen und Schulterblätter leicht vom Boden lösen. Nicht am Nacken ziehen.'},
{name:'Hanging Knee Raises',muscle:'Bauch',secondary:['Hüftbeuger','Unterarme'],id:'hanging-knee-raise',equipment:'Klimmzugstange',note:'Becken kontrolliert einrollen und Knie anheben, ohne stark zu schwingen.'},
{name:'Russian Twists',muscle:'Bauch',secondary:['schräge Bauchmuskeln'],id:'russian-twist',equipment:'Körpergewicht / Medizinball',note:'Aufrecht und stabil sitzen, Oberkörper kontrolliert rotieren und nicht aus dem unteren Rücken reißen.'},
{name:'Back Extensions',muscle:'unterer Rücken',secondary:['Gesäß','Beinrückseite'],id:'back-extension',equipment:'Rückenstrecker',note:'Hüfte stabil am Polster, Oberkörper kontrolliert bewegen und nicht überstrecken.'},
{name:'Farmer’s Walk',muscle:'Unterarme',secondary:['Rumpf','Schultern','Trapez'],id:'farmers-walk',equipment:'Kurzhanteln',note:'Gewichte seitlich tragen, aufrecht gehen und Rumpf stabil halten.'},
{name:'Countermovement Jump',muscle:'Quadrizeps',secondary:['Gesäß','Waden'],id:'countermovement-jump',equipment:'Körpergewicht',note:'Nur mit sicherer Sprung- und Landetechnik. Explosiv abspringen und leise, stabil landen.'},
{name:'Standweitsprung',muscle:'Quadrizeps',secondary:['Gesäß','Waden','Rumpf'],id:'broad-jump',equipment:'Körpergewicht',note:'Explosiv abspringen und mit beiden Füßen kontrolliert und stabil landen.'},
{name:'Medizinball-Brustpass',muscle:'Brust',secondary:['Trizeps','Rumpf'],id:'medicine-ball-chest-pass',equipment:'Medizinball',note:'Ball aus Brusthöhe explosiv nach vorne werfen und kontrolliert auffangen.'}
];
function muscleKey(s){return ({'Brust':'chest','Rücken':'back','Schultern':'shoulders','Bizeps':'biceps','Trizeps':'triceps','Beine':'quads','Quadrizeps':'quads','Beinrückseite':'hamstrings','Gesäß':'glutes','Bauch':'core','Rumpf':'core','Waden':'calves','unterer Rücken':'lowerback','hintere Schulter':'shoulders','Unterarme':'forearms','Trapez':'traps','oberer Rücken':'back','schräge Bauchmuskeln':'core','Hüftbeuger':'core'})[s]||'core';}
function secondaryForExercise(name){const n=String(name).toLowerCase();const item=exerciseCatalog.find(x=>x.name.toLowerCase()===n)||readCustomExercises().find(x=>x.name.toLowerCase()===n);if(item?.secondary)return item.secondary;if(/kniebeuge|squat|ausfallschritt|lunge|beinpresse|step.?up/.test(n))return ['Gesäß','Beinrückseite','Rumpf'];if(/kreuzheben|deadlift|rumänisch|hip hinge|beinbeuger/.test(n))return ['Gesäß','Rumpf','unterer Rücken'];if(/brust|bankdrück|liegestütz|push.?up|fly/.test(n))return ['Trizeps','Schultern'];if(/latzug|klimmzug|rudern|row/.test(n))return ['Bizeps','hintere Schulter'];if(/schulterdrück|seitheben/.test(n))return ['Trizeps','oberer Rücken'];if(/bizeps|curl/.test(n))return ['Unterarme'];if(/trizeps/.test(n))return ['Schultern'];if(/plank|rumpf/.test(n))return ['Schultern','Gesäß'];if(/waden/.test(n))return ['Fußgelenk'];return [];}
function exerciseImageId(name){const n=String(name).toLowerCase();if(/goblet/.test(n))return 'goblet-squat';if(/kniebeuge|squat/.test(n))return 'bodyweight-squat';if(/kreuzheben|deadlift|hinge/.test(n))return 'deadlift';if(/bankdrücken|brustpresse|bench/.test(n))return 'bench-press';if(/liegestütz|push.?up/.test(n))return 'push-up';if(/latzug|klimmzug|pulldown/.test(n))return 'lat-pulldown';if(/rudern|row/.test(n))return 'chest-supported-dumbbell-row';if(/bizeps|curl/.test(n))return 'biceps-curl';if(/schulterdrücken|shoulder press/.test(n))return 'dumbbell-shoulder-press';if(/beinpresse|leg press/.test(n))return 'leg-press';if(/hip thrust|glute bridge/.test(n))return 'hip-thrusts';if(/plank/.test(n))return 'plank';return '';}
const anatomyGroups=[
 {id:'lower',label:'Unterkörper',subs:[['quadriceps','Vorderer Oberschenkel','Quadriceps femoris'],['hamstrings','Beinbeuger','Ischiocrurale Muskulatur'],['glutes','Gesäß','Musculus gluteus maximus'],['adductors','Innenschenkel','Adduktorengruppe'],['calves','Waden','Triceps surae']]},
 {id:'chest',label:'Brust',subs:[['chestUpper','Obere Brust','Musculus pectoralis major – Pars clavicularis'],['chestMid','Mittlere Brust','Musculus pectoralis major – Pars sternocostalis'],['chestLower','Untere Brust','Musculus pectoralis major – Pars abdominalis']]},
 {id:'back',label:'Rücken',subs:[['lats','Breiter Rücken','Musculus latissimus dorsi'],['traps','Trapezmuskel','Musculus trapezius'],['lowerback','Unterer Rücken','Musculus erector spinae'],['rhomboids','Rautenmuskeln','Musculi rhomboidei']]},
 {id:'shoulders',label:'Schultern',subs:[['frontDelts','Vordere Schulter','Musculus deltoideus – Pars clavicularis'],['sideDelts','Seitliche Schulter','Musculus deltoideus – Pars acromialis'],['rearDelts','Hintere Schulter','Musculus deltoideus – Pars spinalis']]},
 {id:'arms',label:'Arme',subs:[['biceps','Bizeps','Musculus biceps brachii'],['triceps','Trizeps','Musculus triceps brachii'],['forearms','Unterarme','Musculi antebrachii']]},
 {id:'core',label:'Bauch & Rumpf',subs:[['abs','Gerader Bauchmuskel','Musculus rectus abdominis'],['obliques','Schräge Bauchmuskeln','Musculi obliqui abdominis']]}
];
const muscleExerciseTerms={
 quadriceps:['kniebeuge','squat','beinpresse','beinstrecker','ausfallschritt','lunge','step-up','bulgarian','goblet','front squat','countermovement','standweitsprung'],
 hamstrings:['beinbeuger','leg curl','rumänisches kreuzheben','kreuzheben','deadlift','back extension','hip hinge'],
 glutes:['hip thrust','glute bridge','kniebeuge','squat','ausfallschritt','lunge','step-up','kreuzheben','deadlift','bulgarian'],
 adductors:['kniebeuge','squat','adduktor'],
 calves:['waden','pogo','sprung','jump'],
 chestUpper:['schrägbank','incline'],
 chestMid:['bankdrücken','brustpresse','liegestütz','push-up','kabel-flys','brust'],
 chestLower:['dips','decline'],
 lats:['latzug','klimmzug','rudern','row'],
 traps:['farmer','shrug','rudern','row'],
 lowerback:['kreuzheben','deadlift','back extension','rumänisches'],
 rhomboids:['rudern','row','reverse fly'],
 frontDelts:['schulterdrücken','front raise','bankdrücken','schrägbank'],
 sideDelts:['seitheben','lateral raise','schulterdrücken'],
 rearDelts:['reverse fly','face pull','rudern','row'],
 biceps:['bizeps','curl','klimmzug','latzug','rudern'],
 triceps:['trizeps','bankdrücken','liegestütz','push-up','schulterdrücken','brustpresse'],
 forearms:['farmer','curl','kreuzheben','deadlift','handgelenk'],
 abs:['plank','crunch','hanging knee','sit-up','bauch'],
 obliques:['russian twist','rotation','seitstütz','woodchop']
};
function anatomyMuscleSvg(primary,secondary,atlasMode=false){
  const active=new Set([...(primary||[]),...(secondary||[])]);
  const groups={
   front:[
    ['frontDelts','M75 67 Q65 64 61 77 Q59 88 70 96 Q81 91 84 78Z M125 67 Q135 64 139 77 Q141 88 130 96 Q119 91 116 78Z'],
    ['chestUpper','M81 91 Q89 82 99 89 L99 111 Q88 113 79 104Z M119 91 Q111 82 101 89 L101 111 Q112 113 121 104Z'],
    ['chestMid','M79 106 Q89 103 99 113 L98 132 Q86 130 78 119Z M121 106 Q111 103 101 113 L102 132 Q114 130 122 119Z'],
    ['chestLower','M81 124 Q89 132 98 134 L96 145 Q85 143 80 135Z M119 124 Q111 132 102 134 L104 145 Q115 143 120 135Z'],
    ['biceps','M68 96 Q60 108 65 126 Q68 135 75 132 Q80 116 76 101Z M132 96 Q140 108 135 126 Q132 135 125 132 Q120 116 124 101Z'],
    ['forearms','M65 137 Q61 150 65 166 L72 172 Q79 157 76 137Z M135 137 Q139 150 135 166 L128 172 Q121 157 124 137Z'],
    ['abs','M91 139 Q100 136 109 139 L108 174 Q100 178 92 174Z'],
    ['obliques','M80 137 Q86 142 89 151 L87 174 Q80 169 77 157Z M120 137 Q114 142 111 151 L113 174 Q120 169 123 157Z'],
    ['quadriceps','M82 181 Q91 178 98 184 L96 225 Q89 235 83 226Z M118 181 Q109 178 102 184 L104 225 Q111 235 117 226Z'],
    ['adductors','M98 184 Q100 181 102 184 L101 224 Q98 221 96 214Z'],
    ['calves','M82 238 Q90 239 94 247 L92 276 Q85 280 81 269Z M118 238 Q110 239 106 247 L108 276 Q115 280 119 269Z']
   ],
   back:[
    ['rearDelts','M75 67 Q64 66 62 80 Q63 92 76 96 Q85 88 83 77Z M125 67 Q136 66 138 80 Q137 92 124 96 Q115 88 117 77Z'],
    ['traps','M88 62 Q100 56 112 62 L120 91 Q110 99 100 96 Q90 99 80 91Z'],
    ['lats','M82 94 Q90 91 98 101 L96 139 Q87 145 78 132 Q73 111 82 94Z M118 94 Q110 91 102 101 L104 139 Q113 145 122 132 Q127 111 118 94Z'],
    ['rhomboids','M91 94 Q100 100 99 121 L91 130 L84 112Z M109 94 Q100 100 101 121 L109 130 L116 112Z'],
    ['triceps','M68 96 Q60 108 65 126 Q68 135 75 132 Q80 116 76 101Z M132 96 Q140 108 135 126 Q132 135 125 132 Q120 116 124 101Z'],
    ['forearms','M65 137 Q61 150 65 166 L72 172 Q79 157 76 137Z M135 137 Q139 150 135 166 L128 172 Q121 157 124 137Z'],
    ['lowerback','M92 137 Q100 132 108 137 L108 169 Q100 174 92 169Z'],
    ['glutes','M81 174 Q90 169 99 177 L98 197 Q88 201 80 190Z M119 174 Q110 169 101 177 L102 197 Q112 201 120 190Z'],
    ['hamstrings','M82 198 Q90 197 98 202 L96 237 Q89 243 82 233Z M118 198 Q110 197 102 202 L104 237 Q111 243 118 233Z'],
    ['calves','M82 240 Q90 240 94 248 L92 276 Q85 280 81 269Z M118 240 Q110 240 106 248 L108 276 Q115 280 119 269Z']
   ]
  };
  const colorFor=(key,isPrimary)=>isPrimary?'#b8f36b':active.has(key)?'#64c7ec':atlasMode?'#718da5':'#718da5';
  const renderMuscles=(back)=> (back?groups.back:groups.front).map(([key,d])=>{
    const isPrimary=(primary||[]).includes(key);
    const fill=colorFor(key,isPrimary);
    return '<path class="anatomy-muscle '+(active.has(key)?'is-active':'')+'" data-muscle="'+key+'" d="'+d+'" fill="'+fill+'" fill-opacity="'+(active.has(key)?'.98':atlasMode?'.82':'.30')+'" stroke="#dce8f2" stroke-opacity="'+(atlasMode?'.55':'.24')+'" stroke-width="1.1" stroke-linejoin="round"/>';
  }).join('');
  const skin='#c5ced6',edge='#edf2f6';
  const person=(x,back)=>'<g transform="translate('+x+' 0)"><ellipse cx="100" cy="302" rx="40" ry="4" fill="#000" opacity=".18"/><circle cx="100" cy="29" r="14" fill="'+skin+'" stroke="'+edge+'" stroke-width="1.2"/><path d="M94 43 L94 56 L106 56 L106 43Z" fill="'+skin+'"/><path d="M77 62 Q64 61 61 77 L66 139 Q68 151 76 157 L82 140 L84 91 Q91 78 100 79 Q109 78 116 91 L118 140 L124 157 Q132 151 134 139 L139 77 Q136 61 123 62 Q100 54 77 62Z" fill="'+skin+'" stroke="'+edge+'" stroke-width="1.3"/><path d="M77 147 Q69 147 65 162 L62 178 Q64 185 70 181 L80 163Z M123 147 Q131 147 135 162 L138 178 Q136 185 130 181 L120 163Z" fill="'+skin+'" stroke="'+edge+'" stroke-width="1.2"/><path d="M83 174 Q78 190 81 220 L78 273 Q77 286 84 289 L96 289 Q101 285 99 273 L102 222 L101 176Z M117 174 Q122 190 119 220 L122 273 Q123 286 116 289 L104 289 Q99 285 101 273 L98 222 L99 176Z" fill="'+skin+'" stroke="'+edge+'" stroke-width="1.2"/><path d="M82 285 Q73 289 68 293 Q66 297 73 298 L94 298 Q99 296 96 290 M118 285 Q127 289 132 293 Q134 297 127 298 L106 298 Q101 296 104 290" fill="'+skin+'" stroke="'+edge+'" stroke-width="1.1"/><g>'+renderMuscles(back)+'</g><path d="'+(back?'M100 61 L100 173 M82 198 Q100 204 118 198':'M100 61 L100 173 M83 146 Q100 151 117 146')+'" fill="none" stroke="#34495b" stroke-width="1.2" opacity=".65"/></g>';
  return '<svg class="anatomy-body-svg mfit-muscle-atlas" viewBox="0 0 420 315" role="img" aria-label="Detaillierter Muskelatlas mit Vorder- und Rückansicht"><text x="100" y="13" class="anatomy-view-label">VORDERANSICHT</text><text x="310" y="13" class="anatomy-view-label">RÜCKANSICHT</text>'+person(0,false)+person(210,true)+'</svg>';
 }
 function renderNaturalBodyOverviews(){const svg=anatomyMuscleSvg([],[],true);document.querySelectorAll('.mfit-body-overview').forEach(host=>{host.innerHTML=svg;});}renderNaturalBodyOverviews();function exerciseIllustrationSvg(name){
 const n=String(name).toLowerCase(),squat=/kniebeuge|squat|step.?up|ausfallschritt|split squat|lunge/.test(n),hinge=/kreuzheben|deadlift|hip thrust|glute bridge|hinge/.test(n),push=/bankdrück|brustpresse|liegestütz|push.?up|shoulder press|schulterdrück/.test(n);
 const poses=squat?'<g transform="translate(10 0)"><circle cx="48" cy="27" r="9"/><path d="M48 37 L48 77 L25 96 L16 122 M48 77 L70 94 L82 119 M48 47 L23 57 L10 78 M48 47 L72 56 L88 76"/><path d="M25 96 L45 111 L69 94 M45 111 L41 143 L28 166 M69 94 L75 126 L93 143"/></g><g transform="translate(125 0)"><circle cx="48" cy="54" r="9"/><path d="M48 64 L49 94 L27 110 L17 139 M49 94 L69 110 L81 139 M48 72 L25 83 L10 105 M48 72 L72 82 L88 105"/><path d="M27 110 L45 123 L68 110 M45 123 L43 155 L30 174 M68 110 L76 148 L94 162"/></g>':hinge?'<g transform="translate(8 0)"><circle cx="47" cy="36" r="9"/><path d="M50 46 L70 76 L45 100 L20 117 M70 76 L92 104 L105 126 M58 58 L30 68 L12 92 M58 58 L84 62 L106 84"/><path d="M45 100 L56 137 L42 174 M56 137 L79 170"/></g><g transform="translate(122 0)"><circle cx="45" cy="51" r="9"/><path d="M49 61 L73 89 L48 112 L20 130 M73 89 L96 115 L109 137 M58 71 L30 83 L12 105 M58 71 L84 77 L107 98"/><path d="M48 112 L56 148 L42 177 M56 148 L80 177"/></g>':push?'<g transform="translate(8 0)"><circle cx="45" cy="32" r="9"/><path d="M45 42 L45 91 L20 105 L9 132 M45 91 L69 105 L81 132 M45 52 L20 62 L10 85 M45 52 L70 62 L83 85"/><path d="M20 105 L20 147 M69 105 L70 147"/></g><g transform="translate(122 0)"><circle cx="45" cy="32" r="9"/><path d="M45 42 L45 91 L20 105 L9 132 M45 91 L69 105 L81 132 M45 52 L20 62 L10 85 M45 52 L70 62 L83 85"/><path d="M20 105 L20 147 M69 105 L70 147"/></g>':'<g transform="translate(10 0)"><circle cx="48" cy="27" r="9"/><path d="M48 37 L48 91 M48 48 L22 67 L13 94 M48 48 L73 66 L86 92 M48 91 L29 139 L23 174 M48 91 L68 139 L75 174"/></g><g transform="translate(125 0)"><circle cx="48" cy="27" r="9"/><path d="M48 37 L48 91 M48 48 L22 67 L13 94 M48 48 L73 66 L86 92 M48 91 L29 139 L23 174 M48 91 L68 139 L75 174"/></g>';
 return '<svg class="exercise-original-svg" viewBox="0 0 230 205" role="img" aria-label="Selbst erstellte schematische Bewegungsillustration"><defs><linearGradient id="demoGrad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#baff78"/><stop offset="1" stop-color="#5bbd9a"/></linearGradient></defs><rect x="3" y="5" width="104" height="190" rx="15" fill="#172638"/><rect x="123" y="5" width="104" height="190" rx="15" fill="#172638"/><g fill="none" stroke="url(#demoGrad)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">'+poses+'</g><path d="M108 100h14m-5 -5 5 5-5 5" stroke="#d8e7f4" stroke-width="2" fill="none"/><text x="55" y="185" text-anchor="middle" fill="#d8e7f4" font-size="9">START</text><text x="175" y="185" text-anchor="middle" fill="#d8e7f4" font-size="9">BEWEGUNG</text></svg>';
}
function detailHtml(name,muscle,secondary,id){
 const item=exerciseCatalog.find(x=>x.name.toLowerCase()===String(name).toLowerCase())||readCustomExercises().find(x=>x.name.toLowerCase()===String(name).toLowerCase())||{};
 const note=item.note||'Bewege das Gewicht kontrolliert, halte die Körperposition stabil und vermeide Schwung. Wähle eine Variante, die du technisch sicher ausführen kannst.';
 const n=String(name).toLowerCase(),m=String(muscle).toLowerCase();
 let groupId=/brust/.test(m)?'chest':/schulter/.test(m)?'shoulders':/rücken/.test(m)?'back':/bizeps|trizeps|unterarm/.test(m)?'arms':/bauch|rumpf/.test(m)?'core':'lower';
 let ids=[];
 if(groupId==='chest')ids=[/schräg|incline/.test(n)?'chestUpper':/decline|dips/.test(n)?'chestLower':'chestMid'];
 if(groupId==='shoulders')ids=[/seitheben|lateral/.test(n)?'sideDelts':/reverse|rear|face pull/.test(n)?'rearDelts':'frontDelts'];
 if(groupId==='back')ids=[/kreuzheben|deadlift|back extension/.test(n)?'lowerback':/shrug|farmer/.test(n)?'traps':'lats'];
 if(groupId==='arms')ids=[/trizeps/.test(m)?'triceps':/unterarm/.test(m)?'forearms':'biceps'];
 if(groupId==='core')ids=[/russian|rotation|woodchop/.test(n)?'obliques':'abs'];
 if(groupId==='lower')ids=[/waden/.test(m)?'calves':/beinrückseite|beinbeuger|hamstring|rumänisch|kreuzheben/.test(m+' '+n)?'hamstrings':/gesäß|hip thrust|glute/.test(m+' '+n)?'glutes':'quadriceps'];
 const group=anatomyGroups.find(g=>g.id===groupId)||anatomyGroups[0];
 const secondaryIds=(secondary||[]).flatMap(s=>{const sm=s.toLowerCase();if(/schulter/.test(sm))return ['frontDelts'];if(/trizeps/.test(sm))return ['triceps'];if(/bizeps/.test(sm))return ['biceps'];if(/gesäß/.test(sm))return ['glutes'];if(/beinrückseite/.test(sm))return ['hamstrings'];if(/quadrizeps|beine/.test(sm))return ['quadriceps'];if(/rücken/.test(sm))return ['lats'];if(/rumpf|bauch/.test(sm))return ['abs'];if(/waden/.test(sm))return ['calves'];return [];});
 const latin=group.subs.find(x=>ids.includes(x[0]))?.[2]||group.subs[0][2];
 return '<div class="exercise-detail-panel"><div class="anatomy-detail-visual"><div class="muscle-map-title">MUSKELATLAS · '+esc(muscle)+' <small>'+esc(latin)+'</small></div>'+anatomyMuscleSvg(ids,secondaryIds)+'<div class="anatomy-legend"><span><i class="primary-dot"></i>Hauptbeanspruchung</span><span><i class="secondary-dot"></i>Unterstützend</span></div></div><div class="exercise-demo-frames">'+exerciseIllustrationSvg(name)+'<small>Originale MFit-Bewegungsskizze · schematische Orientierung</small></div><div class="exercise-detail-copy"><b>Ausführung</b><br>'+esc(note)+'<br><br>Die Muskelkarte zeigt die ungefähre Beteiligung. Sie ist eine Lernhilfe, keine medizinische oder biomechanische Messung.</div></div>';
}
window.mfitToggleExerciseDetail=function(btn){const card=btn.closest('.mfit-exercise-card,.workout-exercise-item');if(!card)return;let panel=card.querySelector('.workout-exercise-detail');if(panel){panel.remove();btn.textContent='Muskeln & Ausführung';return;}panel=document.createElement('div');panel.className='workout-exercise-detail';panel.innerHTML=detailHtml(btn.dataset.name||'',btn.dataset.muscle||'Ganzkörper',(btn.dataset.secondary||'').split('|').filter(Boolean),btn.dataset.image||'');card.appendChild(panel);btn.textContent='Details schließen';};
function allLibraryExercises(){return exerciseCatalog.concat(readCustomExercises().map(e=>({...e,id:'custom',secondary:e.secondary||[]})));}
let selectedAnatomyGroup='lower',selectedAnatomySub='all';
function exerciseMatchesSub(e,sub){if(sub==='all')return true;const terms=muscleExerciseTerms[sub]||[];const n=(e.name+' '+e.muscle+' '+(e.secondary||[]).join(' ')).toLowerCase();return terms.some(t=>n.includes(t.toLowerCase()))||e.muscle.toLowerCase().includes(sub.toLowerCase());}
function renderAnatomyFilters(){
 const groupHost=$('mfitAnatomyGroups'),subHost=$('mfitAnatomySubgroups');if(!groupHost||!subHost)return;
 groupHost.innerHTML=anatomyGroups.map(g=>'<button type="button" class="anatomy-filter-chip '+(selectedAnatomyGroup===g.id?'active':'')+'" onclick="mfitSelectAnatomyGroup(\''+g.id+'\')">'+g.label+'</button>').join('');
 const group=anatomyGroups.find(g=>g.id===selectedAnatomyGroup)||anatomyGroups[0];
 subHost.innerHTML='<button type="button" class="anatomy-sub-chip '+(selectedAnatomySub==='all'?'active':'')+'" onclick="mfitSelectAnatomySub(\'all\')">Alle '+group.label+'</button>'+group.subs.map(([id,de,la])=>'<button type="button" class="anatomy-sub-chip '+(selectedAnatomySub===id?'active':'')+'" onclick="mfitSelectAnatomySub(\''+id+'\')"><b>'+de+'</b><small>'+la+'</small></button>').join('');
}
window.mfitSelectAnatomyGroup=function(id){selectedAnatomyGroup=id;selectedAnatomySub='all';renderAnatomyFilters();window.mfitRenderExerciseLibrary();};
window.mfitSelectAnatomySub=function(id){selectedAnatomySub=id;renderAnatomyFilters();window.mfitRenderExerciseLibrary();};
window.mfitRenderExerciseLibrary=function(){
 const host=$('mfitExerciseCatalog');if(!host)return;
 const q=($('mfitExerciseSearch')?.value||'').toLowerCase(),group=anatomyGroups.find(g=>g.id===selectedAnatomyGroup)||anatomyGroups[0];
 const groupNames={lower:['Beine','Quadrizeps','Beinrückseite','Gesäß','Waden'],chest:['Brust'],back:['Rücken','unterer Rücken','oberer Rücken'],shoulders:['Schultern','hintere Schulter'],arms:['Bizeps','Trizeps','Unterarme'],core:['Bauch','Rumpf','unterer Rücken']};
 let list=allLibraryExercises().filter(e=>{
  const txt=(e.name+' '+e.muscle+' '+(e.secondary||[]).join(' ')+' '+e.equipment).toLowerCase();
  if(q&&!txt.includes(q))return false;
  const names=groupNames[group.id]||[];
  const groupMatch=names.some(n=>e.muscle.toLowerCase().includes(n.toLowerCase())||(e.secondary||[]).some(x=>x.toLowerCase().includes(n.toLowerCase())));
  if(!groupMatch)return false;
  return exerciseMatchesSub(e,selectedAnatomySub);
 });
 host.innerHTML=list.map(e=>{const i=allLibraryExercises().indexOf(e);return '<div class="mfit-exercise-card"><div class="mfit-exercise-card-head"><div><b>'+esc(e.name)+'</b><small>'+esc(e.muscle)+' · '+esc(e.equipment)+(e.custom?' · Eigene Übung':'')+'</small></div><button type="button" class="secondary" onclick="mfitLoadCatalogExercise('+i+')">Tracken</button><button type="button" class="secondary" onclick="mfitAddCatalogToPlan('+i+')">Zum Plan</button><button type="button" class="secondary" data-name="'+esc(e.name)+'" data-muscle="'+esc(e.muscle)+'" data-secondary="'+esc((e.secondary||[]).join('|'))+'" onclick="mfitToggleExerciseDetail(this)">Muskeln & Technik</button></div></div>';}).join('')||'<p class="muted">In diesem Bereich wurden keine passenden Übungen gefunden. Wähle „Alle“ oder nutze die Suche.</p>';
};

function loadExerciseToTracker(name,muscle,sets,reps){const set=(id,v)=>{const el=$(id);if(el)el.value=v;};set('workoutExercise',name);set('workoutMuscle',muscle==='Beinrückseite'||muscle==='Quadrizeps'?'Beine':muscle==='Rumpf'?'Bauch':muscle);set('workoutSets',sets||3);set('workoutReps',reps||10);set('workoutWeight',0);const status=$('workoutStatus');if(status)status.textContent='Übung übernommen: '+name+'. Gewicht passend zu deiner Technik eintragen.';$('workoutTrackerCard')?.scrollIntoView({behavior:'smooth',block:'start'});}
window.mfitLoadCatalogExercise=function(i){const e=allLibraryExercises()[i];if(e)loadExerciseToTracker(e.name,e.muscle,e.sets||3,e.reps||10);};
window.mfitAddCatalogToPlan=function(i){const e=allLibraryExercises()[i],plan=window.mfitCurrentTrainingPlan;if(!e)return;if(!plan?.plan?.some(d=>!d.rest)){alert('Erstelle zuerst deinen 7-Tage-Plan. Danach kannst du die Übung direkt hinzufügen.');return;}const day=plan.plan.find(d=>!d.rest);day.exercises.push({name:e.name,muscle:e.muscle,equipment:e.equipment,sets:e.sets||3,reps:String(e.reps||10),rest:'90 Sek.',secondary:e.secondary||[],custom:!!e.custom});render(plan);try{localStorage.setItem(storeKey,JSON.stringify(plan));}catch(err){}$('mfitTrainingPlanOutput')?.scrollIntoView({behavior:'smooth',block:'start'});};
function readCustomExercises(){try{return JSON.parse(localStorage.getItem('mfit_custom_exercises_v80')||'[]');}catch(e){return [];}}
function saveCustomExercises(items){try{localStorage.setItem('mfit_custom_exercises_v80',JSON.stringify(items));}catch(e){}}
window.mfitAddCustomExercise=function(){const name=$('mfitCustomExerciseName')?.value.trim(),muscle=$('mfitCustomExerciseMuscle')?.value||'Ganzkörper';if(!name){alert('Bitte gib zuerst einen Übungsnamen ein.');return;}const item={name:name,muscle:muscle,equipment:$('mfitCustomExerciseEquipment')?.value||'Sonstiges',sets:Math.max(1,Number($('mfitCustomExerciseSets')?.value)||3),reps:Math.max(1,Number($('mfitCustomExerciseReps')?.value)||10),secondary:[],custom:true};const items=readCustomExercises();items.unshift(item);saveCustomExercises(items);if(window.mfitCurrentTrainingPlan?.plan?.some(d=>!d.rest)){const target=window.mfitCurrentTrainingPlan.plan.find(d=>!d.rest);target.exercises.push({name:item.name,muscle:item.muscle,equipment:item.equipment,sets:item.sets,reps:String(item.reps),rest:'90 Sek.',custom:true,kneeCare:item.kneeCare});render(window.mfitCurrentTrainingPlan);try{localStorage.setItem(storeKey,JSON.stringify(window.mfitCurrentTrainingPlan));}catch(e){}}$('mfitCustomExerciseName').value='';window.mfitRenderCustomExercises();window.mfitRenderExerciseLibrary();const msg=$('mfitCustomExerciseList');if(msg){const p=document.createElement('p');p.className='muted';p.textContent=window.mfitCurrentTrainingPlan?'Übung gespeichert und zum ersten Trainingstag hinzugefügt.':'Übung gespeichert. Erstelle einen Plan, um sie einem Trainingstag zuzuordnen.';msg.prepend(p);}};
window.mfitRenderCustomExercises=function(){const host=$('mfitCustomExerciseList');if(!host)return;const items=readCustomExercises();host.innerHTML=items.length?'<p class="muted">Deine eigenen Übungen findest du auch oben in der Übungsbibliothek.</p>':'';};
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
renderAnatomyFilters();window.mfitRenderExerciseLibrary();window.mfitRenderCustomExercises();
})();
