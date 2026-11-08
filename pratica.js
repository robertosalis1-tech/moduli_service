// Dati condivisi tra i moduli ("pratica corrente") + registrazione dell'app (offline)
(function(){
var KEY="bhc_pratica_corrente_v1";
var MAP={
 yu:{cliente:"cliente",indirizzo:"indirizzo",citta:"citta",telefono_cliente:"tel_cli",email_cliente:"email_cli",focus66:"focus66",tecnico_sat:"tecnico",installatore:"installatore",tel_installatore:"tel_inst",gas:"refrigerante",modello_ui:"mod_ui",seriale_ui:"ser_ui",modello_ue:"mod_ue",seriale_ue:"ser_ue",data:"data_avv"},
 ut:{cliente:"cliente",indirizzo:"indirizzo",citta:"citta",telefono_cliente:"tel_cli",email_cliente:"email_cli",focus66:"focus66",tecnico_sat:"tecnico",installatore:"installatore",tel_installatore:"tel_inst",email_installatore:"email_inst",sat_ragione:"sat",sat_tel:"sat_tel",sat_email:"sat_email",gas:"refrigerante",modello_ue:"mod_ue",seriale_ue:"ser_ue",data:"data_avv"},
 mi:{cliente:"cliente",cli_indirizzo:"indirizzo",cli_citta:"citta",cli_cap:"cap",cli_prov:"prov",cli_tel:"tel_cli",cli_email:"email_cli",inst_nome:"installatore",inst_tel:"tel_inst",inst_email:"email_inst",sat_nome:"sat",sat_tecnico:"tecnico",sat_tel:"sat_tel",sat_email:"sat_email",n_avv_focus66:"focus66",refrigerante:"refrigerante",mod_ue:"mod_ue",ser_ue:"ser_ue",mod_ui:"mod_ui",ser_ui:"ser_ui",gar_avv:"data_avv",ser_comp:"ser_comp",comp_cod:"comp_cod",comp_err:"comp_err",n_intervento:"n_intervento"},
 mi_x:{},
 "011":{inst_ditta:"installatore",inst_tel:"tel_inst",inst_mail:"email_inst",focus:"focus66",gas:"refrigerante",ue_mod:"mod_ue",ue_sn:"ser_ue",ui_mod:"mod_ui",ui_sn:"ser_ui",cli_tel:"tel_cli",cli_via:"indirizzo",cli_cap:"cap",cli_citta:"citta",cli_mail:"email_cli"},
 "021":{pu_focus:"focus66",pu_cliente:"cliente",pu_installatore:"installatore",pu_indirizzo:"indirizzo"},
 "031":{pr_focus:"focus66",pr_cliente:"cliente",pr_installatore:"installatore",pr_indirizzo:"indirizzo"},
 "032":{vi_cliente:"cliente",vi_installatore:"installatore",vi_nome_tecnico:"tecnico"},
 "033":{v_cliente:"cliente",v_tel:"tel_cli",v_mail:"email_cli",v_ind:"indirizzo",v_focus:"focus66",v_data:"data_avv",v_inst:"installatore",v_sat:"sat",v_tec:"tecnico",s1_m1_mod:"mod_ue",s1_m1_sn:"ser_ue"},
 "041":{imp_nome:"cliente",focus:"focus66",imp_ind:"indirizzo",inst:"installatore"},
 "042":{ac_nome:"cliente",ac_tel:"tel_cli",ac_email:"email_cli"},
 "051":{inst_ditta:"installatore",inst_tel:"tel_inst",inst_mail:"email_inst",focus:"focus66",cli_nome:"cliente",cli_tel:"tel_cli",cli_via:"indirizzo",cli_cap:"cap",cli_citta:"citta",cli_mail:"email_cli"},
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
