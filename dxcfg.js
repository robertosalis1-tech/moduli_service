// DXC - configurazione impianto per le check list a espansione diretta (MOD 02.1 Utopia / Mini Set Free, MOD 03.1 VRF Set Free):
// tipo e refrigerante dai modelli, accessori delle unità interne (condensa, ingressi / uscite, aria primaria), rilevatore R32,
// opzioni dell'unità esterna e schema semplificato di alimentazioni, bus, comandi e accessori (con relè per i carichi esterni).
// Usa le variabili globali del modulo: S (dati) e, se presenti, schIds / schK / SCHEMA (schema.js + blocco schema del modulo).
(function(){
"use strict";
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SS=()=>{try{return S}catch(e){return window.S||{}}};const V=n=>(SS()[n])||"";
let P="pu";
const OPT={
 dx_cond:["","A gravità per tutte le U.I.","Pompa condensa integrata nelle U.I. (cassette / canalizzabili)","Pompa condensa esterna (non Hitachi) su alcune U.I."],
 dx_aria:["","No","Recuperatore KPI Hitachi (collegato in H-LINK)","UTA con kit DX Hitachi (scheda di controllo collegata in H-LINK)","UTA / recuperatore di terzi (interblocco tramite relè)"],
 dx_in:["","Non usato","ON/OFF remoto","Contatto finestra / presenza (arresto)","Arresto da allarme (rilevatore fughe, antincendio)"],
 dx_out:["","Non usata","Segnale di funzionamento","Segnale di allarme","Comando ventilatore / umidificatore / riscaldatore esterno"],
 dx_rlv:["","Non necessario (carica < 1,84 kg o locali idonei)","Rilevatore di fughe con allarme e ventilazione","Rilevatore con allarme e valvole di intercettazione"],
 dx_dem:["","No","Sì - contatto pulito sulla scheda dell'U.E. (gestione carichi / fotovoltaico)"],
 dx_prot:["","Nessuna","Tettoia / protezione neve","Barriera frangivento","Basamento rialzato e antivibranti","Tettoia + basamento rialzato"]};
const LAB={dx_cond:"Scarico condensa",dx_cond_u:"U.I. con pompa condensa esterna",dx_aria:"Aria primaria / rinnovo",dx_in:"Ingresso delle U.I. (contatto pulito)",dx_in_u:"U.I. con ingresso collegato",dx_out:"Uscita delle U.I. (comando relè)",dx_out_u:"U.I. con uscita collegata",dx_rlv:"Rilevatore di fughe R32",dx_dem:"Limitazione di potenza dall'U.E.",dx_prot:"Protezione dell'unità esterna"};
// ---------------- sistemi e unità dichiarati nella prima pagina
function sys(){const s=SS(),r=[];for(let i=1;i<=10;i++){const m=String(s[P+"_ue"+i+"_mods"]||"").trim()||s[P+"_ue"+i+"_mod"];if(m)r.push({i,m:String(m),n:Math.max(1,parseInt(s[P+"_ue"+i+"_ui"])||1),z:s[P+"_ue"+i+"_zona"]||""})}return r}
function gasOf(m){m=String(m||"").toUpperCase();if(/^RAS-[\d.]+HV?R[CP]2E?$/.test(m)||/^RAS-3HVRC2$/.test(m))return "R32";if(/^RAS-[\d.]+HV?N[CP]2E$/.test(m)||/FS/.test(m))return "R410A";return ""}
function tipoOf(rows){const t=rows.map(r=>{const m=r.m.toUpperCase();if(/FSXN[SP]2?E/.test(m))return "VRF Set Free air365";if(/FSXNME/.test(m))return P==="pr"?"VRF Set Free side flow (FSXNME)":"Mini Set Free FSXNME";if(/FSV?NME/.test(m))return "Mini Set Free FS(V)NME";if(/^RAS-[\d.]+H/.test(m))return "Utopia "+(gasOf(m)||"");return "altro"});return t.filter((x,i)=>t.indexOf(x)===i).join(" + ")}
function gas(){const g=sys().map(r=>gasOf(r.m)).filter(Boolean);return g.length&&g.every(x=>x===g[0])?g[0]:""}
const kk=id=>window.schK?schK(id):String(id).replace(/[^0-9A-Za-z]/g,"_");
function uis(){const rs=sys(),ml=rs.length>1,out=[];rs.forEach(r=>{for(let k=1;k<=r.n;k++){const id=(ml?r.i+".":"")+k;out.push({id,sys:r.i,m:V("sch_ui_"+kk(id)+"_mod")})}});return out}
function pick(field,all){const t=V(field).trim();if(!t||/^tutte$/i.test(t))return all.map(u=>u.id);if(window.schIds)return schIds(t,all.map(u=>u.id));return t.split(/[,;\s]+/)}
function cfg(){const rs=sys(),all=uis(),g=V("LOC_gas")||gas(),c={P,rows:rs,all,gas:g,tipo:tipoOf(rs)};
  c.condInt=/integrata/.test(V("dx_cond"));c.condExt=/esterna/.test(V("dx_cond"));c.condU=c.condExt?pick("dx_cond_u",all):[];
  c.aria=V("dx_aria");c.kpi=/KPI/.test(c.aria);c.kitdx=/kit DX/.test(c.aria);c.uta3=/terzi/.test(c.aria);
  c.inp=/^(ON|Contatto|Arresto)/.test(V("dx_in"))?V("dx_in"):"";c.inU=c.inp?pick("dx_in_u",all):[];
  c.out=/^(Segnale|Comando)/.test(V("dx_out"))?V("dx_out"):"";c.outU=c.out?pick("dx_out_u",all):[];
  c.rlv=g==="R32"&&/^Rilevatore/.test(V("dx_rlv"))?V("dx_rlv"):"";c.dem=/^Sì/.test(V("dx_dem"));c.prot=/^(Tettoia|Barriera|Basamento)/.test(V("dx_prot"))?V("dx_prot"):"";
  c.cc=[];const n=Math.max(0,+V("sch_cc_n")||0);for(let r=1;r<=n;r++){const t=V("sch_cc"+r+"_t");if(t)c.cc.push(t)}
  c.rc=V("sch_rc_mode");c.rcm=V("sch_rc_mod")||"comando";return c}
// ---------------- modulo
const sel=(n,o,v)=>`<select data-n="${n}">${o.map(x=>`<option${x===(v||"")?" selected":""}>${E(x)}</option>`).join("")}</select>`;
const inp=(n,ph)=>`<input data-n="${n}" value="${E(V(n))}" placeholder="${E(ph)}">`;
const GRID='display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px 12px;margin:4px 0 10px';
const fld=(n)=>`<label style="font-size:13px">${E(LAB[n])}${sel(n,OPT[n],V(n))}</label>`,fin=(n,ph)=>`<label style="font-size:13px">${E(LAB[n])}${inp(n,ph)}</label>`;
const NOTE_RELE="Le uscite della scheda delle unità interne danno solo il segnale per la bobina di un relè ausiliario (bassa tensione, pochi mA): ventilatori, umidificatori, riscaldatori, pompe condensa, serrande e qualunque carico non Hitachi vanno alimentati da una linea separata e protetta, tramite relè o contattore dimensionato sul carico. Gli ingressi accettano solo contatti puliti (privi di tensione). Connettori, kit di cablaggio e impostazione delle funzioni opzionali (dal comando) secondo il manuale dell'unità interna.";
function form(c){const h3=t=>`<h3 style="font-size:13.5px;margin:10px 0 2px;color:#1f4f78">${t}</h3>`,ids=c.all.map(u=>u.id).join(" ");
  let h=`<div class="tip" style="margin:0 0 8px">i &nbsp;Tipo di impianto: <b>${E(c.tipo||"indicare i modelli delle unità esterne nella prima pagina")}</b>${c.gas?` · refrigerante <b>${E(c.gas)}</b> (dal modello)`:""}. Comandi locali e controlli centralizzati si indicano nella parte elettrica (schema elettrico e bus).</div>`;
  h+=h3("Unità interne: condensa, ingressi / uscite, aria primaria")+`<div style="${GRID}">${fld("dx_cond")}${c.condExt?fin("dx_cond_u","es. 1.2, 1.4 (vuoto = tutte)"):""}${fld("dx_aria")}${fld("dx_in")}${c.inp?fin("dx_in_u","es. 1.1-1.3 (vuoto = tutte)"):""}${fld("dx_out")}${c.out?fin("dx_out_u","es. 2.1 (vuoto = tutte)"):""}</div>`;
  if(ids)h+=`<p class="note" style="font-size:12px;margin:-4px 0 6px">Unità interne dell'impianto: ${E(ids)}</p>`;
  h+=h3("Unità esterna e sicurezza")+`<div style="${GRID}">${fld("dx_dem")}${fld("dx_prot")}${c.gas==="R32"?fld("dx_rlv"):""}</div>`;
  return h}
// ---------------- schema semplificato: alimentazioni, bus, comandi, accessori
// CH-Box del sistema r (sch_ch*, assegnate al sistema o tutte se c'è un solo sistema)
function chOf(r,nsys){const SS=(()=>{try{return S}catch(e){return window.S||{}}})(),P=window.__schP||"pr";if(!/3 tubi/.test(SS[P+"_ue"+r.i+"_hr"]||""))return [];const n=Math.max(0,Math.min(40,parseInt(SS.sch_chn)||0)),o=[];
  for(let k=1;k<=n;k++){const sy=String(SS["sch_ch"+k+"_sys"]||"");if(sy?sy!==String(r.i):nsys>1)continue;const us=[];
    Object.keys(SS).forEach(key=>{const m=/^sch_ui_(.+)_ch$/.exec(key);if(!m)return;const v=String(SS[key]||"").toUpperCase().replace(/\s/g,""),q=/^CH(\d+)/.exec(v);if(q&&+q[1]===k)us.push(m[1].replace(/_/g,"."))});
    us.sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));o.push({id:"CH"+k,m:SS["sch_ch"+k+"_mod"]||"",us})}return o}
