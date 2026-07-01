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

  // Anchor positions come from offsetTop/offsetHeight, which change on layout
  // (resize / font load / content) — NOT on scroll. Reading them every scroll
  // frame forced a synchronous relayout (layout thrash). Measure once and cache;
  // re-measure only on resize / load.
  var cachedAnchors = [];
  function measureAnchors() {
    cachedAnchors = sections
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
    if (reduced || !sections.length) return;

    var anchors = cachedAnchors;
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

    document.dispatchEvent(new CustomEvent("forgeax:blend", {
      detail: { t: pageT, scrollT: t, focalX: focalX, focalY: focalY },
    }));
  }

  var ambientOrbs = document.querySelectorAll(".ambient__orb");
  function updateParallax() {
    if (reduced) return;
    var sy = window.scrollY;
    ambientOrbs.forEach(function (orb, i) {
      orb.style.transform = "translate3d(" + (sy * (i % 2 ? -0.005 : 0.008)) + "px, " + (sy * 0.01) + "px, 0)";
    });
  }

  // One scroll listener, one RAF per frame. Previously the section blend and the
  // orb parallax each had their own scroll handler + RAF; merged so a scroll tick
  // schedules a single frame that runs both.
  var scrollTicking = false;
  function onScrollFrame() {
    scrollTicking = false;
    updateScrollBlend();
    updateParallax();
  }
  function requestScroll() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", function () { measureAnchors(); requestScroll(); }, { passive: true });
  // Layout can shift after fonts / images finish loading — re-measure then.
  window.addEventListener("load", function () { measureAnchors(); requestScroll(); });

  measureAnchors();

  var hero = document.getElementById("sec-hero");
  if (hero) {
    requestScroll();
    emitFocal(hero);
  }
})();
