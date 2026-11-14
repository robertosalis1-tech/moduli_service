// MOBILE: correzioni per telefono e tablet comuni a tutti i moduli.
// - niente zoom automatico quando si tocca una casella (iPhone ingrandisce i testi sotto 16 px)
// - intestazione che scorre via: resta fissa solo la barra delle schede (anche in orizzontale)
// - tasto ± sopra il tastierino numerico (su iPhone il tastierino non ha il segno meno)
(function(){
var st=document.createElement("style");
st.textContent="input:not([type=checkbox]):not([type=radio]),select,textarea{font-size:16px!important}"+
"header{position:static!important}.navw2{position:sticky;top:0;z-index:20;background:#fff;box-shadow:0 1px 4px #0002;padding-top:env(safe-area-inset-top)}"+
"@media (max-height:500px){header .band{display:none}header .hd img{height:22px!important}header h1{font-size:15px!important}}"+
"#pmk{position:fixed;left:0;z-index:9800;display:none;gap:8px;padding:6px 10px;background:#e9edf3;border-top:1px solid #c9d2df;width:100%;box-sizing:border-box;justify-content:flex-end;align-items:center;font:600 13px system-ui,-apple-system,Arial}"+
"#pmk span{margin-right:auto;color:#667085}#pmk button{border:1px solid #b9c4d3;background:#fff;border-radius:9px;padding:8px 16px;font:700 18px system-ui,Arial;color:#1f2b45;min-width:56px}";
document.head.appendChild(st);
function fixNav(){var h=document.querySelector("header"),n=h&&h.querySelector("nav");if(!n||n.closest(".navw2"))return;var w=document.createElement("div");w.className="navw2";h.after(w);w.appendChild(n)}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fixNav):fixNav();
// tasto ± per le caselle numeriche
var bar=null,cur=null;
function isNum(el){return el&&el.tagName==="INPUT"&&/^(decimal|numeric)$/.test(el.getAttribute("inputmode")||"")&&!el.readOnly}
function place(){if(!bar||!cur)return;var vv=window.visualViewport;var bottom=vv?(vv.offsetTop+vv.height):window.innerHeight;bar.style.top=(bottom-bar.offsetHeight)+"px"}
function mk(){bar=document.createElement("div");bar.id="pmk";bar.innerHTML='<span>Valore negativo?</span><button type="button" data-k="neg">−</button><button type="button" data-k="pm">±</button>';
  bar.addEventListener("mousedown",function(e){e.preventDefault()});bar.addEventListener("touchstart",function(e){e.preventDefault();act(e.target)},{passive:false});bar.addEventListener("click",function(e){act(e.target)});document.body.appendChild(bar)}
function act(t){if(!cur||!t||!t.dataset||!t.dataset.k)return;var v=cur.value.trim();
  if(t.dataset.k==="neg"){if(!/^-/.test(v))v="-"+v}else{v=/^-/.test(v)?v.slice(1):"-"+v}
  cur.value=v;cur.dispatchEvent(new Event("input",{bubbles:true}));try{cur.focus();cur.setSelectionRange(v.length,v.length)}catch(e){}}
var touch=("ontouchstart" in window)||navigator.maxTouchPoints>0;
document.addEventListener("focusin",function(e){if(!touch||!isNum(e.target))return;cur=e.target;if(!bar)mk();bar.style.display="flex";place();setTimeout(place,300);setTimeout(place,700)});
document.addEventListener("focusout",function(e){setTimeout(function(){if(!isNum(document.activeElement)){cur=null;if(bar)bar.style.display="none"}},120)});
if(window.visualViewport){visualViewport.addEventListener("resize",place);visualViewport.addEventListener("scroll",place)}

// MAIUSCOLO: tutte le caselle di testo si compilano in maiuscolo (escluse email, numeri, date e caselle con elenco a scelta)
var NOUPRX=/mail|pec|url|sito|password|pwd|web/i;
function upOk(t){if(!t||t.readOnly||t.disabled)return false;if(t.tagName==="TEXTAREA")return !NOUPRX.test((t.dataset.n||t.name||t.id||""));
  if(t.tagName!=="INPUT")return false;var ty=(t.getAttribute("type")||"text").toLowerCase();if(ty!=="text"&&ty!=="search")return false;
  if(/^(decimal|numeric|tel|email|url)$/.test(t.getAttribute("inputmode")||""))return false;if(t.dataset.noup!=null)return false;if(t.hasAttribute("list")){var dl=t.list,os=dl?dl.options:[];for(var i=0;i<os.length&&i<400;i++){var ov=os[i].value||"";if(ov!==ov.toUpperCase())return false}}
  return !NOUPRX.test((t.dataset.n||"")+" "+(t.name||"")+" "+(t.id||"")+" "+(t.placeholder||""))}
window.addEventListener("input",function(e){var t=e.target;if(e.isComposing||!upOk(t))return;var v=t.value,u=v.toUpperCase();if(v===u)return;var a=t.selectionStart,b=t.selectionEnd;t.value=u;try{t.setSelectionRange(a,b)}catch(x){}},true);
document.addEventListener("compositionend",function(e){var t=e.target;if(upOk(t)&&t.value!==t.value.toUpperCase()){t.value=t.value.toUpperCase();t.dispatchEvent(new Event("input",{bubbles:true}))}},true);
})();
