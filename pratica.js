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
 "063":{dt_cliente:"installatore",dt_cli_email:"email_inst",dt_dest_nome:"cliente",dt_dest_indirizzo:"indirizzo",dt_dest_citta:"citta",dt_u0_modello:"mod_ue",dt_u0_matricola:"ser_ue"},
 "062":{cmp_sat:"sat",cmp_tecnico:"tecnico",cmp_tel:"sat_tel",cmp_email:"sat_email",cmp_mod_ue:"mod_ue",cmp_ser_ue:"ser_ue",cmp_ser_comp:"ser_comp",cmp_codice_ricambio:"comp_cod",cmp_codice_errore:"comp_err",cmp_n_intervento:"n_intervento"}};
function get(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
function set(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
var IOK={Input_1:1,Input_2:1,Input_3:1,Input_4:1,Input_5:1,Input_6:1,Input_7:1,Output_1:1,Output_2:1,Output_3:1,Output_4:1,Output_9:1};
var REFR=["R32","R410A","R290","R407C","R134a"];
window.PR={get:get,set:set,
 // all'apertura: riempie i campi vuoti del modulo con i dati della pratica
 pull:function(S,m){var p=get(),M=MAP[m];if(!M)return;
  if(m==="033"&&p.vrf){if(!S.v_nsis)S.v_nsis=String(Math.min(8,p.vrf.length));p.vrf.slice(0,8).forEach(function(v,j){var s=j+1;if(S["s"+s+"_m1_mod"])return;var ml=v.m.slice(0,4);
    S["s"+s+"_nmod"]=String(ml.length);ml.forEach(function(x,k){S["s"+s+"_m"+(k+1)+"_mod"]=x});if(ml.length===1&&v.sn&&!S["s"+s+"_m1_sn"])S["s"+s+"_m1_sn"]=v.sn;
    if(v.z&&!S["s"+s+"_nome"])S["s"+s+"_nome"]=v.z;if(v.n&&!S["s"+s+"_ui_dich"])S["s"+s+"_ui_dich"]=String(v.n);
    (v.ui||[]).forEach(function(u,k){if(u&&!S["s"+s+"_ui"+(k+1)+"_mod"])S["s"+s+"_ui"+(k+1)+"_mod"]=u});
    if(v.hr){if(!S["s"+s+"_tipo"])S["s"+s+"_tipo"]="Recupero di calore (3 tubi)";if(v.ch&&v.ch.length&&!S["s"+s+"_chn"]){S["s"+s+"_chn"]=String(v.ch.length);v.ch.forEach(function(b,q){var p0="s"+s+"_ch"+(q+1)+"_";if(b.m)S[p0+"mod"]=b.m;if(b.sn)S[p0+"sn"]=b.sn;if(b.loc)S[p0+"loc"]=b.loc})}
      (v.uich||[]).forEach(function(x,k){if(x&&!S["s"+s+"_ui"+(k+1)+"_ch"])S["s"+s+"_ui"+(k+1)+"_ch"]=x})}})}
  if((m==="011"||m==="yu")&&p.imp){for(var a in p.imp){var t=a;if(m==="yu"&&/^imp_io_/.test(a)){t=a.slice(7);if(S[t]&&S[t]!=="Disabilitato")continue;S[t]=p.imp[a];continue}if(m==="yu"&&/^imp_io_/.test(a))continue;if(S[t]===undefined||S[t]==="")S[t]=p.imp[a]}}for(var k in M){var v=p[M[k]];if(v&&!S[k]){if(M[k]==="refrigerante"&&REFR.indexOf(v)<0)continue;S[k]=v}}},
 // a ogni salvataggio: aggiorna la pratica con i campi compilati
 push:function(S,m){var p=get(),M=MAP[m],ch=false;if(!M)return;
  // sistemi VRF dalla check list 03.1 (moduli master / slave, U.I.) verso il verbale 03.3
  if(m==="031"){var vs=[],rows=[];for(var i=1;i<=10;i++){var mm=String(S["pr_ue"+i+"_mods"]||"").trim()||S["pr_ue"+i+"_mod"];if(mm)rows.push(i)}
    rows.forEach(function(i){var mm=String(S["pr_ue"+i+"_mods"]||"").trim()||S["pr_ue"+i+"_mod"],ml=window.HDIP?HDIP.mods(mm):String(mm).split(/\s*\+\s*/),n=parseInt(S["pr_ue"+i+"_ui"])||0,uim=[];
      var hr=/3 tubi/.test(S["pr_ue"+i+"_hr"]||""),chs=[],uich=[],loc={};
      if(hr){var nc=parseInt(S.sch_chn)||0;for(var q=1;q<=nc;q++){if(String(S["sch_ch"+q+"_sys"]||"")!==String(i)&&!(rows.length===1&&!S["sch_ch"+q+"_sys"]))continue;chs.push({m:S["sch_ch"+q+"_mod"]||"",sn:S["sch_ch"+q+"_sn"]||"",loc:S["sch_ch"+q+"_loc"]||""});loc[q]=chs.length}}
      for(var k=1;k<=n;k++){var id=(rows.length>1?i+".":"")+k,kk=String(id).replace(/[^0-9A-Za-z]/g,"_");uim.push(S["sch_ui_"+kk+"_mod"]||"");
        if(hr){var cv=/^CH(\d+)(?:[.\/-](\d+))?$/.exec(String(S["sch_ui_"+kk+"_ch"]||"").toUpperCase().replace(/\s/g,""));uich.push(cv&&loc[+cv[1]]?"CH"+loc[+cv[1]]+(cv[2]?"."+cv[2]:""):"")}}
      var o={m:ml,sn:S["pr_ue"+i+"_sn"]||"",n:n,z:S["pr_ue"+i+"_zona"]||"",ui:uim};if(hr){o.hr=1;o.ch=chs;o.uich=uich}vs.push(o)});
    if(vs.length&&JSON.stringify(vs)!==JSON.stringify(p.vrf||[])){p.vrf=vs;ch=true}}
  // configurazione impianto Yutaki (check list 01.1 / verbale 01.2): passa al verbale del tecnico
  if(m==="011"||m==="yu"){var im={},n=0;for(var a in S){if(/^imp_/.test(a)&&typeof S[a]==="string"&&S[a]){im[a]=S[a];n++}}if(m==="yu")for(var b in IOK)if(S[b]&&S[b]!=="Disabilitato"){im["imp_io_"+b]=S[b];n++}if(n&&JSON.stringify(im)!==JSON.stringify(p.imp||{})){p.imp=im;ch=true}}if(m==="011"&&S.cli_nome){var cc=(S.cli_nome+" "+(S.cli_cognome||"")).trim();if(p.cliente!==cc){p.cliente=cc;ch=true}}for(var k in M){var v=S[k];if(v&&typeof v==="string"&&p[M[k]]!==v){p[M[k]]=v;ch=true}}if(ch){p._agg=new Date().toISOString();p._da=m;set(p)}}};
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(function(){});
})();
