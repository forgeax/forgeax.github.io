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
  var openEl = document.getElementById("exOpen");
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
  function visibleItems() {
    return items.filter(function (it) { return it.style.display !== "none" && !it.classList.contains("is-disabled"); });
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
    if (titleEl) titleEl.innerHTML = bi(e.title.zh, e.title.en) + '<small>' + bi(e.blurb.zh, e.blurb.en) + '</small>';
    if (openEl) openEl.href = e.href;
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

  var filter = document.getElementById("exFilter");
  if (filter) {
    filter.addEventListener("input", function () {
      var q = this.value.trim().toLowerCase();
      items.forEach(function (it) {
        var hay = (it.textContent + " " + it.getAttribute("data-id")).toLowerCase();
        it.style.display = (!q || hay.indexOf(q) >= 0) ? "" : "none";
      });
    });
    filter.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        var vis = visibleItems();
        if (!vis.length) return;
        var idx = vis.findIndex(function (it) { return it.getAttribute("data-id") === activeId; });
        if (idx < 0) idx = 0;
        else if (ev.key === "ArrowDown") idx = Math.min(idx + 1, vis.length - 1);
        else idx = Math.max(idx - 1, 0);
        select(vis[idx].getAttribute("data-id"), true);
      }
      if (ev.key === "Enter" && activeId) select(activeId, true);
    });
  }

  var firstOk = EX.filter(function (e) { return e.ok; })[0];
  var hashId = (location.hash || "").replace("#", "");
  select((byId[hashId] && byId[hashId].ok) ? hashId : (firstOk && firstOk.id), false);

  window.addEventListener("hashchange", function () {
    var id = (location.hash || "").replace("#", "");
    if (byId[id]) select(id, false);
  });
})();
