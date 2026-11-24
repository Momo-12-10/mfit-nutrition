/* MFit Cloud v107 — isolated account handlers */
(function(){
 'use strict';
 const URL='https://pxakmojxstpkmfuldxlx.supabase.co';
 const KEY='sb_publishable_FxKsCX9D9SiNN1cgwDt2DA_GPs8SkW7';
 let db=null,user=null,busy=false;
 const byId=id=>document.getElementById(id);
 function say(msg){const n=byId('mfitCloudStatus');if(n)n.textContent=msg;}
 function client(){
  if(db)return db;
  if(!window.supabase||typeof window.supabase.createClient!=='function')throw new Error('Die Cloud-Bibliothek wurde nicht geladen. Bitte Internetverbindung prüfen und die Seite neu laden.');
  db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  db.auth.onAuthStateChange((_event,session)=>show(session));
  return db;
 }
 function show(session){
  user=session&&session.user?session.user:null;
  const out=byId('mfitCloudSignedOut'),inside=byId('mfitCloudSignedIn');
  if(out)out.hidden=!!user;if(inside)inside.hidden=!user;
  const email=byId('mfitCloudUserEmail');if(email)email.textContent=(user&&user.email)||'Angemeldet';
  if(user)say('Angemeldet als '+(user.email||'MFit-Nutzer')+'. Deine lokalen Daten wurden noch nicht hochgeladen.');
 }
 function lock(v){busy=v;document.querySelectorAll('#mfitCloudAccount button').forEach(b=>b.disabled=v);}
 function credentials(){const email=(byId('mfitCloudEmail')?.value||'').trim(),password=byId('mfitCloudPassword')?.value||'';return {email,password};}
 async function run(fn){if(busy)return;lock(true);try{await fn();}catch(e){say('Fehler: '+(e&&e.message?e.message:String(e)));}finally{lock(false);}}
 window.mfitCloudSignUp=()=>run(async()=>{const {email,password}=credentials();if(!email||password.length<8)throw Error('Bitte E-Mail und Passwort mit mindestens 8 Zeichen eingeben.');const {data,error}=await client().auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;if(data.session)show(data.session);say(data.session?'Konto erstellt und angemeldet.':'Bitte bestätige den Link in deiner E-Mail. Danach kannst du dich anmelden.');});
 window.mfitCloudSignIn=()=>run(async()=>{const {email,password}=credentials();if(!email||!password)throw Error('Bitte E-Mail-Adresse und Passwort eingeben.');const {data,error}=await client().auth.signInWithPassword({email,password});if(error)throw error;show(data.session);say('Erfolgreich angemeldet. Deine lokalen Daten wurden nicht verändert.');});
 window.mfitCloudResetPassword=()=>run(async()=>{const {email}=credentials();if(!email)throw Error('Bitte zuerst deine E-Mail-Adresse eingeben.');const {error}=await client().auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;say('Wenn ein Konto zu dieser Adresse besteht, wurde ein Link zum Zurücksetzen gesendet.');});
 window.mfitCloudSignOut=()=>run(async()=>{const {error}=await client().auth.signOut();if(error)throw error;show(null);say('Abgemeldet. Deine lokalen Daten bleiben erhalten.');});
 function snapshot(){const d={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('mfit_'))d[k]=localStorage.getItem(k);}return d;}
 window.mfitCloudUpload=()=>run(async()=>{if(!user)throw Error('Bitte zuerst anmelden.');const data=snapshot();const {error}=await client().from('mfit_user_data').upsert({user_id:user.id,data,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;say('Cloud-Backup gespeichert ('+Object.keys(data).length+' Datensätze/Einstellungen).');});
 window.mfitCloudDownload=()=>{if(!user){say('Bitte zuerst anmelden.');return;}if(!confirm('Cloud-Daten auf dieses Gerät laden? Dabei werden lokale MFit-Daten ersetzt.'))return;run(async()=>{const {data,error}=await client().from('mfit_user_data').select('data,updated_at').eq('user_id',user.id).maybeSingle();if(error)throw error;if(!data||!data.data)throw Error('Noch kein Cloud-Backup für dieses Konto vorhanden.');const payload=data.data;if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Das Cloud-Backup ist ungültig.');const keys=Object.keys(payload).filter(k=>k.startsWith('mfit_')&&typeof payload[k]==='string');if(!keys.length)throw Error('Das Cloud-Backup enthält keine MFit-Daten.');const old=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('mfit_'))old.push(k);}old.forEach(k=>localStorage.removeItem(k));keys.forEach(k=>localStorage.setItem(k,payload[k]));say('Cloud-Backup geladen. MFit wird neu gestartet …');setTimeout(()=>location.reload(),700);});};
 async function init(){try{const {data,error}=await client().auth.getSession();if(error)throw error;show(data.session);}catch(e){say('Cloud momentan nicht verfügbar: '+e.message);}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();