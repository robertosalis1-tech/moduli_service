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
 "041":{imp_nome:"cliente",focus:"focus66",imp_ind:"indirizzo",inst:"installatore",data_avv:"data_avv",firma_2_nome:"tecnico"},
 "042":{ac_nome:"cliente",ac_tel:"tel_cli",ac_email:"email_cli"},
 "051":{inst_ditta:"installatore",inst_tel:"tel_inst",inst_mail:"email_inst",focus:"focus66",cli_nome:"cliente",cli_tel:"tel_cli",cli_via:"indirizzo",cli_cap:"cap",cli_citta:"citta",cli_mail:"email_cli"},
 "052":{ordine_focus:"focus66",data_avv:"data_avv",sat_ditta:"sat",sat_tecnico:"tecnico",ute_nome:"cliente",ute_tel:"tel_cli",ute_email:"email_cli",ute_via:"indirizzo",inst_nome:"installatore",modello:"mod_ue"},
 "063":{dt_cliente:"installatore",dt_cli_email:"email_inst",dt_dest_nome:"cliente",dt_dest_indirizzo:"indirizzo",dt_dest_citta:"citta",dt_u0_modello:"mod_ue",dt_u0_matricola:"ser_ue"},
 "062":{cmp_sat:"sat",cmp_tecnico:"tecnico",cmp_tel:"sat_tel",cmp_email:"sat_email",cmp_mod_ue:"mod_ue",cmp_ser_ue:"ser_ue",cmp_ser_comp:"ser_comp",cmp_codice_ricambio:"comp_cod",cmp_codice_errore:"comp_err",cmp_n_intervento:"n_intervento"}};
