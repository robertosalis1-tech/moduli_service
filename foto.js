// Foto da allegare al verbale: targhette e foto varie (fotocamera o galleria).
// Salvate sul dispositivo (IndexedDB), ridimensionate, aggiunte in fondo al PDF come "Allegati fotografici".
(function(){
var KEY=location.pathname.split("/").pop()+(location.search||""),DB="moduli_foto",ST="foto",list=[];
var CATS=["Targhetta unità esterna","Targhetta unità interna","Targhetta compressore","Scheda elettronica unità interna","Scheda elettronica unità esterna","Foto generale unità esterne / impianto","Quadro elettrico / collegamenti","Altro"];
var OLD={"Impianto / installazione":"Foto generale unità esterne / impianto"};
// foto richieste per modulo (promemoria, non bloccante)
var PG=location.pathname.split("/").pop(),ALL=[0,1,2,3,4,5];
var REQ=/^mod-04/.test(PG)?[]:/^mod-03-2/.test(PG)?[0,1,5]:/^mod-05-2/.test(PG)?[0,2,4,5]:/^mod-06-2/.test(PG)?[0,2,4,5]:/^mod-/.test(PG)?ALL:[];
if(/^mod-05-2/.test(PG)){CATS[0]="Targhetta unità (chiller)";CATS[4]="Scheda elettronica unità";CATS[5]="Foto generale unità / impianto"}
function catOf(f){return OLD[f.cat]||f.cat}
function missing(){return REQ.filter(function(i){return !list.some(function(f){return catOf(f)===CATS[i]})}).map(function(i){return CATS[i]})}
function db(){return new Promise(function(ok,ko){var r=indexedDB.open(DB,1);r.onupgradeneeded=function(){r.result.createObjectStore(ST)};r.onsuccess=function(){ok(r.result)};r.onerror=function(){ko(r.error)}})}
function load(){return db().then(function(d){return new Promise(function(ok){var q=d.transaction(ST).objectStore(ST).get(KEY);q.onsuccess=function(){list=q.result||[];ok()};q.onerror=function(){ok()}})}).catch(function(){})}
function store(){return db().then(function(d){d.transaction(ST,"readwrite").objectStore(ST).put(list,KEY)}).catch(function(e){alert("Impossibile salvare la foto sul dispositivo: "+e)})}
function resize(file){return new Promise(function(ok,ko){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var M=1600,sc=Math.min(1,M/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok({data:c.toDataURL("image/jpeg",0.72),w:c.width,h:c.height})};im.onerror=function(){ko(new Error("formato non supportato"))};im.src=u})}
var st=document.createElement("style");
st.textContent="body{padding-bottom:84px!important}#fotob{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:900;border:0;border-radius:28px;background:#00884a;color:#fff;font:700 15px system-ui,Arial;padding:13px 18px;box-shadow:0 3px 10px #0004;cursor:pointer}"+
"#fotop{position:fixed;inset:0;z-index:9000;background:#f3f5f8;overflow:auto;font:15px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1f2b45;padding:calc(10px + env(safe-area-inset-top)) 14px 40px}"+
"#fotop .ht{display:flex;align-items:center;gap:10px;margin-bottom:10px}#fotop .ht b{flex:1;font-size:18px}#fotop button{border:1px solid #c9d2df;background:#fff;border-radius:10px;padding:10px 12px;font:inherit;font-weight:700;color:#1f2b45;cursor:pointer}"+
"#fotop .cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin:8px 0 14px}#fotop .cats button{background:#00884a;border-color:#00884a;color:#fff;text-align:left}#fotop .cats button.g{background:#fff;color:#1f2b45;border-color:#c9d2df}"+
"#fotop .ph{background:#fff;border-radius:12px;box-shadow:0 1px 3px #0002;padding:8px;margin:0 0 10px;display:flex;gap:10px;align-items:flex-start}#fotop .ph img{width:110px;height:110px;object-fit:cover;border-radius:8px;flex:0 0 110px}#fotop .ph div{flex:1}#fotop select,#fotop input{width:100%;box-sizing:border-box;padding:8px;border:1px solid #c9d2df;border-radius:8px;font:inherit;margin:3px 0;background:#fff8c4}#fotop small{color:#667085}"+
"#fotop .req{background:#fff;border-radius:12px;box-shadow:0 1px 3px #0002;padding:10px 12px;margin:10px 0}#fotop .rq{display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid #eef1f5}#fotop .rq span{font-weight:800;width:18px}#fotop .rq.ok span{color:#00884a}#fotop .rq.no{color:#a04a00}#fotop .rq.no span{color:#e98300}#fotop .rq button{margin-left:auto;padding:6px 10px;background:#00884a;color:#fff;border-color:#00884a}";
document.head.appendChild(st);
function esc(s){return String(s||"").replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function btn(){var b=document.getElementById("fotob");if(!b){b=document.createElement("button");b.id="fotob";b.onclick=open;document.body.appendChild(b)}var m=missing();b.textContent="📷 Foto"+(REQ.length?" "+(REQ.length-m.length)+"/"+REQ.length:(list.length?" ("+list.length+")":""));b.style.background=m.length?"#e98300":"#00884a";b.title=m.length?"Foto mancanti: "+m.join(", "):""}
function pick(cat,cam){var i=document.createElement("input");i.type="file";i.accept="image/*";if(cam)i.setAttribute("capture","environment");else i.multiple=true;
  i.onchange=async function(){for(var k=0;k<i.files.length;k++){try{var r=await resize(i.files[k]);list.push({id:Date.now()+"_"+k,cat:cat,note:"",data:r.data,w:r.w,h:r.h,t:new Date().toLocaleString("it-IT")})}catch(e){alert("Foto non caricata: "+e.message)}}await store();draw();btn()};i.click()}
function draw(){var p=document.getElementById("fotop");if(!p)return;
  p.innerHTML='<div class="ht"><b>📷 Foto da allegare al verbale</b><button data-a="x">Chiudi</button></div><small>Scatta una foto per categoria (si apre la fotocamera) oppure scegli dalla galleria. Le foto restano su questo dispositivo e vengono aggiunte in fondo al PDF del verbale.</small>'+
  (REQ.length?'<div class="req"><b>Foto richieste per il verbale</b>'+REQ.map(function(i){var ok=missing().indexOf(CATS[i])<0;return '<div class="rq '+(ok?"ok":"no")+'"><span>'+(ok?"✓":"⚠")+'</span>'+esc(CATS[i])+(ok?"":' <button data-cam="'+i+'">📷 Scatta</button>')+"</div>"}).join("")+'</div>':"")+
  '<div class="cats">'+CATS.map(function(c,i){return '<button data-cam="'+i+'">📷 '+esc(c)+"</button>"}).join("")+'<button class="g" data-gal="1">🖼 Dalla galleria</button></div>'+
  (list.length?list.map(function(f,i){return '<div class="ph"><img src="'+f.data+'"><div><select data-cat="'+i+'">'+CATS.map(function(c){return "<option"+(c===catOf(f)?" selected":"")+">"+esc(c)+"</option>"}).join("")+'</select><input data-note="'+i+'" placeholder="Descrizione (es. U.E. 1 od01, U.I. sala riunioni)" value="'+esc(f.note)+'"><small>'+esc(f.t)+'</small> <button data-del="'+i+'" style="padding:6px 10px;margin-left:6px">Elimina</button></div></div>'}).join(""):"<p><small>Nessuna foto allegata.</small></p>")+
  (list.length?'<button data-a="all" style="margin-top:6px">Elimina tutte le foto di questo modulo</button>':"")}
function open(){var p=document.createElement("div");p.id="fotop";document.body.appendChild(p);document.body.style.overflow="hidden";draw();
  p.onclick=function(e){var t=e.target;if(t.dataset.a==="x"){p.remove();document.body.style.overflow="";return}
    if(t.dataset.cam!=null){pick(CATS[+t.dataset.cam],true);return}if(t.dataset.gal){pick("Altro",false);return}
    if(t.dataset.del!=null){if(confirm("Eliminare questa foto?")){list.splice(+t.dataset.del,1);store();draw();btn()}return}
    if(t.dataset.a==="all"){if(confirm("Eliminare tutte le foto di questo modulo?")){list=[];store();draw();btn()}}};
  p.onchange=function(e){var t=e.target;if(t.dataset.cat!=null){list[+t.dataset.cat].cat=t.value;store()}};
  p.oninput=function(e){var t=e.target;if(t.dataset.note!=null){list[+t.dataset.note].note=t.value;clearTimeout(p._t);p._t=setTimeout(store,400)}}}
// pagine "Allegati fotografici" (2 foto per pagina) in un PDF jsPDF già costruito
function addPages(d){if(!list.length)return;var PW=210,PH=297,MG=14,CW=PW-2*MG,lg=document.querySelector(".hd img");
  var srt=list.slice().sort(function(a,b){return CATS.indexOf(catOf(a))-CATS.indexOf(catOf(b))});
  for(var i=0;i<srt.length;i++){if(i%2===0){d.addPage();try{if(lg)d.addImage(lg.src,"PNG",MG,8,30,6.6)}catch(e){}
      d.setFillColor(0,123,192);d.rect(0,19,PW,1.8,"F");d.setFont("helvetica","bold");d.setFontSize(12);d.setTextColor(0,62,105);d.text("Allegati fotografici",PW-MG,13,{align:"right"})}
    var f=srt[i],top=i%2===0?27:27+128,boxH=112,sc=Math.min(CW/f.w,boxH/f.h),w=f.w*sc,h=f.h*sc;
    d.setFont("helvetica","bold");d.setFontSize(9);d.setTextColor(0,62,105);
    var cap=(i+1)+". "+catOf(f)+(f.note?" - "+f.note:"");cap=cap.replace(/[^\x20-\xFF€]/g,"");d.text(d.splitTextToSize(cap,CW)[0],MG,top+4);
    d.setFont("helvetica","normal");d.setFontSize(7);d.setTextColor(110,118,130);d.text(String(f.t||""),PW-MG,top+4,{align:"right"});
    try{d.addImage(f.data,"JPEG",MG+(CW-w)/2,top+7,w,h)}catch(e){}}}
function check(){var m=missing();if(!m.length)return true;return confirm("Promemoria foto - mancano:\n\n- "+m.join("\n- ")+"\n\nLe foto si aggiungono con il pulsante 📷 Foto in basso a destra.\n\nGenerare comunque il PDF?")}
window.FOTO={addPages:addPages,count:function(){return list.length},missing:missing,check:check,open:open};
load().then(btn);
})();
