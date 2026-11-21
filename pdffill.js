// PDFFILL: genera il PDF ufficiale del modulo (modello Bosch) compilato con i dati dell'app.
// Esegue i calcoli del PDF stesso, mette le firme nei riquadri, toglie le pagine non usate,
// aggiunge allegati e foto, rende il PDF non modificabile (campi appiattiti).
(function(){
function loadScript(src,msg){return new Promise(function(ok,ko){var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=function(){ko(new Error(msg||("file mancante: "+src)))};document.head.appendChild(s)})}
async function ensure(key){if(!window.PDFLib)await loadScript("lib/pdf-lib.min.js","libreria PDF mancante (lib/pdf-lib.min.js)");window.TPL=window.TPL||{};
  if(!TPL[key])await loadScript("pdf-tpl/"+key.replace(".","-")+".js","modello PDF non trovato (pdf-tpl/"+key.replace(".","-")+".js): caricare su GitHub anche la cartella pdf-tpl");return TPL[key]}
function b64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
var PT=function(s){return window.PDFK?PDFK.PT(s):String(s)};
var iso=function(v){return /^\d{4}-\d\d-\d\d$/.test(v)?v.split("-").reverse().join("/"):v};
function jsText(L,o){try{if(!o)return"";if(o instanceof L.PDFString||o instanceof L.PDFHexString)return o.decodeText();if(o instanceof L.PDFRawStream)return new TextDecoder("latin1").decode(L.decodePDFRawStream(o).decode())}catch(e){}return""}
// copie ridotte: campi da non riportare (re) e pagine da togliere (drop, indici del modello) per cliente / installatore
var COPYR={
 yu:{cli:{re:/^(press_|p_d[ce]|p_sc|p_tsat|t_liq_prova|t_est_prova|g[HL]_|hlink_|corr_l|cosfi|tens_|pot_el|carica_|refr_|gm_agg|vuoto_|lung_precar|casc_dsw|casc_rsw|casc_ycc|RSW|ue\d?_dsw|ui_dsw|ui_ssw|dip_sum|antilegionella|fc_bivalenza|diff_on_pdc|tempo_|attesa_re|impost_pdc|controllo_pdc|setpoint_max|pcb_|seg_|ctl_|uspec|versione_sw|Input_|Output_|sonda_|mt_|sg_off|smart_|r290_c_|yt_w|tc_w|tc_gm|tc_cc|tc_agg)/,drop:[6,7,8,9]},
     inst:{re:/^(press_|p_d[ce]|p_sc|p_tsat|t_liq_prova|t_est_prova|g[HL]_|pcb_|seg_|ctl_|uspec|antilegionella|fc_bivalenza|diff_on_pdc|attesa_re|impost_pdc)/,drop:[8,9]}},
 ut:{cli:{re:/^(p_|t_asp|t_rip|t_td|t_mand_ui|t_est_prova|t_liq_prova|g[HL]_|corr_l|tens_|carica_|refr_|gm_agg|vuoto_|hls_|preall|man_mode|lung_precar|his_|set_rsw|set_term|set_funz|hlink_|seg_|sui_|da_desc)/,drop:[7,8,9,10]},
     inst:{re:/^(p_|t_asp|t_rip|t_td|t_mand_ui|g[HL]_|his_|seg_|sui_|da_desc|preall|man_mode)/,drop:[7,8,9,10]}},
 "033":{cli:{re:/^(s\d+_(od\d+_|oc\d|v\d|vsq|ie$|ti$|tl$|tgi$|toi$|dt$|hlink|vuoto|mc\d)|LOC_(?!\d))/},inst:{re:/^s\d+_(od\d+_|oc\d|ti$|tl$|tgi$|toi$|dt$)/}},
 "052":{cli:{re:/^(par\d+_|c\d+_|mis_|[hk]\d+_(dp|dpc|dt|kw|qc|ql|tin|tout)$|i\d+_(l\d|sq)$|v_\d|v_(ln|med|sq)$|vl_|m\d+_(carica|imax|qcond|range)$|carica_tot)/},inst:{re:/^(par\d+_|c\d+_|mis_)/}}};
COPYR.ms=COPYR.ut;
// gli esiti dei controlli restano anche nelle copie ridotte (si tolgono solo i valori)
var COPYK=/_(es|esito)(_u\d+)?$/;
async function make(o){if(window.PDFFILL_BHC&&o.mode!=="cart")o.mode="bhc";
  var meta=await ensure(o.key),L=PDFLib,N=L.PDFName.of;
  var pdf=await L.PDFDocument.load(b64(meta.b64),{updateMetadata:false}),ctx=pdf.context,form=pdf.getForm(),pages=pdf.getPages();
  var S=o.values||{},sig=o.sig||{};
  // --- indice dei campi
  var F={},refName=new Map();
  form.getFields().forEach(function(fl){var n=fl.getName(),af=fl.acroField,ws=af.getWidgets(),t=fl instanceof L.PDFTextField?"text":fl instanceof L.PDFCheckBox?"checkbox":fl instanceof L.PDFDropdown?"combobox":fl instanceof L.PDFRadioGroup?"radiobutton":fl instanceof L.PDFOptionList?"listbox":"button";
    var f={fl:fl,af:af,ws:ws,t:t,calc:""};F[n]=f;refName.set(ctx.getObjectRef(af.dict),n);
    var aa=af.dict.lookup(N("AA"));if(aa instanceof L.PDFDict){var c=aa.lookup(N("C"));if(c instanceof L.PDFDict)f.calc=jsText(L,c.lookup(N("JS")))}
    f.hidden0=ws.length>0&&ws.every(function(w){var x=w.dict.lookup(N("F"));return x&&(x.asNumber()&2)});
    f.pg=ws.map(function(w){var p=pdf.findPageForAnnotationRef(ctx.getObjectRef(w.dict));return pages.indexOf(p)});
    f.r=ws.length?ws[0].getRectangle():{x:0,y:0,width:100,height:20};
    if(t==="checkbox"||t==="radiobutton")f.on=ws.map(function(w){var v=w.getOnValue&&w.getOnValue();return v?v.decodeText():"Yes"});
    try{f.tu=jsText(L,af.dict.lookup(N("TU")))}catch(e){}});
  // --- valori di partenza: dati dell'app, altrimenti quelli del modello
  var V={},DISP={},COL={},RO={};
  Object.keys(F).forEach(function(n){var f=F[n],v=S[n];DISP[n]=f.hidden0?1:0;
    if(f.t==="checkbox"){V[n]=(v!=null&&v!==""&&v!=="Off"&&v!==false&&v!=="false")?(f.on[0]||"Yes"):(v==null?(f.fl.isChecked()?(f.on[0]||"Yes"):"Off"):"Off")}
    else if(f.t==="radiobutton"){V[n]=v!=null?String(v):(f.fl.getSelected()||"Off")}
    else if(v!=null&&typeof v!=="object"){V[n]=iso(String(v))}
    else{try{V[n]=f.t==="text"?(f.fl.getText()||""):f.t==="combobox"||f.t==="listbox"?((f.fl.getSelected()||[])[0]||""):""}catch(e){V[n]=""}}});
  // --- script a livello documento (funzioni comuni) e calcoli, nell'ordine del modulo, in uno spazio separato dalla pagina
  var docJS="";try{var nm=pdf.catalog.lookup(N("Names"));var jsT=nm&&nm.lookup(N("JavaScript"));var arr=jsT&&jsT.lookup(N("Names"));
    if(arr)for(var i=1;i<arr.size();i+=2){var code=jsText(L,arr.lookup(i).lookup(N("JS")));if(code&&!/^\s*var REG_INFO/.test(code))docJS+=code+"\n;"}}catch(e){}
  var order=[];try{var co=pdf.catalog.lookup(N("AcroForm")).lookup(N("CO"));if(co)for(var k=0;k<co.size();k++){var nn=refName.get(co.get(k));if(nn&&F[nn].calc)order.push(nn)}}catch(e){}
  Object.keys(F).forEach(function(n){if(F[n].calc&&order.indexOf(n)<0)order.push(n)});
  var objs={};
  function fo(n){if(objs[n])return objs[n];var f=F[n];return objs[n]={name:n,
    get value(){var v=V[n];return v==null?"":v},get valueAsString(){return String(this.value)},set value(v){V[n]=v==null?"":String(v)},
    get display(){return DISP[n]||0},set display(v){DISP[n]=v},get hidden(){return DISP[n]===1},set hidden(v){DISP[n]=v?1:0},
    get readonly(){return !!RO[n]},set readonly(v){RO[n]=v},set textColor(c){COL[n]=c},get textColor(){return COL[n]||["G",0]},set fillColor(c){COL[n+"#bg"]=c},get fillColor(){return COL[n+"#bg"]||["T"]},
    set borderColor(c){},get borderColor(){return["T"]},set strokeColor(c){},get strokeColor(){return["T"]},set textSize(v){},get textSize(){return 0},set textFont(v){},
    get rect(){var r=f?f.r:{x:0,y:0,width:100,height:20};return[r.x,r.y+r.height,r.x+r.width,r.y]},get page(){return f?f.pg[0]:0},
    get type(){return f?f.t:"text"},setItems(a){},getItemAt(i){return""},get numItems(){return 0},
    checkThisBox(i,on){V[n]=on?((f&&f.on[0])||"Yes"):"Off"},isBoxChecked(){return V[n]&&V[n]!=="Off"}}}
  var doc={getField:function(n){return F[n]||V[n]!=null?fo(n):null},calculateNow:function(){},resetForm:function(){},print:function(){},mailDoc:function(){},get numPages(){return pages.length}};
  var disp={visible:0,hidden:1,noPrint:3,noView:2},color={black:["G",0],white:["G",1],red:["RGB",1,0,0],green:["RGB",0,1,0],blue:["RGB",0,0,1],transparent:["T"]},app={alert:function(){},beep:function(){}},util={printd:function(f,d){return d.toLocaleDateString("it-IT")}};
  var PAR=["display","color","app","util","getField"],FN=[];
  try{FN=new Function(PAR.join(","),docJS+"\nreturn ["+order.map(function(n){return "function(event){"+F[n].calc+"\n}"}).join(",")+"]").call(doc,disp,color,app,util,doc.getField)}
  catch(e){console.warn("calc",e);FN=order.map(function(n){try{return new Function(PAR.join(","),"return function(event){"+F[n].calc+"\n}").call(doc,disp,color,app,util,doc.getField)}catch(x){return null}})}
  for(var pass=0;pass<3;pass++)order.forEach(function(n,i){if(!FN[i])return;var ev={value:V[n]==null?"":V[n],target:fo(n),name:"Calculate",source:null};try{FN[i].call(doc,ev);V[n]=ev.value==null?"":String(ev.value)}catch(e){if(pass===2)console.warn("calc",n,e)}});
  if(window.PDFFILL_BHC&&meta.bhc&&meta.bhc.set)Object.keys(meta.bhc.set).forEach(function(n){V[n]=meta.bhc.set[n]});
  if(o.override)Object.keys(o.override).forEach(function(n){if(o.override[n]!=null)V[n]=String(o.override[n])});
  // --- copie per cliente e installatore: senza impostazioni tecniche riservate ai SAT autorizzati BHC
  var CP=window.PDFFILL_BHC||o.mode==="bhc"?"bhc":(o.mode==="cart"?"":(window.PDFFILL_COPY||"cli")),RULE=COPYR[o.key]&&COPYR[o.key][CP];
  if(RULE)Object.keys(V).forEach(function(n){if(RULE.re.test(n)&&!COPYK.test(n))V[n]=""});
  var STX=CP==="inst"?"COPIA PER L'INSTALLATORE - parametri di configurazione e del Service Tool riservati ai SAT autorizzati BHC, disponibili tramite il Servizio Assistenza":"COPIA PER IL CLIENTE - non contiene impostazioni tecniche riservate: parametri registrati dal SAT autorizzato BHC e disponibili su richiesta tramite il Servizio Assistenza";
  // --- coperture: pagine intere non usate e campi coperti
  var covers=Object.keys(F).filter(function(n){return /^cov_|(^|_)cov\d*$/.test(n)&&DISP[n]!==1});
  var dropPage={},rm=[];
  covers.forEach(function(c){var f=F[c],r=f.r,pi=f.pg[0],P=pages[pi];if(pi<0||!P)return;var sz=P.getSize();
    if(r.width*r.height>sz.width*sz.height*0.5){dropPage[pi]=1;return}
    Object.keys(F).forEach(function(n){if(n===c)return;var g=F[n];g.ws.forEach(function(w,k){if(g.pg[k]!==pi)return;var q=w.getRectangle();if(q.x>=r.x-1&&q.y>=r.y-1&&q.x+q.width<=r.x+r.width+1&&q.y+q.height<=r.y+r.height+1)rm.push(n)})})});
  // --- scrittura dei valori
  Object.keys(F).forEach(function(n){var f=F[n],v=V[n];if(f.t==="button"){rm.push(n);return}if(DISP[n]===1){rm.push(n);return}
    try{if(f.t==="text"){if(sig[n]){return}if(v!=null&&v!==""){f.fl.setText(PT(String(v)))}else f.fl.setText("")}
      else if(f.t==="checkbox"){if(v&&v!=="Off")f.fl.check();else f.fl.uncheck()}
      else if(f.t==="combobox"){if(v){v=PT(String(v));if(f.fl.getOptions().indexOf(v)<0)f.fl.addOptions([v]);f.fl.select(v)}}
      else if(f.t==="listbox"){if(v){v=PT(String(v));if(f.fl.getOptions().indexOf(v)<0)f.fl.addOptions([v]);f.fl.select(v)}}
      else if(f.t==="radiobutton"){if(v&&v!=="Off")f.fl.select(String(v))}
      var c=COL[n];if(c&&c[0]==="RGB"&&f.t==="text"){var da=f.af.getDefaultAppearance()||"/Helv 0 Tf 0 g";f.af.setDefaultAppearance(da.replace(/[\d.]+\s+[\d.]+\s+[\d.]+\s+rg|[\d.]+\s+g(?=\s|$)/,c[1]+" "+c[2]+" "+c[3]+" rg"))}
      var b=COL[n+"#bg"];if(b&&b[0]==="RGB")f.ws.forEach(function(w){w.getOrCreateAppearanceCharacteristics().setBackgroundColor([b[1],b[2],b[3]])})}catch(e){console.warn(n,e)}});
  // --- firme: immagine nel riquadro
  for(var k2 in sig){var f2=F[k2];if(!f2||!sig[k2])continue;try{var png=await pdf.embedPng(sig[k2]);
    f2.ws.forEach(function(w,i){var r=w.getRectangle(),P=pages[f2.pg[i]];if(!P)return;var sc=Math.min((r.width-4)/png.width,(r.height-4)/png.height),iw=png.width*sc,ih=png.height*sc;P.drawImage(png,{x:r.x+(r.width-iw)/2,y:r.y+(r.height-ih)/2,width:iw,height:ih})});rm.push(k2)}catch(e){console.warn("firma",k2,e)}}
  rm.forEach(function(n){try{form.removeField(F[n].fl)}catch(e){}});
  var helv=await pdf.embedFont(L.StandardFonts.Helvetica),hb=await pdf.embedFont(L.StandardFonts.HelveticaBold);
  try{form.updateFieldAppearances(helv)}catch(e){console.warn(e)}
  form.flatten();
  // via i riferimenti ai campi eliminati rimasti nelle pagine
  pdf.getPages().forEach(function(pg){var an=pg.node.lookup(N("Annots"));if(!(an instanceof L.PDFArray))return;var keep=[];
    for(var i=0;i<an.size();i++){var r=an.get(i);if(r instanceof L.PDFRef){if(pdf.context.lookup(r))keep.push(r)}else keep.push(r)}
    if(keep.length)pg.node.set(N("Annots"),pdf.context.obj(keep));else pg.node.delete(N("Annots"))});
  try{pdf.catalog.delete(N("OpenAction"));var nm2=pdf.catalog.lookup(N("Names"));if(nm2)nm2.delete(N("JavaScript"))}catch(e){}
  // --- foto nei riquadri del modulo (MOD 06.3)
  var FPL={};if(meta.fotobox&&window.FOTO&&FOTO.list&&o.mode!=="cart"){var FL=FOTO.list();
    for(var q=0;q<meta.fotobox.length;q++){var fb=meta.fotobox[q],ph=FL.filter(function(f){return f.cat===fb[0]&&!FPL[f.id]})[0];if(!ph)continue;
      try{var im=await pdf.embedJpg(b64(ph.data.split(",")[1])),P0=pages[fb[1]],Hh=P0.getSize().height,r=fb[2],bw=r[2]-r[0]-4,bh=r[3]-r[1]-4,sc=Math.min(bw/ph.w,bh/ph.h),iw=ph.w*sc,ih=ph.h*sc;
        P0.drawRectangle({x:r[0]+0.5,y:Hh-r[3]+0.5,width:r[2]-r[0]-1,height:r[3]-r[1]-1,color:L.rgb(1,1,1)});
        P0.drawImage(im,{x:r[0]+(r[2]-r[0]-iw)/2,y:Hh-r[3]+(r[3]-r[1]-ih)/2,width:iw,height:ih});FPL[ph.id]=1}catch(e){console.warn("foto",e)}}}
  if(o.mode==="bhc"&&meta.bhc&&meta.bhc.cover){meta.bhc.cover.forEach(function(c){var P0=pages[c[0]],Hh=P0.getSize().height,r=c[1];
    P0.drawRectangle({x:r[0],y:Hh-r[3],width:r[2]-r[0],height:r[3]-r[1],color:L.rgb(1,1,1)});
    if(c[2])P0.drawText(c[2],{x:r[0]+6,y:Hh-r[1]-10,size:7,font:helv,color:L.rgb(0.4,0.43,0.48)})})}
  // --- pagine da includere
  var NP=pdf.getPageCount(),cart=meta.cart==null?NP:meta.cart,ver=[],car=[];
  for(var p=0;p<NP;p++){if(dropPage[p])continue;if(p<cart)ver.push(p);else car.push(p)}
  if(o.mode==="cli"&&meta.sat){ver=ver.filter(function(p){return meta.sat.indexOf(p)<0})}
  if(o.mode==="cli"&&meta.cli){var keep={};meta.cli.forEach(function(r){for(var x=r[0];x<=r[1];x++)keep[x]=1});ver=ver.filter(function(p){return keep[p]});car=car.filter(function(p){return keep[p]})}
  if(o.mode==="cart"){ver=[]}
  if(RULE&&RULE.drop){ver=ver.filter(function(p){return RULE.drop.indexOf(p)<0})}
  if(o.pages){ver=ver.filter(function(p){return o.pages.indexOf(p)>=0})}
  if(o.noCart)car=[];
  // ordine delle pagine (es. Utopia: per ogni unità prima il circuito e poi i parametri del display)
  if(o.order){var rk=function(p){var i=o.order.indexOf(p);return i<0?1000+p:i};ver.sort(function(a,b){return rk(a)-rk(b)})}
  // copia per Bosch / SAT: senza le informative, restano consensi e firme
  var BH=o.mode==="bhc"&&meta.bhc?meta.bhc:null;
  if(BH){ver=ver.filter(function(p){return (BH.drop||[]).indexOf(p)<0})}
  var out=await L.PDFDocument.create(),cp;helv=await out.embedFont(L.StandardFonts.Helvetica);hb=await out.embedFont(L.StandardFonts.HelveticaBold);
  if(ver.length){cp=await out.copyPages(pdf,ver);for(var i=0;i<cp.length;i++){var pg=cp[i];
    if(BH&&BH.inst&&ver[i]===BH.inst.src){var sp=pdf.getPage(ver[i]),sz=sp.getSize(),W=sz.width,H=sz.height,c=BH.inst.clip;pg=out.addPage([W,H]);
      var e1=await out.embedPage(sp,{left:0,right:W,top:H,bottom:H-BH.inst.hdr}),e2=await out.embedPage(sp,{left:0,right:W,top:H-c[0],bottom:H-c[1]});
      pg.drawPage(e1,{x:0,y:H-BH.inst.hdr});pg.drawPage(e2,{x:0,y:H-96-(c[1]-c[0])});
      pg.drawRectangle({x:330,y:H-54,width:238,height:34,color:L.rgb(1,1,1)});
      var nv=L.rgb(0.122,0.169,0.271),t1="Dichiarazioni e consensi",t2="Reg. UE 2016/679 (GDPR)";
      pg.drawText(t1,{x:559.6-hb.widthOfTextAtSize(t1,10),y:H-37,size:10,font:hb,color:nv});pg.drawText(t2,{x:559.6-helv.widthOfTextAtSize(t2,7),y:H-48,size:7,font:helv,color:L.rgb(0.4,0.43,0.48)});
      var y0=H-96-(c[1]-c[0])-22;["Copia per Bosch / SAT: le informative privacy complete (cliente finale e ditta installatrice) sono nel modulo","inviato alla ditta installatrice e nei MOD 09.1 / 09.2. Qui restano le dichiarazioni, i consensi e le firme."].forEach(function(t,k){pg.drawText(t,{x:42,y:y0-k*10,size:7.6,font:helv,color:nv})});
      continue}
    out.addPage(pg);if(RULE&&STX){try{var psz=pg.getSize();pg.drawRectangle({x:20,y:1.5,width:psz.width-40,height:9,color:L.rgb(1,1,1)});pg.drawText(STX,{x:(psz.width-hb.widthOfTextAtSize(STX,6.3))/2,y:3.6,size:6.3,font:hb,color:L.rgb(0.75,0.1,0.1)})}catch(e){}}
    var UT=o.unit||(o.bands&&o.bands[ver[i]]);if(UT){try{var usz=pg.getSize(),ut=String(UT),uw=hb.widthOfTextAtSize(ut,8.5);pg.drawRectangle({x:0,y:usz.height-14,width:usz.width,height:14,color:L.rgb(1,0.957,0.761)});pg.drawRectangle({x:0,y:usz.height-14.6,width:usz.width,height:0.8,color:L.rgb(0.878,0.659,0)});pg.drawText(ut,{x:(usz.width-uw)/2,y:usz.height-10.2,size:8.5,font:hb,color:L.rgb(0.35,0.24,0)})}catch(e){}}
    var ft=meta.foot&&meta.foot[ver[i]];
    if(ft&&ver.length!==cart){var tx="Pagina "+(i+1)+" di "+ver.length,fnt=ft[4]?hb:helv,tw=fnt.widthOfTextAtSize(tx,ft[3]);
      pg.drawRectangle({x:ft[0]-ft[5]-4,y:ft[1]-2,width:ft[5]+8,height:ft[3]+4,color:L.rgb(1,1,1)});pg.drawText(tx,{x:ft[0]-tw,y:ft[2],size:ft[3],font:fnt,color:L.rgb(ft[6][0],ft[6][1],ft[6][2])})}}}
  // allegati (pagine extra) e foto, prima della cartolina
  {var FO=window.FOTO;
    if(o.extraHTML&&window.PDFK){var box=document.createElement("div");box.style.display="none";box.innerHTML=o.extraHTML;document.body.appendChild(box);window.FOTO=null;
      try{var jd=PDFK.make(box,{title:o.title,code:o.code,cliente:o.cliente,noEnc:true});var ex=await L.PDFDocument.load(jd.output("arraybuffer"));(await out.copyPages(ex,ex.getPageIndices())).forEach(function(pg){out.addPage(pg)})}finally{window.FOTO=FO;box.remove()}}
    if(o.mode!=="cart"&&!o.noPhoto&&FO&&FO.count()>Object.keys(FPL).length&&window.jspdf){var jp=new window.jspdf.jsPDF({unit:"mm",format:"a4",compress:true});FO.addPages(jp,FPL);jp.deletePage(1);var ph=await L.PDFDocument.load(jp.output("arraybuffer"));(await out.copyPages(ph,ph.getPageIndices())).forEach(function(pg){out.addPage(pg)})}}
  if(car.length){(await out.copyPages(pdf,car)).forEach(function(pg){out.addPage(pg)})}
  if(o.mode!=="cart"&&/^MOD 0[1-5]\.1$/.test(o.code||"")&&o.values){try{var dv={};Object.keys(o.values).forEach(function(k){var v=o.values[k];if(v!==""&&v!=null&&typeof v!=="function")dv[k]=v});out.getInfoDict().set(N("BHCData"),L.PDFHexString.fromText(JSON.stringify({v:1,code:o.code,s:dv})))}catch(e){console.warn(e)}}
  out.setTitle((o.mode==="cart"?"Cartolina garanzia - ":"")+o.code+" - "+o.title+(o.cliente?" - "+o.cliente:""));out.setAuthor("Bosch Home Comfort Cooling and Heating SAS");out.setCreator("Hitachi Cooling & Heating - app Moduli Service");
  return out.save()}
async function share(o){if(o.mode!=="cart"&&window.FOTO&&FOTO.check&&!FOTO.check())return;var bytes;try{bytes=await make(o)}catch(e){console.error(e);alert("Errore nella generazione del PDF: "+e.message);return}
  return shareBytes(bytes,o.name)}
// unisce più PDF generati (es. verbali delle unità in cascata) in un unico file
async function merge(list,title){var L=PDFLib,out=await L.PDFDocument.create();for(var i=0;i<list.length;i++){var d=await L.PDFDocument.load(list[i]);(await out.copyPages(d,d.getPageIndices())).forEach(function(p){out.addPage(p)})}if(title)out.setTitle(title);out.setAuthor("Bosch Home Comfort Cooling and Heating SAS");return out.save()}
async function shareBytes(bytes,name){
  var fn=String(name||"modulo").replace(/[^\w-]+/g,"_")+".pdf",blob=new Blob([bytes],{type:"application/pdf"}),file=new File([blob],fn,{type:"application/pdf"});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:fn});return}}catch(e){if(e.name==="AbortError")return}
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=fn;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000)}
// modulo compilabile (non bloccato) con alcuni campi già scritti: per inviarlo all'installatore
async function prefill(key,values){var meta=await ensure(key),L=PDFLib;var pdf=await L.PDFDocument.load(b64(meta.b64),{updateMetadata:false}),form=pdf.getForm();
  Object.keys(values||{}).forEach(function(n){var v=values[n];if(v==null||v==="")return;var f;try{f=form.getField(n)}catch(e){return}
    try{if(f instanceof L.PDFTextField)f.setText(PT(iso(String(v))));else if(f instanceof L.PDFCheckBox){if(v&&v!=="Off")f.check()}else if(f instanceof L.PDFDropdown){v=PT(String(v));if(f.getOptions().indexOf(v)<0)f.addOptions([v]);f.select(v)}}catch(e){}});
  return pdf.save({updateFieldAppearances:true})}
