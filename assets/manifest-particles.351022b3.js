/* Localized dust field for .manifest-line vision taglines */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var roots = document.querySelectorAll(".manifest-line");
  if (!roots.length) return;

  var COLORS = [
    [212, 255, 72],
    [72, 255, 207],
    [168, 255, 108],
    [255, 255, 255],
  ];

  var fields = [];

  roots.forEach(function (root) {
    if (root.querySelector(".manifest-line__particles")) return;
    root.classList.add("manifest-line--live");

    var canvas = document.createElement("canvas");
    canvas.className = "manifest-line__particles";
    canvas.setAttribute("aria-hidden", "true");
    root.insertBefore(canvas, root.firstChild);
    fields.push({
      root: root,
      canvas: canvas,
      ctx: null,
      particles: [],
      w: 0,
      h: 0,
      dpr: 1,
      ox: 0,
      oy: 0,
      visible: true,
    });
  });

  if (!fields.length) return;

  function seed(f) {
    f.particles = [];
    var count = Math.min(52, Math.max(20, Math.floor((f.w * f.h) / 2200)));
    for (var i = 0; i < count; i++) {
      f.particles.push({
        x: Math.random() * f.w,
        y: Math.random() * f.h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.1 - Math.random() * 0.28,
        r: 0.45 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        col: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0.35 + Math.random() * 0.65,
      });
    }
  }

  function resize(f) {
    var rect = f.root.getBoundingClientRect();
    var padX = 36;
    var padY = 28;
    f.w = Math.max(1, rect.width + padX * 2);
    f.h = Math.max(1, rect.height + padY * 2);
    f.ox = -padX;
    f.oy = -padY;
    f.dpr = Math.min(window.devicePixelRatio || 1, 2);
    f.canvas.width = Math.floor(f.w * f.dpr);
    f.canvas.height = Math.floor(f.h * f.dpr);
    f.canvas.style.width = f.w + "px";
    f.canvas.style.height = f.h + "px";
    f.canvas.style.left = f.ox + "px";
    f.canvas.style.top = f.oy + "px";
    if (!f.ctx) f.ctx = f.canvas.getContext("2d");
    f.ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0);
    if (!f.particles.length) seed(f);
  }

  fields.forEach(resize);

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          for (var i = 0; i < fields.length; i++) {
            if (fields[i].root === entry.target) fields[i].visible = entry.isIntersecting;
          }
        });
      },
      { threshold: 0.08 }
    );
    fields.forEach(function (f) {
      io.observe(f.root);
    });
  }

  window.addEventListener(
    "resize",
    function () {
      fields.forEach(resize);
    },
    { passive: true }
  );

  var raf = 0;

  function rgba(col, a) {
    return "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + a + ")";
  }

  function draw(ts) {
    var time = ts * 0.001;
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (!field.visible) continue;
      var ctx = field.ctx;
      ctx.clearRect(0, 0, field.w, field.h);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < field.particles.length; i++) {
        var p = field.particles[i];
        p.x += p.vx + Math.sin(time * 0.75 + p.phase) * 0.07;
        p.y += p.vy + Math.cos(time * 0.55 + p.phase) * 0.05;
        if (p.y < -10) {
          p.y = field.h + 10;
          p.x = Math.random() * field.w;
        }
        if (p.x < -10) p.x = field.w + 10;
        if (p.x > field.w + 10) p.x = -10;
        var tw = 0.5 + Math.sin(time * 1.15 + p.phase) * 0.5;
        var alpha = (0.1 + p.life * 0.16) * tw;
        var glow = p.r * 3.2;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glow);
        g.addColorStop(0, rgba(p.col, alpha));
        g.addColorStop(0.42, rgba(p.col, alpha * 0.32));
        g.addColorStop(1, rgba(p.col, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glow, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    raf = requestAnimationFrame(draw);
  }

  raf = requestAnimationFrame(draw);
  window.addEventListener("beforeunload", function () {
    cancelAnimationFrame(raf);
  });
})();
