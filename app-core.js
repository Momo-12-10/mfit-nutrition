
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
let data=(()=>{try{const v=JSON.parse(storage.get('mfit_entries')||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x==='object'):[]}catch(e){return []}})();
let nutritionBase={kcal:0,protein:0,carbs:0,fat:0,fiber:0,vitc:0,vitd:0,calcium:0,iron:0,magnesium:0,potassium:0,zinc:0,b12:0};
let water=Number(storage.get('mfit_water')||0);
let waterQuickEntries=(()=>{try{const v=JSON.parse(storage.get('mfit_water_quick_entries')||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x==='object'&&Number(x.ml)>0):[]}catch(e){return []}})();
let stepCount=(()=>{const day=new Date().toISOString().slice(0,10);return storage.get('mfit_steps_day')===day?(Number(storage.get('mfit_steps'))||0):0})();
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
const nutrientKeys=['kcal','protein','carbs','fat','fiber','vitc','vitd','calcium','iron','magnesium','potassium','zinc','b12'];
function recalculateNutrition(){const amount=Number($('amount').value)||0,factor=$('unit').value==='Stück'?amount:amount/100;nutrientKeys.forEach(k=>{const el=$(k);if(el)el.value=String(Math.round((Number(nutritionBase[k]||0)*factor)*100)/100)});}
function updateNutritionBase(key){const amount=Number($('amount').value)||0,factor=$('unit').value==='Stück'?amount:amount/100;nutritionBase[key]=factor>0?(Number($(key).value)||0)/factor:0;recalculateNutrition();}
function setNutritionFromProduct(n){nutritionBase={kcal:Number(n['energy-kcal_100g']??(n['energy-kj_100g']?n['energy-kj_100g']/4.184:0)),protein:Number(n.proteins_100g??0),carbs:Number(n.carbohydrates_100g??0),fat:Number(n.fat_100g??0),fiber:Number(n.fiber_100g??0),vitc:Number(n['vitamin-c_100g']??0),vitd:Number(n['vitamin-d_100g']??0),calcium:Number(n.calcium_100g??0),iron:Number(n.iron_100g??0),magnesium:Number(n.magnesium_100g??0),potassium:Number(n.potassium_100g??0),zinc:Number(n.zinc_100g??0),b12:Number(n['vitamin-b12_100g']??0)};recalculateNutrition();}async function startBarcode(){
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
function persistSteps(){storage.set('mfit_steps_day',new Date().toISOString().slice(0,10));storage.set('mfit_steps',String(stepCount));renderSteps()}
function renderSteps(){if($('stepTotal'))$('stepTotal').textContent=stepCount.toLocaleString('de-AT');if($('stepGoalLabel'))$('stepGoalLabel').textContent='Tagesziel: '+stepGoal.toLocaleString('de-AT')+' Schritte';if($('stepBar'))$('stepBar').style.width=Math.min(100,stepCount/stepGoal*100)+'%';}
function addManualSteps(n){stepCount+=n;persistSteps();if($('stepStatus'))$('stepStatus').textContent=n+' Schritte manuell ergänzt.'}
async function startStepCounter(){if(stepActive){stopStepCounter();return;}if(!('DeviceMotionEvent'in window)){$('stepStatus').textContent='Dieser Browser unterstützt keinen Bewegungssensor. Nutze die manuelle Schritt-Erfassung.';return;}try{if(typeof DeviceMotionEvent.requestPermission==='function'){const permission=await DeviceMotionEvent.requestPermission();if(permission!=='granted')throw new Error('Bewegungszugriff wurde nicht erlaubt.');}stepActive=true;stepLastPeak=0;stepBaseline=null;stepMotionHandler=e=>{const a=e.acceleration||e.accelerationIncludingGravity;if(!a)return;const mag=Math.sqrt((a.x||0)**2+(a.y||0)**2+(a.z||0)**2);if(stepBaseline===null)stepBaseline=mag;stepBaseline=stepBaseline*0.9+mag*0.1;const movement=Math.abs(mag-stepBaseline);const now=Date.now();if(movement>1.15&&now-stepLastPeak>320){stepLastPeak=now;stepCount++;persistSteps();}};window.addEventListener('devicemotion',stepMotionHandler);$('stepStatus').textContent='Schrittzähler läuft. Lass MFit geöffnet und das iPhone in deiner Tasche.';document.querySelector('[onclick="startStepCounter()"]')?.replaceChildren(document.createTextNode('Schrittzähler stoppen'));}catch(e){$('stepStatus').textContent='Schrittzähler nicht gestartet: '+e.message}}
function stopStepCounter(){if(stepMotionHandler)window.removeEventListener('devicemotion',stepMotionHandler);stepMotionHandler=null;stepActive=false;if($('stepStatus'))$('stepStatus').textContent='Schrittzählung pausiert.';const b=document.querySelector('[onclick="startStepCounter()"]');if(b)b.textContent='Schrittzähler starten'}
function renderWeightHistory(){const el=$('weightHistory');if(!el)return;el.innerHTML=weightHistory.length?weightHistory.slice(-7).reverse().map(x=>'<div class="item row"><span>'+new Date(x.date+'T12:00:00').toLocaleDateString('de-AT')+'</span><b>'+Number(x.weight).toFixed(1)+' kg</b></div>').join(''):'Noch keine Gewichtseinträge.'}
function saveWeightLog(){const w=Number($('weightLogInput').value);if(!w||w<25||w>300){alert('Bitte ein gültiges Gewicht eintragen.');return;}weightHistory.push({date:new Date().toISOString().slice(0,10),weight:w});weightHistory=weightHistory.slice(-60);storage.set('mfit_weight_history',JSON.stringify(weightHistory));$('weightLogInput').value='';renderWeightHistory()}
function showTab(t){['home','track','recipes','shop','fitness','profile'].forEach(x=>$(x).classList.toggle('hidden',x!==t));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));if(t==='recipes')renderRecipes();if(t==='fitness')renderFitness()}
function addFood(){let n=$('foodName').value.trim(),a=Number($('amount').value)||0;if(!n||a<=0)return alert('Bitte Lebensmittel und Menge eintragen.');let entry={name:n,amount:a,unit:$('unit').value,meal:$('meal').value,kcal:Number($('kcal').value),protein:Number($('protein').value),carbs:Number($('carbs').value),fat:Number($('fat').value),fiber:Number($('fiber').value),drink:Number($('drink').value),vitc:Number($('vitc')?.value||0),vitd:Number($('vitd')?.value||0),calcium:Number($('calcium')?.value||0),iron:Number($('iron')?.value||0),magnesium:Number($('magnesium')?.value||0),potassium:Number($('potassium')?.value||0),zinc:Number($('zinc')?.value||0),b12:Number($('b12')?.value||0)};data.push(entry);water+=entry.drink;['foodName','barcode'].forEach(x=>$(x).value='');$('portionMode').value='whole';$('packSize').value='';save();showTab('home')}
function removeWater(n){n=Number(n);if(!Number.isFinite(n)||n<=0)return;water=Math.max(0,water-n);save()}
function addWater(n){n=Number(n);if(!Number.isFinite(n)||n<=0)return;water+=n;waterQuickEntries.push({id:String(Date.now())+'-'+Math.random().toString(36).slice(2,8),ml:n,time:new Date().toLocaleTimeString('de-AT',{hour:'2-digit',minute:'2-digit'})});waterQuickEntries=waterQuickEntries.slice(-50);storage.set('mfit_water_quick_entries',JSON.stringify(waterQuickEntries));save()}
function addCustomWater(){const el=$('customWaterAmount'),n=Number(el?.value);if(!Number.isFinite(n)||n<=0||n>5000){alert('Bitte eine Menge zwischen 1 und 5000 ml eingeben.');return;}addWater(n);el.value=''}
function removeQuickWater(id){const i=waterQuickEntries.findIndex(x=>String(x.id)===String(id));if(i<0)return;water=Math.max(0,water-(Number(waterQuickEntries[i].ml)||0));waterQuickEntries.splice(i,1);storage.set('mfit_water_quick_entries',JSON.stringify(waterQuickEntries));save()}
function renderWaterQuickHistory(){const el=$('waterQuickHistory');if(!el)return;el.innerHTML=waterQuickEntries.length?waterQuickEntries.slice().reverse().map(x=>'<div class="item row" style="gap:12px"><div><b>'+Number(x.ml)+' ml</b><div class="muted">'+esc(x.time||'')+'</div></div><button type="button" class="danger smallbtn" onclick="removeQuickWater(\''+String(x.id)+'\')">Eintrag löschen</button></div>').join(''):'<div class="muted">Noch keine Wassereinträge. Jeder Eintrag erscheint hier einzeln.</div>';}
function render(){let sum=k=>data.reduce((s,e)=>s+(Number(e?.[k])||0),0),k=sum('kcal'),p=sum('protein'),f=sum('fiber'),c=sum('carbs'),fat=sum('fat');$('kcalTotal').textContent=Math.round(k)+' kcal';$('kcalLeft').textContent='Tagesziel: '+goals.kcal+' kcal · '+Math.max(0,Math.round(goals.kcal-k))+' übrig';$('kcalBar').style.width=Math.min(100,k/goals.kcal*100)+'%';$('proteinTotal').textContent=Math.round(p)+' g';$('proteinLeft').textContent='Ziel: '+goals.protein+' g · '+Math.max(0,Math.round(goals.protein-p))+' übrig';const cGoal=Math.round((goals.kcal*0.5)/4),fatGoal=Math.round((goals.kcal*0.25)/9);$('macroProtein').textContent=Math.round(p)+' / '+goals.protein+' g';$('macroCarbs').textContent=Math.round(c)+' / '+cGoal+' g';$('macroFat').textContent=Math.round(fat)+' / '+fatGoal+' g';$('proteinBar').style.width=Math.min(100,p/Math.max(1,goals.protein)*100)+'%';$('carbsBar').style.width=Math.min(100,c/Math.max(1,cGoal)*100)+'%';$('fatBar').style.width=Math.min(100,fat/Math.max(1,fatGoal)*100)+'%';$('waterTotal').textContent=Math.round(water)+' ml';$('fiberTotal').textContent=f.toFixed(1)+' g';$('todayList').innerHTML=data.length?data.map((e,i)=>`<div class="item row"><div><b>${esc(e.name)}</b><div class="muted">${esc(e.meal)} · ${e.amount}${esc(e.unit)} · ${Math.round(e.kcal)} kcal · ${(Number(e.protein)||0).toFixed(1)} g Protein</div></div><button class="danger smallbtn" onclick="removeEntry(${i})">×</button></div>`).join(''):'Noch keine Einträge.';[['vitc','sumVitC','mg'],['vitd','sumVitD','µg'],['calcium','sumCalcium','mg'],['iron','sumIron','mg'],['magnesium','sumMagnesium','mg'],['potassium','sumPotassium','mg'],['zinc','sumZinc','mg'],['b12','sumB12','µg']].forEach(([k,id,u])=>{if($(id))$(id).textContent=sum(k).toFixed(1)+' '+u});renderWaterQuickHistory()}
function removeEntry(i){water=Math.max(0,water-(data[i].drink||0));data.splice(i,1);save()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderPresets(){$('presets').innerHTML=presets.map((x,i)=>`<div class="item row"><div><b>${x.name}</b><div class="muted">${x.kcal} kcal · ${x.protein} g Protein / 100 g bzw. Portion</div></div><button class="smallbtn" onclick="usePreset(${i})">Nutzen</button></div>`).join('')}
function usePreset(i){let x=presets[i];$('foodName').value=x.name;$('amount').value=x.drink?x.drink:100;$('unit').value=x.drink?'ml':'g';nutritionBase={...nutritionBase,kcal:x.kcal,protein:x.protein,carbs:x.carbs,fat:x.fat,fiber:x.fiber};recalculateNutrition();$('drink').value=x.drink}
function renderRecipes(){let d=$('diet').value,focus=$('focus').value;let r=recipes.filter(x=>d==='Alle'||x.diet===d);r.sort((a,b)=>focus==='Proteinreich'?b.p-a.p:focus==='Kalorienarm'?a.kcal-b.kcal:focus==='Fettarm'?((a.fatLevel==='low'?0:a.fatLevel==='high'?2:1)-(b.fatLevel==='low'?0:b.fatLevel==='high'?2:1)):focus==='Fettreicher / energiereich'?((b.fatLevel==='high'?2:b.fatLevel==='low'?0:1)-(a.fatLevel==='high'?2:a.fatLevel==='low'?0:1)):b.p/a.kcal-a.p/a.kcal);$('recipeList').innerHTML='<div class="recipe-grid">'+r.map(x=>`<article class="recipe-card"><img class="recipe-photo" src="${x.image}" alt="Food-Foto: ${x.name}" loading="lazy" onerror="this.style.display='none'"><div class="recipe-content"><div class="recipe-title">${x.name}</div><span class="pill">${x.diet}</span><div class="recipe-desc" style="margin-top:9px">${x.desc}</div><div class="recipe-meta"><span class="recipe-chip">${x.kcal} kcal</span><span class="recipe-chip">${x.p} g Protein</span></div><div class="recipe-source">${x.source||'Food-Foto'}</div></div></article>`).join('')+'</div>'}
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
 'mandeln':{kcal:579,protein:21,carbs:22,fat:50,fiber:12.5,magnesium:270,calcium:269},
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
 'eistee zero':{kcal:1,protein:0,carbs:0,fat:0,fiber:0}
};
const mfitDefaultPortions={
 'skyr':200,'magerquark':250,'topfen':150,'joghurt':150,'protein pudding':200,'hüttenkäse':150,
 'milch':250,'hafermilch':250,'ei':100,'eier':100,'hähnchenbrust':150,'putenbrust':150,'rindfleisch':150,'lachs':150,'thunfisch':100,
 'reis':150,'nudeln':180,'haferflocken':50,'müsli':50,'cornflakes':40,'kelloggs':40,'brot':60,'toast':30,'semmel':60,'kaisersemmel':60,'kornspitz':75,'mohnflesserl':70,'vollkornsemmel':70,'weckerl':70,
 'banane':120,'apfel':150,'erdbeeren':150,'heidelbeeren':100,'avocado':70,'gurke':100,'tomaten':100,'paprika':100,'brokkoli':100,'karotten':100,'kartoffeln':200,'mandeln':25,'erdnussbutter':15,'schokolade':25,'chips':30,
 'cola':330,'pepsi':330,'red bull':250,'monster':500,'wasser':500,'eistee':500
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
 nutritionBase={kcal:Number(t.kcal)||0,protein:Number(t.protein)||0,carbs:Number(t.carbs)||0,fat:Number(t.fat)||0,fiber:Number(t.fiber)||0,vitc:Number(t.vitc)||0,vitd:Number(t.vitd)||0,calcium:Number(t.calcium)||0,iron:Number(t.iron)||0,magnesium:Number(t.magnesium)||0,potassium:Number(t.potassium)||0,zinc:Number(t.zinc)||0,b12:Number(t.b12)||0};
 recalculateNutrition();
}

