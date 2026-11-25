
function saveGoals(){goals={kcal:Math.max(1,Number($('goalKcal').value)||2800),protein:Math.max(1,Number($('goalProtein').value)||150)};storage.set('mfit_goals',JSON.stringify(goals));render();alert('Ziele gespeichert.')}
function copyShopping(){const txt=shopItems.filter(x=>!x.done).map(x=>'[ ] '+x.name+' – '+(x.qty||'1')+' · '+(shopEstimatedPrice(x)===null?'kein Richtpreis':shopEstimatedPrice(x).toFixed(2).replace('.',',')+' €')).join('\n');if(navigator.clipboard?.writeText){navigator.clipboard.writeText(txt).then(()=>alert('Einkaufsliste kopiert.')).catch(()=>alert(txt||'Noch nichts auf der Liste.'))}else alert(txt||'Noch nichts auf der Liste.')}
let reminderCheckTimer=null;
function getReminderSettings(){try{return Object.assign({waterEnabled:true,waterTime:'12:30',waterMin:750,mealEnabled:true,mealTime:'14:00',mealName:'Mittagessen'},JSON.parse(storage.get('mfit_reminder_settings')||'{}'))}catch(e){return {waterEnabled:true,waterTime:'12:30',waterMin:750,mealEnabled:true,mealTime:'14:00',mealName:'Mittagessen'}}}
function loadReminderSettings(){const s=getReminderSettings();if(!$('reminderWaterEnabled'))return;$('reminderWaterEnabled').checked=!!s.waterEnabled;$('reminderWaterTime').value=s.waterTime;$('reminderWaterMin').value=s.waterMin;$('reminderMealEnabled').checked=!!s.mealEnabled;$('reminderMealTime').value=s.mealTime;$('reminderMealName').value=s.mealName;updateReminderStatus()}
function saveReminderSettings(){const s={waterEnabled:$('reminderWaterEnabled').checked,waterTime:$('reminderWaterTime').value||'12:30',waterMin:Math.max(100,Math.min(5000,Number($('reminderWaterMin').value)||750)),mealEnabled:$('reminderMealEnabled').checked,mealTime:$('reminderMealTime').value||'14:00',mealName:$('reminderMealName').value};storage.set('mfit_reminder_settings',JSON.stringify(s));updateReminderStatus();checkSmartReminders();return s}
function updateReminderStatus(){const el=$('reminderStatus');if(!el)return;const s=getReminderSettings();const active=[s.waterEnabled?'Trinken '+s.waterTime:null,s.mealEnabled?s.mealName+' '+s.mealTime:null].filter(Boolean);el.textContent=active.length?'Aktiv: '+active.join(' · ')+'. Prüfung nur bei geöffneter App.':'Alle Erinnerungen pausiert.'}
function fireMfitReminder(title,body,key){const today=localDate();storage.set('mfit_reminder_fired_'+today+'_'+key,'1');const box=$('reminderNotice');if(box){box.hidden=false;box.innerHTML='<b>'+title+'</b><div>'+body+'</div>';}if('Notification'in window&&Notification.permission==='granted'){try{new Notification('MFit Performance',{body,tag:'mfit-'+key})}catch(e){}}}
function checkSmartReminders(){const s=getReminderSettings(),now=new Date(),clock=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),today=localDate();const todayEntries=data.filter(e=>(e.date||today)===today);if(s.waterEnabled&&clock>=s.waterTime&&!storage.get('mfit_reminder_fired_'+today+'_water')&&Number(water)<Number(s.waterMin)){fireMfitReminder('💧 Zeit für eine Trinkpause', 'Du hast bisher etwa '+Math.round(Number(water)||0)+' ml erfasst. Trink etwas, wenn du Durst hast, und aktualisiere deinen Eintrag.', 'water');}
if(s.mealEnabled&&clock>=s.mealTime&&!storage.get('mfit_reminder_fired_'+today+'_meal')){const found=todayEntries.some(e=>String(e.meal||'').toLowerCase()===String(s.mealName).toLowerCase());if(!found)fireMfitReminder('🍽️ Mahlzeit noch nicht eingetragen', 'Für heute fehlt noch dein Eintrag für '+s.mealName+'. Falls du schon gegessen hast, kannst du ihn einfach nachtragen.', 'meal');}}
function startSmartReminders(){if(reminderCheckTimer)clearInterval(reminderCheckTimer);loadReminderSettings();checkSmartReminders();reminderCheckTimer=setInterval(checkSmartReminders,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkSmartReminders()});}
async function enableReminder(){if(!('Notification'in window)){$('reminderStatus').textContent='Mitteilungen werden von diesem Browser nicht unterstützt. Die Erinnerung erscheint sonst in MFit, solange die App geöffnet ist.';return}try{const p=await Notification.requestPermission();if(p==='granted'){$('reminderStatus').textContent='Mitteilungen erlaubt. Deine Einstellungen werden gespeichert.';saveReminderSettings();new Notification('MFit Performance',{body:'Deine Erinnerungen sind aktiviert.'})}else $('reminderStatus').textContent='Mitteilungen nicht erlaubt. Bitte prüfe die iPhone-/Browser-Einstellungen.'}catch(e){$('reminderStatus').textContent='Mitteilungen konnten nicht aktiviert werden.'}}
 
