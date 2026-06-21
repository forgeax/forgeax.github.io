/* ForgeaX site — shared chrome (navbar + footer), mobile menu, i18n switch,
   and "copy page as Markdown". Nav/footer live here so they're edited once.
   All labels are bilingual (data-lang spans); the language switch flips a body class. */
(function () {
  var path = location.pathname.replace(/index\.html$/, "");
  function active(href) {
    if (href === "/") return path === "/" ? "active" : "";
    return path.indexOf(href) === 0 ? "active" : "";
  }
  function t(zh, en) { return '<span data-lang="zh">' + zh + '</span><span data-lang="en">' + en + "</span>"; }
  function curLang() { return document.body.classList.contains("lang-en") ? "en" : "zh"; }

  var LINKS = [
    ["/blog/", "更新", "Blog"],
    ["/docs/", "文档", "Docs"],
    ["/tutorials/", "教程", "Tutorials"],
    ["/examples/", "示例", "Examples"],
    ["/games/", "游戏", "Games"],
    ["/marketplace/", "市场", "Marketplace"],
    ["/about.html", "关于", "About"],
  ];
  var navLinks = LINKS.map(function (l) {
    return '<a href="' + l[0] + '" class="' + active(l[0]) + '">' + t(l[1], l[2]) + "</a>";
  }).join("");

  // i18n language registry — add a language by adding one entry here (+ later a JSON dict)
  var LANGS = [
    ["en", "English", "en"],
    ["zh", "简体中文", "zh-CN"],
    // more languages re-enable here when translated (ja/ko/fr/de/es/ru) — see assets/i18n/README.md
  ];
  var LANG_NAME = {}, LANG_HTML = {};
  LANGS.forEach(function (l) { LANG_NAME[l[0]] = l[1]; LANG_HTML[l[0]] = l[2]; });

  var langSwitch =
    '<details class="lang-menu" id="langMenu"><summary>🌐<span class="lbl" id="langLabel"> English</span></summary>' +
      '<div class="lang-menu-list">' +
        LANGS.map(function (l) { return '<button class="lang-item" data-l="' + l[0] + '">' + l[1] + "</button>"; }).join("") +
      "</div>" +
    "</details>";
  var askAi =
    '<details class="ask-ai" id="askAi"><summary>✦<span class="lbl"> ' + t("问 AI", "Ask AI") + "</span></summary>" +
      '<div class="ask-menu">' +
        '<a class="ask-item" id="ai-chatgpt" target="_blank" rel="noopener">' + t("在 ChatGPT 打开", "Open in ChatGPT") + "</a>" +
        '<a class="ask-item" id="ai-claude" target="_blank" rel="noopener">' + t("在 Claude 打开", "Open in Claude") + "</a>" +
        '<button class="ask-item" id="copyMd">' + t("复制本页 Markdown", "Copy page as Markdown") + "</button>" +
      "</div>" +
    "</details>";

  var header =
    '<nav class="nav"><div class="nav-inner">' +
      '<a class="nav-brand" href="/"><img src="/logo.svg?v=3" alt="ForgeaX"/><span>Forge<b>aX</b></span></a>' +
      '<button class="nav-burger" id="burger" aria-label="menu">☰</button>' +
      '<div class="nav-links" id="navlinks">' + navLinks + "</div>" +
      '<div class="nav-right">' + langSwitch + askAi +
        '<a class="nav-cta" href="https://github.com/ForgeaX-Games" target="_blank" rel="noopener">GitHub</a>' +
      "</div>" +
    "</div></nav>";

  var footer =
    '<footer class="foot"><div class="foot-inner">' +
      '<div class="foot-brand-col">' +
        '<div class="foot-brand"><img src="/logo.svg?v=3" alt=""/><span>Forge<b>aX</b></span></div>' +
        "<p>" + t("AI 原生的个人游戏工作室 —— 把想法变成可玩的游戏。开源,Apache License 2.0。",
                  "An AI-native personal game studio — turn ideas into playable games. Open source, Apache License 2.0.") + "</p>" +
      "</div>" +
      '<div class="col"><h4>' + t("站点", "Site") + "</h4>" +
        '<a href="/blog/">' + t("更新 / 观点", "Blog") + "</a>" +
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

  var burger = document.getElementById("burger");
  var links = document.getElementById("navlinks");
  if (burger && links) burger.addEventListener("click", function () { links.classList.toggle("open"); });

  window.setLang = function (l) {
    if (!LANG_NAME[l]) l = "en";                       // unknown → English
    var b = document.body;
    Array.prototype.slice.call(b.classList).forEach(function (c) { if (c.indexOf("lang-") === 0) b.classList.remove(c); });
    b.classList.add("lang-" + l);
    document.documentElement.lang = LANG_HTML[l] || "en";
    var lbl = document.getElementById("langLabel"); if (lbl) lbl.textContent = " " + LANG_NAME[l];
    var items = document.querySelectorAll(".lang-item");
    for (var i = 0; i < items.length; i++) items[i].classList.toggle("active", items[i].getAttribute("data-l") === l);
    // language-driven placeholders / titles (attributes can't use data-lang spans)
    var phs = document.querySelectorAll("[data-ph-en]");
    for (var j = 0; j < phs.length; j++) {
      var zh = phs[j].getAttribute("data-ph-zh"), en = phs[j].getAttribute("data-ph-en");
      phs[j].setAttribute("placeholder", (l === "zh" && zh) ? zh : en);
    }
    try { localStorage.setItem("forgeax-lang", l); } catch (e) {}
  };
  // wire dropdown items + close behavior
  var langMenu = document.getElementById("langMenu");
  if (langMenu) {
    langMenu.querySelectorAll(".lang-item").forEach(function (btn) {
      btn.addEventListener("click", function () { window.setLang(btn.getAttribute("data-l")); langMenu.open = false; });
    });
    document.addEventListener("click", function (e) { if (langMenu.open && !langMenu.contains(e.target)) langMenu.open = false; });
  }
  // initial language: saved → browser → English (only zh is translated today; others fall back to English)
  var saved = null;
  try { saved = localStorage.getItem("forgeax-lang"); } catch (e) {}
  if (!saved) {
    var nav = (navigator.language || "en").toLowerCase();
    saved = nav.indexOf("zh") === 0 ? "zh" : (LANG_NAME[nav.slice(0, 2)] ? nav.slice(0, 2) : "en");
  }
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
      b.innerHTML = '<span class="ic">✓</span><span class="lbl">' + (curLang() === "zh" ? "已复制" : "Copied") + "</span>";
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
