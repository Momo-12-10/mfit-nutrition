/* MFit v195 — design and accessibility polish; no feature or storage changes. */
(function(){
'use strict';
const iconPaths={
 '📅':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
 '🍬':'<path d="M8 3h8l5 9-5 9H8l-5-9z"/><path d="m8 3 8 18M16 3 8 21"/>',
 '🛒':'<path d="M3 4h2l2.2 11.5a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 9H6"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>',
 '🏷':'<path d="M20 13 13 20 3 10V3h7z"/><circle cx="7.5" cy="7.5" r="1"/>',
 '🏋':'<path d="M6 7v10M3 9v6m15-8v10m3-8v6M6 12h12"/>',
 '⚡':'<path d="m13 2-3 9h7l-6 11 2-9H6z"/>',
 '📈':'<path d="M3 3v18h18M7 15l4-4 3 3 6-7"/>',
 '💪':'<path d="M7 12V8a2 2 0 0 1 4 0v3h2V6a2 2 0 0 1 4 0v7l2-2a2 2 0 0 1 3 3l-5 6H9a4 4 0 0 1-4-4v-3a2 2 0 0 1 2-2z"/>',
 '😴':'<path d="M3 19V5m0 14h18M7 19v-5a3 3 0 0 1 6 0v5m0-4h5a3 3 0 0 1 3 3v1"/>',
 '📳':'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 5h4M10 19h4M3 8v8m18-8v8"/>',
 '🌐':'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
 '✨':'<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l1 2.5 2 1-2 1-1 2.5-1-2.5-2-1 2-1z"/>',
 '🧰':'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V5h8v3M3 13h18M10 13v3h4v-3"/>',
 'ⓘ':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/>',
 '☁':'<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9z"/>',
 '🎨':'<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1.1-2.6H18a3 3 0 0 0 3-3c0-5-4-9-9-9z"/><path d="M7.5 10h.01M10 7.5h.01M15 8h.01M17 11h.01"/>',
 '🔔':'<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 '📏':'<path d="M3 7h18v10H3zM7 7v4m4-4v3m4-3v4m4-4v3"/>',
 '🔒':'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 '🛡':'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>'
};
const generic='<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>';
function svg(path){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(path||generic)+'</svg>';}
function addHeadingIcon(el){
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){
  const m=node.textContent.match(/^\s*([\p{Extended_Pictographic}\u24C2-\u3299])\uFE0F?\s*/u);
  if(!m)continue;
  node.textContent=node.textContent.replace(/^\s*[\p{Extended_Pictographic}\u24C2-\u3299]\uFE0F?\s*/u,'');
  if(!el.querySelector('.mfit195-heading-icon')){const holder=document.createElement('span');holder.className='mfit195-heading-icon';holder.setAttribute('aria-hidden','true');holder.innerHTML=svg(iconPaths[m[1]]);el.prepend(holder);}
  el.dataset.mfit195IconDone='1';return;
 }
}
let generatedId=0;
function ensureLabel(el){
 if(el.type==='hidden')return;
 if(!el.id){do{el.id='mfit195-field-'+(++generatedId)}while(document.getElementById(el.id)!==el);}
 const id=el.id;
 const wrapping=el.closest('label');
 if(wrapping){wrapping.htmlFor=id;return;}
 const explicit=document.querySelector('label[for="'+CSS.escape(id)+'"]');
 if(explicit)return;
 const prev=el.previousElementSibling;
 if(prev&&prev.tagName==='LABEL'&&!prev.htmlFor){prev.htmlFor=id;return;}
 const parentLabel=el.parentElement&&[...el.parentElement.children].find(n=>n.tagName==='LABEL'&&!n.htmlFor);
 if(parentLabel){parentLabel.htmlFor=id;return;}
 const label=document.createElement('label');
 label.className='mfit195-visually-hidden';label.htmlFor=id;
 label.textContent=el.getAttribute('aria-label')||el.getAttribute('placeholder')||el.getAttribute('title')||id.replace(/^mfit195-field-/,'Feld ').replace(/([A-Z])/g,' $1').replace(/[-_]/g,' ').trim();
 el.before(label);
}
function normalizeCardActions(root){
 const cards=[];
 const nearest=root.closest?.('.card,.mfit193-merged-card');if(nearest)cards.push(nearest);
 if(root.matches?.('.card,.mfit193-merged-card')&&!cards.includes(root))cards.push(root);
 root.querySelectorAll?.('.card,.mfit193-merged-card').forEach(el=>cards.push(el));
 cards.forEach(card=>{
  const buttons=[...card.querySelectorAll('button')].filter(btn=>
   btn.closest('.card,.mfit193-merged-card')===card&&
   !btn.matches('.mfit-card-collapse-toggle,.mfit193-merged-toggle,.theme-swatch,.mfit-collapse-menu-toggle,[data-action-role="toggle"],[data-action-role="icon"]')&&
   !btn.classList.contains('danger')
  );
  const primary=buttons.find(btn=>!btn.classList.contains('secondary')&&!btn.classList.contains('mfit195-secondary-action'));
  if(!primary)return;
  primary.classList.add('mfit195-primary-action');
  buttons.forEach(btn=>{if(btn!==primary&&!btn.classList.contains('secondary'))btn.classList.add('mfit195-secondary-action');});
 });
}
function scan(root){
 if(root.nodeType!==1&&root!==document)return;
 const controls=[];
 if(root.matches?.('input,select,textarea'))controls.push(root);
 root.querySelectorAll?.('input,select,textarea').forEach(el=>controls.push(el));
 controls.forEach(ensureLabel);
 normalizeCardActions(root);
 const headings=[];
 if(root.matches?.('h2,h3'))headings.push(root);
 root.querySelectorAll?.('h2,h3').forEach(el=>headings.push(el));
 headings.forEach(addHeadingIcon);
}
function start(){
 scan(document);
 const observer=new MutationObserver(records=>records.forEach(record=>{if(record.type==='characterData'){const heading=record.target.parentElement?.closest('h2,h3');if(heading)addHeadingIcon(heading);}record.addedNodes?.forEach(node=>{if(node.nodeType===1)scan(node)})}));
 observer.observe(document.body,{childList:true,subtree:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();