function localDate(d=new Date()){const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')}
let workoutLogs=(()=>{try{const v=JSON.parse(storage.get('mfit_workout_logs')||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x==='object'):[]}catch(e){return []}})();
let recoveryLogs=(()=>{try{const v=JSON.parse(storage.get('mfit_recovery_logs')||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x==='object'):[]}catch(e){return []}})();
function addWorkout(){
 const exercise=$('workoutExercise').value.trim(),muscle=$('workoutMuscle').value,date=$('workoutDate').value||localDate(),sets=Number($('workoutSets').value),reps=Number($('workoutReps').value),weight=Number($('workoutWeight').value);
 if(!exercise||!Number.isFinite(sets)||sets<1||sets>20||!Number.isFinite(reps)||reps<1||reps>100||!Number.isFinite(weight)||weight<0||weight>1000){alert('Bitte Übung, Sätze, Wiederholungen und ein gültiges Gewicht eintragen.');return}
 workoutLogs.push({id:Date.now(),exercise,muscle,date,sets,reps,weight});workoutLogs=workoutLogs.slice(-500);storage.set('mfit_workout_logs',JSON.stringify(workoutLogs));$('workoutExercise').value='';$('workoutStatus').textContent='Trainingseintrag gespeichert.';renderFitness();
}

const workoutTemplates={push:[['Bankdrücken','Brust'],['Schulterdrücken','Schultern'],['Seitheben','Schultern'],['Trizepsdrücken','Trizeps']],pull:[['Latzug','Rücken'],['Rudern','Rücken'],['Face Pulls','Schultern'],['Bizepscurls','Bizeps']],legs:[['Kniebeugen','Beine'],['Beinpresse','Beine'],['Beinbeuger','Beine'],['Wadenheben','Waden']],upper:[['Bankdrücken','Brust'],['Rudern','Rücken'],['Schulterdrücken','Schultern'],['Bizepscurls','Bizeps']]};
function useWorkoutTemplate(key){const plan=workoutTemplates[key];if(!plan)return;const first=plan[0];$('workoutExercise').value=first[0];$('workoutMuscle').value=first[1];$('workoutSets').value=3;$('workoutReps').value=10;$('templateHint').textContent=plan.map((x,i)=>(i+1)+'. '+x[0]).join(' · ')+' — Übung für Übung eintragen.';$('workoutExercise').scrollIntoView({behavior:'smooth',block:'center'});}
function removeWorkout(id){if(!confirm('Diesen Trainingseintrag wirklich löschen?'))return;workoutLogs=workoutLogs.filter(x=>Number(x.id)!==Number(id));storage.set('mfit_workout_logs',JSON.stringify(workoutLogs));renderFitness();}
function renderFitness(){
 const now=localDate(),cutoff=new Date();cutoff.setDate(cutoff.getDate()-6);const since=localDate(cutoff),recent=workoutLogs.filter(x=>x.date>=since&&x.date<=now);
 if($('workoutCount'))$('workoutCount').textContent=String(workoutLogs.length);
 if($('weeklySets'))$('weeklySets').textContent=String(recent.reduce((n,x)=>n+(Number(x.sets)||0),0));
 if($('weeklyVolume'))$('weeklyVolume').textContent=Math.round(recent.reduce((n,x)=>n+(Number(x.sets)||0)*(Number(x.reps)||0)*(Number(x.weight)||0),0)).toLocaleString('de-AT')+' kg';
 if($('weeklyDays'))$('weeklyDays').textContent=String(new Set(recent.map(x=>x.date)).size);
 if($('workoutHistory'))$('workoutHistory').innerHTML=workoutLogs.length?workoutLogs.slice(-12).reverse().map(x=>'<div class="item"><div class="row"><b>'+esc(x.exercise)+'</b><button class="danger smallbtn" onclick="removeWorkout('+Number(x.id)+')">×</button></div><div class="muted">'+esc(x.date)+' · '+esc(x.muscle)+' · '+x.sets+' Sätze × '+x.reps+' Wdh. · '+Number(x.weight).toLocaleString('de-AT')+' kg · Volumen: '+Math.round((Number(x.sets)||0)*(Number(x.reps)||0)*(Number(x.weight)||0)).toLocaleString('de-AT')+' kg</div></div>').join(''):'Noch keine Trainingseinträge.';
 const groups=['Brust','Rücken','Schultern','Bizeps','Trizeps','Beine','Gesäß','Bauch','Waden','Ganzkörper'];
 if($('muscleTracker'))$('muscleTracker').innerHTML=groups.map(g=>{const n=recent.filter(x=>x.muscle===g).reduce((a,x)=>a+(Number(x.sets)||0),0);return '<div class="item"><div class="row"><span>'+g+'</span><b>'+n+' Sätze</b></div><div class="progress"><span style="width:'+Math.min(100,n/20*100)+'%"></span></div></div>'}).join('');
 const prs={};workoutLogs.forEach(x=>{const key=String(x.exercise||'');if(key&&(!prs[key]||Number(x.weight)>prs[key].weight))prs[key]={weight:Number(x.weight)||0,reps:Number(x.reps)||0,date:x.date}});
 if($('personalRecords'))$('personalRecords').innerHTML=Object.keys(prs).length?Object.entries(prs).sort((a,b)=>b[1].weight-a[1].weight).slice(0,8).map(([name,p])=>{const est=p.weight>0?Math.round(p.weight*(1+p.reps/30)*10)/10:0;return '<div class="item row"><div><b>'+esc(name)+'</b><div class="muted">'+esc(p.date)+' · '+p.reps+' Wdh. · geschätztes 1RM: '+est.toLocaleString('de-AT')+' kg</div></div><b>'+p.weight.toLocaleString('de-AT')+' kg</b></div>'}).join(''):'Noch keine Übungen gespeichert.';
 const wh=weightHistory.slice(-7);if($('weightProgress'))$('weightProgress').innerHTML=wh.length?'<div class="grid">'+wh.map(x=>'<div class="item"><div class="muted">'+esc(x.date)+'</div><b>'+Number(x.weight).toFixed(1)+' kg</b></div>').join('')+'</div>':'Noch keine Gewichtsdaten. Trage dein Gewicht im Profil ein.';
 renderRecovery();window.mfitRenderProgressDashboard?.();
}
function saveRecovery(){
 const sleep=Number($('recoverySleep').value),soreness=Number($('recoverySoreness').value),energy=Number($('recoveryEnergy').value);
 if($('recoverySleep').value===''||!Number.isFinite(sleep)||sleep<0||sleep>24||!Number.isInteger(soreness)||soreness<1||soreness>10||!Number.isInteger(energy)||energy<1||energy>10){alert('Bitte Schlafstunden (0–24), Muskelkater und Energie (je 1–10) gültig eintragen.');return}
 const today=localDate(),entry={date:today,sleep,soreness,energy},i=recoveryLogs.findIndex(x=>x.date===today);if(i>=0)recoveryLogs[i]=entry;else recoveryLogs.push(entry);
 recoveryLogs=recoveryLogs.slice(-90);storage.set('mfit_recovery_logs',JSON.stringify(recoveryLogs));renderRecovery();
}
function renderRecovery(){
 const latest=recoveryLogs.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
 if($('recoverySummary'))$('recoverySummary').textContent=latest?'Letzter Check-in ('+latest.date+'): '+latest.sleep+' Std. Schlaf · Muskelkater '+latest.soreness+'/10 · Energie '+latest.energy+'/10. Höre auf deinen Körper und passe die Belastung bei Bedarf an.':'Noch keine Erholungsdaten eingetragen.';
 if($('recoveryHistory'))$('recoveryHistory').innerHTML=recoveryLogs.slice(-7).reverse().map(x=>'<div class="item row"><span>'+esc(x.date)+' · '+x.sleep+' Std. Schlaf</span><span>Muskelkater '+x.soreness+'/10 · Energie '+x.energy+'/10</span></div>').join('');
}

if($('themeColorPicker'))$('themeColorPicker').addEventListener('input',e=>applyThemeColor(e.target.value));
document.querySelectorAll('.theme-swatch').forEach(b=>b.addEventListener('click',()=>applyThemeColor(b.dataset.color)));
applyThemeColor(storage.get('mfit_theme_color')||defaultThemeColor,false);
$('diet').addEventListener('change',renderRecipes);$('focus').addEventListener('change',renderRecipes);$('unit').addEventListener('change',recalculateNutrition);
$('shoppingItems').innerHTML=['Skyr','Eier','Haferflocken','Reis','Linsen','Tofu','Hähnchenbrust','Brokkoli','Beeren','Bananen'].map(x=>`<label><input type="checkbox" value="${x}" style="width:auto;margin-right:8px">${x}</label>`).join('');
renderPresets();render();renderSteps();renderWeightHistory();loadProfile();startSmartReminders();if($('workoutDate'))$('workoutDate').value=localDate();if(!storage.get('mfit_setup_done')&&!storage.get('mfit_profile'))$('setupOverlay').style.display='block';if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

/* v34 — Wochenplanung, Einkauf, Trainingsgenerator */
const shopCatalogData=[
["Skyr","Milchprodukte","1 Becher"],["Magerquark","Milchprodukte","1 Becher"],["Naturjoghurt","Milchprodukte","1 Becher"],["Milch","Milchprodukte","1 Liter"],["Hüttenkäse","Milchprodukte","1 Packung"],["Topfen","Milchprodukte","1 Packung"],["Käse light","Milchprodukte","1 Packung"],["Mozzarella","Milchprodukte","1 Packung"],["Eier","Milchprodukte","10 Stück"],["Hähnchenbrust","Fleisch & Fisch","500 g"],["Putenbrust","Fleisch & Fisch","500 g"],["Rinderfaschiertes","Fleisch & Fisch","500 g"],["Lachs","Fleisch & Fisch","2 Filets"],["Thunfisch","Fleisch & Fisch","1 Dose"],["Tofu","Pflanzlich","1 Packung"],["Linsen","Pflanzlich","1 Packung"],["Kichererbsen","Pflanzlich","1 Dose"],["Kidneybohnen","Pflanzlich","1 Dose"],["Haferflocken","Getreide & Beilagen","1 Packung"],["Reis","Getreide & Beilagen","1 Packung"],["Vollkornnudeln","Getreide & Beilagen","1 Packung"],["Kartoffeln","Getreide & Beilagen","1 kg"],["Vollkornbrot","Getreide & Beilagen","1 Laib"],["Wraps","Getreide & Beilagen","1 Packung"],["Couscous","Getreide & Beilagen","1 Packung"],["Bananen","Obst","1 Bund"],["Äpfel","Obst","1 kg"],["Beeren TK","Obst","1 Packung"],["Orangen","Obst","1 kg"],["Avocado","Obst","1 Stück"],["Brokkoli","Gemüse","1 Stück"],["Paprika","Gemüse","2 Stück"],["Gurken","Gemüse","1 Stück"],["Tomaten","Gemüse","500 g"],["Spinat TK","Gemüse","1 Packung"],["Karotten","Gemüse","1 kg"],["Zucchini","Gemüse","2 Stück"],["Salat","Gemüse","1 Packung"],["Zwiebeln","Gemüse","1 Netz"],["Olivenöl","Fette & Extras","1 Flasche"],["Nüsse","Fette & Extras","1 Packung"],["Erdnussmus","Fette & Extras","1 Glas"],["Chiasamen","Fette & Extras","1 Packung"],["Leinsamen","Fette & Extras","1 Packung"],["Tomatenpassata","Vorrat","1 Packung"],["Mais","Vorrat","1 Dose"],["Gemüsebrühe","Vorrat","1 Packung"],["Gewürze","Vorrat","nach Bedarf"]
];
let shopItems=(()=>{try{const a=JSON.parse(storage.get('mfit_shop_items')||'[]');return Array.isArray(a)?a:[]}catch(e){return []}})();
(function migrateLegacyProShopping(){
 const flag='mfit_shop_migration_v1';
 if(storage.get(flag)==='done')return;
 let legacy=[];
 try{const parsed=JSON.parse(storage.get('mfit_pro_shopping')||'[]');if(Array.isArray(parsed))legacy=parsed.filter(x=>x&&typeof x==='object');}catch(e){}
 if(!legacy.length){try{localStorage.setItem(flag,'done')}catch(e){}return;}
 const merged=shopItems.slice(),ids=new Set(merged.map(x=>String(x.id)));
 legacy.forEach((item,index)=>{
  const rawId=item.id===undefined||item.id===null?'legacy-'+index:String(item.id);
  let id=rawId;
  if(ids.has(id))id='pro-'+rawId+'-'+index;
  while(ids.has(id))id='pro-'+id;
  ids.add(id);
  merged.push({...item,id,name:String(item.name??item.title??'Unbenannter Artikel'),qty:item.qty===undefined||item.qty===null?'':String(item.qty),done:!!item.done,store:item.store??'',price:item.price??''});
 });
 try{
  const serialized=JSON.stringify(merged);
  localStorage.setItem('mfit_shop_items',serialized);
  if(localStorage.getItem('mfit_shop_items')===serialized){shopItems=merged;localStorage.setItem(flag,'done');}
 }catch(e){console.warn('MFit: Einkaufsliste konnte noch nicht zusammengeführt werden.',e);}
})();
let mealWeekData=[];
const weekMeals=[
{name:"Skyr-Beeren-Bowl",focus:["balanced","protein","lowfat","vegetarian"],ingredients:[["Skyr","250 g"],["Beeren TK","100 g"],["Haferflocken","40 g"],["Banane","1 Stück"]]},
{name:"Hähnchen-Reis-Bowl",focus:["balanced","protein","lowfat","budget"],ingredients:[["Hähnchenbrust","150 g"],["Reis","75 g trocken"],["Brokkoli","150 g"],["Paprika","1 Stück"]]},
{name:"Linsen-Tofu-Pfanne",focus:["balanced","protein","vegan","vegetarian","budget"],ingredients:[["Tofu","150 g"],["Linsen","100 g trocken"],["Spinat TK","100 g"],["Tomatenpassata","150 g"]]},
{name:"Vollkorn-Wrap mit Hüttenkäse",focus:["balanced","protein","lowfat"],ingredients:[["Wraps","1 Stück"],["Hüttenkäse","150 g"],["Gurken","1/2 Stück"],["Tomaten","100 g"]]},
{name:"Lachs mit Kartoffeln",focus:["balanced","energy"],ingredients:[["Lachs","150 g"],["Kartoffeln","250 g"],["Brokkoli","150 g"],["Naturjoghurt","50 g"]]},
{name:"Bohnen-Chili mit Reis",focus:["balanced","vegan","vegetarian","budget"],ingredients:[["Kidneybohnen","1 Dose"],["Mais","1/2 Dose"],["Tomatenpassata","200 g"],["Reis","70 g trocken"]]},
{name:"Omelett mit Gemüse",focus:["balanced","protein","lowcarb","lowfat"],ingredients:[["Eier","3 Stück"],["Spinat TK","80 g"],["Tomaten","100 g"],["Vollkornbrot","2 Scheiben"]]},
{name:"Pasta mit Thunfisch-Tomatensauce",focus:["balanced","protein","budget"],ingredients:[["Vollkornnudeln","90 g trocken"],["Thunfisch","1 Dose"],["Tomatenpassata","150 g"],["Gurken","1/2 Stück"]]},
{name:"Overnight Oats mit Nussmus",focus:["energy","vegetarian"],ingredients:[["Haferflocken","60 g"],["Milch","200 ml"],["Banane","1 Stück"],["Erdnussmus","20 g"]]},
{name:"Tofu-Erdnuss-Reis-Bowl",focus:["energy","vegan","vegetarian"],ingredients:[["Tofu","180 g"],["Reis","80 g trocken"],["Karotten","100 g"],["Erdnussmus","20 g"]]},
{name:"Topfen-Pancakes",focus:["protein","lowfat","vegetarian"],ingredients:[["Topfen","150 g"],["Eier","2 Stück"],["Haferflocken","50 g"],["Beeren TK","100 g"]]},
{name:"Kichererbsen-Couscous-Salat",focus:["balanced","vegan","vegetarian","budget"],ingredients:[["Kichererbsen","1 Dose"],["Couscous","70 g"],["Gurken","1/2 Stück"],["Tomaten","150 g"],["Olivenöl","1 TL"]]},
{name:"Rinderhack-Kartoffel-Pfanne",focus:["protein","energy"],ingredients:[["Rinderfaschiertes","150 g"],["Kartoffeln","250 g"],["Zucchini","1 Stück"],["Naturjoghurt","50 g"]]},
{name:"Joghurt-Müsli mit Apfel",focus:["balanced","lowfat","vegetarian","budget"],ingredients:[["Naturjoghurt","200 g"],["Haferflocken","50 g"],["Äpfel","1 Stück"],["Leinsamen","10 g"]]}
];
function persistShop(){storage.set('mfit_shop_items',JSON.stringify(shopItems));renderShopItems()}
function addShopItem(name,qty){name=String(name||'').trim();if(!name)return;const found=shopItems.find(x=>x.name.toLowerCase()===name.toLowerCase()&&!x.done);if(found){found.qty=found.qty||qty||'1';}else shopItems.push({id:Date.now()+Math.random(),name,qty:qty||'1',done:false,store:'',price:''});persistShop()}
function addCatalogShopItem(i){const x=shopCatalogData[i];if(x)addShopItem(x[0],x[2])}
function addCustomShopItem(){const n=$('shopCustom').value.trim(),q=$('shopCustomQty').value.trim()||'1';if(!n)return alert('Bitte einen Produktnamen eingeben.');addShopItem(n,q);$('shopCustom').value='';$('shopCustomQty').value=''}
function renderShopCatalog(){const q=($('shopSearch')?.value||'').toLowerCase();const el=$('shopCatalog');if(!el)return;const matches=shopCatalogData.map((x,i)=>({...{x,i}})).filter(o=>(o.x[0]+' '+o.x[1]).toLowerCase().includes(q)).slice(0,16);el.innerHTML=matches.map(o=>'<button type="button" class="shop-product" onclick="addCatalogShopItem('+o.i+')"><span><b>'+esc(o.x[0])+'</b><small>'+esc(o.x[1])+'</small></span><span>＋</span></button>').join('')||'<p class="muted">Kein Treffer – füge das Produkt als eigenes Produkt hinzu.</p>'}
const shopPriceData={
'Skyr':[1.39,500,'g'],'Magerquark':[1.09,250,'g'],'Naturjoghurt':[1.19,500,'g'],'Milch':[1.39,1000,'ml'],'Hüttenkäse':[1.49,200,'g'],'Topfen':[1.49,250,'g'],'Käse light':[2.49,200,'g'],'Mozzarella':[0.99,125,'g'],'Eier':[2.79,10,'stk'],
'Hähnchenbrust':[5.49,500,'g'],'Putenbrust':[5.99,500,'g'],'Rinderfaschiertes':[5.49,500,'g'],'Lachs':[5.49,250,'g'],'Thunfisch':[1.29,1,'dose'],'Tofu':[1.79,200,'g'],'Linsen':[1.79,500,'g'],'Kichererbsen':[0.89,1,'dose'],'Kidneybohnen':[0.89,1,'dose'],
'Haferflocken':[1.19,500,'g'],'Reis':[1.99,1000,'g'],'Vollkornnudeln':[1.29,500,'g'],'Kartoffeln':[1.99,1000,'g'],'Vollkornbrot':[2.49,500,'g'],'Wraps':[1.79,6,'stk'],'Couscous':[1.79,500,'g'],
'Bananen':[1.79,5,'stk'],'Äpfel':[2.49,1000,'g'],'Beeren TK':[2.49,300,'g'],'Orangen':[2.49,1000,'g'],'Avocado':[1.29,1,'stk'],
'Brokkoli':[1.49,1,'stk'],'Paprika':[1.99,2,'stk'],'Gurken':[1.29,1,'stk'],'Tomaten':[2.49,500,'g'],'Spinat TK':[1.49,450,'g'],'Karotten':[1.49,1000,'g'],'Zucchini':[1.79,2,'stk'],'Salat':[1.49,1,'stk'],'Zwiebeln':[1.79,1000,'g'],
'Olivenöl':[5.49,750,'ml'],'Nüsse':[2.99,200,'g'],'Erdnussmus':[3.49,350,'g'],'Chiasamen':[2.49,200,'g'],'Leinsamen':[1.49,250,'g'],'Tomatenpassata':[0.99,500,'g'],'Mais':[0.89,1,'dose'],'Gemüsebrühe':[1.19,1,'pack'],'Gewürze':[1.49,1,'pack']
};
const shopStoreFactor={'Hofer':1,'Lidl':1.02,'Penny':1.04,'SPAR':1.12,'BILLA':1.15};
function shopEstimatedPrice(item){const data=shopPriceData[item.name];if(!data)return null;const price=data[0],pack=data[1],baseUnit=data[2],qty=String(item.qty||'1').toLowerCase();let amount=null,unit=baseUnit;const m=new RegExp('(\\d+\\s*\\/\\s*\\d+|\\d+(?:[.,]\\d+)?)\\s*(kg|g|ml|l|stück|st\\.?|stk|dose|packung|pack)','i').exec(qty);if(m){amount=m[1].includes('/')?m[1].split('/').reduce((n,v)=>n/Number(v.trim()),Number(m[1].split('/')[0].trim())):Number(m[1].replace(',','.'));const u=m[2].toLowerCase();if(u==='kg'||u==='l')amount*=1000;if(['stück','st.','st','stk'].includes(u))unit='stk';else if(u==='dose')unit='dose';else if(['pack','packung'].includes(u))unit='pack';else if(u==='ml'||u==='l')unit='ml';else unit='g';}let multiplier=1;if(amount!==null&&unit===baseUnit)multiplier=amount/pack;return Math.max(0,price*multiplier*(shopStoreFactor[$('store')?.value]||1));}
function renderShopItems(){const el=$('shoppingItems');if(!el)return;const store=$('store')?.value||'Hofer';let total=0;el.innerHTML=shopItems.length?shopItems.map(x=>{const price=shopEstimatedPrice(x);if(price!==null&&!x.done)total+=price;return '<div class="shop-line '+(x.done?'done':'')+'"><label class="shop-check"><input type="checkbox" '+(x.done?'checked':'')+' onchange="toggleShopItem(\''+x.id+'\',this.checked)"><span><b>'+esc(x.name)+'</b><small>'+esc(x.qty||'1')+'</small></span></label><div class="shop-price-fields"><span class="shop-estimate">'+(price===null?'Kein Richtpreis':price.toFixed(2).replace('.',',')+' €')+'</span><button class="danger smallbtn" onclick="removeShopItem(\''+x.id+'\')">×</button></div></div>';}).join(''):'<p class="muted">Deine Einkaufsliste ist noch leer. Füge oben Produkte hinzu oder übernimm die Zutaten deines Wochenplans.</p>';const count=$('shopCount');if(count)count.textContent=shopItems.filter(x=>!x.done).length+' offen';if($('shopBudgetSummary'))$('shopBudgetSummary').textContent='Geschätzter Einkauf bei '+store+': '+total.toFixed(2).replace('.',',')+' € · Budget: '+(Number($('budget')?.value)||0).toFixed(2).replace('.',',')+' € · Richtwerte, keine Livepreise.';}
function toggleShopItem(id,v){const x=shopItems.find(x=>String(x.id)===String(id));if(x)x.done=!!v;persistShop()}
function updateShopItem(id,k,v){const x=shopItems.find(x=>String(x.id)===String(id));if(x){x[k]=v;storage.set('mfit_shop_items',JSON.stringify(shopItems));renderShopItems()}}
function removeShopItem(id){shopItems=shopItems.filter(x=>String(x.id)!==String(id));persistShop()}
function clearCompletedShopItems(){shopItems=shopItems.filter(x=>!x.done);persistShop()}
function copyShopping(){const txt=shopItems.filter(x=>!x.done).map(x=>'[ ] '+x.name+' – '+(x.qty||'1')+(x.store?' · '+x.store:'')+(x.price?' · '+x.price+' €':'')).join('\n');if(navigator.clipboard?.writeText){navigator.clipboard.writeText(txt).then(()=>alert('Einkaufsliste kopiert.')).catch(()=>alert(txt||'Noch nichts auf der Liste.'))}else alert(txt||'Noch nichts auf der Liste.')}
function mealRecipeCost(meal){
 return meal.ingredients.reduce((sum,[name,qty])=>{
  const price=shopEstimatedPrice({name,qty});
  return sum+(price===null?0:price);
 },0);
}
function generateMealWeek(){
 const output=$('mealWeek'),addButton=$('addWeekShopBtn');
 try{
  const f=$('mealPlanFocus')?.value||'balanced',n=Math.min(4,Math.max(2,Number($('mealPlanMeals')?.value)||3)),excluded=selectedMealExclusions();
  const custom=($('mealPlanAvoidCustom')?.value||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);
  let pool=weekMeals.filter(x=>Array.isArray(x.focus)&&x.focus.includes(f)&&mealAllowed(x,excluded,custom));
  if(!pool.length){if(output)output.innerHTML='<div class="notice">Mit diesen Ausschlüssen gibt es gerade keine passenden Gerichte. Entferne einzelne Ausschlüsse oder wähle einen anderen Schwerpunkt.</div>';if(addButton)addButton.disabled=true;mealWeekData=[];return;}
  const amount=Number($('mealBudgetAmount')?.value)||0,period=$('mealBudgetPeriod')?.value||'day';
  const cost=meal=>{try{return mealRecipeCost(meal)||0;}catch(e){return 0;}};
  pool=pool.slice().sort((a,b)=>cost(a)-cost(b));
  const needed=7*n,selected=[];
  for(let i=0;i<needed;i++){
   const dayIndex=Math.floor(i/n),dayMeals=selected.slice(dayIndex*n,i);
   const current=dayMeals.reduce((s,m)=>s+cost(m),0),cap=period==='day'?amount:amount/7;
   const affordable=amount>0?pool.filter(m=>cost(m)+current<=cap+0.001):pool;
   const choices=affordable.length?affordable:pool;
   selected.push(choices[(i+dayIndex)%choices.length]);
  }
  mealWeekData=Array.from({length:7},(_,d)=>({day:['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'][d],meals:selected.slice(d*n,(d+1)*n)}));
  renderMealWeek();
  if(output){output.dataset.generated='true';output.scrollIntoView({behavior:'smooth',block:'start'});}
 }catch(error){
  mealWeekData=[];if(addButton)addButton.disabled=true;
  if(output)output.innerHTML='<div class="notice" role="alert"><b>Dein 7-Tage-Ernährungsplan konnte nicht erstellt werden.</b><p>Bitte versuche es erneut. Deine bisherigen Einträge bleiben gespeichert.</p></div>';
  console.error('MFit meal week:',error);
 }
}
window.generateMealWeek=generateMealWeek;
function renderMealWeek(){
 const el=$('mealWeek');if(!el)return;
 const diabetes=$('mealPlanDiabetes')?.checked;
 const warning=diabetes?'<div class="meal-medical-note">Blutzucker-Hinweis: Dieser Plan berechnet keine Kohlenhydratportionen und passt keine Medikamente oder Insulindosen an. Bitte nutze ihn nicht als Diabetes-Therapieplan und stimme Mahlzeiten und Kohlenhydratmengen mit deinem Behandlungsteam ab.</div>':'';
 const dailyCosts=mealWeekData.map(day=>day.meals.reduce((sum,m)=>sum+mealRecipeCost(m),0));
 const weekCost=dailyCosts.reduce((a,b)=>a+b,0),budget=Number($('mealBudgetAmount')?.value)||0,period=$('mealBudgetPeriod')?.value||'day';
 const budgetText=budget>0?' · Ziel: '+budget.toFixed(2).replace('.',',')+' € / '+(period==='day'?'Tag':'Woche'):'';
 const costSummary='<div class="notice meal-cost-summary">Geschätzte Lebensmittelkosten: <b>'+weekCost.toFixed(2).replace('.',',')+' € / Woche</b> · Ø '+(weekCost/7).toFixed(2).replace('.',',')+' € / Tag'+budgetText+'. <small>Richtpreise, keine Livepreise. Es zählen nur Zutaten mit hinterlegtem Richtpreis.</small></div>';
 el.innerHTML='<div class="notice">Deine gespeicherten Tagesrichtwerte: '+(goals.kcal||'–')+' kcal und '+(goals.protein||'–')+' g Protein. Die Gerichte sind Vorschläge, keine exakt berechneten Nährwertpläne. Du kannst jederzeit neu generieren.</div>'+costSummary+warning+mealWeekData.map((day,d)=>'<div class="meal-day"><b>'+day.day+'</b><span class="meal-day-cost">'+dailyCosts[d].toFixed(2).replace('.',',')+' €</span>'+day.meals.map((meal,i)=>'<div class="meal-plan-item"><span class="pill">Mahlzeit '+(i+1)+'</span><strong>'+meal.name+'</strong><small>'+meal.ingredients.map(x=>x[0]+' ('+x[1]+')').join(' · ')+'</small></div>').join('')+'</div>').join('');
 $('addWeekShopBtn').disabled=!mealWeekData.length;
}
function addMealWeekToShopping(){if(!mealWeekData.length)return;const merged={};mealWeekData.forEach(d=>d.meals.forEach(m=>m.ingredients.forEach(([name,qty])=>{merged[name]=(merged[name]?merged[name]+' + ':'')+qty})));Object.entries(merged).forEach(([name,qty])=>addShopItem(name,qty));showTab('shop');$('mealWeek').scrollIntoView({behavior:'smooth',block:'start'});alert('Die Zutaten deiner 7-Tage-Woche wurden auf die Einkaufsliste gesetzt.')}

/* v44 — zusätzliche Gerichte für mehr Abwechslung */
weekMeals.push(
{name:"Puten-Gemüse-Pfanne mit Couscous",focus:["balanced","protein","lowfat","budget"],ingredients:[["Putenbrust","150 g"],["Couscous","70 g"],["Zucchini","100 g"],["Karotten","80 g"]]},
{name:"Ofenkartoffel mit Kräutertopfen",focus:["balanced","protein","vegetarian","budget"],ingredients:[["Kartoffeln","300 g"],["Topfen","150 g"],["Gurken","80 g"],["Kräuter","nach Geschmack"]]},
{name:"Bunter Quinoa-Bohnen-Salat",focus:["balanced","vegan","vegetarian"],ingredients:[["Quinoa","70 g"],["Kidneybohnen","100 g"],["Paprika","80 g"],["Gurken","80 g"]]},
{name:"Rührei mit Kartoffeln und Spinat",focus:["balanced","protein","vegetarian"],ingredients:[["Eier","3 Stück"],["Kartoffeln","200 g"],["Spinat TK","100 g"]]},
{name:"Hähnchen-Wrap mit Salat",focus:["balanced","protein","lowfat"],ingredients:[["Hähnchenbrust","120 g"],["Wraps","1 Stück"],["Salat","30 g"],["Naturjoghurt","40 g"]]},
{name:"Linsen-Bolognese mit Nudeln",focus:["balanced","protein","vegan","vegetarian","budget"],ingredients:[["Linsen","80 g trocken"],["Vollkornnudeln","80 g trocken"],["Tomatenpassata","150 g"],["Karotten","50 g"]]},
{name:"Thunfisch-Kartoffel-Salat",focus:["balanced","protein","lowfat"],ingredients:[["Thunfisch","1 Dose"],["Kartoffeln","200 g"],["Gurken","80 g"],["Olivenöl","1 TL"]]},
{name:"Süßkartoffel-Tofu-Bowl",focus:["balanced","vegan","vegetarian"],ingredients:[["Tofu","150 g"],["Süßkartoffel","200 g"],["Brokkoli","100 g"],["Olivenöl","1 TL"]]},
{name:"Bananen-Pancakes",focus:["energy","vegetarian"],ingredients:[["Banane","1 Stück"],["Eier","2 Stück"],["Haferflocken","50 g"]]},
{name:"Hüttenkäse-Brot mit Tomaten",focus:["balanced","protein","lowfat","vegetarian"],ingredients:[["Hüttenkäse","150 g"],["Vollkornbrot","2 Scheiben"],["Tomaten","100 g"]]},
{name:"Mediterrane Kichererbsen-Pfanne",focus:["balanced","vegan","vegetarian","budget"],ingredients:[["Kichererbsen","150 g"],["Zucchini","100 g"],["Tomatenpassata","100 g"],["Couscous","50 g"]]},
{name:"Rinderstreifen mit Reis und Gemüse",focus:["protein","balanced"],ingredients:[["Rinderfaschiertes","150 g"],["Reis","70 g trocken"],["Paprika","80 g"],["Karotten","60 g"]]},
{name:"Baked Oats mit Beeren",focus:["energy","vegetarian"],ingredients:[["Haferflocken","60 g"],["Milch","150 ml"],["Beeren TK","100 g"],["Banane","1/2 Stück"]]},
{name:"Falafel-Wrap mit Gurke",focus:["balanced","vegan","vegetarian"],ingredients:[["Kichererbsen","120 g"],["Wraps","1 Stück"],["Gurken","80 g"],["Salat","30 g"]]},
{name:"Lachs-Reis-Bowl",focus:["balanced","protein","energy"],ingredients:[["Lachs","130 g"],["Reis","70 g trocken"],["Gurken","60 g"],["Karotten","60 g"]]},
{name:"Gemüse-Omelett mit Brot",focus:["balanced","protein","vegetarian","lowfat"],ingredients:[["Eier","2 Stück"],["Paprika","60 g"],["Spinat TK","60 g"],["Vollkornbrot","2 Scheiben"]]},
{name:"Bohnen-Kartoffel-Eintopf",focus:["balanced","vegan","vegetarian","budget"],ingredients:[["Kidneybohnen","120 g"],["Kartoffeln","200 g"],["Karotten","80 g"],["Gemüsebrühe","250 ml"]]},
{name:"Hähnchen-Pasta mit Spinat",focus:["balanced","protein"],ingredients:[["Hähnchenbrust","130 g"],["Vollkornnudeln","80 g trocken"],["Spinat TK","80 g"],["Naturjoghurt","40 g"]]},
{name:"Apfel-Zimt-Porridge",focus:["balanced","vegetarian","budget"],ingredients:[["Haferflocken","60 g"],["Milch","200 ml"],["Äpfel","1 Stück"],["Leinsamen","10 g"]]},
{name:"Tofu-Gemüse-Wrap",focus:["balanced","vegan","vegetarian"],ingredients:[["Tofu","130 g"],["Wraps","1 Stück"],["Karotten","50 g"],["Gurken","50 g"]]},
{name:"Topfen-Beeren-Creme",focus:["protein","lowfat","vegetarian"],ingredients:[["Topfen","200 g"],["Beeren TK","100 g"],["Haferflocken","20 g"]]},
{name:"Pasta mit Erbsen und Frischkäse",focus:["balanced","vegetarian"],ingredients:[["Vollkornnudeln","80 g trocken"],["Erbsen","80 g"],["Frischkäse","40 g"]]},
{name:"Reis-Bowl mit Ei und Gemüse",focus:["balanced","vegetarian","budget"],ingredients:[["Reis","70 g trocken"],["Eier","2 Stück"],["Karotten","60 g"],["Gurken","60 g"]]},
{name:"Kartoffel-Gemüse-Blech mit Feta",focus:["balanced","vegetarian"],ingredients:[["Kartoffeln","250 g"],["Zucchini","100 g"],["Paprika","80 g"],["Feta","50 g"]]}
);
function selectedMealExclusions(){return [...document.querySelectorAll('[data-meal-exclude]:checked')].map(x=>x.dataset.mealExclude)}
function mealIngredientText(meal){return meal.ingredients.map(x=>x[0]).join(' ').toLowerCase()}
function mealAllowed(meal,excluded,custom){
 const s=mealIngredientText(meal);
 const tests={
 dairy:/skyr|quark|topfen|joghurt|milch|hüttenkäse|käse|mozzarella|feta|frischkäse/i,
 lactose:/skyr|quark|topfen|joghurt|milch|hüttenkäse|käse|mozzarella|feta|frischkäse/i,
 gluten:/haferflocken|vollkornbrot|wraps|couscous|vollkornnudeln/i,
 egg:/eier|ei\b/i,soy:/tofu|soja/i,nuts:/nüsse|mandel|cashew|walnuss/i,peanuts:/erdnuss/i,
 fish:/lachs|thunfisch|fisch/i,shellfish:/garnele|krabbe|muschel|meeresfrucht/i,sesame:/sesam/i,
 meat:/hähnchen|putenbrust|rinderfaschiertes|schwein|lachs|thunfisch/i,
 pork:/schwein/i,beef:/rinderfaschiertes|rind/i,poultry:/hähnchen|putenbrust/i,
 fructose:/äpfel|banane|honig|mango|birne|fruchtsaft/i,
 histamine:/thunfisch|lachs|tomaten|spinat|avocado|käse|ferment/i,
 fodmap:/äpfel|milch|zwiebel|knoblauch|kichererbsen|linsen|bohnen|honig/i
 };
 if(excluded.some(k=>tests[k]?.test(s)))return false;
 if(custom.some(term=>term&&s.includes(term)))return false;
 return true;
}

const exerciseLibrary={
back:[['Latzug zur Brust','Maschine / Kabelzug','3 × 8–12','Latissimus'],['Sitzendes Kabelrudern','Kabelzug','3 × 8–12','Rückenmitte'],['Brustgestütztes Rudern','Maschine / Kurzhanteln','3 × 10–12','Rücken'],['Einarmiges Kurzhantelrudern','Kurzhantel + Bank','2 × 10–12','Latissimus'],['Face Pull','Kabelzug + Seil','2 × 12–15','hintere Schulter'],['Rückenstrecker','Rückenstreckerbank','2 × 10–15','unterer Rücken']],
chest:[['Brustpresse','Maschine','3 × 8–12','Brust'],['Schrägbankdrücken','Kurzhanteln','3 × 8–12','obere Brust'],['Butterfly / Pec Deck','Maschine','2 × 10–15','Brust'],['Kabel-Flys','Kabelzug','2 × 12–15','Brust']],
shoulders:[['Schulterdrücken','Maschine / Kurzhanteln','3 × 8–12','Schulter'],['Seitheben','Kurzhanteln','3 × 12–15','seitliche Schulter'],['Reverse Butterfly','Maschine','3 × 12–15','hintere Schulter'],['Face Pull','Kabelzug + Seil','2 × 12–15','hintere Schulter']],
arms:[['Bizepscurls','Kurzhanteln','3 × 10–12','Bizeps'],['Hammercurls','Kurzhanteln','2 × 10–12','Bizeps / Unterarm'],['Trizepsdrücken','Kabelzug + Seil','3 × 10–15','Trizeps'],['Überkopf-Trizepsstrecken','Kabelzug','2 × 10–12','Trizeps']],
legs:[['Beinpresse','Maschine','3 × 8–12','Quadrizeps / Gesäß'],['Beinbeuger','Maschine','3 × 10–15','Beinrückseite'],['Beinstrecker','Maschine','2 × 10–15','Quadrizeps'],['Hip Thrust','Maschine / Langhantel','3 × 8–12','Gesäß'],['Wadenheben','Maschine','3 × 12–15','Waden']],
full:[['Beinpresse','Maschine','3 × 8–12','Beine'],['Brustpresse','Maschine','3 × 8–12','Brust'],['Latzug','Maschine / Kabelzug','3 × 8–12','Rücken'],['Rumänisches Kreuzheben','Kurzhanteln','2 × 8–10','Beinrückseite'],['Schulterdrücken','Maschine','2 × 10–12','Schultern'],['Plank','Körpergewicht','3 × 30–45 s','Core']]
};
let generatedPlan=[];
function generateWorkoutPlan(){const focus=$('planMuscle').value,days=Number($('planDays').value)||3,duration=Number($('planDuration').value)||60;let keys=focus==='upper'?['chest','back','shoulders','arms']:focus==='push'?['chest','shoulders','arms']:focus==='pull'?['back','arms','shoulders']:focus==='full'?['full']: [focus];if(days>1&&['full'].includes(focus))keys=Array(days).fill('full');else if(days>1&&keys.length===1)keys=Array(days).fill(keys[0]);else if(days>keys.length)keys=Array.from({length:days},(_,i)=>keys[i%keys.length]);generatedPlan=keys.map((k,i)=>{let list=(exerciseLibrary[k]||exerciseLibrary.full).slice();const gym=$('planGym').value;if(gym==='machines')list=list.filter(e=>/Maschine|Kabelzug/.test(e[1]));if(gym==='free')list=list.filter(e=>/Kurzhantel|Langhantel|Kabelzug|Bank/.test(e[1]));if(gym==='body'){const body={back:[['Inverted Row','Körpergewicht / Stange','3 × 6–12','Rücken'],['Superman Hold','Körpergewicht','2 × 20–30 s','unterer Rücken'],['Bird Dog','Körpergewicht','2 × 10 je Seite','Rumpf']],chest:[['Liegestütze','Körpergewicht','3 × 6–15','Brust'],['Enge Liegestütze','Körpergewicht','2 × 6–12','Brust / Trizeps']],shoulders:[['Pike Push-up','Körpergewicht','3 × 6–10','Schultern'],['Y-T-W Raises','Körpergewicht','2 × 10','hintere Schulter']],arms:[['Diamond Push-up','Körpergewicht','3 × 6–12','Trizeps'],['Chin-up','Stange','2 × 5–10','Bizeps']],legs:[['Kniebeugen','Körpergewicht','3 × 12–20','Beine'],['Ausfallschritte','Körpergewicht','3 × 10 je Seite','Beine'],['Glute Bridge','Körpergewicht','3 × 12–15','Gesäß']],full:exerciseLibrary.full};list=body[k]||body.full;}if(!list.length)list=(exerciseLibrary[k]||exerciseLibrary.full).slice();const take=duration<=45?4:duration<=60?5:6;if(keys.length>1&&days>1&&list.length>take)list=list.slice((i*2)%Math.max(1,list.length-2));return{day:i+1,focus:k,exercises:list.slice(0,take)}});renderGeneratedPlan()}
function renderGeneratedPlan(){const el=$('generatedWorkoutPlan');if(!el)return;el.innerHTML=generatedPlan.map(day=>'<div class="generated-day"><h3>Tag '+day.day+' · '+({back:'Rücken',chest:'Brust',shoulders:'Schultern',arms:'Arme',legs:'Beine & Gesäß',full:'Ganzkörper',upper:'Oberkörper',push:'Push',pull:'Pull'}[day.focus]||day.focus)+'</h3>'+day.exercises.map((e,i)=>'<div class="exercise-row"><div><b>'+e[0]+'</b><small>'+e[1]+' · '+e[3]+'</small><span>'+e[2]+'</span></div><button class="secondary smallbtn" onclick="loadGeneratedExercise('+day.day+','+i+')">Tracken</button></div>').join('')+'</div>').join('')+'<p class="muted">Starte mit kontrollierter Technik und einem Gewicht, das du sauber bewegen kannst. Steigere erst, wenn alle Wiederholungen sicher gelingen. Bei Schmerzen abbrechen und Übung anpassen.</p>'}
function loadGeneratedExercise(d,i){const x=generatedPlan[d-1]?.exercises[i];if(!x)return;$('workoutExercise').value=x[0];$('workoutMuscle').value=({back:'Rücken',chest:'Brust',shoulders:'Schultern',arms:'Bizeps',legs:'Beine',full:'Ganzkörper'}[generatedPlan[d-1].focus]||'Ganzkörper');$('workoutSets').value=3;$('workoutReps').value=10;document.getElementById('workoutExercise').scrollIntoView({behavior:'smooth',block:'center'});$('workoutStatus').textContent='Übung aus deinem Plan übernommen: '+x[0]}
const recipeFatLevels={'Skyr-Beeren-Bowl':'low','Hähnchen-Reis-Bowl':'low','Linsen-Tofu-Pfanne':'medium','Hähnchen-Avocado-Wrap':'high','Protein-Pancakes':'medium','Lachs-Reis-Teller':'high'};recipes.forEach(r=>{r.fatLevel=recipeFatLevels[r.name]||'medium'});
const baseRenderRecipes=renderRecipes;
renderRecipes=function(){baseRenderRecipes();const f=$('focus').value;document.querySelectorAll('.recipe-card').forEach(card=>{const title=card.querySelector('.recipe-title')?.textContent;const b=document.createElement('button');b.className='secondary';b.style.width='100%';b.style.marginTop='12px';b.textContent='＋ Zutaten auf Einkaufsliste';b.onclick=()=>addRecipeIngredients(title);card.querySelector('.recipe-content')?.appendChild(b)})};
function addRecipeIngredients(title){const r=weekMeals.find(x=>x.name===title)||weekMeals.find(x=>title.toLowerCase().includes(x.name.toLowerCase().split(' ')[0]));if(!r){alert('Für dieses Rezept sind noch keine Zutaten hinterlegt.');return}r.ingredients.forEach(x=>addShopItem(x[0],x[1]));alert('Zutaten hinzugefügt.');}
const originalShowTab=showTab;
showTab=function(t){originalShowTab(t);if(t==='shop'){renderShopCatalog();renderShopItems()}};
document.querySelectorAll('#fitnessGoal option').forEach(o=>{});
$('store').addEventListener('change',renderShopItems);$('budget').addEventListener('input',renderShopItems);
renderShopCatalog();renderShopItems();



// v51 — rotating daily mindset copy (offline, no tracking)
(function(){
 const lines=[
  "Small steps. Big changes.",
  "Discipline beats motivation.",
  "Earn your progress. Every day.",
  "Fuel your body. Respect the process.",
  "Stronger than yesterday.",
  "Consistency is your superpower.",
  "Train with purpose. Recover with pride.",
  "Progress takes patience. Keep showing up.",
  "Your only competition is your last session.",
  "Build habits. Build strength. Build confidence.",
  "No shortcuts. Just smart work.",
  "Make today count."
 ];
 const el=document.getElementById('dailyQuote');
 if(el){const day=Math.floor(Date.now()/86400000);el.textContent=lines[((day%lines.length)+lines.length)%lines.length];}
})();


/* v93 — compact expandable sections for Profile and Fitness */
(function(){
 function makeAccordion(title,subtitle,items,open){
  if(!items.length)return null;
  const details=document.createElement('details');details.className='mfit-compact-accordion';details.open=!!open;
  const summary=document.createElement('summary');
  summary.innerHTML='<span class="mfit-accordion-copy"><b>'+title+'</b><small>'+(subtitle||'Tippen zum Öffnen')+'</small></span><span class="mfit-accordion-chevron" aria-hidden="true">⌄</span>';
  details.appendChild(summary);
  const content=document.createElement('div');content.className='mfit-accordion-content';
  items.forEach(node=>content.appendChild(node));
  details.appendChild(content);return details;
 }
 window.mfitToggleSettingsMenu=function(){
  const menu=document.getElementById('mfitSettingsMenu'),button=document.querySelector('.header-settings');if(!menu)return;
  const opening=menu.classList.contains('hidden');menu.classList.toggle('hidden',!opening);menu.setAttribute('aria-hidden',String(!opening));button?.setAttribute('aria-expanded',String(opening));
  if(opening)menu.querySelector('.mfit-menu-main-action')?.focus();
 };
 window.mfitCloseSettingsMenu=function(){
  const menu=document.getElementById('mfitSettingsMenu'),button=document.querySelector('.header-settings');if(!menu)return;
  menu.classList.add('hidden');menu.setAttribute('aria-hidden','true');button?.setAttribute('aria-expanded','false');
 };
 window.mfitOpenFullSettings=function(){window.mfitCloseSettingsMenu();if(typeof showTab==='function')showTab('settings');};
 document.addEventListener('keydown',event=>{if(event.key==='Escape')window.mfitCloseSettingsMenu?.();});
 function initSettings(){
  const section=document.getElementById('settings');if(!section||section.dataset.settingsReady)return;
  section.dataset.settingsReady='1';
  const ids=['appAppearance','appReminders','privacyCenter','dataBackup','mfitAppStatus','mfitDataTools'];
  ids.forEach(id=>{const card=document.getElementById(id);if(!card)return;const title=card.querySelector('h2')?.textContent?.trim()||'Einstellungen';const subtitle=id==='appAppearance'?'Farben und Darstellung':id==='appReminders'?'Mitteilungen und Erinnerungen':id==='privacyCenter'?'Datenschutz und Datenkontrolle':id==='dataBackup'?'Daten sichern und wiederherstellen':id==='mfitAppStatus'?'Installation, Offline-Funktion und Systemcheck':'Speicher und lokale Daten verwalten';section.appendChild(makeAccordion(title,subtitle,[card],false));card.classList.add('mfit-accordion-inner');});
  ['mfitAppPreferences','mfitLanguageSettings','mfitAboutSettings'].forEach(id=>{const card=document.getElementById(id);if(!card)return;const title=card.querySelector('h2')?.textContent?.trim()||'Einstellungen';const subtitle=id==='mfitAppPreferences'?'Vibration und Animationen':id==='mfitLanguageSettings'?'Sprache der App':'Versionsinformationen';section.appendChild(makeAccordion(title,subtitle,[card],false));card.classList.add('mfit-accordion-inner');});
  const vibration=document.getElementById('mfitVibrationEnabled'),motion=document.getElementById('mfitReducedMotion');
  if(vibration)vibration.checked=localStorage.getItem('mfit_vibration_enabled')!=='false';
  if(motion){motion.checked=localStorage.getItem('mfit_reduced_motion')==='true';document.documentElement.classList.toggle('mfit-reduced-motion',motion.checked);}const contrast=document.getElementById('mfitHighContrast'),large=document.getElementById('mfitLargeText');if(contrast){contrast.checked=localStorage.getItem('mfit_high_contrast')==='true';document.documentElement.classList.toggle('mfit-high-contrast',contrast.checked);}if(large){large.checked=localStorage.getItem('mfit_large_text')==='true';document.documentElement.classList.toggle('mfit-large-text',large.checked);}
 }
 window.mfitInitSettings=initSettings;
 window.saveMfitAppPreferences=function(){
  const vibration=document.getElementById('mfitVibrationEnabled'),motion=document.getElementById('mfitReducedMotion'),contrast=document.getElementById('mfitHighContrast'),large=document.getElementById('mfitLargeText');
  try{localStorage.setItem('mfit_vibration_enabled',String(!!vibration?.checked));localStorage.setItem('mfit_reduced_motion',String(!!motion?.checked));localStorage.setItem('mfit_high_contrast',String(!!contrast?.checked));localStorage.setItem('mfit_large_text',String(!!large?.checked));}catch(e){}
  document.documentElement.classList.toggle('mfit-reduced-motion',!!motion?.checked);document.documentElement.classList.toggle('mfit-high-contrast',!!contrast?.checked);document.documentElement.classList.toggle('mfit-large-text',!!large?.checked);
  const status=document.getElementById('mfitPreferencesStatus');if(status)status.textContent='Einstellungen gespeichert.';
 };
 window.mfitOpenSettingsSection=function(id){initSettings();const target=document.getElementById(id);if(!target)return;const accordion=target.closest('details.mfit-compact-accordion');if(accordion)accordion.open=true;target.scrollIntoView({behavior:'smooth',block:'start'});};
 function initProfile(){
  const section=document.getElementById('profile');if(!section||section.dataset.compactReady)return;
  section.dataset.compactReady='1';
  [...section.children].filter(el=>el.classList.contains('card')&&el.id!=='settingsHub').forEach((card,i)=>{
   const heading=card.querySelector('h2')?.textContent?.trim()||'Einstellungen';
   const subtitle=card.id==='settingsHub'?'Persönliche App-Einstellungen':card.id==='profileGoals'?'Persönliche Angaben und Trainingsziele':card.id==='appAppearance'?'Farben und Darstellung':card.id==='appReminders'?'Erinnerungen und Check-ins':card.id==='weightHistory'?'Dein Gewichtsverlauf':card.id==='dataBackup'?'Daten sichern und wiederherstellen':card.id==='privacyCenter'?'Datenschutz und Datenkontrolle':'Hinweise und Empfehlungen';
   const wrap=makeAccordion(heading,subtitle,[card],false);section.insertBefore(wrap,card);card.classList.add('mfit-accordion-inner');
  });
 }
 function initFitness(){
  const section=document.getElementById('fitness');if(!section||section.dataset.compactReady)return;
  section.dataset.compactReady='1';
  const children=[...section.children];
  const byId=id=>children.findIndex(el=>el.id===id);
  const byClass=cls=>children.findIndex(el=>el.classList.contains(cls));
  const headingIndex=(txt,from=0)=>children.findIndex((el,i)=>i>=from&&el.querySelector('h2')?.textContent?.includes(txt));
  const groups=[];
  let i=0;
  while(i<children.length){
   const el=children[i];
   if(el.classList.contains('mfit-body-card')){groups.push({title:'Muskelatlas',sub:'Vorder- und Rückansicht · Muskelgruppen antippen',items:[el]});i++;continue;}
   if(el.classList.contains('workout-planner-card')){groups.push({title:'Trainingsplan erstellen',sub:'Trainingsart, Ziel und Wochenplan',items:[el]});i++;continue;}
   if(el.classList.contains('workout-library-card')){
    const end=Math.max(i+1,byId('workoutTrackerCard'));
    groups.push({title:'Übungen & Muskelgruppen',sub:'Übungen suchen, auswählen oder eigene Übungen speichern',items:children.slice(i,end)});i=end;continue;
   }
   if(el.id==='workoutTrackerCard'){groups.push({title:'Training tracken',sub:'Sätze, Wiederholungen und Gewichte eintragen',items:[el]});i++;continue;}
   const h2=el.querySelector('h2')?.textContent||'';
   let title='',sub='';
   if(h2.includes('Trainingsvorlagen')){title='Trainingsvorlagen';sub='Push, Pull, Legs und Upper';}
   else if(h2.includes('Pausentimer')){title='Pausentimer';sub='Pausen zwischen deinen Sätzen';}
   else if(el.id==='workoutHistoryCard'){title='Trainingshistorie';sub='Trainingsvolumen und Einheiten';}
   else if(h2.includes('Fortschrittsanalyse')){title='Fortschritt & Bestleistungen';sub='Gewichtsverlauf und persönliche Rekorde';}
   else if(h2.includes('Muskelgruppen-Tracker')){title='Muskelgruppen-Tracker';sub='Wöchentliches Trainingsvolumen';}
   else if(h2.includes('Regeneration')){title='Regeneration';sub='Schlaf, Muskelkater und Energie';}
   else if(h2.includes('Trainingsernährung')){title='Trainingsernährung';sub='Essen vor und nach dem Training';}
   if(title){groups.push({title,sub,items:[el]});}
   else {groups.push({title:'Weitere Trainingsdaten',sub:'Zusätzliche Informationen',items:[el]});}
   i++;
  }
  groups.forEach(g=>{const wrap=makeAccordion(g.title,g.sub,g.items,g.title==='Trainingsplan erstellen');section.appendChild(wrap);});
 }
 function openMfitAccordionTarget(id){
  const target=document.getElementById(id);if(!target)return;
  const accordion=target.closest('details.mfit-compact-accordion');if(accordion)accordion.open=true;
  target.scrollIntoView({behavior:'smooth',block:'start'});
 }
 window.mfitOpenProfileSection=openMfitAccordionTarget;
 window.mfitOpenFitnessSection=openMfitAccordionTarget;
 initSettings();initProfile();initFitness();
})();

function clearMfitLocalData(){
 if(!confirm('Möchtest du wirklich alle lokal gespeicherten MFit-Daten und Einstellungen auf diesem Gerät löschen? Dieser Schritt kann nicht rückgängig gemacht werden. Erstelle vorher bei Bedarf ein Backup.'))return;
 try{
  const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith('mfit_'))keys.push(key);}
  keys.forEach(key=>localStorage.removeItem(key));
  location.reload();
 }catch(e){const status=document.getElementById('backupStatus');if(status)status.textContent='Die Daten konnten nicht vollständig gelöscht werden. Bitte prüfe die Browser-Speichereinstellungen.';}
}


