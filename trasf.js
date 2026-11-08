// TRASF: passaggio della pratica (dati cliente + check list) da un telefono all'altro senza server.
// I dati viaggiano solo dentro il link inviato per email (dopo il simbolo #, che il browser non invia mai al sito):
// su GitHub non arriva nulla.
(function(){
var CL={"011":{code:"MOD 01.1",t:"Check list pre-avviamento Yutaki airH2O",page:"cl-01-1-yutaki.html",verb:"mod-01-2-yutaki.html",vt:"MOD 01.2 - Primo avviamento Yutaki"},
 "021":{code:"MOD 02.1",t:"Prenotazione avviamento Utopia / Mini Set Free",page:"cl-02-1-utopia.html",verb:"mod-02-ut.html?modulo=ut",vt:"MOD 02.2 / 02.3 - Avviamento Utopia / Mini Set Free"},
 "031":{code:"MOD 03.1",t:"Prenotazione avviamento Set Free",page:"cl-03-1-set-free.html",verb:"mod-03-3-avviamento-set-free.html",vt:"MOD 03.3 - Avviamento VRF Set Free"},
 "041":{code:"MOD 04.1",t:"Pre-avviamento CSNET",page:"cl-04-1-csnet.html",verb:"",vt:""},
 "051":{code:"MOD 05.1",t:"Check list pre-avviamento chiller Samurai",page:"cl-05-1-samurai.html",verb:"mod-05-2-avviamento-samurai.html",vt:"MOD 05.2 - Avviamento chiller Samurai"}};
function fkey(k){return "form_"+CL[k].code.replace(/\W/g,"")+"_v1"}
function b64u(u8){var s="";for(var i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function unb64u(t){t=t.replace(/-/g,"+").replace(/_/g,"/");var b=atob(t),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function pipe(u8,T){var s=new Blob([u8]).stream().pipeThrough(T);return new Uint8Array(await new Response(s).arrayBuffer())}
async function pack(o){var u=new TextEncoder().encode(JSON.stringify(o));if(window.CompressionStream){try{return "z"+b64u(await pipe(u,new CompressionStream("deflate-raw")))}catch(e){}}return "j"+b64u(u)}
async function unpack(t){var u=unb64u(t.slice(1));if(t[0]==="z")u=await pipe(u,new DecompressionStream("deflate-raw"));return JSON.parse(new TextDecoder().decode(u))}
function base(){return location.href.split("#")[0].split("?")[0].replace(/[^\/]*$/,"")}
async function linkFor(k){var p=PR.get(),d=null;try{d=JSON.parse(localStorage.getItem(fkey(k))||"null")}catch(e){}
  var o={v:1,k:k,p:p,s:d&&d.S||{},t:new Date().toISOString()};return base()+"index.html#d="+(await pack(o))}
async function sendTech(k,pdfBytes){var c=CL[k],p=PR.get(),url=await linkFor(k);
  var txt="Pratica "+(p.cliente||"")+(p.citta?" - "+p.citta:"")+"\n"+c.code+" "+c.t+" ricevuta dall'installatore.\n\nApri il link dal telefono per caricare i dati nell'app Moduli Service"+(c.vt?" (il "+c.vt+" sarà già precompilato)":"")+":\n"+url+"\n\nI dati viaggiano solo in questo link: non vengono salvati su internet.";
  var sub="Pratica "+(p.cliente||"")+" - "+c.code+" compilata";
  try{if(pdfBytes&&navigator.canShare){var f=new File([pdfBytes],(c.code+"_"+(p.cliente||"pratica")).replace(/[^\w-]+/g,"_")+".pdf",{type:"application/pdf"});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:sub,text:txt});return}}
    if(navigator.share){await navigator.share({title:sub,text:txt});return}}catch(e){if(e.name==="AbortError")return}
  location.href="mailto:?subject="+encodeURIComponent(sub)+"&body="+encodeURIComponent(txt)}
window.TRASF={CL:CL,fkey:fkey,pack:pack,unpack:unpack,linkFor:linkFor,sendTech:sendTech};
})();
