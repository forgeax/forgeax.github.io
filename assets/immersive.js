/* Immersive home — scroll-linked light focal (fixed cool palette) */
(function () {
  if (!document.body.classList.contains("has-immersive")) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sectionFocal(el) {
    if (!el) return { x: 0.5, y: 0.45 };
    var r = el.getBoundingClientRect();
    return {
      x: Math.min(0.92, Math.max(0.08, (r.left + r.width * 0.5) / window.innerWidth)),
      y: Math.min(0.88, Math.max(0.12, (r.top + r.height * 0.4) / window.innerHeight)),
    };
  }

  function emitFocal(el) {
    var f = sectionFocal(el);
    document.dispatchEvent(new CustomEvent("forgeax:scene", {
      detail: { focalX: f.x, focalY: f.y },
    }));
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-immersive-section]"));
  var blendTicking = false;

  function sectionAnchors() {
    return sections
      .map(function (s) {
        return {
          el: s,
          id: s.id,
          y: s.offsetTop + s.offsetHeight * 0.38,
        };
      })
      .sort(function (a, b) { return a.y - b.y; });
  }

  function ease(t) {
    return t * t * (3 - 2 * t);
  }

  function updateScrollBlend() {
    blendTicking = false;
    if (reduced || !sections.length) return;

    var anchors = sectionAnchors();
    if (!anchors.length) return;

    var viewMid = window.scrollY + window.innerHeight * 0.44;
    var from = anchors[0];
    var to = anchors[0];
    var t = 0;

    if (viewMid <= anchors[0].y) {
      from = to = anchors[0];
    } else if (viewMid >= anchors[anchors.length - 1].y) {
      from = to = anchors[anchors.length - 1];
    } else {
      for (var i = 0; i < anchors.length - 1; i++) {
        if (viewMid >= anchors[i].y && viewMid <= anchors[i + 1].y) {
          from = anchors[i];
          to = anchors[i + 1];
          t = ease((viewMid - from.y) / (to.y - from.y));
          break;
        }
      }
    }

    var f1 = sectionFocal(from.el);
    var f2 = sectionFocal(to.el);
    var focalX = f1.x + (f2.x - f1.x) * t;
    var focalY = f1.y + (f2.y - f1.y) * t;
    var pageT = anchors.length > 1
      ? Math.min(1, Math.max(0, (viewMid - anchors[0].y) / (anchors[anchors.length - 1].y - anchors[0].y)))
      : 0;

    document.body.classList.toggle("is-hero-visible", from.id === "sec-hero" && t < 0.5);

    updateVisualGuide();

    document.dispatchEvent(new CustomEvent("forgeax:blend", {
      detail: { t: pageT, scrollT: t, focalX: focalX, focalY: focalY },
    }));
  }

  function requestBlend() {
    if (!blendTicking) {
      blendTicking = true;
      requestAnimationFrame(updateScrollBlend);
    }
  }

  var root = document.documentElement;

  function updateVisualGuide() {
    if (reduced) return;
    var hero = document.getElementById("sec-hero");
    if (!hero) return;

    var cta = hero.querySelector(".cta");
    var primary = cta && cta.querySelector(".btn.primary");
    var anchor = primary || cta || hero;
    var r = anchor.getBoundingClientRect();
    var hr = hero.getBoundingClientRect();
    var gx = ((r.left + r.width * 0.5) / window.innerWidth) * 100;
    var gy = ((r.top + r.height * 0.85) / window.innerHeight) * 100;

    var strength = 0;
    if (hr.bottom > 0 && hr.top < window.innerHeight) {
      var visible = Math.min(hr.bottom, window.innerHeight) - Math.max(hr.top, 0);
      strength = Math.min(1, Math.max(0, visible / (hr.height * 0.55)));
      if (window.scrollY > hr.height * 0.3) {
        strength *= Math.max(0, 1 - (window.scrollY - hr.height * 0.3) / (hr.height * 0.7));
      }
    }

    var stats = document.getElementById("sec-stats");
    if (stats && window.scrollY > hr.height * 0.15) {
      var sr = stats.getBoundingClientRect();
      if (sr.top < window.innerHeight * 0.92) {
        var blend = Math.min(1, Math.max(0, (window.scrollY - hr.height * 0.15) / (hr.height * 0.55)));
        var sx = ((sr.left + sr.width * 0.5) / window.innerWidth) * 100;
        var sy = ((sr.top + sr.height * 0.35) / window.innerHeight) * 100;
        gx = gx + (sx - gx) * blend;
        gy = gy + (sy - gy) * blend;
        strength = Math.max(strength * (1 - blend * 0.55), 0.12);
      }
    }

    var logo = hero.querySelector(".hero-logo");
    var axisTop = 18;
    var axisBottom = 72;
    if (logo) {
      var lr = logo.getBoundingClientRect();
      axisTop = Math.max(8, (lr.top / window.innerHeight) * 100 - 4);
      axisBottom = Math.min(88, gy + 4);
    }

    root.style.setProperty("--guide-x", gx.toFixed(2) + "%");
    root.style.setProperty("--guide-y", gy.toFixed(2) + "%");
    root.style.setProperty("--guide-strength", strength.toFixed(3));
    root.style.setProperty("--axis-top", axisTop.toFixed(2) + "%");
    root.style.setProperty("--axis-bottom", axisBottom.toFixed(2) + "%");
  }

  window.addEventListener("scroll", requestBlend, { passive: true });
  window.addEventListener("resize", requestBlend, { passive: true });

  var ambientOrbs = document.querySelectorAll(".ambient__orb");
  var ticking = false;
  function onParallax() {
    ticking = false;
    if (reduced) return;
    var sy = window.scrollY;
    ambientOrbs.forEach(function (orb, i) {
      orb.style.transform = "translate3d(" + (sy * (i % 2 ? -0.005 : 0.008)) + "px, " + (sy * 0.01) + "px, 0)";
    });
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onParallax);
    }
  }, { passive: true });

  var hero = document.getElementById("sec-hero");
  if (hero) {
    requestBlend();
    emitFocal(hero);
    updateVisualGuide();
  }
})();
