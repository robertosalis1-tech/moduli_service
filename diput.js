// DIPUT - DIP switch nel verbale Utopia / Mini Set Free (MOD 02.2 / 02.3): per ogni unità esterna ciclo frigorifero,
// resistenza terminale e capacità (registrata dal tecnico: tabella non disponibile nei manuali), per ogni unità interna
// indirizzo, ciclo e DIP modificati. Usa le funzioni del modulo (S, nue, nui, sx) e HDIP / DIPSW.
(function(){
"use strict";
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SS=()=>{try{return S}catch(e){return window.S||{}}};const V=n=>{const s=SS()[n];return s==null?"":String(s)};
const N=()=>{try{return nue()}catch(e){return 1}},NI=()=>{try{return nui()}catch(e){return 1}};
const row0=k=>(k-1)*(NI()+1),ueMod=k=>k===1?V("modello_ue"):V("tb_mod_"+row0(k));
function cyc(k){const v=V("dip_cyc"+(k===1?"":"_u"+k));return v!==""?Math.max(0,Math.min(63,parseInt(v)||0)):k-1}
function term(k){const one=V("dip_hlink")!=="Linee H-LINK separate";const set=V("set_term");if(k===1&&/^ON/.test(set))return true;if(k===1&&/^OFF/.test(set))return false;return one?k===1:true}
function ueDips(k){const m=ueMod(k),H=window.HDIP,t=H?H.utTerm(m):{sw:"DSW5",n:2},c=cyc(k),on=term(k);
  if(H&&H.vSeries(m)==="mini"){const u=H.vrfDips([m],{tubi:2,cycle:c,term:on,hsp:V("dip_hsp"+(k===1?"":"_u"+k))==="Sì"?1:0,lowamb:false})[0];u.role="";return u}
  const d=H&&H.utDips?H.utDips(m,c,on):null;if(d)return d;
  return {m,role:"",note:m?"Modello senza tabella DIP nei manuali disponibili: registrare la posizione trovata sul PCB.":"",dips:[
    {sw:"DSW3",n:6,v:"",what:"Capacità / modello (di fabbrica): registrare la posizione trovata"},
    {sw:"DSW4",n:6,v:H?H.bin(Math.floor(c/10),6):"",what:"Ciclo frigorifero - decine ("+c+")",need:c>=10},
    {sw:"RSW1",rot:1,v:String(c%10),what:"Ciclo frigorifero - unità ("+c+")",need:c%10!==0},
    {sw:t.sw,n:t.n,v:on?"10":"00",what:on?"Resistenza terminale ON (pin 1)":"Resistenza terminale OFF: un'altra U.E. della stessa linea H-LINK la tiene ON",need:!on,src:t.src}]}}
function uis(k){const r0=row0(k),o=[];for(let j=1;j<=NI();j++)o.push(r0+j);return o}
function card(k){if(!window.HDIP||!window.DIPSW)return "";DIPSW.css();const s=k===1?"":"_u"+k,u=ueDips(k);
  let h=`<section class="card"><h2>DIP switch</h2><div class="body"><div class="tip">i &nbsp;I DIP si preimpostano dal modello (PMML0545 Utopia RAS-(4-6)H(V)(R/N)(C/P)2E, PMML0511 Mini Set Free FS(V)NME / FSXNME): capacità di fabbrica, ciclo frigorifero e resistenza terminale. Per i modelli non in tabella registrare la posizione trovata sul PCB. Toccare i pin per cambiarli: in verde se coincide con il consigliato, in arancione se diverso.</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:6px 10px"><label style="font-size:12.5px">N. ciclo frigorifero<input data-n="dip_cyc${s}" inputmode="numeric" value="${E(V("dip_cyc"+s))}" placeholder="${k-1}"></label>${window.HDIP&&HDIP.vSeries(u.m)==="mini"?`<label style="font-size:12.5px">Alta pressione statica (DSW8)<select data-n="dip_hsp${s}">${["No","Sì"].map(x=>`<option${x===(V("dip_hsp"+s)||"No")?" selected":""}>${x}</option>`).join("")}</select></label>`:""}${k===1&&N()>1?`<label style="font-size:12.5px">Linea H-LINK<select data-n="dip_hlink">${["Una sola linea H-LINK","Linee H-LINK separate"].map(x=>`<option${x===(V("dip_hlink")||"Una sola linea H-LINK")?" selected":""}>${x}</option>`).join("")}</select></label>`:""}</div>`
  +DIPSW.unit("dipue"+k+"_",u,"Unità esterna "+k)
  +`<h3 style="font-size:13.5px;margin:10px 0 4px">Unità interne</h3><div class="scroll"><table class="ftab"><tr><th>U.I.</th><th>Modello</th><th>Indirizzo</th><th>Ciclo</th><th>Commutatori</th><th>DSW3 / DSW4 attesi</th><th>DIP modificati</th></tr>`;
  uis(k).forEach((r,j)=>{const m=V("tb_mod_"+r),d=m?HDIP.iu(m):null;h+=`<tr><td class="rl">${E(V("tb_tag_"+r)||("U.I. "+(j+1)))}</td><td>${E(m||"-")}</td><td><input data-n="tb_ind_${r}" inputmode="numeric" style="width:52px;min-width:52px" value="${E(V("tb_ind_"+r))}" placeholder="${j+1}"></td><td><input data-n="tb_cyc_${r}" inputmode="numeric" style="width:52px;min-width:52px" value="${E(V("tb_cyc_"+r))}" placeholder="${cyc(k)}"></td><td style="font-size:11px">${d&&d.known?`ind.: DSW6 + ${d.rswAddr}<br>ciclo: DSW5 + ${d.rswCyc}`:"DSW6 + RSW (ind.)<br>DSW5 + RSW (ciclo)"}</td><td style="font-size:11px;font-family:monospace">${d&&d.cap?"DSW3 "+DIPSW.fmt(d.cap):"DSW3 -"}<br>${d&&d.model?"DSW4 "+DIPSW.fmt(d.model):"DSW4 -"}</td><td>${DIPSW.mods("tb_dipm_"+r)}</td></tr>`});
  return h+`</table></div></div></section>`}
function T(head,rows){return `<table><tr>${head.map(x=>`<th>${E(x)}</th>`).join("")}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${E(c)}</td>`).join("")}</tr>`).join("")}</table>`}
function pdf(){if(!window.HDIP||!window.DIPSW)return "";let h=`<h1>Allegato - DIP switch</h1>`;
  for(let k=1;k<=N();k++){const u=ueDips(k);h+=`<h2>Unità esterna ${k} - ${E(u.m||"")} (ciclo ${cyc(k)})</h2>`+T(["Modello","Unità","DIP","Posizione","Consigliato","Esito","Funzione"],DIPSW.pdfRows("dipue"+k+"_",u));
    const rr=uis(k).map((r,j)=>[V("tb_tag_"+r)||"U.I. "+(j+1),V("tb_mod_"+r),V("tb_ind_"+r),V("tb_cyc_"+r)||String(cyc(k)),DIPSW.modsTxt("tb_dipm_"+r)||"nessuno"]).filter(r=>r[1]||r[2]||r[4]!=="nessuno");
    if(rr.length)h+=T(["U.I.","Modello","Indirizzo","Ciclo","DIP modificati"],rr)}
  return h}
window.DIPUT={card,pdf};
})();
