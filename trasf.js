// TRASF: passaggio della pratica (dati cliente + check list) da un telefono all'altro senza server.
// I dati viaggiano solo dentro il link inviato per email (dopo il simbolo #, che il browser non invia mai al sito):
// su GitHub non arriva nulla.
(function(){
var CL={"011":{code:"MOD 01.1",t:"Check list pre-avviamento Yutaki airH2O",page:"cl-01-1-yutaki.html",verb:"mod-01-2-yutaki.html",vt:"MOD 01.2 - Primo avviamento Yutaki"},
 "021":{code:"MOD 02.1",t:"Check list pre-avviamento Utopia / Mini Set Free",page:"cl-02-1-utopia.html",verb:"mod-02-ut.html?modulo=ut",vt:"MOD 02.2 / 02.3 - Avviamento Utopia / Mini Set Free"},
 "031":{code:"MOD 03.1",t:"Check list pre-avviamento VRF Set Free",page:"cl-03-1-set-free.html",verb:"mod-03-3-avviamento-set-free.html",vt:"MOD 03.3 - Avviamento VRF Set Free"},
 "041":{code:"MOD 04.1",t:"Verbale avviamento CSNET",page:"mod-04-1-avviamento-csnet.html",verb:"mod-04-1-avviamento-csnet.html",vt:"MOD 04.1 - Avviamento CSNET",verbale:1},
 "051":{code:"MOD 05.1",t:"Check list pre-avviamento chiller Samurai",page:"cl-05-1-samurai.html",verb:"mod-05-2-avviamento-samurai.html",vt:"MOD 05.2 - Avviamento chiller Samurai"}};
function fkey(k){return "form_"+CL[k].code.replace(/\W/g,"")+"_v1"}
function b64u(u8){var s="";for(var i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function unb64u(t){t=t.replace(/-/g,"+").replace(/_/g,"/");var b=atob(t),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
async function pipe(u8,T){var s=new Blob([u8]).stream().pipeThrough(T);return new Uint8Array(await new Response(s).arrayBuffer())}
async function pack(o){var u=new TextEncoder().encode(JSON.stringify(o));if(window.CompressionStream){try{return "z"+b64u(await pipe(u,new CompressionStream("deflate-raw")))}catch(e){}}return "j"+b64u(u)}
async function unpack(t){var u=unb64u(t.slice(1));if(t[0]==="z")u=await pipe(u,new DecompressionStream("deflate-raw"));return JSON.parse(new TextDecoder().decode(u))}
function base(){return location.href.split("#")[0].split("?")[0].replace(/[^\/]*$/,"")}
// tutte le check list caricate per la pratica (stesso cantiere con più prodotti): viaggiano insieme verso lo stesso tecnico
function forms(){var o={};Object.keys(CL).forEach(function(k){if(CL[k].verbale)return;var d=null;try{d=JSON.parse(localStorage.getItem(fkey(k))||"null")}catch(e){}if(d&&d.S&&Object.keys(d.S).some(function(n){return d.S[n]!==""&&d.S[n]!=="Off"}))o[k]=d.S});return o}
async function linkFor(k){var p=PR.get(),ss=forms();if(k&&!ss[k]){var d=null;try{d=JSON.parse(localStorage.getItem(fkey(k))||"null")}catch(e){}if(d&&d.S)ss[k]=d.S}
  var o={v:2,k:k,p:p,s:ss[k]||{},ss:ss,t:new Date().toISOString()};return base()+"index.html#d="+(await pack(o))}
async function sendTech(k,pdfBytes){var c=CL[k],p=PR.get(),url=await linkFor(k),ks=Object.keys(forms());if(ks.indexOf(k)<0)ks.unshift(k);
  var lst=ks.map(function(x){return "- "+CL[x].code+" "+CL[x].t+(CL[x].vt?" → "+CL[x].vt:"")}).join("\n")+(p.csnet?"\n- MOD 04.1 Avviamento CSNET (controllo centralizzato)":"");
  var txt="Pratica "+(p.cliente||"")+(p.citta?" - "+p.citta:"")+"\n"+(ks.length>1||p.csnet?"Check list e verbali da compilare:\n"+lst:c.code+" "+c.t)+"\n\nPer caricare i dati nell'app Moduli Service"+(ks.length>1?" (i verbali saranno già precompilati)":c.vt?" (il "+c.vt+" sarà già precompilato)":"")+":\n1) tieni premuto il link qui sotto e scegli Copia;\n2) apri l'app Moduli Service dalla schermata Home;\n3) tocca Incolla pratica ricevuta.\n(In alternativa salva il PDF allegato e nell'app tocca Carica check list compilata.)\n\n"+url+"\n\nI dati viaggiano solo in questa email: non vengono salvati su internet.";
  var sub="Pratica "+(p.cliente||"")+" - "+(ks.length>1?ks.map(function(x){return CL[x].code}).join(", ")+" compilate":c.code+" compilata");
  try{if(pdfBytes&&navigator.canShare){var f=new File([pdfBytes],(c.code+"_"+(p.cliente||"pratica")).replace(/[^\w-]+/g,"_")+".pdf",{type:"application/pdf"});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:sub,text:txt});return}}
    if(navigator.share){await navigator.share({title:sub,text:txt});return}}catch(e){if(e.name==="AbortError")return}
  location.href="mailto:?subject="+encodeURIComponent(sub)+"&body="+encodeURIComponent(txt)}
window.TRASF={CL:CL,forms:forms,fkey:fkey,pack:pack,unpack:unpack,linkFor:linkFor,sendTech:sendTech};
})();
