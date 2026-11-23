/* MFit Performance v91 — interactive full-body anatomical atlas */
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
 const main=new Set(primary||[]),support=new Set(secondary||[]);
 const palette={chestUpper:'#f07836',chestMid:'#f07836',chestLower:'#e96b31',frontDelts:'#e94e32',sideDelts:'#e94e32',rearDelts:'#e94e32',biceps:'#f2cf45',triceps:'#f2cf45',forearms:'#79bd3d',abs:'#f18a3c',obliques:'#247e67',lowerback:'#f2eee9',lats:'#ef7b35',traps:'#e94e32',rhomboids:'#d88a36',quadriceps:'#3939a6',hamstrings:'#5b20a0',adductors:'#183f88',glutes:'#176f83',calves:'#a32688'};
 const fill=k=>main.has(k)?'#d7ff83':support.has(k)?'#79d9f4':(palette[k]||'#c9cdd2');
 const alpha=k=>(main.has(k)||support.has(k))?1:1;
 const muscle=(k,d)=>'<path class="mfit-muscle-hit" data-muscle-key="'+k+'" role="button" tabindex="0" aria-label="Muskel auswählen: '+k+'" d="'+d+'" fill="'+fill(k)+'" fill-opacity="'+alpha(k)+'" stroke="#171717" stroke-opacity=".9" stroke-width="1.5" stroke-linejoin="round"/>';
 const front=[
  muscle('frontDelts','M105 78 Q91 73 86 87 Q82 101 95 111 L108 104 Q115 91 105 78Z'),
  muscle('frontDelts','M175 78 Q189 73 194 87 Q198 101 185 111 L172 104 Q165 91 175 78Z'),
  muscle('sideDelts','M101 79 Q91 76 86 88 Q81 99 91 108 L104 101 Q108 89 101 79Z'),
  muscle('sideDelts','M179 79 Q189 76 194 88 Q199 99 189 108 L176 101 Q172 89 179 79Z'),
  muscle('chestUpper','M111 105 Q126 94 140 106 Q154 94 169 105 L164 123 Q151 128 140 120 Q129 128 116 123Z'),
  muscle('chestMid','M116 124 Q129 119 140 126 Q151 119 164 124 L161 143 Q149 148 140 141 Q131 148 119 143Z'),
  muscle('chestLower','M120 144 Q131 139 140 145 Q149 139 160 144 L154 157 Q140 163 126 157Z'),
  muscle('biceps','M91 112 Q82 119 84 137 Q85 150 93 158 Q101 145 100 129Z'),
  muscle('biceps','M189 112 Q198 119 196 137 Q195 150 187 158 Q179 145 180 129Z'),
  muscle('forearms','M83 159 Q76 168 74 188 L79 207 Q87 202 91 186 L94 164Z'),
  muscle('forearms','M197 159 Q204 168 206 188 L201 207 Q193 202 189 186 L186 164Z'),
  muscle('abs','M131 159 Q140 155 149 159 L151 204 Q140 211 129 204Z'),
  muscle('obliques','M117 158 Q126 161 128 174 L126 203 Q116 198 112 184Z'),
  muscle('obliques','M163 158 Q154 161 152 174 L154 203 Q164 198 168 184Z'),
  muscle('quadriceps','M112 216 Q126 211 137 220 L134 264 Q128 278 119 281 Q110 266 108 245Z'),
  muscle('quadriceps','M168 216 Q154 211 143 220 L146 264 Q152 278 161 281 Q170 266 172 245Z'),
  muscle('adductors','M137 222 Q140 218 143 222 L143 267 Q140 278 137 267Z'),
  muscle('adductors','M143 222 Q140 218 137 222 L137 267 Q140 278 143 267Z'),
  muscle('calves','M116 286 Q126 280 132 291 L130 326 Q125 337 117 331 L112 306Z'),
  muscle('calves','M164 286 Q154 280 148 291 L150 326 Q155 337 163 331 L168 306Z')
 ].join('');
 const back=[
  muscle('rearDelts','M326 78 Q312 73 307 88 Q304 102 318 111 L331 104Z'),
  muscle('rearDelts','M394 78 Q408 73 413 88 Q416 102 402 111 L389 104Z'),
  muscle('traps','M339 83 Q360 72 381 83 L376 119 Q360 132 344 119Z'),
  muscle('rhomboids','M344 119 Q360 112 376 119 L372 145 L360 151 L348 145Z'),
  muscle('lats','M341 128 Q329 124 328 142 L334 178 Q346 190 357 177 L357 143Z'),
  muscle('lats','M379 128 Q391 124 392 142 L386 178 Q374 190 363 177 L363 143Z'),
  muscle('lowerback','M351 151 Q360 146 369 151 L373 192 Q360 202 347 192Z'),
  muscle('triceps','M312 111 Q303 118 306 140 L315 157 Q324 147 322 127Z'),
  muscle('triceps','M408 111 Q417 118 414 140 L405 157 Q396 147 398 127Z'),
  muscle('forearms','M304 158 Q297 171 297 190 L303 207 Q311 202 314 185 L316 164Z'),
  muscle('forearms','M416 158 Q423 171 423 190 L417 207 Q409 202 406 185 L404 164Z'),
  muscle('glutes','M343 199 Q360 192 377 199 L380 225 Q370 239 360 231 Q350 239 340 225Z'),
  muscle('hamstrings','M342 235 Q352 230 358 238 L356 280 Q348 290 340 278Z'),
  muscle('hamstrings','M378 235 Q368 230 362 238 L364 280 Q372 290 380 278Z'),
  muscle('calves','M342 287 Q352 282 357 293 L354 328 Q348 338 340 330Z'),
  muscle('calves','M378 287 Q368 282 363 293 L366 328 Q372 338 380 330Z')
 ].join('');
 const body=(x)=>'<g transform="translate('+x+' 0)"><g fill="#fff" stroke="#151515" stroke-width="1.8" stroke-linejoin="round"><circle cx="140" cy="43" r="18"/><path d="M130 61 L150 61 L154 76 Q171 77 178 91 L183 148 Q181 166 168 181 L162 211 L118 211 L112 181 Q99 166 97 148 L102 91 Q109 77 126 76Z"/><path d="M102 84 Q91 80 85 94 L69 151 Q65 166 75 174 Q84 178 90 164 L112 111Z"/><path d="M178 84 Q189 80 195 94 L211 151 Q215 166 205 174 Q196 178 190 164 L168 111Z"/><path d="M119 207 L140 213 L161 207 L165 268 L160 333 Q157 344 147 344 Q139 344 139 333 L140 267 L134 333 Q133 344 123 344 Q113 344 112 333 L107 268Z"/></g><g>'+ (x===0?front:back)+'</g><g fill="none" stroke="#171717" stroke-opacity=".34" stroke-width="1"><path d="M140 77V207 M112 159Q140 170 168 159 M115 213Q140 221 165 213 M140 234V329"/><path d="M101 105L88 158 M179 105L192 158"/></g></g>';
 const latin=[
 ['chestUpper','Obere Brust','Pectoralis major · Pars clavicularis'],['chestMid','Mittlere Brust','Pectoralis major · Pars sternocostalis'],['chestLower','Untere Brust','Pectoralis major · Pars abdominalis'],
 ['frontDelts','Vordere Schulter','Deltoideus · Pars clavicularis'],['sideDelts','Seitliche Schulter','Deltoideus · Pars acromialis'],['rearDelts','Hintere Schulter','Deltoideus · Pars spinalis'],
 ['biceps','Bizeps','Biceps brachii'],['triceps','Trizeps','Triceps brachii'],['forearms','Unterarme','Musculi antebrachii'],
 ['abs','Gerader Bauch','Rectus abdominis'],['obliques','Schräge Bauchmuskeln','Obliquus externus abdominis'],['lowerback','Unterer Rücken','Erector spinae'],
 ['lats','Breiter Rücken','Latissimus dorsi'],['traps','Trapezmuskel','Trapezius'],['rhomboids','Rautenmuskeln','Rhomboidei'],
 ['quadriceps','Vorderer Oberschenkel','Quadriceps femoris'],['hamstrings','Beinbeuger','Ischiocrurales'],['adductors','Innenschenkel','Adductores'],['glutes','Gesäß','Gluteus maximus'],['calves','Waden','Triceps surae']
 ];
 const key=latin.map(([id,de,la])=>'<div class="anatomy-key-item '+(main.has(id)?'is-primary':support.has(id)?'is-support':'')+'"><span class="anatomy-key-dot"></span><span><b>'+de+'</b><small>'+la+'</small></span></div>').join('');
 return '<div class="mfit-anatomy-graphic"><div class="mfit-anatomy-legend"><span><i class="mfit-dot-primary"></i>Hauptmuskel</span><span><i class="mfit-dot-support"></i>Unterstützend</span></div><svg class="anatomy-body-svg mfit-muscle-atlas" viewBox="0 0 500 360" role="img" aria-label="Anatomische Muskelübersicht, Vorder- und Rückansicht"><text x="140" y="16" text-anchor="middle" class="mfit-anatomy-viewlabel">VORDERANSICHT</text><text x="360" y="16" text-anchor="middle" class="mfit-anatomy-viewlabel">RÜCKANSICHT</text>'+body(0)+body(220)+'<path d="M250 27V345" stroke="#c5c5c5" stroke-dasharray="3 6" opacity=".7"/></svg><div class="anatomy-muscle-key">'+key+'</div></div>';
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
const anatomyMuscleTargets={
 chestUpper:['chest','chestUpper'],chestMid:['chest','chestMid'],chestLower:['chest','chestLower'],
 frontDelts:['shoulders','frontDelts'],sideDelts:['shoulders','sideDelts'],rearDelts:['shoulders','rearDelts'],
 biceps:['arms','biceps'],triceps:['arms','triceps'],forearms:['arms','forearms'],
 abs:['core','abs'],obliques:['core','obliques'],lowerback:['back','lowerback'],
 lats:['back','lats'],traps:['back','traps'],rhomboids:['back','rhomboids'],
 quadriceps:['lower','quadriceps'],hamstrings:['lower','hamstrings'],adductors:['lower','adductors'],
 glutes:['lower','glutes'],calves:['lower','calves']
};
window.mfitSelectMuscleFromAtlas=function(id){
 const target=anatomyMuscleTargets[id];if(!target)return;
 selectedAnatomyGroup=target[0];selectedAnatomySub=target[1];
 renderAnatomyFilters();window.mfitRenderExerciseLibrary();
 document.querySelectorAll('.mfit-muscle-hit').forEach(path=>path.classList.toggle('is-selected',path.dataset.muscleKey===id));
 const results=$('mfitExerciseCatalog');results?.scrollIntoView({behavior:'smooth',block:'start'});
};
document.addEventListener('click',event=>{const path=event.target.closest?.('.mfit-muscle-hit');if(path)window.mfitSelectMuscleFromAtlas(path.dataset.muscleKey);});
document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches?.('.mfit-muscle-hit')){event.preventDefault();window.mfitSelectMuscleFromAtlas(event.target.dataset.muscleKey);}});
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
