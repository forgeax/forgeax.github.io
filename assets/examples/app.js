// Examples gallery interactivity — split view (list + live <iframe>).
// Data is server-rendered per language and inlined as window.EX_DATA (single-language:
// [{ id, ok, href, title, blurb }]). window.EX_NAV.landing is the default showcase id.
// Progressive enhancement: every list item is a real <a href="/examples/<id>/"> that works
// without JS; this script upgrades clicks into an in-page live preview.
(function () {
  var EX = window.EX_DATA || [];
  var NAV = window.EX_NAV || {};
  var byId = {};
  EX.forEach(function (e) { byId[e.id] = e; });
  var frame = document.getElementById('exFrame');
  var frameWrap = document.querySelector('.ex-frame-wrap');
  var titleEl = document.getElementById('exTitle');
  var list = document.getElementById('exList');
  if (!frame || !list) return;
  var items = [].slice.call(list.querySelectorAll('.ex-item'));
  var activeId = null;

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

  function loadExampleFrame(href) {
    var abs = new URL(href, location.href);
    var dir = new URL('.', abs).href;
    function fallback() { frame.src = href; }
    Promise.all([
      fetch(abs.href, { credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error('demo html ' + r.status);
        return r.text();
      }),
      orbitInjectPromise,
    ]).then(function (parts) {
      var html = parts[0];
      var inject = parts[1];
      if (html.indexOf('coi-serviceworker') >= 0) { fallback(); return; }
      if (html.indexOf('__fxDemoOrbit') >= 0 || html.indexOf('data-fx-orbit') >= 0) {
        fallback();
        return;
      }
      html = html.split("new URL('.',location.href)").join("new URL('" + dir + "')");
      html = html.split('new URL(".",location.href)').join("new URL('" + dir + "')");
      html = html.replace(/<head>/i, '<head>\n<script>' + inject + '</script>\n<base href="' + dir + '">\n');
      frame.srcdoc = html;
    }).catch(fallback);
  }

  function select(id, push) {
    var e = byId[id];
    if (!e || !e.ok) return;
    activeId = id;
    if (frame.getAttribute('data-ex-href') !== e.href) {
      setLoading(true);
      frame.setAttribute('data-ex-href', e.href);
      loadExampleFrame(e.href);
    }
    if (titleEl) titleEl.innerHTML = esc(e.title) + (e.blurb ? '<small>' + esc(e.blurb) + '</small>' : '');
    items.forEach(function (it) { it.classList.toggle('is-active', it.getAttribute('data-id') === id); });
    var act = list.querySelector('.ex-item.is-active');
    openAncestors(act);
    if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    if (push) { try { history.replaceState(null, '', '#' + id); } catch (_) { location.hash = id; } }
  }

  frame.addEventListener('load', function () {
    setLoading(false);
    window.setTimeout(function () {
      try {
        var doc = frame.contentDocument;
        if (!doc || !frame.hasAttribute('srcdoc')) return;
        if (!doc.getElementById('__wgpu_notice')) return;
        var href = frame.getAttribute('data-ex-href');
        if (!href) return;
        frame.removeAttribute('srcdoc');
        frame.src = href;
      } catch (e) {}
    }, 1800);
  });

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
