// Examples gallery interactivity — split view (filterable list + live <iframe>).
// Data is server-rendered per language and inlined as window.EX_DATA (single-language:
// [{ id, ok, href, title, blurb }]). No runtime i18n; the list items are already localized.
// Progressive enhancement: every list item is a real <a href="/examples/<id>/"> that works
// without JS; this script upgrades clicks into an in-page live preview.
(function () {
  var EX = window.EX_DATA || [];
  var byId = {};
  EX.forEach(function (e) { byId[e.id] = e; });
  var frame = document.getElementById('exFrame');
  var titleEl = document.getElementById('exTitle');
  var openEl = document.getElementById('exOpen');
  var list = document.getElementById('exList');
  if (!frame || !list) return;
  var items = [].slice.call(list.querySelectorAll('.ex-item'));

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function select(id, push) {
    var e = byId[id];
    if (!e || !e.ok) return;
    if (frame.src.indexOf(e.href) < 0) frame.src = e.href;
    titleEl.innerHTML = esc(e.title) + (e.blurb ? '<small>' + esc(e.blurb) + '</small>' : '');
    openEl.href = e.href;
    items.forEach(function (it) { it.classList.toggle('is-active', it.getAttribute('data-id') === id); });
    var act = list.querySelector('.ex-item.is-active');
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

  var filter = document.getElementById('exFilter');
  if (filter) filter.addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    items.forEach(function (it) {
      var hay = (it.textContent + ' ' + it.getAttribute('data-id')).toLowerCase();
      it.style.display = (!q || hay.indexOf(q) >= 0) ? '' : 'none';
    });
  });

  var firstOk = EX.filter(function (e) { return e.ok; })[0];
  var hashId = (location.hash || '').replace('#', '');
  select((byId[hashId] && byId[hashId].ok) ? hashId : (firstOk && firstOk.id), false);
  window.addEventListener('hashchange', function () {
    var id = (location.hash || '').replace('#', '');
    if (byId[id]) select(id, false);
  });
})();
