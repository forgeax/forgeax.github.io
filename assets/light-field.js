/* Global light field — scroll-linked beam position, shape morph, noise parallax.

   Perf: --light-* are INHERITED custom properties. Writing them on the document
   root (<html>) every frame invalidated the computed style of the entire document
   — the DevTools trace showed ~4.5s of UpdateLayoutTree (style recalc). All
   consumers (.ambient__morph / .ambient__beam) live inside .ambient, so we scope
   the writes to that container, confining invalidation to a few decorative nodes.
   We also skip DOM writes whose value hasn't changed, and stop the RAF loop once
   the field has settled or the tab is hidden (any scroll / scene / blend kicks it
   back). */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var lightRoot = document.querySelector(".ambient") || document.documentElement;
  var noiseEl = document.querySelector(".ambient__noise");
  var gridEl = document.querySelector(".ambient__grid");
  var morphEl = document.querySelector(".ambient__morph");

  var state = { x: 50, y: 42, m: 0, tx: 50, ty: 42, tm: 0 };
  var scrollY = 0;
  var raf = 0;

  // Last written values — skip the setProperty / transform when unchanged. This is
  // what removes the idle-time full-document style recalc.
  var wx = null, wy = null, wm = null, wScroll = null, wMx = null, wMy = null;
  var settleFrames = 0;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function setTarget(fx, fy, morph) {
    if (typeof fx === "number") state.tx = fx * 100;
    if (typeof fy === "number") state.ty = fy * 100;
    if (typeof morph === "number") state.tm = morph;
    kick();
  }

  function tick() {
    raf = 0;
    state.x = lerp(state.x, state.tx, 0.032);
    state.y = lerp(state.y, state.ty, 0.032);
    state.m = lerp(state.m, state.tm, 0.026);

    var wrote = false;

    // Unitless focal fractions (0..1) — CSS turns them into vw/vh transforms.
    var sx = (state.x / 100).toFixed(4);
    var sy = (state.y / 100).toFixed(4);
    var sm = state.m.toFixed(3);
    if (sx !== wx) { lightRoot.style.setProperty("--light-fx", sx); wx = sx; wrote = true; }
    if (sy !== wy) { lightRoot.style.setProperty("--light-fy", sy); wy = sy; wrote = true; }
    if (sm !== wm) { lightRoot.style.setProperty("--light-morph", sm); wm = sm; wrote = true; }

    // Noise / grid parallax depends only on scrollY — write only when it moved.
    if ((noiseEl || gridEl) && scrollY !== wScroll) {
      if (noiseEl) noiseEl.style.transform = "translate3d(" + (scrollY * 0.012) + "px," + (scrollY * 0.038) + "px,0)";
      if (gridEl) gridEl.style.transform = "translate3d(0," + (scrollY * 0.018) + "px,0)";
      wScroll = scrollY;
      wrote = true;
    }

    // Only the breathe scale is JS-driven now; position comes from the inherited
    // --light-fx/fy in the CSS transform, so we no longer overwrite morph's transform.
    if (morphEl) {
      var msx = (1 - state.m * 0.04).toFixed(3);
      var msy = (1 + state.m * 0.1).toFixed(3);
      if (msx !== wMx) { morphEl.style.setProperty("--morph-sx", msx); wMx = msx; wrote = true; }
      if (msy !== wMy) { morphEl.style.setProperty("--morph-sy", msy); wMy = msy; wrote = true; }
    }

    if (wrote) settleFrames = 0; else settleFrames++;
    // Keep looping while still animating; stop once nothing changed for a few
    // frames (or the tab is hidden). kick() restarts it on the next input.
    if (settleFrames < 8 && !document.hidden) raf = requestAnimationFrame(tick);
    else raf = 0;
  }

  function kick() {
    settleFrames = 0;
    if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
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

  window.addEventListener("scroll", function () { scrollY = window.scrollY; kick(); }, { passive: true });
  window.addEventListener("resize", kick, { passive: true });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    else kick();
  });

  setTarget(0.5, 0.42, 0.2);
  kick();

  window.addEventListener("beforeunload", function () { if (raf) cancelAnimationFrame(raf); });
})();
