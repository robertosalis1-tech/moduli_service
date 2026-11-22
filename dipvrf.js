// DIPV - scheda "DIP switch" del verbale VRF Set Free (MOD 03.3): per ogni sistema i DIP di ogni modulo (master / slave)
// preimpostati dal modello (HDIP, TCIT0147) e le impostazioni delle unità interne (indirizzo, ciclo, DIP modificati).
(function(){
"use strict";
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SS=()=>{try{return S}catch(e){return window.S||{}}};const V=n=>{const s=SS()[n];return s==null?"":String(s)};
function present(s){try{if(typeof pageCover==="function")return !pageCover(2*s)}catch(e){}return s===1||!!V("s"+s+"_m1_mod")}
function nmod(s){const m=/(\d)/.exec(V("s"+s+"_nmod"));return m?+m[1]:1}
function uiN(s){return Math.max(1,Math.min(64,parseInt(V("s"+s+"_ui_dich"))||parseInt(V("s"+s+"_aa"))||1))}
function systems(){const r=[];for(let s=1;s<=8;s++)if(present(s))r.push(s);return r}
function modsOf(s){const r=[];for(let k=1;k<=nmod(s);k++)r.push(V("s"+s+"_m"+k+"_mod"));return r}
function cyc(s){const v=V("s"+s+"_cyc");return v!==""?Math.max(0,Math.min(63,parseInt(v)||0)):s-1}
function termOn(s){const sys=systems(),one=V("v_hlink")!=="Linee H-LINK separate per ogni sistema";const o=V("s"+s+"_term");if(o)return /^ON/.test(o);return one?s===sys[0]:true}
const tubi=s=>/3 tubi/.test(V("s"+s+"_tipo"))?3:2;
// CH-Box dei sistemi a recupero di calore (PMIT0628): s{s}_chn, s{s}_ch{k}_mod / _sn / _loc ; U.I.: s{s}_ui{i}_ch = "CH1" o "CH1.2"
const CHM={"CH-AP160SSX":{br:1,max:6,n:7},"CH-AP280SSX":{br:1,max:10,n:8},"CH-AP04MSSX":{br:4,max:16,n:6},"CH-AP08MSSX":{br:8,max:30,n:6},"CH-AP12MSSX":{br:12,max:30,n:6},"CH-AP16MSSX":{br:16,max:30,n:6}};
function chN(s){return Math.max(0,Math.min(32,parseInt(V("s"+s+"_chn"))||0))}
function chList(s){const r=[];for(let k=1;k<=chN(s);k++){const b="s"+s+"_ch"+k+"_";r.push({k,id:"CH"+k,m:V(b+"mod"),sn:V(b+"sn"),loc:V(b+"loc")})}return r}
function chOf(s,i){const v=V("s"+s+"_ui"+i+"_ch").toUpperCase().replace(/\s/g,"");const m=/^CH(\d+)(?:[.\/-](\d+))?$/.exec(v);return m?{box:+m[1],br:m[2]?+m[2]:1}:null}
function chCard(s){const L=chList(s),n=uiN(s);let h=`<h4 style="margin:10px 0 4px;font-size:13.5px">CH-Box del sistema ${s} (recupero di calore)</h4><div class="tip">i &nbsp;Una CH-Box per ogni U.I. o gruppo di U.I. che deve poter scegliere caldo / freddo. Le U.I. sulla stessa diramazione lavorano sempre nello stesso modo. Indicare nella tabella delle unità interne la CH-Box (es. CH1, oppure CH1.2 = CH-Box 1 diramazione 2). U.I. senza CH-Box: solo raffreddamento.</div>
    <label style="font-size:12.5px">Numero di CH-Box <input data-n="s${s}_chn" inputmode="numeric" value="${E(V("s"+s+"_chn"))}" style="width:70px"></label>`;
  if(L.length){h+=`<div class="scroll"><table class="ftab"><tr><th>CH-Box</th><th>Modello</th><th>Matricola</th><th>Locale</th><th>U.I. collegate</th></tr>`+L.map(b=>{const us=[];for(let i=1;i<=n;i++){const x=chOf(s,i);if(x&&x.box===b.k)us.push(i+((CHM[b.m]||{}).br>1?" (dir. "+x.br+")":""))}
      return `<tr><td class="rl">${b.id}</td><td>${sel("s"+s+"_ch"+b.k+"_mod",Object.keys(CHM),b.m,"")}</td><td><input data-n="s${s}_ch${b.k}_sn" value="${E(b.sn)}" placeholder="matricola"></td><td><input data-n="s${s}_ch${b.k}_loc" value="${E(b.loc)}" placeholder="locale"></td><td style="font-size:12px">${E(us.join(", ")||"-")}</td></tr>`}).join("")+`</table></div>`}
  const w=[];for(let i=1;i<=n;i++){const x=chOf(s,i);if(x&&!L.some(b=>b.k===x.box))w.push("U.I. "+i+": CH"+x.box+" non è nell'elenco");else if(x){const b=L.find(q=>q.k===x.box),d=CHM[b.m];if(d&&x.br>d.br)w.push("U.I. "+i+": "+b.m+" ha "+d.br+" diramazion"+(d.br>1?"i":"e"))}}
  L.forEach(b=>{const d=CHM[b.m];if(!d)return;let c=0;for(let i=1;i<=n;i++){const x=chOf(s,i);if(x&&x.box===b.k)c++}if(c>d.n*d.br&&d.br===1)w.push(b.id+": "+c+" U.I. collegate, massimo "+d.n)});
  return h+w.map(x=>`<div class="tip" style="background:#fff7ed;border-color:#fdba74;color:#7c2d12">⚠ &nbsp;${E(x)}</div>`).join("")}
// DIP consigliati di un sistema
function sysDips(s){const ms=modsOf(s),H=window.HDIP,o={tubi:tubi(s),cycle:cyc(s),term:termOn(s),hsp:+(V("s"+s+"_hsp").match(/\d+/)||[0])[0],lowamb:V("s"+s+"_lowamb")==="Sì"};
  if(H&&ms.length&&ms.every(m=>H.vSeries(m)))return H.vrfDips(ms,o);
  // serie senza tabella: stessi DIP, valori da impostare / verificare sul manuale
  return ms.map((m,k)=>({m:m||"modello?",role:k?"Slave "+"ABCD"[k]:(ms.length>1?"Master (A)":""),note:"Preimpostazione non disponibile per questo modello (manuale non presente): impostare e registrare i DIP come da manuale di installazione.",
    dips:[{sw:"DSW1",n:6,v:"",what:k?"Ciclo: non impostare sugli slave":"Ciclo frigorifero - decine ("+o.cycle+")"},{sw:"RSW1",rot:1,v:k?"0":String(o.cycle%10),what:k?"Non impostare sugli slave":"Ciclo frigorifero - unità"},
      {sw:"DSW2",n:6,v:"",what:"Capacità (di fabbrica)"},{sw:"DSW6",n:4,v:"",what:ms.length>1?"Combinazione modulo "+"ABCD"[k]:"Unità singola"},{sw:"DSW10",n:2,v:!k&&o.term?"10":"00",what:!k&&o.term?"Resistenza terminale ON":"Resistenza terminale OFF"}]}))}
const sel=(n,o,v,ph)=>`<select data-n="${n}">${(ph!=null?[""]:[]).concat(o).map(x=>`<option value="${E(x)}"${x===v?" selected":""}>${E(x===""?(ph||""):x)}</option>`).join("")}</select>`;
const lab=(t,h)=>`<label style="font-size:12.5px">${E(t)}${h}</label>`;
function uiInfo(m){const H=window.HDIP;if(!H||!m)return null;const d=H.iu(m);return d}
function card(){if(!window.HDIP||!window.DIPSW)return "";DIPSW.css();const sys=systems();let h=`<section class="card"><h2>DIP switch - unità esterne</h2><div class="body">
  <div class="tip">i &nbsp;I DIP di ogni modulo sono preimpostati dal modello scelto (TCIT0147 air365 Max / Max Pro, PMML0479 Set Free Sigma, PMML0511 Mini Set Free FSXNME). Per i sistemi a 3 tubi (recupero di calore) si indicano qui anche le CH-Box. Toccare i pin per registrare la posizione trovata: in verde se coincide con il valore consigliato, in arancione se è diversa. Le righe <b>DA IMPOSTARE</b> vanno modificate in cantiere (a unità spenta).</div>
  <div class="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px">${lab("Linea H-LINK",sel("v_hlink",["Una sola linea H-LINK per tutti i sistemi","Linee H-LINK separate per ogni sistema"],V("v_hlink")||"Una sola linea H-LINK per tutti i sistemi"))}</div>`;
  sys.forEach(s=>{const ms=modsOf(s),ds=sysDips(s),H=window.HDIP,chk=H.comboCheck(ms.filter(Boolean)),hp=ms.map(H.hpOf);
    h+=`<h3 style="margin:14px 0 4px;font-size:15px;color:#1f4f78">Sistema ${s}${V("s"+s+"_nome")?" - "+E(V("s"+s+"_nome")):""} · ${ms.filter(Boolean).length} modul${ms.length>1?"i":"o"} · ${tubi(s)} tubi</h3>`;
    h+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px 10px">${lab("N. ciclo frigorifero",`<input data-n="s${s}_cyc" inputmode="numeric" value="${E(V("s"+s+"_cyc"))}" placeholder="${s-1}">`)}${lab("Resistenza terminale (master)",sel("s"+s+"_term",["ON - master di questo sistema","OFF"],V("s"+s+"_term"),"automatica: "+(termOn(s)?"ON":"OFF")))}${lab("Pressione statica (DSW8)",sel("s"+s+"_hsp",["Standard","30 Pa","60 Pa","80 Pa"],V("s"+s+"_hsp")||"Standard"))}${lab("Bassa temp. in raffreddamento",sel("s"+s+"_lowamb",["No","Sì"],V("s"+s+"_lowamb")||"No"))}</div>`;
    if(!ms.some(Boolean)){h+=`<p class="note">Scegliere i modelli delle unità esterne nella pagina "Unità e indirizzi".</p>`;return}
    if(chk)h+=`<div class="tip" style="background:#fff7ed;border-color:#fdba74;color:#7c2d12">⚠ &nbsp;${E(chk)}</div>`;
    if(ms.length>1&&hp[0]&&hp.some(x=>x>hp[0]))h+=`<div class="tip" style="background:#fff7ed;border-color:#fdba74;color:#7c2d12">⚠ &nbsp;Il master (modulo A, il più vicino all'impianto) deve essere il modulo di potenza maggiore: scambiare i modelli nella pagina "Unità e indirizzi".</div>`;
    if(ms.length>1)h+=`<div class="tip">i &nbsp;Master = modulo A, il più vicino all'impianto e di potenza maggiore: riceve linea H-LINK verso le unità interne, ciclo frigorifero e resistenza terminale. Gli slave B, C, D si impostano solo con DSW6.</div>`;
    ds.forEach((u,k)=>h+=DIPSW.unit("s"+s+"_m"+(k+1)+"_",u,"Modulo "+"ABCD"[k]+(V("s"+s+"_m"+(k+1)+"_sn")?" · matr. "+V("s"+s+"_m"+(k+1)+"_sn"):"")));
    if(tubi(s)===3)h+=chCard(s)});
  h+=`</div></section>`+uiCard(sys);return h}
// unità interne: indirizzo (dalla pagina Unità e indirizzi), ciclo e DIP modificati
function uiCard(sys){let h=`<section class="card"><h2>DIP switch - unità interne</h2><div class="body"><div class="tip">i &nbsp;Per ogni unità interna: numero di indirizzo (inserito nella pagina "Unità e indirizzi"), numero di ciclo frigorifero (uguale a quello del sistema) e i DIP modificati rispetto alla fabbrica (es. funzioni opzionali, resistenza di fine linea su KPI / kit DX). Capacità (DSW3) e codice modello (DSW4) attesi sono indicati dal modello (TCIT0148, serie System Free).</div>`;
  sys.forEach(s=>{const n=uiN(s);h+=`<h3 style="margin:12px 0 4px;font-size:14px;color:#1f4f78">Sistema ${s} - ciclo ${cyc(s)}</h3><div class="scroll"><table class="ftab"><tr><th>U.I.</th><th>Modello</th><th>Indirizzo</th><th>Ciclo</th>${tubi(s)===3?"<th>CH-Box</th>":""}<th>Commutatori</th><th>DSW3 / DSW4 attesi</th><th>DIP modificati</th></tr>`;
    for(let i=1;i<=n;i++){const b="s"+s+"_ui"+i+"_",m=V(b+"mod"),d=uiInfo(m);
      h+=`<tr><td class="rl">${i}</td><td>${E(m||"-")}</td><td>${E(V(b+"ind")||"-")}</td><td><input data-n="${b}cyc" inputmode="numeric" style="width:52px;min-width:52px" value="${E(V(b+"cyc"))}" placeholder="${cyc(s)}"></td>${tubi(s)===3?`<td><input data-n="${b}ch" style="width:70px;min-width:70px" value="${E(V(b+"ch"))}" placeholder="CH1 / CH1.2"></td>`:""}<td style="font-size:11px">${d&&d.known?`ind.: DSW6 + ${d.rswAddr}<br>ciclo: DSW5 + ${d.rswCyc}`:"DSW6 + RSW (ind.)<br>DSW5 + RSW (ciclo)"}</td><td style="font-size:11px;font-family:monospace">${d&&d.cap?"DSW3 "+DIPSW.fmt(d.cap):"DSW3 -"}<br>${d&&d.model?"DSW4 "+DIPSW.fmt(d.model):"DSW4 -"}</td><td>${DIPSW.mods(b+"dipm")}</td></tr>`}
    h+=`</table></div>`});return h+`</div></section>`}
function T(head,rows){return `<table><tr>${head.map(x=>`<th>${E(x)}</th>`).join("")}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${E(c)}</td>`).join("")}</tr>`).join("")}</table>`}
function pdf(){if(!window.HDIP||!window.DIPSW)return "";const sys=systems();let h=`<h1>Allegato - DIP switch</h1>`;
  sys.forEach(s=>{const ds=sysDips(s);if(!modsOf(s).some(Boolean))return;let rows=[];ds.forEach((u,k)=>rows=rows.concat(DIPSW.pdfRows("s"+s+"_m"+(k+1)+"_",u)));
    h+=`<h2>Sistema ${s}${V("s"+s+"_nome")?" - "+E(V("s"+s+"_nome")):""} - unità esterne (ciclo ${cyc(s)})</h2>`+T(["Modulo","Ruolo","DIP","Posizione","Consigliato","Esito","Funzione"],rows);
    const hr=tubi(s)===3;if(hr&&chList(s).length)h+=`<h2>Sistema ${s} - CH-Box</h2>`+T(["CH-Box","Modello","Matricola","Locale"],chList(s).map(b=>[b.id,b.m,b.sn,b.loc]));
    const n=uiN(s),ur=[];for(let i=1;i<=n;i++){const b="s"+s+"_ui"+i+"_";if(V(b+"mod")||V(b+"ind")||V(b+"dipm")||V(b+"ch"))ur.push([String(i),V(b+"mod"),V(b+"ind"),V(b+"cyc")||String(cyc(s))].concat(hr?[V(b+"ch")||"solo freddo"]:[],[DIPSW.modsTxt(b+"dipm")||"nessuno"]))}
    if(ur.length)h+=`<h2>Sistema ${s} - unità interne</h2>`+T(["U.I.","Modello","Indirizzo","Ciclo"].concat(hr?["CH-Box"]:[],["DIP modificati"]),ur)});
  return h}
window.DIPV={card,pdf,sysDips,systems};
})();
