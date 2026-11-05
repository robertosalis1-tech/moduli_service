// PDFK: trasforma l'HTML di stampa di un modulo in PDF (jsPDF + autoTable)
// con intestazione Bosch su ogni pagina, sezioni con sfumatura blu-verde, firme come immagini.
(function(){
var BLUE=[0,123,192],GREEN=[0,136,74],NAVY=[0,62,105],LINE=[205,216,230],GREY=[110,118,130],LBG=[238,244,250];
function PT(s){return String(s==null?"":s).replace(/☒|☑|✔|✓/g,"[X]").replace(/☐/g,"[ ]").replace(/■/g,"#").replace(/□/g,"o").replace(/≥/g,">=").replace(/≤/g,"<=").replace(/[→⇒]/g,"->").replace(/←/g,"<-").replace(/Ω/g,"Ohm").replace(/[–—]/g,"-").replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/…/g,"...").replace(/Δ/g,"delta ").replace(/[^\n\x20-\xFF€]/g,"")}
function grad(d,x,y,w,h,n){n=n||48;for(var i=0;i<n;i++){var t=i/(n-1),sw=w/n;d.setFillColor.apply(d,BLUE.map(function(c,j){return Math.round(c+(GREEN[j]-c)*t)}));d.rect(x+i*sw,y,i<n-1?sw+0.8:sw,h,"F")}}
function logo(){var i=document.querySelector(".hd img");return i?i.src:null}
function make(root,o){var jsPDF=window.jspdf.jsPDF,rnd=Array.from(crypto.getRandomValues(new Uint8Array(16)),function(b){return b.toString(16).padStart(2,"0")}).join("");
  var d=new jsPDF({unit:"mm",format:"a4",compress:true,encryption:{userPassword:"",ownerPassword:rnd,userPermissions:["print"]}});
  var PW=210,PH=297,MG=14,CW=PW-2*MG,TOP=27,BOT=PH-16,y=TOP,LG=logo(),HD={};
  d.setProperties({title:o.title+(o.cliente?" - "+o.cliente:""),author:"Bosch Home Comfort Cooling and Heating SAS",creator:"Hitachi Cooling & Heating - app Moduli Service"});
  function head(){var pg=d.getCurrentPageInfo().pageNumber;if(HD[pg])return;HD[pg]=1;if(LG){try{d.addImage(LG,"PNG",MG,8,30,6.6)}catch(e){}}
    d.setFont("helvetica","bold");d.setFontSize(11);d.setTextColor.apply(d,NAVY);d.text(PT(o.title),PW-MG,11.5,{align:"right"});
    d.setFont("helvetica","normal");d.setFontSize(7.5);d.setTextColor.apply(d,GREY);d.text(o.code+" - Rev. 10/2026  |  Hitachi Cooling & Heating - Bosch Home Comfort Group",PW-MG,15.5,{align:"right"});grad(d,0,19,PW,1.8)}
  function newPage(){d.addPage();head();y=TOP}
  function need(h){if(y+h>BOT)newPage()}
  function sec(t){need(22);grad(d,MG,y,CW,7);d.setFont("helvetica","bold");d.setFontSize(9.5);d.setTextColor(255,255,255);d.text(PT(t).toUpperCase(),MG+3,y+4.9);y+=9}
  function para(t,bold){t=PT(t).replace(/[ \t]+/g," ").trim();if(!t)return;d.setFont("helvetica",bold?"bold":"normal");d.setFontSize(8.5);d.setTextColor(30,35,45);var L=d.splitTextToSize(t,CW);L.forEach(function(l){need(5);d.text(l,MG,y+3.5);y+=4.2});y+=1.5}
  function txt(el){var c=el.cloneNode(true);c.querySelectorAll("br").forEach(function(b){b.replaceWith("\n")});c.querySelectorAll("img").forEach(function(i){i.remove()});return c.textContent}
  function table(el){var imgs=[];
    d.autoTable({html:el,startY:y,margin:{left:MG,right:MG,top:TOP,bottom:PH-BOT},theme:"grid",useCss:false,
      styles:{font:"helvetica",fontSize:7.8,cellPadding:1.3,lineColor:LINE,lineWidth:0.2,textColor:[25,30,40],overflow:"linebreak"},
      headStyles:{fillColor:BLUE,textColor:255,fontStyle:"bold",fontSize:7.6},alternateRowStyles:{fillColor:[247,250,253]},
      didParseCell:function(h){h.cell.text=h.cell.text.map(PT);var im=h.cell.raw&&h.cell.raw.querySelector&&h.cell.raw.querySelector("img");if(im){h.cell.styles.minCellHeight=24}
        if(h.section==="body"&&((h.cell.raw&&h.cell.raw.tagName==="TH")||(!el.querySelector("th")&&h.table.columns.length===4&&h.column.index%2===0))){h.cell.styles.fillColor=LBG;h.cell.styles.textColor=NAVY;h.cell.styles.fontStyle="bold"}},
      didDrawCell:function(h){var im=h.cell.raw&&h.cell.raw.querySelector&&h.cell.raw.querySelector("img");if(im&&h.section!=="head"){try{var w=Math.min(h.cell.width-2,(h.cell.height-2)*3);d.addImage(im.src,"PNG",h.cell.x+1,h.cell.y+1,w,h.cell.height-2)}catch(e){}}},
      didDrawPage:function(){head()}});y=d.lastAutoTable.finalY+4}
  function walk(el){Array.from(el.children).forEach(function(c){var tg=c.tagName,cl=c.className||"";
    if(cl.indexOf("pband")>=0)return;
    if(tg==="IMG"){if(c.src===LG)return;need(30);try{d.addImage(c.src,"PNG",MG,y,60,24)}catch(e){}y+=26;return}
    if(cl.indexOf("pb")>=0&&!c.textContent.trim()){newPage();return}
    if(tg==="H1"){d.setFont("helvetica","bold");d.setFontSize(18);d.setTextColor.apply(d,NAVY);d.text(PT(c.textContent),MG,y+6);y+=9;return}
    if(tg==="H2"||tg==="H3"){sec(c.textContent);return}
    if(tg==="TABLE"){table(c);return}
    if(c.querySelector&&c.querySelector("table,h2")){walk(c);return}
    var ims=c.querySelectorAll?c.querySelectorAll("img"):[];
    para(txt(c),cl.indexOf("es")>=0);
    Array.from(ims).forEach(function(i){need(22);try{d.addImage(i.src,"PNG",MG,y,54,18)}catch(e){}y+=20})})}
  head();
  if(o.sub){d.setFont("helvetica","normal");d.setFontSize(9);d.setTextColor.apply(d,GREY)}
  walk(root);
  var n=d.getNumberOfPages();for(var i=1;i<=n;i++){d.setPage(i);grad(d,MG,PH-12.5,CW,0.6);d.setFont("helvetica","normal");d.setFontSize(6.8);d.setTextColor.apply(d,GREY);d.text("Bosch Home Comfort Cooling and Heating SAS - Via Marcantonio Colonna, 35 - 20149 Milano (MI) - www.hitachiaircon.com/it/",MG,PH-8.5);d.setFont("helvetica","bold");d.setTextColor.apply(d,NAVY);d.text("Pagina "+i+" di "+n,PW-MG,PH-8.5,{align:"right"})}
  return d}
async function share(root,o){var d;try{d=make(root,o)}catch(e){console.error(e);alert("Errore nella generazione del PDF: "+e.message);return}
  var name=(o.name||"modulo").replace(/[^\w-]+/g,"_")+".pdf",blob=d.output("blob"),file=new File([blob],name,{type:"application/pdf"});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:name});return}}catch(e){if(e.name==="AbortError")return}
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000)}
window.PDFK={make:make,share:share,PT:PT};
})();
