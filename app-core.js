const $=id=>document.getElementById(id);
const defaultThemeColor='#65d58b';
function applyThemeColor(color,save=true){
 const valid=/^#[0-9a-fA-F]{6}$/.test(String(color))?String(color):defaultThemeColor;
 document.documentElement.style.setProperty('--green',valid);
 document.documentElement.style.setProperty('--accent',valid);
 if($('themeColorPicker'))$('themeColorPicker').value=valid;
 const names={'#65d58b':'Performance Green','#42c7e8':'Electric Blue','#a78bfa':'Violet','#ff7b9c':'Pink','#ffad5c':'Orange','#f0cf63':'Gold','#e7edf4':'Ice'};
 if($('themeColorName'))$('themeColorName').textContent=names[valid.toLowerCase()]||'Custom Color';
 document.querySelectorAll('.theme-swatch').forEach(b=>b.classList.toggle('selected',b.dataset.color.toLowerCase()===valid.toLowerCase()));
 if(save)storage.set('mfit_theme_color',valid);
}
function resetThemeColor(){applyThemeColor(defaultThemeColor);}

const storage={get:key=>{try{return localStorage.getItem(key)}catch(e){return null}},set:(key,value)=>{try{localStorage.setItem(key,value)}catch(e){}}};
function mfitDateKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day}
let selectedDate=mfitDateKey(),historyCursor=mfitDateKey(),historyMode='day';
let data=(()=>{try{const v=JSON.parse(storage.get('mfit_entries')||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x==='object'):[]}catch(e){return []}})();
let mfitMigratedDates=false;data.forEach(e=>{if(!e.date){e.date=mfitDateKey();mfitMigratedDates=true}});if(mfitMigratedDates)storage.set('mfit_entries',JSON.stringify(data));
let nutritionBase={kcal:0,protein:0,carbs:0,fat:0,fiber:0,sugar:0,addedSugar:0,freeSugar:0,vitc:0,vitd:0,calcium:0,iron:0,magnesium:0,potassium:0,zinc:0,b12:0};
let water=Number(storage.get('mfit_water')||0);
let waterQuickEntries=(()=>{try{const v=JSON.parse(storage.get('mfit_water_quick_entries')||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x==='object'&&Number(x.ml)>0):[]}catch(e){return []}})();
let stepCount=(()=>{const day=mfitDateKey();return storage.get('mfit_steps_day')===day?(Number(storage.get('mfit_steps'))||0):0})();
let stepGoal=8000,stepActive=false,stepLastPeak=0,stepBaseline=null,stepMotionHandler=null;
let weightHistory=(()=>{try{return JSON.parse(storage.get('mfit_weight_history')||'[]')}catch(e){return []}})();
let goals=(()=>{try{const v=JSON.parse(storage.get('mfit_goals')||'{"kcal":2800,"protein":150}');return {kcal:Number(v.kcal)||2800,protein:Number(v.protein)||150}}catch(e){return {kcal:2800,protein:150}}})();
const presets=[
{name:'Skyr natur',kcal:63,protein:11,carbs:4,fat:.2,fiber:0,drink:0},
{name:'Magerquark',kcal:67,protein:12,carbs:4,fat:.2,fiber:0,drink:0},
{name:'Banane',kcal:89,protein:1.1,carbs:23,fat:.3,fiber:2.6,drink:0},
{name:'Cola Zero',kcal:0,protein:0,carbs:0,fat:0,fiber:0,drink:250},
{name:'Wasser',kcal:0,protein:0,carbs:0,fat:0,fiber:0,drink:500},
{name:'Haferflocken',kcal:372,protein:13.5,carbs:58,fat:7,fiber:10,drink:0},
{name:'Ei',kcal:143,protein:13,carbs:1,fat:10,fiber:0,drink:0},
{name:'Hähnchenbrust',kcal:110,protein:23,carbs:0,fat:1.5,fiber:0,drink:0}
];
const recipes=[
{name:'Skyr-Beeren-Bowl',diet:'Vegetarisch',kcal:320,p:38,desc:'Skyr, Beeren, Haferflocken und Chiasamen',image:'https://skyrrup.com/cdn/shop/articles/berry-protein-skyr-bowl.png?v=1765952368',source:'Food-Foto: Skyrrup'},
{name:'Hähnchen-Reis-Bowl',diet:'Omnivor',kcal:480,p:52,desc:'Hähnchen, Reis, Brokkoli und Paprika',image:'https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/one_cup_grilled_chicken.jpg',source:'Food-Foto: SnapCalorie'},
{name:'Linsen-Tofu-Pfanne',diet:'Vegan',kcal:420,p:32,desc:'Tofu, Linsen, Spinat und Gemüse',image:'https://res.cloudinary.com/solin-fitness/image/upload/c_scale%2Cw_800%2Cq_auto%2Cf_auto/single-meal-images/inimkmbcpkmcm8ijnjeb',source:'Food-Foto: Solin'},
{name:'Hähnchen-Avocado-Wrap',diet:'Omnivor',kcal:430,p:40,desc:'Vollkornwrap mit Hähnchen, Avocado und Salat',image:'https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/recipe_pics_v2/medium/chicken_and_avocado_wrap.jpg',source:'Food-Foto: SnapCalorie'},
{name:'Protein-Pancakes',diet:'Vegetarisch',kcal:390,p:29,desc:'Lockere Pancakes mit Beeren',image:'https://www.infobae.com/resizer/v2/PD6XXYEP6FDCPBAD5CKHZ5J7FU.jpeg?auth=d20eb1eaa7cd64dd4a8cc5fd8c190b4f32ca170ff529bed27c58cafc3b84d585',source:'Food-Foto: Infobae'},
{name:'Lachs-Reis-Teller',diet:'Pescetarisch',kcal:510,p:36,desc:'Lachs mit Reis und mediterranem Gemüse',image:'https://fiuel.es/cdn/shop/files/Gemini_Generated_Image_hihltbhihltbhihl.png?v=1775033409&width=1946',source:'Food-Foto: Fiuel'},
{name:'Chicken-Burrito-Bowl',diet:'Omnivor',kcal:560,p:46,desc:'Reis, würziges Hähnchen, Mais, Bohnen, Tomaten und Avocado.',image:'https://images.unsplash.com/photo-1668665771757-4d42737d295a?auto=format&fit=crop&w=1000&q=80',source:'Foto: Andrew Relf · Unsplash'},
{name:'Lachs-Poke-Bowl',diet:'Pescetarisch',kcal:540,p:34,desc:'Lachs mit Reis, Avocado, Gurke, Edamame und Sesam.',image:'https://images.unsplash.com/photo-1768326119213-e0ad875083a3?auto=format&fit=crop&w=1000&q=80',source:'Foto: Sergio Mena Ferreira · Unsplash'},
{name:'Omelette mit Salat & Toast',diet:'Vegetarisch',kcal:390,p:27,desc:'Locker gebratenes Omelette mit frischem Salat und knusprigem Toast.',image:'https://images.unsplash.com/photo-1766146431872-a4472ccd3889?auto=format&fit=crop&w=1000&q=80',source:'Foto: Amin Zabardast · Unsplash'},
{name:'Beeren-Pancakes',diet:'Vegetarisch',kcal:430,p:24,desc:'Fluffige Pancakes mit frischen Beeren und etwas Joghurt.',image:'https://images.unsplash.com/photo-1722169474498-eb7fe1f59694?auto=format&fit=crop&w=1000&q=80',source:'Foto: Daria Mushtaieva · Unsplash'},
{name:'Spaghetti mit Tomatensauce',diet:'Vegetarisch',kcal:470,p:18,desc:'Pasta mit aromatischer Tomatensauce, Kräutern und Parmesan.',image:'https://images.unsplash.com/photo-1567608285969-48e4bbe0d399?auto=format&fit=crop&w=1000&q=80',source:'Foto: Victoria Aleksandrova · Unsplash'},
{name:'Garnelen-Pasta',diet:'Pescetarisch',kcal:520,p:32,desc:'Spaghetti mit Garnelen, Knoblauch und würziger Tomatensauce.',image:'https://images.unsplash.com/photo-1655279561980-c72226ffe505?auto=format&fit=crop&w=1000&q=80',source:'Foto: Eiliv Aceron · Unsplash'},
{name:'Cremiger Lachs-Gemüse-Teller',diet:'Pescetarisch',kcal:510,p:36,desc:'Zarter Lachs mit grünem Gemüse und cremiger Sauce.',image:'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=1000&q=80',source:'Foto: Jennifer Pallian · Unsplash'},
{name:'Hähnchen-Reis-Salat-Bowl',diet:'Omnivor',kcal:495,p:43,desc:'Gegrilltes Hähnchen auf Reis mit knackigem Salat und Tomaten.',image:'https://images.unsplash.com/photo-1762631383846-6bead15b9796?auto=format&fit=crop&w=1000&q=80',source:'Foto: joe boshra · Unsplash'},
{name:'Mediterrane Pasta mit Parmesan',diet:'Vegetarisch',kcal:485,p:22,desc:'Herzhafte Pasta mit Sauce, frischen Kräutern und Parmesan.',image:'https://images.unsplash.com/photo-1760390952355-a6b9cf50a7a2?auto=format&fit=crop&w=1000&q=80',source:'Foto: Anbinh Pho · Unsplash'},
{name:'Chicken-Rice-Power-Bowl',diet:'Omnivor',kcal:530,p:45,desc:'Reis-Bowl mit Hähnchen, Gemüse und einer würzigen Sauce.',image:'https://images.unsplash.com/photo-1670816978291-a5cf23d87968?auto=format&fit=crop&w=1000&q=80',source:'Foto: You Le · Unsplash'}
];

