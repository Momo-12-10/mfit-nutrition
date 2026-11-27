/* MFit Cloud v113 — single client, account guard and safe restore */
(function(){
 'use strict';
 const URL='https://pxakmojxstpkmfuldxlx.supabase.co';
 const KEY='sb_publishable_FxKsCX9D9SiNN1cgwDt2DA_GPs8SkW7';
 const OWNER_KEY='__mfit_cloud_owner_v1';
 let db=null,user=null,busy=false,recoveryMode=false;
 const byId=id=>document.getElementById(id);
 function say(msg){const n=byId('mfitCloudStatus');if(n)n.textContent=msg;}
 function client(){
  if(db)return db;
  if(!window.supabase||typeof window.supabase.createClient!=='function')throw new Error('Die Cloud-Bibliothek wurde nicht geladen. Bitte Internetverbindung prüfen und die Seite neu laden.');
  db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  db.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY')recoveryMode=true;show(session);});
  return db;
 }
 function owner(){try{return localStorage.getItem(OWNER_KEY)||''}catch(e){return ''}}
 function show(session){
  user=session&&session.user?session.user:null;
  const out=byId('mfitCloudSignedOut'),inside=byId('mfitCloudSignedIn');
  const recovery=byId('mfitCloudPasswordRecovery');if(recovery)recovery.hidden=!recoveryMode;
  if(out)out.hidden=!!user||recoveryMode;if(inside)inside.hidden=!user||recoveryMode;
  const email=byId('mfitCloudUserEmail');if(email)email.textContent=(user&&user.email)||'Angemeldet';
  if(user){
   const linked=owner();
   if(linked&&linked!==user.id)say('Achtung: Die lokalen Daten sind einem anderen Konto zugeordnet. Sichere sie nicht in dieses Konto. Stelle zuerst das passende Cloud-Backup wieder her.');
   else if(!linked)say('Angemeldet. Vor dem ersten Cloud-Upload musst du bestätigen, dass die lokalen Daten zu diesem Konto gehören.');
   else say('Angemeldet als '+(user.email||'MFit-Nutzer')+'. Lokale Daten sind diesem Konto zugeordnet.');
  }
 }
 function lock(v){busy=v;document.querySelectorAll('#mfitCloudAccount button').forEach(b=>b.disabled=v);}
 function credentials(){return {email:(byId('mfitCloudEmail')?.value||'').trim(),password:byId('mfitCloudPassword')?.value||''};}
 async function run(fn){if(busy)return;lock(true);try{await fn()}catch(e){say('Fehler: '+(e&&e.message?e.message:String(e)))}finally{lock(false)}}
 function snapshot(){return window.mfitCaptureLocalData?window.mfitCaptureLocalData():(()=>{const d={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('mfit_'))d[k]=localStorage.getItem(k)}return d})()}
 function apply(payload){
  if(typeof window.mfitApplyDataSnapshot!=='function')throw new Error('Sichere Wiederherstellung ist nicht verfügbar. Bitte aktualisiere die App.');
  window.mfitApplyDataSnapshot(payload,{ownerId:user.id,saveSafety:true});
 }
 window.mfitCloudSignUp=()=>run(async()=>{
  const {email,password}=credentials();if(!email||password.length<8)throw Error('Bitte E-Mail und Passwort mit mindestens 8 Zeichen eingeben.');
  const {data,error}=await client().auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
  if(error)throw error;if(data.session)show(data.session);
  say(data.session?'Konto erstellt und angemeldet.':'Bitte bestätige den Link in deiner E-Mail. Danach kannst du dich anmelden.');
 });
 window.mfitCloudSignIn=()=>run(async()=>{
  const {email,password}=credentials();if(!email||!password)throw Error('Bitte E-Mail-Adresse und Passwort eingeben.');
  const {data,error}=await client().auth.signInWithPassword({email,password});if(error)throw error;
  show(data.session);if(owner()&&owner()!==data.session.user.id)say('Angemeldet, aber lokale Daten gehören einem anderen Konto. Ein Cloud-Upload ist gesperrt, bis du das passende Backup wiederherstellst.');
 });
 window.mfitCloudSaveNewPassword=()=>run(async()=>{
  if(!recoveryMode)throw Error('Bitte öffne zuerst den Link aus der Passwort-E-Mail.');
  const password=byId('mfitCloudNewPassword')?.value||'';
  if(password.length<8)throw Error('Das neue Passwort muss mindestens 8 Zeichen haben.');
  const {data,error}=await client().auth.updateUser({password});
  if(error)throw error;
  recoveryMode=false;
  if(byId('mfitCloudNewPassword'))byId('mfitCloudNewPassword').value='';
  show(data.user?{user:data.user}:null);
  say('Dein neues Passwort wurde gespeichert. Du kannst dich jetzt mit dem neuen Passwort anmelden.');
 });
 window.mfitCloudResetPassword=()=>run(async()=>{
  const {email}=credentials();if(!email)throw Error('Bitte zuerst deine E-Mail-Adresse eingeben.');
  const {error}=await client().auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;
  say('Wenn ein Konto zu dieser Adresse besteht, wurde ein Link zum Zurücksetzen gesendet.');
 });
 window.mfitCloudSignOut=()=>run(async()=>{
  const {error}=await client().auth.signOut();if(error)throw error;
  show(null);say('Abgemeldet. Deine lokalen Daten und die Kontozuordnung bleiben auf diesem Gerät erhalten.');
 });
 window.mfitCloudUpload=()=>run(async()=>{
  if(!user)throw Error('Bitte zuerst anmelden.');
  const linked=owner();
  if(linked&&linked!==user.id)throw Error('Upload gesperrt: Die lokalen Daten gehören einem anderen Konto. Stelle zuerst das Cloud-Backup des angemeldeten Kontos wieder her.');
  if(!linked&&!confirm('Diese lokalen MFit-Daten sind noch keinem Konto zugeordnet. Möchtest du sie dem Konto '+(user.email||'')+' zuordnen und in dessen Cloud sichern?'))return;
  const data=snapshot();if(!Object.keys(data).length)throw Error('Es wurden keine lokalen MFit-Daten gefunden.');
  const {error}=await client().from('mfit_user_data').upsert({user_id:user.id,data,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(error)throw error;
  try{localStorage.setItem(OWNER_KEY,user.id)}catch(e){say('Cloud-Backup gespeichert. Die lokale Kontozuordnung konnte nicht gespeichert werden; bestätige sie beim nächsten Upload erneut.');return}
  say('Cloud-Backup gespeichert ('+Object.keys(data).length+' lokale Datensätze/Einstellungen). Die lokalen Daten sind diesem Konto zugeordnet.');
 });
 window.mfitCloudDeleteAccount=()=>run(async()=>{
  if(!user)throw Error('Bitte zuerst anmelden.');
  const email=user.email||'';
  if(!confirm('ACHTUNG: Dein MFit-Konto und dein Cloud-Backup werden dauerhaft gelöscht. Deine lokalen Daten auf diesem Gerät bleiben erhalten. Möchtest du fortfahren?'))return;
  const typed=prompt('Zur Bestätigung gib exakt LÖSCHEN ein.');
  if(typed!=='LÖSCHEN')throw Error('Löschung abgebrochen. Es wurde nichts geändert.');
  const {data,error}=await client().functions.invoke('delete-mfit-account',{body:{confirmation:'DELETE_MY_ACCOUNT'}});
  if(error)throw error;
  if(!data||data.deleted!==true)throw Error(data&&data.error?data.error:'Das Konto konnte nicht eindeutig gelöscht werden.');
  try{localStorage.removeItem(OWNER_KEY)}catch(e){}
  user=null;show(null);
  say('Dein MFit-Konto und die Cloud-Daten wurden gelöscht. Deine lokalen Daten auf diesem Gerät bleiben erhalten.');
 });
 window.mfitCloudDownload=()=>run(async()=>{
  if(!user)throw Error('Bitte zuerst anmelden.');
  if(!confirm('Cloud-Daten dieses Kontos auf dieses Gerät laden? Die aktuellen lokalen MFit-Daten werden ersetzt. Vorher wird automatisch ein Sicherheitsbackup erstellt.'))return;
  const {data,error}=await client().from('mfit_user_data').select('data,updated_at').eq('user_id',user.id).maybeSingle();
  if(error)throw error;if(!data||!data.data)throw Error('Noch kein Cloud-Backup für dieses Konto vorhanden.');
  if(typeof data.data!=='object'||Array.isArray(data.data))throw Error('Das Cloud-Backup ist ungültig.');
  apply(data.data);
  say('Cloud-Backup vom '+(data.updated_at?new Date(data.updated_at).toLocaleString('de-AT'):'unbekannten Datum')+' sicher geladen. MFit wird neu gestartet …');
  setTimeout(()=>location.reload(),700);
 });
 async function init(){try{const {data,error}=await client().auth.getSession();if(error)throw error;show(data.session)}catch(e){say('Cloud momentan nicht verfügbar: '+e.message)}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();