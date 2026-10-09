// Examples gallery interactivity — split view (list + live <iframe>).
// Data is server-rendered per language and inlined as window.EX_DATA (single-language:
// [{ id, ok, href, title, blurb }]).
// Progressive enhancement: every list item is a real <a href="/examples/<id>/"> that works
// without JS; this script upgrades clicks into an in-page live preview.
// The first iframe src is applied immediately (inline boot + this file before site.js).
// Later selections replace the iframe node so the previous example cannot remain on screen.
// Loading / progress / fatal stay inside the Engine example shell. This parent does not
// listen for frame-ready/failed/progress and does not draw an outer loader.
(function () {
  var PRESERVE_ATTRS = ['id', 'title', 'allow', 'allowfullscreen', 'class', 'name', 'referrerpolicy', 'sandbox'];

  function resolveInitialExample(EX, hash) {
    var list = EX || [];
    var byId = {};
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id) byId[list[i].id] = list[i];
    }
    var hashId = String(hash || '').replace(/^#/, '');
    if (byId[hashId] && byId[hashId].ok) return byId[hashId];
    for (var j = 0; j < list.length; j++) {
      if (list[j] && list[j].ok) return list[j];
    }
    return null;
  }

  function frameHref(node) {
    if (!node) return '';
    if (node.getAttribute) {
      return node.getAttribute('data-ex-href') || node.getAttribute('src') || node.src || '';
    }
    return node.src || '';
  }

  function isPlaceholderFrame(node) {
    var src = node && node.getAttribute ? node.getAttribute('src') : (node && node.src);
    return !src || src === 'about:blank' || src === '';
  }

  function createExampleFrameNav(options) {
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

    function select(id, href) {
      if (activeId === id) {
        return { rebuilt: false, generation: generation, frame: frame, loadPromise: Promise.resolve({ applied: false, reason: 'same-id' }) };
      }
      var prevId = activeId;
      activeId = id;
      generation += 1;
      var gen = generation;

      var reuse = prevId === null && (isPlaceholderFrame(frame) || frameHref(frame) === href);
      var node;
      var applied = true;
      var mode = 'src';
      if (reuse) {
        node = frame;
        node.setAttribute('data-ex-href', href);
        if (isPlaceholderFrame(node) || node.getAttribute('src') !== href) {
          applied = applySrc(node, gen, href);
        } else {
          mode = 'reuse-src';
        }
      } else {
        node = replaceFrame();
        node.setAttribute('data-ex-href', href);
        applied = applySrc(node, gen, href);
      }
      return {
        rebuilt: !reuse,
        generation: gen,
        frame: node,
        loadPromise: Promise.resolve({ applied: applied, mode: mode }),
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
  }

  function bootExamplesGallery(env) {
    var window = env.window;
    var document = env.document;
    var order = env.order || [];
    var EX = window.EX_DATA || [];
    var byId = {};
    EX.forEach(function (e) { byId[e.id] = e; });
    var frame = document.getElementById('exFrame');
    var frameWrap = document.querySelector('.ex-frame-wrap');
    var titleEl = document.getElementById('exTitle');
    var list = document.getElementById('exList');
    if (!frame || !list) return null;
    var items = [].slice.call(list.querySelectorAll('.ex-item'));

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }

    function openAncestors(el) {
      order.push('ui-ancestors');
      var group = el && el.closest ? el.closest('details.ex-group') : null;
      if (group) group.open = true;
    }

    var nav = createExampleFrameNav({
      document: document,
      getFrame: function () { return frame; },
      setFrame: function (node) { frame = node; },
    });

    function select(id, push) {
      var e = byId[id];
      if (!e || !e.ok) return;
      nav.select(id, e.href);
      order.push('src');
      if (titleEl) {
        titleEl.innerHTML = esc(e.title) + (e.blurb ? '<small>' + esc(e.blurb) + '</small>' : '');
        order.push('ui-title');
      }
      items.forEach(function (it) { it.classList.toggle('is-active', it.getAttribute('data-id') === id); });
      var act = list.querySelector('.ex-item.is-active');
      openAncestors(act);
      if (act && act.scrollIntoView) {
        order.push('ui-scroll');
        act.scrollIntoView({ block: 'nearest' });
      }
      if (push) { try { history.replaceState(null, '', '#' + id); } catch (_) { location.hash = id; } }
    }

    items.forEach(function (it) {
      it.addEventListener('click', function (ev) {
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;
        ev.preventDefault();
        select(it.getAttribute('data-id'), true);
      });
    });

    var initial = resolveInitialExample(EX, (window.location && window.location.hash) || '');
    select(initial && initial.id, false);
    window.addEventListener('hashchange', function () {
      var id = (window.location.hash || '').replace('#', '');
      if (byId[id]) select(id, false);
    });

    (async function () {
      order.push('ui-wgpu');
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

    return { nav: nav, order: order, select: select };
  }

  if (!window.ForgeAXExampleFrameNav) {
    window.ForgeAXExampleFrameNav = {
      createExampleFrameNav: createExampleFrameNav,
      resolveInitialExample: resolveInitialExample,
      bootExamplesGallery: bootExamplesGallery,
    };
  }

  if (!window.__FX_EXAMPLES_NO_AUTOBOOT) {
    bootExamplesGallery({ window: window, document: document });
  }
})();
