/* Localized cursor spotlight for .spotlight-section grids and .stat--display.
 * Section tracks mouse → each card gets --spot-x/y/on; only a radial border hotspot lights up. */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var SECTION_SEL = ".spotlight-section";
  var STAT_SEL = ".stat--display";
  var CARD_SEL = ".grid .card";

  function ensureCardLayers(card) {
    if (card.querySelector(".spotlight-surface__ring")) return;
    var fx = document.createElement("span");
    fx.className = "spotlight-surface__fx";
    fx.setAttribute("aria-hidden", "true");
    var ring = document.createElement("span");
    ring.className = "spotlight-surface__ring";
    ring.setAttribute("aria-hidden", "true");
    card.insertBefore(ring, card.firstChild);
    card.insertBefore(fx, card.firstChild);
    card.classList.add("spotlight-card");
  }

  function resetCard(card) {
    card.style.setProperty("--spot-on", "0");
    card.style.setProperty("--spot-x", "50%");
    card.style.setProperty("--spot-y", "50%");
  }

  function paintCards(cards, e) {
    var mx = e.clientX;
    var my = e.clientY;
    cards.forEach(function (card) {
      var rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var x = ((mx - rect.left) / rect.width) * 100;
      var y = ((my - rect.top) / rect.height) * 100;
      var cx = rect.left + rect.width * 0.5;
      var cy = rect.top + rect.height * 0.5;
      var dx = mx - cx;
      var dy = my - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var reach = Math.max(rect.width, rect.height) * 1.02;
      var t = Math.max(0, 1 - dist / reach);
      var on = t * t * (3 - 2 * t);
      card.style.setProperty("--spot-x", x.toFixed(2) + "%");
      card.style.setProperty("--spot-y", y.toFixed(2) + "%");
      card.style.setProperty("--spot-on", on.toFixed(3));
    });
  }

  function bindSection(section) {
    var cards = section.querySelectorAll(CARD_SEL);
    if (!cards.length) return;
    cards.forEach(ensureCardLayers);

    var ticking = false;
    var lastEv = null;

    function paint() {
      ticking = false;
      if (!lastEv) return;
      paintCards(cards, lastEv);
    }

    section.addEventListener("mousemove", function (e) {
      lastEv = e;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    });
    section.addEventListener("mouseleave", function () {
      lastEv = null;
      cards.forEach(resetCard);
    });
  }

  function bindStat(el) {
    if (el.querySelector(".spotlight-surface__fx")) return;
    var fx = document.createElement("span");
    fx.className = "spotlight-surface__fx";
    fx.setAttribute("aria-hidden", "true");
    var ring = document.createElement("span");
    ring.className = "spotlight-surface__ring";
    ring.setAttribute("aria-hidden", "true");
    el.insertBefore(ring, el.firstChild);
    el.insertBefore(fx, el.firstChild);
    el.classList.add("has-spotlight");

    var ticking = false;
    var lastEv = null;

    function paint() {
      ticking = false;
      if (!lastEv) return;
      var e = lastEv;
      var rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--spot-x", x.toFixed(2) + "%");
      el.style.setProperty("--spot-y", y.toFixed(2) + "%");
      el.style.setProperty("--spot-on", "1");
    }

    el.addEventListener("mouseenter", function () {
      el.style.setProperty("--spot-on", "1");
    });
    el.addEventListener("mousemove", function (e) {
      lastEv = e;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    });
    el.addEventListener("mouseleave", function () {
      lastEv = null;
      el.style.setProperty("--spot-on", "0");
      el.style.setProperty("--spot-x", "50%");
      el.style.setProperty("--spot-y", "50%");
    });
  }

  function pageLang() {
    if (window.forgeaxGetLang) return window.forgeaxGetLang();
    return document.body.classList.contains("lang-zh") ? "zh" : "en";
  }

  function ensureTitleGlyphs(h2) {
    var lang = pageLang();
    var title = h2.querySelector('[data-lang="' + lang + '"]');
    if (!title || title.dataset.charsSplit === "1") return;
    var text = title.textContent;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.className = "doc-ch-glyph";
      span.textContent = text.charAt(i);
      frag.appendChild(span);
    }
    title.textContent = "";
    title.appendChild(frag);
    title.dataset.charsSplit = "1";
  }

  function bindDocsTitle(el) {
    if (el.classList.contains("docs-title-spot")) return;
    el.classList.add("docs-title-spot");
    ensureTitleGlyphs(el);

    function titleNodes() {
      var nodes = [];
      var n = el.querySelector(".n");
      if (n) nodes.push({ el: n, isNum: true });
      var lang = pageLang();
      var t = el.querySelector('[data-lang="' + lang + '"]');
      if (t) {
        if (t.dataset.charsSplit !== "1") ensureTitleGlyphs(el);
        var glyphs = t.querySelectorAll(".doc-ch-glyph");
        if (glyphs.length) {
          glyphs.forEach(function (g) {
            nodes.push({ el: g, isNum: false });
          });
        } else {
          nodes.push({ el: t, isNum: false });
        }
      }
      return nodes;
    }

    var lastEv = null;
    var loopId = 0;

    function gauss(dist, sigma) {
      return Math.exp(-(dist * dist) / (2 * sigma * sigma));
    }

    function buildShadow(t, ox, oy, isNum) {
      if (t < 0.04) return "none";
      var core = Math.pow(t, 2.2);
      var rim = Math.pow(t, 1.25);
      var s = isNum ? 0.55 : 0.75;
      return [
        (ox * 0.1 * s).toFixed(2) + "px " + (oy * 0.1 * s).toFixed(2) + "px " + (0.5 + core * 2).toFixed(2) + "px rgba(255,255,255," + (core * 0.95).toFixed(3) + ")",
        (ox * 0.18 * s).toFixed(2) + "px " + (oy * 0.18 * s).toFixed(2) + "px " + (1.2 + rim * 4).toFixed(2) + "px rgba(220,255,120," + (rim * 0.62).toFixed(3) + ")",
        (ox * 0.28 * s).toFixed(2) + "px " + (oy * 0.28 * s).toFixed(2) + "px " + (2.5 + rim * 7).toFixed(2) + "px rgba(180,255,80," + (rim * 0.22).toFixed(3) + ")",
      ].join(", ");
    }

    function paintFrame() {
      loopId = 0;
      var nodes = titleNodes();
      var leaving = !lastEv;

      nodes.forEach(function (item) {
        var node = item.el;
        var state = node._docSpot || (node._docSpot = { t: 0, ox: 0, oy: 0, x: 50, y: 50 });
        var targetT = 0;
        var targetOx = 0;
        var targetOy = 0;
        var targetX = 50;
        var targetY = 50;

        if (lastEv) {
          var e = lastEv;
          var rect = node.getBoundingClientRect();
          if (rect.width && rect.height) {
            var cx = rect.left + rect.width * 0.5;
            var cy = rect.top + rect.height * 0.5;
            var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
            var sigma = Math.max(rect.width * 1.05, item.isNum ? 16 : 18);
            targetT = gauss(dist, sigma);
            targetX = ((e.clientX - rect.left) / rect.width) * 100;
            targetY = ((e.clientY - rect.top) / rect.height) * 100;
            targetOx = (targetX - 50) * 0.08;
            targetOy = (targetY - 50) * 0.08;
          }
        }

        var ease = leaving ? 0.24 : 0.38;
        state.t += (targetT - state.t) * ease;
        state.ox += (targetOx - state.ox) * ease;
        state.oy += (targetOy - state.oy) * ease;
        state.x += (targetX - state.x) * ease;
        state.y += (targetY - state.y) * ease;

        if (state.t < 0.04 && leaving) {
          node.style.removeProperty("text-shadow");
          node.style.removeProperty("--spot-x");
          node.style.removeProperty("--spot-y");
          node.style.removeProperty("--spot-i");
          return;
        }

        node.style.setProperty("--spot-x", state.x.toFixed(2));
        node.style.setProperty("--spot-y", state.y.toFixed(2));
        node.style.setProperty("--spot-i", state.t.toFixed(3));
        node.style.textShadow = buildShadow(state.t, state.ox, state.oy, item.isNum);
      });

      if (lastEv || nodes.some(function (item) { return (item.el._docSpot && item.el._docSpot.t > 0.045); })) {
        loopId = requestAnimationFrame(paintFrame);
      }
    }

    function kick() {
      if (!loopId) loopId = requestAnimationFrame(paintFrame);
    }

    el.addEventListener("mouseenter", function () {
      el.classList.add("is-spot-active");
      kick();
    });
    el.addEventListener("mousemove", function (e) {
      lastEv = e;
      kick();
    });
    el.addEventListener("mouseleave", function () {
      lastEv = null;
      el.classList.remove("is-spot-active");
      kick();
    });
  }

  document.querySelectorAll(SECTION_SEL).forEach(bindSection);
  document.querySelectorAll(STAT_SEL).forEach(bindStat);
  document.querySelectorAll(".docs-chapter h2").forEach(bindDocsTitle);
})();