function get(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
function set(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
var IOK={Input_1:1,Input_2:1,Input_3:1,Input_4:1,Input_5:1,Input_6:1,Input_7:1,Output_1:1,Output_2:1,Output_3:1,Output_4:1,Output_9:1};
var REFR=["R32","R410A","R290","R407C","R134a"];
// stesso cantiere con più prodotti (Yutaki, Utopia, VRF, chiller): modello / matricola / refrigerante restano separati per famiglia
var FAM={yu:"yu","011":"yu",ut:"ut","021":"ut","031":"vrf","032":"vrf","033":"vrf","051":"sam","052":"sam"},PK={mod_ue:1,ser_ue:1,mod_ui:1,ser_ui:1,refrigerante:1};
function fval(p,m,t){var f=FAM[m];if(!f||!PK[t])return p[t];var pf=p.pf||{};if(pf[f]&&pf[f][t])return pf[f][t];for(var g in pf)if(g!==f&&pf[g]&&pf[g][t])return "";return p[t]}
// controlli centralizzati / accessori dichiarati (sch_cc*) nelle check list e nel verbale VRF
function ccOf(S){var n=parseInt(S.sch_cc_n)||0,o=[];for(var r=1;r<=n;r++){var t=S["sch_cc"+r+"_t"];if(t)o.push({t:t,q:S["sch_cc"+r+"_q"]||"",u:S["sch_cc"+r+"_u"]||"",ip:S["sch_cc"+r+"_ip"]||""})}return o}
var CSRE=/CSNET/i;
// verbale CSNET (MOD 04.1): dati dal verbale VRF (p.v33) o dalla check list (p.vrf) e dispositivi (p.cc)
function pull041(S,p){var force=!!S.__force;delete S.__force;
  function put(k,v){if(v==null||v==="")return;if(force||S[k]==null||S[k]===""||S[k]==="Off")S[k]=String(v)}
  var sys=p.v33&&p.v33.sys&&p.v33.sys.length?p.v33.sys:(p.vrf||[]).map(function(v,j){return {s:j+1,nome:v.z||"",m:v.m||[],sn:v.sn?[v.sn]:[],n:v.n||0,aa:"",cyc:String(j),ui:(v.ui||[]).map(function(u,k){return {m:u,ad:(v.ad||[])[k]||"",loc:(v.loc||[])[k]||"",ch:(v.uich||[])[k]||""}})}});
  if(force&&sys.length){for(var r=1;r<=10;r++)["mod","sn","ui","uir"].forEach(function(x){delete S["cs_ue"+r+"_"+x]});for(var r2=1;r2<=30;r2++)for(var q=0;q<6;q++)delete S["ui_r"+r2+"_"+q]}
  sys.slice(0,10).forEach(function(x,j){var r=j+1;put("cs_ue"+r+"_mod",(x.m||[]).join(" + "));put("cs_ue"+r+"_sn",(x.sn||[]).join(" / "));put("cs_ue"+r+"_ui",x.n||"");put("cs_ue"+r+"_uir",x.aa||"")});
  var row=0;sys.forEach(function(x){(x.ui||[]).forEach(function(u){row++;if(row>30)return;var b="ui_r"+row+"_";put(b+"0","0");put(b+"1",u.cy||x.cyc);put(b+"2",u.ad);put(b+"3",u.ch);put(b+"4",u.loc||u.m);put(b+"5",x.nome)})});
  var cc=p.cc||[];if(!cc.length)return;
  if(force){delete S.csd_n;for(var k0=1;k0<=12;k0++){["t","q","u","ip","sn"].forEach(function(x){delete S["csd"+k0+"_"+x]});["1","2_o1","2_o2","2_o3","2_o4","3"].forEach(function(x){delete S["hlink_r"+k0+"_"+x];delete S["gw_r"+k0+"_"+x]})}}
  put("csd_n",String(Math.min(12,cc.length)));cc.slice(0,12).forEach(function(d,k){var b="csd"+(k+1)+"_";put(b+"t",d.t);put(b+"q",d.q);put(b+"u",d.u);put(b+"ip",d.ip)});
  var oct=function(ip){var a=String(ip||"").trim().split(".");return a.length===4&&a.every(function(x){return /^\d{1,3}$/.test(x)})?a:null};
  cc.forEach(function(d){var m=/CSNET Manager 2\s*(T10|T15|SL)/i.exec(d.t);if(m)put("modello","CSNET Manager 2"+m[1].toUpperCase());if(/CSNET Manager/i.test(d.t)){var o=oct(d.ip);if(o)o.forEach(function(x,i){put("net_r1_1_o"+(i+1),x)})}});
  var h=0,g=0;cc.forEach(function(d){var o=oct(d.ip),n=Math.max(1,Math.min(8,parseInt(d.q)||1));
    if(/HC-A64NET|CSNET Lite/i.test(d.t)){for(var i=0;i<n&&h<16;i++){h++;put("hlink_r"+h+"_1",/Lite/i.test(d.t)?"CSNET":"HC-A64NET");if(o&&i===0)o.forEach(function(x,j){put("hlink_r"+h+"_2_o"+(j+1),x)});put("hlink_r"+h+"_3",(/Lite/i.test(d.t)?"CSNET Lite":"")+(d.u?(/Lite/i.test(d.t)?" - ":"")+"U.I. "+d.u:""))}}
    var gm=/HI-(KNX|BAC)-(16|64)/i.exec(d.t);if(gm&&g<16){g++;put("gw_r"+g+"_1","HI-"+gm[1].toUpperCase()+"-"+gm[2]);if(o)o.forEach(function(x,j){put("gw_r"+g+"_2_o"+(j+1),x)});put("gw_r"+g+"_3",d.u?"U.I. "+d.u:"")}})}
window.PR={get:get,set:set,
 // all'apertura: riempie i campi vuoti del modulo con i dati della pratica
 pull:function(S,m){var p=get(),M=MAP[m];if(!M)return;
  if(m==="033"&&p.vrf){if(!S.v_nsis)S.v_nsis=String(Math.min(8,p.vrf.length));p.vrf.slice(0,8).forEach(function(v,j){var s=j+1;if(S["s"+s+"_m1_mod"])return;var ml=v.m.slice(0,4);
    S["s"+s+"_nmod"]=String(ml.length);ml.forEach(function(x,k){S["s"+s+"_m"+(k+1)+"_mod"]=x});if(ml.length===1&&v.sn&&!S["s"+s+"_m1_sn"])S["s"+s+"_m1_sn"]=v.sn;
    if(v.z&&!S["s"+s+"_nome"])S["s"+s+"_nome"]=v.z;if(v.n&&!S["s"+s+"_ui_dich"])S["s"+s+"_ui_dich"]=String(v.n);
    (v.ui||[]).forEach(function(u,k){if(u&&!S["s"+s+"_ui"+(k+1)+"_mod"])S["s"+s+"_ui"+(k+1)+"_mod"]=u});
    (v.loc||[]).forEach(function(u,k){if(u&&!S["s"+s+"_ui"+(k+1)+"_loc"])S["s"+s+"_ui"+(k+1)+"_loc"]=u});(v.ad||[]).forEach(function(u,k){if(u&&!S["s"+s+"_ui"+(k+1)+"_ind"])S["s"+s+"_ui"+(k+1)+"_ind"]=u});
    if(v.hr){if(!S["s"+s+"_tipo"])S["s"+s+"_tipo"]="Recupero di calore (3 tubi)";if(v.ch&&v.ch.length&&!S["s"+s+"_chn"]){S["s"+s+"_chn"]=String(v.ch.length);v.ch.forEach(function(b,q){var p0="s"+s+"_ch"+(q+1)+"_";if(b.m)S[p0+"mod"]=b.m;if(b.sn)S[p0+"sn"]=b.sn;if(b.loc)S[p0+"loc"]=b.loc})}
      (v.uich||[]).forEach(function(x,k){if(x&&!S["s"+s+"_ui"+(k+1)+"_ch"])S["s"+s+"_ui"+(k+1)+"_ch"]=x})}})}
  if((m==="011"||m==="yu")&&p.imp){for(var a in p.imp){var t=a;if(m==="yu"&&/^imp_io_/.test(a)){t=a.slice(7);if(S[t]&&S[t]!=="Disabilitato")continue;S[t]=p.imp[a];continue}if(m==="yu"&&/^imp_io_/.test(a))continue;if(S[t]===undefined||S[t]==="")S[t]=p.imp[a]}}if(m==="033"){if(p.cc&&p.cc.length&&!S.sch_cc_n){S.sch_cc_n=String(Math.min(6,p.cc.length));p.cc.slice(0,6).forEach(function(d,r){var b="sch_cc"+(r+1)+"_";S[b+"t"]=d.t;if(d.q)S[b+"q"]=d.q;if(d.u)S[b+"u"]=d.u;if(d.ip)S[b+"ip"]=d.ip})}if(S.csn_on==null&&p.csnet)S.csn_on="Sì"}
  if(m==="041")pull041(S,p);
  for(var k in M){var v=fval(p,m,M[k]);if(v&&!S[k]){if(M[k]==="refrigerante"&&REFR.indexOf(v)<0)continue;S[k]=v}}},
 // a ogni salvataggio: aggiorna la pratica con i campi compilati
 push:function(S,m){var p=get(),M=MAP[m],ch=false;if(!M)return;
  // sistemi VRF dalla check list 03.1 (moduli master / slave, U.I.) verso il verbale 03.3
  if(m==="031"){var vs=[],rows=[];for(var i=1;i<=10;i++){var mm=String(S["pr_ue"+i+"_mods"]||"").trim()||S["pr_ue"+i+"_mod"];if(mm)rows.push(i)}
    rows.forEach(function(i){var mm=String(S["pr_ue"+i+"_mods"]||"").trim()||S["pr_ue"+i+"_mod"],ml=window.HDIP?HDIP.mods(mm):String(mm).split(/\s*\+\s*/),n=parseInt(S["pr_ue"+i+"_ui"])||0,uim=[];
      var hr=/3 tubi/.test(S["pr_ue"+i+"_hr"]||""),chs=[],uich=[],loc={},lc=[],ad=[];
      if(hr){var nc=parseInt(S.sch_chn)||0;for(var q=1;q<=nc;q++){if(String(S["sch_ch"+q+"_sys"]||"")!==String(i)&&!(rows.length===1&&!S["sch_ch"+q+"_sys"]))continue;chs.push({m:S["sch_ch"+q+"_mod"]||"",sn:S["sch_ch"+q+"_sn"]||"",loc:S["sch_ch"+q+"_loc"]||""});loc[q]=chs.length}}
      for(var k=1;k<=n;k++){var id=(rows.length>1?i+".":"")+k,kk=String(id).replace(/[^0-9A-Za-z]/g,"_");uim.push(S["sch_ui_"+kk+"_mod"]||"");lc.push(S["sch_ui_"+kk+"_loc"]||"");ad.push(S["sch_ui_"+kk+"_ad"]||"");
        if(hr){var cv=/^CH(\d+)(?:[.\/-](\d+))?$/.exec(String(S["sch_ui_"+kk+"_ch"]||"").toUpperCase().replace(/\s/g,""));uich.push(cv&&loc[+cv[1]]?"CH"+loc[+cv[1]]+(cv[2]?"."+cv[2]:""):"")}}
      var o={m:ml,sn:S["pr_ue"+i+"_sn"]||"",n:n,z:S["pr_ue"+i+"_zona"]||"",ui:uim};if(lc.some(Boolean))o.loc=lc;if(ad.some(Boolean))o.ad=ad;if(hr){o.hr=1;o.ch=chs;o.uich=uich}vs.push(o)});
    if(vs.length&&JSON.stringify(vs)!==JSON.stringify(p.vrf||[])){p.vrf=vs;ch=true}}
  // configurazione impianto Yutaki (check list 01.1 / verbale 01.2): passa al verbale del tecnico
  if(m==="011"||m==="yu"){var im={},n=0;for(var a in S){if(/^imp_/.test(a)&&typeof S[a]==="string"&&S[a]){im[a]=S[a];n++}}if(m==="yu")for(var b in IOK)if(S[b]&&S[b]!=="Disabilitato"){im["imp_io_"+b]=S[b];n++}if(n&&JSON.stringify(im)!==JSON.stringify(p.imp||{})){p.imp=im;ch=true}}// controlli centralizzati (check list 02.1 / 03.1, verbale 03.3) e verbale CSNET
  if(m==="021"||m==="031"||m==="033"){var cc=ccOf(S);if((cc.length||S.sch_cc_n!=null)&&JSON.stringify(cc)!==JSON.stringify(p.cc||[])){p.cc=cc;ch=true}
    if(m!=="033"&&p.csnet==null&&cc.some(function(d){return CSRE.test(d.t)})){p.csnet=1;ch=true}}
  if(m==="033"){var on=S.csn_on==="Sì"?1:S.csn_on==="No"?0:p.csnet;if(on!==p.csnet){p.csnet=on;ch=true}
    var ns=Math.max(1,parseInt(S.v_nsis)||1),sy=[];for(var s=1;s<=ns;s++){var nm=Math.max(1,parseInt(S["s"+s+"_nmod"])||1),ms=[],sn=[];for(var j=1;j<=nm;j++){if(S["s"+s+"_m"+j+"_mod"])ms.push(S["s"+s+"_m"+j+"_mod"]);if(S["s"+s+"_m"+j+"_sn"])sn.push(S["s"+s+"_m"+j+"_sn"])}if(!ms.length)continue;
      var nu=parseInt(S["s"+s+"_ui_dich"])||parseInt(S["s"+s+"_aa"])||0,ui=[];for(var i2=1;i2<=Math.min(64,nu);i2++){var b2="s"+s+"_ui"+i2+"_";ui.push({m:S[b2+"mod"]||"",sn:S[b2+"sn"]||"",ad:S[b2+"ind"]||"",loc:S[b2+"loc"]||"",ch:S[b2+"ch"]||"",cy:S[b2+"cyc"]||""})}
      sy.push({s:s,nome:S["s"+s+"_nome"]||"",m:ms,sn:sn,n:nu,aa:S["s"+s+"_aa"]||"",cyc:S["s"+s+"_cyc"]!=null&&S["s"+s+"_cyc"]!==""?S["s"+s+"_cyc"]:String(s-1),hr:/3 tubi/.test(S["s"+s+"_tipo"]||"")?1:0,ui:ui})}
    if(JSON.stringify(sy)!==JSON.stringify((p.v33||{}).sys||[])){p.v33={sys:sy};ch=true}}
  if(m==="011"&&S.cli_nome){var cc=(S.cli_nome+" "+(S.cli_cognome||"")).trim();if(p.cliente!==cc){p.cliente=cc;ch=true}}for(var k in M){var v=S[k],t=M[k];if(v&&typeof v==="string"){if(p[t]!==v){p[t]=v;ch=true}if(FAM[m]&&PK[t]){p.pf=p.pf||{};var pf=p.pf[FAM[m]]=p.pf[FAM[m]]||{};if(pf[t]!==v){pf[t]=v;ch=true}}}}if(ch){p._agg=new Date().toISOString();p._da=m;set(p)}}};
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(function(){});
})();
