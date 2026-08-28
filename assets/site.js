/* ForgeaX site — client interactions only.
   Chrome (nav/footer/head) and i18n are now baked at build time by build-site.mjs: every
   page is single-language with static header/footer and its language in the URL + <html lang>.
   This file therefore carries NO runtime chrome injection and NO runtime translation — just
   progressive-enhancement behavior on the already-rendered DOM:
     · ambient background + forge particle field
     · page-head cinematics, icons, scroll/spotlight motion
     · nav layout (centering, sticky, mobile burger)
     · language menu (its items are <a> links to the other-language URLs — just navigate)
     · Ask-AI deep links + "copy page as Markdown" */
(function () {
  document.body.classList.add("forgeax-site");

  function getActiveLang() {
    var m = document.body.className.match(/\blang-([a-z]{2})\b/);
    return m ? m[1] : "en";
  }
  function curLang() { return getActiveLang(); }

  /* ── page head — title gradient + entrance only ──────────────────────── */
  (function enhancePageHeads() {
    document.querySelectorAll(".page-head").forEach(function (el) {
      if (el.classList.contains("page-head--ready")) return;
      el.classList.add("page-head--cinema", "page-head--ready");
      el.querySelectorAll(".page-head__glow, .page-head__kicker, .page-head__rule").forEach(function (n) {
        n.remove();
      });
      var title = el.querySelector("h1");
      if (title) title.classList.add("page-head__title");
      var lead = el.querySelector("p");
      if (lead) lead.classList.add("page-head__lead");
    });
    if (window.forgeaxInitPageHeadHero) window.forgeaxInitPageHeadHero();
  })();

  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = cb || null;
    document.body.appendChild(s);
  }

  /* ── global forge particle field (all pages) ─────────────────────────── */
  function detectForgePage() {
    // strip a leading /<lang>/ segment so localized pages match the same scene as English
    var p = location.pathname.replace(/index\.html$/, "").replace(/^\/[a-z]{2}(\/|$)/, "/");
    if (p === "/" || p === "") return "home";
    if (p.indexOf("/docs") === 0) return "docs";
    if (p.indexOf("/examples") === 0) return "examples";
    return "studio";
  }

  function ensureAmbient() {
    if (document.querySelector(".ambient")) return;
    var page = detectForgePage();
    var isHome = page === "home";
    var amb = document.createElement("div");
    amb.className = "ambient" + (isHome ? "" : " ambient--lite");
    amb.setAttribute("aria-hidden", "true");
    var html = '<div class="ambient__base"></div>';
    if (isHome) {
      html +=
        '<div class="ambient__morph"></div>' +
        '<div class="ambient__beam ambient__beam--top"></div>' +
        '<div class="ambient__beam ambient__beam--bottom"></div>' +
        '<div class="ambient__horizon"></div>' +
        '<div class="ambient__axis"></div>' +
        '<div class="ambient__pedestal"></div>' +
        '<div class="ambient__orb ambient__orb--lime"></div>' +
        '<div class="ambient__orb ambient__orb--teal"></div>';
    }
    html +=
      '<div class="ambient__grid"></div>' +
      '<div class="ambient__noise"></div>' +
      '<div class="ambient__vignette"></div>';
    amb.innerHTML = html;
    document.body.insertBefore(amb, document.body.firstChild);
  }

  function normalizeAmbient() {
    if (detectForgePage() === "home") return;
    document.querySelectorAll(".ambient").forEach(function (amb) {
      amb.classList.add("ambient--lite");
      amb.querySelectorAll(
        ".ambient__morph, .ambient__beam, .ambient__horizon, .ambient__axis, .ambient__pedestal, .ambient__orb"
      ).forEach(function (n) { n.remove(); });
    });
  }

  function ensureForgeCanvas() {
    if (document.getElementById("forgeParticles")) return;
    var old = document.getElementById("heroParticles");
    if (old) {
      old.id = "forgeParticles";
      old.className = "forge-particles";
      return;
    }
    var canvas = document.createElement("canvas");
    canvas.id = "forgeParticles";
    canvas.className = "forge-particles";
    canvas.setAttribute("aria-hidden", "true");
    var amb = document.querySelector(".ambient");
    if (amb && amb.parentNode) amb.parentNode.insertBefore(canvas, amb.nextSibling);
    else document.body.insertBefore(canvas, document.body.firstChild);
  }

  document.body.setAttribute("data-forge-page", detectForgePage());
  ensureAmbient();
  normalizeAmbient();
  if (detectForgePage() === "home" || document.body.classList.contains("has-immersive")) {
    ensureForgeCanvas();
  }
  if (!window.__forgeParticlesBoot && (detectForgePage() === "home" || document.body.classList.contains("has-immersive"))) {
    window.__forgeParticlesBoot = true;
    loadScript("/assets/forge-scenes.js?v=5e1dd588", function () {
      loadScript("/assets/forge-particles.js?v=4e6877b8", function () {
        loadScript("/assets/light-field.js?v=c9f175de");
      });
    });
  }
  if (document.querySelector(".page-head--cinema, .page-head")) {
    loadScript("/assets/page-head-hero.js?v=8ae68f6f", function () {
      if (window.forgeaxInitPageHeadHero) window.forgeaxInitPageHeadHero();
    });
  }

  if (document.querySelector(".manifest-line")) {
    loadScript("/assets/manifest-particles.js?v=351022b3");
  }

  if (!window.__forgeLucideBoot) {
    window.__forgeLucideBoot = true;
    loadScript("https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js", function () {
      loadScript("/assets/icons.js?v=4da212e7");
    });
  }
  if (document.querySelector(".reveal-on-scroll") || document.body.classList.contains("forgeax-site")) {
    loadScript("/assets/motion-scroll.js?v=e4bed4f7");
  }
  if (document.querySelector(".spotlight-section, .stat--display, .docs-chapter h2")) {
    loadScript("/assets/spotlight-surface.js?v=bda96c6c");
  }
  if (document.querySelector(".post-list")) {
    loadScript("/assets/blog-list-motion.js?v=2ba005cd");
  }

  /* About page reading tags — swap long-form panels, honor #hash from old blog URLs. */
  (function wireReadTags() {
    var root = document.querySelector("[data-read-tags]");
    if (!root) return;
    var tabs = [].slice.call(document.querySelectorAll("[data-read-tag]"));
    var panels = [].slice.call(document.querySelectorAll("[data-read-panel]"));
    if (!tabs.length || !panels.length) return;
    var wrap = document.querySelector(".about-read");

    var alias = {};
    panels.forEach(function (panel) {
      alias[panel.id] = panel.id;
      (panel.getAttribute("data-read-alias") || "").split(/\s+/).forEach(function (key) {
        if (key) alias[key] = panel.id;
      });
    });

    function activate(id) {
      var key = alias[id] || panels[0].id;
      tabs.forEach(function (tab) {
        var on = tab.getAttribute("data-read-tag") === key;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (panel) {
        var on = panel.id === key;
        panel.classList.toggle("is-active", on);
      });
      if (wrap) wrap.classList.add("is-ready");
    }

    function fromHash() {
      activate((location.hash || "").replace(/^#/, "") || panels[0].id);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function (event) {
        event.preventDefault();
        var id = tab.getAttribute("data-read-tag");
        if (history.replaceState) history.replaceState(null, "", "#" + id);
        else location.hash = id;
        activate(id);
      });
    });
    window.addEventListener("hashchange", fromHash);
    fromHash();
  })();

  /* desktop nav: center links in the slot between brand and actions (no overlap) */
  function layoutNavLinks() {
    var links = document.getElementById("navlinks");
    var nav = links && links.closest(".nav");
    if (!links || !nav) return;

    /* Must match the hamburger breakpoint in styles.css / nav-premium.css.
       If JS still pins --nav-links-x here, the open panel stays a centered
       desktop strip instead of a full-width dropdown. */
    if (window.matchMedia("(max-width: 1159px)").matches) {
      links.removeAttribute("style");
      links.removeAttribute("data-nav-layout");
      links.style.removeProperty("--nav-links-x");
      return;
    }
    links.classList.remove("open");

    var inner = nav.querySelector(".nav-inner") || nav;
    var innerBox = inner.getBoundingClientRect();
    var brand = nav.querySelector(".nav-brand");
    var navRight = nav.querySelector(".nav-right");
    var pad = 12;
    var brandRight = brand ? brand.getBoundingClientRect().right : innerBox.left + 100;
    var actionsLeft = navRight ? navRight.getBoundingClientRect().left : innerBox.right - 260;
    var slotLeft = brandRight - innerBox.left + pad;
    var slotRight = actionsLeft - innerBox.left - pad;
    if (slotRight <= slotLeft + 48) return;

    var slotCenter = (slotLeft + slotRight) / 2;
    var nudge = Math.min(18, (slotRight - slotLeft) * 0.06);
    var desiredCenter = slotCenter + nudge;
    var slotW = Math.max(0, Math.round(slotRight - slotLeft));
    var linkGap = getActiveLang() === "zh" ? 14 : 8;
    var base =
      "position:absolute;top:0;bottom:0;right:auto;" +
      "transform:translateX(-50%);display:flex;align-items:center;flex-wrap:nowrap;" +
      "gap:" + linkGap + "px;margin:0;width:max-content;" +
      "z-index:3;pointer-events:none";

    links.style.cssText = base;
    links.style.left = desiredCenter + "px";
    links.style.setProperty("--nav-links-x", desiredCenter + "px");

    while (links.getBoundingClientRect().width > slotW && linkGap > 2) {
      linkGap -= 1;
      links.style.gap = linkGap + "px";
    }

    var half = links.getBoundingClientRect().width / 2;
    var minCenter = slotLeft + half;
    var maxCenter = slotRight - half;
    var center = Math.max(minCenter, Math.min(maxCenter, desiredCenter));
    links.style.left = center + "px";
    links.style.setProperty("--nav-links-x", center + "px");
    links.dataset.navLayout = "forgeax-ui-146";
  }
  window.forgeaxLayoutNavLinks = layoutNavLinks;
  layoutNavLinks();
  requestAnimationFrame(layoutNavLinks);
  setTimeout(layoutNavLinks, 80);
  window.addEventListener("resize", layoutNavLinks);

  /* sticky nav: deepen background + shadow after scroll */
  var navEl = document.querySelector(".nav");
  if (navEl) {
    // RAF-throttled + state-guarded: only touch the class when it actually flips,
    // and at most once per frame (the raw scroll event can fire far more often).
    var navScrolled = null, navTicking = false;
    var syncNav = function () {
      navTicking = false;
      var s = window.scrollY > 8;
      if (s !== navScrolled) { navEl.classList.toggle("is-scrolled", s); navScrolled = s; }
    };
    syncNav();
    window.addEventListener("scroll", function () {
      if (!navTicking) { navTicking = true; requestAnimationFrame(syncNav); }
    }, { passive: true });
  }

  var burger = document.getElementById("burger");
  var burgerLinks = document.getElementById("navlinks");
  if (burger && burgerLinks) burger.addEventListener("click", function () { burgerLinks.classList.toggle("open"); });

  /* Desktop docs menu opens on hover; preserve native disclosure behavior on mobile. */
  document.querySelectorAll(".nav-docs-menu").forEach(function (menu) {
    var summary = menu.querySelector("summary");
    if (!summary) return;
    var closeTimer = null;

    function isDesktop() {
      return window.matchMedia("(min-width: 1160px)").matches;
    }
    function cancelClose() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
    }
    function openMenu() {
      if (!isDesktop()) return;
      cancelClose();
      menu.open = true;
    }
    function closeMenuSoon() {
      if (!isDesktop()) return;
      cancelClose();
      closeTimer = window.setTimeout(function () {
        menu.open = false;
        closeTimer = null;
      }, 220);
    }

    menu.addEventListener("mouseenter", openMenu);
    menu.addEventListener("mouseover", openMenu);
    menu.addEventListener("mouseleave", closeMenuSoon);
    summary.addEventListener("click", function (event) {
      if (isDesktop()) event.preventDefault();
    });
  });

  /* language menu — items are <a> links to the target-language URL; panel portals to
     <body> so main content cannot steal clicks. Selecting an item just navigates. */
  (function wireLangMenu() {
    var menu = document.getElementById("langMenu");
    var btn = document.getElementById("langMenuBtn");
    var list = document.getElementById("langMenuList");
    if (!menu || !btn || !list) return;

    function mountList() {
      if (list.parentNode !== document.body) {
        document.body.appendChild(list);
        list.classList.add("lang-menu-list--portal");
      }
    }

    function positionList() {
      var r = btn.getBoundingClientRect();
      list.style.position = "fixed";
      list.style.top = Math.round(r.bottom + 10) + "px";
      list.style.right = Math.round(window.innerWidth - r.right) + "px";
      list.style.left = "auto";
      list.style.minWidth = Math.max(150, Math.round(r.width)) + "px";
      list.style.zIndex = "10000";
    }

    function isMenuTarget(node) {
      return node && (menu.contains(node) || list.contains(node));
    }

    function closeMenu() {
      list.hidden = true;
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("lang-menu-open");
    }

    function openMenu() {
      mountList();
      positionList();
      list.hidden = false;
      menu.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      document.body.classList.add("lang-menu-open");
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    list.querySelectorAll(".lang-item").forEach(function (item) {
      item.addEventListener("click", function () { closeMenu(); });
    });

    document.addEventListener("mousedown", function (e) {
      if (menu.classList.contains("is-open") && !isMenuTarget(e.target)) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
    });
    window.addEventListener("resize", function () {
      if (menu.classList.contains("is-open")) positionList();
    });
    window.addEventListener("scroll", function () {
      if (menu.classList.contains("is-open")) closeMenu();
    }, { passive: true });
  })();

  /* ── OS-aware Studio download (WorkBuddy-style hover card) ───────────── */
  (function studioDownload() {
    var cfg = window.FX_EXPERIENCE || {};
    var downloads = cfg.downloads || {};
    var page = downloads.page || cfg.downloadUrl || "";

    function detectOs() {
      var ua = navigator.userAgent || "";
      if (/ipad|iphone|ipod/i.test(ua)) return "other";
      var plat = "";
      try { plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ""; } catch (e) { plat = navigator.platform || ""; }
      var hay = (plat + " " + ua).toLowerCase();
      if (hay.indexOf("win") !== -1) return "win";
      if (hay.indexOf("mac") !== -1) return "mac";
      if (hay.indexOf("linux") !== -1) return "linux";
      return "other";
    }

    function fileFor(os) {
      return (os === "mac" || os === "win" || os === "linux") ? (downloads[os] || "") : "";
    }

    function bindFile(el, url, isFile) {
      if (!el || !url) return;
      el.setAttribute("href", url);
      if (isFile) {
        el.removeAttribute("target");
        el.removeAttribute("rel");
      }
    }

    function paint(os) {
      var currentUrl = fileFor(os) || page;
      var currentIsFile = !!fileFor(os);
      Array.prototype.forEach.call(document.querySelectorAll("[data-download-primary]"), function (el) {
        bindFile(el, currentUrl, currentIsFile);
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-download]"), function (host) {
        Array.prototype.forEach.call(host.querySelectorAll("[data-download-opt]"), function (row) {
          var key = row.getAttribute("data-download-opt");
          var url = fileFor(key);
          var now = row.querySelector("[data-download-now]");
          if (url) {
            bindFile(row, url, true);
            row.hidden = false;
          } else {
            row.hidden = true;
          }
          var isCurrent = !!url && key === os;
          if (now) now.hidden = !isCurrent;
          row.classList.toggle("is-current", isCurrent);
        });
        var all = host.querySelector("[data-download-all]");
        if (all && page) all.setAttribute("href", page);
      });
    }

    paint(detectOs());

    Array.prototype.forEach.call(document.querySelectorAll("[data-download]"), function (host) {
      var hideTimer = 0;
      function open() {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; }
        host.classList.add("is-open");
      }
      function closeSoon() {
        hideTimer = setTimeout(function () { host.classList.remove("is-open"); }, 140);
      }
      host.addEventListener("mouseenter", open);
      host.addEventListener("mouseleave", closeSoon);
      host.addEventListener("focusin", open);
      host.addEventListener("focusout", function (e) {
        if (!host.contains(e.relatedTarget)) closeSoon();
      });
    });
  })();
})();
