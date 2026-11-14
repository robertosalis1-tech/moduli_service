// PDFVIEW: sul telefono i PDF (moduli vuoti, PDF generati) si aprono in una finestra interna all'app
// con i pulsanti "← Indietro" e "Condividi", invece di finire in una pagina senza uscita.
(function(){
var touch=("ontouchstart" in window)||navigator.maxTouchPoints>0;
var standalone=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
if(!touch&&!standalone)return;
var PJ=null;
function loadPJ(){if(PJ)return PJ;PJ=new Promise(function(ok,ko){if(window.pdfjsLib){ok(window.pdfjsLib);return}var s=document.createElement("script");s.src="lib/pdf.min.js";s.onload=function(){try{pdfjsLib.GlobalWorkerOptions.workerSrc="lib/pdf.worker.min.js"}catch(e){}ok(window.pdfjsLib)};s.onerror=function(){PJ=null;ko(new Error("lettore PDF non disponibile"))};document.head.appendChild(s)});return PJ}
var st=document.createElement("style");
st.textContent="#pdv{position:fixed;inset:0;z-index:99990;background:#525659;display:flex;flex-direction:column;font:15px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}"+
"#pdv .bar{display:flex;gap:8px;align-items:center;padding:calc(8px + env(safe-area-inset-top)) 10px 8px;background:#fff;box-shadow:0 1px 6px #0004}"+
"#pdv .bar b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#1f2b45;font-size:14px}"+
"#pdv button{border:1px solid #c9d2df;background:#fff;color:#1f2b45;border-radius:10px;padding:9px 13px;font:700 15px system-ui,Arial;cursor:pointer;white-space:nowrap}"+
"#pdv button.pri{background:#e20015;border-color:#e20015;color:#fff}"+
"#pdv .pg{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:10px 8px calc(20px + env(safe-area-inset-bottom))}"+
"#pdv canvas{display:block;width:100%;height:auto;margin:0 auto 10px;background:#fff;box-shadow:0 2px 8px #0005}"+
"#pdv .msg{color:#fff;text-align:center;padding:30px 16px}";
document.head.appendChild(st);
async function getBlob(url){var r=await fetch(url);if(!r.ok)throw new Error("HTTP "+r.status);return await r.blob()}
function nameOf(url,dn){var n=dn||decodeURIComponent((url.split("#")[0].split("?")[0].split("/").pop())||"documento.pdf");return /\.pdf$/i.test(n)?n:n+".pdf"}
async function show(url,dn){var name=nameOf(url,dn),blob=null;
  var o=document.createElement("div");o.id="pdv";o.innerHTML='<div class="bar"><button type="button" data-a="x">← Indietro</button><b></b><button type="button" class="pri" data-a="s">Condividi</button></div><div class="pg"><div class="msg">Apertura del PDF…</div></div>';
  o.querySelector("b").textContent=name;document.body.appendChild(o);var prevOv=document.documentElement.style.overflow;document.documentElement.style.overflow="hidden";
  history.pushState({pdv:1},"");
  function close(fromPop){o.remove();document.documentElement.style.overflow=prevOv;window.removeEventListener("popstate",onPop);if(!fromPop&&history.state&&history.state.pdv)history.back()}
  function onPop(){close(true)}window.addEventListener("popstate",onPop);
  o.addEventListener("click",async function(e){var b=e.target.closest("button");if(!b)return;
    if(b.dataset.a==="x"){close();return}
    if(b.dataset.a==="s"){try{if(!blob)blob=await getBlob(url);var f=new File([blob],name,{type:"application/pdf"});
        if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return}
        var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.dataset.pdv="0";document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},3000)}
      catch(err){if(err&&err.name==="AbortError")return;alert("Condivisione non riuscita: "+err.message)}}});
  var pg=o.querySelector(".pg");
  try{blob=await getBlob(url);var lib=await loadPJ();var buf=new Uint8Array(await blob.arrayBuffer());var doc=await lib.getDocument({data:buf}).promise;pg.innerHTML="";
    var W=Math.min(pg.clientWidth-16,900),dpr=Math.min(window.devicePixelRatio||1,2.5);
    for(var i=1;i<=doc.numPages;i++){if(!o.isConnected)return;var p=await doc.getPage(i),v0=p.getViewport({scale:1}),sc=W/v0.width*dpr,v=p.getViewport({scale:sc});
      var c=document.createElement("canvas");c.width=Math.floor(v.width);c.height=Math.floor(v.height);pg.appendChild(c);await p.render({canvasContext:c.getContext("2d"),viewport:v,annotationMode:lib.AnnotationMode?lib.AnnotationMode.ENABLE_FORMS:2}).promise}}
  catch(err){pg.innerHTML='<div class="msg">Anteprima non disponibile ('+String(err.message||err).replace(/[<>&]/g,"")+').<br><br>Tocca <b>Condividi</b> per aprirlo con un\'altra app (File, Mail, Acrobat).</div>'}}
// link ai PDF e download di PDF generati (anche da script)
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||a.dataset.pdv==="0")return;
  var h=a.getAttribute("href")||"",dn=a.getAttribute("download");
  var isPdf=/\.pdf(\?|#|$)/i.test(h)||dn&&/\.pdf$/i.test(dn);if(!isPdf)return;
  e.preventDefault();e.stopPropagation();show(a.href,dn)},true);
window.PDFVIEW={show:show};
})();