/* v99 — PWA install, app health and local data controls */
(function(){
 let mfitInstallPrompt=null;
 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();mfitInstallPrompt=event;
  const button=document.getElementById('mfitInstallButton');
  if(button){button.disabled=false;button.textContent='App installieren';}
  const status=document.getElementById('mfitInstallStatus');if(status)status.textContent='Bereit';
 });
 window.addEventListener('appinstalled',()=>{
  mfitInstallPrompt=null;
  const status=document.getElementById('mfitInstallStatus');if(status)status.textContent='Installiert';
  const help=document.getElementById('mfitInstallHelp');if(help)help.textContent='MFit wurde als Web-App installiert.';
 });
 window.addEventListener('online',()=>window.mfitRefreshSystemCheck?.());
 window.addEventListener('offline',()=>window.mfitRefreshSystemCheck?.());
 window.mfitInstallApp=async function(){
  if(mfitInstallPrompt){
   try{await mfitInstallPrompt.prompt();const choice=await mfitInstallPrompt.userChoice;
    const help=document.getElementById('mfitInstallHelp');
    if(help)help.textContent=choice?.outcome==='accepted'?'Installation gestartet.':'Installation wurde nicht gestartet.';
    mfitInstallPrompt=null;
   }catch(e){const help=document.getElementById('mfitInstallHelp');if(help)help.textContent='Installation ist in diesem Browser gerade nicht verfügbar.';}
   return;
  }
  const help=document.getElementById('mfitInstallHelp');
  if(help)help.textContent=/iphone|ipad|ipod/i.test(navigator.userAgent)
   ?'Auf iPhone/iPad: In Safari auf „Teilen“ tippen und „Zum Home-Bildschirm“ wählen. Falls Safari nicht angeboten wird, öffne diese Seite direkt in Safari.'
   :'Öffne das Browser-Menü (⋮ oder Teilen) und wähle „Installieren“ oder „Zum Startbildschirm hinzufügen“, sofern angeboten.';
 };
 window.mfitRefreshSystemCheck=async function(){
  const network=document.getElementById('mfitNetworkStatus'),offline=document.getElementById('mfitOfflineStatus'),install=document.getElementById('mfitInstallStatus'),check=document.getElementById('mfitSystemCheck');
  if(network)network.textContent=navigator.onLine?'Online':'Offline';
  if(offline)offline.textContent=('serviceWorker'in navigator)?'Service Worker verfügbar':'Nicht unterstützt';
  if(install&&!window.matchMedia('(display-mode: standalone)').matches&& !navigator.standalone&& !mfitInstallPrompt)install.textContent='Im Browser';
  let swText='Service Worker: nicht verfügbar';
  if('serviceWorker'in navigator){
   try{const reg=await navigator.serviceWorker.getRegistration();swText=reg?.active?'Service Worker aktiv':reg?.installing?'Service Worker wird installiert':'Noch nicht aktiv';}
   catch(e){swText='Service Worker konnte nicht geprüft werden';}
  }
  if(check){
   const secure=window.isSecureContext?'Sichere Verbindung':'Keine sichere Browser-Umgebung';
   const conn=navigator.onLine?'Internetverbindung vorhanden':'Keine Internetverbindung';
   check.innerHTML='<div>✓ '+secure+'</div><div>'+( 'serviceWorker' in navigator?'✓ ':'• ')+swText+'</div><div>'+(navigator.onLine?'✓ ':'! ')+conn+'</div><div>ℹ Daten werden lokal in diesem Browser gespeichert</div>';
  }
  window.mfitCheckStorage?.();
 };
 window.mfitCheckStorage=async function(){
  const el=document.getElementById('mfitStorageUsage');if(!el)return;
  try{
   if(navigator.storage?.estimate){const e=await navigator.storage.estimate();const used=Number(e.usage)||0;el.textContent=used<1024*1024?Math.round(used/1024)+' KB':(used/1024/1024).toFixed(1)+' MB';}
   else{let bytes=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);bytes+=(k?.length||0)+(localStorage.getItem(k)?.length||0);}el.textContent=(bytes/1024).toFixed(1)+' KB';}
  }catch(e){el.textContent='Nicht verfügbar';}
 };
 window.mfitClearLocalData=function(){
  if(!confirm('Wirklich alle lokalen MFit-Daten und Einstellungen in diesem Browser löschen? Diese Aktion kann nicht rückgängig gemacht werden. Lade vorher ein Backup herunter, wenn du Daten behalten möchtest.'))return;
  try{const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('mfit_'))keys.push(k);}keys.forEach(k=>localStorage.removeItem(k));
   const status=document.getElementById('mfitDataToolsStatus');if(status)status.textContent='Lokale MFit-Daten gelöscht. Die App wird neu geladen …';setTimeout(()=>location.reload(),500);
  }catch(e){const status=document.getElementById('mfitDataToolsStatus');if(status)status.textContent='Daten konnten nicht vollständig gelöscht werden. Bitte Browser-Speicher prüfen.';}
 };
 document.addEventListener('DOMContentLoaded',()=>{window.mfitRefreshSystemCheck?.();});
})();

