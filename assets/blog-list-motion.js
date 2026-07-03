/* Blog list — cursor spotlight, stagger reveal, arrow icons */
(function () {
  var list = document.querySelector(".post-list");
  if (!list) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function ensureRowFx(row) {
    if (row.querySelector(".post-row__fx")) return;
    ["post-row__sheen", "post-row__fx", "post-row__ring"].forEach(function (cls) {
      var el = document.createElement("span");
      el.className = cls;
      el.setAttribute("aria-hidden", "true");
      row.insertBefore(el, row.firstChild);
    });
    var go = document.createElement("span");
    go.className = "post-row__go";
    go.setAttribute("aria-hidden", "true");
    go.innerHTML = '<i data-lucide="chevron-right"></i>';
    row.appendChild(go);
    row.classList.add("post-row--fx");
  }

  list.querySelectorAll(".post-row").forEach(ensureRowFx);
  if (window.forgeaxRefreshIcons) window.forgeaxRefreshIcons();

  if (!reduced && window.IntersectionObserver) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-inview");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(list);
  } else {
    list.classList.add("is-inview");
  }

  if (reduced || !fine) return;

  var rows = list.querySelectorAll(".post-row--fx");

  function resetRow(row) {
    row.style.setProperty("--spot-on", "0");
    row.style.setProperty("--spot-x", "50%");
    row.style.setProperty("--spot-y", "50%");
  }

  function paintRows(e) {
    var mx = e.clientX;
    var my = e.clientY;
    rows.forEach(function (row) {
      var rect = row.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var x = ((mx - rect.left) / rect.width) * 100;
      var y = ((my - rect.top) / rect.height) * 100;
      var cx = rect.left + rect.width * 0.5;
      var cy = rect.top + rect.height * 0.5;
      var dx = mx - cx;
      var dy = my - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var reach = Math.max(rect.width, rect.height) * 1.05;
      var t = Math.max(0, 1 - dist / reach);
      var on = t * t * (3 - 2 * t);
      row.style.setProperty("--spot-x", x.toFixed(2) + "%");
      row.style.setProperty("--spot-y", y.toFixed(2) + "%");
      row.style.setProperty("--spot-on", on.toFixed(3));
    });
  }

  var ticking = false;
  var lastEv = null;

  list.addEventListener("mousemove", function (e) {
    lastEv = e;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        if (lastEv) paintRows(lastEv);
      });
    }
  });

  list.addEventListener("mouseleave", function () {
    lastEv = null;
    rows.forEach(resetRow);
  });
})();
