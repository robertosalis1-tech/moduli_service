// DIPSW - componenti "DIP switch" per i verbali: interruttori cliccabili con valore consigliato dai manuali (HDIP),
// commutatori rotanti e, per le unità interne, l'elenco dei DIP modificati rispetto alla fabbrica.
// Valori salvati in S[chiave] come stringa di "1"/"0" (pin 1 a sinistra); se la chiave è vuota vale il valore consigliato.
(function(){
"use strict";
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SS=()=>{try{return S}catch(e){return window.S||{}}};
function redraw(){const y=window.scrollY;try{save()}catch(e){}try{if(typeof rerender==="function")rerender();else renderAll()}catch(e){try{renderAll()}catch(_){}}window.scrollTo(0,y)}
const CSS=`.dsw{border:1px solid #d6dde6;border-radius:8px;padding:6px 8px;margin:4px 0;background:#fff;display:grid;grid-template-columns:minmax(80px,120px) auto 1fr;gap:4px 10px;align-items:center}
.dsw b{font-size:12.5px;color:#1f4f78}.dsw .pins{display:flex;gap:3px}.dsw .pin{display:flex;flex-direction:column;align-items:center;font-size:10px;color:#64748b}
.dsw .pin button{width:20px;height:32px;border:1px solid #475569;border-radius:3px;background:linear-gradient(#e2e8f0 50%,#334155 50%);padding:0;cursor:pointer}
.dsw .pin button.on{background:linear-gradient(#334155 50%,#e2e8f0 50%)}.dsw .pin button.x{opacity:.35;cursor:default}
.dsw .st{font-size:12px;line-height:1.3}.dsw .ok{color:#15803d}.dsw .ko{color:#b45309;font-weight:700}.dsw .df{color:#64748b}
.dsw .need{display:inline-block;background:#f97316;color:#fff;border-radius:4px;padding:0 5px;font-size:10.5px;font-weight:700;margin-right:4px}
.dsw .exp{font-family:monospace;font-size:11.5px;color:#334155}.dsw select{max-width:70px}
.dipunit .dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:0 8px}.dipunit{border:1px solid #c7d2fe;border-radius:10px;padding:8px 10px;margin:8px 0;background:#f8fafc}.dipunit h4{margin:0 0 4px;font-size:13.5px}
.dipm{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.dipm .chip{display:inline-flex;gap:4px;align-items:center;border:1px solid #cbd5e1;border-radius:6px;padding:2px 4px;background:#fff;font-size:11px}
.dipm .chip button.p{width:12px;height:20px;border:1px solid #475569;border-radius:2px;padding:0;background:linear-gradient(#e2e8f0 50%,#334155 50%)}.dipm .chip button.p.on{background:linear-gradient(#334155 50%,#e2e8f0 50%)}
.dipm .chip select{font-size:11px;padding:0;max-width:70px}.dipm .add,.dipm .del{font-size:11px;padding:1px 6px;border:1px solid #94a3b8;border-radius:5px;background:#fff;cursor:pointer}`;
function css(){if(document.getElementById("dipsw-css"))return;const s=document.createElement("style");s.id="dipsw-css";s.textContent=CSS;document.head.appendChild(s)}
// pattern visualizzato: valore salvato oppure consigliato
const cur=(k,exp,n)=>{const v=SS()[k];return typeof v==="string"&&v.length?v:(exp||"0".repeat(n))};
function pinsHTML(k,n,v,dis){let h="";for(let i=0;i<n;i++){const c=v[i];h+=`<span class="pin">${i+1}<button type="button" class="${c==="1"?"on":""}${c==="-"||dis?" x":""}" ${dis||c==="-"?"disabled":""} data-dipk="${E(k)}" data-dipi="${i}" data-dipn="${n}" data-dipe="${E(dis?"":v)}" title="Pin ${i+1}: ${c==="1"?"ON":"OFF"}"></button></span>`}return `<div class="pins">${h}</div>`}
// una riga DSW: d={sw,n,v(consigliato),what,need,src,rot}
function row(k,d){css();const s=SS(),saved=typeof s[k]==="string"&&s[k].length;
  if(d.rot){const v=saved?s[k]:(d.v||"0");const st=d.v===""?"":v===d.v?`<span class="ok">✓ ${saved?"verificato":"consigliato"}</span>`:`<span class="ko">⚠ consigliato ${E(d.v)}</span>`;
    return `<div class="dsw"><b>${E(d.sw)}</b><select data-n="${E(k)}">${"0123456789".split("").map(c=>`<option${c===v?" selected":""}>${c}</option>`).join("")}</select><div class="st">${d.need?'<span class="need">DA IMPOSTARE</span>':""}${E(d.what||"")} ${st}</div></div>`}
  const n=d.n,v=cur(k,d.v,n),known=!!d.v&&!/\?/.test(d.v);
  const same=known&&v.split("").every((c,i)=>d.v[i]==="-"||d.v[i]==="?"||c===d.v[i]);
  const st=!known?`<span class="df">valore da manuale non disponibile: impostare / verificare sul manuale dell'unità</span>`:same?`<span class="ok">✓ ${saved?"verificato":"valore consigliato"}</span>`:`<span class="ko">⚠ diverso dal consigliato <span class="exp">${fmt(d.v)}</span></span>`;
  return `<div class="dsw"><b>${E(d.sw)}</b>${pinsHTML(k,n,v)}<div class="st">${d.need?'<span class="need">DA IMPOSTARE</span>':""}${E(d.what||"")}${d.src?` <span class="df">(${E(d.src)})</span>`:""}<br>${st}</div></div>`}
function fmtP(v){const on=String(v||"").split("").map((c,i)=>c==="1"?i+1:0).filter(Boolean);return on.length?"ON: "+on.join(", "):"tutti OFF"}
function fmt(v){return String(v||"").split("").map((c,i)=>(i+1)+(c==="1"?"■":c==="0"?"□":"·")).join(" ")}
// valore finale (per PDF e controlli)
function val(k,d){if(d.rot){const s=SS()[k];return s!=null&&s!==""?String(s):(d.v||"0")}return cur(k,d.v,d.n)}
function ok(k,d){if(!d.v||/\?/.test(d.v))return null;const v=val(k,d);return d.rot?v===d.v:v.split("").every((c,i)=>d.v[i]==="-"||c===d.v[i])}
// blocco di un'unità: u={m,role,dips:[...]}, pref = prefisso chiavi (es. "s1_m2_")
function unit(pref,u,title){css();return `<div class="dipunit"><h4>${E(title||"")}${u.role?` · <span style="color:#7c3aed">${E(u.role)}</span>`:""} <span style="font-weight:400;color:#475569">${E(u.m||"")}</span></h4>${u.note?`<div class="tip">i &nbsp;${E(u.note)}</div>`:""}<div class="dl">${(u.dips||[]).map(d=>row(pref+d.sw.toLowerCase().replace(/[^a-z0-9]+/g,""),d)).join("")}</div></div>`}
function keyOf(pref,d){return pref+d.sw.toLowerCase().replace(/[^a-z0-9]+/g,"")}
// tabella testo per il PDF
function pdfRows(pref,u){return (u.dips||[]).map(d=>{const k=keyOf(pref,d),v=val(k,d),o=ok(k,d);return [u.m?u.m.replace(/^Samurai [SML] - /,""):"",u.role||"",d.sw,d.rot?v:fmtP(v),d.v&&!/\?/.test(d.v)?(d.rot?d.v:fmtP(d.v)):"vedi manuale",o==null?"-":o?"OK":"DIVERSO",d.what||""]})}
// ---------------- DIP modificati delle unità interne: S[k]="DSW2=1000;DSW7=0100"
const DSWL=["DSW1","DSW2","DSW3","DSW4","DSW5","DSW6","DSW7","DSW8","DSW9","DSW10","DSW18"];
function parseM(s){return String(s||"").split(";").map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.split("=");return {sw:m[0]||"DSW2",v:(m[1]||"0000").replace(/[^01]/g,"")||"0000"}})}
const joinM=a=>a.map(x=>x.sw+"="+x.v).join(";");
function mods(k){css();const a=parseM(SS()[k]);return `<div class="dipm">${a.map((x,i)=>`<span class="chip"><select data-dipms="${E(k)}" data-dipi="${i}">${DSWL.map(o=>`<option${o===x.sw?" selected":""}>${o}</option>`).join("")}</select>${x.v.split("").map((c,j)=>`<button type="button" class="p${c==="1"?" on":""}" data-dipmk="${E(k)}" data-dipi="${i}" data-dipj="${j}" title="pin ${j+1}"></button>`).join("")}<select data-dipml="${E(k)}" data-dipi="${i}" title="numero di pin">${[2,3,4,6,8].map(n=>`<option${n===x.v.length?" selected":""}>${n}</option>`).join("")}</select><button type="button" class="del" data-dipmd="${E(k)}" data-dipi="${i}">✕</button></span>`).join("")}<button type="button" class="add" data-dipma="${E(k)}">+ DIP</button></div>`}
function modsTxt(k){return parseM(SS()[k]).map(x=>x.sw+" "+fmtP(x.v)).join(" · ")}
document.addEventListener("click",e=>{const b=e.target.closest("[data-dipk],[data-dipmk],[data-dipma],[data-dipmd]");if(!b)return;const s=SS();
  if(b.dataset.dipk){const k=b.dataset.dipk,n=+b.dataset.dipn,i=+b.dataset.dipi;let v=(typeof s[k]==="string"&&s[k].length?s[k]:b.dataset.dipe||"0".repeat(n)).split("");while(v.length<n)v.push("0");v[i]=v[i]==="1"?"0":"1";s[k]=v.join("").replace(/[^01]/g,"0");redraw();return}
  if(b.dataset.dipma){const a=parseM(s[b.dataset.dipma]);a.push({sw:"DSW2",v:"0000"});s[b.dataset.dipma]=joinM(a);redraw();return}
  if(b.dataset.dipmd){const a=parseM(s[b.dataset.dipmd]);a.splice(+b.dataset.dipi,1);s[b.dataset.dipmd]=joinM(a);redraw();return}
  if(b.dataset.dipmk){const k=b.dataset.dipmk,a=parseM(s[k]),x=a[+b.dataset.dipi],j=+b.dataset.dipj;if(!x)return;const v=x.v.split("");v[j]=v[j]==="1"?"0":"1";x.v=v.join("");s[k]=joinM(a);redraw()}},true);
document.addEventListener("change",e=>{const t=e.target,s=SS();
  if(t.dataset&&t.dataset.dipms){const k=t.dataset.dipms,a=parseM(s[k]);a[+t.dataset.dipi].sw=t.value;s[k]=joinM(a);redraw()}
  else if(t.dataset&&t.dataset.dipml){const k=t.dataset.dipml,a=parseM(s[k]),x=a[+t.dataset.dipi],n=+t.value;x.v=(x.v+"00000000").slice(0,n);s[k]=joinM(a);redraw()}},true);
window.DIPSW={fmtP,row,unit,val,ok,fmt,keyOf,pdfRows,mods,modsTxt,css};
})();
