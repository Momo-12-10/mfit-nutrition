/* MFit v191 — calendar, GPX bests, equipment, coach report, 4-week challenge and accessibility QA */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v===null?fallback:v}catch(e){return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return key(d)};
const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const shift=(date,n)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return key(d)};
const workouts=()=>read('mfit_workout_logs',[]);
const gpx=()=>read('mfit_gpx_sessions_v181',[]);
const card=(id,kicker,title,description,html,root)=>{
 if(!root||$(id))return;
 const el=document.createElement('article');el.id=id;el.className='card mfit-v191-card';el.dataset.mfitCollapsedDefault='true';
 el.innerHTML='<span class="settings-kicker">'+kicker+'</span><h2>'+title+'</h2><p class="muted">'+description+'</p>'+html;
 root.appendChild(el);
};
const announce=(id,message)=>{const el=$(id);if(el)el.textContent=message};
function calendarEvents(){
 const items=[];
 workouts().forEach(x=>{if(x.date)items.push({date:x.date,type:'training',label:x.exercise||'Training'})});
 const match=read('mfit_matchday_v1',{});
 if(match.date){const d=String(match.date).slice(0,10);items.push({date:d,type:'competition',label:'Wettkampf'})}
 return items;
}
let calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1),calendarSelected=today();
function phaseFor(date){
 const p=read('mfit_season_plan_v1',{});
 if(!p.start||!p.end||date<p.start||date>p.end)return '';
 if(date<=(p.build||''))return 'Aufbau';
 if(date<=(p.comp||''))return 'Wettkampfphase';
 return 'Erholung';
}
function renderCalendar(){
 const host=$('mfit191CalendarGrid'),title=$('mfit191CalendarMonth'),detail=$('mfit191CalendarDetail');if(!host||!title||!detail)return;
 const y=calendarMonth.getFullYear(),m=calendarMonth.getMonth(),first=new Date(y,m,1),offset=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate();
 title.textContent=first.toLocaleDateString('de-AT',{month:'long',year:'numeric'});
 const events=calendarEvents(),rest=read('mfit191_rest_days',[]);
 const labels=['Mo','Di','Mi','Do','Fr','Sa','So'];
 host.innerHTML=labels.map(x=>'<div class="mfit191-weekday" aria-hidden="true">'+x+'</div>').join('');
 for(let i=0;i<offset;i++)host.insertAdjacentHTML('beforeend','<span class="mfit191-empty" aria-hidden="true"></span>');
 for(let n=1;n<=days;n++){
  const date=y+'-'+String(m+1).padStart(2,'0')+'-'+String(n).padStart(2,'0'),ev=events.filter(x=>x.date===date),isRest=rest.includes(date),phase=phaseFor(date);
  const types=[...new Set(ev.map(x=>x.type))];
  host.insertAdjacentHTML('beforeend','<button type="button" class="mfit191-day '+(date===calendarSelected?'is-selected ':'')+(date===today()?'is-today':'')+'" data-calendar-date="'+date+'" aria-label="'+date+', '+ev.length+' Einträge'+(isRest?', Ruhetag':'')+(phase?', '+phase:'')+'"><b>'+n+'</b><span class="mfit191-dots">'+(types.includes('training')?'<i class="training"></i>':'')+(types.includes('competition')?'<i class="competition"></i>':'')+(isRest?'<i class="rest"></i>':'')+(phase?'<i class="phase"></i>':'')+'</span></button>');
 }
 const selectedEvents=events.filter(x=>x.date===calendarSelected),selectedRest=rest.includes(calendarSelected),phase=phaseFor(calendarSelected);
 detail.innerHTML='<b>'+new Date(calendarSelected+'T12:00:00').toLocaleDateString('de-AT',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'</b><div class="muted">'+(selectedEvents.length?selectedEvents.map(x=>(x.type==='competition'?'🏁 ':'🏋️ ')+esc(x.label)).join('<br>'):'Keine gespeicherten Trainingseinträge oder Wettkämpfe.')+(phase?'<br>Saisonphase: '+phase:'')+(selectedRest?'<br>Ruhetag markiert':'')+'</div><button type="button" class="secondary" id="mfit191ToggleRest">'+(selectedRest?'Ruhetag entfernen':'Als Ruhetag markieren')+'</button>';
 $('mfit191ToggleRest').addEventListener('click',()=>{const a=read('mfit191_rest_days',[]),i=a.indexOf(calendarSelected);if(i>=0)a.splice(i,1);else a.push(calendarSelected);write('mfit191_rest_days',a);renderCalendar()});
 host.querySelectorAll('[data-calendar-date]').forEach(b=>b.addEventListener('click',()=>{calendarSelected=b.dataset.calendarDate;renderCalendar()}));
}
function installCalendar(){
 const root=$('fitness');card('mfit191Calendar','TRAININGSÜBERSICHT','Monatskalender','Trainingstage und Wettkämpfe aus deinen gespeicherten Einträgen, Saisonphasen aus deinem Saisonplan und selbst markierte Ruhetage.','<div class="mfit191-calendar-controls"><button type="button" class="secondary" id="mfit191PrevMonth" aria-label="Vorheriger Monat">‹</button><b id="mfit191CalendarMonth"></b><button type="button" class="secondary" id="mfit191NextMonth" aria-label="Nächster Monat">›</button></div><div class="mfit191-calendar-grid" id="mfit191CalendarGrid" role="group" aria-label="Monatskalender"></div><div class="mfit191-calendar-legend"><span>● Training</span><span>● Wettkampf</span><span>● Ruhetag</span><span>● Saisonphase</span></div><div class="mfit191-calendar-detail" id="mfit191CalendarDetail" aria-live="polite"></div>',root);
 if(!$('mfit191Calendar'))return;
 $('mfit191PrevMonth').addEventListener('click',()=>{calendarMonth.setMonth(calendarMonth.getMonth()-1);renderCalendar()});
 $('mfit191NextMonth').addEventListener('click',()=>{calendarMonth.setMonth(calendarMonth.getMonth()+1);renderCalendar()});
 renderCalendar();
}
function duration(sec){if(!Number.isFinite(sec)||sec<=0)return '–';const m=Math.floor(sec/60),s=Math.round(sec%60);return m+':'+String(s).padStart(2,'0')+' min/km'}
function installRunBests(){
 const root=$('fitness');card('mfit191RunBests','LAUFLEISTUNG','Lauf-Bestzeiten','Bestwerte aus deinen lokal gespeicherten GPX-Aktivitäten. Verglichen werden vollständige importierte Aktivitäten, keine erfundenen Strecken-Splits.','<div class="mfit191-kpis" id="mfit191RunKpis"></div><div id="mfit191RunHistory" class="mfit191-list"></div>',root);
 renderRunBests();
}
function renderRunBests(){
 const rows=gpx().filter(x=>Number(x.distanceKm)>0),kpis=$('mfit191RunKpis'),history=$('mfit191RunHistory');if(!kpis||!history)return;
 if(!rows.length){kpis.textContent='Noch keine GPX-Aktivitäten gespeichert.';history.textContent='Importiere zuerst eine Lauf-GPX-Datei im Bereich GPX-Import.';return}
 const longest=rows.reduce((a,b)=>a.distanceKm>b.distanceKm?a:b),fastest=rows.filter(x=>Number(x.paceSecondsPerKm)>0).reduce((a,b)=>!a||a.paceSecondsPerKm>b.paceSecondsPerKm?b:a,null);
 const quickest=rows.filter(x=>Number(x.durationSeconds)>0).reduce((a,b)=>!a||a.durationSeconds>b.durationSeconds?b:a,null);
 kpis.innerHTML='<div><small>LÄNGSTE AKTIVITÄT</small><b>'+Number(longest.distanceKm).toFixed(2)+' km</b></div><div><small>BESTE PACE</small><b>'+(fastest?duration(fastest.paceSecondsPerKm):'–')+'</b></div><div><small>KÜRZESTE GESAMTZEIT</small><b>'+(quickest?formatRunTime(quickest.durationSeconds):'–')+'</b></div><div><small>AKTIVITÄTEN</small><b>'+rows.length+'</b></div>';
 history.innerHTML=rows.slice().sort((a,b)=>String(b.recordedAt).localeCompare(String(a.recordedAt))).map(x=>'<div class="mfit191-list-row"><b>'+Number(x.distanceKm).toFixed(2)+' km</b><span>'+duration(x.paceSecondsPerKm)+' · '+formatRunTime(x.durationSeconds)+'</span><small>'+new Date(x.recordedAt).toLocaleDateString('de-AT')+'</small></div>').join('');
}
function formatRunTime(sec){if(!Number.isFinite(Number(sec)))return 'Zeitdaten fehlen';sec=Number(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=Math.round(sec%60);return h? h+' h '+m+' min':m+':'+String(s).padStart(2,'0')+' min'}
function installEquipment(){
 const root=$('fitness');card('mfit191Equipment','AUSRÜSTUNG','Ausrüstungs-Tracker','Sammle Lauf- oder Radkilometer pro Ausrüstung. Die Hinweise sind Erinnerungen zum Prüfen, keine automatische Verschleißdiagnose.','<form id="mfit191GearForm" class="mfit191-form"><label for="mfit191GearName">Name</label><input id="mfit191GearName" maxlength="60" required placeholder="z. B. Laufschuh 1"><label for="mfit191GearType">Typ</label><select id="mfit191GearType"><option value="Laufschuh">Laufschuh</option><option value="Fahrrad">Fahrrad</option><option value="Sonstiges">Sonstiges</option></select><label for="mfit191GearLimit">Prüfhinweis nach (km)</label><input id="mfit191GearLimit" type="number" min="1" max="200000" value="600" required><button type="submit">Ausrüstung hinzufügen</button></form><hr><form id="mfit191GearLogForm" class="mfit191-form"><label for="mfit191GearSelect">Ausrüstung</label><select id="mfit191GearSelect"></select><label for="mfit191GearKm">Gefahrene / gelaufene Kilometer</label><input id="mfit191GearKm" type="number" min="0.1" max="1000" step="0.1" required placeholder="z. B. 5.4"><label for="mfit191GearDate">Datum</label><input id="mfit191GearDate" type="date" value="'+today()+'"><button type="submit">Kilometer erfassen</button></form><div id="mfit191GearList" class="mfit191-list" aria-live="polite"></div>',root);
 if(!$('mfit191Equipment'))return;
 $('mfit191GearForm').addEventListener('submit',e=>{e.preventDefault();const a=read('mfit191_equipment',[]),name=$('mfit191GearName').value.trim(),limit=Number($('mfit191GearLimit').value);if(!name||!Number.isFinite(limit)||limit<=0)return; a.push({id:'gear-'+Date.now(),name,type:$('mfit191GearType').value,limit,total:0,checkedAt:0});write('mfit191_equipment',a);$('mfit191GearName').value='';renderEquipment()});
 $('mfit191GearLogForm').addEventListener('submit',e=>{e.preventDefault();const id=$('mfit191GearSelect').value,km=Number($('mfit191GearKm').value),a=read('mfit191_equipment',[]),g=a.find(x=>x.id===id);if(!g||!Number.isFinite(km)||km<=0)return;g.total=Number(g.total||0)+km;const logs=read('mfit191_gear_logs',[]);logs.push({id,date:$('mfit191GearDate').value||today(),km});write('mfit191_equipment',a);write('mfit191_gear_logs',logs);$('mfit191GearKm').value='';renderEquipment()});
 renderEquipment();
}
function renderEquipment(){
 const a=read('mfit191_equipment',[]),sel=$('mfit191GearSelect'),list=$('mfit191GearList');if(!sel||!list)return;
 sel.innerHTML=a.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+' · '+esc(x.type)+'</option>').join('');
 if(!a.length)sel.innerHTML='<option value="">Zuerst Ausrüstung hinzufügen</option>';
 list.innerHTML=a.length?a.map(x=>{const due=Number(x.total)>=Number(x.limit),pct=Math.min(100,Number(x.total)/Math.max(1,Number(x.limit))*100);return '<div class="mfit191-list-row"><b>'+esc(x.name)+' · '+esc(x.type)+'</b><span>'+Number(x.total).toFixed(1)+' / '+Number(x.limit).toFixed(0)+' km</span><div class="mfit191-progress"><i style="width:'+pct+'%"></i></div><small>'+(due?'Prüfung fällig: Zustand und Passform kontrollieren.':'Bei '+Math.max(0,Number(x.limit)-Number(x.total)).toFixed(1)+' km an eine Prüfung erinnern.')+'</small></div>'}).join(''):'Noch keine Ausrüstung gespeichert.';
}
function installChallenge(){
 const root=$('fitness');card('mfit191Challenge','FREIWILLIG · 4 WOCHEN','4-Wochen-Challenge','Setze dir erreichbare Trainings- und Mobility-Ziele. Ruhetage gehören dazu. Keine Gewichts- oder Kalorienziele.','<div class="grid"><div><label for="mfit191WorkoutGoal">Trainingseinheiten pro Woche</label><input id="mfit191WorkoutGoal" type="number" min="1" max="7" value="3"></div><div><label for="mfit191MobilityGoal">Mobility-Einheiten pro Woche</label><input id="mfit191MobilityGoal" type="number" min="1" max="7" value="2"></div></div><fieldset class="mfit191-rest-select"><legend>Deine festen Ruhetage (frei wählbar)</legend>'+['Mo','Di','Mi','Do','Fr','Sa','So'].map((d,i)=>'<label><input type="checkbox" class="mfit191-rest-weekday" value="'+i+'" '+(i===6?'checked':'')+'> '+d+'</label>').join('')+'</fieldset><button type="button" id="mfit191ChallengeStart">Challenge starten / Ziele speichern</button><button type="button" class="secondary" id="mfit191MobilityDone">Mobility heute erledigt</button><div id="mfit191ChallengeStatus" class="mfit191-list" aria-live="polite"></div>',root);
 if(!$('mfit191Challenge'))return;
 const old=read('mfit191_challenge',null);if(old){$('mfit191WorkoutGoal').value=old.workouts||3;$('mfit191MobilityGoal').value=old.mobility||2;document.querySelectorAll('.mfit191-rest-weekday').forEach(x=>x.checked=(old.restDays||[6]).includes(Number(x.value)))}
 $('mfit191ChallengeStart').addEventListener('click',()=>{const c={start:today(),end:shift(today(),27),workouts:Math.max(1,Math.min(7,Number($('mfit191WorkoutGoal').value)||3)),mobility:Math.max(1,Math.min(7,Number($('mfit191MobilityGoal').value)||2)),restDays:[...document.querySelectorAll('.mfit191-rest-weekday:checked')].map(x=>Number(x.value))};write('mfit191_challenge',c);renderChallenge()});
 $('mfit191MobilityDone').addEventListener('click',()=>{const a=read('mfit191_mobility_days',[]);if(!a.includes(today()))a.push(today());write('mfit191_mobility_days',a);renderChallenge()});
 renderChallenge();
}
function weekStart(date){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return key(d)}
function renderChallenge(){
 const c=read('mfit191_challenge',null),host=$('mfit191ChallengeStatus');if(!host)return;
 if(!c){host.textContent='Noch keine Challenge gestartet. Deine bisherigen Trainingseinträge bleiben unverändert.';return}
 const weeks=[];for(let w=0,d=shift(c.start,w*7);w<4;w++,d=shift(c.start,(w+1)*7)){const stop=shift(d,6),training=workouts().filter(x=>x.date>=d&&x.date<=stop).length,mobility=read('mfit191_mobility_days',[]).filter(x=>x>=d&&x<=stop).length;weeks.push({d,training,mobility})}
 host.innerHTML='<b>'+c.start+' bis '+c.end+'</b>'+weeks.map((w,i)=>'<div class="mfit191-list-row"><b>Woche '+(i+1)+'</b><span>Training '+w.training+' / '+c.workouts+' · Mobility '+w.mobility+' / '+c.mobility+'</span><div class="mfit191-progress"><i style="width:'+Math.min(100,w.training/c.workouts*100)+'%"></i></div><small>Ruhetage: '+(c.restDays.length?c.restDays.map(x=>['Mo','Di','Mi','Do','Fr','Sa','So'][x]).join(', '):'keine festgelegt')+'</small></div>').join('')+'<p class="muted">Fortschritt zählt nur gespeicherte Trainingseinheiten und deine Mobility-Bestätigungen. Du kannst jederzeit pausieren oder Ziele ändern.</p>';
}
function installCoachReport(){
 const root=$('home');card('mfit191CoachReport','TEILBARER ÜBERBLICK','Trainer-Bericht','Wähle vor dem Erstellen aus, welche gespeicherten Daten enthalten sein sollen. Gesundheitsdaten sind standardmäßig ausgeschlossen.','<fieldset class="mfit191-report-options"><legend>Inhalt auswählen</legend><label><input type="checkbox" id="mfit191ReportTraining" checked> Trainingseinträge</label><label><input type="checkbox" id="mfit191ReportGpx" checked> GPX-Laufaktivitäten</label><label><input type="checkbox" id="mfit191ReportNutrition"> Ernährungseinträge</label><label><input type="checkbox" id="mfit191ReportHealth"> Gesundheitsdaten (optional)</label></fieldset><p class="muted">Gesundheitsdaten können sensible Angaben enthalten. Aktiviere sie nur, wenn du sie wirklich teilen möchtest.</p><label for="mfit191ReportFrom">Zeitraum ab</label><input type="date" id="mfit191ReportFrom" value="'+shift(today(),-6)+'"><label for="mfit191ReportTo">Zeitraum bis</label><input type="date" id="mfit191ReportTo" value="'+today()+'"><button type="button" id="mfit191ReportPreview">Bericht vorbereiten</button><div id="mfit191ReportStatus" class="muted" aria-live="polite"></div>',root);
 if(!$('mfit191CoachReport'))return;
 $('mfit191ReportPreview').addEventListener('click',buildCoachReport);
}
function buildCoachReport(){
 const from=$('mfit191ReportFrom').value,to=$('mfit191ReportTo').value;if(!from||!to||from>to){announce('mfit191ReportStatus','Bitte einen gültigen Zeitraum auswählen.');return}
 const sections=[];
 if($('mfit191ReportTraining').checked){const a=workouts().filter(x=>x.date>=from&&x.date<=to);sections.push({title:'Training',rows:a.map(x=>[x.date,x.exercise||'Training',(x.sets||'–')+' Sätze × '+(x.reps||'–')+' Wdh. · '+(x.weight??'–')+' kg'])})}
 if($('mfit191ReportGpx').checked){const a=gpx().filter(x=>String(x.recordedAt||'').slice(0,10)>=from&&String(x.recordedAt||'').slice(0,10)<=to);sections.push({title:'GPX-Aktivitäten',rows:a.map(x=>[String(x.recordedAt||'').slice(0,10),Number(x.distanceKm).toFixed(2)+' km',formatRunTime(x.durationSeconds)+' · '+duration(x.paceSecondsPerKm)])})}
 if($('mfit191ReportNutrition').checked){const a=read('mfit_entries',[]).filter(x=>x.date>=from&&x.date<=to);sections.push({title:'Ernährung',rows:a.map(x=>[x.date,x.foodName||x.name||'Eintrag',(Number(x.kcal)||0)+' kcal · '+(Number(x.protein)||0)+' g Protein'])})}
 if($('mfit191ReportHealth').checked){const recovery=read('mfit_recovery_logs',[]).filter(x=>x.date>=from&&x.date<=to);const weights=read('mfit_weight_logs',[]).filter(x=>x.date>=from&&x.date<=to);sections.push({title:'Gesundheitsdaten – freiwillig ausgewählt',rows:[...recovery.map(x=>[x.date,'Erholung','Stress '+(x.stress??'–')+' · Tagesform '+(x.readiness??'–')]),...weights.map(x=>[x.date,'Gewicht',String(x.weight??x.value??'–')]) ]})}
 if(!sections.length){announce('mfit191ReportStatus','Bitte mindestens einen Datenbereich auswählen.');return}
 const w=window.open('','_blank');if(!w){announce('mfit191ReportStatus','Der Browser hat das Berichtsfenster blockiert. Erlaube Pop-ups für MFit und versuche es erneut.');return}
 w.document.write('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MFit Trainer-Bericht</title><style>body{font:14px system-ui,sans-serif;color:#18202a;max-width:900px;margin:32px auto;padding:0 20px}h1{font-size:25px}h2{font-size:18px;margin-top:28px}p{color:#4d5968}table{width:100%;border-collapse:collapse;margin:10px 0 20px}td,th{text-align:left;padding:8px;border-bottom:1px solid #d5dbe2}button{padding:10px 16px}@media print{button{display:none}body{margin:0}}</style></head><body><h1>MFit Performance · Trainer-Bericht</h1><p>Zeitraum: '+esc(from)+' bis '+esc(to)+'<br>Erstellt: '+esc(new Date().toLocaleString('de-AT'))+'</p>'+sections.map(s=>'<h2>'+esc(s.title)+'</h2>'+(s.rows.length?'<table><thead><tr><th>Datum</th><th>Eintrag</th><th>Details</th></tr></thead><tbody>'+s.rows.map(r=>'<tr>'+r.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<p>Keine Einträge im ausgewählten Zeitraum.</p>')).join('')+'<p>Erstellt lokal in MFit Performance. Bitte vor dem Teilen prüfen, ob alle ausgewählten Angaben weitergegeben werden sollen.</p><button onclick="window.print()">Drucken / Als PDF speichern</button></body></html>');
 w.document.close();announce('mfit191ReportStatus','Bericht wurde in einem neuen Fenster vorbereitet. Dort „Drucken“ und „Als PDF sichern“ wählen.');
}
function installAccessibility(){
 const root=$('settings');card('mfit191Accessibility','BARRIEREARMUT','Bedienbarkeit prüfen','Schriftgröße und Kontrast findest du bereits unter „Bedienung & Feedback“. Ergänzend gibt es eine kurze Tastatur- und Screenreader-Prüfliste.','<ul class="mfit191-access-list"><li>Mit Tab und Umschalt+Tab durch Buttons, Eingaben und Navigation gehen.</li><li>Fokusrahmen muss jederzeit gut sichtbar sein; Enter oder Leertaste aktiviert Buttons.</li><li>Formularfelder brauchen sichtbare Beschriftungen; Fehlermeldungen sollen verständlich sein.</li><li>Statusmeldungen und dynamische Ergebnisse sollen von Screenreadern angekündigt werden.</li><li>iPhone: VoiceOver aktivieren und Navigation sowie Kalender testen.</li><li>Android: TalkBack aktivieren und Navigation sowie Kalender testen.</li></ul><p class="muted">Die vorhandenen Einstellungen „Größere Schrift“, „Kontrast erhöhen“ und „Bewegungen reduzieren“ bleiben erhalten.</p><button type="button" class="secondary" id="mfit191OpenPrefs">Bedienungseinstellungen öffnen</button>',root);
 $('mfit191OpenPrefs')?.addEventListener('click',()=>{const el=$('mfitAppPreferences');el?.scrollIntoView({behavior:'smooth',block:'start'});});
}
function init(){
 installCalendar();installRunBests();installEquipment();installChallenge();installCoachReport();installAccessibility();
 document.addEventListener('click',e=>{if(e.target.closest('[data-tab]'))setTimeout(()=>{renderCalendar();renderRunBests();renderChallenge()},150)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderCalendar();renderRunBests();renderChallenge()}});
 window.addEventListener('storage',()=>{renderCalendar();renderRunBests();renderChallenge();renderEquipment()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();