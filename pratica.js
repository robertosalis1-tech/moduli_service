// Dati condivisi tra i moduli ("pratica corrente") + registrazione dell'app (offline)
(function(){
var KEY="bhc_pratica_corrente_v1";
var MAP={
 yu:{cliente:"cliente",indirizzo:"indirizzo",citta:"citta",telefono_cliente:"tel_cli",email_cliente:"email_cli",focus66:"focus66",tecnico_sat:"tecnico",installatore:"installatore",tel_installatore:"tel_inst",gas:"refrigerante",modello_ui:"mod_ui",seriale_ui:"ser_ui",modello_ue:"mod_ue",seriale_ue:"ser_ue",data:"data_avv"},
 ut:{cliente:"cliente",indirizzo:"indirizzo",citta:"citta",telefono_cliente:"tel_cli",email_cliente:"email_cli",focus66:"focus66",tecnico_sat:"tecnico",installatore:"installatore",tel_installatore:"tel_inst",email_installatore:"email_inst",sat_ragione:"sat",sat_tel:"sat_tel",sat_email:"sat_email",gas:"refrigerante",modello_ue:"mod_ue",seriale_ue:"ser_ue",data:"data_avv"},
 mi:{cliente:"cliente",cli_indirizzo:"indirizzo",cli_citta:"citta",cli_cap:"cap",cli_prov:"prov",cli_tel:"tel_cli",cli_email:"email_cli",inst_nome:"installatore",inst_tel:"tel_inst",inst_email:"email_inst",sat_nome:"sat",sat_tecnico:"tecnico",sat_tel:"sat_tel",sat_email:"sat_email",n_avv_focus66:"focus66",refrigerante:"refrigerante",mod_ue:"mod_ue",ser_ue:"ser_ue",mod_ui:"mod_ui",ser_ui:"ser_ui",gar_avv:"data_avv"}};
function get(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
function set(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
var REFR=["R32","R410A","R290","R407C","R134a"];
window.PR={get:get,set:set,
 // all'apertura: riempie i campi vuoti del modulo con i dati della pratica
 pull:function(S,m){var p=get(),M=MAP[m];if(!M)return;for(var k in M){var v=p[M[k]];if(v&&!S[k]){if(M[k]==="refrigerante"&&REFR.indexOf(v)<0)continue;S[k]=v}}},
 // a ogni salvataggio: aggiorna la pratica con i campi compilati
 push:function(S,m){var p=get(),M=MAP[m],ch=false;if(!M)return;for(var k in M){var v=S[k];if(v&&typeof v==="string"&&p[M[k]]!==v){p[M[k]]=v;ch=true}}if(ch){p._agg=new Date().toISOString();p._da=m;set(p)}}};
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(function(){});
})();
