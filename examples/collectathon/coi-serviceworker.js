/*! coi-serviceworker v0.1.7 — MIT (gzuidhof). Adds COOP/COEP via a SW so
   SharedArrayBuffer works on static hosts that cannot set response headers. */
if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
  self.addEventListener('fetch', (e) => {
    if (e.request.cache === 'only-if-cached' && e.request.mode !== 'same-origin') return;
    e.respondWith(fetch(e.request).then((r) => {
      if (r.status === 0) return r;
      const h = new Headers(r.headers);
      h.set('Cross-Origin-Embedder-Policy', 'require-corp');
      h.set('Cross-Origin-Opener-Policy', 'same-origin');
      return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
    }).catch((e2) => console.error(e2)));
  });
} else {
  (() => {
    if (window.crossOriginIsolated !== false) return;
    if (!window.isSecureContext) return;
    navigator.serviceWorker && navigator.serviceWorker.register(window.document.currentScript.src)
      .then((reg) => { reg.addEventListener('updatefound', () => window.location.reload());
        if (reg.active && !navigator.serviceWorker.controller) window.location.reload(); });
  })();
}
