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
    loadScript("/assets/spotlight-surface.js?v=d6580d19");
  }
  if (document.querySelector(".post-list")) {
    loadScript("/assets/blog-list-motion.js?v=2ba005cd");
  }

  /* desktop nav: center links in the slot between brand and actions (no overlap) */
  function layoutNavLinks() {
    var links = document.getElementById("navlinks");
    var nav = links && links.closest(".nav");
    if (!links || !nav) return;

    if (window.matchMedia("(max-width: 820px)").matches) {
      links.removeAttribute("style");
      links.removeAttribute("data-nav-layout");
      links.style.removeProperty("--nav-links-x");
      return;
    }

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

  /* ── copy page as Markdown ──────────────────────────────────────────────
     Walks <main> and emits Markdown. Pages are single-language, so no data-lang filtering. */
  function inlineMd(el) {
    var out = "";
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 3) { out += n.textContent.replace(/\s+/g, " "); return; }
      if (n.nodeType !== 1) return;
      var tag = n.tagName.toLowerCase();
      if (tag === "a") out += "[" + inlineMd(n).trim() + "](" + (n.getAttribute("href") || "") + ")";
      else if (tag === "strong" || tag === "b") out += "**" + inlineMd(n).trim() + "**";
      else if (tag === "em" || tag === "i") out += "*" + inlineMd(n).trim() + "*";
      else if (tag === "code") out += "`" + n.textContent.trim() + "`";
      else if (tag === "br") out += "\n";
      else out += inlineMd(n);
    });
    return out;
  }
  function blockMd(root) {
    var md = "";
    root.childNodes.forEach(function (n) {
      if (n.nodeType !== 1) return;
      var tag = n.tagName.toLowerCase();
      var cls = (typeof n.className === "string") ? n.className : "";
      if (tag === "script" || tag === "style" || tag === "svg" || cls.indexOf("md-copy") >= 0) return;
      switch (tag) {
        case "h1": md += "# " + inlineMd(n).trim() + "\n\n"; break;
        case "h2": md += "## " + inlineMd(n).trim() + "\n\n"; break;
        case "h3": md += "### " + inlineMd(n).trim() + "\n\n"; break;
        case "h4": md += "#### " + inlineMd(n).trim() + "\n\n"; break;
        case "p": { var p = inlineMd(n).trim(); if (p) md += p + "\n\n"; } break;
        case "ul": n.querySelectorAll(":scope > li").forEach(function (li) { md += "- " + inlineMd(li).trim() + "\n"; }); md += "\n"; break;
        case "ol": var i = 1; n.querySelectorAll(":scope > li").forEach(function (li) { md += (i++) + ". " + inlineMd(li).trim() + "\n"; }); md += "\n"; break;
        case "blockquote": md += "> " + inlineMd(n).trim().replace(/\n+/g, "\n> ") + "\n\n"; break;
        case "pre": md += "```\n" + n.textContent.replace(/\s+$/, "") + "\n```\n\n"; break;
        case "hr": md += "---\n\n"; break;
        default: md += blockMd(n);
      }
    });
    return md;
  }
  function pageMarkdown() {
    var main = document.querySelector("main");
    var body = main ? blockMd(main).replace(/\n{3,}/g, "\n\n").trim() : document.title;
    return body + "\n\n— " + location.href + "\n";
  }
  var copyBtn = document.getElementById("copyMd");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    var md = pageMarkdown();
    function done() {
      var b = document.getElementById("copyMd"); if (!b) return;
      var old = b.innerHTML;
      b.innerHTML = '<span class="ui-icon ui-icon--sm" aria-hidden="true"><i data-lucide="check"></i></span><span class="lbl">' + (curLang() === "zh" ? "已复制" : "Copied") + "</span>";
      if (typeof window.forgeaxRefreshIcons === "function") window.forgeaxRefreshIcons();
      b.classList.add("ok");
      setTimeout(function () { b.innerHTML = old; b.classList.remove("ok"); }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = md;
      ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta);
      ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done();
    }
  });

  /* Ask-AI deep links → point at the canonical public page (not localhost) */
  (function () {
    var pageUrl = "https://forgeax.github.io" + location.pathname.replace(/index\.html$/, "");
    var q = encodeURIComponent("Read this ForgeaX page and help me understand and use it: " + pageUrl);
    var gpt = document.getElementById("ai-chatgpt");
    var cla = document.getElementById("ai-claude");
    if (gpt) gpt.href = "https://chatgpt.com/?q=" + q;
    if (cla) cla.href = "https://claude.ai/new?q=" + q;
    var ask = document.getElementById("askAi");
    if (ask) {
      ask.addEventListener("click", function (e) { if (e.target.closest("a")) ask.open = false; });
      document.addEventListener("click", function (e) { if (ask.open && !ask.contains(e.target)) ask.open = false; });
    }
  })();
})();
