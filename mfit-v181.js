/* MFit v181 — daily overview, safe meal copy, mobility timer, local GPX and share card */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const KEYS={pins:'mfit_pinned_actions_v181',gpx:'mfit_gpx_sessions_v181'};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const shiftDay=(offset)=>{const d=new Date();d.setDate(d.getDate()+offset);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const safeParse=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v===null?fallback:v}catch(e){return fallback}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const navTo=(tab,id)=>{if(typeof window.showTab==='function')window.showTab(tab);if(id)setTimeout(()=>$(id)?.scrollIntoView({behavior:'smooth',block:'start'}),100)};
function createCard(id,kicker,title,description,html,root,after){
 if($(id))return $(id);
 const c=document.createElement('article');c.id=id;c.className='card mfit181-card';c.dataset.mfitCollapsedDefault='true';
 c.innerHTML='<span class="settings-kicker">'+kicker+'</span><h2>'+title+'</h2><p class="muted">'+description+'</p>'+html;
 if(after&&after.parentNode)after.insertAdjacentElement('afterend',c);else root.appendChild(c);
 return c;
}
function installToday(){
 const home=$('home');if(!home||$('mfitTodayPanel'))return;
 const panel=document.createElement('section');panel.id='mfitTodayPanel';panel.className='mfit-today-panel';
 panel.innerHTML='<div class="mfit-today-heading"><div><span class="settings-kicker">MFIT · HEUTE</span><h2>Dein Tag auf einen Blick</h2><p id="mfitTodayDate" class="muted"></p></div><span class="mfit-today-mark">●</span></div><div class="mfit-today-stats"><div><b id="mfitTodayTraining">0</b><small>Trainingseinträge</small></div><div><b id="mfitTodayMeals">0</b><small>Mahlzeiten-Einträge</small></div><div><b id="mfitTodayWater">0 ml</b><small>Getränke erfasst</small></div><div><b id="mfitTodayMatch">–</b><small>Wettkampf</small></div></div><div class="mfit-today-actions"><button type="button" data-today-action="training">Training</button><button type="button" data-today-action="match">Wettkampf</button><button type="button" data-today-action="water">+ 250 ml</button><button type="button" data-today-action="meal">Mahlzeit</button></div>';
 const first=home.firstElementChild; if(first)home.insertBefore(panel,first);else home.appendChild(panel);
 panel.querySelector('[data-today-action="training"]').addEventListener('click',()=>navTo('fitness','workoutTrackerCard'));
 panel.querySelector('[data-today-action="match"]').addEventListener('click',()=>navTo('fitness','mfitMatchday'));
 panel.querySelector('[data-today-action="water"]').addEventListener('click',()=>{if(typeof window.addWater==='function')window.addWater(250);refreshToday()});
 panel.querySelector('[data-today-action="meal"]').addEventListener('click',()=>navTo('track','foodName'));
 refreshToday();
}
function refreshToday(){
 if(!$('mfitTodayPanel'))return;
 const d=today(),entries=typeof data!=='undefined'&&Array.isArray(data)?data.filter(x=>(x.date||d)===d):safeParse('mfit_entries',[]).filter(x=>(x.date||d)===d);
 const workouts=safeParse('mfit_workout_logs',[]).filter(x=>x.date===d);
 const match=safeParse('mfit_matchday_v1',{});
 const matchDate=match.date?new Date(match.date):null;
 $('mfitTodayDate').textContent=new Date().toLocaleDateString('de-AT',{weekday:'long',day:'numeric',month:'long'});
 $('mfitTodayTraining').textContent=String(workouts.length);
 $('mfitTodayMeals').textContent=String(entries.length);
 $('mfitTodayWater').textContent=Math.round(Number(localStorage.getItem('mfit_water')||0)).toLocaleString('de-AT')+' ml';
 $('mfitTodayMatch').textContent=matchDate&&!Number.isNaN(matchDate.getTime())?matchDate.toLocaleDateString('de-AT',{day:'2-digit',month:'2-digit'}):'–';
}
const actionCatalog=[
 {id:'track',label:'Ernährung',icon:'＋',run:()=>navTo('track','foodName')},
 {id:'fitness',label:'Training',icon:'↗',run:()=>navTo('fitness','workoutTrackerCard')},
 {id:'water',label:'Wasser',icon:'＋',run:()=>{if(typeof window.addWater==='function')window.addWater(250);refreshToday()}},
 {id:'timer',label:'Intervalltimer',icon:'◷',run:()=>navTo('fitness','mfitIntervalTimer')},
 {id:'recipes',label:'Rezepte',icon:'⌂',run:()=>navTo('recipes')},
 {id:'match',label:'Wettkampf',icon:'⚑',run:()=>navTo('fitness','mfitMatchday')}
];
function readPins(){const v=safeParse(KEYS.pins,['track','fitness','water','timer']);return Array.isArray(v)?v.filter(id=>actionCatalog.some(a=>a.id===id)).slice(0,4):['track','fitness','water','timer']}
function renderPins(){
 const card=$('mfitQuickActions');if(!card)return;
 const host=card.querySelector('.mfit-quick-actions');if(!host)return;
 const pins=readPins();
 const heading=card.querySelector('h2');if(heading)heading.textContent='Deine Favoriten';
 const kicker=card.querySelector('.settings-kicker');if(kicker)kicker.textContent='DEIN SCHNELLZUGRIFF';
 host.innerHTML=pins.map(id=>{const a=actionCatalog.find(x=>x.id===id);return a?'<button type="button" data-mfit-pin="'+a.id+'"><span aria-hidden="true">'+a.icon+'</span> '+a.label+'</button>':''}).join('')+'<button type="button" class="mfit-pin-edit" id="mfitPinEdit">Anpassen</button>';
 host.querySelectorAll('[data-mfit-pin]').forEach(b=>b.addEventListener('click',()=>actionCatalog.find(a=>a.id===b.dataset.mfitPin)?.run()));
 $('mfitPinEdit').addEventListener('click',togglePinEditor);
}
function togglePinEditor(){
 const card=$('mfitQuickActions'),host=card?.querySelector('.mfit-quick-actions');if(!host)return;
 let editor=$('mfitPinEditor');
 if(editor){editor.remove();return}
 editor=document.createElement('div');editor.id='mfitPinEditor';editor.className='mfit-pin-editor';
 const selected=readPins();
 editor.innerHTML='<p class="muted">Wähle bis zu vier Favoriten für deinen Schnellzugriff.</p>'+actionCatalog.map(a=>'<label><input type="checkbox" value="'+a.id+'" '+(selected.includes(a.id)?'checked':'')+'> '+a.label+'</label>').join('')+'<p class="muted" id="mfitPinStatus" aria-live="polite"></p>';
 host.insertAdjacentElement('afterend',editor);
 editor.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{
  const values=[...editor.querySelectorAll('input:checked')].map(x=>x.value);
  if(values.length>4){input.checked=false;$('mfitPinStatus').textContent='Maximal vier Favoriten auswählen.';return}
  try{localStorage.setItem(KEYS.pins,JSON.stringify(values))}catch(e){$('mfitPinStatus').textContent='Speichern nicht möglich.';return}
  renderPins();togglePinEditor();
 }));
}
function installYesterdayCopy(){
 const home=$('home');if(!home)return;
 const card=createCard('mfit181YesterdayCopy','MAHLZEITEN','Von gestern kopieren','Übernimm deine gestrigen Lebensmitteleinträge nach einer Vorschau. Nichts wird ohne deine Bestätigung hinzugefügt.','<button type="button" id="mfit181PreviewYesterday">Gestrige Einträge ansehen</button><div id="mfit181YesterdayPreview" class="mfit181-preview" hidden></div><p id="mfit181YesterdayStatus" class="muted" aria-live="polite"></p>',home,$('mfitQuickActions')||$('mfitProgressDashboard'));
 $('mfit181PreviewYesterday').addEventListener('click',showYesterdayPreview);
}
let yesterdayEntries=[];
function showYesterdayPreview(){
 const y=shiftDay(-1),d=today();yesterdayEntries=(typeof data!=='undefined'&&Array.isArray(data)?data:safeParse('mfit_entries',[])).filter(x=>(x.date||d)===y);
 const host=$('mfit181YesterdayPreview');if(!host)return;host.hidden=false;host.replaceChildren();
 const heading=document.createElement('p');heading.textContent=yesterdayEntries.length?yesterdayEntries.length+' Einträge vom '+new Date(y+'T12:00:00').toLocaleDateString('de-AT'):'Für gestern wurden keine Ernährungseinträge gefunden.';host.appendChild(heading);
 yesterdayEntries.slice(0,30).forEach(x=>{const row=document.createElement('div');row.className='mfit181-preview-row';row.textContent=String(x.name||'Lebensmittel')+' · '+String(x.amount??'')+' '+String(x.unit||'')+' · '+String(x.meal||'Snack');host.appendChild(row)});
 if(yesterdayEntries.length>30){const more=document.createElement('p');more.textContent='Weitere '+(yesterdayEntries.length-30)+' Einträge werden ebenfalls übernommen.';host.appendChild(more)}
 if(yesterdayEntries.length){const confirm=document.createElement('button');confirm.type='button';confirm.textContent='Diese '+yesterdayEntries.length+' Einträge zu heute hinzufügen';confirm.addEventListener('click',copyYesterdayConfirmed);host.appendChild(confirm)}
}
function copyYesterdayConfirmed(){
 if(!yesterdayEntries.length||typeof data==='undefined'||!Array.isArray(data)){if($('mfit181YesterdayStatus'))$('mfit181YesterdayStatus').textContent='Keine Einträge zum Übernehmen vorhanden.';return}
 if(!window.confirm('Möchtest du wirklich '+yesterdayEntries.length+' Einträge von gestern zusätzlich zu heute hinzufügen? Bestehende Einträge bleiben erhalten.'))return;
 const copies=yesterdayEntries.map(x=>({...x,date:today()}));
 data.push(...copies);
 if(typeof water!=='undefined')water+=copies.reduce((n,x)=>n+(Number(x.drink)||0),0);
 if(typeof window.save==='function')window.save();else localStorage.setItem('mfit_entries',JSON.stringify(data));
 yesterdayEntries=[];
 $('mfit181YesterdayPreview').hidden=true;
 $('mfit181YesterdayStatus').textContent='Einträge wurden zusätzlich zu heute kopiert.';
 refreshToday();
}
const routines=[
 {name:'Allgemein nach dem Training',steps:[['Locker gehen',45,'Gehe ruhig und lass die Atmung sinken.'],['Waden',40,'Ferse sanft Richtung Boden sinken lassen.'],['Oberschenkelrückseite',40,'Aus der Hüfte nach vorne neigen, Rücken lang.'],['Hüftbeuger',40,'Becken leicht nach hinten kippen, ohne ins Hohlkreuz zu fallen.'],['Brust & Schulter',40,'Arm locker öffnen und nur sanft in die Dehnung gehen.']]},
 {name:'Nach dem Laufen',steps:[['Locker gehen',45,'Tempo reduzieren und ruhig atmen.'],['Waden',45,'Beide Seiten gleichmäßig und ohne Wippen dehnen.'],['Oberschenkelvorderseite',40,'Ferse vorsichtig Richtung Gesäß führen.'],['Oberschenkelrückseite',40,'Bein leicht beugen und aus der Hüfte neigen.'],['Hüfte',45,'Kurzer, sanfter Ausfallschritt für die Hüftvorderseite.']]},
 {name:'Nach Krafttraining',steps:[['Ruhig atmen',45,'Schultern locker lassen und gleichmäßig atmen.'],['Brust',40,'Unterarm an eine Wand legen und Oberkörper leicht wegdrehen.'],['Latissimus',40,'Arme aufstützen und Brustbein sanft Richtung Boden führen.'],['Hüfte',45,'Sanfter halber Kniestand, Becken aufrecht.'],['Rücken',40,'Wirbelsäule langsam und schmerzfrei bewegen.']]}
];
let mobilitySteps=[],mobilityIndex=0,mobilityLeft=0,mobilityTimer=null;
function mobilityRender(){
 const step=mobilitySteps[mobilityIndex];
 $('mfit181MobilityStep').textContent=step?step[0]+' – '+step[2]:'Programm abgeschlossen';
 $('mfit181MobilityClock').textContent=String(Math.floor(mobilityLeft/60)).padStart(2,'0')+':'+String(mobilityLeft%60).padStart(2,'0');
 $('mfit181MobilityProgress').textContent=step?'Schritt '+(mobilityIndex+1)+' von '+mobilitySteps.length:'Wähle ein Programm und starte.';
}
function mobilityStopTimer(){if(mobilityTimer){clearInterval(mobilityTimer);mobilityTimer=null}}
function mobilityStart(){if(!mobilitySteps.length){mobilityBuild();}if(mobilityTimer)return;mobilityTimer=setInterval(()=>{mobilityLeft--;if(mobilityLeft<=0){mobilityIndex++;if(mobilityIndex>=mobilitySteps.length){mobilityStopTimer();mobilityLeft=0}else mobilityLeft=mobilitySteps[mobilityIndex][1]}mobilityRender();},1000)}
function mobilityBuild(){mobilityStopTimer();const routine=routines[Math.max(0,Math.min(routines.length-1,Number($('mfit181MobilityRoutine').value)||0))];mobilitySteps=routine.steps;mobilityIndex=0;mobilityLeft=mobilitySteps[0][1];mobilityRender()}
function installMobility(){
 const root=$('fitness');if(!root)return;
 const card=createCard('mfit181Mobility','COOL-DOWN & MOBILITY','Cool-down & Mobility','Kurze, ruhige Programme nach dem Training. Dehne nur im angenehmen Bereich und brich bei Schmerzen ab.','<label for="mfit181MobilityRoutine">Programm</label><select id="mfit181MobilityRoutine"><option value="0">Allgemein nach dem Training</option><option value="1">Nach dem Laufen</option><option value="2">Nach Krafttraining</option></select><div id="mfit181MobilityStep" class="mfit181-step">Wähle ein Programm.</div><div id="mfit181MobilityClock" class="mfit181-clock">00:45</div><p id="mfit181MobilityProgress" class="muted">Schritt 1 von 5</p><div class="mfit181-actions"><button type="button" id="mfit181MobilityStart">Start / Weiter</button><button type="button" class="secondary" id="mfit181MobilityPause">Pause</button><button type="button" class="secondary" id="mfit181MobilityNext">Nächster Schritt</button><button type="button" class="secondary" id="mfit181MobilityReset">Neu starten</button></div>',root,$('mfitSeasonPlan')||$('mfitWarmup'));
 $('mfit181MobilityRoutine').addEventListener('change',mobilityBuild);
 $('mfit181MobilityStart').addEventListener('click',mobilityStart);
 $('mfit181MobilityPause').addEventListener('click',mobilityStopTimer);
 $('mfit181MobilityNext').addEventListener('click',()=>{mobilityStopTimer();if(!mobilitySteps.length)mobilityBuild();else if(++mobilityIndex>=mobilitySteps.length){mobilityIndex=mobilitySteps.length-1;mobilityLeft=0}else mobilityLeft=mobilitySteps[mobilityIndex][1];mobilityRender()});
 $('mfit181MobilityReset').addEventListener('click',mobilityBuild);
 mobilityBuild();
}
function haversine(a,b){const rad=Math.PI/180,lat1=a.lat*rad,lat2=b.lat*rad,dlat=(b.lat-a.lat)*rad,dlon=(b.lon-a.lon)*rad;const h=Math.sin(dlat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))}
function gpxReadPoints(nodes){
 return [...nodes].map(n=>({lat:Number(n.getAttribute('lat')),lon:Number(n.getAttribute('lon')),time:(n.getElementsByTagName('time')[0]?.textContent||'').trim()})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180);
}
function readGpx(xml){
 const parser=new DOMParser(),doc=parser.parseFromString(xml,'application/xml');
 if(doc.querySelector('parsererror'))throw new Error('Die GPX-Datei ist beschädigt oder kein gültiges XML.');
 let segments=[...doc.getElementsByTagNameNS('*','trkseg')];
 let groups=segments.length?segments.map(s=>gpxReadPoints(s.getElementsByTagNameNS('*','trkpt'))):[];
 if(!groups.length){const tracks=gpxReadPoints(doc.getElementsByTagNameNS('*','trkpt'));const route=gpxReadPoints(doc.getElementsByTagNameNS('*','rtept'));groups=[tracks.length?tracks:route]}
 const points=groups.reduce((n,g)=>n+g.length,0);if(points<2)throw new Error('Die Datei enthält zu wenige GPS-Punkte.');
 let metres=0;groups.forEach(g=>{for(let i=1;i<g.length;i++)metres+=haversine(g[i-1],g[i])});
 if(!Number.isFinite(metres)||metres<5)throw new Error('Aus den GPS-Punkten konnte keine gültige Distanz berechnet werden.');
 const times=groups.flat().map(p=>Date.parse(p.time)).filter(Number.isFinite).sort((a,b)=>a-b);
 const duration=times.length>=2?Math.max(0,Math.round((times[times.length-1]-times[0])/1000)):null;
 const km=metres/1000,pace=duration&&km>0?duration/km:null;
 const name=(doc.getElementsByTagNameNS('*','name')[0]?.textContent||'').trim().slice(0,80);
 return {name,distanceKm:Number(km.toFixed(2)),durationSeconds:duration,paceSecondsPerKm:pace?Math.round(pace):null,points,recordedAt:new Date().toISOString()};
}
function formatDuration(seconds){if(!Number.isFinite(seconds))return 'Zeitdaten fehlen';const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return h? h+' h '+m+' min':m+':'+String(s).padStart(2,'0')+' min'}
function formatPace(seconds){if(!Number.isFinite(seconds))return '–';return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' min/km'}
function renderGpxHistory(){
 const host=$('mfit181GpxHistory');if(!host)return;
 const rows=safeParse(KEYS.gpx,[]);
 host.replaceChildren();
 if(!rows.length){host.textContent='Noch keine GPX-Aktivitäten importiert.';return}
 rows.slice().reverse().forEach(x=>{const row=document.createElement('div');row.className='mfit181-gpx-row';const title=document.createElement('b');title.textContent=x.name||'GPX-Aktivität';const detail=document.createElement('span');detail.textContent=Number(x.distanceKm).toFixed(2)+' km · '+formatDuration(x.durationSeconds)+' · '+formatPace(x.paceSecondsPerKm);const date=document.createElement('small');date.textContent=new Date(x.recordedAt).toLocaleDateString('de-AT');row.append(title,detail,date);host.appendChild(row)});
}
async function importGpx(){
 const input=$('mfit181GpxFile'),status=$('mfit181GpxStatus'),file=input?.files?.[0];if(!file)return;
 if(file.size>10*1024*1024){status.textContent='Die GPX-Datei ist größer als 10 MB.';input.value='';return}
 try{
  const result=readGpx(await file.text());
  result.fileName=file.name.slice(0,120);
  const rows=safeParse(KEYS.gpx,[]);rows.push(result);localStorage.setItem(KEYS.gpx,JSON.stringify(rows));
  status.textContent=result.distanceKm+' km · '+formatDuration(result.durationSeconds)+' · Pace '+formatPace(result.paceSecondsPerKm)+' gespeichert. Die Datei selbst wurde nicht hochgeladen.';
  renderGpxHistory();refreshToday();
 }catch(e){status.textContent=e.message||'GPX-Datei konnte nicht gelesen werden.'}
 input.value='';
}
function installGpx(){
 const root=$('fitness');if(!root)return;
 const card=createCard('mfit181Gpx','LOKALE AKTIVITÄTEN','GPX-Import','Lies eine Lauf- oder Raddatei direkt auf deinem Gerät ein. Es werden nur Zusammenfassungswerte lokal gespeichert.','<label for="mfit181GpxFile">GPX-Datei auswählen</label><input id="mfit181GpxFile" type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml"><p class="muted">Distanz, Dauer und Pace werden aus den GPS-Punkten berechnet. Keine Datei wird an einen Server gesendet.</p><p id="mfit181GpxStatus" class="muted" aria-live="polite"></p><div id="mfit181GpxHistory" class="mfit181-gpx-history"></div>',root,$('mfit181Mobility')||$('mfitWarmup'));
 $('mfit181GpxFile').addEventListener('change',importGpx);renderGpxHistory();
}
function recentWorkoutDays(){
 const logs=safeParse('mfit_workout_logs',[]),cut=new Date();cut.setDate(cut.getDate()-6);const start=shiftDay(-6),end=today();
 return new Set(logs.filter(x=>x.date>=start&&x.date<=end).map(x=>x.date)).size;
}
async function shareAchievement(){
 const status=$('mfit181ShareStatus'),days=recentWorkoutDays();
 try{
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=630;const ctx=canvas.getContext('2d');
  const grad=ctx.createLinearGradient(0,0,1200,630);grad.addColorStop(0,'#10151c');grad.addColorStop(1,'#252d38');ctx.fillStyle=grad;ctx.fillRect(0,0,1200,630);
  ctx.strokeStyle='#596574';ctx.lineWidth=2;ctx.strokeRect(48,48,1104,534);
  ctx.fillStyle='#cbd3dd';ctx.font='700 30px system-ui';ctx.fillText('MFIT PERFORMANCE',92,140);
  ctx.fillStyle='#ffffff';ctx.font='700 76px system-ui';ctx.fillText('Meine Trainingswoche',92,270);
  ctx.fillStyle='#d5dde7';ctx.font='600 54px system-ui';ctx.fillText(days+' Trainingstage',92,390);
  ctx.fillStyle='#aeb8c5';ctx.font='400 28px system-ui';ctx.fillText('Konstanz entsteht Schritt für Schritt.',92,490);
  ctx.fillStyle='#8793a2';ctx.font='400 20px system-ui';ctx.fillText(new Date().toLocaleDateString('de-AT'),92,540);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Bild konnte nicht erstellt werden.')),'image/png'));
  const file=new File([blob],'mfit-trainingswoche.png',{type:'image/png'});
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Meine Trainingswoche',text:'Mein Trainingsfortschritt mit MFit Performance.'});status.textContent='Teilen-Menü geöffnet.'}
  else{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mfit-trainingswoche.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Bild erstellt und zum Speichern vorbereitet.'}
 }catch(e){if(e.name==='AbortError')status.textContent='Teilen abgebrochen.';else status.textContent='Bild konnte nicht geteilt werden: '+e.message}
}
function installShare(){
 const root=$('fitness');if(!root)return;
 const card=createCard('mfit181Share','ERFOLGE','Trainingserfolg teilen','Erstellt ein neutrales Bild mit deinen Trainingstagen der letzten sieben Tage. Gewicht und Gesundheitsdaten werden nicht verwendet.','<button type="button" id="mfit181ShareButton">Trainingsbild erstellen & teilen</button><p id="mfit181ShareStatus" class="muted" aria-live="polite"></p>',root,$('mfit181Gpx')||$('mfitWarmup'));
 $('mfit181ShareButton').addEventListener('click',shareAchievement);
}
function refreshAll(){refreshToday();renderPins();renderGpxHistory()}
function init(){
 installToday();installYesterdayCopy();installMobility();installGpx();installShare();renderPins();refreshAll();
 document.addEventListener('click',e=>{if(e.target.closest('[data-tab]'))setTimeout(refreshAll,120)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshAll()});
 window.addEventListener('storage',refreshAll);
 window.mfit181Refresh=refreshAll;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();