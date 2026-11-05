// Service worker: l'app funziona anche senza rete. Versione: 2026.11.05-0731
const V="moduli-2026.11.05-0731";
const CORE=["./", "index.html", "pratica.js", "pdfk.js", "firma.js", "reg.js", "logo.png", "icon-192.png", "manifest.webmanifest", "lib/jspdf.umd.min.js", "lib/jspdf.plugin.autotable.min.js", "mod-01-2-yutaki.html", "mod-02-ut.html", "mod-06-1-intervento.html", "verifica-garanzia.html", "lib/pdf-lib.min.js", "mod-03-2-verifica-set-free.html", "mod-03-3-avviamento-set-free.html", "mod-05-2-avviamento-samurai.html", "mod-06-2-sostituzione-compressore.html", "cl-01-1-yutaki.html", "cl-02-1-utopia.html", "cl-03-1-set-free.html", "cl-05-1-samurai.html"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;if(r.url.indexOf("accessi-revocati")>=0)return;
  // pagine: prima la rete (versione aggiornata), poi la copia offline; altri file: copia offline, aggiornata in background
  if(r.mode==="navigate"){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match("./index.html"))));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{const net=fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>hit);return hit||net}))});
