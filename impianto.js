// IMP - configurazione impianto Yutaki / airH2O: opzioni, ingressi / uscite, morsettiera TB2,
// collegamenti degli accessori (con relè) e schema idraulico semplificato.
// Dati morsettiera: TCIT0150 par. 9.6.1, TCIT0153 par. 9.6.1, TCIT0154 par. 9.5.1 e 11.5.3.
// Usa le variabili globali del modulo: S (dati), esc().
(function(){
"use strict";
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SS=()=>{try{return S}catch(e){return window.S||{}}};const V=n=>(SS()[n])||"";
// ---------------- opzioni di configurazione
const OPT={
 imp_term1:["","Pavimento radiante","Radiatori","Fancoil","Canalizzate idroniche","Fancoil + radiatori","Pavimento + fancoil (deumidificazione)"],
 imp_c2:["","No","Sì - miscelato (valvola miscelatrice + WP2)","Sì - diretto (solo WP2)"],
 imp_term2:["","Pavimento radiante","Radiatori","Fancoil","Canalizzate idroniche"],
 imp_sep:["","Nessuno (collegamento diretto)","Volano termico in serie sul ritorno","Separatore idraulico / puffer a 4 attacchi (WP3)"],
 imp_acs:["","Nessuna","Serbatoio integrato (Combi)","Bollitore esterno con valvola 3 vie"],
 imp_acs_res:["","Nessuna","Hitachi (uscita 30-31)","Non Hitachi (con relè / contattore)"],
 imp_ric:["","No","Sì"],
 imp_sol:["","No","Sì - circolazione forzata (pompa solare)"],
 imp_cald:["","No","Sì - in serie dopo l'U.I.","Sì - in parallelo sul separatore"],
 imp_resx:["","No","Sì - riscaldatore ausiliario esterno (non Hitachi)"],
 imp_pisc:["","No","Sì"],
 imp_fv:["","No","Sì - contatto NA (chiuso con produzione)","Sì - contatto NC (aperto con produzione)"],
 imp_sg:["","No","Sì - Smart Grid Ready (2 contatti)"],
 imp_ta:["","Comando Hitachi come termostato ambiente","Termostato ambiente esterno ON/OFF (Input 1)","Termostati separati C1 e C2 (Input 1 e 2)","Nessuno (solo curva climatica)"],
 imp_raff:["","No","Sì"],
 imp_aqs:["","No","Sì (ATW-AQT-01, consigliato con pavimento)"],
 imp_vh:["","Accessori Hitachi (collegamento diretto)","Non Hitachi (con relè)"],
 imp_filtro:["","Defangatore magnetico","Filtro a Y","Defangatore + filtro a Y"]};
const LAB={imp_term1:"Terminali circuito 1 (C1)",imp_c2:"Circuito 2 (C2)",imp_term2:"Terminali circuito 2",imp_sep:"Volano / separatore idraulico",imp_acs:"Acqua calda sanitaria",imp_acs_res:"Resistenza elettrica del bollitore",imp_ric:"Pompa di ricircolo ACS",imp_sol:"Solare termico",imp_cald:"Caldaia di integrazione",imp_resx:"Riscaldatore elettrico esterno",imp_pisc:"Piscina",imp_fv:"Fotovoltaico (contatto alla scheda)",imp_sg:"Smart Grid Ready",imp_ta:"Termostato ambiente",imp_raff:"Raffrescamento",imp_aqs:"Termostato di sicurezza (Aquastat 22-23)",imp_vh:"Valvole 3 vie / miscelatrice",imp_filtro:"Filtro sul ritorno"};
// ---------------- tipo di impianto dai modelli
function kind(){const t=V("tipo")||V("tipo_unita"),ui=V("ui_mod")||V("modello_ui"),ue=V("ue_mod")||V("r290_mod")||V("modello_ue");
  const ytc=/Yutampo|Triple/i.test(t)||/^TAW-/i.test(ui);
  const combi=/Combi/i.test(t)||/^(RWD|HWD)/i.test(ui);
  const cbx=/CBX|control box/i.test(ui);
  const mono=!ytc&&(/Yutaki M|800 M/i.test(t)||/^RASM-.*(VR2E|VRE|R1E|RW1E)$/i.test(ue)||cbx||(/TW2E/i.test(ue)&&!/^(HWM|HWD)/i.test(ui)))&&!/^(HWM|HWD)/i.test(ui);
  const hydro=!ytc&&(/800 H/i.test(t)||/^(HWM|HWD|RWH)/i.test(ui));
  const split=!ytc&&!mono&&!hydro;
  const rwh=/^RWH/i.test(ui),casc=V("sch_casc")==="SI"||V("cascata")==="SI",N=casc?Math.max(2,Math.min(8,+V("sch_casc_n")||+V("n_unita")||2)):1;
  return {ytc,combi,cbx,mono,hydro,split,rwh,casc,N,ui,ue,r290:/TW2E/i.test(ue)||V("gas")==="R290"}}
const has=(n,re)=>re.test(V(n));
function cfg(){const k=kind(),acs=k.combi?"int":has("imp_acs",/esterno/)?"ext":(has("imp_acs",/integrato/)?"int":"no");
  return Object.assign(k,{acs,c2:has("imp_c2",/^Sì/),c2mix:has("imp_c2",/miscelato/),sep:has("imp_sep",/Separatore/),vol:has("imp_sep",/Volano/),
   sol:has("imp_sol",/^Sì/)&&acs!=="no",cald:has("imp_cald",/^Sì/),caldPar:has("imp_cald",/parallelo/),resx:has("imp_resx",/^Sì/),pisc:has("imp_pisc",/^Sì/),
   fv:has("imp_fv",/^Sì/),fvNC:has("imp_fv",/NC/),sg:has("imp_sg",/^Sì/),ric:has("imp_ric",/^Sì/)&&acs!=="no",
   eh:acs==="ext"&&has("imp_acs_res",/^Hitachi/),ehx:acs==="ext"&&has("imp_acs_res",/Non Hitachi/),
   ta1:has("imp_ta",/esterno|separati/),ta2:has("imp_ta",/separati/),aqs:has("imp_aqs",/^Sì/),vh:!has("imp_vh",/Non Hitachi/),raff:has("imp_raff",/^Sì/),
   term1:V("imp_term1"),term2:V("imp_term2")})}
// ---------------- ingressi / uscite: proposta automatica e scelta del tecnico
const IOT={Input_1:[13,14],Input_2:[13,15],Input_3:[16,17],Input_4:[16,18],Input_5:[16,19],Input_6:[16,20],Input_7:[16,21],Output_1:[34,35],Output_2:[34,36],Output_3:[37,38],Output_4:[39,40],Output_9:[32,34]};
const INPUTS=["Disabilitato","Richiesta ON/OFF","Azione Smart","Piscina","Solare","Modalità di funzionamento","Boost ACS","Misuratore Potenza 1","Misuratore di Potenza 2","Richiesta ON/OFF C1","Richiesta ON/OFF C2","Riscaldamento Forzato","Raffreddamento Forzato","Modalità ECO C1 e C2","Modalità ECO C1","Modalità ECO C2","Spegnimento Forzato","Smart Grid Ready 2","Pompa di drenaggio","Riduzione Notturna"];
const OUTPUTS=["Disabilitato","3WV SWP","WP3","Combinazione Caldaia","Riscaldatore ausiliario","Pompa Solare","Segnale di Allarme","Segnale Operativo","Segnale di Raffreddamento","Segnale di Riscaldamento","Segnale Richiesta ON C1","Segnale ACS","Surriscaldamento Solare","Sbrinamento","Pompa Ricircolo ACS","Riscaldamento Costante","Raffreddamento Costante"];
function ioAuto(c){const a={},free=o=>!a[o];
  if(c.ta2){a.Input_1="Richiesta ON/OFF C1";a.Input_2="Richiesta ON/OFF C2"}else if(c.ta1)a.Input_1="Richiesta ON/OFF";
  if(c.pisc){a.Input_3="Piscina";a.Output_1="3WV SWP"}
  if(c.sol){a.Input_4="Solare";a.Output_4="Pompa Solare"}
  if(c.fv||c.sg)a.Input_5="Azione Smart";if(c.sg)a.Input_6="Smart Grid Ready 2";
  if(c.sep)a.Output_2="WP3";
  if(c.cald)a.Output_3="Combinazione Caldaia";else if(c.resx)a.Output_3="Riscaldatore ausiliario";
  const outs=(c.combi?["Output_9"]:[]).concat(["Output_4","Output_1","Output_2","Output_3"]);
  if(c.cald&&c.resx){const o=outs.find(free);if(o)a[o]="Riscaldatore ausiliario"}
  if(c.ric){const o=outs.find(free);if(o)a[o]="Pompa Ricircolo ACS"}
  return a}
function ioMap(c){const a=ioAuto(c),m={};Object.keys(IOT).forEach(n=>{if(n==="Output_9"&&!c.combi)return;const u=V("imp_io_"+n)||(V(n)&&V(n)!=="Disabilitato"?V(n):"");m[n]=u||a[n]||""});return {m,a}}
// ---------------- funzioni collegate alla morsettiera (terminali, descrizione, categoria, relè)
function wiring(c){const L=[],{m}=ioMap(c),R=!c.vh;
  const add=(t,lab,cat,o)=>L.push(Object.assign({t,lab,cat},o||{}));
  add([1,2],"H-LINK verso U.E."+(c.casc?" / controller cascata":""),"bus",{dev:"bus"});
  add([3,4],"Comando PC-ARFH3E","bus",{dev:"ctl"});
  if(c.acs==="ext"&&!c.combi)add([5,6],"Sonda ACS THMDHW (nel pozzetto del bollitore)","sn",{dev:"sensor"});
  if(c.c2)add([7,6],"Sonda mandata C2 (Two2) dopo valvola miscelatrice e WP2","sn",{dev:"sensor"});
  if(c.sep||c.cald||c.vol)add([8,9],"Sonda Two3 dopo "+(c.sep?"il separatore":c.cald?"la caldaia":"il volano"),"sn",{dev:"sensor"});
  if(c.pisc)add([10,9],"Sonda piscina Tswp (nello scambiatore a piastre)","sn",{dev:"sensor"});
  if(c.aqs)add([22,23],"Aquastat di sicurezza C1 (ATW-AQT-01)","sn",{dev:"aqs"});
  if(c.c2&&c.c2mix)add([24,25,26],"Valvola miscelatrice C2 (24 chiude, 25 apre, 26 N)","out",{dev:"vmix",relay:R});
  if(c.c2)add([26,27],"Pompa WP2 circuito 2 (26 N, 27 L)","out",{dev:"pump",name:"WP2",relay:true});
  if(c.eh)add([30,31],"Riscaldatore del bollitore (EH4) tramite contattore","out",{dev:"heater",relay:true});
  if(c.ehx)add([30,31],"Resistenza bollitore non Hitachi tramite contattore","out",{dev:"heater",relay:true});
  if(c.acs==="ext"&&!c.combi)add([32,33,34],"Valvola 3 vie ACS (32 C, 33 L, 34 N)","out",{dev:"v3",relay:R});
  Object.keys(IOT).forEach(n=>{const f=m[n];if(!f||f==="Disabilitato")return;const t=IOT[n],out=n.startsWith("Output"),lab=n.replace("_"," ")+": "+f;
    if(!out){const dev=/Smart/.test(f)?(c.fv&&n==="Input_5"?"pv":"sg"):/ON\/OFF/.test(f)?"ta":/Solare/.test(f)?"solin":/Piscina/.test(f)?"poolin":/Misuratore/.test(f)?"meter":"contact";add(t,lab,"in",{dev,nc:dev==="pv"&&c.fvNC});return}
    const dev=/WP3/.test(f)?"pump":/Ricircolo/.test(f)?"pump":/Solare/.test(f)&&/Pompa/.test(f)?"pump":/Caldaia/.test(f)?"boiler":/ausiliario/.test(f)?"heater":/3WV/.test(f)?"v3":"signal";
    add(t,lab,"out",{dev,name:/WP3/.test(f)?"WP3":/Ricircolo/.test(f)?"Ricircolo ACS":/Solare/.test(f)?"Pompa solare":"",relay:dev==="v3"?R:true})});
  return L}
// ---------------- etichette dei morsetti TB2 (variante con bollitore separato / Combi / Yutaki H)
function tbLabels(c){const T={1:"H-LINK",2:"H-LINK",3:"Comando",4:"Comando",5:c.combi?"Terra":"THMDHW",6:"Com.",7:"Two2",8:"Two3",9:"Com.",10:"Tswp",11:c.rwh?"T quadro":"Tamb2",12:"Terra",13:"Com. 1-2",14:"In 1",15:"In 2",16:"Com. 3-7",17:"In 3",18:"In 4",19:"In 5",20:"In 6",21:"In 7",
  22:"Aquastat",23:"Aquastat",24:"Vmix C",25:"Vmix O",26:"N",27:"WP2 L",28:c.rwh?"Aquastat C2":"Alim. aux",29:c.rwh?"Aquastat C2":"Alim. aux",30:"EH4 N",31:"EH4 L",32:c.combi?"Out 9":"3WV C",33:"L",34:"N",35:"Out 1",36:"Out 2",37:"Out 3",38:"Out 3",39:"Out 4",40:"Out 4"};return T}
const COL={bus:"#7c3aed",sn:"#059669",in:"#2563eb",out:"#dc2626",off:"#cbd5e1"};
function morsSvg(c){const L=wiring(c),T=tbLabels(c),use={};L.forEach((w,i)=>w.t.forEach(t=>{(use[t]=use[t]||[]).push(i)}));
  const tw=50,gap=2,x0=14,rowY=[40,0],W=x0*2+21*(tw+gap);let lv=[[],[]];
  // livelli delle staffe sotto ciascuna fila (per non sovrapporre)
  const X0=t=>x0+((t<=21?t:t-21)-1)*(tw+gap),lab=w=>w.t.join("-")+"  "+w.lab+(w.relay&&!/contattore/.test(w.lab)?(w.dev==="heater"?"  → con contattore":"  → con relè"):"");
  const br=L.map((w,i)=>{const row=w.t[0]<=21?0:1,a=Math.min(...w.t),b=Math.max(...w.t),pa=X0(a),pb=Math.max(X0(b)+tw,pa+lab(w).length*5.4+10);let k=0;while((lv[row][k]||[]).some(r=>!(pb<r[0]||pa>r[1])))k++;(lv[row][k]=lv[row][k]||[]).push([pa,pb]);return {i,row,a,b,k}});
  const nk=[Math.max(1,lv[0].length),Math.max(1,lv[1].length)],RH=[70+nk[0]*22,70+nk[1]*22],H=24+RH[0]+RH[1]+20;
  const X=t=>x0+((t<=21?t:t-21)-1)*(tw+gap);
  let s=`<svg viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif" style="width:100%;max-width:1150px;display:block;margin:6px auto;font-family:Arial,Helvetica,sans-serif;background:#fff">`;
  [0,1].forEach(row=>{const y=20+(row?RH[0]:0),from=row?22:1,to=row?40:21;
    s+=`<text x="${x0}" y="${y-6}" font-size="12" font-weight="bold" fill="#1f2937">${row?"TB2 morsetti 22-40 (uscite 230 V)":"TB2 morsetti 1-21 (bus, sonde, ingressi a contatto pulito)"}</text>`;
    for(let t=from;t<=to;t++){const x=X(t),u=use[t],col=u?COL[L[u[0]].cat]:COL.off;
      s+=`<rect x="${x}" y="${y}" width="${tw}" height="26" rx="3" fill="${u?col:"#f1f5f9"}" stroke="${u?col:"#94a3b8"}"/><circle cx="${x+tw/2}" cy="${y+8}" r="4" fill="#fff" stroke="${u?"#fff":"#64748b"}"/><text x="${x+tw/2}" y="${y+22}" font-size="11" text-anchor="middle" font-weight="bold" fill="${u?"#fff":"#334155"}">${t}</text>`;
      s+=`<text x="${x+tw/2}" y="${y+38}" font-size="9" text-anchor="middle" fill="${u?col:"#64748b"}"${u?' font-weight="bold"':""}>${E(T[t])}</text>`}});
  br.forEach(b=>{const w=L[b.i],col=COL[w.cat],y=20+(b.row?RH[0]:0)+48+b.k*22,xa=X(b.a)+6,xb=X(b.b)+tw-6;
    s+=`<path d="M${xa} ${y-4}V${y}H${xb}V${y-4}" fill="none" stroke="${col}" stroke-width="2"/><text x="${xa}" y="${y+12}" font-size="10" fill="${col}" font-weight="bold">${E(lab(w))}</text>`});
  const lg=[["bus","Bus H-LINK / comando"],["sn","Sonde / sicurezze"],["in","Ingressi (contatto pulito)"],["out","Uscite 230 V"]];
  s+=lg.map((g,i)=>`<rect x="${x0+i*230}" y="${H-14}" width="12" height="10" fill="${COL[g[0]]}"/><text x="${x0+i*230+16}" y="${H-5}" font-size="10.5" fill="#334155">${g[1]}</text>`).join("");
  return s+`</svg>`}
// conversione SVG -> PNG per il PDF (anche nei moduli senza schema.js)
function png(svg,w){if(window.SCHEMA&&SCHEMA.png)return SCHEMA.png(svg,w);return new Promise(res=>{try{const m=svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/),vw=+m[1],vh=+m[2],sc=(w||1600)/vw;const src=svg.replace(/style="[^"]*"/,`width="${vw}" height="${vh}"`).replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"');const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=Math.round(vw*sc);c.height=Math.round(vh*sc);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);res({src:c.toDataURL("image/jpeg",0.9),ar:vh/vw})};im.onerror=()=>res(null);im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(src)}catch(e){res(null)}})}
// ---------------- simboli
const SY={
 pump:(x,y,l,dir)=>`<g><circle cx="${x}" cy="${y}" r="10" fill="#fff" stroke="#111" stroke-width="1.6"/><path d="M${x-5} ${y-6}L${x+7} ${y}L${x-5} ${y+6}Z" fill="#111" transform="rotate(${dir||0} ${x} ${y})"/>${l?`<text x="${x}" y="${y-14}" font-size="10" text-anchor="middle" font-weight="bold">${E(l)}</text>`:""}</g>`,
 v3:(x,y,l)=>`<g><path d="M${x-10} ${y-7}L${x} ${y}L${x-10} ${y+7}Z M${x+10} ${y-7}L${x} ${y}L${x+10} ${y+7}Z M${x-7} ${y+10}L${x} ${y}L${x+7} ${y+10}Z" fill="#fff" stroke="#111" stroke-width="1.4"/><rect x="${x-6}" y="${y-22}" width="12" height="10" fill="#fff" stroke="#111"/><text x="${x}" y="${y-14}" font-size="8" text-anchor="middle">M</text><line x1="${x}" y1="${y-12}" x2="${x}" y2="${y}" stroke="#111"/>${l?`<text x="${x}" y="${y-26}" font-size="10" text-anchor="middle" font-weight="bold">${E(l)}</text>`:""}</g>`,
 sensor:(x,y,l)=>`<g><circle cx="${x}" cy="${y}" r="6" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/><text x="${x}" y="${y+3}" font-size="8" text-anchor="middle" fill="#059669" font-weight="bold">T</text>${l?`<text x="${x+9}" y="${y-6}" font-size="9.5" fill="#059669" font-weight="bold">${E(l)}</text>`:""}</g>`,
 filter:(x,y,l)=>`<g><rect x="${x-9}" y="${y-8}" width="18" height="16" fill="#fff" stroke="#111"/><path d="M${x-9} ${y+8}L${x+9} ${y-8}" stroke="#111"/>${l?`<text x="${x}" y="${y+20}" font-size="9" text-anchor="middle">${E(l)}</text>`:""}</g>`,
 vessel:(x,y)=>`<g><line x1="${x}" y1="${y}" x2="${x}" y2="${y+12}" stroke="#111"/><rect x="${x-9}" y="${y+12}" width="18" height="26" rx="9" fill="#fef2f2" stroke="#111"/><text x="${x}" y="${y+50}" font-size="9" text-anchor="middle">vaso esp.</text></g>`,
 heater:(x,y,w)=>`<path d="M${x} ${y}${Array.from({length:6},(_,i)=>`l${w/12} ${i%2?6:-6}l${w/12} ${i%2?-6:6}`).join("")}" fill="none" stroke="#dc2626" stroke-width="1.6"/>`,
 coil:(x,y,h,col)=>`<path d="M${x} ${y}${Array.from({length:Math.max(2,Math.floor(h/8))},(_,i)=>`q14 4 0 8`).join("")}" fill="none" stroke="${col||"#b91c1c"}" stroke-width="1.6"/>`,
 floor:(x,y,w,h)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff7ed" stroke="#9a3412"/><path d="M${x+6} ${y+6}${Array.from({length:Math.floor((w-12)/10)},(_,i)=>`v${i%2?-(h-12):h-12}h10`).join("")}" fill="none" stroke="#ea580c" stroke-width="1.2"/></g>`,
 rad:(x,y,w,h)=>`<g>${Array.from({length:Math.floor(w/8)},(_,i)=>`<rect x="${x+i*8}" y="${y}" width="6" height="${h}" rx="2" fill="#fff" stroke="#111"/>`).join("")}<line x1="${x}" y1="${y+4}" x2="${x+w}" y2="${y+4}" stroke="#111"/><line x1="${x}" y1="${y+h-4}" x2="${x+w}" y2="${y+h-4}" stroke="#111"/></g>`,
 fc:(x,y,w,h)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#f8fafc" stroke="#111"/><circle cx="${x+w/2}" cy="${y+h/2}" r="${Math.min(w,h)/3}" fill="none" stroke="#111"/><path d="M${x+w/2} ${y+h/2}l${h/5} -${h/8}M${x+w/2} ${y+h/2}l-${h/5} ${h/8}M${x+w/2} ${y+h/2}l${h/8} ${h/5}M${x+w/2} ${y+h/2}l-${h/8} -${h/5}" stroke="#111"/></g>`,
 duct:(x,y,w,h)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f8fafc" stroke="#111"/><circle cx="${x+h/2+2}" cy="${y+h/2}" r="${h/2-3}" fill="none" stroke="#111"/>${Array.from({length:4},(_,i)=>`<line x1="${x+w-26+i*6}" y1="${y+3}" x2="${x+w-26+i*6}" y2="${y+h-3}" stroke="#111"/>`).join("")}</g>`,
 pv:(x,y)=>`<g><path d="M${x} ${y+26}L${x+12} ${y}H${x+56}L${x+44} ${y+26}Z" fill="#dbeafe" stroke="#1e3a8a"/>${[1,2,3].map(i=>`<line x1="${x+i*14}" y1="${y+26}" x2="${x+12+i*14}" y2="${y}" stroke="#1e3a8a"/>`).join("")}<line x1="${x+6}" y1="${y+13}" x2="${x+50}" y2="${y+13}" stroke="#1e3a8a"/></g>`,
 sun:(x,y)=>`<g><circle cx="${x}" cy="${y}" r="7" fill="#fde047" stroke="#ca8a04"/>${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return `<line x1="${x+10*Math.cos(a)}" y1="${y+10*Math.sin(a)}" x2="${x+14*Math.cos(a)}" y2="${y+14*Math.sin(a)}" stroke="#ca8a04"/>`}).join("")}</g>`,
 coll:(x,y)=>`<g><path d="M${x} ${y+30}L${x+14} ${y}H${x+70}L${x+56} ${y+30}Z" fill="#fff7ed" stroke="#c2410c"/>${[1,2,3,4].map(i=>`<line x1="${x+i*11+4}" y1="${y+30}" x2="${x+i*11+18}" y2="${y}" stroke="#ea580c"/>`).join("")}</g>`,
 flame:(x,y)=>`<path d="M${x} ${y+10}c-8 0 -9 -8 -4 -14c0 4 3 5 3 5c0 -6 4 -9 6 -13c1 5 6 8 6 14c0 5 -4 8 -11 8z" fill="#f97316" stroke="#c2410c"/>`,
 contact:(x,y,nc)=>`<g><line x1="${x}" y1="${y}" x2="${x+10}" y2="${y}" stroke="#111" stroke-width="1.5"/><line x1="${x+10}" y1="${y}" x2="${x+24}" y2="${y-(nc?0:8)}" stroke="#111" stroke-width="1.5"/>${nc?`<line x1="${x+22}" y1="${y-6}" x2="${x+22}" y2="${y+2}" stroke="#111" stroke-width="1.5"/>`:""}<line x1="${x+24}" y1="${y}" x2="${x+34}" y2="${y}" stroke="#111" stroke-width="1.5"/><text x="${x+17}" y="${y+12}" font-size="8.5" text-anchor="middle">${nc?"NC":"NA"}</text></g>`};
// ---------------- schema idraulico semplificato
function hydroSvg(c){
  let W=1180;const HOT="#dc2626",RET="#2563eb",RF="#7c3aed",DHW="#db2777",COLD="#0ea5e9",GLY="#ea580c",PW="#b91c1c",BUS="#16a34a";
  let s="",d="",H=c.casc?Math.min(c.N,3)*110+180:380;const line=(x1,y1,x2,y2,col,w,da)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w||3}"${da?` stroke-dasharray="${da}"`:""} stroke-linecap="round"/>`,
   path=(p,col,w,da)=>`<path d="${p}" fill="none" stroke="${col}" stroke-width="${w||3}"${da?` stroke-dasharray="${da}"`:""} stroke-linejoin="round"/>`,
   box=(x,y,w,h,t,sub,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill||"#f8fafc"}" stroke="#334155" stroke-width="1.5"/><text x="${x+w/2}" y="${y+16}" font-size="12" text-anchor="middle" font-weight="bold">${E(t)}</text>${sub?`<text x="${x+w/2}" y="${y+30}" font-size="9.5" text-anchor="middle" fill="#475569">${E(sub)}</text>`:""}`,
   txt=(x,y,t,o)=>`<text x="${x}" y="${y}" font-size="${(o&&o.fs)||10}"${o&&o.a?` text-anchor="${o.a}"`:""}${o&&o.b?' font-weight="bold"':""} fill="${(o&&o.col)||"#1f2937"}">${E(t)}</text>`;
  if(!c.ue&&!c.ui)return "";
  // ---- generatori (U.E. / U.I. / cascata)
  const n=c.casc?Math.min(c.N,3):1,uh=c.casc?96:150,gy=c.casc?110:140;let xOut=0;const outs=[];
  for(let k=0;k<n;k++){const y=gy+k*(uh+14),lab=c.casc?(k===2&&c.N>3?"U.E. 3 … "+c.N:"U.E. "+(k+1)):"Unità esterna";
    s+=box(20,y,110,uh-10,lab,c.ue||"",c.r290?"#fff7ed":"#f1f5f9");s+=`<circle cx="75" cy="${y+uh/2+8}" r="${c.casc?18:26}" fill="none" stroke="#64748b" stroke-width="1.5"/><path d="M75 ${y+uh/2+8}l14 -8M75 ${y+uh/2+8}l-14 8M75 ${y+uh/2+8}l8 14M75 ${y+uh/2+8}l-8 -14" stroke="#64748b"/>`;
    const ym=y+uh/2-6,ys=ym-14,yr=ym+14;
    if(c.ytc){outs.push({ys,yr,x:130});continue}
    if(c.mono){if(c.cbx||true){s+=SY.pump(118,ys,"",0);}outs.push({ys,yr,x:130,inner:1});continue}
    // U.I. / modulo
    const ux=200,uw=c.combi?150:120;s+=box(ux,y,uw,uh-10,c.casc?"U.I. "+(k+1):(c.hydro?"Modulo idronico":"Unità interna"),c.ui||"","#eef2ff");
    if(c.split){s+=line(130,ys,ux,ys,RF,3)+line(130,yr,ux,yr,RF,1.8)+(k===0?txt(136,ys-5,"gas",{fs:9,col:RF})+txt(136,yr+12,"liquido",{fs:9,col:RF}):"")}
    else{s+=line(130,ys,ux,ys,HOT,3)+line(130,yr,ux,yr,RET,3)}
    s+=SY.pump(ux+uw-22,ys,"WP1",0)+`<g transform="translate(${ux+14},${ys+18})">${SY.heater(0,0,50)}</g>`+txt(ux+14,ys+34,c.casc?"":"riscaldatore",{fs:8.5,col:"#b91c1c"})+txt(ux+14,ys+44,c.casc?"":"(sempre montato)",{fs:8.5,col:"#b91c1c"});
    if(c.combi&&!c.casc){const tx=ux+uw-62,ty=y+uh-62;s+=`<rect x="${tx}" y="${ty}" width="52" height="46" rx="8" fill="#fdf2f8" stroke="${DHW}"/>`+txt(tx+26,ty+38,"ACS",{fs:9,a:"middle",col:DHW,b:1})+txt(tx+26,ty+16,"serbatoio",{fs:8,a:"middle",col:DHW});
      const oy=y+uh+30;s+=path(`M${tx+14} ${ty+46}V${oy}H${tx-90}`,DHW,2.5)+txt(tx-150,oy+4,"ACS ai rubinetti",{col:DHW,fs:9.5})+path(`M${tx+38} ${ty+46}V${oy+26}H${tx-90}`,COLD,2.5)+txt(tx-150,oy+30,"acqua fredda",{col:COLD,fs:9.5});
      if(c.ric)s+=path(`M${tx-60} ${oy}V${oy+14}H${tx+26}V${ty+46}`,DHW,1.6,"4 3")+SY.pump(tx-20,oy+14,"",180)+txt(tx-20,oy+46,"ricircolo ACS",{fs:9,a:"middle",col:DHW});
      if(c.sol)s+=txt(tx-150,oy+56,"solare termico: verificare la compatibilità con il serbatoio integrato",{fs:9,col:GLY});H=Math.max(H,oy+90)}
    outs.push({ys,yr,x:ux+uw})}
  // collettore (cascata) o uscita diretta
  let X=Math.max(...outs.map(o=>o.x))+20;const sY=c.casc?gy+uh/2-20:outs[0].ys,rY=c.casc?sY+70:outs[0].yr;
  if(c.casc){outs.forEach(o=>{s+=path(`M${o.x} ${o.ys}H${X}V${sY}`,HOT)+path(`M${o.x} ${o.yr}H${X+14}V${rY}`,RET)});X+=24;s+=txt(X-10,sY-10,"collettori",{fs:9})}
  else{s+=line(outs[0].x,sY,X,sY,HOT)+line(outs[0].x,rY,X,rY,RET)}
  const SYy=sY,RYy=rY;let x=X;
  // filtro e vaso sul ritorno (prima del generatore)
  if(!c.ytc){s+=line(x,SYy,x+70,SYy,HOT)+line(x,RYy,x+70,RYy,RET)+SY.filter(x+14,RYy,V("imp_filtro")||"filtro")+SY.vessel(x+46,RYy);x+=70}
  // Yutampo / Triple C: solo serbatoio ACS
  if(c.ytc){const tx=x+40;s+=line(X-20,SYy,tx,SYy,RF,3)+line(X-20,RYy,tx,RYy,RF,1.8)+txt(X-10,SYy-6,"linee frigorifere",{fs:9,col:RF})+`<rect x="${tx}" y="${SYy-40}" width="90" height="170" rx="30" fill="#fdf2f8" stroke="${DHW}" stroke-width="2"/>`+txt(tx+45,SYy-20,V("ui_mod")||"Serbatoio ACS",{a:"middle",b:1,col:DHW})+`<g transform="translate(${tx+30},${SYy})">${SY.coil(0,0,60,HOT)}</g>`+SY.sensor(tx+80,SYy+60,"sonda ACS")+line(tx+90,SYy-20,tx+170,SYy-20,DHW,2.5)+txt(tx+174,SYy-16,"ACS ai rubinetti",{col:DHW})+line(tx+90,SYy+110,tx+170,SYy+110,COLD,2.5)+txt(tx+174,SYy+114,"acqua fredda di rete",{col:COLD});H=420}
  else{
  const slots=[];
  if(c.acs==="ext"&&!c.casc)slots.push("acs");if(c.acs==="ext"&&c.casc)slots.push("acs");
  if(c.pisc)slots.push("pool");if(c.cald&&!c.caldPar)slots.push("boiler");if(c.vol)slots.push("vol");if(c.cald&&c.caldPar)slots.push("boilp");if(c.sep)slots.push("sep");
  const low=[];let lowX=0;
  slots.forEach(sl=>{
   if(sl==="acs"){const w=240,vx=x+34,tx=x+66,ty=RYy+46;s+=line(x,SYy,x+w,SYy,HOT)+line(x,RYy,x+w,RYy,RET)+SY.v3(vx,SYy,"3WV ACS");
     s+=path(`M${vx} ${SYy+10}V${ty+26}H${tx}`,HOT)+path(`M${tx} ${ty+86}H${x+12}V${RYy}`,RET);
     s+=`<rect x="${tx}" y="${ty}" width="80" height="150" rx="26" fill="#fdf2f8" stroke="${DHW}" stroke-width="2"/>`+txt(tx+40,ty-6,"Bollitore ACS",{a:"middle",b:1,col:DHW,fs:10})+`<g transform="translate(${tx+20},${ty+22})">${SY.coil(0,0,64,HOT)}</g>`+SY.sensor(tx+62,ty+66,"")+txt(tx+44,ty+84,"THMDHW",{fs:8.5,col:"#059669",b:1});
     if(c.eh||c.ehx)s+=`<g transform="translate(${tx+40},${ty+128})">${SY.heater(0,0,30)}</g>`+txt(tx+40,ty+146,c.eh?"EH4":"resist. (relè)",{fs:8,col:"#b91c1c"});
     s+=path(`M${tx+80} ${ty+24}H${x+w-6}`,DHW,2.5)+txt(x+w-6,ty+18,"ACS",{col:DHW,b:1,a:"end"})+path(`M${tx+80} ${ty+132}H${x+w-6}`,COLD,2.5)+txt(x+w-6,ty+146,"acqua fredda",{col:COLD,fs:9,a:"end"});
     if(c.ric){const rx=tx+112;s+=path(`M${rx} ${ty+24}V${ty+100}H${tx+80}`,DHW,1.6,"4 3")+SY.pump(rx,ty+66,"",90)+txt(rx+14,ty+70,"ricircolo",{fs:8.5,col:DHW})}
     if(c.sol){const cx=tx-14,cy=ty+190;s+=path(`M${tx+22} ${ty+148}V${cy}`,GLY,2.2)+path(`M${tx+58} ${ty+146}V${cy+30}H${cx+70}`,GLY,2.2)+SY.coll(cx-80,cy)+path(`M${cx-24} ${cy}V${cy-6}H${tx+22}`,GLY,2.2)+SY.pump(tx+58,cy+12,"",90)+SY.sun(cx-90,cy-10)+txt(cx-80,cy+46,"solare termico (serpentino inferiore) · pompa solare",{fs:9,col:GLY});H=Math.max(H,cy+60)}
     H=Math.max(H,ty+170);x+=w;return}
   if(sl==="pool"){const w=190,vx=x+30,py=RYy+60;s+=line(x,SYy,x+w,SYy,HOT)+line(x,RYy,x+w,RYy,RET)+SY.v3(vx,SYy,"3WV piscina");
     s+=path(`M${vx} ${SYy+10}V${py}H${vx+20}`,HOT)+path(`M${vx+20} ${py+34}H${x+10}V${RYy}`,RET)+`<rect x="${vx+20}" y="${py-10}" width="24" height="52" fill="#ecfeff" stroke="#0e7490"/>`+SY.sensor(vx+32,py+16,"")+txt(vx+32,py+56,"scambiatore · Tswp",{fs:8.5,a:"middle",col:"#0e7490"})+`<path d="M${vx+44} ${py}h40M${vx+44} ${py+32}h40" stroke="#0891b2" stroke-width="2"/><rect x="${vx+84}" y="${py-12}" width="70" height="56" rx="6" fill="#cffafe" stroke="#0891b2"/>`+txt(vx+119,py+20,"piscina",{a:"middle",col:"#0e7490",b:1});
     H=Math.max(H,py+80);x+=w;return}
   if(sl==="boiler"){const bx=x+20;s+=line(x,SYy,bx,SYy,HOT)+box(bx,SYy-30,70,60,"Caldaia","in serie","#fff7ed")+SY.flame(bx+35,SYy+12)+line(x,RYy,bx+100,RYy,RET)+line(bx+70,SYy,bx+100,SYy,HOT);x=bx+100;s+=SY.sensor(x-14,SYy-12,"Two3");return}
   if(sl==="boilp"){const w=130,bx=x+30,by=RYy+50;s+=line(x,SYy,x+w,SYy,HOT)+line(x,RYy,x+w,RYy,RET)+box(bx,by,80,58,"Caldaia","in parallelo","#fff7ed")+SY.flame(bx+40,by+44)+path(`M${bx+66} ${by}V${SYy}`,HOT,2.4)+path(`M${bx+14} ${by}V${RYy}`,RET,2.4);H=Math.max(H,by+80);x+=w;return}
   if(sl==="vol"){const vx=x+30;s+=line(x,SYy,vx+90,SYy,HOT)+line(x,RYy,vx+90,RYy,RET)+`<rect x="${vx}" y="${RYy-18}" width="60" height="36" rx="14" fill="#f1f5f9" stroke="#334155"/>`+txt(vx+30,RYy+30,"volano in serie (ritorno)",{fs:9,a:"middle"});if(!c.cald)s+=SY.sensor(vx+30,SYy-12,"Two3");x=vx+90;return}
   if(sl==="sep"){const sx=x+40;s+=line(x,SYy,sx,SYy,HOT)+line(x,RYy,sx,RYy,RET)+`<rect x="${sx}" y="${SYy-30}" width="46" height="${RYy-SYy+60}" rx="8" fill="#f1f5f9" stroke="#334155" stroke-width="1.6"/>`+txt(sx+23,SYy-36,"separatore / puffer",{fs:9.5,a:"middle",b:1});
     x=sx+46;s+=line(x,SYy,x+40,SYy,HOT)+SY.pump(x+28,SYy,"WP3",0)+SY.sensor(x+52,SYy-12,"Two3")+line(x,RYy,x+40,RYy,RET);x+=40;return}});
  // ---- circuiti C1 e C2
  const termSym=(t,tx,ty)=>{const w=120,h=44;if(/Pavimento/.test(t))return SY.floor(tx,ty,w,h);if(/Radiatori/.test(t))return SY.rad(tx,ty,w,h);if(/Canalizzate/.test(t))return SY.duct(tx,ty+8,w,h-16);if(/Fancoil/.test(t))return SY.fc(tx,ty,54,h)+(/radiatori/.test(t)?SY.rad(tx+64,ty,56,h):/Pavimento/.test(t)?"":SY.fc(tx+64,ty,54,h));return `<rect x="${tx}" y="${ty}" width="${w}" height="${h}" fill="#fff" stroke="#94a3b8" stroke-dasharray="4 3"/>`+txt(tx+w/2,ty+26,"terminali da indicare",{a:"middle",fs:9,col:"#64748b"})};
  const TX=Math.max(x+(c.c2?240:120),c.c2?760:700),c1y=SYy-12;W=Math.max(W,TX+300);
  s+=line(x,SYy,TX,SYy,HOT)+line(x,RYy,TX,RYy,RET)+`<rect x="${TX}" y="${SYy-6}" width="10" height="${RYy-SYy+12}" fill="#e2e8f0"/>`;
  s+=termSym(c.term1,TX+40,SYy+12)+line(TX+10,SYy,TX+40,SYy+20,HOT,2.2)+line(TX+10,RYy,TX+40,SYy+48,RET,2.2)+txt(TX+40,SYy-8,"Circuito 1 (C1): "+(c.term1||"terminali")+(c.aqs?" · Aquastat 22-23":""),{b:1,fs:10.5});
  if(c.raff&&/Fancoil|Canalizzate/.test(c.term1))s+=txt(TX+40,SYy+72,"raffrescamento: scarico condensa e tubi isolati anticondensa",{fs:8.5,col:"#0369a1"});
  if(c.c2){const bx=x+40,y2=RYy+90;s+=path(`M${bx} ${SYy}V${y2}`,HOT)+path(`M${bx+40} ${RYy}V${y2+56}`,RET);
    if(c.c2mix){s+=SY.v3(bx,y2,"Vmix C2")+path(`M${bx+10} ${y2+8}V${y2+56}H${bx+40}`,RET,1.6,"3 2")}
    s+=line(bx,y2,TX,y2,HOT)+SY.pump(bx+70,y2,"WP2",0)+SY.sensor(bx+110,y2-12,"Two2")+line(bx+40,y2+56,TX,y2+56,RET);
    s+=termSym(c.term2,TX+40,y2+6)+line(TX,y2,TX+40,y2+14,HOT,2.2)+line(TX,y2+56,TX+40,y2+44,RET,2.2)+txt(TX+40,y2-8,"Circuito 2 (C2"+(c.c2mix?", miscelato":"")+"): "+(c.term2||"terminali"),{b:1,fs:10.5});
    if(/Pavimento/.test(c.term2))s+=txt(TX+40,y2+66,"pavimento: termostato di sicurezza consigliato",{fs:8.5,col:"#b91c1c"});H=Math.max(H,y2+110)}
  if(c.aqs)s+=SY.sensor(TX+20,SYy-14,"")+txt(TX+30,SYy-18,"",{});
  }
  // ---- elettrico: quadro, linee di potenza e bus
  const qx=20,qy=20;s+=box(qx,qy,120,46,"Quadro elettrico","linee protette ELB + CB","#fef2f2");
  const pw=[[75,gy]];if(!c.ytc&&!c.mono)pw.push([260,gy]);pw.forEach(p=>{s+=path(`M${p[0]} ${qy+46}V${p[1]}`,PW,1.6,"6 4")});
  if(!c.mono&&!c.ytc)s+=path(`M140 ${qy+30}H260V${gy}`,PW,1.6,"6 4");
  const cx0=c.mono?75:260;let bus=`M75 ${gy+uh-10}V${gy+uh+4}H${cx0}V${gy+uh-10}`;if(!c.ytc&&!c.mono)s+=path(bus,BUS,1.8,"3 3");
  if(c.casc){s+=box(400,qy,120,46,"Controller cascata",V("sch_casc_mod")||"ATW-YCC","#f0fdf4")+path(`M400 ${qy+40}H${cx0+40}V${gy}`,BUS,1.8,"3 3")+txt(530,qy+20,"sonda ACS, 3WV ACS, WP3 e Two3 collegate al controller",{fs:9,col:BUS})}
  else if(!c.ytc){s+=box(400,qy,110,40,"Comando","PC-ARFH3E (3-4)","#f0fdf4")+path(`M455 ${qy+40}V${qy+64}H${(c.mono?75:260)+30}V${gy}`,BUS,1.8,"3 3")}
  // fotovoltaico / smart grid: solo contatto verso la scheda
  if(c.fv||c.sg){const px=560,py=qy;s+=(c.fv?SY.pv(px,py):`<rect x="${px+6}" y="${py}" width="44" height="28" rx="3" fill="#eff6ff" stroke="#1e3a8a"/><text x="${px+28}" y="${py+18}" font-size="10" text-anchor="middle" font-weight="bold">SG</text>`)+txt(px+64,py+10,c.fv?"Fotovoltaico":"Smart Grid",{b:1})+txt(px+64,py+24,"solo contatto pulito "+(c.fvNC?"NC":"NA")+" → Input 5 (16-19)",{fs:9})+SY.contact(px+64,py+36,c.fvNC)+path(`M${px+98} ${py+36}H${px+120}V${gy-14}H${(c.mono?75:260)+60}V${gy}`,"#111",1.2,"2 3")}
  // ---- legenda e note
  H+=50;const ly=H-40,lg=[[HOT,"mandata"],[RET,"ritorno"]].concat(c.split?[[RF,"linee frigorifere"]]:[]).concat(c.acs!=="no"?[[DHW,"ACS"],[COLD,"acqua fredda"]]:[]).concat(c.sol?[[GLY,"circuito solare"]]:[]).concat([[PW,"alimentazione elettrica"],[BUS,"bus H-LINK / comando"]]);
  s+=lg.map((g,i)=>`<line x1="${20+i*140}" y1="${ly}" x2="${48+i*140}" y2="${ly}" stroke="${g[0]}" stroke-width="3"${/elettrica|bus/.test(g[1])?' stroke-dasharray="5 3"':""}/>`+txt(52+i*140,ly+4,g[1],{fs:10})).join("");
  s+=txt(20,ly+24,"Schema semplificato a solo scopo indicativo: non è in scala, non riporta tutti i componenti e non costituisce né sostituisce il progetto dell'impianto, che resta a cura di un professionista abilitato.",{fs:9.5,col:"#7c2d12"});
  return `<svg viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif" style="width:100%;max-width:${Math.max(1180,W)}px;display:block;margin:6px auto;font-family:Arial,Helvetica,sans-serif;background:#fff">${s}</svg>`}
// ---------------- collegamenti degli accessori (relè per carichi non Hitachi)
function wireSvg(c){const L=wiring(c).filter(w=>w.cat==="out"||w.cat==="in");if(!L.length)return "";
  const RH=64,W=1000,H=L.length*RH+30;let s="";
  const icon=(w,x,y)=>{if(w.dev==="pump")return SY.pump(x,y,w.name||"pompa",0);if(w.dev==="v3"||w.dev==="vmix")return SY.v3(x,y+6,w.dev==="vmix"?"Vmix":"3 vie");if(w.dev==="boiler")return `<rect x="${x-18}" y="${y-16}" width="36" height="32" rx="4" fill="#fff7ed" stroke="#c2410c"/>`+SY.flame(x,y+2);if(w.dev==="heater")return SY.heater(x-24,y,48);if(w.dev==="pv")return SY.pv(x-28,y-14);if(w.dev==="sg")return `<rect x="${x-22}" y="${y-14}" width="44" height="28" rx="3" fill="#eff6ff" stroke="#1e3a8a"/><text x="${x}" y="${y+4}" font-size="9" text-anchor="middle">SG</text>`;if(w.dev==="ta")return `<rect x="${x-14}" y="${y-16}" width="28" height="32" rx="4" fill="#fff" stroke="#111"/><text x="${x}" y="${y+4}" font-size="9" text-anchor="middle">TA</text>`;if(w.dev==="solin"||w.dev==="poolin"||w.dev==="meter"||w.dev==="contact")return `<rect x="${x-22}" y="${y-14}" width="44" height="28" rx="3" fill="#f8fafc" stroke="#111"/><text x="${x}" y="${y+4}" font-size="8.5" text-anchor="middle">${w.dev==="meter"?"contatore":w.dev==="solin"?"centralina":w.dev==="poolin"?"pompa pisc.":"contatto"}</text>`;return `<circle cx="${x}" cy="${y}" r="10" fill="#fff" stroke="#111"/><text x="${x}" y="${y+3}" font-size="8" text-anchor="middle">segn.</text>`};
  let K=0;L.forEach((w,i)=>{const y=20+i*RH+RH/2,col=COL[w.cat];
    s+=`<rect x="10" y="${y-18}" width="190" height="36" rx="4" fill="${col}"/><text x="105" y="${y-3}" font-size="11" text-anchor="middle" fill="#fff" font-weight="bold">TB2 ${E(w.t.join("-"))}</text><text x="105" y="${y+11}" font-size="9" text-anchor="middle" fill="#fff">${E(w.lab.replace(/^(Input|Output) \d: /,"").slice(0,36))}</text>`;
    if(w.cat==="in"){s+=`<line x1="200" y1="${y}" x2="330" y2="${y}" stroke="#2563eb" stroke-width="2" stroke-dasharray="4 3"/>`+SY.contact(330,y,w.nc)+`<line x1="364" y1="${y}" x2="430" y2="${y}" stroke="#111" stroke-width="1.5"/>`+icon(w,470,y)+`<text x="520" y="${y+4}" font-size="10" fill="#1f2937">${E(w.dev==="pv"?"inverter / contatore FV: contatto pulito "+(w.nc?"NC":"NA")+" verso l'ingresso":"contatto pulito, nessuna tensione sull'ingresso")}</text>`;return}
    if(w.relay){K++;const kn=(w.dev==="heater"?"KM":"K")+K;s+=`<line x1="200" y1="${y}" x2="250" y2="${y}" stroke="#dc2626" stroke-width="2"/><rect x="250" y="${y-16}" width="44" height="32" fill="#fff" stroke="#111"/><path d="M252 ${y+14}L292 ${y-14}" stroke="#111"/><text x="272" y="${y+30}" font-size="9" text-anchor="middle">bobina ${kn}</text><line x1="294" y1="${y}" x2="318" y2="${y}" stroke="#111" stroke-dasharray="2 2"/><rect x="300" y="${y-31}" width="150" height="13" rx="2" fill="#fef2f2" stroke="#b91c1c"/><text x="375" y="${y-21.5}" font-size="8.5" text-anchor="middle" fill="#b91c1c">linea separata protetta L-N-PE</text><line x1="330" y1="${y-18}" x2="330" y2="${y}" stroke="#b91c1c" stroke-width="1.5"/>`+SY.contact(330,y,false)+`<text x="350" y="${y-6}" font-size="9" text-anchor="middle">${kn}</text><line x1="364" y1="${y}" x2="430" y2="${y}" stroke="#111" stroke-width="1.5"/>`+icon(w,470,y)+`<text x="520" y="${y+4}" font-size="10" fill="#1f2937">${E(w.dev==="boiler"?"contatto pulito del relè sull'ingresso consenso / TA della caldaia":w.dev==="heater"?"contattore dimensionato sul carico della resistenza (uscita ~1 A solo per la bobina)":"uscita ~1 A sulla bobina; accessorio sulla propria linea tramite il contatto")}</text>`;return}
    s+=`<line x1="200" y1="${y}" x2="430" y2="${y}" stroke="#dc2626" stroke-width="2"/>`+icon(w,470,y)+`<text x="520" y="${y+4}" font-size="10" fill="#1f2937">accessorio Hitachi: collegamento diretto come da manuale</text>`});
  return `<svg viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif" style="width:100%;max-width:1000px;display:block;margin:6px auto;font-family:Arial,Helvetica,sans-serif;background:#fff">${s}</svg>`}
// ---------------- moduli HTML
const sel=(n,o,v)=>`<select data-n="${n}">${o.map(x=>`<option${x===(v||"")?" selected":""}>${E(x)}</option>`).join("")}</select>`;
const fld=(n,l,o,dis)=>`<label style="font-size:13px${dis?";opacity:.45":""}">${E(l)}${sel(n,o,V(n))}</label>`;
const GRID='display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px 12px;margin:4px 0 10px';
function form(){const c=cfg();
  const g1=["imp_term1","imp_c2"].concat(c.c2?["imp_term2"]:[]).concat(["imp_sep","imp_raff","imp_aqs","imp_filtro"]),
    g2=(c.combi?[]:["imp_acs"]).concat(c.acs==="ext"?["imp_acs_res"]:[]).concat(c.acs!=="no"?["imp_ric","imp_sol"]:[]),
    g3=["imp_cald","imp_resx","imp_pisc","imp_fv","imp_sg","imp_ta","imp_vh"];
  if(c.ytc)return `<p class="note">Yutampo / Triple C: solo produzione di ACS, lo schema mostra unità esterna e serbatoio.</p>`;
  const blk=(t,arr)=>`<h3 style="font-size:13.5px;margin:10px 0 2px;color:#1f4f78">${t}</h3><div style="${GRID}">${arr.map(n=>fld(n,LAB[n],OPT[n])).join("")}</div>`;
  return blk("Riscaldamento / raffrescamento",g1)+blk("Acqua calda sanitaria"+(c.combi?" (serbatoio integrato nell'unità Combi)":""),g2.length?g2:[])+blk("Integrazioni, segnali e accessori",g3)}
function ioForm(){const c=cfg(),{m,a}=ioMap(c);
  const row=n=>{const out=n.startsWith("Output"),o=["",...(out?OUTPUTS:INPUTS)],v=V("imp_io_"+n);return `<label style="font-size:12.5px">${n.replace("_"," ")} (${IOT[n].join("-")})<select data-n="imp_io_${n}">${o.map(x=>`<option value="${E(x)}"${x===v?" selected":""}>${x?E(x):"Proposta: "+E(a[n]||"non usato")}</option>`).join("")}</select></label>`};
  return `<h3 style="font-size:13.5px;margin:10px 0 2px;color:#1f4f78">Ingressi e uscite configurabili</h3><p class="note" style="font-size:12px;margin:0 0 4px">Proposta automatica in base all'impianto; il tecnico può cambiarla. Le stesse funzioni si impostano poi dal comando (menu installatore).</p><div style="${GRID}">${Object.keys(m).map(row).join("")}</div>`}
const NOTE_RELE="Le uscite della scheda reggono circa 1 A: servono solo a comandare. Pompe, valvole, caldaie, pompe di ricircolo e qualunque accessorio non Hitachi (es. WP3 sul separatore, valvola miscelatrice esterna) si collegano tramite un relè: l'uscita alimenta solo la bobina e l'accessorio è alimentato dalla propria linea protetta attraverso il contatto. Per le resistenze elettriche (di qualunque potenza) si usa un contattore dimensionato sul carico, con la bobina comandata dall'uscita. Per più uscite ausiliarie è disponibile la scatola relè Hitachi ATW-AOS-02. Gli ingressi accettano solo contatti puliti (nessuna tensione).";
function card(){const c=cfg();const h=hydroSvg(c);
  return `<section class="card"><h2>Configurazione impianto</h2><div class="body"><p class="note" style="margin:0 0 6px">Le scelte aggiornano lo schema idraulico qui sotto e la morsettiera nella sezione elettrica. I dati restano da confermare dal tecnico SAT all'avviamento.</p>${form()}${h?`<h3 style="font-size:14px;margin:12px 0 4px">Schema idraulico semplificato</h3>${h}`:`<p class="note">Indicare tipo e modelli delle unità per vedere lo schema.</p>`}</div></section>`}
function morsCard(o){o=o||{};const c=cfg();if(c.ytc)return "";const w=wireSvg(c);
  return `<section class="card"><h2>Morsettiera ${c.casc?"del controller cascata e delle U.I.":"dell'unità "+(c.combi?"(Combi)":"")} - collegamenti da eseguire</h2><div class="body">${o.noIO?"":ioForm()}${morsSvg(c)}<div class="tip" style="background:#fff4e0;border-color:#f0b45a;color:#7a3b00">⚠ &nbsp;<b>Accessori esterni:</b> ${E(NOTE_RELE)}</div>${w?`<h3 style="font-size:14px;margin:12px 0 4px">Collegamento degli accessori</h3>${w}`:""}<p class="note" style="font-size:11.5px">Morsettiera TB2 secondo i manuali tecnici (TCIT0150 / TCIT0153 / TCIT0154, par. "Riassunto dei collegamenti della morsettiera").${c.casc?" In cascata le funzioni d'impianto (ACS, WP3, Two3) si collegano al controller cascata.":""}${c.rwh?" Yutaki H: morsetto 11 = termistore del quadro, 28-29 = Aquastat C2.":""} Schema indicativo, non sostituisce il manuale di installazione né il progetto.</p></div></section>`}
async function extra(){const c=cfg();if(c.ytc&&!c.ue)return "";let h=`<h1>Allegato - configurazione impianto</h1>`;
  const rows=Object.keys(LAB).filter(n=>V(n)).map(n=>[LAB[n],V(n)]);if(rows.length)h+=`<table>${rows.map(r=>`<tr><td>${E(r[0])}</td><td>${E(r[1])}</td></tr>`).join("")}</table>`;
  const hs=hydroSvg(c);if(hs){const p=await png(hs,1800);if(p)h+=`<h2>Schema idraulico semplificato</h2><img src="${p.src}" data-w="182" data-h="${Math.round(182*p.ar)}">`}
  if(!c.ytc){const ms=morsSvg(c),p2=await png(ms,1800);if(p2)h+=`<h2>Morsettiera TB2 - collegamenti da eseguire</h2><img src="${p2.src}" data-w="182" data-h="${Math.round(182*p2.ar)}">`;
    const ws=wireSvg(c);if(ws){const p3=await png(ws,1600);if(p3)h+=`<h2>Collegamento degli accessori</h2><img src="${p3.src}" data-w="182" data-h="${Math.round(Math.min(230,182*p3.ar))}">`}
    h+=`<p><b>Accessori esterni:</b> ${E(NOTE_RELE)}</p>`}
  h+=`<p>Schemi semplificati a solo scopo indicativo: non costituiscono né sostituiscono il progetto dell'impianto, che resta a cura di un professionista abilitato, né il manuale di installazione.</p>`;return h}
// ================= Samurai (chiller / pompe di calore aria-acqua e acqua-acqua): schema idraulico semplificato
const SOPT={sam_coll:["","Collettori con valvole di bilanciamento","Collettori a ritorno inverso"],
 sam_pump:["","Kit idronico / pompa a bordo di ogni modulo","Pompa esterna unica sul primario","Pompa esterna per ogni modulo"],
 sam_sep:["","Nessuno (collegamento diretto)","Accumulo inerziale (volano) sul ritorno","Separatore idraulico / puffer a 4 attacchi"],
 sam_term:["","Fancoil","Unità di trattamento aria (UTA)","Pannelli radianti","Utenze di processo","Fancoil + UTA"],
 sam_acs:["","No","Sì - bollitore con valvola 3 vie"],
 sam_cond:["","Torre evaporativa","Dry cooler","Acqua di pozzo / falda","Altro"],
 sam_glic:["","No","Sì"]};
const SLAB={sam_coll:"Moduli in parallelo",sam_pump:"Pompa del primario",sam_sep:"Accumulo / separatore",sam_term:"Terminali / utenze",sam_acs:"Acqua calda sanitaria",sam_cond:"Circuito di condensazione (Samurai L)",sam_glic:"Glicole nel circuito"};
function samCfg(){const M=[];for(let i=1;i<=4;i++){const m=V("m"+i+"_mod");if(m)M.push({i,m:m.replace(/^Samurai [SML] - /,"").replace(/\s*\(.*\)$/,""),kit:V("m"+i+"_kit"),lab:i===1?"Master":"Slave "+(i-1)})}
  const L=M.some(x=>/RCME/.test(x.m)),gl=V("sam_glic")?/^Sì/.test(V("sam_glic")):/glicole/i.test(V("glic_tipo"));
  return {M,L,gl,pumpMod:/bordo/.test(V("sam_pump"))||(!V("sam_pump")&&M.some(x=>/FS|VSD|serie/.test(x.kit))),pumpOne:/unica/.test(V("sam_pump")),sep:/Separatore/.test(V("sam_sep")),vol:/volano/.test(V("sam_sep")),acs:/^Sì/.test(V("sam_acs")),term:V("sam_term"),cond:V("sam_cond"),hp:/pompa di calore/i.test(V("appl")),proc:/Processo/i.test(V("appl"))}}
function samSvg(c){if(!c.M.length)return "";const HOT="#dc2626",RET="#2563eb",PW="#b91c1c",BUS="#16a34a",CND="#0d9488";let s="",W=1180,H=0;
  const T=(x,y,t,o)=>`<text x="${x}" y="${y}" font-size="${(o&&o.fs)||10}"${o&&o.a?` text-anchor="${o.a}"`:""}${o&&o.b?' font-weight="bold"':""} fill="${(o&&o.col)||"#1f2937"}">${E(t)}</text>`,
   ln=(x1,y1,x2,y2,col,w,da)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w||3}"${da?` stroke-dasharray="${da}"`:""} stroke-linecap="round"/>`,
   pa=(p,col,w,da)=>`<path d="${p}" fill="none" stroke="${col}" stroke-width="${w||3}"${da?` stroke-dasharray="${da}"`:""} stroke-linejoin="round"/>`,
   vlv=(x,y)=>`<path d="M${x-6} ${y-5}L${x+6} ${y+5}V${y-5}L${x-6} ${y+5}Z" fill="#fff" stroke="#111" stroke-width="1.2"/>`,
   fs=(x,y)=>`<g><rect x="${x-7}" y="${y-7}" width="14" height="14" fill="#fff" stroke="#111"/><text x="${x}" y="${y+4}" font-size="8" text-anchor="middle">FS</text></g>`;
  const n=c.M.length,mx=40,my=200,mw=150,mh=92,gap=40,YS=128,YR=my+mh+120;
  // quadro e bus
  s+=`<rect x="20" y="14" width="130" height="44" rx="6" fill="#fef2f2" stroke="#334155"/>`+T(85,32,"Quadro elettrico",{a:"middle",b:1,fs:11})+T(85,46,"interruttore per ogni modulo",{a:"middle",fs:9,col:"#475569"});
  c.M.forEach((m,k)=>{const x=mx+k*(mw+gap),cx=x+mw/2;
    s+=`<rect x="${x}" y="${my}" width="${mw}" height="${mh}" rx="6" fill="${/AX/.test(m.m)?"#fff7ed":"#f1f5f9"}" stroke="#334155" stroke-width="1.5"/>`+T(cx,my+16,m.lab,{a:"middle",b:1,fs:11.5})+T(cx,my+30,m.m,{a:"middle",fs:9.5,col:"#475569"});
    if(!c.L)s+=[0,1].map(j=>`<circle cx="${x+40+j*70}" cy="${my+60}" r="18" fill="none" stroke="#64748b"/><path d="M${x+40+j*70} ${my+60}l11 -6M${x+40+j*70} ${my+60}l-11 6M${x+40+j*70} ${my+60}l6 11M${x+40+j*70} ${my+60}l-6 -11" stroke="#64748b"/>`).join("");
    else s+=T(cx,my+62,"acqua-acqua",{a:"middle",fs:9,col:"#475569"});
    // mandata (alto) e ritorno (basso) del modulo verso i collettori
    const xs=x+mw-30,xr=x+30;s+=pa(`M${xs} ${my}V${YS}`,HOT)+pa(`M${xr} ${my+mh}V${YR}`,RET);
    s+=vlv(xs,my-16)+vlv(xr,my+mh+14)+`<rect x="${xr-8}" y="${my+mh+28}" width="16" height="14" fill="#fff" stroke="#111"/><path d="M${xr-8} ${my+mh+42}L${xr+8} ${my+mh+28}" stroke="#111"/>`+T(xr+12,my+mh+40,"filtro",{fs:8.5})+fs(xs,my-44)+T(xs+10,my-41,"flussostato",{fs:8.5});
    if(n>1&&/bilanciamento/.test(V("sam_coll")||"bilanciamento"))s+=`<path d="M${xr-6} ${my+mh+60}l12 0M${xr} ${my+mh+54}v12" stroke="#7c3aed" stroke-width="2"/>`+T(xr+9,my+mh+64,"bilanc.",{fs:8,col:"#7c3aed"});
    if(c.pumpMod)s+=SY.pump(xr,my+mh+90,"",270)+T(xr+14,my+mh+94,"pompa modulo",{fs:8.5});
    s+=pa(`M${cx} 88V${my}`,PW,1.5,"6 4");
    if(k<n-1)s+=pa(`M${x+mw} ${my+mh-12}H${x+mw+gap}`,BUS,1.8,"3 3")});
  s+=pa(`M${85} 58V88H${mx+mw/2}`,PW,1.5,"6 4")+(n>1?pa(`M${mx+mw/2} 88H${mx+(n-1)*(mw+gap)+mw/2}`,PW,1.5,"6 4"):"");
  s+=`<rect x="${mx+n*(mw+gap)-20}" y="${my+20}" width="84" height="34" rx="5" fill="#f0fdf4" stroke="#334155"/>`+T(mx+n*(mw+gap)+22,my+41,"Comando a filo",{a:"middle",fs:9.5,b:1})+pa(`M${mx+(n-1)*(mw+gap)+mw} ${my+mh-12}H${mx+n*(mw+gap)+22}V${my+54}`,BUS,1.8,"3 3");
  // collettori
  const xL=mx-20,xE=mx+n*(mw+gap)+120;s+=ln(xL+40,YS,xE,YS,HOT)+ln(xL+10,YR,xE,YR,RET)+T(xL+40,YS-8,"collettore di mandata",{fs:9.5,col:HOT})+T(xL+10,YR+16+0*1,"collettore di ritorno"+(/inverso/.test(V("sam_coll"))?" (ritorno inverso)":""),{fs:9.5,col:RET});
  const vx0=mx+n*(mw+gap)+10;s+=`<line x1="${vx0}" y1="${YR}" x2="${vx0}" y2="${YR+12}" stroke="#111"/><rect x="${vx0-9}" y="${YR+12}" width="18" height="26" rx="9" fill="#fef2f2" stroke="#111"/>`+T(vx0,YR+50,"vaso esp.",{fs:9,a:"middle"})+T(xL+10,YR+34,"valvola di sicurezza, gruppo di carico, sfiati nei punti alti e scarichi nei punti bassi",{fs:8.5,col:"#475569"});
  let x=xE;
  if(c.pumpOne&&!c.pumpMod){s+=SY.pump(x-60,YR,"pompa primario",180)}
  if(c.acs){const vx=x+30,tx=x+60,ty=YR+40;s+=ln(x,YS,x+150,YS,HOT)+ln(x,YR,x+150,YR,RET)+SY.v3(vx,YS,"3WV ACS")+pa(`M${vx} ${YS+10}V${ty+24}H${tx}`,HOT)+pa(`M${tx} ${ty+90}H${x+12}V${YR}`,RET)+`<rect x="${tx}" y="${ty}" width="70" height="130" rx="24" fill="#fdf2f8" stroke="#db2777" stroke-width="2"/>`+T(tx+35,ty-6,"Bollitore ACS",{a:"middle",b:1,col:"#db2777"})+`<g transform="translate(${tx+16},${ty+20})">${SY.coil(0,0,64,HOT)}</g>`+SY.sensor(tx+56,ty+64,"");H=Math.max(H,ty+150);x+=150}
  if(c.sep||c.vol){const sx=x+30;s+=ln(x,YS,sx,YS,HOT)+ln(x,YR,sx,YR,RET);
    if(c.sep){s+=`<rect x="${sx}" y="${YS-30}" width="50" height="${YR-YS+60}" rx="8" fill="#f1f5f9" stroke="#334155" stroke-width="1.6"/>`+T(sx+25,YS-36,"separatore / puffer",{fs:9.5,a:"middle",b:1});x=sx+50;s+=ln(x,YS,x+50,YS,HOT)+SY.pump(x+30,YS,"pompa secondario",0)+ln(x,YR,x+50,YR,RET);x+=50}
    else{s+=`<rect x="${sx}" y="${YR-26}" width="70" height="52" rx="16" fill="#f1f5f9" stroke="#334155"/>`+T(sx+35,YR+40,"accumulo inerziale (ritorno)",{fs:9,a:"middle"})+ln(sx,YS,sx+70,YS,HOT);x=sx+70}}
  const TX=x+60;W=Math.max(W,TX+260);s+=ln(x,YS,TX,YS,HOT)+ln(x,YR,TX,YR,RET);
  const tsym=(t,tx,ty)=>/UTA/.test(t)?`<rect x="${tx}" y="${ty}" width="120" height="50" fill="#f8fafc" stroke="#111"/><circle cx="${tx+25}" cy="${ty+25}" r="16" fill="none" stroke="#111"/><path d="M${tx+50} ${ty+5}v40M${tx+60} ${ty+5}v40M${tx+70} ${ty+5}v40" stroke="#111"/>`+T(tx+95,ty+29,"UTA",{fs:10,a:"middle",b:1}):/radianti/.test(t)?SY.floor(tx,ty,120,50):/processo/i.test(t)?`<rect x="${tx}" y="${ty}" width="120" height="50" rx="4" fill="#ecfeff" stroke="#0e7490"/>`+T(tx+60,ty+29,"utenza di processo",{fs:9.5,a:"middle",col:"#0e7490",b:1}):SY.fc(tx,ty,55,50)+SY.fc(tx+65,ty,55,50);
  s+=pa(`M${TX} ${YS}H${TX+30}V${YS+60}`,HOT,2.4)+pa(`M${TX} ${YR}H${TX+30}V${YS+110}`,RET,2.4)+tsym(c.term,TX+40,YS+60)+T(TX+40,YS+52,c.term?(/^Utenz/.test(c.term)?c.term:"Utenze: "+c.term):"Utenze: da indicare",{b:1,fs:10.5});
  if(c.L){const cy=YR+60,cx=mx;s+=`<rect x="${cx}" y="${cy}" width="220" height="46" rx="6" fill="#f0fdfa" stroke="${CND}"/>`+T(cx+110,cy+18,c.cond||"Circuito di condensazione",{a:"middle",b:1,fs:10,col:CND})+T(cx+110,cy+32,"filtro, valvole, regolazione condensazione",{a:"middle",fs:8.5,col:CND});
    c.M.forEach((m,k)=>{const x0=mx+k*(mw+gap)+mw/2;s+=pa(`M${x0-10} ${my+mh}V${cy-10}H${cx+220}`,CND,2,"")});H=Math.max(H,cy+70)}
  H=Math.max(H,YR+80,YS+190)+50;const ly=H-36;
  const lg=[[HOT,"mandata"],[RET,"ritorno"]].concat(c.L?[[CND,"condensazione"]]:[]).concat([[PW,"alimentazione elettrica"],[BUS,"comunicazione moduli / comando"]]);
  s+=lg.map((g,i)=>ln(20+i*170,ly,48+i*170,ly,g[0],3,/elettrica|comunicazione/.test(g[1])?"5 3":"")+T(52+i*170,ly+4,g[1])).join("");
  s+=T(20,ly+22,"Schema semplificato a solo scopo indicativo"+(c.gl?" (circuito con glicole)":"")+": non è in scala, non riporta tutti i componenti e non costituisce né sostituisce il progetto dell'impianto, che resta a cura di un professionista abilitato.",{fs:9.5,col:"#7c2d12"});
  return `<svg viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif" style="width:100%;max-width:${W}px;display:block;margin:6px auto;font-family:Arial,Helvetica,sans-serif;background:#fff">${s}</svg>`}
function samCard(){const c=samCfg(),flds=Object.keys(SOPT).filter(n=>n!=="sam_cond"||c.L);
  const h=samSvg(c);return `<section class="card"><h2>Configurazione impianto</h2><div class="body"><p class="note" style="margin:0 0 6px">I moduli si indicano nei dati impianto; le scelte qui sotto aggiornano lo schema idraulico semplificato. Lo schema elettrico di potenza e dei collegamenti tra i moduli è nella parte elettrica.</p><div style="${GRID}">${flds.map(n=>`<label style="font-size:13px">${E(SLAB[n])}${sel(n,SOPT[n],V(n))}</label>`).join("")}</div>${h?`<h3 style="font-size:14px;margin:12px 0 4px">Schema idraulico semplificato</h3>${h}`:`<p class="note">Indicare i moduli installati nei dati impianto per vedere lo schema.</p>`}</div></section>`}
async function samExtra(){const c=samCfg();if(!c.M.length)return "";const p=await png(samSvg(c),1800);if(!p)return "";const rows=Object.keys(SLAB).filter(n=>V(n)).map(n=>[SLAB[n],V(n)]);
  return `<h1>Allegato - configurazione impianto</h1>`+(rows.length?`<table>${rows.map(r=>`<tr><td>${E(r[0])}</td><td>${E(r[1])}</td></tr>`).join("")}</table>`:"")+`<h2>Schema idraulico semplificato</h2><img src="${p.src}" data-w="182" data-h="${Math.round(182*p.ar)}"><p>Schema semplificato a solo scopo indicativo: non costituisce né sostituisce il progetto dell'impianto, che resta a cura di un professionista abilitato.</p>`}
window.IMP={samCard,samExtra,samSvg:()=>samSvg(samCfg()),cfg,kind,card,morsCard,hydroSvg:()=>hydroSvg(cfg()),morsSvg:()=>morsSvg(cfg()),wireSvg:()=>wireSvg(cfg()),extra,wiring:()=>wiring(cfg()),io:()=>ioMap(cfg()),OPT,LAB};
})();
