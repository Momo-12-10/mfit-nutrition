/* MFit v132–140 — streamlined settings, food favorites and navigation polish */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups=[
 {id:'personal',icon:'🎨',title:'Personalisierung',desc:'Design, Sprache und Bedienung',items:['appAppearance','mfitAppPreferences','mfitLanguageSettings']},
 {id:'reminders',icon:'🔔',title:'Erinnerungen',desc:'Trinken und Mahlzeiten im Blick behalten',items:['appReminders']},
 {id:'privacy',icon:'🔒',title:'Daten & Datenschutz',desc:'Backup, Privatsphäre und Speicher',items:['privacyCenter','dataBackup','mfitDataTools']},
 {id:'system',icon:'⚙️',title:'System & Informationen',desc:'Installation, App-Status und Version',items:['mfitAppStatus','mfitAboutSettings','mfitReleaseReadiness']}
];
function openTab(name){if(typeof window.showTab==='function')window.showTab(name);}
function makeCategory(g){
 const b=document.createElement('button');b.type='button';b.className='mfit-settings-category';
 b.innerHTML='<span class="mfit-category-icon">'+g.icon+'</span><span class="mfit-category-copy"><b>'+g.title+'</b><small>'+g.desc+'</small></span><span class="mfit-category-arrow" aria-hidden="true">›</span>';
 b.addEventListener('click',()=>openGroup(g.id));return b;
}
function ensureSettings(){
 const root=$('settings'),hub=$('settingsHub');if(!root||!hub||$('mfitSettingsPages'))return;
 const shortcut=hub.querySelector('.settings-shortcuts');if(shortcut)shortcut.remove();
 const pages=document.createElement('div');pages.id='mfitSettingsPages';pages.className='mfit-settings-pages';
 const landing=document.createElement('div');landing.id='mfitSettingsLanding';landing.className='mfit-settings-landing';
 groups.forEach(g=>landing.appendChild(makeCategory(g)));pages.appendChild(landing);
 groups.forEach(g=>{
  const page=document.createElement('div');page.id='mfitSettingsPage-'+g.id;page.className='mfit-settings-page hidden';
  const back=document.createElement('button');back.type='button';back.className='mfit-settings-back';back.innerHTML='<span aria-hidden="true">‹</span> Alle Einstellungen';back.addEventListener('click',showLanding);page.appendChild(back);
  const heading=document.createElement('div');heading.className='mfit-settings-page-heading';heading.innerHTML='<span>'+g.icon+'</span><div><h3>'+g.title+'</h3><p>'+g.desc+'</p></div>';page.appendChild(heading);
  g.items.forEach(id=>{const el=$(id);if(el){el.classList.add('mfit-settings-detail');page.appendChild(el);}});
  pages.appendChild(page);
 });
 hub.insertAdjacentElement('afterend',pages);
}
function showLanding(){
 $('mfitSettingsLanding')?.classList.remove('hidden');
 groups.forEach(g=>$('mfitSettingsPage-'+g.id)?.classList.add('hidden'));
 $('settingsHub')?.classList.remove('hidden');
}
function openGroup(id){
 ensureSettings();$('settingsHub')?.classList.add('hidden');$('mfitSettingsLanding')?.classList.add('hidden');
 groups.forEach(g=>$('mfitSettingsPage-'+g.id)?.classList.toggle('hidden',g.id!==id));
 $('mfitSettingsPage-'+id)?.scrollIntoView({behavior:'smooth',block:'start'});
}
window.mfitOpenSettingsSection=function(id){
 const g=groups.find(x=>x.items.includes(id));if(!g)return;
 window.mfitOpenFullSettings();openGroup(g.id);
 const target=$(id);if(target)setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'start'}),80);
};
window.mfitOpenFullSettings=function(){window.mfitCloseSettingsMenu?.();openTab('settings');ensureSettings();showLanding();};
window.mfitCloseSettingsMenu=function(){
 const menu=$('mfitSettingsMenu');if(menu){menu.classList.add('hidden');menu.setAttribute('aria-hidden','true');}
 const trigger=document.querySelector('.header-settings');trigger?.setAttribute('aria-expanded','false');
};
window.mfitToggleSettingsMenu=function(){
 const menu=$('mfitSettingsMenu');if(!menu)return;
 const open=menu.classList.contains('hidden');menu.classList.toggle('hidden',!open);menu.setAttribute('aria-hidden',String(!open));
 document.querySelector('.header-settings')?.setAttribute('aria-expanded',String(open));
};
window.mfitInitSettings=function(){ensureSettings();showLanding();};
const key='mfit_food_favorites_v1';
function readFavorites(){try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[]}catch(e){return[];}}
function writeFavorites(x){try{localStorage.setItem(key,JSON.stringify(x));return true}catch(e){return false;}}
const fields=['foodName','kcal','protein','carbs','fat','fiber','sugar','addedSugar','drink','amount','unit','meal','packSize','vitc','vitd','calcium','iron','magnesium','potassium','zinc','b12'];
function currentFood(){const o={};fields.forEach(id=>{const el=$(id);if(el)o[id]=el.value;});return o;}
function addFavorite(){
 const o=currentFood();if(!o.foodName?.trim()){alert('Bitte zuerst einen Lebensmittelnamen eingeben.');return;}
 const favs=readFavorites();const clean={...o,id:Date.now()};
 const same=favs.findIndex(x=>String(x.foodName).trim().toLowerCase()===o.foodName.trim().toLowerCase());
 if(same>=0)favs.splice(same,1);favs.unshift(clean);
 if(!writeFavorites(favs.slice(0,30))){alert('Speichern nicht möglich. Bitte prüfe den Gerätespeicher.');return;}
 renderFavorites();
}
function useFavorite(id){
 const o=readFavorites().find(x=>String(x.id)===String(id));if(!o)return;
 fields.forEach(k=>{const el=$(k);if(el&&o[k]!==undefined)el.value=o[k];});
 if($('portionMode'))$('portionMode').value='custom';
 if(typeof window.recalculateNutrition==='function')window.recalculateNutrition();
 $('foodName')?.scrollIntoView({behavior:'smooth',block:'center'});
}
function removeFavorite(id){writeFavorites(readFavorites().filter(x=>String(x.id)!==String(id)));renderFavorites();}
function useEntry(e){
 const map={foodName:'name',amount:'amount',unit:'unit',meal:'meal',kcal:'kcal',protein:'protein',carbs:'carbs',fat:'fat',fiber:'fiber',sugar:'sugar',addedSugar:'addedSugar',drink:'drink',vitc:'vitc',vitd:'vitd',calcium:'calcium',iron:'iron',magnesium:'magnesium',potassium:'potassium',zinc:'zinc',b12:'b12'};
 Object.entries(map).forEach(([field,key])=>{const el=$(field);if(el&&e[key]!==undefined)el.value=e[key];});
 if($('portionMode'))$('portionMode').value='custom';
 $('foodName')?.scrollIntoView({behavior:'smooth',block:'center'});
}
function renderFavorites(){
 const list=$('mfitFoodFavoritesList');if(!list)return;
 const favs=readFavorites();let entries=[];
 try{entries=typeof data!=='undefined'&&Array.isArray(data)?data:[]}catch(e){}
 const recent=[],seen=new Set();
 entries.slice().reverse().forEach(e=>{const name=String(e.name||'').trim(),key=name.toLowerCase();if(name&&!seen.has(key)){seen.add(key);recent.push(e);}});
 const favHtml=favs.length?favs.map(x=>'<div class="mfit-favorite-row"><button type="button" class="mfit-favorite-load" data-load="'+esc(x.id)+'"><b>'+esc(x.foodName)+'</b><small>'+Math.round(Number(x.kcal)||0)+' kcal · '+Math.round(Number(x.protein)||0)+' g Protein</small></button><button type="button" class="mfit-favorite-delete" data-delete="'+esc(x.id)+'" aria-label="'+esc(x.foodName)+' aus Favoriten entfernen">×</button></div>').join(''):'<p class="muted">Noch keine Favoriten gespeichert.</p>';
 const recentHtml=recent.slice(0,5).map((x,i)=>'<button type="button" class="mfit-recent-food" data-recent="'+i+'"><b>'+esc(x.name)+'</b><small>'+Math.round(Number(x.kcal)||0)+' kcal · '+Math.round(Number(x.protein)||0)+' g Protein</small></button>').join('');
 list.innerHTML='<div class="mfit-favorite-section"><b>Gespeicherte Favoriten</b>'+favHtml+'</div><div class="mfit-favorite-section"><b>Zuletzt verwendet</b><div class="mfit-recent-food-list">'+(recentHtml||'<p class="muted">Noch keine früheren Einträge vorhanden.</p>')+'</div></div>';
 list.querySelectorAll('[data-load]').forEach(b=>b.addEventListener('click',()=>useFavorite(b.dataset.load)));
 list.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>removeFavorite(b.dataset.delete)));
 list.querySelectorAll('[data-recent]').forEach(b=>b.addEventListener('click',()=>useEntry(recent[Number(b.dataset.recent)])));
}
function ensureFavorites(){
 const track=$('track');if(!track||$('mfitFoodFavorites'))return;
 const card=document.createElement('div');card.className='card mfit-food-favorites';card.id='mfitFoodFavorites';
 card.innerHTML='<div class="mfit-favorites-heading"><div><span class="settings-kicker">DEINE SCHNELLEINGABE</span><h2>⭐ Lebensmittel-Favoriten</h2><p class="muted">Speichere häufig verwendete Lebensmittel als Vorlage und füge sie schneller ein.</p></div></div><button type="button" class="secondary mfit-save-favorite" id="mfitSaveFoodFavorite">＋ Aktuelle Eingabe als Favorit speichern</button><div id="mfitFoodFavoritesList" class="mfit-food-favorites-list"></div>';
 (track.querySelector(':scope > .card')||track).insertAdjacentElement(track.querySelector(':scope > .card')?'afterend':'beforeend',card);$('mfitSaveFoodFavorite').addEventListener('click',addFavorite);renderFavorites();
}
function navPolish(){
 const nav=document.querySelector('nav.mfit-nav');if(!nav)return;
 nav.setAttribute('aria-label','Hauptnavigation');
 nav.querySelectorAll('button[data-tab]').forEach(b=>{
  b.setAttribute('aria-label',b.querySelector('.nav-label')?.textContent?.trim()||b.dataset.tab);
  b.setAttribute('type','button');
 });
}
function boot(){ensureSettings();ensureFavorites();navPolish();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
document.addEventListener('click',e=>{if(e.target.closest('button[data-tab]')){setTimeout(navPolish,0);if(e.target.closest('button[data-tab]').dataset.tab==='track')setTimeout(renderFavorites,60);}});
window.mfitRefreshFoodFavorites=renderFavorites;
})();


