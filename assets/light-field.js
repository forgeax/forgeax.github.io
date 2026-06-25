/* Global light field — scroll-linked beam position, shape morph, noise parallax */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var state = { x: 50, y: 42, m: 0, tx: 50, ty: 42, tm: 0 };
  var scrollY = 0;
  var raf = 0;
  var root = document.documentElement;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function setTarget(fx, fy, morph) {
    if (typeof fx === "number") state.tx = fx * 100;
    if (typeof fy === "number") state.ty = fy * 100;
    if (typeof morph === "number") state.tm = morph;
  }

  function tick() {
    state.x = lerp(state.x, state.tx, 0.032);
    state.y = lerp(state.y, state.ty, 0.032);
    state.m = lerp(state.m, state.tm, 0.026);

    root.style.setProperty("--light-x", state.x.toFixed(2) + "%");
    root.style.setProperty("--light-y", state.y.toFixed(2) + "%");
    root.style.setProperty("--light-morph", state.m.toFixed(3));

    var sy = scrollY;
    var noise = document.querySelector(".ambient__noise");
    var grid = document.querySelector(".ambient__grid");
    if (noise) {
      noise.style.transform = "translate3d(" + (sy * 0.012) + "px," + (sy * 0.038) + "px,0)";
    }
    if (grid) {
      grid.style.transform = "translate3d(0," + (sy * 0.018) + "px,0)";
    }

    var morphEl = document.querySelector(".ambient__morph");
    if (morphEl) {
      var sy = 1 + state.m * 0.1;
      var sx = 1 - state.m * 0.04;
      morphEl.style.transform =
        "translate(-50%,-50%) scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")";
    }

    raf = requestAnimationFrame(tick);
  }

  document.addEventListener("forgeax:blend", function (e) {
    var d = e.detail || {};
    var morph = typeof d.t === "number" ? d.t * 0.55 : 0.2;
    setTarget(d.focalX, d.focalY, morph);
  });

  document.addEventListener("forgeax:scene", function (e) {
    var d = e.detail || {};
    setTarget(d.focalX, d.focalY, 0.2);
  });

  window.addEventListener("scroll", function () { scrollY = window.scrollY; }, { passive: true });

  setTarget(0.5, 0.42, 0.2);
  tick();

  window.addEventListener("beforeunload", function () { cancelAnimationFrame(raf); });
})();
