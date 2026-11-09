// REGUPD: dati garanzie (reg.js) aggiornati da BHC senza reinstallare l'app.
// Mostra la data dei dati presenti sul telefono, controlla se online ce ne sono di più recenti (reg-info.json, pochi byte)
// e con "Aggiorna dati" scarica il nuovo registro e lo salva nella copia offline dell'app.
(function(){
var host=null;
function pinfo(t){var m=/REG_INFO\s*=\s*(\{[^;]*\})/.exec(t||"");try{return m?JSON.parse(m[1]):null}catch(e){return null}}
function dnum(s){var m=/(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s||"");return m?+m[3]*10000+ +m[2]*100+ +m[1]:0}
function n(x){return x?Number(x).toLocaleString("it-IT"):"-"}
async function local(){if(window.REG_INFO)return window.REG_INFO;try{if(window.caches){var r=await caches.match("reg.js",{ignoreSearch:true});if(r)return pinfo(await r.text())}}catch(e){}
  try{var r2=await fetch("reg.js",{cache:"force-cache"});if(r2.ok)return pinfo(await r2.text())}catch(e){}return null}
async function remote(){if(!navigator.onLine)return null;try{var r=await fetch("reg-info.json?t="+Date.now(),{cache:"no-store"});if(r.ok)return await r.json()}catch(e){}return null}
async function update(b){b.disabled=true;b.textContent="Aggiornamento in corso…";
  try{var r=await fetch("reg.js?nocache="+Date.now(),{cache:"reload"});if(!r.ok)throw new Error("HTTP "+r.status);var t=await r.text();var I=pinfo(t);if(!I)throw new Error("file non valido");
    if(window.caches){var ks=await caches.keys();for(var i=0;i<ks.length;i++){var c=await caches.open(ks[i]);await c.put(new Request("reg.js"),new Response(t,{headers:{"Content-Type":"text/javascript"}}))}}
    try{await fetch("reg.js",{cache:"reload"})}catch(e){}
    try{localStorage.setItem("reg_upd",JSON.stringify(I))}catch(e){}
    alert("Dati garanzie aggiornati al "+I.data+" ("+n(I.n)+" matricole).");location.reload()}
  catch(e){b.disabled=false;b.textContent="↻ Aggiorna dati";alert("Aggiornamento non riuscito ("+e.message+"). Serve la connessione internet: riprovare più tardi.")}}
async function draw(){if(!host)return;var L=await local(),R=await remote();
  var nuovo=R&&L&&(dnum(R.data)>dnum(L.data)||(R.data===L.data&&R.n!==L.n))||R&&!L;
  host.innerHTML='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 12px;border-radius:12px;font:14px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;'+(nuovo?"background:#fff1d6;border:1px solid #f0b45a;color:#7a3b00":"background:#eef4fa;border:1px solid #c9d8ea;color:#1f2b45")+'">'+
    '<span style="flex:1;min-width:180px">'+(nuovo?'<b>Nuovi dati garanzie disponibili</b> (al '+R.data+', '+n(R.n)+' matricole). Sul telefono: '+(L?L.data:"nessun dato")+'.':'<b>Dati garanzie</b> aggiornati al '+(L?L.data:"-")+' ('+n(L&&L.n)+' matricole)'+(R?' · sono gli ultimi pubblicati':navigator.onLine?'':' · offline'))+'</span>'+
    '<button type="button" style="border:0;border-radius:10px;padding:9px 14px;font:700 14px system-ui,Arial;cursor:pointer;'+(nuovo?"background:#e98300;color:#fff":"background:#fff;color:#1f2b45;border:1px solid #c9d2df")+'">↻ Aggiorna dati</button></div>';
  host.querySelector("button").onclick=function(){update(this)}}
function init(){host=document.getElementById("regbox");
  if(!host){host=document.createElement("div");host.id="regbox";host.style.margin="10px 0";var m=document.querySelector("main")||document.body;m.insertBefore(host,m.firstChild)}
  draw();window.addEventListener("online",draw)}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
window.REGUPD={draw:draw};
})();