function svg(c){if(!c.rows.length)return "";const PW="#dc2626",BUS="#2563eb",AUX="#475569",CND="#0891b2";
  const T=(x,y,t,o)=>{o=o||{};return `<text x="${x}" y="${y}" font-size="${o.fs||10}"${o.a?` text-anchor="${o.a}"`:""}${o.b?' font-weight="bold"':""} fill="${o.col||"#1f2937"}">${E(t)}</text>`};
  const ln=(x1,y1,x2,y2,col,w,da)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w||1.6}"${da?` stroke-dasharray="${da}"`:""}/>`;
  const box=(x,y,w,h,f,st)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${f}" stroke="${st||"#334155"}"/>`;
  const MAXU=6,UW=118,UG=146,UX=330;let s="",y=16,maxR=UX+UW,busEnd=[];
  const shown=r=>{const ids=c.all.filter(u=>u.sys===r.i);return ids.length>MAXU?ids.slice(0,MAXU-1).concat([{id:"…",more:ids.length-(MAXU-1)}]):ids};
  // quadro
  s+=box(16,y,112,56,"#fef2f2",PW)+T(72,y+20,"Quadro elettrico",{a:"middle",b:1,fs:10.5})+T(72,y+34,"linee dedicate",{a:"middle",fs:8.5})+T(72,y+45,"ELB + CB per ogni linea",{a:"middle",fs:8.5});
  const trunkX=72;let trunkEnd=y+56,busYs=[];const yTop=y;y+=78;
  if(c.rlv){s+=box(150,yTop+4,170,48,"#fff7ed","#c2410c")+T(235,yTop+19,"Rilevatore fughe R32",{a:"middle",b:1,fs:9.5,col:"#9a3412"})+T(235,yTop+32,"allarme + ventilazione"+(/valvole/.test(c.rlv)?" + valvole":""),{a:"middle",fs:8})+T(235,yTop+44,"contatto → ingresso U.I. / quadro",{a:"middle",fs:8,col:AUX})}
  c.rows.forEach((r,ri)=>{const y0=y,by=y0+30,bh=58,ue=(window.HDIP?HDIP.mods(r.m):r.m.split(/\s*\+\s*/)).filter(Boolean),U=shown(r);
    s+=T(150,y0+8,"Sistema "+r.i+(r.z?" - "+r.z:"")+" · "+r.n+" U.I.",{b:1,fs:11.5});
    // U.E.
    s+=box(150,by,130,bh,"#f1f5f9")+T(215,by+15,"U.E.",{a:"middle",b:1})+ue.slice(0,3).map((m,k)=>T(215,by+28+k*11,m,{a:"middle",fs:8.5})).join("")+(ue.length>3?T(215,by+52,"+ "+(ue.length-3)+" moduli",{a:"middle",fs:8}):"");
    // alimentazione U.E. (dal tronco)
    s+=ln(trunkX,by+bh/2,150,by+bh/2,PW,2.2,"6 3")+T(132,by+bh/2-4,"U.E.",{a:"end",fs:8,col:PW});
    // alimentazione U.I. (linea separata sopra le unità)
    const pyU=y0+20,lastX=UX+(U.length-1)*UG+UW/2;s+=ln(trunkX,pyU,lastX,pyU,PW,1.8,"6 3")+T(trunkX+6,pyU-3,"U.I.",{fs:8,col:PW});
    // bus H-LINK sotto le unità
    const yb=by+bh+16;busYs.push(yb);s+=ln(215,by+bh,215,yb,BUS,1.8,"4 3");
    let maxRows=0;
    U.forEach((u,k)=>{const x=UX+k*UG,cx=x+UW/2;if(u.more){s+=box(x,by,UW,bh,"#f8fafc","#94a3b8")+T(cx,by+26,"… + "+u.more+" U.I.",{a:"middle",b:1,fs:10})+T(cx,by+40,"stesso schema",{a:"middle",fs:8.5});s+=ln(cx,pyU,cx,by,PW,1.4,"6 3")+ln(cx,by+bh,cx,yb,BUS,1.6,"4 3");return}
      s+=box(x,by,UW,bh,"#eef2ff","#3730a3")+T(cx,by+15,"U.I. "+u.id,{a:"middle",b:1})+T(cx,by+28,(u.m||"modello").slice(0,20),{a:"middle",fs:8.5})+ln(cx,pyU,cx,by,PW,1.4,"6 3")+ln(cx,by+bh,cx,yb,BUS,1.6,"4 3");
      // accessori sotto la U.I.
      const acc=[];if(/ogni|misto/i.test(c.rc))acc.push(["rc",c.rcm]);
      if(c.condInt&&(!u.m||/^RC|^RPI|^RCD/i.test(u.m)))acc.push(["ci","pompa condensa integrata"]);if(c.condU.includes(u.id))acc.push(["ce","pompa condensa esterna"]);
      if(c.inU.includes(u.id))acc.push(["in",c.inp]);if(c.outU.includes(u.id))acc.push(["out",c.out]);
      let ay=yb+14;acc.forEach(a=>{const t=a[0];
        if(t==="rc"){s+=box(cx-32,ay,64,16,"#fff","#334155")+T(cx,ay+11,"comando A-B",{a:"middle",fs:8});s+=ln(cx+20,by+bh,cx+20,ay,AUX,1,"2 2");ay+=24}
        else if(t==="ci"){s+=`<path d="M${cx-38} ${ay+2}q-5 7 0 10q5-3 0-10z" fill="${CND}"/>`+T(cx-28,ay+11,"pompa integrata",{fs:8,col:CND});ay+=20}
        else if(t==="ce"){s+=`<circle cx="${cx-36}" cy="${ay+8}" r="7" fill="#ecfeff" stroke="${CND}"/>`+T(cx-36,ay+11,"P",{a:"middle",fs:8,b:1,col:CND})+T(cx-25,ay+7,"pompa condensa esterna",{fs:7.6,col:CND})+T(cx-25,ay+16,"linea propria + allarme",{fs:7.6,col:CND});ay+=24}
        else if(t==="in"){s+=`<path d="M${cx-40} ${ay+9}h8l10 -7M${cx-18} ${ay+9}h8" stroke="${AUX}" stroke-width="1.4" fill="none"/>`+T(cx-6,ay+7,"ingresso:",{fs:7.6,col:AUX})+T(cx-6,ay+16,a[1].slice(0,24),{fs:7.6,col:AUX});ay+=24}
        else if(t==="out"){s+=box(cx-42,ay,22,16,"#fff",AUX)+T(cx-31,ay+11,"K",{a:"middle",fs:9,b:1})+T(cx-16,ay+7,"uscita → relè:",{fs:7.6,col:AUX})+T(cx-16,ay+16,a[1].replace(/^Comando /,"").replace(/ \/ riscaldatore esterno/,"…").slice(0,26),{fs:7.6,col:AUX});ay+=24}});
      maxRows=Math.max(maxRows,ay-yb)});
    // CH-Box dei sistemi a recupero di calore: alimentazione ~230 V (anche dallo stesso interruttore delle U.I.) e H-LINK TB2 1-2
    let xr=UX+U.length*UG;const chs=chOf(r,c.rows.length);if(chs.length){chs.forEach(b=>{const cx=xr+UW/2;s+=box(xr,by,UW,bh,"#fef3c7","#b45309")+T(cx,by+15,"CH-Box "+b.id,{a:"middle",b:1,col:"#7c2d12"})+T(cx,by+28,(b.m||"modello").slice(0,20),{a:"middle",fs:8.5})+T(cx,by+41,("→ U.I. "+(b.us.join(", ")||"-")).slice(0,24),{a:"middle",fs:8,col:"#7c2d12"})+T(cx,by+52,"H-LINK TB2 1-2",{a:"middle",fs:7.6,col:BUS})+ln(cx,pyU,cx,by,PW,1.4,"6 3")+ln(cx,by+bh,cx,yb,BUS,1.6,"4 3");xr+=UG});
      s+=ln(lastX,pyU,xr-UG+UW/2,pyU,PW,1.8,"6 3");maxR=Math.max(maxR,xr-UG+UW)}
    const lastCH=chs.length?xr-UG+UW/2:0;
    // aria primaria (KPI / kit DX in H-LINK) solo nel sistema 1
if(ri===0&&(c.kpi||c.kitdx)){s+=box(xr,by,UW,bh,"#f0fdf4","#15803d")+T(xr+UW/2,by+16,c.kpi?"KPI":"Kit DX + UTA",{a:"middle",b:1})+T(xr+UW/2,by+30,c.kpi?"recuperatore":"scheda in H-LINK",{a:"middle",fs:8.5})+ln(xr+UW/2,pyU,xr+UW/2,by,PW,1.4,"6 3")+ln(xr+UW/2,by+bh,xr+UW/2,yb,BUS,1.6,"4 3");s+=ln(lastX,pyU,xr+UW/2,pyU,PW,1.8,"6 3");xr+=UG}
    if(ri===0&&c.uta3){s+=box(xr,by,UW,bh,"#f8fafc",AUX)+T(xr+UW/2,by+16,"UTA / recuperatore",{a:"middle",b:1,fs:9.5})+T(xr+UW/2,by+30,"di terzi",{a:"middle",fs:8.5})+T(xr+UW/2,by+44,"interblocco con relè",{a:"middle",fs:8,col:AUX});xr+=UG}
    const bx2=Math.max(lastX,lastCH,(ri===0&&(c.kpi||c.kitdx))?xr-UG+UW/2-(c.uta3?UG:0):lastX);maxR=Math.max(maxR,xr-UG+UW);busEnd.push(bx2);
    s+=ln(215,yb,bx2,yb,BUS,2,"4 3");
    if(c.dem)s+=`<path d="M156 ${by+bh+30}h8l10 -7M178 ${by+bh+30}h8" stroke="${AUX}" stroke-width="1.4" fill="none"/>`+T(190,by+bh+28,"limitazione potenza",{fs:7.6,col:AUX})+T(190,by+bh+37,"(contatto pulito U.E.)",{fs:7.6,col:AUX});
    if(c.prot)s+=T(156,by+bh+(c.dem?52:30),"⌂ "+c.prot,{fs:7.6,col:"#475569"});
    trunkEnd=by+bh/2;y=yb+Math.max(maxRows,(c.dem?44:0)+(c.prot?22:0))+34});
  s+=ln(trunkX,yTop+56,trunkX,trunkEnd,PW,2.6,"6 3");
  // controlli centralizzati in fondo alla linea H-LINK
  const XB=maxR+26;if(c.cc.length||busYs.length>1){s+=ln(XB,busYs[0],XB,Math.max(busYs[busYs.length-1],c.cc.length?busYs[0]+29+(c.cc.length-1)*50:0),BUS,2,"4 3");busYs.forEach((yb,k)=>s+=ln(busEnd[k],yb,XB,yb,BUS,2,"4 3"));
    s+=T(XB+6,busYs[0]-6,busYs.length>1?"H-LINK unica tra i sistemi":"H-LINK",{fs:8.5,col:BUS})}
  c.cc.forEach((t,k)=>{const yy=busYs[0]+10+k*50;s+=box(XB+14,yy,150,38,"#eff6ff",BUS)+T(XB+89,yy+16,t.slice(0,24),{a:"middle",b:1,fs:9.5})+T(XB+89,yy+29,"H-LINK 1-2",{a:"middle",fs:8})+ln(XB,yy+19,XB+14,yy+19,BUS,1.6,"4 3")});
  const W=Math.max(XB+(c.cc.length?180:40),780);y=Math.max(y,busYs[0]+10+c.cc.length*50+20);
  const ly=y+6;const lg=[[PW,"alimentazione (linee separate U.E. / U.I.)","6 3"],[BUS,"bus H-LINK (2 x 0,75 mm² schermato)","4 3"],[AUX,"comandi, contatti e relè","2 2"],[CND,"condensa",""]];
  const LX=[16,300,560,740];s+=lg.map((g,i)=>ln(LX[i],ly,LX[i]+28,ly,g[0],2.4,g[2])+T(LX[i]+32,ly+4,g[1],{fs:8.8})).join("");
  s+=T(16,ly+22,"Schema semplificato a solo scopo indicativo: non è in scala, non riporta tutti i componenti e non costituisce né sostituisce il progetto dell'impianto, che resta a cura di un professionista abilitato.",{fs:9.2,col:"#7c2d12"});
  const H=ly+34;
  return `<svg viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif" style="width:100%;max-width:${W}px;display:block;margin:6px auto;font-family:Arial,Helvetica,sans-serif;background:#fff">${s}</svg>`}
