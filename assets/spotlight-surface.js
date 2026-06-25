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

  document.querySelectorAll(SECTION_SEL).forEach(bindSection);
  document.querySelectorAll(STAT_SEL).forEach(bindStat);
})();