function getPackAmount(product){
 const normalize=(value,unit)=>{
  let amount=Number(String(value).replace(',','.')),u=String(unit||'').toLowerCase().trim();
  if(!Number.isFinite(amount)||amount<=0)return null;
  if(u==='kg')return {amount:amount*1000,unit:'g'};
  if(u==='l')return {amount:amount*1000,unit:'ml'};
  if(u==='cl')return {amount:amount*10,unit:'ml'};
  if(['g','ml'].includes(u))return {amount,unit:u};
  return null;
 };
 const pq=String(product.product_quantity??'').trim();
 const pMatch=pq.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|cl|l)?$/i);
 if(pMatch){
  const parsed=normalize(pMatch[1],pMatch[2]||product.product_quantity_unit);
  if(parsed)return parsed;
 }
 const qNum=normalize(product.product_quantity,product.product_quantity_unit);
 if(qNum)return qNum;
 const qty=String(product.quantity||'').replace(/,/g,'.');
 const multi=qty.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(kg|g|ml|cl|l)\b/i);
 if(multi){const one=normalize(multi[2],multi[3]);if(one)return {amount:Number(multi[1])*one.amount,unit:one.unit};}
 const match=qty.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|cl|l)\b/i);
 if(match)return normalize(match[1],match[2]);
 return null;
}
async function lookupBarcode(){
 const code=$('barcode').value.trim().replace(/\s/g,'');
 if(!/^\d{8,14}$/.test(code)){ $('barcodeStatus').textContent='Bitte einen gültigen Barcode mit 8–14 Ziffern eingeben.'; return; }
 $('barcodeStatus').textContent='Suche Produktdaten für '+code+' …';
 try{
  const fields='code,product_name,product_name_de,generic_name,brands,quantity,product_quantity,product_quantity_unit,nutriments';
  const res=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json?fields='+fields,{cache:'no-store'});
  if(!res.ok) throw new Error('Netzwerkfehler '+res.status);
  const j=await res.json(); if(j.status!==1||!j.product) throw new Error('Produkt nicht gefunden');
  const x=j.product,n=x.nutriments||{},name=x.product_name_de||x.product_name||x.generic_name;
  if(!name)throw new Error('Produktname fehlt in der Datenbank');
  $('foodName').value=(x.brands?x.brands+' – ':'')+name;
  $('unit').value='g';$('amount').value=100;
  setNutritionFromProduct(n);
  const savedPacks=JSON.parse(storage.get('mfit_pack_sizes')||'{}');
  const detectedPack=getPackAmount(x);const pack=detectedPack||savedPacks[code]||null;if(detectedPack){savedPacks[code]=detectedPack;storage.set('mfit_pack_sizes',JSON.stringify(savedPacks));}
  if(pack){$('packSize').value=pack.amount;$('unit').value=pack.unit;$('portionMode').value='whole';applyPortionMode();}
  else{$('packSize').value='';$('portionMode').value='custom';$('amount').value='';recalculateNutrition();}
  $('barcodeStatus').textContent='Produkt gefunden: '+name+'. '+(pack?'Packungsgröße '+pack.amount+' '+pack.unit+' erkannt – ganze Packung ausgewählt. ':'Packungsgröße fehlt in den Produktdaten. Trage sie einmal ein und merke sie dir. ')+(Object.keys(n).length?'Nährwerte übernommen.':'Keine Nährwerte hinterlegt.')+' Bitte Etikett prüfen.';
 }catch(e){$('barcodeStatus').textContent='Kein vollständiger Datensatz für diesen Barcode gefunden. Prüfe die Ziffern oder gib die Nährwerte manuell ein. ('+e.message+')';}
}
function rememberPackSize(){const code=$('barcode').value.trim().replace(/\s/g,'');const amount=Number($('packSize').value)||0;const unit=$('unit').value;if(!/^\d{8,14}$/.test(code)||amount<=0||!['g','ml'].includes(unit)){$('barcodeStatus').textContent='Gib zuerst einen gültigen Barcode und eine Packungsgröße in g oder ml ein.';return;}const map=JSON.parse(storage.get('mfit_pack_sizes')||'{}');map[code]={amount,unit};storage.set('mfit_pack_sizes',JSON.stringify(map));$('portionMode').value='whole';applyPortionMode();$('barcodeStatus').textContent='Packungsgröße gespeichert. Bei späteren Scans dieses Produkts wird sie automatisch übernommen.';}
function applyPortionMode(){
 const mode=$('portionMode')?.value,pack=Number($('packSize')?.value)||0;
 if(mode==='whole'&&pack>0)$('amount').value=pack;
 else if(mode==='half'&&pack>0)$('amount').value=pack/2;
 recalculateNutrition();
}
const nutrientKeys=['kcal','protein','carbs','fat','fiber','sugar','addedSugar','freeSugar','vitc','vitd','calcium','iron','magnesium','potassium','zinc','b12'];
function recalculateNutrition(){const amount=Number($('amount').value)||0,factor=$('unit').value==='Stück'?amount:amount/100;nutrientKeys.forEach(k=>{const el=$(k);if(el)el.value=String(Math.round((Number(nutritionBase[k]||0)*factor)*100)/100)});}
function updateNutritionBase(key){const amount=Number($('amount').value)||0,factor=$('unit').value==='Stück'?amount:amount/100;nutritionBase[key]=factor>0?(Number($(key).value)||0)/factor:0;recalculateNutrition();}
function setNutritionFromProduct(n){nutritionBase={kcal:Number(n['energy-kcal_100g']??(n['energy-kj_100g']?n['energy-kj_100g']/4.184:0)),protein:Number(n.proteins_100g??0),carbs:Number(n.carbohydrates_100g??0),fat:Number(n.fat_100g??0),fiber:Number(n.fiber_100g??0),sugar:Number(n.sugars_100g??0),addedSugar:Number(n['added-sugars_100g']??n.added_sugars_100g??0),freeSugar:Number(n['added-sugars_100g']??n.added_sugars_100g??0),vitc:Number(n['vitamin-c_100g']??0),vitd:Number(n['vitamin-d_100g']??0),calcium:Number(n.calcium_100g??0),iron:Number(n.iron_100g??0),magnesium:Number(n.magnesium_100g??0),potassium:Number(n.potassium_100g??0),zinc:Number(n.zinc_100g??0),b12:Number(n['vitamin-b12_100g']??0)};recalculateNutrition();}async function startBarcode(){
 if(!navigator.mediaDevices?.getUserMedia){$('barcodeStatus').textContent='Dieser Browser bietet keinen Kamerazugriff. Bitte Barcode manuell eingeben.';return}
 let overlay=null,scanner=null,started=false,finished=false,torchOn=false;
 const closeScanner=async()=>{if(finished)return;finished=true;if(scanner&&started){try{await scanner.stop()}catch(e){}}if(scanner){try{scanner.clear()}catch(e){}}if(overlay)overlay.remove();};
 try{
  overlay=document.createElement('div');overlay.style='position:fixed;inset:0;background:#07100bf5;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px;overflow:hidden';
  const title=document.createElement('p');title.textContent='Barcode vollständig in die Kamera halten';title.style='color:white;font-weight:700;text-align:center;margin:0';
  const reader=document.createElement('div');reader.id='mfit-barcode-reader';reader.style='width:min(96vw,600px);max-height:42vh;overflow:hidden;border-radius:16px';
  const hint=document.createElement('p');hint.textContent='Kamera langsam über den Barcode bewegen. Halte das Handy ruhig und achte auf scharfen Fokus.';hint.style='color:#c8d5cc;text-align:center;margin:0;font-size:14px';
  const controls=document.createElement('div');controls.style='display:flex;gap:10px;flex-wrap:wrap;justify-content:center';
  const torch=document.createElement('button');torch.textContent='🔦 Licht einschalten';torch.className='secondary';
  const close=document.createElement('button');close.textContent='Scanner schließen';close.className='secondary';close.onclick=()=>closeScanner();
  torch.onclick=async()=>{if(!scanner||!started)return;try{await scanner.applyVideoConstraints({advanced:[{torch:!torchOn}]});torchOn=!torchOn;torch.textContent=torchOn?'🔦 Licht ausschalten':'🔦 Licht einschalten';}catch(e){hint.textContent='Die Taschenlampe wird von dieser Kamera oder diesem Browser nicht unterstützt.'}};
  controls.append(torch,close);overlay.append(title,reader,hint,controls);document.body.append(overlay);
  if(!window.Html5Qrcode)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';script.onload=resolve;script.onerror=()=>reject(new Error('Scanner-Bibliothek konnte nicht geladen werden'));document.head.append(script);});
  if(finished)return;
  const formats=[Html5QrcodeSupportedFormats.EAN_13,Html5QrcodeSupportedFormats.EAN_8,Html5QrcodeSupportedFormats.UPC_A,Html5QrcodeSupportedFormats.UPC_E,Html5QrcodeSupportedFormats.CODE_128].filter(x=>x!==undefined);
  scanner=new Html5Qrcode('mfit-barcode-reader',{formatsToSupport:formats,verbose:false});
  await scanner.start({facingMode:'environment'},{fps:20,aspectRatio:1.5,videoConstraints:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}},async decodedText=>{
   if(finished)return;const code=String(decodedText).replace(/\D/g,'');if(!/^\d{8,14}$/.test(code))return;
   $('barcode').value=code;$('barcodeStatus').textContent='Barcode erkannt: '+code+'. Produktdaten werden geladen …';await closeScanner();await lookupBarcode();showTab('track');$('portionMode').scrollIntoView({behavior:'smooth',block:'center'});
  },()=>{});
  started=true;
 }catch(e){await closeScanner();$('barcodeStatus').textContent='Scanner konnte nicht gestartet werden: '+e.message;}
}
function save(){storage.set('mfit_entries',JSON.stringify(data));storage.set('mfit_water',water);render()}
function persistSteps(){storage.set('mfit_steps_day',mfitDateKey());storage.set('mfit_steps',String(stepCount));renderSteps()}
function renderSteps(){if($('stepTotal'))$('stepTotal').textContent=stepCount.toLocaleString('de-AT');if($('stepGoalLabel'))$('stepGoalLabel').textContent='Tagesziel: '+stepGoal.toLocaleString('de-AT')+' Schritte';if($('stepBar'))$('stepBar').style.width=Math.min(100,stepCount/stepGoal*100)+'%';}
function addManualSteps(n){stepCount+=n;persistSteps();if($('stepStatus'))$('stepStatus').textContent=n+' Schritte manuell ergänzt.'}
async function startStepCounter(){if(stepActive){stopStepCounter();return;}if(!('DeviceMotionEvent'in window)){$('stepStatus').textContent='Dieser Browser unterstützt keinen Bewegungssensor. Nutze die manuelle Schritt-Erfassung.';return;}try{if(typeof DeviceMotionEvent.requestPermission==='function'){const permission=await DeviceMotionEvent.requestPermission();if(permission!=='granted')throw new Error('Bewegungszugriff wurde nicht erlaubt.');}stepActive=true;stepLastPeak=0;stepBaseline=null;stepMotionHandler=e=>{const a=e.acceleration||e.accelerationIncludingGravity;if(!a)return;const mag=Math.sqrt((a.x||0)**2+(a.y||0)**2+(a.z||0)**2);if(stepBaseline===null)stepBaseline=mag;stepBaseline=stepBaseline*0.9+mag*0.1;const movement=Math.abs(mag-stepBaseline);const now=Date.now();if(movement>1.15&&now-stepLastPeak>320){stepLastPeak=now;stepCount++;persistSteps();}};window.addEventListener('devicemotion',stepMotionHandler);$('stepStatus').textContent='Schrittzähler läuft. Lass MFit geöffnet und das iPhone in deiner Tasche.';document.querySelector('[onclick="startStepCounter()"]')?.replaceChildren(document.createTextNode('Schrittzähler stoppen'));}catch(e){$('stepStatus').textContent='Schrittzähler nicht gestartet: '+e.message}}
function stopStepCounter(){if(stepMotionHandler)window.removeEventListener('devicemotion',stepMotionHandler);stepMotionHandler=null;stepActive=false;if($('stepStatus'))$('stepStatus').textContent='Schrittzählung pausiert.';const b=document.querySelector('[onclick="startStepCounter()"]');if(b)b.textContent='Schrittzähler starten'}
function renderWeightHistory(){const el=$('weightHistoryList');if(!el)return;el.innerHTML=weightHistory.length?weightHistory.slice(-7).reverse().map(x=>'<div class="item row"><span>'+new Date(x.date+'T12:00:00').toLocaleDateString('de-AT')+'</span><b>'+Number(x.weight).toFixed(1)+' kg</b></div>').join(''):'Noch keine Gewichtseinträge.'}
function saveWeightLog(){const w=Number($('weightLogInput').value);if(!w||w<25||w>300){alert('Bitte ein gültiges Gewicht eintragen.');return;}weightHistory.push({date:mfitDateKey(),weight:w});weightHistory=weightHistory.slice(-60);storage.set('mfit_weight_history',JSON.stringify(weightHistory));$('weightLogInput').value='';renderWeightHistory()}
function showTab(t){['home','track','recipes','shop','fitness','profile','settings'].forEach(x=>{const el=$(x);if(el)el.classList.toggle('hidden',x!==t)});document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));if(t==='recipes')renderRecipes();if(t==='fitness')renderFitness();if(t==='settings')window.mfitInitSettings?.()}
function addFood(){let n=$('foodName').value.trim(),a=Number($('amount').value)||0;if(!n||a<=0)return alert('Bitte Lebensmittel und Menge eintragen.');let entry={date:selectedDate||mfitDateKey(),name:n,amount:a,unit:$('unit').value,meal:$('meal').value,kcal:Number($('kcal').value),protein:Number($('protein').value),carbs:Number($('carbs').value),fat:Number($('fat').value),fiber:Number($('fiber').value),sugar:Number($('sugar')?.value||0),addedSugar:Number($('addedSugar')?.value||0),freeSugar:Number($('addedSugar')?.value||0),drink:Number($('drink').value),vitc:Number($('vitc')?.value||0),vitd:Number($('vitd')?.value||0),calcium:Number($('calcium')?.value||0),iron:Number($('iron')?.value||0),magnesium:Number($('magnesium')?.value||0),potassium:Number($('potassium')?.value||0),zinc:Number($('zinc')?.value||0),b12:Number($('b12')?.value||0)};data.push(entry);water+=entry.drink;['foodName','barcode'].forEach(x=>$(x).value='');$('portionMode').value='whole';$('packSize').value='';save();showTab('home')}
function removeWater(n){n=Number(n);if(!Number.isFinite(n)||n<=0)return;water=Math.max(0,water-n);save()}
function addWater(n){n=Number(n);if(!Number.isFinite(n)||n<=0)return;water+=n;waterQuickEntries.push({id:String(Date.now())+'-'+Math.random().toString(36).slice(2,8),ml:n,time:new Date().toLocaleTimeString('de-AT',{hour:'2-digit',minute:'2-digit'})});waterQuickEntries=waterQuickEntries.slice(-50);storage.set('mfit_water_quick_entries',JSON.stringify(waterQuickEntries));save()}
function addCustomWater(){const el=$('customWaterAmount'),n=Number(el?.value);if(!Number.isFinite(n)||n<=0||n>5000){alert('Bitte eine Menge zwischen 1 und 5000 ml eingeben.');return;}addWater(n);el.value=''}
function removeQuickWater(id){const i=waterQuickEntries.findIndex(x=>String(x.id)===String(id));if(i<0)return;water=Math.max(0,water-(Number(waterQuickEntries[i].ml)||0));waterQuickEntries.splice(i,1);storage.set('mfit_water_quick_entries',JSON.stringify(waterQuickEntries));save()}
function renderWaterQuickHistory(){const el=$('waterQuickHistory');if(!el)return;el.innerHTML=waterQuickEntries.length?waterQuickEntries.slice().reverse().map(x=>'<div class="item row" style="gap:12px"><div><b>'+Number(x.ml)+' ml</b><div class="muted">'+esc(x.time||'')+'</div></div><button type="button" class="danger smallbtn" onclick="removeQuickWater(\''+String(x.id)+'\')">Eintrag löschen</button></div>').join(''):'<div class="muted">Noch keine Wassereinträge. Jeder Eintrag erscheint hier einzeln.</div>';}
function render(){
 const dayData=data.filter(e=>(e.date||mfitDateKey())===selectedDate);
 let sum=k=>dayData.reduce((s,e)=>s+(Number(e?.[k])||0),0),k=sum('kcal'),p=sum('protein'),f=sum('fiber'),c=sum('carbs'),fat=sum('fat'),sugar=sum('sugar'),addedSugar=sum('addedSugar'),freeSugar=sum('freeSugar'),naturalSugar=Math.max(0,sugar-addedSugar),sugarGoal=50;
 $('kcalTotal').textContent=Math.round(k)+' kcal';$('kcalLeft').textContent='Tagesziel: '+goals.kcal+' kcal · '+Math.max(0,Math.round(goals.kcal-k))+' übrig';$('kcalBar').style.width=Math.min(100,k/goals.kcal*100)+'%';
 $('proteinTotal').textContent=Math.round(p)+' g';$('proteinLeft').textContent='Ziel: '+goals.protein+' g · '+Math.max(0,Math.round(goals.protein-p))+' übrig';
 const cGoal=Math.round((goals.kcal*0.5)/4),fatGoal=Math.round((goals.kcal*0.25)/9);
 $('macroProtein').textContent=Math.round(p)+' / '+goals.protein+' g';$('macroCarbs').textContent=Math.round(c)+' / '+cGoal+' g';$('macroFat').textContent=Math.round(fat)+' / '+fatGoal+' g';
 $('proteinBar').style.width=Math.min(100,p/Math.max(1,goals.protein)*100)+'%';$('carbsBar').style.width=Math.min(100,c/Math.max(1,cGoal)*100)+'%';$('fatBar').style.width=Math.min(100,fat/Math.max(1,fatGoal)*100)+'%';
 $('waterTotal').textContent=Math.round(water)+' ml';$('fiberTotal').textContent=f.toFixed(1)+' g';
 if($('sugarTotal'))$('sugarTotal').textContent=sugar.toFixed(1)+' g';if($('addedSugarTotal'))$('addedSugarTotal').textContent=addedSugar.toFixed(1)+' g';if($('freeSugarTotal'))$('freeSugarTotal').textContent=freeSugar.toFixed(1)+' g';if($('naturalSugarTotal'))$('naturalSugarTotal').textContent=naturalSugar.toFixed(1)+' g';
 if($('sugarGoalLabel'))$('sugarGoalLabel').textContent='Orientierung: unter '+sugarGoal+' g freie/zugesetzte Zucker · ideal möglichst weniger';if($('sugarBar'))$('sugarBar').style.width=Math.min(100,freeSugar/sugarGoal*100)+'%';
 $('todayList').innerHTML=dayData.length?dayData.map(e=>{const i=data.indexOf(e);return '<div class="item row"><div><b>'+esc(e.name)+'</b><div class="muted">'+esc(e.meal)+' · '+e.amount+esc(e.unit)+' · '+Math.round(e.kcal)+' kcal · '+(Number(e.protein)||0).toFixed(1)+' g Protein</div></div><button class="danger smallbtn" onclick="removeEntry('+i+')">×</button></div>'}).join(''):'Noch keine Einträge für diesen Tag.';
 [['vitc','sumVitC','mg'],['vitd','sumVitD','µg'],['calcium','sumCalcium','mg'],['iron','sumIron','mg'],['magnesium','sumMagnesium','mg'],['potassium','sumPotassium','mg'],['zinc','sumZinc','mg'],['b12','sumB12','µg']].forEach(([key,id,unit])=>{if($(id))$(id).textContent=sum(key).toFixed(1)+' '+unit});

function renderWeeklyMomentum(){
 const grid=$('weeklyDayGrid');if(!grid)return;
 const today=new Date(),start=new Date(today);start.setDate(today.getDate()-6);
 const days=Array.from({length:7},(_,i)=>{
  const date=new Date(start);date.setDate(start.getDate()+i);
  const key=mfitDateKey(date),entries=data.filter(e=>(e.date||mfitDateKey())===key);
  return {key,date,entries};
 });
 const tracked=days.filter(d=>d.entries.length>0).length;
 const total=days.reduce((n,d)=>n+d.entries.length,0);
 if($('weeklyTrackedCount'))$('weeklyTrackedCount').textContent=tracked+' / 7 Tage';
 if($('weeklyEntryCount'))$('weeklyEntryCount').textContent=total+' Einträge';
 grid.innerHTML=days.map(d=>{
  const label=d.date.toLocaleDateString('de-AT',{weekday:'short'}).replace('.','');
  return '<div class="weekly-day '+(d.entries.length?'is-tracked':'')+(d.key===mfitDateKey()?' is-today':'')+'"><span class="weekly-day-mark">'+(d.entries.length?'✓':'·')+'</span><span class="weekly-day-label">'+label+'</span></div>';
 }).join('');
 const hint=tracked===7?'Eine lückenlose Woche – stark dokumentiert.':tracked===0?'Noch kein Eintrag diese Woche. Fang einfach mit dem nächsten an.':tracked+' von 7 Tagen erfasst. Es geht um Orientierung, nicht um Perfektion.';
 if($('weeklyMomentumHint'))$('weeklyMomentumHint').textContent=hint;
}
 renderWaterQuickHistory();renderHistory();renderWeeklyMomentum();window.mfitRenderProgressDashboard?.();window.mfitRenderSmartCoach?.();
}
function mfitParseDate(key){const [y,m,d]=String(key).split('-').map(Number);return new Date(y,m-1,d,12)}
function mfitAddDays(date,n){const d=mfitParseDate(date);d.setDate(d.getDate()+n);return mfitDateKey(d)}
function mfitPeriodRange(){
 const d=mfitParseDate(historyCursor);let start,end;
 if(historyMode==='day')start=end=historyCursor;
 else if(historyMode==='week'){const offset=(d.getDay()+6)%7;start=mfitAddDays(historyCursor,-offset);end=mfitAddDays(start,6)}
 else if(historyMode==='month'){start=mfitDateKey(new Date(d.getFullYear(),d.getMonth(),1,12));end=mfitDateKey(new Date(d.getFullYear(),d.getMonth()+1,0,12))}
 else{start=mfitDateKey(new Date(d.getFullYear(),0,1,12));end=mfitDateKey(new Date(d.getFullYear(),11,31,12))}
 return {start,end};
}
function mfitShiftHistory(direction){
 const d=mfitParseDate(historyCursor);
 if(historyMode==='day')d.setDate(d.getDate()+direction);
 else if(historyMode==='week')d.setDate(d.getDate()+7*direction);
 else if(historyMode==='month')d.setMonth(d.getMonth()+direction,1);
 else d.setFullYear(d.getFullYear()+direction,0,1);
 historyCursor=mfitDateKey(d);
 if(historyMode==='day'){selectedDate=historyCursor;render()}
 renderHistory();
}
function setHistoryMode(mode){if(!['day','week','month','year'].includes(mode))return;historyMode=mode;renderHistory()}
function openHistoryDay(date){historyCursor=date;selectedDate=date;historyMode='day';render();renderHistory()}
function renderHistory(){
 const root=$('trackingHistoryList');if(!root)return;
 const {start,end}=mfitPeriodRange(),startDate=mfitParseDate(start),endDate=mfitParseDate(end),days=[];
 for(let d=new Date(startDate);d<=endDate;d.setDate(d.getDate()+1)){const key=mfitDateKey(d),entries=data.filter(e=>(e.date||mfitDateKey())===key);const totals=entries.reduce((a,e)=>{a.kcal+=Number(e.kcal)||0;a.protein+=Number(e.protein)||0;return a},{kcal:0,protein:0});days.push({key,entries,totals})}
 const tracked=days.filter(d=>d.entries.length).length;
 const title=historyMode==='day'?startDate.toLocaleDateString('de-AT',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}):historyMode==='week'?'Woche '+startDate.toLocaleDateString('de-AT',{day:'2-digit',month:'2-digit'})+' – '+endDate.toLocaleDateString('de-AT',{day:'2-digit',month:'2-digit',year:'numeric'}):historyMode==='month'?startDate.toLocaleDateString('de-AT',{month:'long',year:'numeric'}):String(startDate.getFullYear());
 if($('trackingHistoryTitle'))$('trackingHistoryTitle').textContent=title;
 if($('trackingHistoryCount'))$('trackingHistoryCount').textContent=tracked+' von '+days.length+' Tagen getrackt';
 document.querySelectorAll('[data-history-mode]').forEach(b=>b.classList.toggle('active',b.dataset.historyMode===historyMode));
 const prev=$('historyPrev'),next=$('historyNext');if(prev)prev.textContent=historyMode==='day'?'‹ Tag':historyMode==='week'?'‹ Woche':historyMode==='month'?'‹ Monat':'‹ Jahr';if(next)next.textContent=historyMode==='day'?'Tag ›':historyMode==='week'?'Woche ›':historyMode==='month'?'Monat ›':'Jahr ›';
 root.innerHTML=days.map(d=>{const label=mfitParseDate(d.key).toLocaleDateString('de-AT',{weekday:'short',day:'2-digit',month:'2-digit',year:historyMode==='year'?'numeric':undefined});const state=d.entries.length?'<span class="history-status done">✓ Getrackt · '+d.entries.length+' Einträge</span>':'<span class="history-status">– Nicht getrackt</span>';return '<button class="history-day '+(d.key===selectedDate?'selected':'')+'" onclick="openHistoryDay(\''+d.key+'\')"><span class="history-day-main"><b>'+label+'</b>'+state+'</span><span class="history-day-stats">'+(d.entries.length?Math.round(d.totals.kcal)+' kcal · '+d.totals.protein.toFixed(0)+' g Protein':'—')+'</span></button>'}).join('');
 if(historyMode==='day'&&days[0]?.entries.length){root.innerHTML+='<div class="history-entry-list"><b>Einträge an diesem Tag</b>'+days[0].entries.map(e=>'<div class="history-entry"><span>'+esc(e.name)+' <small>'+esc(e.meal||'')+' · '+e.amount+esc(e.unit||'')+'</small></span><b>'+Math.round(Number(e.kcal)||0)+' kcal</b></div>').join('')+'</div>'}
}
function removeEntry(i){water=Math.max(0,water-(data[i].drink||0));data.splice(i,1);save()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderPresets(){$('presets').innerHTML=presets.map((x,i)=>`<div class="item row"><div><b>${x.name}</b><div class="muted">${x.kcal} kcal · ${x.protein} g Protein / 100 g bzw. Portion</div></div><button class="smallbtn" onclick="usePreset(${i})">Nutzen</button></div>`).join('')}
function usePreset(i){let x=presets[i];$('foodName').value=x.name;$('amount').value=x.drink?x.drink:100;$('unit').value=x.drink?'ml':'g';nutritionBase={...nutritionBase,kcal:x.kcal,protein:x.protein,carbs:x.carbs,fat:x.fat,fiber:x.fiber};recalculateNutrition();$('drink').value=x.drink}
let recipeFavorites=new Set((()=>{try{const v=JSON.parse(storage.get('mfit_recipe_favorites')||'[]');return Array.isArray(v)?v:[]}catch(e){return []}})());
let showRecipeFavorites=false;
function toggleRecipeFavorite(name){if(recipeFavorites.has(name))recipeFavorites.delete(name);else recipeFavorites.add(name);storage.set('mfit_recipe_favorites',JSON.stringify([...recipeFavorites]));renderRecipes()}
function toggleRecipeFavoritesView(){showRecipeFavorites=!showRecipeFavorites;const b=$('recipeFavoritesToggle');if(b){b.classList.toggle('active',showRecipeFavorites);b.setAttribute('aria-pressed',String(showRecipeFavorites));b.textContent=showRecipeFavorites?'♥ Favoriten anzeigen':'♡ Nur Favoriten';}renderRecipes()}
function pickRandomRecipe(){const list=recipes.filter(x=>(($('diet')?.value||'Alle')==='Alle'||x.diet===($('diet')?.value||'Alle'))&&(!showRecipeFavorites||recipeFavorites.has(x.name)));if(!list.length){$('recipeSearch').value='';renderRecipes();return;}const chosen=list[Math.floor(Math.random()*list.length)];$('recipeSearch').value=chosen.name;showRecipeFavorites=false;const b=$('recipeFavoritesToggle');if(b){b.classList.remove('active');b.setAttribute('aria-pressed','false');b.textContent='♡ Nur Favoriten';}renderRecipes();const card=[...document.querySelectorAll('.recipe-card')].find(el=>el.dataset.recipe===chosen.name);card?.scrollIntoView({behavior:'smooth',block:'center'});}
function renderRecipes(){const d=$('diet')?.value||'Alle',focus=$('focus')?.value||'Proteinreich',q=($('recipeSearch')?.value||'').trim().toLocaleLowerCase('de');let r=recipes.filter(x=>(d==='Alle'||x.diet===d)&&(!showRecipeFavorites||recipeFavorites.has(x.name))&&(!q||[x.name,x.desc,x.diet].join(' ').toLocaleLowerCase('de').includes(q)));r.sort((a,b)=>focus==='Proteinreich'?b.p-a.p:focus==='Kalorienarm'?a.kcal-b.kcal:focus==='Fettarm'?((a.fatLevel==='low'?0:a.fatLevel==='high'?2:1)-(b.fatLevel==='low'?0:b.fatLevel==='high'?2:1)):focus==='Fettreicher / energiereich'?((b.fatLevel==='high'?2:b.fatLevel==='low'?0:1)-(a.fatLevel==='high'?2:a.fatLevel==='low'?0:1)):(b.p/b.kcal)-(a.p/a.kcal));if($('recipeCount'))$('recipeCount').textContent=r.length+' IDEEN';$('recipeList').innerHTML=r.length?'<div class="recipe-grid">'+r.map(x=>{const safeName=String(x.name).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');const safeDesc=String(x.desc||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');return `<article class="recipe-card" data-recipe="${safeName}"><div class="recipe-image-wrap"><img class="recipe-photo" src="${x.image}" alt="${safeName}" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80'}else{this.parentElement.classList.add('image-unavailable');this.remove()}"><span class="recipe-image-label">MFIT FOOD IDEA</span></div><div class="recipe-content"><div class="recipe-title-row"><div class="recipe-title">${safeName}</div><button type="button" class="favorite-button ${recipeFavorites.has(x.name)?'is-favorite':''}" aria-label="${recipeFavorites.has(x.name)?'Favorit entfernen':'Als Favorit speichern'}" aria-pressed="${recipeFavorites.has(x.name)}" onclick="toggleRecipeFavorite('${safeName.replace(/'/g,'&#39;')}')">${recipeFavorites.has(x.name)?'♥':'♡'}</button></div><span class="pill">${x.diet}</span><div class="recipe-desc" style="margin-top:9px">${safeDesc}</div><div class="recipe-meta"><span class="recipe-chip">${x.kcal} kcal</span><span class="recipe-chip">${x.p} g Protein</span></div><div class="recipe-source">${x.source||'Food-Foto'}</div></div></article>`}).join('')+'</div>':'<div class="recipe-empty"><span>🍽️</span><b>Keine passenden Rezepte gefunden</b><p>Ändere deine Suche oder wähle einen anderen Filter.</p><button type="button" class="secondary" onclick="$(\'recipeSearch\').value=\'\';showRecipeFavorites=false;renderRecipes()">Filter zurücksetzen</button></div>'}
const pantryRecipeIdeas=[
 {name:'Protein-Skyr-Bowl',needs:['skyr','beeren'],optional:['haferflocken','banane','honig','nuesse'],steps:'Skyr cremig rühren, Beeren und gewünschte Toppings darauf verteilen.',time:'5 Min.',type:'Süß · proteinreich'},
 {name:'Bananen-Pancakes',needs:['banane','ei'],optional:['haferflocken','milch','skyr','zimt'],steps:'Banane zerdrücken, mit Ei und optional Haferflocken verrühren. In einer beschichteten Pfanne portionsweise ausbacken.',time:'12 Min.',type:'Süß · vegetarisch'},
 {name:'Gemüse-Rührei',needs:['ei'],optional:['tomate','paprika','spinat','zwiebel','kaese'],steps:'Gemüse klein schneiden und anbraten. Eier verquirlen, dazugeben und stocken lassen.',time:'10 Min.',type:'Herzhaft · proteinreich'},
 {name:'Hähnchen-Reis-Pfanne',needs:['haehnchen','reis'],optional:['brokkoli','paprika','karotte','sojasauce','zwiebel'],steps:'Reis garen. Hähnchen vollständig durchgaren, Gemüse anbraten und mit Reis vermengen.',time:'25 Min.',type:'Herzhaft · proteinreich'},
 {name:'Thunfisch-Pasta',needs:['nudeln','thunfisch'],optional:['tomate','mais','joghurt','zwiebel'],steps:'Nudeln kochen. Thunfisch abtropfen lassen und mit Gemüse sowie etwas Nudelwasser unterheben.',time:'15 Min.',type:'Herzhaft'},
 {name:'Linsen-Tomaten-Pfanne',needs:['linsen','tomate'],optional:['reis','karotte','zwiebel','spinat','kokosmilch'],steps:'Zwiebel und Gemüse anbraten, Linsen und Tomaten zugeben und garen, bis die Linsen weich sind. Vorgekochte Linsen entsprechend kürzer erhitzen.',time:'20–30 Min.',type:'Vegetarisch · ballaststoffreich'},
 {name:'Kartoffel-Topfen-Bowl',needs:['kartoffel','topfen'],optional:['gurke','schnittlauch','joghurt','salat'],steps:'Kartoffeln kochen oder im Ofen garen. Topfen mit etwas Joghurt und Kräutern verrühren und dazu servieren.',time:'25 Min.',type:'Vegetarisch · proteinreich'},
 {name:'Tofu-Gemüse-Pfanne',needs:['tofu'],optional:['reis','brokkoli','paprika','karotte','sojasauce'],steps:'Tofu würfeln und goldbraun braten. Gemüse dazugeben und bissfest garen, nach Wunsch mit Sojasauce würzen.',time:'15 Min.',type:'Vegan'},
 {name:'Kichererbsen-Curry',needs:['kichererbsen'],optional:['tomate','kokosmilch','reis','spinat','zwiebel'],steps:'Zwiebel anbraten, Kichererbsen und Gemüse zugeben. Mit Tomaten oder Kokosmilch köcheln lassen und würzen.',time:'20 Min.',type:'Vegan · sättigend'},
 {name:'Avocado-Ei-Toast',needs:['brot','avocado'],optional:['ei','tomate','frischkaese'],steps:'Brot toasten, Avocado zerdrücken und darauf verteilen. Optional ein Ei braten oder kochen und dazugeben.',time:'8 Min.',type:'Vegetarisch'},
 {name:'Couscous-Gemüse-Bowl',needs:['couscous'],optional:['gurke','tomate','paprika','kichererbsen','feta'],steps:'Couscous mit heißem Wasser quellen lassen. Gemüse würfeln, untermischen und nach Wunsch Feta oder Kichererbsen ergänzen.',time:'10 Min.',type:'Vegetarisch · schnell'},
 {name:'Haferflocken-Porridge',needs:['haferflocken'],optional:['milch','banane','beeren','skyr','zimt'],steps:'Haferflocken mit Milch oder Wasser unter Rühren kurz köcheln. Mit Obst und optional Skyr toppen.',time:'7 Min.',type:'Süß · schnell'},
 {name:'Tomaten-Mozzarella-Brot',needs:['brot','tomate'],optional:['mozzarella','frischkaese','basilikum'],steps:'Brot mit Tomate und Mozzarella belegen, würzen und nach Wunsch kurz überbacken.',time:'8 Min.',type:'Vegetarisch'},
 {name:'Lachs-Reis-Bowl',needs:['lachs','reis'],optional:['gurke','avocado','brokkoli','sojasauce'],steps:'Reis garen. Lachs vollständig durchgaren und mit Gemüse auf dem Reis anrichten.',time:'20 Min.',type:'Herzhaft · proteinreich'}
];
const pantryAliases={haferflocken:['hafer','oats'],skyr:['skyr'],beeren:['beeren','heidelbeeren','erdbeeren','himbeeren'],banane:['banane'],ei:['eier','ei'],milch:['milch'],nuesse:['nuesse','mandeln','walnuesse'],honig:['honig'],zimt:['zimt'],haehnchen:['haehnchen','huhn','huehnchen','pute','putenbrust'],reis:['reis'],brokkoli:['brokkoli'],paprika:['paprika'],karotte:['karotte','karotten','moehre','moehren'],sojasauce:['sojasauce'],zwiebel:['zwiebel','zwiebeln'],nudeln:['nudeln','pasta','spaghetti'],thunfisch:['thunfisch'],tomate:['tomate','tomaten','passata'],mais:['mais'],joghurt:['joghurt'],linsen:['linsen'],spinat:['spinat'],kokosmilch:['kokosmilch'],kartoffel:['kartoffel','kartoffeln'],topfen:['topfen','quark'],gurke:['gurke','gurken'],schnittlauch:['schnittlauch','kraeuter'],salat:['salat'],tofu:['tofu'],kichererbsen:['kichererbsen'],avocado:['avocado'],brot:['brot','toast','vollkornbrot'],frischkaese:['frischkaese'],couscous:['couscous'],feta:['feta'],mozzarella:['mozzarella'],basilikum:['basilikum'],lachs:['lachs']};
function pantryNormalize(value){return String(value||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\\s+/g,' ').trim()}
function pantryHas(ingredient,items){const aliases=pantryAliases[ingredient]||[ingredient];return items.some(item=>aliases.some(alias=>{const a=pantryNormalize(alias);return (' '+item+' ').includes(' '+a+' ')}))}
function suggestFromIngredients(){
 const raw=$('ingredients').value.trim(),out=$('ingredientIdeas');
 if(!raw){out.innerHTML='<div class="notice">Trage zuerst deine Zutaten ein – zum Beispiel: Eier, Reis, Skyr, Tomaten.</div>';return}
 const items=raw.split(/[,;\\n]+/).map(pantryNormalize).filter(Boolean);
 const matches=pantryRecipeIdeas.map(recipe=>{const have=recipe.needs.filter(x=>pantryHas(x,items));const optional=recipe.optional.filter(x=>pantryHas(x,items));const missing=recipe.needs.filter(x=>!have.includes(x));return {...recipe,have,optional,missing,score:have.length+optional.length*.25}}).filter(x=>x.have.length>0).sort((a,b)=>b.score-a.score||a.missing.length-b.missing.length).slice(0,6);
 if(!matches.length){out.innerHTML='<div class="notice">Ich habe noch kein passendes Rezept erkannt. Versuch es mit einfachen Zutaten-Namen, getrennt durch Kommas – z. B. „Eier, Reis, Tomaten“.</div>';return}
 out.innerHTML='<div class="pantry-results-head"><b>'+matches.length+' passende Rezeptideen</b><small>Sortiert nach Zutaten, die du bereits hast</small></div>'+matches.map((r,i)=>'<article class="pantry-recipe"><div class="pantry-recipe-top"><b>'+r.name+'</b><span class="pill">'+r.time+'</span></div><small>'+r.type+'</small><p>'+r.steps+'</p><div class="pantry-ingredient-state"><span><b>Vorhanden:</b> '+[...r.have,...r.optional].map(x=>x.replace(/_/g,' ')).join(', ')+'</span>'+(r.missing.length?'<span><b>Fehlt noch:</b> '+r.missing.join(', ')+'</span>':'<span class="pantry-ready">Du hast die Hauptzutaten dafür!</span>')+'</div></article>').join('');
}
function calcTargets(age,sex,height,weight,activity,goal,sessions,gym){const bmr=10*weight+6.25*height-5*age+(sex==='male'?5:-161);const sportBonus=Math.min(350,Math.max(0,sessions)*55+Math.max(0,gym)*25);const maintenance=Math.round((bmr*activity+sportBonus)/50)*50;let kcal=maintenance+({lean:150,muscle:200,maintain:0,recomp:0,performance:100,endurance:0,strength:100,fatloss:-300,mass:300}[goal]||0);const teen=age<18;if(teen)kcal=maintenance;const protein=Math.round(weight*2);const steps=activity<=1.2?7000:activity<=1.375?8000:activity<=1.55?9000:10000;return{bmr:Math.round(bmr),maintenance,kcal,protein,steps,teen};}
function calculateFitness(){const age=Number($('age').value),height=Number($('height').value),weight=Number($('weight').value);if(!age||!height||!weight||age<13||height<120||weight<30){$('fitnessResult').textContent='Bitte Alter, Größe und Gewicht gültig eintragen.';return null;}const r=calcTargets(age,$('sex').value,height,weight,Number($('activity').value),$('fitnessGoal').value,Number($('sportSessions').value)||0,Number($('gymDays').value)||0);$('fitnessResult').innerHTML='<b>Deine ungefähren Richtwerte</b><br>Erhaltung: '+r.maintenance+' kcal/Tag<br>Zielwert: '+r.kcal+' kcal/Tag<br>Protein: '+r.protein+' g/Tag<br>Schritte: etwa '+r.steps.toLocaleString('de-AT')+' pro Tag<br>Grundumsatz (geschätzt): '+r.bmr+' kcal';$('fitnessAdvice').textContent=r.teen?'Du bist unter 18: Dein Körper wächst noch. Die App setzt bei „Fett verlieren“ deshalb keinen automatischen Kaloriendefizitwert. Bitte besprich Abnehmziele mit Arzt/Ärztin oder Sporternährungsfachkraft.':'Die Werte sind Startschätzungen, keine exakten Vorgaben. Passe sie anhand von Energie, Leistung und längerfristigem Verlauf vorsichtig an.';return r;}
function saveFitnessProfile(){const r=calculateFitness();if(!r)return;const profile={age:Number($('age').value),sex:$('sex').value,height:Number($('height').value),weight:Number($('weight').value),goal:$('fitnessGoal').value,activity:Number($('activity').value),sessions:Number($('sportSessions').value)||0,sports:$('sports').value,gym:Number($('gymDays').value)||0,steps:Number($('currentSteps').value)||r.steps};storage.set('mfit_profile',JSON.stringify(profile));goals={kcal:r.kcal,protein:r.protein};storage.set('mfit_goals',JSON.stringify(goals));$('goalKcal').value=goals.kcal;$('goalProtein').value=goals.protein;render();alert('Dein Profil und deine geschätzten Ziele wurden gespeichert.');}
function saveSetup(){const map=[['setupAge','age'],['setupSex','sex'],['setupHeight','height'],['setupWeight','weight'],['setupGoal','fitnessGoal'],['setupActivity','activity'],['setupSessions','sportSessions'],['setupSports','sports'],['setupGym','gymDays']];map.forEach(([a,b])=>$(b).value=$(a).value);const r=calculateFitness();if(!r)return;saveFitnessProfile();storage.set('mfit_setup_done','1');$('setupOverlay').style.display='none';}
function skipSetup(){storage.set('mfit_setup_done','1');$('setupOverlay').style.display='none';}
function loadProfile(){let p=null;try{p=JSON.parse(storage.get('mfit_profile')||'null')}catch(e){}if(!p||typeof p!=='object')return;const vals={age:p.age,sex:p.sex,height:p.height,weight:p.weight,fitnessGoal:p.goal,activity:p.activity,sportSessions:p.sessions,sports:p.sports,gymDays:p.gym,currentSteps:p.steps};Object.entries(vals).forEach(([k,v])=>{if($(k)&&v!==undefined)$(k).value=v;});if(Number(p.weight)>0){goals.protein=Math.round(Number(p.weight)*2);storage.set('mfit_goals',JSON.stringify(goals));}$('goalKcal').value=goals.kcal;$('goalProtein').value=goals.protein;}

