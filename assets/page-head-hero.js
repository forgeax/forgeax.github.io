/* Page-head starfield + forward meteors (Wope-style, title zone only) */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var LIME = [212, 255, 72];
  var TEAL = [72, 255, 207];
  var WHITE = [255, 255, 255];
  var PALETTE = [WHITE, WHITE, WHITE, LIME, TEAL];
  var HERO_V = "92";
  var DRIFT_V = "92";

  function pickCol() {
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
  }

  function injectDriftDots(head) {
    var existing = head.querySelector(".page-head__drift");
    if (existing && existing.getAttribute("data-v") === DRIFT_V) return;
    if (existing) existing.remove();

    var drift = document.createElement("div");
    drift.className = "page-head__drift";
    drift.setAttribute("data-v", DRIFT_V);
    drift.setAttribute("aria-hidden", "true");
    var tones = ["a", "b", "mix"];
    var slots = [
      [8, 14], [24, 20], [42, 10], [58, 18], [76, 14], [92, 26],
      [14, 52], [34, 66], [54, 58], [74, 64], [90, 44],
    ];

    for (var i = 0; i < slots.length; i++) {
      var dot = document.createElement("span");
      dot.className = "page-head__drift-dot page-head__drift-dot--" + tones[i % 3];
      var x = slots[i][0] + (Math.random() - 0.5) * 6;
      var y = slots[i][1] + (Math.random() - 0.5) * 8;
      dot.style.setProperty("--x", Math.max(5, Math.min(95, x)).toFixed(1) + "%");
      dot.style.setProperty("--y", Math.max(8, Math.min(92, y)).toFixed(1) + "%");
      dot.style.setProperty("--d", (-Math.random() * 14).toFixed(2) + "s");
      dot.style.setProperty("--dur", (14 + Math.random() * 10).toFixed(1) + "s");
      dot.style.setProperty("--s", (0.9 + Math.random() * 0.4).toFixed(2));
      drift.appendChild(dot);
    }

    var anchor = head.querySelector(".page-head__sparks") || head.querySelector("h1");
    head.insertBefore(drift, anchor || head.firstChild);
  }

  function rgba(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  function initPageHeadHero() {
    document.querySelectorAll(".page-head--cinema").forEach(function (head) {
      head.querySelectorAll(".page-head__halo").forEach(function (n) {
        n.remove();
      });

      if (!head.querySelector(".page-head__horizon")) {
        var horizon = document.createElement("div");
        horizon.className = "page-head__horizon";
        horizon.setAttribute("aria-hidden", "true");
        head.insertBefore(horizon, head.firstChild);
      }

      if (!head.querySelector(".page-head__aura")) {
        var aura = document.createElement("div");
        aura.className = "page-head__aura";
        aura.setAttribute("aria-hidden", "true");
        head.insertBefore(aura, head.firstChild.nextSibling);
      }

      injectDriftDots(head);

      var canvas = head.querySelector(".page-head__sparks");
      if (canvas && canvas.getAttribute("data-v") !== HERO_V) {
        canvas.remove();
        canvas = null;
      }
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = "page-head__sparks";
        canvas.setAttribute("data-v", HERO_V);
        canvas.setAttribute("aria-hidden", "true");
        var anchor = head.querySelector("h1");
        head.insertBefore(canvas, anchor || head.firstChild);
        bootCanvas(canvas, head);
      }
    });
  }

  function bootCanvas(canvas, head) {
    var ctx = canvas.getContext("2d");
    var w = 0;
    var h = 0;
    var dpr = 1;
    var vpX = 0.5;
    var vpY = 0.48;
    var stars = [];
    var meteors = [];
    var STAR_N = 40;
    var METEOR_MAX = 2;

    function makeStar() {
      return {
        nx: 0.05 + Math.random() * 0.9,
        ny: 0.06 + Math.random() * 0.88,
        z: 0.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        size: 0.45 + Math.random() * 0.8,
        ampX: 3 + Math.random() * 7,
        ampY: 2.5 + Math.random() * 6,
        drift: 0.14 + Math.random() * 0.2,
        col: pickCol(),
      };
    }

    function makeMeteor() {
      return {
        angle: Math.random() * Math.PI * 2,
        z: Math.random() * 0.12,
        speed: 0.006 + Math.random() * 0.009,
      };
    }

    function seed() {
      stars = [];
      for (var i = 0; i < STAR_N; i++) stars.push(makeStar());
      meteors = [];
      for (var j = 0; j < 2; j++) meteors.push(makeMeteor());
    }

    function readSize() {
      var rect = head.getBoundingClientRect();
      w = Math.max(320, Math.round(rect.width));
      h = Math.max(200, Math.round(rect.height));
    }

    function resize() {
      readSize();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = "";
      canvas.style.height = "";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!stars.length) seed();
    }

    function meteorPoint(m, z) {
      var t = z * z;
      var maxR = Math.max(w, h) * 0.62;
      var r = t * maxR;
      return {
        x: vpX * w + Math.cos(m.angle) * r,
        y: vpY * h + Math.sin(m.angle) * r * 0.72,
      };
    }

    function drawStars(t) {
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = 0.6 + Math.sin(t * 0.65 + s.phase) * 0.4;
        var alpha = (0.12 + s.z * 0.22) * tw;
        var r = s.size * (0.6 + s.z * 0.45);
        var dx = Math.sin(t * s.drift + s.phase) * s.ampX;
        var dy = Math.cos(t * s.drift * 0.82 + s.phase * 1.4) * s.ampY;
        var x = Math.max(4, Math.min(w - 4, s.nx * w + dx));
        var y = Math.max(4, Math.min(h - 4, s.ny * h + dy));
        var tinted = s.col !== WHITE;

        ctx.fillStyle = rgba(s.col, tinted ? alpha * 1.1 : alpha);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = rgba(tinted ? s.col : WHITE, alpha * (tinted ? 0.16 : 0.07));
        ctx.beginPath();
        ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawMeteor(m) {
      var headPt = meteorPoint(m, m.z);
      var tailZ = Math.max(0, m.z - 0.06 - m.z * 0.04);
      var tail = meteorPoint(m, tailZ);
      var fade = Math.min(1, m.z * 1.6) * (1 - Math.max(0, m.z - 0.92) * 4);
      if (fade <= 0.02) return;

      var grad = ctx.createLinearGradient(tail.x, tail.y, headPt.x, headPt.y);
      grad.addColorStop(0, rgba(WHITE, 0));
      grad.addColorStop(0.45, rgba(WHITE, 0.07 * fade));
      grad.addColorStop(0.82, rgba(LIME, 0.24 * fade));
      grad.addColorStop(1, rgba(WHITE, 0.58 * fade));

      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.5 + m.z * 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(headPt.x, headPt.y);
      ctx.stroke();

      ctx.fillStyle = rgba(WHITE, 0.48 * fade);
      ctx.beginPath();
      ctx.arc(headPt.x, headPt.y, 0.8 + m.z * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    function tickMeteors() {
      for (var i = 0; i < meteors.length; i++) {
        meteors[i].z += meteors[i].speed;
        if (meteors[i].z > 1.05) meteors[i] = makeMeteor();
      }
      if (meteors.length < METEOR_MAX && Math.random() < 0.012) {
        meteors.push(makeMeteor());
      }
    }

    function frame(ts) {
      var t = ts * 0.001;
      readSize();
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        resize();
      }
      ctx.clearRect(0, 0, w, h);
      drawStars(t);
      tickMeteors();
      for (var i = 0; i < meteors.length; i++) drawMeteor(meteors[i]);
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(frame);
  }

  window.forgeaxInitPageHeadHero = initPageHeadHero;
  initPageHeadHero();
})();
