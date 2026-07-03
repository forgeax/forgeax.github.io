/* Light dust — homepage only, follows volumetric light */
(function () {
  var canvas = document.getElementById("forgeParticles");
  if (!canvas || !window.FORGE_SCENES) return;
  if (!document.body.classList.contains("has-immersive")) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var ctx = canvas.getContext("2d");
  var SCENES = window.FORGE_SCENES;
  var w = 0;
  var h = 0;
  var dpr = 1;
  var raf = 0;
  var time = 0;

  var particles = [];
  var MAX = 32;
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  var focal = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42 };
  var scrollBlend = null;
  var curKey = "studio";
  var tgtKey = "studio";
  var morphT = 1;
  var scene = SCENES.studio;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function lerpRgb(a, b, t) {
    return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))];
  }

  function blendScene(a, b, t) {
    return {
      a: lerpRgb(a.a, b.a, t), b: lerpRgb(a.b, b.b, t), c: lerpRgb(a.c, b.c, t),
      veil: lerpRgb(a.veil, b.veil, t),
      drift: lerp(a.drift, b.drift, t), curl: lerp(a.curl, b.curl, t),
      lift: lerp(a.lift, b.lift, t), density: lerp(a.density, b.density, t),
    };
  }

  function rgba(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  function pickCol(s) {
    var r = Math.random();
    if (r < 0.5) return s.c;
    if (r < 0.82) return s.b;
    return s.a;
  }

  function noise2(x, y, t) {
    return Math.sin(x * 0.002 + t * 0.08) * 0.3 + Math.sin(y * 0.0016 - t * 0.06) * 0.25;
  }

  function flowAt(x, y, t, s) {
    var fx = focal.x * w;
    var fy = focal.y * h;
    var dx = x - fx;
    var dy = y - fy;
    var dist = Math.sqrt(dx * dx + dy * dy) + 200;
    var n = noise2(x, y, t);
    return {
      x: n * s.curl * 0.18 + (dx / dist) * s.drift * 0.04 + (mouse.x - 0.5) * 0.02,
      y: n * s.drift * 0.12 - s.lift * 0.06 + (dy / dist) * s.lift * 0.03,
    };
  }

  function makeDust() {
    var fx = focal.x * w;
    var fy = focal.y * h;
    var ang = Math.random() * Math.PI * 2;
    var rad = 80 + Math.random() * Math.max(w, h) * 0.45;
    return {
      x: fx + Math.cos(ang) * rad * Math.random(),
      y: fy + Math.sin(ang) * rad * 0.6 * Math.random(),
      vx: 0, vy: 0,
      r: 0.4 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      col: pickCol(scene),
      tgtCol: pickCol(scene),
      life: 0.3 + Math.random() * 0.5,
    };
  }

  function seed() {
    particles = [];
    var n = w < 720 ? 28 : 32;
    for (var i = 0; i < n; i++) particles.push(makeDust());
  }

  function drawDust(x, y, r, col, alpha) {
    if (alpha < 0.001) return;
    var g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8);
    g.addColorStop(0, rgba(col, alpha));
    g.addColorStop(0.5, rgba(col, alpha * 0.25));
    g.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  function resolveScene() {
    morphT = lerp(morphT, 1, 0.014);
    var blended = blendScene(SCENES[curKey] || SCENES.studio, SCENES[tgtKey] || SCENES.studio, morphT);
    if (morphT > 0.995) curKey = tgtKey;
    return blended;
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!particles.length) seed();
  }

  function wrap(p) {
    var pad = 60;
    if (p.x < -pad) p.x = w + pad;
    if (p.x > w + pad) p.x = -pad;
    if (p.y < -pad) p.y = h + pad;
    if (p.y > h + pad) p.y = -pad;
  }

  function drawFrame(ts) {
    time = ts * 0.001;
    mouse.x = lerp(mouse.x, mouse.tx, 0.015);
    mouse.y = lerp(mouse.y, mouse.ty, 0.015);
    focal.x = lerp(focal.x, focal.tx, 0.028);
    focal.y = lerp(focal.y, focal.ty, 0.028);

    scene = resolveScene();
    var intensity = 0.38 + scene.density * 0.22;

    ctx.fillStyle = "rgba(4, 6, 10, 0.032)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.col = lerpRgb(p.col, p.tgtCol, 0.012);
      var f = flowAt(p.x, p.y, time + p.phase, scene);
      p.vx = lerp(p.vx, f.x * 0.28, 0.04);
      p.vy = lerp(p.vy, f.y * 0.28, 0.04);
      p.x += p.vx;
      p.y += p.vy;
      wrap(p);
      var tw = 0.7 + Math.sin(time * 0.45 + p.phase) * 0.3;
      drawDust(p.x, p.y, p.r, p.col, (0.004 + p.life * 0.009) * intensity * tw);
    }

    ctx.globalCompositeOperation = "source-over";
    if (particles.length < MAX && Math.random() < 0.012) particles.push(makeDust());
    if (particles.length > MAX) particles.splice(0, particles.length - MAX);
    raf = requestAnimationFrame(drawFrame);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("mousemove", function (e) {
    mouse.tx = e.clientX / w;
    mouse.ty = e.clientY / h;
  }, { passive: true });

  resize();
  raf = requestAnimationFrame(drawFrame);

  // Pause the canvas loop while the tab is hidden — no point drawing dust nobody
  // can see, and it keeps the CPU/GPU idle in the background.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { raf = requestAnimationFrame(drawFrame); }
  });

  window.addEventListener("beforeunload", function () { cancelAnimationFrame(raf); });
})();