/* v100 — combined progress dashboard */
window.mfitRenderProgressDashboard=function(){
 const el=id=>document.getElementById(id),today=new Date(),days=[];
 for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);const key=localDate(d);const foods=data.filter(x=>(x.date||localDate())===key);const workouts=workoutLogs.filter(x=>x.date===key);days.push({key,foods,workouts,kcal:foods.reduce((s,x)=>s+(Number(x.kcal)||0),0),protein:foods.reduce((s,x)=>s+(Number(x.protein)||0),0)});}
 const tracked=days.filter(x=>x.foods.length),workoutDays=days.filter(x=>x.workouts.length),avg=key=>tracked.length?tracked.reduce((s,x)=>s+x[key],0)/tracked.length:null;
 const set=(id,value)=>{const node=el(id);if(node)node.textContent=value;};
 set('mfitDashWorkouts',String(workoutDays.length));set('mfitDashWorkoutHint',workoutDays.reduce((s,x)=>s+x.workouts.length,0)+' Trainingseinträge');
 set('mfitDashTracked',tracked.length+'/7');set('mfitDashTrackedHint',tracked.length===1?'1 Tag dokumentiert':tracked.length+' Tage dokumentiert');
 set('mfitDashProtein',avg('protein')===null?'–':Math.round(avg('protein'))+' g');
 set('mfitDashCalories',avg('kcal')===null?'–':Math.round(avg('kcal')).toLocaleString('de-AT'));
 const range=el('mfitDashRange');if(range)range.textContent=days[0].key.slice(8,10)+'.–'+days[6].key.slice(8,10)+'.';
 const chart=el('mfitDashChart');if(chart){
  const maxKcal=Math.max(1,...days.map(x=>x.kcal));
  chart.innerHTML=days.map(x=>{const height=x.foods.length?Math.max(8,Math.round(x.kcal/maxKcal*46)):3;const label=new Date(x.key+'T12:00:00').toLocaleDateString('de-AT',{weekday:'short'});return '<div class="mfit-dash-day"><div class="mfit-dash-bars"><span class="mfit-dash-foodbar" style="height:'+height+'px" title="'+(x.foods.length?Math.round(x.kcal)+' kcal':'Keine Ernährungseinträge')+'"></span><span class="mfit-dash-workoutdot '+(x.workouts.length?'is-active':'')+'" title="'+(x.workouts.length?'Training erfasst':'Kein Training')+'"></span></div><small>'+label+'</small></div>';}).join('');
 }
 const wh=Array.isArray(weightHistory)?weightHistory.filter(x=>Number(x.weight)>0).sort((a,b)=>String(a.date).localeCompare(String(b.date))):[];
 if(wh.length){const last=wh[wh.length-1],prior=wh.length>1?wh[wh.length-2]:null;set('mfitDashWeight',Number(last.weight).toLocaleString('de-AT',{maximumFractionDigits:1})+' kg');set('mfitDashWeightHint',prior?'Letzte Änderung: '+(Number(last.weight)-Number(prior.weight)>0?'+':'')+(Number(last.weight)-Number(prior.weight)).toLocaleString('de-AT',{maximumFractionDigits:1})+' kg':'Erster gespeicherter Wert');}
 const rec=Array.isArray(recoveryLogs)?recoveryLogs.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]:null;
 if(rec){set('mfitDashRecovery',Number(rec.sleep).toLocaleString('de-AT')+' h Schlaf');set('mfitDashRecoveryHint','Energie '+rec.energy+'/10 · Muskelkater '+rec.soreness+'/10');}
 let insight='Trage Training, Ernährung und Erholung ein – MFit verbindet deine Daten hier.';
 if(tracked.length&&workoutDays.length)insight='Du hast '+tracked.length+' Ernährungstage und '+workoutDays.length+' Trainingstage dokumentiert. Bleib bei einem Rhythmus, der zu deiner Erholung passt.';
 else if(workoutDays.length)insight='Training ist erfasst. Ergänze bei Gelegenheit Ernährungseinträge für einen vollständigeren Überblick.';
 else if(tracked.length)insight='Ernährung ist erfasst. Ergänze deine Trainingseinheiten, um beide Bereiche zu vergleichen.';
 set('mfitDashInsight',insight);
};
window.mfitRenderProgressDashboard();
