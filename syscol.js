// SYSCOL - colore per sistema nelle liste di U.E. / U.I. (check list 03.1, verbali 03.2 / 03.3):
// sistema 1 rosso, 2 arancio, 3 verde, 4 blu, 5 viola, 6 azzurro, 7 rosa, 8 marrone. Solo a video, non nel PDF.
(function(){
"use strict";
const COL=["#dc2626","#ea580c","#16a34a","#2563eb","#7c3aed","#0891b2","#db2777","#92400e"];
const TINT=["#fef2f2","#fff7ed","#f0fdf4","#eff6ff","#f5f3ff","#ecfeff","#fdf2f8","#fefce8"];
const SS=()=>{try{return S}catch(e){return window.S||{}}};
function nsys(){const s=SS();let n=0;for(let i=1;i<=8;i++)if(s["pr_ue"+i+"_mod"]||s["pu_ue"+i+"_mod"]||s["vi_ue"+i+"_mod"]||s["s"+i+"_m1_mod"])n=i;return Math.max(n,parseInt(s.pr_nue)||0,parseInt(s.pu_nue)||0,parseInt(s.v_nsis)||0)}
// numero di sistema dal nome del campo
function sysOf(n){let m;const s=SS();
  if((m=/^p[ru]_ue(\d)_/.exec(n)))return +m[1];
  if((m=/^sch_ui_(\d+)_\d+_/.exec(n)))return +m[1];
  if(/^sch_ui_\d+_[a-z]/.test(n))return 1;
  if((m=/^sch_ch(\d+)_/.exec(n)))return parseInt(s["sch_ch"+m[1]+"_sys"])||0;
  if((m=/^sch_cyc_(\d+)$/.exec(n)))return +m[1];
  if((m=/^s(\d)_/.exec(n)))return +m[1];
  if((m=/^vi_ue(\d+)_/.exec(n)))return +m[1];
  return 0}
function paint(){if(nsys()<2){document.querySelectorAll("[data-syscol]").forEach(x=>{x.style.background="";x.style.boxShadow="";x.removeAttribute("data-syscol")});return}
  document.querySelectorAll("tr").forEach(tr=>{const f=tr.querySelector("[data-n],[data-dipms],[data-dipma]");if(!f)return;const n=f.dataset.n||f.dataset.dipms||f.dataset.dipma||"",k=sysOf(n);
    const v=k>=1&&k<=Math.min(8,nsys())?k:0;if(String(v)===tr.getAttribute("data-syscol"))return;tr.setAttribute("data-syscol",v);
    const td=tr.cells&&tr.cells[0];if(!v){tr.style.background="";if(td)td.style.boxShadow="";return}
    tr.style.background=TINT[v-1];if(td){td.style.boxShadow="inset 5px 0 0 "+COL[v-1];td.style.color=COL[v-1];td.style.fontWeight="700"}});
  document.querySelectorAll(".dipunit").forEach(d=>{const f=d.querySelector("[data-dipk],[data-n]");if(!f)return;const k=sysOf(f.dataset.dipk||f.dataset.n||"");if(k<1||k>8)return;
    d.setAttribute("data-syscol",k);d.style.borderLeft="6px solid "+COL[k-1];d.style.background=TINT[k-1]});
  document.querySelectorAll("h2,h3,h4,#nav button,.tabs button,nav button").forEach(h=>{const m=/^\s*Sistema (\d)\b/.exec(h.textContent||"");if(!m)return;const k=+m[1];if(k<1||k>8||h.getAttribute("data-syscol")==k)return;
    h.setAttribute("data-syscol",k);if(h.tagName==="BUTTON"){h.style.boxShadow="inset 0 -3px 0 "+COL[k-1];h.style.color=COL[k-1]}else if(h.tagName==="H2"){h.style.background=COL[k-1];h.style.color="#fff"}else{h.style.color=COL[k-1];h.style.borderLeft="5px solid "+COL[k-1];h.style.paddingLeft="6px"}})}
let t=0;const run=()=>{clearTimeout(t);t=setTimeout(paint,60)};
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener("change",run,true);window.addEventListener("load",run);
window.SYSCOL={COL,TINT,paint};
})();