/* MFit product autocomplete: live community product search */
let productSearchResults=[];
let productSearchTimer=null;
let productSearchController=null;

const mfitNutritionTemplates={
 'semmel':{kcal:290,protein:9,carbs:56,fat:2.5,fiber:2.5},
 'kaisersemmel':{kcal:290,protein:9,carbs:56,fat:2.5,fiber:2.5},
 'kornspitz':{kcal:270,protein:10,carbs:48,fat:3.5,fiber:7},
 'mohnflesserl':{kcal:310,protein:10,carbs:48,fat:8,fiber:4},
 'vollkornsemmel':{kcal:265,protein:10,carbs:44,fat:4,fiber:7},
 'weckerl':{kcal:280,protein:9,carbs:53,fat:3,fiber:3},
 'skyr natur':{kcal:63,protein:11,carbs:4,fat:.2,fiber:0,calcium:120,potassium:150},
 'skyr vanille':{kcal:85,protein:10,carbs:9,fat:.2,fiber:0,calcium:110},
 'skyr erdbeere':{kcal:78,protein:10,carbs:7,fat:.2,fiber:.5,calcium:110},
 'skyr heidelbeere':{kcal:78,protein:10,carbs:7,fat:.2,fiber:.5,calcium:110},
 'skyr mango':{kcal:80,protein:10,carbs:8,fat:.2,fiber:.3,calcium:110},
 'magerquark':{kcal:67,protein:12,carbs:4,fat:.2,calcium:90,potassium:130},
 'topfen':{kcal:98,protein:12,carbs:4,fat:4,calcium:90},
 'griechisches joghurt':{kcal:120,protein:6,carbs:4,fat:9,calcium:110},
 'naturjoghurt':{kcal:63,protein:4,carbs:5,fat:3,calcium:120},
 'fruchtjoghurt':{kcal:105,protein:4,carbs:15,fat:3,calcium:120},
 'protein pudding':{kcal:75,protein:10,carbs:6,fat:1,calcium:120},
 'protein joghurt':{kcal:75,protein:10,carbs:6,fat:1,calcium:120},
 'hüttenkäse':{kcal:98,protein:12,carbs:3,fat:4,calcium:80},
 'milch':{kcal:64,protein:3.3,carbs:4.8,fat:3.5,calcium:120,b12:.4},
 'hafermilch':{kcal:46,protein:1,carbs:6.7,fat:1.5,calcium:120},
 'ei':{kcal:143,protein:13,carbs:1.1,fat:9.5,vitd:2,iron:1.8,b12:1.1},
 'eier':{kcal:143,protein:13,carbs:1.1,fat:9.5,vitd:2,iron:1.8,b12:1.1},
 'hähnchenbrust':{kcal:110,protein:23,carbs:0,fat:1.5,vitb12:.3,niacin:13},
 'putenbrust':{kcal:135,protein:24,carbs:0,fat:1.5},
 'rindfleisch':{kcal:170,protein:26,carbs:0,fat:7,iron:2.5,zinc:5,b12:2.5},
 'lachs':{kcal:208,protein:20,carbs:0,fat:13,vitd:11,b12:3.2,potassium:363},
 'thunfisch':{kcal:116,protein:26,carbs:0,fat:1,vitd:2,b12:9},
 'reis':{kcal:130,protein:2.7,carbs:28,fat:.3,fiber:.4},
 'basmatireis':{kcal:130,protein:2.7,carbs:28,fat:.3,fiber:.4},
 'nudeln':{kcal:157,protein:5.8,carbs:30,fat:.9,fiber:1.8},
 'vollkornnudeln':{kcal:149,protein:6,carbs:27,fat:1.5,fiber:4.5},
 'haferflocken':{kcal:372,protein:13.5,carbs:58,fat:7,fiber:10,iron:4.3,magnesium:138,zinc:3.6},
 'müsli':{kcal:370,protein:10,carbs:64,fat:7,fiber:8},
 'cornflakes':{kcal:357,protein:7,carbs:84,fat:.4,fiber:3},
 'kelloggs frosties':{kcal:375,protein:4,carbs:87,fat:.6,fiber:2},
 'kelloggs corn flakes':{kcal:357,protein:7,carbs:84,fat:.4,fiber:3},
 'kelloggs choco krispies':{kcal:385,protein:6,carbs:83,fat:3,fiber:4},
 'brot':{kcal:250,protein:9,carbs:47,fat:3,fiber:3},
 'vollkornbrot':{kcal:230,protein:9,carbs:40,fat:3,fiber:7},
 'toast':{kcal:265,protein:9,carbs:49,fat:3.5,fiber:2.5},
 'banane':{kcal:89,protein:1.1,carbs:23,fat:.3,fiber:2.6,vitc:8.7,potassium:358},
 'apfel':{kcal:52,protein:.3,carbs:14,fat:.2,fiber:2.4,vitc:4.6,potassium:107},
 'erdbeeren':{kcal:32,protein:.7,carbs:7.7,fat:.3,fiber:2,vitc:59},
 'heidelbeeren':{kcal:57,protein:.7,carbs:14.5,fat:.3,fiber:2.4,vitc:9.7},
 'avocado':{kcal:160,protein:2,carbs:8.5,fat:14.7,fiber:6.7,potassium:485},
 'gurke':{kcal:15,protein:.7,carbs:3.6,fat:.1,fiber:.5,vitc:2.8},
 'tomaten':{kcal:18,protein:.9,carbs:3.9,fat:.2,fiber:1.2,vitc:14},
 'paprika':{kcal:31,protein:1,carbs:6,fat:.3,fiber:2.1,vitc:127},
 'brokkoli':{kcal:34,protein:2.8,carbs:6.6,fat:.4,fiber:2.6,vitc:89,calcium:47},
 'karotten':{kcal:41,protein:.9,carbs:9.6,fat:.2,fiber:2.8,vitc:5.9},
 'kartoffeln':{kcal:77,protein:2,carbs:17,fat:.1,fiber:2.2,potassium:425},
 'pecannüsse':{kcal:691,protein:9,carbs:14,fat:72,fiber:9.6,sugar:4},
 'macadamianüsse':{kcal:718,protein:8,carbs:14,fat:76,fiber:8.6,sugar:4.6},
 'paranüsse':{kcal:659,protein:14,carbs:12,fat:67,fiber:7.5,sugar:2.3},
 'erdnüsse':{kcal:567,protein:26,carbs:16,fat:49,fiber:8.5,sugar:4},
 'pinienkerne':{kcal:673,protein:14,carbs:13,fat:68,fiber:3.7,sugar:3.6},
 'mandeln':{kcal:579,protein:21,carbs:22,fat:50,fiber:12.5,magnesium:270,calcium:269,sugar:4.4},
 'erdnussbutter':{kcal:588,protein:25,carbs:20,fat:50,fiber:6},
 'schokolade':{kcal:535,protein:7.5,carbs:59,fat:30,fiber:7},
 'chips':{kcal:536,protein:7,carbs:52,fat:35,fiber:4},
 'cola zero':{kcal:0,protein:0,carbs:0,fat:0,fiber:0},
 'coca-cola':{kcal:42,protein:0,carbs:10.6,fat:0,fiber:0},
 'pepsi max':{kcal:0,protein:0,carbs:0,fat:0,fiber:0},
 'red bull sugarfree':{kcal:3,protein:0,carbs:0,fat:0,fiber:0},
 'monster ultra':{kcal:2,protein:0,carbs:.5,fat:0,fiber:0},
 'wasser':{kcal:0,protein:0,carbs:0,fat:0,fiber:0},
 'mineralwasser':{kcal:0,protein:0,carbs:0,fat:0,fiber:0},
 'eistee zero':{kcal:1,protein:0,carbs:0,fat:0,fiber:0},
 'putenfarmerschinken':{kcal:105,protein:20,carbs:1.5,fat:2.2,fiber:0},
 'puten-farmerschinken':{kcal:105,protein:20,carbs:1.5,fat:2.2,fiber:0},
 'puten-formschninken':{kcal:105,protein:20,carbs:1.5,fat:2.2,fiber:0},
 'putenschinken':{kcal:105,protein:20,carbs:1.5,fat:2.2,fiber:0},
 'putenbrust aufschnitt':{kcal:105,protein:20,carbs:1.5,fat:2.2,fiber:0},
 'hühnerbrust aufschnitt':{kcal:105,protein:21,carbs:1,fat:1.8,fiber:0},
 'hühnerfarmerschinken':{kcal:105,protein:20,carbs:1.5,fat:2.2,fiber:0},
 'farmerschinken':{kcal:115,protein:19,carbs:1,fat:3.5,fiber:0},
 'schwarzwälder schinken':{kcal:220,protein:26,carbs:0.5,fat:10,fiber:0},
 'kochschinken':{kcal:115,protein:20,carbs:1,fat:3,fiber:0},
 'beinschinken':{kcal:115,protein:20,carbs:1,fat:3,fiber:0},
 'toastschinken':{kcal:110,protein:19,carbs:1,fat:3,fiber:0},
 'prosciutto':{kcal:260,protein:26,carbs:0.5,fat:17,fiber:0},
 'parmaschinken':{kcal:270,protein:26,carbs:0.5,fat:18,fiber:0},
 'roher schinken':{kcal:240,protein:27,carbs:0.5,fat:14,fiber:0},
 'extrawurst':{kcal:250,protein:12,carbs:1,fat:22,fiber:0},
 'pikante extrawurst':{kcal:260,protein:12,carbs:1,fat:23,fiber:0},
 'polnische':{kcal:280,protein:14,carbs:2,fat:24,fiber:0},
 'krakauer':{kcal:280,protein:14,carbs:2,fat:24,fiber:0},
 'putenwurst':{kcal:125,protein:17,carbs:2,fat:5,fiber:0},
 'putenextrawurst':{kcal:125,protein:17,carbs:2,fat:5,fiber:0},
 'putensalami':{kcal:250,protein:22,carbs:2,fat:17,fiber:0},
 'salami':{kcal:380,protein:22,carbs:1,fat:32,fiber:0},
 'schinkenwurst':{kcal:250,protein:13,carbs:2,fat:21,fiber:0},
 'leberkäse':{kcal:290,protein:12,carbs:2,fat:26,fiber:0},
 'fleischkäse':{kcal:290,protein:12,carbs:2,fat:26,fiber:0},
 'frankfurter':{kcal:290,protein:12,fat:26,carbs:1,fiber:0},
 'debreziner':{kcal:300,protein:13,carbs:2,fat:26,fiber:0},
 'wiener würstel':{kcal:290,protein:12,carbs:1,fat:26,fiber:0},
 'käsekrainer':{kcal:320,protein:15,carbs:2,fat:27,fiber:0},
 'bratwurst':{kcal:300,protein:14,carbs:1,fat:26,fiber:0},
 'putenfrankfurter':{kcal:180,protein:16,carbs:2,fat:12,fiber:0},
 'hühnerwürstel':{kcal:190,protein:16,carbs:2,fat:13,fiber:0},
 'cheddar':{kcal:400,protein:25,carbs:1.3,fat:33,fiber:0,calcium:720},
 'bergkäse':{kcal:380,protein:27,carbs:0.5,fat:30,fiber:0,calcium:800},
 'frischkäse light':{kcal:150,protein:8,carbs:5,fat:10,fiber:0},
 'körniger frischkäse':{kcal:98,protein:12,carbs:3,fat:4,fiber:0,calcium:80},
 'proteinbrot':{kcal:250,protein:20,carbs:14,fat:10,fiber:10},
 'eiweißbrot':{kcal:250,protein:20,carbs:14,fat:10,fiber:10},
 'roggenbrot':{kcal:220,protein:6,carbs:43,fat:1.5,fiber:6},
 'mischbrot':{kcal:240,protein:8,carbs:46,fat:2,fiber:4},
 'kürbiskernbrot':{kcal:270,protein:10,carbs:40,fat:7,fiber:6},
 'dinkelbrot':{kcal:245,protein:9,carbs:45,fat:2.5,fiber:5},
 'bagel':{kcal:270,protein:10,carbs:53,fat:2,fiber:2},
 'baguette':{kcal:270,protein:9,carbs:55,fat:1.5,fiber:2},
 'ciabatta':{kcal:270,protein:9,carbs:52,fat:3,fiber:2},
 'rinderfaschiertes':{kcal:190,protein:20,carbs:0,fat:12,fiber:0},
 'hühnerfaschiertes':{kcal:145,protein:20,carbs:0,fat:7,fiber:0},
 'putenfaschiertes':{kcal:150,protein:21,carbs:0,fat:7,fiber:0},
 'schweinsfilet':{kcal:120,protein:22,carbs:0,fat:3,fiber:0},
 'hühnerkeule':{kcal:185,protein:24,carbs:0,fat:10,fiber:0},
 'hühnerfilet':{kcal:110,protein:23,carbs:0,fat:1.5,fiber:0},
 'hühnerstreifen':{kcal:110,protein:23,carbs:0,fat:1.5,fiber:0},
 'putenfilet':{kcal:135,protein:24,carbs:0,fat:1.5,fiber:0},
 'speck':{kcal:450,protein:15,carbs:0.5,fat:43,fiber:0},
 'bacon':{kcal:450,protein:15,carbs:0.5,fat:43,fiber:0},
 'quinoa':{kcal:120,protein:4.4,carbs:21,fat:1.9,fiber:2.8},
 'couscous':{kcal:112,protein:3.8,carbs:23,fat:.2,fiber:1.4},
 'bulgur':{kcal:83,protein:3.1,carbs:18.6,fat:.2,fiber:4.5},
 'gnocchi':{kcal:150,protein:3.5,carbs:31,fat:.5,fiber:2},
 'spätzle':{kcal:150,protein:5.5,carbs:27,fat:2,fiber:1.5},
 'tortellini':{kcal:280,protein:12,carbs:38,fat:8,fiber:2},
 'kidneybohnen':{kcal:110,protein:8,carbs:16,fat:.5,fiber:7},
 'edamame':{kcal:121,protein:12,carbs:9,fat:5,fiber:5},
 'zucchini':{kcal:17,protein:1.2,carbs:3.1,fat:.3,fiber:1},
 'champignons':{kcal:22,protein:3.1,carbs:3.3,fat:.3,fiber:1},
 'zwiebel':{kcal:40,protein:1.1,carbs:9.3,fat:.1,fiber:1.7},
 'blumenkohl':{kcal:25,protein:1.9,carbs:5,fat:.3,fiber:2},
 'sauerkraut':{kcal:19,protein:.9,carbs:4.3,fat:.1,fiber:2.9},
 'rote rüben':{kcal:43,protein:1.6,carbs:10,fat:.2,fiber:2.8},
 'birne':{kcal:57,protein:.4,carbs:15,fat:.1,fiber:3.1},
 'trauben':{kcal:69,protein:.7,carbs:18,fat:.2,fiber:.9},
 'mango':{kcal:60,protein:.8,carbs:15,fat:.4,fiber:1.6},
 'walnüsse':{kcal:654,protein:15,carbs:14,fat:65,fiber:6.7},
 'cashews':{kcal:553,protein:18,carbs:30,fat:44,fiber:3.3},
 'haselnüsse':{kcal:628,protein:15,carbs:17,fat:61,fiber:9.7},
 'pistazien':{kcal:562,protein:20,carbs:28,fat:45,fiber:10},
 'studentenfutter':{kcal:480,protein:14,carbs:45,fat:30,fiber:7},
 'nutella':{kcal:539,protein:6.3,carbs:58,fat:31,fiber:3.4},
 'reiswaffel':{kcal:387,protein:8,carbs:81,fat:3,fiber:4},
 'kefir':{kcal:55,protein:3.5,carbs:4.5,fat:2.5,fiber:0},
 'buttermilch':{kcal:38,protein:3.4,carbs:4.8,fat:.5,fiber:0},
 'sauerrahm':{kcal:160,protein:3,carbs:4,fat:15,fiber:0},
 'crème fraîche':{kcal:290,protein:2.5,carbs:3,fat:30,fiber:0},
 'schlagobers':{kcal:300,protein:2,carbs:3,fat:32,fiber:0},
 'light mayonnaise':{kcal:270,protein:1,carbs:8,fat:25,fiber:0},
 'ketchup':{kcal:100,protein:1.5,carbs:23,fat:.2,fiber:.5},
 'hummus':{kcal:240,protein:8,carbs:14,fat:17,fiber:6},
 'guacamole':{kcal:150,protein:2,carbs:8,fat:13,fiber:6},

 'billa protein mousse schoko':{kcal:78,protein:10,carbs:6,fat:1.5},
 'billa protein double choco':{kcal:85,protein:10,carbs:7,fat:2},
 'billa protein topfencreme vanille schoko':{kcal:105,protein:9,carbs:11,fat:2.5},
 'billa protein topfencreme erdbeere':{kcal:95,protein:9,carbs:10,fat:1.5},
 'billa protein naturjoghurt':{kcal:60,protein:10,carbs:4,fat:.5},
 'billa protein toast':{kcal:260,protein:20,carbs:27,fat:7,fiber:8},
 'billa proteindrink kakao':{kcal:62,protein:7,carbs:6,fat:1.5},
 'billa proteindrink vanille':{kcal:62,protein:7,carbs:6,fat:1.5},
 'billa high protein butter chicken':{kcal:145,protein:9,carbs:13,fat:6},
 'billa high protein pasta hähnchen und gemüse':{kcal:145,protein:10,carbs:18,fat:4},
 'billa high protein kürbis orzo hähnchen':{kcal:135,protein:9,carbs:17,fat:3.5},
 'billa high protein chicken tikka masala':{kcal:140,protein:9,carbs:12,fat:6},
 'billa high protein pasta chicken alfredo':{kcal:165,protein:10,carbs:17,fat:6},
 'billa high protein linsenbolognese':{kcal:125,protein:8,carbs:17,fat:2},
 'schärdinger protein käse-kugel':{kcal:280,protein:28,carbs:2,fat:17},
 'schärdinger protein mozzarella leicht':{kcal:170,protein:25,carbs:2,fat:7},
 'schärdinger protein bergbaron scheiben':{kcal:280,protein:30,carbs:1,fat:17},
 'dr. oetker high protein milchreis':{kcal:105,protein:7,carbs:15,fat:2},
 'dr. oetker high protein pudding grieß':{kcal:110,protein:7,carbs:16,fat:2},
 'dr. oetker high protein pudding grieß schoko':{kcal:115,protein:7,carbs:17,fat:2.5},
 'ehrmann high protein pudding karamell':{kcal:78,protein:10,carbs:6,fat:1.5},
 'ehrmann high protein pudding haselnuss':{kcal:82,protein:10,carbs:6,fat:2},
 'ehrmann high protein pudding vanille':{kcal:76,protein:10,carbs:5.5,fat:1.5},
 'ehrmann high protein mousse vanille':{kcal:80,protein:10,carbs:6,fat:2},
 'ehrmann high protein mousse lemon':{kcal:80,protein:10,carbs:7,fat:1.5},
 'noem pro proteinmilch':{kcal:62,protein:7,carbs:5,fat:1.5},
 'noem pro vanille proteindrink':{kcal:62,protein:7,carbs:6,fat:1.5},
 'noem pro kakao proteindrink':{kcal:65,protein:7,carbs:6,fat:1.8},
 'noem pro banane proteindrink':{kcal:63,protein:7,carbs:6,fat:1.5},
 'noem pro erdbeere proteindrink':{kcal:63,protein:7,carbs:6,fat:1.5},
 'noem pro salted caramel proteindrink':{kcal:65,protein:7,carbs:6,fat:1.8},
 'noem pro protein skyr':{kcal:65,protein:11,carbs:4,fat:.2},
 'noem pro vanille protein skyr':{kcal:80,protein:10,carbs:7,fat:.2},
 'noem pro vanille protein topfencreme':{kcal:95,protein:9,carbs:9,fat:1.5},
 'noem pro blueberry cheesecake protein topfencreme':{kcal:100,protein:9,carbs:10,fat:2},
 'noem pro stracciatella protein topfencreme':{kcal:105,protein:9,carbs:11,fat:2.5},
 'noem pro schoko-banane protein topfencreme':{kcal:100,protein:9,carbs:10,fat:2},
 'emmi caffe latte protein':{kcal:55,protein:6,carbs:6,fat:1},
 'alpro protein joghurt mango-banane':{kcal:75,protein:5,carbs:9,fat:2.5},
 'oelz protein waffeln':{kcal:420,protein:20,carbs:48,fat:15},
 'mini babybel protein':{kcal:270,protein:27,carbs:1,fat:17},

 'nöm pro proteinmilch':{kcal:62,protein:7,carbs:5,fat:1.5},'nöm pro vanille proteindrink':{kcal:62,protein:7,carbs:6,fat:1.5},'nöm pro kakao proteindrink':{kcal:65,protein:7,carbs:6,fat:1.8},'nöm pro banane proteindrink':{kcal:63,protein:7,carbs:6,fat:1.5},'nöm pro erdbeere proteindrink':{kcal:63,protein:7,carbs:6,fat:1.5},'nöm pro salted caramel proteindrink':{kcal:65,protein:7,carbs:6,fat:1.8},'nöm pro protein skyr':{kcal:65,protein:11,carbs:4,fat:.2},'nöm pro vanille protein skyr':{kcal:80,protein:10,carbs:7,fat:.2},'nöm pro vanille protein topfencreme':{kcal:95,protein:9,carbs:9,fat:1.5},'nöm pro blueberry cheesecake protein topfencreme':{kcal:100,protein:9,carbs:10,fat:2},'nöm pro stracciatella protein topfencreme':{kcal:105,protein:9,carbs:11,fat:2.5},'nöm pro schoko-banane protein topfencreme':{kcal:100,protein:9,carbs:10,fat:2},'emmi caffè latte protein':{kcal:55,protein:6,carbs:6,fat:1},'ölz protein waffeln':{kcal:420,protein:20,carbs:48,fat:15},
};
const mfitSugarOverrides={
 'banane':{sugar:12.2,addedSugar:0},'apfel':{sugar:10.4,addedSugar:0},'erdbeeren':{sugar:4.9,addedSugar:0},'heidelbeeren':{sugar:10,addedSugar:0},
 'orange':{sugar:9.4,addedSugar:0},'kiwi':{sugar:9,addedSugar:0},'birne':{sugar:9.8,addedSugar:0},'trauben':{sugar:15.5,addedSugar:0},'mango':{sugar:13.7,addedSugar:0},
 'skyr natur':{sugar:4,addedSugar:0},'skyr vanille':{sugar:9,addedSugar:4},'naturjoghurt':{sugar:5,addedSugar:0},'milch':{sugar:4.8,addedSugar:0},
 'fruchtjoghurt':{sugar:12,addedSugar:7},'protein pudding':{sugar:5,addedSugar:1},'haferflocken':{sugar:1,addedSugar:0},
 'cornflakes':{sugar:8,addedSugar:7},'kelloggs frosties':{sugar:37,addedSugar:35},'müsli':{sugar:15,addedSugar:8},'granola':{sugar:20,addedSugar:12},
 'coca-cola':{sugar:10.6,addedSugar:10.6},'orangensaft':{sugar:8.4,addedSugar:0,freeSugar:8.4},'apfelsaft':{sugar:9.6,addedSugar:0,freeSugar:9.6},
 'honig':{sugar:82,addedSugar:0,freeSugar:82},'ahornsirup':{sugar:60,addedSugar:0,freeSugar:60},'nutella':{sugar:56,addedSugar:52},'marmelade':{sugar:55,addedSugar:50},
 'schokolade':{sugar:52,addedSugar:48},'proteinriegel':{sugar:20,addedSugar:12},'müsliriegel':{sugar:25,addedSugar:18}
};
Object.keys(mfitSugarOverrides).forEach(k=>{if(mfitNutritionTemplates[k])Object.assign(mfitNutritionTemplates[k],mfitSugarOverrides[k]);else mfitNutritionTemplates[k]=mfitSugarOverrides[k]});
const mfitDefaultPortions={
 'skyr':200,'magerquark':250,'topfen':150,'joghurt':150,'protein pudding':200,'hüttenkäse':150,
 'milch':250,'hafermilch':250,'ei':100,'eier':100,'hähnchenbrust':150,'putenbrust':150,'rindfleisch':150,'lachs':150,'thunfisch':100,
 'reis':150,'nudeln':180,'haferflocken':50,'müsli':50,'cornflakes':40,'kelloggs':40,'brot':60,'toast':30,'semmel':60,'kaisersemmel':60,'kornspitz':75,'mohnflesserl':70,'vollkornsemmel':70,'weckerl':70,
 'banane':120,'apfel':150,'erdbeeren':150,'heidelbeeren':100,'avocado':70,'gurke':100,'tomaten':100,'paprika':100,'brokkoli':100,'karotten':100,'kartoffeln':200,'mandeln':25,'erdnussbutter':15,'schokolade':25,'chips':30,
 'cola':330,'pepsi':330,'red bull':250,'monster':500,'wasser':500,'eistee':500,
 'putenfarmerschinken':30,'puten-farmerschinken':30,'putenschinken':30,'putenbrust aufschnitt':30,'hühnerbrust aufschnitt':30,'farmerschinken':30,'kochschinken':30,'beinschinken':30,'toastschinken':30,'prosciutto':25,'parmaschinken':25,'roher schinken':25,'extrawurst':30,'pikante extrawurst':30,'polnische':50,'krakauer':50,'putenwurst':30,'putensalami':25,'salami':25,'schinkenwurst':30,'leberkäse':100,'fleischkäse':100,'frankfurter':100,'debreziner':100,'käsekrainer':100,'bratwurst':100,'putenfrankfurter':100,'hühnerwürstel':100,
 'cheddar':25,'bergkäse':25,'frischkäse':20,'körniger frischkäse':150,'proteinbrot':60,'eiweißbrot':60,'roggenbrot':60,'mischbrot':60,'bagel':90,'baguette':60,'ciabatta':60,'rinderfaschiertes':150,'hühnerfaschiertes':150,'putenfaschiertes':150,'schweinsfilet':150,'hühnerkeule':150,'hühnerfilet':150,'hühnerstreifen':150,'putenfilet':150,'speck':20,'bacon':20,'quinoa':150,'couscous':150,'bulgur':150,'gnocchi':200,'spätzle':200,'tortellini':200,'kidneybohnen':100,'edamame':100,'zucchini':100,'champignons':100,'zwiebel':50,'blumenkohl':100,'sauerkraut':100,'rote rüben':100,'birne':150,'trauben':100,'mango':150,'walnüsse':25,'cashews':25,'haselnüsse':25,'pistazien':25,'pecannüsse':25,'macadamianüsse':25,'paranüsse':20,'erdnüsse':25,'pinienkerne':20,'studentenfutter':30,'nutella':15,'reiswaffel':10,'kefir':250,'buttermilch':250,'sauerrahm':30,'crème fraîche':30,'schlagobers':30,'light mayonnaise':15,'hummus':40,'guacamole':40,
 'billa protein mousse schoko':200,'billa protein double choco':200,'billa protein topfencreme vanille schoko':180,'billa protein topfencreme erdbeere':180,'billa protein naturjoghurt':200,'billa protein toast':60,'billa proteindrink kakao':250,'billa proteindrink vanille':250,
 'billa high protein butter chicken':350,'billa high protein pasta hähnchen und gemüse':350,'billa high protein kürbis orzo hähnchen':350,'billa high protein chicken tikka masala':350,'billa high protein pasta chicken alfredo':350,'billa high protein linsenbolognese':350,
 'schärdinger protein käse-kugel':100,'schärdinger protein mozzarella leicht':125,'schärdinger protein bergbaron scheiben':30,
 'dr. oetker high protein milchreis':400,'dr. oetker high protein pudding grieß':400,'dr. oetker high protein pudding grieß schoko':400,
 'ehrmann high protein pudding karamell':200,'ehrmann high protein pudding haselnuss':200,'ehrmann high protein pudding vanille':200,'ehrmann high protein mousse vanille':200,'ehrmann high protein mousse lemon':200,
 'noem pro proteinmilch':250,'noem pro vanille proteindrink':250,'noem pro kakao proteindrink':250,'noem pro banane proteindrink':250,'noem pro erdbeere proteindrink':250,'noem pro salted caramel proteindrink':250,'noem pro protein skyr':200,'noem pro vanille protein skyr':200,
 'noem pro vanille protein topfencreme':180,'noem pro blueberry cheesecake protein topfencreme':180,'noem pro stracciatella protein topfencreme':180,'noem pro schoko-banane protein topfencreme':180,
 'emmi caffe latte protein':230,'alpro protein joghurt mango-banane':150,'oelz protein waffeln':45,'mini babybel protein':20,

};
function mfitTemplateForName(name){
 const n=String(name||'').toLowerCase();
 const exact=mfitNutritionTemplates[n];if(exact)return exact;
 const key=Object.keys(mfitNutritionTemplates).sort((a,b)=>b.length-a.length).find(k=>n.includes(k));
 return key?mfitNutritionTemplates[key]:null;
}
function mfitDefaultAmount(name,isDrink){
 const n=String(name||'').toLowerCase();
 const key=Object.keys(mfitDefaultPortions).sort((a,b)=>b.length-a.length).find(k=>n.includes(k));
 return key?mfitDefaultPortions[key]:(isDrink?250:100);
}
function setNutritionFromTemplate(t){
 nutritionBase={kcal:Number(t.kcal)||0,protein:Number(t.protein)||0,carbs:Number(t.carbs)||0,fat:Number(t.fat)||0,fiber:Number(t.fiber)||0,sugar:Number(t.sugar)||0,addedSugar:Number(t.addedSugar)||0,freeSugar:Number(t.freeSugar??t.addedSugar)||0,vitc:Number(t.vitc)||0,vitd:Number(t.vitd)||0,calcium:Number(t.calcium)||0,iron:Number(t.iron)||0,magnesium:Number(t.magnesium)||0,potassium:Number(t.potassium)||0,zinc:Number(t.zinc)||0,b12:Number(t.b12)||0};
 recalculateNutrition();
}

