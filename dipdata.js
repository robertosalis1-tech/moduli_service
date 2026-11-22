// HDIP - impostazioni DIP switch di fabbrica / da impostare, ricavate dai manuali Hitachi (stringhe "1"=ON "0"=OFF, pin 1 a sinistra)
// Fonti: TCIT0147 (air365 Max / Max Pro, cap. 10.3-10.4 e 1.5.8), PMML0479 (Set Free Sigma), PMML0511 (Mini Set Free FS(V)NME / FSXNME), PMML0545 (Utopia 4-6 HP), PMIT0628 (CH-Box), TCIT0148 (unità interne System Free, cap. 10.2),
// TCIT0150 / TCIT0153 / TCIT0154 (Yutaki, cap. 9.7), SMGB0104 + PMGB0488 rev.4 (Samurai M, DIP switch del micro board).
(function(){
"use strict";
const C=m=>String(m||"").toUpperCase().replace(/\s+/g,"");
// ---------------- VRF air365 Max (FSXNS2E) / Max Pro (FSXNP2E)
const VCAP={max:{8:"110001",10:"001001",12:"101001",14:"011001",16:"111001",18:"000101",20:"100101",22:"010101",24:"110101"},
            pro:{5:"110010",6:"001010",8:"101010",10:"011010",12:"111010",14:"000110",16:"100110",18:"010110"},
            // Set Free Sigma (PMML0479 §10.5) e Mini Set Free RAS-(8-12)FSXNME (PMML0511 §11.3.3)
            sig:{8:"100000",10:"010000",12:"110000",14:"001000",16:"101000",18:"011000",20:"111000",22:"000100",24:"100100"},
            sigp:{5:"010100",6:"110100",8:"001100",10:"101100",12:"011100",14:"111100",16:"000010",18:"100010"},
            mini:{8:"001100",10:"101100",12:"011100"}};
const VSRC={max:"TCIT0147 §10.3",pro:"TCIT0147 §10.3",sig:"PMML0479 §10.5",sigp:"PMML0479 §10.5",mini:"PMML0511 §11.3"};
const VNAME={max:"air365 Max",pro:"air365 Max Pro",sig:"Set Free Sigma (FSXNSE)",sigp:"Set Free Sigma (FSXNPE)",mini:"Mini Set Free (FSXNME)"};
const VSINGLE={max:"0000",pro:"0000",sig:"1000",sigp:"1000",mini:"1000"};   // DSW6 di fabbrica (unità singola)
const VCOMB={A:"1000",B:"0100",C:"1100",D:"0010",single:"0000"};   // DSW6 pin 1-3 = n. modulo + 1 (binario)
const CMB={max:{26:[14,12],28:[16,12],30:[18,12],32:[18,14],34:[18,16],36:[18,18],38:[22,16],40:[22,18],42:[24,18],44:[22,22],46:[24,22],48:[24,24],
  50:[18,18,14],52:[18,18,16],54:[18,18,18],56:[22,18,16],58:[22,18,18],60:[24,18,18],62:[22,22,18],64:[24,22,18],66:[24,24,18],68:[24,22,22],70:[24,24,22],72:[24,24,24],
  74:[22,18,18,16],76:[22,18,18,18],78:[24,18,18,18],80:[22,22,18,18],82:[24,22,18,18],84:[24,24,18,18],86:[24,22,22,18],88:[24,24,22,18],90:[24,24,24,18],92:[24,24,22,22],94:[24,24,24,22],96:[24,24,24,24]},
  pro:{20:[10,10],22:[12,10],24:[12,12],26:[16,10],28:[16,12],30:[18,12],32:[18,14],34:[18,16],36:[18,18],38:[14,12,12],40:[14,14,12],42:[14,14,14],44:[18,14,12],46:[18,14,14],48:[18,16,14],50:[18,18,14],52:[18,18,16],54:[18,18,18]},
  sig:{26:[14,12],28:[16,12],30:[18,12],32:[18,14],34:[18,16],36:[18,18],38:[24,14],40:[22,18],42:[24,18],44:[22,22],46:[24,22],48:[24,24],50:[18,18,14],52:[18,18,16],54:[18,18,18],56:[24,18,14],58:[22,18,18],60:[24,18,18],62:[24,24,14],64:[24,22,18],66:[24,24,18],68:[24,22,22],70:[24,24,22],72:[24,24,24],
    74:[24,18,18,14],76:[22,18,18,18],78:[24,18,18,18],80:[24,24,18,14],82:[24,24,18,16],84:[24,24,18,18],86:[24,24,24,14],88:[24,24,24,16],90:[24,24,24,18],92:[24,24,22,22],94:[24,24,24,22],96:[24,24,24,24]},
  sigp:{20:[10,10],22:[12,10],24:[12,12],26:[16,10],28:[16,12],30:[18,12],32:[18,14],34:[18,16],36:[18,18],38:[14,12,12],40:[14,14,12],42:[14,14,14],44:[18,14,12],46:[18,14,14],48:[18,18,12],50:[18,18,14],52:[18,18,16],54:[18,18,18],
    56:[18,14,12,12],58:[18,14,14,12],60:[16,16,14,14],62:[16,16,16,14],64:[16,16,16,16],66:[18,16,16,16],68:[18,18,16,16],70:[18,18,18,16],72:[18,18,18,18]},
  mini:{}};
const SUF={max:"FSXNS2E",pro:"FSXNP2E",sig:"FSXNSE",sigp:"FSXNPE",mini:"FSXNME"};
function vSeries(m){m=C(m);return /FSXNS2E$/.test(m)?"max":/FSXNP2E$/.test(m)?"pro":/FSXNSE$/.test(m)?"sig":/FSXNPE$/.test(m)?"sigp":/FSXNME$/.test(m)?"mini":""}
function hpOf(m){const r=C(m).match(/^RAS-(\d+(?:\.\d+)?)/);return r?parseFloat(r[1]):0}
const comboList=()=>[].concat(...Object.keys(CMB).map(s=>Object.keys(CMB[s]).map(h=>"RAS-"+h+SUF[s])));
// moduli di un sistema: nome di combinazione Hitachi (RAS-48FSXNS2E), oppure "A + B (+ C ...)", oppure modulo singolo; il primo è il master
function mods(m){m=String(m||"").trim();if(!m)return [];
  if(/\+/.test(m))return m.split(/\s*\+\s*/).filter(Boolean).map(x=>x.toUpperCase()).sort((a,b)=>hpOf(b)-hpOf(a));
  const s=vSeries(m),h=hpOf(m);if(s&&CMB[s][h]&&!VCAP[s][h])return CMB[s][h].map(x=>"RAS-"+x+SUF[s]);return [C(m)]}
function comboName(list){if(!list||list.length<2)return "";const s=vSeries(list[0]);if(!s||list.some(x=>vSeries(x)!==s))return "";
  const hs=list.map(hpOf).sort((a,b)=>b-a),tot=hs.reduce((a,b)=>a+b,0),c=CMB[s][tot];return c&&c.join()===hs.join()?"RAS-"+tot+SUF[s]:""}
function comboCheck(list){if(!list||list.length<2)return "";const s=vSeries(list[0]);if(!s)return "Combinazione non verificabile: serie senza tabella (controllare sul catalogo tecnico).";
  if(s==="mini")return "Mini Set Free FSXNME: unità singola, non combinabile.";
  if(list.some(x=>vSeries(x)!==s))return "Non si possono combinare moduli di serie diverse ("+[...new Set(list.map(x=>VNAME[vSeries(x)]||x))].join(", ")+").";if(list.length>4)return "Massimo 4 moduli per sistema.";
  return comboName(list)?"":"Combinazione non presente nella tabella Hitachi ("+(s==="sig"||s==="sigp"?"PMML0479":"TCIT0147 cap. 1.5.8")+"): verificare."}
// DIP di ogni modulo di un sistema VRF air365: o={tubi:2|3, cycle:n, term:true/false (resistenza terminale su questa linea H-LINK), hsp:0|30|60|80, lowamb:bool}
function vrfDips(list,o){o=o||{};const out=[];list.forEach((m,k)=>{const s=vSeries(m),h=hpOf(m),master=k===0,multi=list.length>1,L=[];
  const cy=Math.max(0,Math.min(63,parseInt(o.cycle)||0)),tens=Math.floor(cy/10);
  L.push({sw:"DSW1",n:6,v:master?bin(tens,6):"000000",what:master?"Ciclo frigorifero - decine ("+cy+")":"Ciclo: non impostare sugli slave",need:master&&cy>=10});
  L.push({sw:"RSW1",rot:1,v:master?String(cy%10):"0",what:master?"Ciclo frigorifero - unità ("+cy+")":"Non impostare sugli slave",need:master&&cy%10!==0});
  const src=VSRC[s]||"";
  L.push({sw:"DSW2",n:6,v:s&&VCAP[s][h]||"",what:"Capacità "+(h?h+" HP":"")+" (di fabbrica, non modificare)",src});
  const sg=VSINGLE[s]||"0000";let d6=multi?VCOMB["ABCD"[k]]:sg;if(o.lowamb)d6=d6.slice(0,3)+"1";
  L.push({sw:"DSW6",n:4,v:d6,what:multi?"Combinazione: modulo "+"ABCD"[k]+(master?" (master)":" (slave "+k+")"):"Unità singola"+(o.lowamb?" + bassa temperatura in raffreddamento (pin 4, con protezione neve)":""),need:(multi&&d6!==sg)||o.lowamb,src});
  L.push({sw:"DSW7",n:4,v:(o.tubi===3?"1101":"1100"),what:o.tubi===3?"Sistema a 3 tubi (recupero di calore, di fabbrica)":"Sistema a 2 tubi (pompa di calore): pin 4 OFF",need:o.tubi!==3,src});
  const hsp=s==="mini"?(o.hsp?"100":"000"):({30:"100",60:"010",80:"110"}[o.hsp]||"000");L.push({sw:"DSW8",n:3,v:hsp,what:o.hsp?"Pressione statica alta"+(s==="mini"?" (HSP)":" "+o.hsp+" Pa"):"Pressione statica standard (di fabbrica)",need:!!o.hsp,src:s==="mini"?src:""});
  const term=master&&o.term!==false;L.push({sw:"DSW10",n:2,v:term?"10":"00",what:term?"Resistenza terminale ON (unica U.E. della linea H-LINK)":"Resistenza terminale OFF (pin 1 OFF)",need:!term,src});
  out.push({m,role:master?"Master (A)":"Slave "+"ABCD"[k],dips:L})});return out}
function bin(n,len){let s="";for(let i=0;i<len;i++)s+=(n>>i)&1?"1":"0";return s}
// ---------------- unità interne (TCIT0148 §10.2)
const ICAP={0.4:"101010",0.6:"000010",0.8:"1011",1:"0011",1.3:"1101",1.5:"0101",1.8:"0001",2:"1110",2.3:"0110",2.5:"1010",3:"0010",4:"0100",5:"1000",6:"0000",8:"1111",10:"0111"};
const IFAM=[[/^RCI-[\d.]+FSR1/,"RCI-FSR1","1000",2],[/^RCIM-[\d.]+FSRE/,"RCIM-FSRE","0001",1],[/^RCD-[\d.]+FSR/,"RCD-FSR","0100",2],[/^RPC-[\d.]+FSR/,"RPC-FSR","1111",2],
  [/^RPI[LH]?-[\d.]+FSR1E/,"RPI(L/H)-FSR1E","1010",1],[/^RPI-[\d.]+FSN3PE/,"RPI-FSN3PE","1001",1],[/^RPI-[\d.]+FSN3E/,"RPI-FSN3E","1001",1],[/^RPFI?-[\d.]+FSN2E/,"RPF(I)-FSN2E","1011",1],[/^RPK-[\d.]+FSR(H)?M/,"RPK-FSR(H)M","",2]];
// rsw: 1 = indirizzo su RSW1 e ciclo su RSW2 ; 2 = indirizzo su RSW2 e ciclo su RSW1
function iu(m){m=C(m);const f=IFAM.find(x=>x[0].test(m)),h=hpOf(m.replace(/^[A-Z]+-/,"RAS-"));
  return {fam:f?f[1]:"",model:f?f[2]:"",cap:ICAP[h]||"",hp:h,rswAddr:f?(f[3]===1?"RSW1":"RSW2"):"RSW",rswCyc:f?(f[3]===1?"RSW2":"RSW1"):"RSW",known:!!f}}
// ---------------- Yutaki (DSW3 capacità e DSW5 resistenza terminale dell'unità esterna)
const YCAP=[["RAS-1.5WHVRP2E","100011"],["RAS-2WHVRP2E","110011"],["RAS-2.5WHVRP2E","101011"],["RAS-3WHVRP2E","011011"],
 ["RAS-3.5WHVRP2E","111010","100010"],["RAS-4WHVRP2E","111010","010010"],["RAS-5WHVRP2E","111010","001010"],["RAS-6WHVRP2E","111010","101010"],
 ["RAS-3.5WHRP2E","111010","100110"],["RAS-4WHRP2E","111010","010110"],["RAS-5WHRP2E","111010","001110"],["RAS-6WHRP2E","111010","101110"],
 ["RAS-4WHVNPE","011110"],["RAS-5WHVNPE","111110"],["RAS-6WHVNPE","101110"],["RAS-4WHNPE","010100"],["RAS-5WHNPE","110100"],["RAS-6WHNPE","001100"],["RAS-8WHNPE","110110"],["RAS-10WHNPE","001110"],
 ["RASM-2VR2E","110011"],["RASM-3VR2E","011011"],["RASM-4VR1E","010010"],["RASM-4VRW1E","010010"],["RASM-5VR1E","001010"],["RASM-5VRW1E","001010"],["RASM-6VR1E","101010"],["RASM-6VRW1E","101010"],
 ["RASM-4R1E","010110"],["RASM-4RW1E","010110"],["RASM-5R1E","001110"],["RASM-5RW1E","001110"],["RASM-6R1E","101110"],["RASM-6RW1E","101110"],["RASM-7R1E","101110"],["RASM-7RW1E","101110"],
 ["RASM-2VTW2E","111010","000010"],["RASM-3VTW2E","111010","010010"],["RASM-3.5VTW2E","111010","110010"],["RASM-4VTW2E","111010","001010"],["RASM-5VTW2E","111010","101010"],["RASM-6VTW2E","111010","011010"],
 ["RASM-4TW2E","111010","001110"],["RASM-5TW2E","111010","101110"],["RASM-6TW2E","111010","011110"]];
function yut(m){m=C(m).replace(/-K$|\(-K\)$/,"");const r=YCAP.find(x=>x[0]===m);if(!r)return null;
  return {cap:r[1],spare:r[2]||"",src:/^RASM-.*TW2E/.test(m)?"TCIT0154":/WH(V)?RP2E/.test(m)&&/^RAS-(3\.5|4|5|6)WH/.test(m)?"TCIT0153":"TCIT0150"}}
// ---------------- Samurai M (SMGB0104 tab. 19-22, PMGB0488 rev.4): SW301 1-5 indirizzo (binario), 6-8 taglia ; SW302-3/4 applicazione
const SMOD={18:"000",24:"001",30:"010",40:"011",50:"100"},SBIG={60:[40,18],75:[50,18],90:[40,50],100:[50,50]};
function sam(m){const u=C(m),r=u.match(/RHMA(\d+)A([NX])/)||u.match(/RCMA(\d+)A([NX])/);if(!r)return null;const kw=+r[1],x=r[2]==="X";
  return {kw,r454:x,boards:SBIG[kw]?SBIG[kw].map(k=>SMOD[k]):SMOD[kw]?[SMOD[kw]]:[]}}
function samDips(list,brine){let a=1;return list.map((m,k)=>{const d=sam(m);if(!d)return {m,role:k?"Slave":"Master (#1)",dips:[],note:"Impostazioni non disponibili per questo modello: vedere il manuale."};
  const L=[];d.boards.forEach((md,b)=>{const ad=a++;L.push({sw:(d.boards.length>1?"Scheda "+(b+1)+" ":"")+"SW301",n:8,v:bin(ad%32,5)+md,what:"Indirizzo #"+ad+" (pin 1-5) + taglia (pin 6-8)",need:ad!==1,src:"SMGB0104 tab. 19-21"});
    L.push({sw:(d.boards.length>1?"Scheda "+(b+1)+" ":"")+"SW302",n:4,v:"--"+(d.r454?"1"+(brine?"?":"0"):(brine?"00":"01")),what:"Pin 3-4: "+(d.r454?"pin 3 ON = R454B"+(brine?" · modalità brine: vedere manuale":""):(brine?"brine (acqua sotto +5 °C)":"standard (di fabbrica)"))+" · pin 1-2 non modificare",need:!!brine,src:d.r454?"PMGB0488 rev.4":"SMGB0104 tab. 22"})});
  return {m,role:k?"Slave":"Master (#1)",dips:L}})}
// ---------------- Utopia / Mini Set Free: resistenza terminale (pin 1 di DSW5; RAS-(8-12)FSXNME: DSW10) e ciclo (DSW4 decine + RSW1)
function utTerm(m){return /FSXNME/.test(C(m))?{sw:"DSW10",n:2,src:"PMML0511"}:{sw:"DSW5",n:2,src:/FSV?NME/.test(C(m))?"PMML0511":"PMML0545"}}
// Utopia RAS-(4-6)H(V)(R/N)(C/P)2E (PMML0545 §10.2.1) e Mini Set Free RAS-(4-6)FS(V)NME (PMML0511 §11.3.1-2): DSW3 capacità (pin 4 ON = trifase)
const UCAP={4:"010010",5:"001010",6:"101010"};
function utInfo(m){const u=C(m);let r=u.match(/^RAS-([456])H(V?)([RN])([CP])2E/);if(r)return {k:"ut",hp:+r[1],ph1:!!r[2],r32:r[3]==="R",p:r[4]==="P",src:"PMML0545 §10.2.1"};
  r=u.match(/^RAS-([456])FS(V?)NME/);if(r)return {k:"mini",hp:+r[1],ph1:!!r[2],src:"PMML0511 §11.3"};return null}
function utCap(m){const d=utInfo(m);if(!d)return "";const v=UCAP[d.hp];return d.ph1?v:v.slice(0,3)+"1"+v.slice(4)}
// DIP dell'unità esterna Utopia / Mini (4-6 HP): null se il modello non è in tabella
function utDips(m,cycle,termOn){const d=utInfo(m);if(!d)return null;const c=Math.max(0,Math.min(63,parseInt(cycle)||0)),L=[];
  L.push({sw:"DSW3",n:6,v:utCap(m),what:"Capacità "+d.hp+" HP "+(d.ph1?"monofase":"trifase")+" (di fabbrica, non modificare)",src:d.src});
  L.push({sw:"DSW4",n:6,v:bin(Math.floor(c/10),6),what:"Ciclo frigorifero - decine ("+c+")",need:c>=10,src:d.src});
  L.push({sw:"RSW1",rot:1,v:String(c%10),what:"Ciclo frigorifero - unità ("+c+")",need:c%10!==0});
  L.push({sw:"DSW5",n:2,v:termOn?"10":"00",what:termOn?"Resistenza terminale ON (pin 1, di fabbrica)":"Resistenza terminale OFF: un'altra U.E. della stessa linea H-LINK la tiene ON",need:!termOn,src:d.src});
  if(d.k==="ut"){L.push({sw:"DSW6",n:3,v:d.p?"100":"000",what:"Non usato (di fabbrica, non modificare)",src:d.src});L.push({sw:"DSW7",n:2,v:d.r32?"10":"00",what:"Non usato (di fabbrica, non modificare)",src:d.src})}
  else L.push({sw:"DSW6",n:3,v:"000",what:"Selezione funzioni (di fabbrica)",src:d.src});
  return {m:C(m),role:"",dips:L}}
window.HDIP={utDips,utInfo,utCap,VNAME,bin,hpOf,vSeries,mods,comboName,comboCheck,comboList,vrfDips,VCAP,CMB,iu,ICAP,yut,sam,samDips,utTerm};
})();
