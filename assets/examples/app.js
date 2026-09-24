// Examples gallery interactivity — split view (list + live <iframe>).
// Data is server-rendered per language and inlined as window.EX_DATA (single-language:
// [{ id, ok, href, title, blurb }]). window.EX_NAV.landing is the default showcase id.
// Progressive enhancement: every list item is a real <a href="/examples/<id>/"> that works
// without JS; this script upgrades clicks into an in-page live preview.
// Each distinct selection replaces the iframe node (srcdoc or src) and bumps a navigation
// generation so stale fetch/load callbacks cannot write the frame. Gallery does not keep
// a host Engine/Renderer/GPUDevice, and does not share World across examples. Shared
// /engine/<version>/<sha>/ URLs only hit the browser HTTP cache.
// COI/SharedArrayBuffer demos keep a real navigation (not srcdoc) so the iframe can
// register its own COOP/COEP service worker. That still cannot isolate the parent
// gallery page; SAB demos need a full ancestor chain or a standalone /examples/<id>/ tab.
(function () {
  if (!window.ForgeAXExampleFrameNav) {
    var PRESERVE_ATTRS = ['id', 'title', 'allow', 'allowfullscreen', 'class', 'name', 'referrerpolicy', 'sandbox'];
    window.ForgeAXExampleFrameNav = {
      createExampleFrameNav: function (options) {
        var document = options.document;
        var frame = options.getFrame();
        var generation = 0;
        var activeId = null;
        var setTimeoutFn = options.setTimeout || function (fn, ms) { return globalThis.setTimeout(fn, ms); };
        var wgpuNoticeDelay = options.wgpuNoticeDelay == null ? 1800 : options.wgpuNoticeDelay;

        function setFrame(node) {
          frame = node;
          if (options.setFrame) options.setFrame(node);
        }

        function isCurrent(gen, node) {
          return gen === generation && node === frame;
        }

        function copyPreservedAttrs(from, to) {
          for (var i = 0; i < PRESERVE_ATTRS.length; i++) {
            var name = PRESERVE_ATTRS[i];
            if (from && from.hasAttribute && from.hasAttribute(name)) {
              to.setAttribute(name, from.getAttribute(name));
            }
          }
        }

        function replaceFrame() {
          var next = document.createElement('iframe');
          copyPreservedAttrs(frame, next);
          next.removeAttribute('src');
          next.removeAttribute('srcdoc');
          next.removeAttribute('data-ex-href');
          var parent = frame && frame.parentNode;
          var old = frame;
          if (parent) {
            try {
              old.removeAttribute('srcdoc');
              old.src = 'about:blank';
            } catch (_) {}
            parent.replaceChild(next, old);
          }
          setFrame(next);
          return next;
        }

        function applySrc(node, gen, href) {
          if (!isCurrent(gen, node)) return false;
          node.removeAttribute('srcdoc');
          node.src = href;
          node.setAttribute('src', href);
          return true;
        }

        function applySrcdoc(node, gen, html) {
          if (!isCurrent(gen, node)) return false;
          node.removeAttribute('src');
          node.srcdoc = html;
          node.setAttribute('srcdoc', html);
          return true;
        }

        function rewriteDemoHtml(html, href, inject) {
          var abs = options.resolveHref(href);
          var dir = new URL('.', abs).href;
          html = html.split("new URL('.',location.href)").join("new URL('" + dir + "')");
          html = html.split('new URL(".",location.href)').join("new URL('" + dir + "')");
          return html.replace(/<head>/i, '<head>\n<script>' + inject + '</script>\n<base href="' + dir + '">\n');
        }

        function bindLoad(node, gen) {
          node.addEventListener('load', function () {
            if (!isCurrent(gen, node)) return;
            // Ignore the initial about:blank load from a newly inserted frame.
            if (!node.hasAttribute('src') && !node.hasAttribute('srcdoc')) return;
            if (options.setLoading) options.setLoading(false);
            setTimeoutFn(function () {
              if (!isCurrent(gen, node)) return;
              try {
                var doc = node.contentDocument;
                if (!doc || !node.hasAttribute('srcdoc')) return;
                if (!doc.getElementById('__wgpu_notice')) return;
                var href = node.getAttribute('data-ex-href');
                if (!href) return;
                applySrc(node, gen, href);
              } catch (_) {}
            }, wgpuNoticeDelay);
          });
        }

        function loadExampleFrame(href, gen, node) {
          function fallback() {
            return applySrc(node, gen, href);
          }
          return Promise.all([
            options.fetchHtml(href),
            options.orbitInjectPromise,
          ]).then(function (parts) {
            if (!isCurrent(gen, node)) return { applied: false, reason: 'stale' };
            var html = parts[0];
            var inject = parts[1];
            if (html.indexOf('coi-serviceworker') >= 0 || html.indexOf('__fxDemoOrbit') >= 0 || html.indexOf('data-fx-orbit') >= 0) {
              return { applied: fallback(), mode: 'src' };
            }
            return { applied: applySrcdoc(node, gen, rewriteDemoHtml(html, href, inject)), mode: 'srcdoc' };
          }).catch(function () {
            return { applied: fallback(), mode: 'src', reason: 'error' };
          });
        }

        function select(id, href) {
          if (activeId === id) {
            return { rebuilt: false, generation: generation, frame: frame, loadPromise: Promise.resolve({ applied: false, reason: 'same-id' }) };
          }
          activeId = id;
          generation += 1;
          var gen = generation;
          if (options.setLoading) options.setLoading(true);
          var node = replaceFrame();
          node.setAttribute('data-ex-href', href);
          bindLoad(node, gen);
          return {
            rebuilt: true,
            generation: gen,
            frame: node,
            loadPromise: loadExampleFrame(href, gen, node),
          };
        }

        return {
          select: select,
          isCurrent: isCurrent,
          applySrc: applySrc,
          applySrcdoc: applySrcdoc,
          replaceFrame: replaceFrame,
          getGeneration: function () { return generation; },
          getActiveId: function () { return activeId; },
          getFrame: function () { return frame; },
        };
      },
    };
  }

  var EX = window.EX_DATA || [];
  var NAV = window.EX_NAV || {};
  var createNav = window.ForgeAXExampleFrameNav.createExampleFrameNav;
  var byId = {};
  EX.forEach(function (e) { byId[e.id] = e; });
  var frame = document.getElementById('exFrame');
  var frameWrap = document.querySelector('.ex-frame-wrap');
  var titleEl = document.getElementById('exTitle');
  var list = document.getElementById('exList');
  if (!frame || !list) return;
  var items = [].slice.call(list.querySelectorAll('.ex-item'));

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function setLoading(on) {
    if (frameWrap) frameWrap.classList.toggle('is-loading', !!on);
  }

  function openAncestors(el) {
    var group = el && el.closest ? el.closest('details.ex-group') : null;
    if (group) group.open = true;
  }

  var orbitInjectPromise = fetch('/assets/examples/demo-orbit-inject.js?v=8b9ec447', { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('orbit inject ' + r.status);
      return r.text();
    });

  var nav = createNav({
    document: document,
    getFrame: function () { return frame; },
    setFrame: function (node) { frame = node; },
    setLoading: setLoading,
    fetchHtml: function (href) {
      return fetch(new URL(href, location.href).href, { credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error('demo html ' + r.status);
        return r.text();
      });
    },
    orbitInjectPromise: orbitInjectPromise,
    resolveHref: function (href) { return new URL(href, location.href); },
    setTimeout: function (fn, ms) { return window.setTimeout(fn, ms); },
  });

  function select(id, push) {
    var e = byId[id];
    if (!e || !e.ok) return;
    nav.select(id, e.href);
    if (titleEl) titleEl.innerHTML = esc(e.title) + (e.blurb ? '<small>' + esc(e.blurb) + '</small>' : '');
    items.forEach(function (it) { it.classList.toggle('is-active', it.getAttribute('data-id') === id); });
    var act = list.querySelector('.ex-item.is-active');
    openAncestors(act);
    if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    if (push) { try { history.replaceState(null, '', '#' + id); } catch (_) { location.hash = id; } }
  }

  items.forEach(function (it) {
    it.addEventListener('click', function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;
      ev.preventDefault();
      select(it.getAttribute('data-id'), true);
    });
  });

  var firstOk = EX.filter(function (e) { return e.ok; })[0];
  var hashId = (location.hash || '').replace('#', '');
  var landing = NAV.landing && byId[NAV.landing] && byId[NAV.landing].ok ? NAV.landing : (firstOk && firstOk.id);
  select((byId[hashId] && byId[hashId].ok) ? hashId : landing, false);
  window.addEventListener('hashchange', function () {
    var id = (location.hash || '').replace('#', '');
    if (byId[id]) select(id, false);
  });

  (async function () {
    var ok = false;
    try { ok = !!(navigator.gpu && await navigator.gpu.requestAdapter()); } catch (_) {}
    if (ok || !frameWrap || frameWrap.querySelector('.ex-wgpu-missing')) return;
    var zh = (document.documentElement.lang || '').indexOf('zh') === 0;
    var d = document.createElement('div');
    d.className = 'ex-wgpu-missing';
    d.innerHTML = zh
      ? '<div><p class="ex-wgpu-ico">⚡</p><p><b>这个 demo 需要 WebGPU</b></p><p>当前浏览器没有可用的 WebGPU。请用最新版 Chrome / Edge 打开。</p></div>'
      : '<div><p class="ex-wgpu-ico">⚡</p><p><b>This demo needs WebGPU</b></p><p>This browser has no working WebGPU. Open in the latest Chrome / Edge.</p></div>';
    frameWrap.appendChild(d);
  })();
})();
