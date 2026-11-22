// DIPS - DIP switch dei moduli Samurai nel verbale MOD 05.2: SW301 (indirizzo + taglia) e SW302-3/4 per ogni scheda di
// controllo, master = modulo #1 (con HMI). Fonti: SMGB0104 tab. 19-22 (Samurai M R410A), PMGB0488 rev.4 (R454B).
(function(){
"use strict";
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SS=()=>{try{return S}catch(e){return window.S||{}}};const V=n=>{const s=SS()[n];return s==null?"":String(s)};
const list=()=>[1,2,3,4].map(k=>V("m"+k+"_mod")).filter(Boolean);
const brine=()=>{const f=parseFloat(String(V("set_f")).replace(",","."));return !isNaN(f)&&f<5};
function units(){const L=list(),H=window.HDIP,dm=H.samDips(L.filter(m=>/Samurai M/.test(m)),brine());let q=0;
  return L.map((m,k)=>{if(/Samurai M/.test(m)){const d=dm[q++];d.role=k?"Slave":"Master (#1)";return d}
    return {m,role:k?"Slave":"Master",note:/Samurai S/.test(m)?"Samurai S: il master (#1) e gli slave (max 4 unità) si impostano con i DIP della scheda di controllo; il commutatore DIP301 imposta l'indirizzo Modbus. Tabella dei DIP non disponibile nei manuali presenti: registrare le posizioni.":"Samurai L: impostazioni DIP non disponibili nei manuali presenti: registrare le posizioni.",
      dips:[{sw:"DIP 1",n:8,v:"",what:"Registrare la posizione"},{sw:"DIP 2",n:8,v:"",what:"Registrare la posizione"}]}})}
function card(){if(!window.HDIP||!window.DIPSW)return "";DIPSW.css();const L=list();if(!L.length)return `<section class="card"><h2>DIP switch</h2><div class="body"><p class="note">Indicare i moduli nella prima pagina.</p></div></section>`;
  let h=`<section class="card"><h2>DIP switch dei moduli</h2><div class="body"><div class="tip">i &nbsp;Samurai M: ogni scheda di controllo ha un indirizzo diverso (SW301 pin 1-5, binario), il master è il modulo #1 (con HMI attivo); i modelli da 60 a 100 kW hanno due schede (indirizzi n e n+1). Taglia (SW301 pin 6-8) e applicazione (SW302) sono impostate in fabbrica: verificarle. Con set-point acqua sotto +5 °C serve la modalità brine (SW302-3/4).</div>`;
  units().forEach((u,k)=>{h+=DIPSW.unit("dipm"+(k+1)+"_",u,"Modulo "+(k+1)+(V("m"+(k+1)+"_sn")?" · matr. "+V("m"+(k+1)+"_sn"):""))});
  return h+`</div></section>`}
function T(head,rows){return `<table><tr>${head.map(x=>`<th>${E(x)}</th>`).join("")}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${E(c)}</td>`).join("")}</tr>`).join("")}</table>`}
function pdf(){if(!window.HDIP||!window.DIPSW||!list().length)return "";let rows=[];units().forEach((u,k)=>rows=rows.concat(DIPSW.pdfRows("dipm"+(k+1)+"_",u)));
  return `<h1>Allegato - DIP switch dei moduli</h1>`+T(["Modulo","Ruolo","DIP","Posizione","Consigliato","Esito","Funzione"],rows)}
window.DIPS={card,pdf};
})();
