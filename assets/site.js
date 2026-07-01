/* ForgeaX site — shared chrome (navbar + footer), mobile menu, i18n switch,
   and "copy page as Markdown". Nav/footer live here so they're edited once.
   All labels are bilingual (data-lang spans); the language switch flips a body class. */
(function () {
  document.body.classList.add("forgeax-site");

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
    var p = location.pathname.replace(/index\.html$/, "");
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
    loadScript("/assets/forge-scenes.js?v=forgeax-ui-84", function () {
      loadScript("/assets/forge-particles.js?v=forgeax-ui-137", function () {
        loadScript("/assets/light-field.js?v=forgeax-ui-138");
      });
    });
  }
  if (document.querySelector(".page-head--cinema, .page-head")) {
    loadScript("/assets/page-head-hero.js?v=forgeax-ui-92", function () {
      if (window.forgeaxInitPageHeadHero) window.forgeaxInitPageHeadHero();
    });
  }

  if (document.querySelector(".manifest-line")) {
    loadScript("/assets/manifest-particles.js?v=forgeax-ui-106");
  }

  if (!window.__forgeLucideBoot) {
    window.__forgeLucideBoot = true;
    loadScript("https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js", function () {
      loadScript("/assets/icons.js?v=forgeax-ui-84");
    });
  }
  if (document.querySelector(".reveal-on-scroll") || document.body.classList.contains("forgeax-site")) {
    loadScript("/assets/motion-scroll.js?v=forgeax-ui-84");
  }
  if (document.querySelector(".spotlight-section, .stat--display, .docs-chapter h2")) {
    loadScript("/assets/spotlight-surface.js?v=forgeax-ui-136");
  }
  if (document.querySelector(".post-list")) {
    loadScript("/assets/blog-list-motion.js?v=forgeax-ui-84");
  }

  var path = location.pathname.replace(/index\.html$/, "");
  function active(href) {
    if (href === "/") return path === "/" ? "active" : "";
    return path.indexOf(href) === 0 ? "active" : "";
  }
  function t(zh, en) { return '<span data-lang="zh">' + zh + '</span><span data-lang="en">' + en + "</span>"; }

  var LINKS = [
    ["/docs/", "文档", "Docs"],
    ["/tutorials/", "教程", "Tutorials"],
    ["/examples/", "示例", "Examples"],
    ["/games/", "游戏", "Games"],
    ["/marketplace/", "市场", "Marketplace"],
    ["/blog/", "观点", "Blog"],
    ["/changelog/", "更新日志", "Changelog"],
    ["/about.html", "关于", "About"],
  ];
  var navLinks = LINKS.map(function (l) {
    return '<a href="' + l[0] + '" class="' + active(l[0]) + '">' + t(l[1], l[2]) + "</a>";
  }).join("");

  // i18n language registry — en/zh + six more; only en/zh have inline translations today
  var LANGS = [
    ["en", "English", "en"],
    ["zh", "中文", "zh-CN"],
    ["ja", "日本語", "ja"],
    ["ko", "한국어", "ko"],
    ["es", "Español", "es"],
    ["de", "Deutsch", "de"],
    ["fr", "Français", "fr"],
    ["pt", "Português", "pt"],
  ];
  var LANG_NAME = {}, LANG_HTML = {};
  LANGS.forEach(function (l) { LANG_NAME[l[0]] = l[1]; LANG_HTML[l[0]] = l[2]; });

  /* ── i18n dictionary (ja/ko/es/de/fr/pt) — keyed by hash of English HTML ── */
  var I18N_EXTRA = ["ja", "ko", "es", "de", "fr", "pt"];
  var I18N_VER = "forgeax-i18n-2";
  var I18N_CACHE = {};
  var I18N_UI = {
    copied: { zh: "已复制", en: "Copied", ja: "コピーしました", ko: "복사됨", es: "Copiado", de: "Kopiert", fr: "Copié", pt: "Copiado" },
    noMatches: { zh: "无匹配", en: "No matches", ja: "一致なし", ko: "일치 없음", es: "Sin coincidencias", de: "Keine Treffer", fr: "Aucune correspondance", pt: "Sem correspondências" },
  };

  function i18nHash(html) {
    var s = String(html).replace(/\s+/g, " ").trim();
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return "k" + (h >>> 0).toString(36);
  }
  function i18nEnsureIds(root) {
    (root || document).querySelectorAll('[data-lang="en"]').forEach(function (enEl) {
      if (!enEl.dataset.i18nKey) enEl.dataset.i18nKey = i18nHash(enEl.innerHTML);
    });
  }
  function i18nLoadDict(lang) {
    if (lang === "en" || lang === "zh") return Promise.resolve(null);
    if (I18N_CACHE[lang]) return Promise.resolve(I18N_CACHE[lang]);
    return fetch("/assets/i18n/dict/" + lang + ".json?v=" + I18N_VER)
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (d) { I18N_CACHE[lang] = d; return d; });
  }
  function i18nApplyDict(lang, dict, root) {
    if (!dict || lang === "en" || lang === "zh") return;
    (root || document).querySelectorAll('[data-lang="en"]').forEach(function (enEl) {
      if (!enEl.dataset.i18nKey) enEl.dataset.i18nKey = i18nHash(enEl.innerHTML);
      var key = enEl.dataset.i18nKey;
      var translated = dict[key] || enEl.innerHTML;
      var parent = enEl.parentNode;
      if (!parent) return;
      var sibling = parent.querySelector('[data-lang="' + lang + '"]');
      if (!sibling) {
        sibling = document.createElement("span");
        sibling.setAttribute("data-lang", lang);
        if (enEl.nextSibling) parent.insertBefore(sibling, enEl.nextSibling);
        else parent.appendChild(sibling);
      }
      sibling.innerHTML = translated;
    });
  }
  function i18nLookup(enHtml, lang) {
    if (!enHtml || lang === "en" || lang === "zh") return null;
    var dict = I18N_CACHE[lang];
    if (!dict) return null;
    return dict[i18nHash(enHtml)] || null;
  }
  function i18nApplyPlaceholders(l) {
    document.querySelectorAll("[data-ph-en]").forEach(function (el) {
      var zh = el.getAttribute("data-ph-zh"), en = el.getAttribute("data-ph-en");
      if (l === "zh" && zh) el.setAttribute("placeholder", zh);
      else if (l === "en") el.setAttribute("placeholder", en);
      else {
        var tr = i18nLookup(en, l);
        el.setAttribute("placeholder", tr || en);
      }
    });
  }
  window.forgeaxGetLang = getActiveLang;
  window.forgeaxI18nHash = i18nHash;
  window.forgeaxApplyI18n = function (root) {
    var l = getActiveLang();
    i18nEnsureIds(root || document);
    if (I18N_EXTRA.indexOf(l) >= 0 && I18N_CACHE[l]) i18nApplyDict(l, I18N_CACHE[l], root);
  };
  window.forgeaxL10n = function (obj) {
    var l = getActiveLang();
    if (!obj) return "";
    if (l === "zh" && obj.zh) return obj.zh;
    if (l === "en") return obj.en || obj.zh || "";
    if (I18N_EXTRA.indexOf(l) >= 0) {
      var en = obj.en || obj.zh || "";
      var tr = i18nLookup(en, l);
      return tr || en;
    }
    return obj.en || obj.zh || "";
  };
  window.forgeaxT = t;
  window.forgeaxUi = function (key) {
    var l = getActiveLang();
    var row = I18N_UI[key];
    return (row && (row[l] || row.en)) || "";
  };

  function getActiveLang() {
    var m = document.body.className.match(/\blang-([a-z]{2})\b/);
    if (m && LANG_NAME[m[1]]) return m[1];
    return "en";
  }
  function curLang() { return getActiveLang(); }

  var langSwitch =
    '<div class="lang-menu" id="langMenu">' +
      '<button type="button" class="lang-menu-trigger lang-menu-trigger--icon" id="langMenuBtn" aria-expanded="false" aria-haspopup="listbox" aria-label="Language">' +
        '<span class="ui-icon ui-icon--sm" aria-hidden="true"><i data-lucide="globe"></i></span>' +
      "</button>" +
      '<div class="lang-menu-list" id="langMenuList" role="listbox" hidden>' +
        LANGS.map(function (l) { return '<button type="button" class="lang-item" data-l="' + l[0] + '">' + l[1] + "</button>"; }).join("") +
      "</div>" +
    "</div>";
  var askAi =
    '<details class="ask-ai" id="askAi"><summary><span class="ui-icon ui-icon--sm" aria-hidden="true"><i data-lucide="sparkles"></i></span><span class="lbl"> ' + t("问 AI", "Ask AI") + "</span></summary>" +
      '<div class="ask-menu">' +
        '<a class="ask-item" id="ai-chatgpt" target="_blank" rel="noopener">' + t("在 ChatGPT 打开", "Open in ChatGPT") + "</a>" +
        '<a class="ask-item" id="ai-claude" target="_blank" rel="noopener">' + t("在 Claude 打开", "Open in Claude") + "</a>" +
        '<button class="ask-item" id="copyMd">' + t("复制本页 Markdown", "Copy page as Markdown") + "</button>" +
      "</div>" +
    "</details>";

  var header =
    '<nav class="nav">' +
      '<div class="nav-inner">' +
        '<a class="nav-brand" href="/"><img src="/logo.svg?v=3" alt="ForgeaX"/><span>Forge<b>aX</b></span></a>' +
        '<button class="nav-burger" id="burger" aria-label="menu"><span class="ui-icon" aria-hidden="true"><i data-lucide="menu"></i></span></button>' +
        '<div class="nav-links" id="navlinks">' + navLinks + '</div>' +
        '<div class="nav-right">' + langSwitch + askAi +
          '<a class="nav-cta" href="https://github.com/ForgeaX-Games" target="_blank" rel="noopener">GitHub</a>' +
        '</div>' +
      '</div>' +
    '</nav>';

  var footer =
    '<footer class="foot"><div class="foot-inner">' +
      '<div class="foot-brand-col">' +
        '<div class="foot-brand"><img src="/logo.svg?v=3" alt=""/><span>Forge<b>aX</b></span></div>' +
        "<p>" + t("AI 原生的个人游戏工作室 —— 把想法变成可玩的游戏。开源,Apache License 2.0。",
                  "An AI-native personal game studio — turn ideas into playable games. Open source, Apache License 2.0.") + "</p>" +
      "</div>" +
      '<div class="col"><h4>' + t("站点", "Site") + "</h4>" +
        '<a href="/changelog/">' + t("更新日志", "Changelog") + "</a>" +
        '<a href="/blog/">' + t("观点", "Blog") + "</a>" +
        '<a href="/docs/">' + t("开发文档", "Docs") + "</a>" +
        '<a href="/tutorials/">' + t("教程", "Tutorials") + "</a>" +
        '<a href="/examples/">' + t("引擎示例", "Examples") + "</a>" +
        '<a href="/games/">' + t("游戏", "Games") + "</a>" +
        '<a href="/marketplace/">' + t("插件市场", "Marketplace") + "</a>" +
      "</div>" +
      '<div class="col"><h4>' + t("项目", "Project") + "</h4>" +
        '<a href="https://github.com/ForgeaX-Games" target="_blank" rel="noopener">' + t("GitHub 组织", "GitHub org") + "</a>" +
        '<a href="/about.html">' + t("关于 / 愿景", "About") + "</a>" +
        '<a href="/license.html">' + t("版权说明", "License") + "</a>" +
      "</div>" +
    "</div>" +
    '<div class="foot-bottom">Apache License 2.0 · © 2026 ForgeaX · github.com/ForgeaX-Games</div>' +
    "</footer>";

  var h = document.getElementById("site-header");
  var f = document.getElementById("site-footer");
  if (h) h.innerHTML = header;
  if (f) f.innerHTML = footer;
  if (typeof window.forgeaxRefreshIcons === "function") window.forgeaxRefreshIcons();

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

    var navBox = nav.getBoundingClientRect();
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
  var navEl = h && h.querySelector(".nav");
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
  var links = document.getElementById("navlinks");
  if (burger && links) burger.addEventListener("click", function () { links.classList.toggle("open"); });

  window.setLang = function (l) {
    if (!LANG_NAME[l]) l = "en";
    var b = document.body;
    Array.prototype.slice.call(b.classList).forEach(function (c) { if (c.indexOf("lang-") === 0) b.classList.remove(c); });
    b.classList.add("lang-" + l);
    document.documentElement.lang = LANG_HTML[l] || "en";
    var langBtn = document.getElementById("langMenuBtn");
    if (langBtn) langBtn.setAttribute("aria-label", LANG_NAME[l]);
    var items = document.querySelectorAll(".lang-item");
    for (var i = 0; i < items.length; i++) items[i].classList.toggle("active", items[i].getAttribute("data-l") === l);
    i18nApplyPlaceholders(l);
    try { localStorage.setItem("forgeax-lang", l); } catch (e) {}

    function finishLang() {
      b.classList.remove("i18n-loading");
      document.dispatchEvent(new CustomEvent("forgeax:langchange", { detail: { lang: l } }));
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          window.forgeaxLayoutNavLinks();
          setTimeout(window.forgeaxLayoutNavLinks, 120);
        });
      });
    }

    if (I18N_EXTRA.indexOf(l) >= 0) {
      b.classList.add("i18n-loading");
      i18nEnsureIds(document);
      i18nLoadDict(l).then(function (dict) {
        i18nApplyDict(l, dict, document);
        finishLang();
      });
    } else {
      finishLang();
    }
  };
  // wire language menu — panel portals to <body> so main content cannot steal clicks
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
      item.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.setLang(item.getAttribute("data-l"));
        closeMenu();
      });
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
  // initial language: saved → browser locale → English
  var saved = null;
  try { saved = localStorage.getItem("forgeax-lang"); } catch (e) {}
  if (!LANG_NAME[saved]) saved = null;
  if (!saved) {
    var nav = (navigator.language || "en").toLowerCase();
    saved = nav.indexOf("zh") === 0 ? "zh" : (LANG_NAME[nav.slice(0, 2)] ? nav.slice(0, 2) : "en");
  }
  i18nEnsureIds(document);
  window.setLang(saved);

  /* ── copy page as Markdown ──────────────────────────────────────────────
     Walks <main>, emits Markdown for the ACTIVE language only (data-lang). */
  function visible(el) {
    var d = el.getAttribute && el.getAttribute("data-lang");
    return !d || d === curLang();
  }
  function inlineMd(el) {
    var out = "";
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 3) { out += n.textContent.replace(/\s+/g, " "); return; }
      if (n.nodeType !== 1 || !visible(n)) return;
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
      if (n.nodeType !== 1 || !visible(n)) return;
      var tag = n.tagName.toLowerCase();
      var cls = (typeof n.className === "string") ? n.className : "";
      if (tag === "script" || tag === "style" || tag === "svg" || cls.indexOf("md-copy") >= 0) return;
      switch (tag) {
        case "h1": md += "# " + inlineMd(n).trim() + "\n\n"; break;
        case "h2": md += "## " + inlineMd(n).trim() + "\n\n"; break;
        case "h3": md += "### " + inlineMd(n).trim() + "\n\n"; break;
        case "h4": md += "#### " + inlineMd(n).trim() + "\n\n"; break;
        case "p": { var p = inlineMd(n).trim(); if (p) md += p + "\n\n"; } break;
        case "ul": n.querySelectorAll(":scope > li").forEach(function (li) { if (visible(li)) md += "- " + inlineMd(li).trim() + "\n"; }); md += "\n"; break;
        case "ol": var i = 1; n.querySelectorAll(":scope > li").forEach(function (li) { if (visible(li)) md += (i++) + ". " + inlineMd(li).trim() + "\n"; }); md += "\n"; break;
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
      b.innerHTML = '<span class="ui-icon ui-icon--sm" aria-hidden="true"><i data-lucide="check"></i></span><span class="lbl">' + (window.forgeaxUi ? window.forgeaxUi("copied") : (curLang() === "zh" ? "已复制" : "Copied")) + "</span>";
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

  /* ── AI/SEO: ensure canonical + machine-readable markdown alternate on every page ── */
  var head = document.head;
  if (head && !document.querySelector('link[rel="canonical"]')) {
    var c = document.createElement("link"); c.rel = "canonical"; c.href = location.origin + location.pathname; head.appendChild(c);
  }
  if (head && !document.querySelector('link[rel="alternate"][type="text/markdown"]')) {
    var a = document.createElement("link"); a.rel = "alternate"; a.type = "text/markdown"; a.href = "/llms.txt"; a.title = "llms.txt"; head.appendChild(a);
  }
})();