/* v142-150 usability layer */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 function addReportShortcuts(){
  const home=$('home');if(!home||$('mfitReportShortcuts'))return;
  const card=document.createElement('div');card.className='card mfit-report-shortcuts';card.id='mfitReportShortcuts';
  card.innerHTML='<div><span class="settings-kicker">DEINE DATEN</span><h2>Berichte & Backup</h2><p class="muted">Deine bisherigen Einträge kompakt auswerten oder sichern.</p></div><div class="mfit-report-actions"><button type="button" id="mfitExportMonth">Monatsbericht als CSV</button><button type="button" class="secondary" id="mfitExportBackup">Daten-Backup als JSON</button></div><p class="muted" id="mfitReportShortcutStatus" aria-live="polite"></p>';
  const anchor=$('weeklyMomentumCard')||home.querySelector('.weekly-momentum-card')||home.querySelector('.quick-start-card');
  (anchor||home.lastElementChild)?.insertAdjacentElement('afterend',card);
  $('mfitExportMonth').addEventListener('click',()=>{if(typeof window.mfitExportMonthlyReport==='function')window.mfitExportMonthlyReport();else $('mfitReportShortcutStatus').textContent='Monatsbericht ist gerade nicht verfügbar.';});
  $('mfitExportBackup').addEventListener('click',()=>{if(typeof window.mfitExportAllProData==='function')window.mfitExportAllProData();else $('mfitReportShortcutStatus').textContent='Backup-Funktion ist gerade nicht verfügbar.';});
 }
 function addFavoriteSearch(){
  const card=$('mfitFoodFavorites');if(!card||$('mfitFavoriteSearch'))return;
  const input=document.createElement('input');input.type='search';input.id='mfitFavoriteSearch';input.placeholder='Favoriten oder zuletzt verwendete Lebensmittel suchen';input.setAttribute('aria-label','Lebensmittel-Favoriten durchsuchen');
  const list=$('mfitFoodFavoritesList');if(list)list.insertAdjacentElement('beforebegin',input);
  input.addEventListener('input',()=>{const q=input.value.trim().toLocaleLowerCase();list?.querySelectorAll('.mfit-favorite-row,.mfit-recent-food').forEach(row=>{row.hidden=!!q&&!row.textContent.toLocaleLowerCase().includes(q);});});
 }
 function addSectionControls(){
  document.querySelectorAll('main section[id]').forEach(section=>{
   const cards=[...section.querySelectorAll(':scope > .mfit-collapsible-card')];
   if(cards.length<2)return;
   let bar=section.querySelector(':scope > .mfit-section-controls');
   if(!bar){
    bar=document.createElement('div');bar.className='mfit-section-controls';
    bar.innerHTML='<div><button type="button" class="mfit-collapse-menu-toggle" aria-label="Bereiche verwalten" aria-expanded="false" title="Bereiche verwalten">⌄</button><button type="button" data-collapse="all">Alle einklappen</button><button type="button" data-collapse="none">Alle öffnen</button></div>';
    section.appendChild(bar);
    const menuToggle=bar.querySelector('.mfit-collapse-menu-toggle');
    menuToggle.onclick=()=>{
     const open=bar.classList.toggle('is-open');
     menuToggle.setAttribute('aria-expanded',String(open));
     menuToggle.textContent=open?'×':'⌄';
    };
   }
   bar.querySelector('[data-collapse="all"]').onclick=()=>{
    cards.forEach(card=>{card.classList.add('mfit-card-collapsed');const t=card.querySelector('.mfit-card-collapse-toggle');if(t){t.setAttribute('aria-expanded','false');t.setAttribute('aria-label','Bereich ausklappen');}});
    bar.classList.remove('is-open');bar.querySelector('.mfit-collapse-menu-toggle').setAttribute('aria-expanded','false');bar.querySelector('.mfit-collapse-menu-toggle').textContent='⌄';
   };
   bar.querySelector('[data-collapse="none"]').onclick=()=>{
    cards.forEach(card=>{card.classList.remove('mfit-card-collapsed');const t=card.querySelector('.mfit-card-collapse-toggle');if(t){t.setAttribute('aria-expanded','true');t.setAttribute('aria-label','Bereich einklappen');}});
    bar.classList.remove('is-open');bar.querySelector('.mfit-collapse-menu-toggle').setAttribute('aria-expanded','false');bar.querySelector('.mfit-collapse-menu-toggle').textContent='⌄';
   };
  });
 }
 function boot(){addReportShortcuts();addFavoriteSearch();addSectionControls();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
 const observer=new MutationObserver(()=>{addSectionControls();addFavoriteSearch();});
 if(document.body)observer.observe(document.body,{childList:true,subtree:true});
})();
