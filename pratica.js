// Accesso riservato: ogni dispositivo deve essere sbloccato con un codice firmato da BHC (richiesta via mail).
(function(){
var PUB={"key_ops":["verify"],"ext":true,"kty":"EC","x":"DG6qfkkOvKzbPxaw1H-tR65Tpd8ODF4ROUhM0RrOfD0","y":"k8t357QL_YrHj5OzlmH1vkh1xLI0BrxjNslG8EXukVs","crv":"P-256"}, MAIL="service-italia@bosch-hcgroup.com", K="bhc_accesso_v1", DK="bhc_dev_id_v1";
var de=document.documentElement;de.classList.add("lock");
var st=document.createElement("style");st.textContent="html.lock body>*:not(#gate){display:none!important}#gate{position:fixed;inset:0;z-index:9999;background:#f3f5f8;overflow:auto;font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1f2b45}#gate .gw{max-width:560px;margin:auto;padding:calc(16px + env(safe-area-inset-top)) 16px 40px}#gate .gb{background:#e60027;color:#fff;font-size:12px;padding:5px 12px;border-radius:8px;margin-bottom:12px}#gate .gc{background:#fff;border-radius:14px;box-shadow:0 1px 3px #0002;padding:16px;margin:0 0 14px}#gate h1{font-size:19px;margin:6px 0 10px}#gate h2{font-size:14px;margin:0 0 8px;text-transform:uppercase;color:#3d7ab8}#gate label{display:block;font-size:12px;font-weight:600;margin:8px 0 0}#gate input,#gate textarea{width:100%;box-sizing:border-box;margin-top:3px;padding:9px;border:1px solid #c9d2df;border-radius:8px;font:inherit;background:#fff8c4}#gate textarea{min-height:70px;font-family:monospace;font-size:12px}#gate button{margin-top:12px;border:0;border-radius:10px;padding:11px 16px;font:inherit;font-weight:700;background:#e60027;color:#fff;cursor:pointer;width:100%}#gate .id{font:700 22px/1.2 monospace;letter-spacing:2px;text-align:center;background:#eef5ff;border-radius:10px;padding:12px;margin:8px 0}#gate .er{color:#c00;font-weight:600;margin-top:8px}#gate small{color:#667085}";
document.head.appendChild(st);
function b64u(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function devId(){var id=null;try{id=localStorage.getItem(DK)}catch(e){}if(!id){var A="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",r=crypto.getRandomValues(new Uint8Array(10));id="";for(var i=0;i<10;i++){id+=A[r[i]%A.length];if(i===4)id+="-"}try{localStorage.setItem(DK,id)}catch(e){}}return id}
async function verify(id,code){try{var k=await crypto.subtle.importKey("jwk",PUB,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);return await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},k,b64u(code.replace(/[^A-Za-z0-9_-]/g,"")),new TextEncoder().encode("MS1|"+id))}catch(e){return false}}
function unlock(){de.classList.remove("lock");var g=document.getElementById("gate");if(g)g.remove()}
function esc(s){return String(s||"").replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function showGate(id,msg){var g=document.getElementById("gate");if(!g){g=document.createElement("div");g.id="gate";document.body.appendChild(g)}
  var saved={};try{saved=JSON.parse(localStorage.getItem(K+"_req")||"{}")}catch(e){}
  g.innerHTML='<div class="gw"><div class="gb"><b>Bosch Home Comfort Cooling and Heating SAS</b> · Hitachi Cooling &amp; Heating</div><div class="gc"><h1>Moduli Service - accesso riservato</h1><p>L\'app è riservata ai <b>tecnici dei centri assistenza autorizzati</b>. Ogni telefono / tablet / PC deve essere abilitato da BHC Italia.</p><p>Codice di questo dispositivo:</p><div class="id">'+id+'</div>'+(msg?'<div class="er">'+esc(msg)+'</div>':'')+'</div>'+
  '<div class="gc"><h2>1. Richiedi l\'accesso</h2><label>Nome e cognome<input id="g_nome" value="'+esc(saved.nome)+'"></label><label>Centro assistenza (SAT)<input id="g_sat" value="'+esc(saved.sat)+'"></label><label>Email<input id="g_mail" type="email" value="'+esc(saved.mail)+'"></label><label>Telefono<input id="g_tel" type="tel" value="'+esc(saved.tel)+'"></label><button id="g_req">Invia la richiesta per mail</button><small>Si apre la mail già compilata: inviala e attendi il codice di sblocco.</small></div>'+
  '<div class="gc"><h2>2. Inserisci il codice di sblocco</h2><label>Codice ricevuto (copia e incolla)<textarea id="g_code"></textarea></label><button id="g_ok">Sblocca</button><small>Il codice vale solo per questo dispositivo. Su iPhone: prima aggiungi l\'app alla schermata Home e richiedi il codice dall\'icona (Safari e l\'icona sono separati).</small></div></div>';
  document.getElementById("g_req").onclick=function(){var d={nome:val("g_nome"),sat:val("g_sat"),mail:val("g_mail"),tel:val("g_tel")};if(!d.nome||!d.sat){alert("Inserire nome e centro assistenza");return}try{localStorage.setItem(K+"_req",JSON.stringify(d))}catch(e){}
    var body="Richiesta di accesso all'app Moduli Service\n\nCodice dispositivo: "+id+"\nNome e cognome: "+d.nome+"\nCentro assistenza (SAT): "+d.sat+"\nEmail: "+d.mail+"\nTelefono: "+d.tel+"\nDispositivo: "+navigator.userAgent.slice(0,120)+"\n";
    location.href="mailto:"+MAIL+"?subject="+encodeURIComponent("Richiesta accesso Moduli Service - "+d.sat+" - "+id)+"&body="+encodeURIComponent(body)};
  document.getElementById("g_ok").onclick=async function(){var c=val("g_code");if(await verify(id,c)){try{localStorage.setItem(K,JSON.stringify({id:id,code:c}))}catch(e){}unlock()}else showGate(id,"Codice non valido per questo dispositivo.")}}
function val(i){return(document.getElementById(i).value||"").trim()}
async function check(){var id=devId(),a=null;try{a=JSON.parse(localStorage.getItem(K)||"null")}catch(e){}
  var ok=a&&a.id===id&&await verify(id,a.code);
  if(ok){unlock();
    try{var r=await fetch("accessi-revocati.json?t="+Date.now(),{cache:"no-store"});if(r.ok){var L=await r.json();if((L.revocati||[]).indexOf(id)>=0){localStorage.removeItem(K);de.classList.add("lock");showGate(id,"Accesso revocato per questo dispositivo.")}}}catch(e){}}
  else showGate(id)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",check);else check();
})();

// Dati condivisi tra i moduli ("pratica corrente") + registrazione dell'app (offline)
(function(){
var KEY="bhc_pratica_corrente_v1";
var MAP={
 yu:{cliente:"cliente",indirizzo:"indirizzo",citta:"citta",telefono_cliente:"tel_cli",email_cliente:"email_cli",focus66:"focus66",tecnico_sat:"tecnico",installatore:"installatore",tel_installatore:"tel_inst",gas:"refrigerante",modello_ui:"mod_ui",seriale_ui:"ser_ui",modello_ue:"mod_ue",seriale_ue:"ser_ue",data:"data_avv"},
 ut:{cliente:"cliente",indirizzo:"indirizzo",citta:"citta",telefono_cliente:"tel_cli",email_cliente:"email_cli",focus66:"focus66",tecnico_sat:"tecnico",installatore:"installatore",tel_installatore:"tel_inst",email_installatore:"email_inst",sat_ragione:"sat",sat_tel:"sat_tel",sat_email:"sat_email",gas:"refrigerante",modello_ue:"mod_ue",seriale_ue:"ser_ue",data:"data_avv"},
 mi:{cliente:"cliente",cli_indirizzo:"indirizzo",cli_citta:"citta",cli_cap:"cap",cli_prov:"prov",cli_tel:"tel_cli",cli_email:"email_cli",inst_nome:"installatore",inst_tel:"tel_inst",inst_email:"email_inst",sat_nome:"sat",sat_tecnico:"tecnico",sat_tel:"sat_tel",sat_email:"sat_email",n_avv_focus66:"focus66",refrigerante:"refrigerante",mod_ue:"mod_ue",ser_ue:"ser_ue",mod_ui:"mod_ui",ser_ui:"ser_ui",gar_avv:"data_avv",ser_comp:"ser_comp",comp_cod:"comp_cod",comp_err:"comp_err",n_intervento:"n_intervento"},
 mi_x:{},
 "011":{focus:"focus66",gas:"refrigerante",ue_mod:"mod_ue",ue_sn:"ser_ue",ui_mod:"mod_ui",ui_sn:"ser_ui",cli_tel:"tel_cli",cli_via:"indirizzo",cli_cap:"cap",cli_citta:"citta",cli_mail:"email_cli"},
 "021":{pu_focus:"focus66",pu_cliente:"cliente",pu_installatore:"installatore",pu_indirizzo:"indirizzo"},
 "031":{pr_focus:"focus66",pr_cliente:"cliente",pr_installatore:"installatore",pr_indirizzo:"indirizzo"},
 "032":{vi_cliente:"cliente",vi_installatore:"installatore",vi_nome_tecnico:"tecnico"},
 "033":{v_cliente:"cliente",v_tel:"tel_cli",v_mail:"email_cli",v_ind:"indirizzo",v_focus:"focus66",v_data:"data_avv",v_inst:"installatore",v_sat:"sat",v_tec:"tecnico",s1_m1_mod:"mod_ue",s1_m1_sn:"ser_ue"},
 "051":{focus:"focus66",cli_nome:"cliente",cli_tel:"tel_cli",cli_via:"indirizzo",cli_cap:"cap",cli_citta:"citta",cli_mail:"email_cli"},
 "052":{ordine_focus:"focus66",data_avv:"data_avv",sat_ditta:"sat",sat_tecnico:"tecnico",ute_nome:"cliente",ute_tel:"tel_cli",ute_email:"email_cli",ute_via:"indirizzo",inst_nome:"installatore",modello:"mod_ue"},
 "062":{cmp_sat:"sat",cmp_tecnico:"tecnico",cmp_tel:"sat_tel",cmp_email:"sat_email",cmp_mod_ue:"mod_ue",cmp_ser_ue:"ser_ue",cmp_ser_comp:"ser_comp",cmp_codice_ricambio:"comp_cod",cmp_codice_errore:"comp_err",cmp_n_intervento:"n_intervento"}};
function get(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
function set(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
var REFR=["R32","R410A","R290","R407C","R134a"];
window.PR={get:get,set:set,
 // all'apertura: riempie i campi vuoti del modulo con i dati della pratica
 pull:function(S,m){var p=get(),M=MAP[m];if(!M)return;for(var k in M){var v=p[M[k]];if(v&&!S[k]){if(M[k]==="refrigerante"&&REFR.indexOf(v)<0)continue;S[k]=v}}},
 // a ogni salvataggio: aggiorna la pratica con i campi compilati
 push:function(S,m){var p=get(),M=MAP[m],ch=false;if(!M)return;if(m==="011"&&S.cli_nome){var cc=(S.cli_nome+" "+(S.cli_cognome||"")).trim();if(p.cliente!==cc){p.cliente=cc;ch=true}}for(var k in M){var v=S[k];if(v&&typeof v==="string"&&p[M[k]]!==v){p[M[k]]=v;ch=true}}if(ch){p._agg=new Date().toISOString();p._da=m;set(p)}}};
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(function(){});
})();
