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
async function make(o){
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
  if(o.override)Object.keys(o.override).forEach(function(n){if(o.override[n]!=null)V[n]=String(o.override[n])});
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
  try{pdf.catalog.delete(N("OpenAction"));var nm2=pdf.catalog.lookup(N("Names"));if(nm2)nm2.delete(N("JavaScript"))}catch(e){}
  // --- pagine da includere
  var NP=pdf.getPageCount(),cart=meta.cart==null?NP:meta.cart,ver=[],car=[];
  for(var p=0;p<NP;p++){if(dropPage[p])continue;if(p<cart)ver.push(p);else car.push(p)}
  if(o.mode==="cli"&&meta.sat){ver=ver.filter(function(p){return meta.sat.indexOf(p)<0})}
  if(o.mode==="cli"&&meta.cli){var keep={};meta.cli.forEach(function(r){for(var x=r[0];x<=r[1];x++)keep[x]=1});ver=ver.filter(function(p){return keep[p]});car=car.filter(function(p){return keep[p]})}
  if(o.mode==="cart"){ver=[]}
  var out=await L.PDFDocument.create(),cp;
  if(ver.length){cp=await out.copyPages(pdf,ver);cp.forEach(function(pg,i){out.addPage(pg);var ft=meta.foot&&meta.foot[ver[i]];
    if(ft&&ver.length!==cart){var tx="Pagina "+(i+1)+" di "+ver.length,fnt=ft[4]?hb:helv,tw=fnt.widthOfTextAtSize(tx,ft[3]);
      pg.drawRectangle({x:ft[0]-ft[5]-4,y:ft[1]-2,width:ft[5]+8,height:ft[3]+4,color:L.rgb(1,1,1)});pg.drawText(tx,{x:ft[0]-tw,y:ft[2],size:ft[3],font:fnt,color:L.rgb(ft[6][0],ft[6][1],ft[6][2])})}})}
  // allegati (pagine extra) e foto, prima della cartolina
  if(o.mode!=="cart"){var FO=window.FOTO;
    if(o.extraHTML&&window.PDFK){var box=document.createElement("div");box.style.display="none";box.innerHTML=o.extraHTML;document.body.appendChild(box);window.FOTO=null;
      try{var jd=PDFK.make(box,{title:o.title,code:o.code,cliente:o.cliente,noEnc:true});var ex=await L.PDFDocument.load(jd.output("arraybuffer"));(await out.copyPages(ex,ex.getPageIndices())).forEach(function(pg){out.addPage(pg)})}finally{window.FOTO=FO;box.remove()}}
    if(FO&&FO.count()&&window.jspdf){var jp=new window.jspdf.jsPDF({unit:"mm",format:"a4",compress:true});FO.addPages(jp);jp.deletePage(1);var ph=await L.PDFDocument.load(jp.output("arraybuffer"));(await out.copyPages(ph,ph.getPageIndices())).forEach(function(pg){out.addPage(pg)})}}
  if(car.length){(await out.copyPages(pdf,car)).forEach(function(pg){out.addPage(pg)})}
  out.setTitle((o.mode==="cart"?"Cartolina garanzia - ":"")+o.code+" - "+o.title+(o.cliente?" - "+o.cliente:""));out.setAuthor("Bosch Home Comfort Cooling and Heating SAS");out.setCreator("Hitachi Cooling & Heating - app Moduli Service");
  return out.save()}
async function share(o){var bytes;try{bytes=await make(o)}catch(e){console.error(e);alert("Errore nella generazione del PDF: "+e.message);return}
  var fn=String(o.name||"modulo").replace(/[^\w-]+/g,"_")+".pdf",blob=new Blob([bytes],{type:"application/pdf"}),file=new File([blob],fn,{type:"application/pdf"});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:fn});return}}catch(e){if(e.name==="AbortError")return}
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=fn;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000)}
window.PDFFILL={make:make,share:share,tpl:ensure,b64:b64};
})();
