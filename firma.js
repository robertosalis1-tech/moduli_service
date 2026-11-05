// Firme a schermo intero: si tocca il riquadro, si firma su un'area grande, si conferma.
// Così scorrendo la pagina non si lasciano segni nei campi firma. Sostituisce initSig / clearSig dei moduli.
(function(){
var st=document.createElement("style");
st.textContent="#sigm{position:fixed;inset:0;z-index:10000;background:#fff;display:flex;flex-direction:column;font:15px system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1f2b45;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}"+
"#sigm .hd2{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #d5dce7}#sigm .hd2 b{flex:1;font-size:16px}#sigm .hd2 small{color:#667085;font-size:12px}"+
"#sigm .ar{flex:1;position:relative;margin:10px;border:2px dashed #9aa6b8;border-radius:12px;background:#fffef6;touch-action:none;overflow:hidden}#sigm canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}"+
"#sigm .ln{position:absolute;left:6%;right:6%;bottom:22%;border-bottom:1.5px solid #c9d2df;pointer-events:none}#sigm .ln span{position:absolute;left:0;bottom:4px;font-size:12px;color:#9aa6b8}"+
"#sigm .ft{display:flex;gap:10px;padding:10px 14px 14px}#sigm .ft button{flex:1;border:1px solid #c9d2df;background:#fff;border-radius:10px;padding:13px;font:inherit;font-weight:700;color:#1f2b45;cursor:pointer}#sigm .ft button.ok{background:#e60027;border-color:#e60027;color:#fff}"+
"canvas.sig{cursor:pointer;touch-action:auto!important}";
document.head.appendChild(st);
function getSig(){try{return sig}catch(e){return window.sig||{}}}
function doSave(){try{save()}catch(e){}}
function labelOf(cv){var b=cv.closest(".sigbox");if(b&&b.querySelector(".sigt"))return b.querySelector(".sigt").textContent;var p=cv.parentElement,t="";if(p){var c=p.firstElementChild;if(c&&c!==cv)t=c.textContent}return (t||"Firma").replace(/\s+/g," ").trim().slice(0,70)}
function preview(cv){var k=cv.dataset.sig,S=getSig(),R=2,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;cv.width=w*R;cv.height=h*R;var ctx=cv.getContext("2d");ctx.clearRect(0,0,cv.width,cv.height);
  if(S[k]){var im=new Image();im.onload=function(){var sc=Math.min(cv.width/im.width,cv.height/im.height),iw=im.width*sc,ih=im.height*sc;ctx.drawImage(im,(cv.width-iw)/2,(cv.height-ih)/2,iw,ih)};im.src=S[k]}
  else{ctx.fillStyle="#9aa6b8";ctx.font=(15*R)+"px system-ui,Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("✍  Tocca qui per firmare",cv.width/2,cv.height/2)}}
function openPad(cv){var k=cv.dataset.sig,S=getSig(),strokes=[],cur=null;
  var m=document.createElement("div");m.id="sigm";
  m.innerHTML='<div class="hd2"><b></b><small>Più spazio: ruota il telefono in orizzontale</small></div><div class="ar"><div class="ln"><span>Firma</span></div><canvas></canvas></div><div class="ft"><button data-a="clr">Cancella</button><button data-a="no">Annulla</button><button class="ok" data-a="ok">Conferma firma</button></div>';
  m.querySelector("b").textContent=labelOf(cv);document.body.appendChild(m);var ov=document.body.style.overflow;document.body.style.overflow="hidden";
  var ar=m.querySelector(".ar"),c=m.querySelector("canvas"),ctx=c.getContext("2d"),R=window.devicePixelRatio||2;
  function size(){c.width=ar.clientWidth*R;c.height=ar.clientHeight*R;draw()}
  function draw(){ctx.clearRect(0,0,c.width,c.height);ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#0b2a6b";ctx.fillStyle="#0b2a6b";ctx.lineWidth=Math.max(2.4*R,c.width/260);
    strokes.forEach(function(s){if(s.length===1){ctx.beginPath();ctx.arc(s[0][0]*c.width,s[0][1]*c.height,ctx.lineWidth/2,0,7);ctx.fill();return}ctx.beginPath();ctx.moveTo(s[0][0]*c.width,s[0][1]*c.height);for(var i=1;i<s.length;i++)ctx.lineTo(s[i][0]*c.width,s[i][1]*c.height);ctx.stroke()})}
  function pt(e){var r=c.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]}
  c.onpointerdown=function(e){e.preventDefault();try{c.setPointerCapture(e.pointerId)}catch(x){}cur=[pt(e)];strokes.push(cur);draw()};
  c.onpointermove=function(e){if(!cur)return;e.preventDefault();var ev=e.getCoalescedEvents?e.getCoalescedEvents():[e];ev.forEach(function(q){cur.push(pt(q))});draw()};
  c.onpointerup=c.onpointercancel=function(){cur=null};
  m.addEventListener("touchmove",function(e){e.preventDefault()},{passive:false});
  function close(){window.removeEventListener("resize",size);document.body.style.overflow=ov;m.remove()}
  m.querySelector(".ft").onclick=function(e){var a=e.target.dataset.a;if(!a)return;
    if(a==="clr"){strokes=[];draw();return}
    if(a==="no"){close();return}
    if(!strokes.length){delete S[k];doSave();close();refresh(k);return}
    // ritaglio sul tratto e immagine a proporzione fissa 3:1 (uguale in tutti i PDF)
    var x0=1,y0=1,x1=0,y1=0;strokes.forEach(function(s){s.forEach(function(p){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])})});
    var W=c.width,H=c.height,pad=0.02,bx=Math.max(0,x0-pad)*W,by=Math.max(0,y0-pad)*H,bw=Math.max(1,(Math.min(1,x1+pad)*W)-bx),bh=Math.max(1,(Math.min(1,y1+pad)*H)-by);
    var o=document.createElement("canvas");o.width=900;o.height=300;var oc=o.getContext("2d"),sc=Math.min(860/bw,280/bh,2.5),dw=bw*sc,dh=bh*sc;
    oc.drawImage(c,bx,by,bw,bh,(900-dw)/2,(300-dh)/2,dw,dh);
    S[k]=o.toDataURL("image/png");doSave();close();refresh(k)};
  window.addEventListener("resize",size);setTimeout(size,30)}
function refresh(k){document.querySelectorAll('canvas.sig[data-sig="'+k+'"]').forEach(preview)}
window.initSig=function(){document.querySelectorAll("canvas.sig").forEach(function(cv){cv.onpointerdown=cv.onpointermove=cv.onpointerup=cv.onpointercancel=cv.onpointerleave=null;cv.onclick=function(){openPad(cv)};preview(cv)})};
window.clearSig=function(k){var S=getSig();delete S[k];doSave();refresh(k)};
window.initSig();
})();