function notes(c){const n=[];if(c.condExt)n.push("Pompe condensa esterne: alimentazione propria e contatto di allarme (galleggiante) collegato all'ingresso dell'unità interna o in serie al comando, per fermare l'unità con vaschetta piena.");
  if(c.inp)n.push("Ingresso "+c.inp+": solo contatto pulito, cavo separato dalle linee di potenza; la funzione si attiva dal comando (funzioni opzionali dell'unità interna).");
  if(c.out||c.uta3)n.push(NOTE_RELE);if(c.kpi||c.kitdx)n.push((c.kpi?"Recuperatore KPI":"Kit DX dell'UTA")+": collegato in H-LINK come un'unità interna, con indirizzo proprio; alimentazione separata. Verificare l'abbinamento con il manuale del kit.");
  if(c.rlv)n.push("Rilevatore di fughe R32: posizione, soglie e azioni (allarme, ventilazione, valvole di intercettazione) secondo il manuale di sicurezza R32 e la IEC 60335-2-40; il contatto di allarme agisce sull'ingresso delle U.I. o sul quadro.");
  if(c.dem)n.push("Limitazione di potenza: contatto pulito sulla scheda dell'unità esterna, funzione da abilitare all'avviamento (impostazioni dell'U.E.).");
  return n}
function card(){const c=cfg(),h=svg(c),n=notes(c);
  return `<section class="card"><h2>Configurazione impianto</h2><div class="body"><p class="note" style="margin:0 0 6px">Le unità si indicano nella prima pagina (modelli delle unità esterne, numero ed elenco delle unità interne); le scelte qui sotto aggiornano lo schema semplificato e le note per l'elettricista.</p>${form(c)}${h?`<h3 style="font-size:14px;margin:12px 0 4px">Schema semplificato: alimentazioni, bus, comandi e accessori</h3><div class="scroll">${h}</div>`:`<p class="note">Indicare i modelli delle unità esterne nella prima pagina per vedere lo schema.</p>`}${n.length?`<h3 style="font-size:13.5px;margin:10px 0 2px;color:#1f4f78">Note per l'elettricista</h3>`+n.map(x=>`<div class="tip">i &nbsp;${E(x)}</div>`).join(""):""}</div></section>`}
function png(svgs,w){if(window.SCHEMA&&SCHEMA.png)return SCHEMA.png(svgs,w);return Promise.resolve(null)}
async function extra(){const c=cfg();if(!c.rows.length)return "";const rows=[["Tipo di impianto",c.tipo],["Refrigerante",c.gas||"-"]].concat(Object.keys(LAB).filter(n=>V(n)).map(n=>[LAB[n],V(n)]));
  let h=`<h1>Allegato - configurazione impianto</h1><table>${rows.map(r=>`<tr><td>${E(r[0])}</td><td>${E(r[1])}</td></tr>`).join("")}</table>`;
  let p=null;try{p=await png(svg(c),1800)}catch(e){p=null}
  if(p&&p.src)h+=`<h2>Schema semplificato: alimentazioni, bus, comandi e accessori</h2><img src="${p.src}" data-w="182" data-h="${Math.round(182*p.ar)}">`;
  notes(c).forEach(x=>h+=`<p>${E(x)}</p>`);
  return h+`<p>Schema semplificato a solo scopo indicativo: non costituisce né sostituisce il progetto dell'impianto, che resta a cura di un professionista abilitato.</p>`}
window.DXC={init:p=>{P=p},cfg,card,extra,svg:()=>svg(cfg()),gasOf,gas,tipo:()=>tipoOf(sys()),OPT,LAB};
})();