const mfitFoodCatalog=[
'Skyr natur','Skyr Vanille','Skyr Erdbeere','Skyr Heidelbeere','Skyr Mango','Magerquark','Topfen','Griechisches Joghurt','Naturjoghurt','Fruchtjoghurt','Protein Pudding','Protein Joghurt','Hüttenkäse','Cottage Cheese','Milch','Hafermilch','Kakao','Eier','Eiklar','Hähnchenbrust','Putenbrust','Rindfleisch','Lachs','Thunfisch','Schinken','Salami','Käse','Mozzarella','Gouda','Emmentaler','Butter','Frischkäse','Tofu','Linsen','Kichererbsen','Bohnen','Reis','Basmatireis','Vollkornreis','Nudeln','Vollkornnudeln','Haferflocken','Müsli','Cornflakes','Kelloggs Frosties','Kelloggs Corn Flakes','Kelloggs Choco Krispies','Granola','Brot','Vollkornbrot','Toast','Semmel','Kaisersemmel','Kornspitz','Mohnflesserl','Vollkornsemmel','Weckerl','Mohnweckerl','Vollkornweckerl','Laugenstange','Breze','Wrap','Tortilla','Banane','Apfel','Erdbeeren','Heidelbeeren','Himbeeren','Orange','Kiwi','Avocado','Gurke','Tomaten','Paprika','Brokkoli','Karotten','Kartoffeln','Süßkartoffeln','Salat','Spinat','Mais','Erbsen','Nüsse','Mandeln','Erdnussbutter','Honig','Marmelade','Schokolade','Proteinriegel','Müsliriegel','Chips','Reiswaffeln','Popcorn','Pizza','Pommes','Sushi','Cola Zero','Coca-Cola','Pepsi Max','Red Bull Sugarfree','Monster Ultra','Wasser','Mineralwasser','Eistee Zero','Orangensaft','Apfelsaft','Kaffee','Cappuccino','Energy Drink','Iso Drink','Butterkäse','Parmesan','Feta','Skyr Drink','Proteindrink','Milchreis','Grießbrei','Pudding','Porridge','Sauerteigbrot','Knäckebrot','Kürbiskerne','Chiasamen','Leinsamen','Olivenöl','Rapsöl','Ketchup','Senf','Hummus','Guacamole'
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
 if(p.nutriments&&Object.keys(p.nutriments).length){setNutritionFromProduct(p.nutriments);}
 else if(template){setNutritionFromTemplate(template);}
 else{
  nutritionBase={kcal:0,protein:0,carbs:0,fat:0,fiber:0,vitc:0,vitd:0,calcium:0,iron:0,magnesium:0,potassium:0,zinc:0,b12:0};
  recalculateNutrition();
 }
 $('drink').value=isDrink?(Number($('amount').value)||0):0;
 if(isDrink)$('meal').value='Getränk';else if($('meal').value==='Getränk')$('meal').value='Snack';
 const pack=getPackAmount(p);
 if(pack){$('packSize').value=pack.amount;$('unit').value=pack.unit;$('portionMode').value='whole';applyPortionMode();if(isDrink)$('drink').value=Number($('amount').value)||pack.amount;}
 $('barcodeStatus').textContent=p.local?(template?'Durchschnittliche Nährwerte als Schätzung übernommen. Menge kannst du anpassen.':'Für dieses Lebensmittel sind keine hinterlegten Nährwerte vorhanden. Bitte ergänzen oder Barcode scannen.'):'Produktdaten übernommen. Bitte mit der Verpackung vergleichen.';
 $('productSuggestions').hidden=true;$('productSuggestions').innerHTML='';$('amount').focus();
}
function initProductAutocomplete(){
 const input=$('foodName');if(!input)return;
 const show=()=>searchProductSuggestions(input.value);
 input.addEventListener('input',show);
 input.addEventListener('focus',show);
 document.addEventListener('click',event=>{const box=$('productSuggestions');if(box&&!box.contains(event.target)&&event.target!==input)box.hidden=true;});
}
initProductAutocomplete();