const mfitFoodCatalog=[
'BILLA Protein Mousse Schoko','BILLA Protein Double Choco','BILLA Protein Topfencreme Vanille Schoko','BILLA Protein Topfencreme Erdbeere','BILLA Protein Naturjoghurt','BILLA Protein Toast','BILLA Proteindrink Kakao','BILLA Proteindrink Vanille','BILLA High Protein Butter Chicken','BILLA High Protein Pasta Hähnchen und Gemüse','BILLA High Protein Kürbis Orzo Hähnchen','BILLA High Protein Chicken Tikka Masala','BILLA High Protein Pasta Chicken Alfredo','BILLA High Protein Linsenbolognese',
'Schärdinger Protein Käse-Kugel','Schärdinger Protein Mozzarella leicht','Schärdinger Protein Bergbaron Scheiben','Dr. Oetker High Protein Milchreis','Dr. Oetker High Protein Pudding Grieß','Dr. Oetker High Protein Pudding Grieß Schoko','Ehrmann High Protein Pudding Karamell','Ehrmann High Protein Pudding Haselnuss','Ehrmann High Protein Pudding Vanille','Ehrmann High Protein Mousse Vanille','Ehrmann High Protein Mousse Lemon',
'nöm PRO Proteinmilch','nöm PRO Vanille Proteindrink','nöm PRO Kakao Proteindrink','nöm PRO Banane Proteindrink','nöm PRO Erdbeere Proteindrink','nöm PRO Salted Caramel Proteindrink','nöm PRO Protein Skyr','nöm PRO Vanille Protein Skyr','nöm PRO Vanille Protein Topfencreme','nöm PRO Blueberry Cheesecake Protein Topfencreme','nöm PRO Stracciatella Protein Topfencreme','nöm PRO Schoko-Banane Protein Topfencreme','Emmi Caffè Latte Protein','Alpro Protein Joghurt Mango-Banane','Ölz Protein Waffeln','Mini Babybel Protein',
'MILSANI High Protein Mousse Vanille','MILSANI High Protein Mousse Schoko','MILSANI XXL High Protein Drink Schokolade','MILSANI XXL High Protein Drink Erdbeere','MILSANI Protein Naturjoghurt','MILSANI High Protein Joghurt Erdbeere','MILSANI Protein Shot Erdbeere','MILSANI High Protein Pudding Schoko','ALDI SPORTS Protein Coffee Pulver','GOLDEN BRIDGE Protein Granola','GOLDEN BRIDGE Protein Hafer Cubes','HAPPY HARVEST Protein Knäcke','NATURE VALLEY Protein Riegel Salted Caramel','NATURE VALLEY Protein Riegel Peanut Chocolate','LAYENBERGER 3K Crunchy Riegel','MULTIPOWER Protein Layer Riegel Cookies & Cream','MULTIPOWER Protein Layer Riegel White Choco Salty Almond','EHRMANN High Protein Pudding Schoko','EHRMANN High Protein Mousse','BILLA immer gut Protein Vanillepudding','BILLA immer gut Protein Caffe Latte','SPAR High Protein Joghurt Natur','MILBONA High Protein Pudding Schoko','CRANE High Protein Pudding Schoko','MEVGAL High Protein Joghurt','NOEM Pro 35 High Protein Drink Banane','SCHAERDINGER Protein Traum Kakao','ALPRO Protein Drink Schokolade','LATTELLA Proteinmolke',
'Skyr natur','Skyr Vanille','Skyr Erdbeere','Skyr Heidelbeere','Skyr Mango','Magerquark','Topfen','Griechisches Joghurt','Naturjoghurt','Fruchtjoghurt','Protein Pudding','Protein Joghurt','Hüttenkäse','Cottage Cheese','Milch','Hafermilch','Kakao','Eier','Eiklar','Hähnchenbrust','Putenbrust','Rindfleisch','Lachs','Thunfisch','Schinken','Salami','Käse','Mozzarella','Gouda','Emmentaler','Butter','Frischkäse','Tofu','Linsen','Kichererbsen','Bohnen','Reis','Basmatireis','Vollkornreis','Nudeln','Vollkornnudeln','Haferflocken','Müsli','Cornflakes','Kelloggs Frosties','Kelloggs Corn Flakes','Kelloggs Choco Krispies','Granola','Brot','Vollkornbrot','Toast','Semmel','Kaisersemmel','Kornspitz','Mohnflesserl','Vollkornsemmel','Weckerl','Mohnweckerl','Vollkornweckerl','Laugenstange','Breze','Wrap','Tortilla','Banane','Apfel','Erdbeeren','Heidelbeeren','Himbeeren','Orange','Kiwi','Avocado','Gurke','Tomaten','Paprika','Brokkoli','Karotten','Kartoffeln','Süßkartoffeln','Salat','Spinat','Mais','Erbsen','Nüsse','Mandeln','Erdnussbutter','Honig','Marmelade','Schokolade','Proteinriegel','Müsliriegel','Chips','Reiswaffeln','Popcorn','Pizza','Pommes','Sushi','Cola Zero','Coca-Cola','Pepsi Max','Red Bull Sugarfree','Monster Ultra','Wasser','Mineralwasser','Eistee Zero','Orangensaft','Apfelsaft','Kaffee','Cappuccino','Energy Drink','Iso Drink','Butterkäse','Parmesan','Feta','Skyr Drink','Proteindrink','Milchreis','Grießbrei','Pudding','Porridge','Sauerteigbrot','Knäckebrot','Kürbiskerne','Chiasamen','Leinsamen','Olivenöl','Rapsöl','Ketchup','Senf','Hummus','Guacamole',
'Putenfarmerschinken','Puten-Farmerschinken','Puten-Formschninken','Putenschinken','Putenbrust Aufschnitt','Hühnerbrust Aufschnitt','Hühnerfarmerschinken','Farmerschinken','Schwarzwälder Schinken','Kochschinken','Beinschinken','Toastschinken','Prosciutto','Parmaschinken','Roher Schinken','Extrawurst','Pikante Extrawurst','Polnische','Krakauer','Putenwurst','Putenextrawurst','Putensalami','Salami mild','Salami scharf','Haussalami','Schinkenwurst','Leberkäse','Fleischkäse','Frankfurter','Debreziner','Wiener Würstel','Käsekrainer','Bratwurst','Putenfrankfurter','Hühnerwürstel',
'Butterkäse Scheiben','Gouda Scheiben','Emmentaler Scheiben','Toastkäse','Cheddar','Bergkäse','Frischkäse light','Philadelphia','Körniger Frischkäse','Parmesan gerieben','Feta light','Mozzarella light',
'Proteinbrot','Eiweißbrot','Roggenbrot','Mischbrot','Kürbiskernbrot','Dinkelbrot','Pita','Bagel','Baguette','Ciabatta','Pizzasemmel','Käseweckerl','Schinken-Käse-Semmel',
'Rinderfaschiertes','Hühnerfaschiertes','Putenfaschiertes','Schweinefleisch','Schweinsfilet','Hühnerkeule','Hühnerfilet','Hühnerstreifen','Putenfilet','Hendlbrust','Speck','Bacon',
'Kartoffelpüree','Couscous','Quinoa','Bulgur','Polenta','Gnocchi','Spätzle','Tortellini','Lasagne','Tomatensauce','Pesto','Passierte Tomaten',
'Kidneybohnen','Weiße Bohnen','Rote Linsen','Kichererbsen gekocht','Edamame','Mais aus der Dose',
'Zucchini','Champignons','Zwiebel','Knoblauch','Blumenkohl','Kraut','Rotkraut','Sauerkraut','Rote Rüben','Spargel','Fisolen','Oliven',
'Birne','Trauben','Ananas','Mango','Melone','Pfirsich','Nektarine','Mandarine','Zitrone',
'Walnüsse','Cashews','Haselnüsse','Pistazien','Pecannüsse','Macadamianüsse','Paranüsse','Erdnüsse','Pinienkerne','Studentenfutter','Sonnenblumenkerne','Kürbiskerne','Sesam','Chiasamen','Leinsamen',
'Honig','Ahornsirup','Nutella','Marmelade','Fruchtaufstrich','Reiswaffel','Maiswaffeln','Zwieback','Salzstangerl','Laugenbrezel',
'Skyr Drink','Proteindrink Vanille','Proteindrink Schoko','Buttermilch','Kefir','Laktosefreie Milch','Eiskaffee','Latte Macchiato','Kakao light','Apfelschorle','Orangensaft frisch',
'Tomatenmark','Mayonnaise','Light Mayonnaise','BBQ Sauce','Sojasauce','Balsamico','Sauerrahm','Crème fraîche','Schlagobers','Hefeflocken','Gemüsebrühe'
];
function getLocalProductSuggestions(query){
 const q=String(query||'').trim().toLocaleLowerCase('de');
 const seen=new Set(),items=[];
 const add=(name,source='Katalog')=>{
  const clean=String(name||'').trim();if(!clean)return;
  const key=clean.toLocaleLowerCase('de');if(seen.has(key))return;seen.add(key);
  items.push({product_name:clean,product_name_de:clean,brands:source==='Zuletzt verwendet'?'Deine Einträge':'',nutriments:{},categories:'Lebensmittel',stores:source,local:true});
 };
 const norm=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/ß/g,'ss').trim();
 const aliases={'semmel':['Semmel','Kaisersemmel','Kornspitz','Mohnflesserl','Vollkornsemmel'],'kaisersemmel':['Kaisersemmel','Semmel'],'weckerl':['Weckerl','Kornspitz','Mohnweckerl','Vollkornweckerl'],'brot':['Brot','Mischbrot','Roggenbrot','Vollkornbrot','Sauerteigbrot'],'apfel':['Apfel','Äpfel'],'ei':['Ei','Eier']};
 const aliasMatches=Object.entries(aliases).filter(([k])=>norm(k).startsWith(norm(q))||norm(q).startsWith(norm(k))).flatMap(([,v])=>v);
 const matches=mfitFoodCatalog.filter(n=>!q||norm(n).startsWith(norm(q))||norm(n).split(/[\\s-]+/).some(w=>norm(w).startsWith(norm(q))));
 const secondary=mfitFoodCatalog.filter(n=>q&&!matches.includes(n)&&norm(n).includes(norm(q)));
 [...aliasMatches,...matches,...secondary].forEach(n=>add(n,'Häufige Lebensmittel'));
 const recent=[];
 data.slice().reverse().forEach(e=>{if(e.name&&!recent.some(x=>norm(x)===norm(e.name)))recent.push(String(e.name));});
 recent.filter(n=>!q||norm(n).includes(norm(q))).slice(0,8).forEach(n=>add(n,'Zuletzt verwendet'));
 return items.slice(0,30);
}
function searchProductSuggestions(query){productSearchResults=getLocalProductSuggestions(query);renderProductSuggestions(productSearchResults);}
function renderProductSuggestions(products){
 const box=$('productSuggestions');if(!box)return;
 if(!products.length){box.hidden=false;box.innerHTML='<div class="suggestion-status">Noch keine passenden Vorschläge. Du kannst den Produktnamen trotzdem selbst eintragen.</div>';return;}
 box.hidden=false;
 box.innerHTML=products.map((p,i)=>{
  const name=p.product_name_de||p.product_name||p.generic_name||'Produkt',brand=p.brands||'';
  const meta=p.stores==='Zuletzt verwendet'?'🕘 Zuletzt verwendet':'🥗 Häufig gesucht';
  return '<button type="button" class="product-suggestion" role="option" onclick="selectProductSuggestion('+i+')"><span class="suggestion-main"><b>'+esc(name)+'</b><span class="suggestion-brand">'+esc(brand||meta)+'</span></span><span class="suggestion-nutrition">'+(brand?'Marke':'Lebensmittel')+'</span></button>';
 }).join('');
}
function selectProductSuggestion(index){
 const p=productSearchResults[index];if(!p)return;
 const name=p.product_name_de||p.product_name||p.generic_name||'Produkt';
 $('foodName').value=(p.brands?p.brands+' – ':'')+name;
 if($('barcode'))$('barcode').value=p.code||'';
 const cats=String(p.categories||'').toLowerCase(),tags=Array.isArray(p.categories_tags)?p.categories_tags.join(' '):'';
 const isDrink=/beverage|drink|getränk|wasser|soft-drink|juice|soda/.test(cats+' '+tags)||/wasser|cola|saft|drink|energy|eistee|milch$|kakao/.test(name.toLowerCase());
 $('unit').value=isDrink?'ml':'g';$('amount').value=mfitDefaultAmount(name,isDrink);$('packSize').value='';$('portionMode').value='custom';
 const template=mfitTemplateForName(name);
 const pieceWeights={'semmel':60,'kaisersemmel':60,'kornspitz':75,'mohnflesserl':70,'vollkornsemmel':70,'weckerl':70,'mohnweckerl':70,'vollkornweckerl':70,'breze':80,'laugenstange':90,'banane':120,'apfel':150,'ei':60,'eier':60,'orange':150,'kiwi':75};
 const normName=v=>String(v||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/ß/g,'ss').trim();
 const pieceKey=Object.keys(pieceWeights).find(k=>normName(name)===normName(k)||normName(name).includes(normName(k)));
 const pieceWeight=pieceKey?pieceWeights[pieceKey]:0;
 if(p.nutriments&&Object.keys(p.nutriments).length){setNutritionFromProduct(p.nutriments);}
 else if(template){setNutritionFromTemplate(template);}
 else{
  nutritionBase={kcal:0,protein:0,carbs:0,fat:0,fiber:0,vitc:0,vitd:0,calcium:0,iron:0,magnesium:0,potassium:0,zinc:0,b12:0};
  recalculateNutrition();
 }
 if(pieceWeight>0&&!isDrink){
  $('unit').value='Stück';$('amount').value='1';$('packSize').value=pieceWeight;$('portionMode').value='custom';
  if(template){
   nutritionBase={kcal:template.kcal*pieceWeight/100,protein:template.protein*pieceWeight/100,carbs:template.carbs*pieceWeight/100,fat:template.fat*pieceWeight/100,fiber:(template.fiber||0)*pieceWeight/100,vitc:(template.vitc||0)*pieceWeight/100,vitd:(template.vitd||0)*pieceWeight/100,calcium:(template.calcium||0)*pieceWeight/100,iron:(template.iron||0)*pieceWeight/100,magnesium:(template.magnesium||0)*pieceWeight/100,potassium:(template.potassium||0)*pieceWeight/100,zinc:(template.zinc||0)*pieceWeight/100,b12:(template.b12||0)*pieceWeight/100};
  }
  recalculateNutrition();
 }else if(!isDrink){$('unit').value='g';$('amount').value=mfitDefaultAmount(name,false);}
 $('drink').value=isDrink?(Number($('amount').value)||0):0;
 if(isDrink)$('meal').value='Getränk';else if($('meal').value==='Getränk')$('meal').value='Snack';
 const pack=getPackAmount(p);
 if(pack){$('packSize').value=pack.amount;$('unit').value=pack.unit;$('portionMode').value='whole';applyPortionMode();if(isDrink)$('drink').value=Number($('amount').value)||pack.amount;}
 $('barcodeStatus').textContent=p.local?(template?'Durchschnittliche Nährwerte als Schätzung übernommen. Menge kannst du anpassen.':'Für dieses Lebensmittel sind keine hinterlegten Nährwerte vorhanden. Bitte ergänzen oder Barcode scannen.'):'Produktdaten übernommen. Bitte mit der Verpackung vergleichen.';
 $('productSuggestions').hidden=true;$('productSuggestions').innerHTML='';$('amount').focus();
}
function initProductAutocomplete(){
 const input=$('foodName');if(!input)return;
 const show=()=>{
  searchProductSuggestions(input.value);
  const q=String(input.value||'').trim().toLocaleLowerCase('de').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/ß/g,'ss');
  if(!q)return;
  const exact=productSearchResults.findIndex(p=>String(p.product_name_de||p.product_name||'').trim().toLocaleLowerCase('de').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/ß/g,'ss')===q);
  if(exact>=0)selectProductSuggestion(exact);
 };
 input.addEventListener('input',show);
 input.addEventListener('focus',()=>searchProductSuggestions(input.value));
 document.addEventListener('click',event=>{const box=$('productSuggestions');if(box&&!box.contains(event.target)&&event.target!==input)box.hidden=true;});
}
initProductAutocomplete();