// lettura dei campi di un PDF compilato
// dati della check list compilata nell'app (salvati nel PDF generato): {code, s}
async function readData(bytes){await ensure0();try{var L=PDFLib,pdf=await L.PDFDocument.load(bytes,{ignoreEncryption:true,updateMetadata:false}),v=pdf.getInfoDict().lookup(L.PDFName.of("BHCData"));if(!v)return null;var o=JSON.parse(v.decodeText());return o&&o.s?o:null}catch(e){console.warn(e);return null}}
async function readFields(bytes){await ensure0();var L=PDFLib,pdf=await L.PDFDocument.load(bytes,{ignoreEncryption:true}),out={};
  pdf.getForm().getFields().forEach(function(fl){var n=fl.getName(),v;try{if(fl instanceof L.PDFTextField)v=fl.getText()||"";else if(fl instanceof L.PDFDropdown||fl instanceof L.PDFOptionList)v=(fl.getSelected()||[])[0]||"";else if(fl instanceof L.PDFCheckBox)v=fl.isChecked()?"Yes":"Off";else if(fl instanceof L.PDFRadioGroup)v=fl.getSelected()||"";else return}catch(e){return}out[n]=v});return out}
async function ensure0(){if(!window.PDFLib)await loadScript("lib/pdf-lib.min.js","libreria PDF mancante (lib/pdf-lib.min.js)")}
window.pdfCli=function(f){window.PDFFILL_COPY="cli";var r;try{r=f()}catch(e){window.PDFFILL_COPY="";throw e}return Promise.resolve(r).finally(function(){window.PDFFILL_COPY=""})};
window.pdfInst=function(f){window.PDFFILL_COPY="inst";var r;try{r=f()}catch(e){window.PDFFILL_COPY="";throw e}return Promise.resolve(r).finally(function(){window.PDFFILL_COPY=""})};
window.PDFFILL_COPYR=COPYR;window.PDFFILL_COPYK=COPYK;
window.pdfBHC=function(f){window.PDFFILL_BHC=1;var r;try{r=f()}catch(e){window.PDFFILL_BHC=0;throw e}return Promise.resolve(r).finally(function(){window.PDFFILL_BHC=0})};
window.PDFFILL={make:make,share:share,shareBytes:shareBytes,merge:merge,tpl:ensure,b64:b64,prefill:prefill,readFields:readFields,readData:readData};
})();
