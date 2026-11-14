// AVVISI: evidenzia le caselle con valori anomali (diametri diversi dal nominale e carica ricalcolata,
// parametri fuori campo, sbilanciamento di tensioni / correnti / avvolgimenti) con un messaggio sotto la casella
// e un riepilogo "⚠ Avvisi" sempre raggiungibile. Non blocca la compilazione.
(function(){
var PG=location.pathname.split("/").pop(),R=[];
function V(){try{return S}catch(e){return {}}}
function num(n){var v=V()[n];if(v==null||v==="")return null;var x=Number(String(v).replace(",",".").replace(/[\s>≥<≤]/g,""));return isNaN(x)?null:x}
function fx(v,k){return String((Math.round(v*Math.pow(10,k))/Math.pow(10,k)).toFixed(k)).replace(".",",")}
function rule(f,lbl,o){o=o||{};R.push({f:f,lbl:lbl,bal:o.bal,rng:o.rng,u:o.u||"",min:o.min})}
function custom(fn){R.push({fn:fn})}
function raw(n){var v=V()[n];return v==null?"":String(v).trim()}
function compChecks(T,W,E,X){return function(){var o=[],v=T?num(T):null;if(v!==null){if(v>=180&&v<=260){if(v<207||v>253)o.push([[T],"Tensione monofase "+fx(v,0)+" V fuori dal campo 207-253 V: verificare l'alimentazione (può danneggiare compressore e inverter)"])}
      else if(v>=300&&v<=480){if(v<360||v>440)o.push([[T],"Tensione trifase "+fx(v,0)+" V fuori dal campo 360-440 V: verificare l'alimentazione"])}else o.push([[T],"Tensione "+fx(v,0)+" V anomala: né monofase (230 V) né trifase (400 V)"])}
    var L=["R u-v","R v-w","R w-u"],w=W.map(num);
    W.forEach(function(n,i){var r=raw(n);if(!r)return;
      if(/^(ol|o\.l\.|inf|∞|aperto|open)/i.test(r)||w[i]!==null&&w[i]>=50)o.push([[n],L[i]+": avvolgimento interrotto (circuito aperto). Possibile filo bruciato o protezione termica interna aperta: ricontrollare a compressore freddo"]);
      else if(w[i]!==null&&w[i]<=0.05)o.push([[n],L[i]+" = "+fx(w[i],2)+" Ω: quasi nulla. Possibile avvolgimento in corto circuito, oppure puntali non azzerati: ripetere la misura"])});
    var ok=w.filter(function(x){return x!==null&&x>0.05&&x<50});
    if(ok.length===3){var m=(ok[0]+ok[1]+ok[2])/3,d=Math.max.apply(null,ok.map(function(x){return Math.abs(x-m)/m*100}));
      if(d>10)o.push([W,"Squilibrio tra gli avvolgimenti "+fx(d,0)+"% (max 10%): possibili spire in corto circuito. Ripetere la misura a compressore freddo con strumento adatto alle basse resistenze"])}
    var LE=["R u-pe","R v-pe","R w-pe"];
    E.forEach(function(n,i){var e=num(n);if(e===null)return;
      if(e<0.1)o.push([[n],LE[i]+" = "+fx(e,2)+" MΩ: guasto a terra (avvolgimento a massa). Compressore da sostituire; verificare anche modulo inverter, cavi e morsettiera"]);
      else if(e<1)o.push([[n],LE[i]+" = "+fx(e,2)+" MΩ: isolamento insufficiente (min 1 MΩ), possibile dispersione. Se l'unità è rimasta ferma, il refrigerante liquido nel carter abbassa l'isolamento: alimentare la resistenza carter 6-12 ore e ripetere la misura"])});
    if(X&&V().cmp_blocco_meccanico==="Yes"&&!V().cmp_inverter)o.push([["cmp_inverter_note"],"Blocco meccanico: la verifica del modulo inverter con compressore scollegato è obbligatoria"]);
    return o}}

function grpV(s,p,lbl3,lblf){ // tensioni e correnti come nei moduli Utopia / Yutaki
  rule(["tens_l12"+s,"tens_l23"+s,"tens_l31"+s],p+"Tensioni concatenate",{bal:2,rng:[360,440],u:"V"});
  rule(["tens_l1n"+s,"tens_l2n"+s,"tens_l3n"+s],p+"Tensioni di fase",{bal:2,rng:[207,253],u:"V"});
  rule(["tens_ln"+s,"tens_ln_vuoto"+s],p+"Tensione monofase",{rng:[207,253],u:"V"});
  rule(["corr_l1"+s,"corr_l2"+s,"corr_l3"+s],p+"Correnti assorbite",{bal:10,u:"A"})}
if(/^mod-02-ut/.test(PG)){grpV("","");["_u2","_u3","_u4"].forEach(function(s,i){grpV(s,"U.E. "+(i+2)+": ")})}
else if(/^mod-01-2/.test(PG))grpV("","");
else if(/^mod-03-3/.test(PG)){for(var k=1;k<=8;k++)rule(["s"+k+"_v12","s"+k+"_v23","s"+k+"_v31"],"Sistema "+k+": tensioni",{bal:2,rng:[360,440],u:"V"})}
else if(/^mod-05-2/.test(PG)){rule(["v_12","v_23","v_31"],"Tensioni a vuoto",{bal:2,rng:[360,440],u:"V"});rule(["vl_12","vl_23","vl_31"],"Tensioni sotto carico",{bal:2,rng:[360,440],u:"V"});
  for(var k=1;k<=4;k++)rule(["i"+k+"_l1","i"+k+"_l2","i"+k+"_l3"],"Modulo "+k+": correnti",{bal:10,u:"A"})}
else if(/^mod-06-1/.test(PG)){rule(["v12","v23","v31"],"Tensioni",{bal:3,rng:function(){return V().alim==="Monofase"?[207,253]:[360,440]},u:"V"});
  rule(["i1","i2","i3"],"Correnti",{bal:10,u:"A"});custom(compChecks(null,["r_uv","r_vw","r_wu"],["r_upe","r_vpe","r_wpe"],0));
rule(["r_hlink"],"Resistenza linea H-LINK",{rng:[60,90],u:"Ohm"})}
else if(/^mod-06-2/.test(PG))custom(compChecks("cmp_tensione",["cmp_r_uv","cmp_r_vw","cmp_r_wu"],["cmp_r_upe","cmp_r_vpe","cmp_r_wpe"],1));
function msgCalc(n){return /diam/.test(n)?"Diametro diverso dal nominale di catalogo: verificare. La carica aggiuntiva viene ricalcolata sul diametro reale.":/gm_agg|carica|refr|_w\d*$|wcar/.test(n)?"Carica ricalcolata per diametro non nominale: verificare il valore.":"Valore diverso dal nominale: verificare."}
function evalAll(){var M={},L=[];function add(n,m,sum){(M[n]=M[n]||[]).indexOf(m)<0&&M[n].push(m);if(sum!==false&&L.indexOf(m)<0)L.push(m)}
  R.forEach(function(r){if(r.fn){(r.fn()||[]).forEach(function(x){x[0].forEach(function(n,i){i===x[0].length-1?add(n,x[1]):add(n,"\u0000",false)})});return}var vs=r.f.map(num),rg=typeof r.rng==="function"?r.rng():r.rng;
    if(rg)r.f.forEach(function(n,i){var v=vs[i];if(v!==null&&(v<rg[0]||v>rg[1]))add(n,r.lbl+": "+fx(v,v%1?1:0)+" "+r.u+" fuori dal campo "+rg[0]+"-"+rg[1]+" "+r.u)});
    if(r.min!=null)r.f.forEach(function(n,i){var v=vs[i];if(v!==null&&v<r.min)add(n,r.lbl+": "+fx(v,2)+" "+r.u+" sotto il minimo di "+r.min+" "+r.u)});
    if(r.bal&&vs.every(function(v){return v!==null})){var m=vs.reduce(function(a,b){return a+b},0)/vs.length;if(m>0){var dv=vs.map(function(v){return Math.abs(v-m)/m*100}),p=Math.max.apply(null,dv);
      if(p>r.bal){var mm2=r.lbl.match(/^(.*?: )?(.*)$/),t=(mm2[1]||"")+"Sbilanciamento "+mm2[2].toLowerCase()+": "+fx(p,1)+"% (max "+r.bal+"%)";
        r.f.forEach(function(n,i){if(dv[i]>=p*0.6)add(n,t)})}}}});
  try{Object.keys(COL).forEach(function(k){if(!/#bg$/.test(k))return;var b=COL[k],n=k.slice(0,-3);if(b&&b[0]==="RGB"&&b[1]>0.98&&Math.abs(b[2]-0.9)<0.02&&b[3]<0.2&&!/^hls_|^cov/.test(n)&&(V()[n]||"")!=="")add(n,msgCalc(n),/diam|gm_agg|carica|refr|_w\d*$|wcar/.test(n))})}catch(e){}
  return {M:M,L:L}}
var st=document.createElement("style");
st.textContent=".avv-hl{background:#ffe600!important;border:2.5px solid #e98300!important;color:#7a2e00!important}.avvm{display:block;margin:3px 0 2px;padding:4px 7px;border-radius:7px;background:#fff1d6;border:1px solid #f0b45a;color:#7a3b00;font:600 12px/1.3 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;white-space:normal;text-transform:none}"+
"#avvb{position:fixed;left:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:900;border:0;border-radius:28px;background:#e98300;color:#fff;font:700 15px system-ui,Arial;padding:13px 16px;box-shadow:0 3px 10px #0004;cursor:pointer;display:none}"+
"#avvp{position:fixed;inset:auto 10px calc(74px + env(safe-area-inset-bottom)) 10px;max-height:60vh;overflow:auto;z-index:9500;background:#fff;border-radius:14px;box-shadow:0 6px 24px #0005;padding:12px 14px;font:14px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1f2b45}#avvp li{margin:5px 0}#avvp b{display:block;margin-bottom:6px}";
document.head.appendChild(st);
var busy=false,tm=null,last={L:[]};
function run(){busy=true;try{var E=evalAll(),extra=[];last=E;
  document.querySelectorAll(".avvm").forEach(function(e){e.remove()});document.querySelectorAll(".avv-hl").forEach(function(e){e.classList.remove("avv-hl")});
  document.querySelectorAll("input[data-n],select[data-n],textarea[data-n],input[data-c]").forEach(function(el){var n=el.dataset.n||el.dataset.c,ms=E.M[n]?E.M[n].slice():[];
    // campo di misura indicato nella riga della tabella (es. 0~199): valore fuori campo
    var tr=el.closest&&el.closest("tr");if(tr&&el.dataset.n&&el.value!==""){var u=tr.querySelector("u");var mm=u&&u.textContent.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*[~–]\s*(-?\d+(?:[.,]\d+)?)$/);
      if(mm){var lo=Number(mm[1].replace(",",".")),hi=Number(mm[2].replace(",",".")),x=Number(el.value.replace(",","."));if(!isNaN(x)&&(x<lo||x>hi)){var d=(u.parentNode.childNodes[0].textContent||"Parametro").trim();var t=d+": "+el.value+" fuori dal campo del display ("+lo+"-"+hi+")";ms.push("fuori campo "+lo+"-"+hi);extra.push(t)}}}
    if(!ms.length)return;el.classList.add("avv-hl");ms=ms.filter(function(m){return m!=="\u0000"});if(!ms.length)return;var box=document.createElement("span");box.className="avvm";box.textContent="⚠ "+ms.join(" · ");
    var lab=el.closest("label");if(tr&&!lab){el.parentNode.appendChild(box)}else if(lab){lab.appendChild(box)}else el.insertAdjacentElement("afterend",box)});
  var all=E.L.concat(extra.filter(function(x){return E.L.indexOf(x)<0}));last.all=all;
  var b=document.getElementById("avvb");if(!b){b=document.createElement("button");b.id="avvb";b.onclick=panel;document.body.appendChild(b)}
  b.style.display=all.length?"block":"none";b.textContent="⚠ "+all.length+(all.length===1?" avviso":" avvisi");
  var p=document.getElementById("avvp");if(p)fill(p)}finally{setTimeout(function(){busy=false},0)}}
function fill(p){var a=last.all||[];p.innerHTML="<b>⚠ Avvisi sui valori inseriti</b>"+(a.length?"<ul style='margin:0;padding-left:18px'>"+a.map(function(x){return"<li>"+x.replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})+"</li>"}).join("")+"</ul>":"<small>Nessun avviso.</small>")+"<p style='margin:8px 0 0;font-size:12px;color:#667085'>Le caselle interessate sono evidenziate in giallo con il messaggio sotto. Gli avvisi non bloccano il verbale: verificare e annotare la causa.</p>"}
function panel(){var p=document.getElementById("avvp");if(p){p.remove();return}p=document.createElement("div");p.id="avvp";p.onclick=function(){p.remove()};document.body.appendChild(p);fill(p)}
function later(){if(busy)return;clearTimeout(tm);tm=setTimeout(run,180)}
new MutationObserver(function(){later()}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener("input",later,true);document.addEventListener("change",later,true);
window.addEventListener("load",function(){setTimeout(run,300)});
window.AVVISI={run:run,list:function(){return (last.all||[]).slice()}};
})();