/* v113 — validated, recoverable local backup and restore */
const MFIT_SAFETY_BACKUP_KEY='__mfit_safety_backup_v1';
const MFIT_CLOUD_OWNER_KEY='__mfit_cloud_owner_v1';
function mfitCaptureLocalData(){
 const data={};
 for(let i=0;i<localStorage.length;i++){
  const key=localStorage.key(i);
  if(key&&key.startsWith('mfit_'))data[key]=localStorage.getItem(key);
 }
 return data;
}
function mfitValidateDataSnapshot(entries){
 if(!entries||typeof entries!=='object'||Array.isArray(entries))throw new Error('Ungültiges Backup-Format.');
 const keys=Object.keys(entries).filter(k=>k.startsWith('mfit_')&&typeof entries[k]==='string');
 if(!keys.length)throw new Error('Das Backup enthält keine gültigen MFit-Daten.');
 let bytes=0;const clean={};
 keys.forEach(k=>{
  if(k.length>240)throw new Error('Ein Backup-Schlüssel ist zu lang.');
  bytes+=k.length+entries[k].length;
  if(bytes>4*1024*1024)throw new Error('Das Backup ist größer als 4 MB und wurde aus Sicherheitsgründen nicht wiederhergestellt.');
  clean[k]=entries[k];
 });
 return clean;
}
function mfitApplyDataSnapshot(entries,options={}){
 const clean=mfitValidateDataSnapshot(entries);
 const oldData=mfitCaptureLocalData();
 const oldOwner=localStorage.getItem(MFIT_CLOUD_OWNER_KEY);
 const ownerId=Object.prototype.hasOwnProperty.call(options,'ownerId')?(typeof options.ownerId==='string'&&options.ownerId?options.ownerId:null):oldOwner;
 if(options.saveSafety!==false){
  const backup={app:'MFit Performance',formatVersion:1,savedAt:new Date().toISOString(),ownerId:oldOwner,data:oldData};
  const serialized=JSON.stringify(backup);
  localStorage.setItem(MFIT_SAFETY_BACKUP_KEY,serialized);
  if(localStorage.getItem(MFIT_SAFETY_BACKUP_KEY)!==serialized)throw new Error('Sicherheitsbackup konnte nicht überprüft werden. Deine bisherigen Daten wurden nicht verändert.');
 }
 try{
  Object.keys(oldData).forEach(k=>localStorage.removeItem(k));
  Object.keys(clean).forEach(k=>localStorage.setItem(k,clean[k]));
  if(ownerId)localStorage.setItem(MFIT_CLOUD_OWNER_KEY,ownerId);
  else localStorage.removeItem(MFIT_CLOUD_OWNER_KEY);
  const check=mfitCaptureLocalData();
  if(Object.keys(check).length!==Object.keys(clean).length||Object.keys(clean).some(k=>check[k]!==clean[k]))throw new Error('Die wiederhergestellten Daten konnten nicht vollständig überprüft werden.');
 }catch(error){
  try{
   Object.keys(mfitCaptureLocalData()).forEach(k=>localStorage.removeItem(k));
   Object.keys(oldData).forEach(k=>localStorage.setItem(k,oldData[k]));
   if(oldOwner)localStorage.setItem(MFIT_CLOUD_OWNER_KEY,oldOwner);else localStorage.removeItem(MFIT_CLOUD_OWNER_KEY);
  }catch(rollbackError){
   throw new Error('Wiederherstellung fehlgeschlagen und die automatische Rücksicherung konnte nicht vollständig abgeschlossen werden. Bitte Browser-Speicher nicht löschen; Sicherheitsbackup-Schlüssel bleibt erhalten.');
  }
  throw new Error('Wiederherstellung abgebrochen. Deine vorherigen Daten wurden zurückgesichert. Ursache: '+error.message);
 }
 return Object.keys(clean).length;
}
function downloadMfitBackup(){
 const payload={app:'MFit Performance',formatVersion:1,exportedAt:new Date().toISOString(),data:mfitCaptureLocalData()};
 try{
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='mfit-backup-'+mfitDateKey()+'.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  if($('backupStatus'))$('backupStatus').textContent='Backup erstellt: '+Object.keys(payload.data).length+' Datensätze/Einstellungen gesichert. Bewahre die Datei an einem sicheren Ort auf.';
 }catch(e){if($('backupStatus'))$('backupStatus').textContent='Backup konnte nicht erstellt werden. Prüfe den verfügbaren Gerätespeicher.';}
}
function restoreMfitBackup(event){
 const file=event?.target?.files?.[0];if(!file)return;
 const input=event.target;
 if(file.size>5*1024*1024){if($('backupStatus'))$('backupStatus').textContent='Die Datei ist größer als 5 MB und wurde nicht geöffnet.';input.value='';return;}
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const payload=JSON.parse(String(reader.result||''));
   if(!payload||payload.app!=='MFit Performance'||payload.formatVersion!==1||!payload.data||typeof payload.data!=='object'||Array.isArray(payload.data))throw new Error('Ungültiges MFit-Backup');
   const entries=mfitValidateDataSnapshot(payload.data);
   if(!confirm('Backup vom '+(payload.exportedAt?new Date(payload.exportedAt).toLocaleString('de-AT'):'unbekannten Datum')+' wiederherstellen? Vorher wird ein Sicherheitsbackup deiner aktuellen Daten erstellt.')){input.value='';return;}
   mfitApplyDataSnapshot(entries,{ownerId:localStorage.getItem(MFIT_CLOUD_OWNER_KEY),saveSafety:true});
   if($('backupStatus'))$('backupStatus').textContent='Backup sicher wiederhergestellt. Ein Sicherheitsbackup deiner vorherigen Daten liegt lokal bereit. MFit wird neu geladen …';
   setTimeout(()=>location.reload(),500);
  }catch(e){if($('backupStatus'))$('backupStatus').textContent='Backup konnte nicht wiederhergestellt werden: '+e.message+'.';}
  input.value='';
 };
 reader.onerror=()=>{if($('backupStatus'))$('backupStatus').textContent='Die Datei konnte nicht gelesen werden.';input.value='';};
 reader.readAsText(file);
}
function restoreMfitSafetyBackup(){
 try{
  const raw=localStorage.getItem(MFIT_SAFETY_BACKUP_KEY);
  if(!raw)throw new Error('Auf diesem Gerät ist noch kein Sicherheitsbackup vorhanden.');
  const payload=JSON.parse(raw);
  if(!payload||payload.app!=='MFit Performance'||payload.formatVersion!==1)throw new Error('Das lokale Sicherheitsbackup ist ungültig.');
  const entries=mfitValidateDataSnapshot(payload.data);
  if(!confirm('Das lokale Sicherheitsbackup vom '+new Date(payload.savedAt).toLocaleString('de-AT')+' wiederherstellen? Die aktuellen MFit-Daten werden ersetzt.'))return;
  mfitApplyDataSnapshot(entries,{ownerId:payload.ownerId||null,saveSafety:false});
  if($('backupStatus'))$('backupStatus').textContent='Sicherheitsbackup wiederhergestellt. MFit wird neu geladen …';
  setTimeout(()=>location.reload(),500);
 }catch(e){if($('backupStatus'))$('backupStatus').textContent='Sicherheitsbackup konnte nicht wiederhergestellt werden: '+e.message;}
}
