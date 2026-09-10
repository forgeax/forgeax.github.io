/* ForgeaX examples hub — select, filter, keyboard nav, iframe loading */
(function () {
  var dataEl = document.getElementById("ex-data");
  if (!dataEl) return;
  var EX;
  try { EX = JSON.parse(dataEl.textContent); } catch (_) { return; }

  var byId = {};
  EX.forEach(function (e) { byId[e.id] = e; });

  var frame = document.getElementById("exFrame");
  var frameWrap = document.querySelector(".ex-frame-wrap");
  var titleEl = document.getElementById("exTitle");
  var list = document.getElementById("exList");
  if (!frame || !list) return;

  var items = [].slice.call(list.querySelectorAll(".ex-item"));
  var activeId = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function bi(zh, en) {
    return '<span data-lang="zh">' + esc(zh) + '</span><span data-lang="en">' + esc(en) + '</span>';
  }
  function setLoading(on) {
    if (frameWrap) frameWrap.classList.toggle("is-loading", !!on);
  }

  function select(id, push) {
    var e = byId[id];
    if (!e || !e.ok) return;
    activeId = id;
    if (frame.src.indexOf(e.href) < 0) {
      setLoading(true);
      frame.src = e.href;
    }
    if (titleEl) {
      titleEl.innerHTML = bi(e.title.zh, e.title.en) + '<small>' + bi(e.blurb.zh, e.blurb.en) + '</small>';
      if (window.forgeaxApplyI18n) window.forgeaxApplyI18n(titleEl);
    }
    items.forEach(function (it) { it.classList.toggle("is-active", it.getAttribute("data-id") === id); });
    var act = list.querySelector(".ex-item.is-active");
    if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest" });
    if (push) {
      try { history.replaceState(null, "", "#" + id); } catch (_) { location.hash = id; }
    }
  }

  frame.addEventListener("load", function () { setLoading(false); });

  items.forEach(function (it) {
    it.addEventListener("click", function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;
      ev.preventDefault();
      select(it.getAttribute("data-id"), true);
    });
  });

  var firstOk = EX.filter(function (e) { return e.ok; })[0];
  var hashId = (location.hash || "").replace("#", "");
  select((byId[hashId] && byId[hashId].ok) ? hashId : (firstOk && firstOk.id), false);

  window.addEventListener("hashchange", function () {
    var id = (location.hash || "").replace("#", "");
    if (byId[id]) select(id, false);
  });
})();
