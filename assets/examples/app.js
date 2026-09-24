// Examples gallery interactivity — split view (list + live <iframe>).
// Data is server-rendered per language and inlined as window.EX_DATA (single-language:
// [{ id, ok, href, title, blurb }]).
// Progressive enhancement: every list item is a real <a href="/examples/<id>/"> that works
// without JS; this script upgrades clicks into an in-page live preview.
// Each distinct selection replaces the iframe node and navigates it directly to the
// standalone example URL. The generation prevents stale load callbacks from mutating the
// current selection. Gallery does not keep
// a host Engine/Renderer/GPUDevice, and does not share World across examples. Shared
// /engine/<version>/<sha>/ URLs only hit the browser HTTP cache.
(function () {
  if (!window.ForgeAXExampleFrameNav) {
    var PRESERVE_ATTRS = ['id', 'title', 'allow', 'allowfullscreen', 'class', 'name', 'referrerpolicy', 'sandbox'];
    window.ForgeAXExampleFrameNav = {
      createExampleFrameNav: function (options) {
        var document = options.document;
        var frame = options.getFrame();
        var generation = 0;
        var activeId = null;
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

        function bindLoad(node, gen) {
          node.addEventListener('load', function () {
            if (!isCurrent(gen, node)) return;
            if (!node.hasAttribute('src')) return;
            if (options.setLoading) options.setLoading(false);
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
          var applied = applySrc(node, gen, href);
          return {
            rebuilt: true,
            generation: gen,
            frame: node,
            loadPromise: Promise.resolve({ applied: applied, mode: 'src' }),
          };
        }

        return {
          select: select,
          isCurrent: isCurrent,
          applySrc: applySrc,
          replaceFrame: replaceFrame,
          getGeneration: function () { return generation; },
          getActiveId: function () { return activeId; },
          getFrame: function () { return frame; },
        };
      },
    };
  }

  var EX = window.EX_DATA || [];
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

  var nav = createNav({
    document: document,
    getFrame: function () { return frame; },
    setFrame: function (node) { frame = node; },
    setLoading: setLoading,
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
  select((byId[hashId] && byId[hashId].ok) ? hashId : (firstOk && firstOk.id), false);
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
