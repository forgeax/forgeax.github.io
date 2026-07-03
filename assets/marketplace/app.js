/* Marketplace interactions — single-language build.
 * Data (window.MK_DATA) and UI labels (window.MK_UI) are injected per-language at build
 * time, so there is no runtime i18n here: every string is already resolved for this page's
 * language. This file owns: kind/search filtering, the plugin detail modal (built from the
 * flat MK_DATA), and the looping agent idle avatars. */
(function () {
  var DATA = window.MK_DATA || {};
  var UI = window.MK_UI || {};
  var REPO_ROOT = "https://github.com/ForgeaX-Games/forgeax-marketplace/tree/main/plugins";

  // ── kind + search filter ──
  (function () {
    var tabs = [].slice.call(document.querySelectorAll(".mk-tab"));
    var items = [].slice.call(document.querySelectorAll(".mk-item"));
    var search = document.getElementById("mkSearch");
    var count = document.getElementById("mkCount");
    var empty = document.getElementById("mkEmpty");
    var kind = "all";
    var rowbreak = document.querySelector(".mk-rowbreak");
    function apply() {
      var q = (search && search.value || "").trim().toLowerCase();
      var n = 0;
      items.forEach(function (it) {
        var okKind = kind === "all" || it.getAttribute("data-kind") === kind;
        var okQ = !q || (it.getAttribute("data-search") || "").indexOf(q) >= 0 || it.textContent.toLowerCase().indexOf(q) >= 0;
        var show = okKind && okQ;
        it.classList.toggle("hide", !show);
        if (show) n++;
      });
      if (rowbreak) rowbreak.classList.toggle("hide", kind !== "all" && kind !== "agent");
      if (count) count.textContent = n + " / " + items.length;
      if (empty) empty.style.display = n ? "none" : "block";
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.classList.remove("active"); });
        t.classList.add("active");
        kind = t.getAttribute("data-kind");
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);
    apply();
  })();

  // ── detail modal ──
  (function () {
    var modal = document.getElementById("mkModal");
    if (!modal) return;
    function $(id) { return document.getElementById(id); }
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }

    // ── studio screenshot previews (runtime manifest + gallery + lightbox) ──
    var PREVIEW_CACHE_VERSION = "studio-previews-16";

    function resolvePreviewAssetUrl(path) {
      if (!path) return path;
      if (/^https?:\/\//i.test(path)) return path;
      var p = String(path);
      // Root-absolute paths must stay at site root (not /zh/assets/… on localized pages).
      if (p.charAt(0) === "/") return p;
      return new URL(p, window.location.origin + "/").href;
    }

    var PREVIEW_MANIFEST_URL =
      resolvePreviewAssetUrl("/assets/marketplace/previews/manifest.json") + "?v=" + PREVIEW_CACHE_VERSION;
    var _previewManifest = null;
    var _previewManifestPromise = null;

    function loadPreviewManifest() {
      if (_previewManifest) return Promise.resolve(_previewManifest);
      if (_previewManifestPromise) return _previewManifestPromise;
      _previewManifestPromise = fetch(PREVIEW_MANIFEST_URL)
        .then(function (r) { return r.ok ? r.json() : { previews: {}, slides: {}, aliases: {}, panelLabels: {} }; })
        .catch(function () { return { previews: {}, slides: {}, aliases: {}, panelLabels: {} }; })
        .then(function (data) {
          _previewManifest = data || { previews: {}, slides: {}, aliases: {}, panelLabels: {} };
          if (!_previewManifest.previews) _previewManifest.previews = {};
          if (!_previewManifest.slides) _previewManifest.slides = {};
          if (!_previewManifest.aliases) _previewManifest.aliases = {};
          if (!_previewManifest.panelLabels) _previewManifest.panelLabels = {};
          return _previewManifest;
        });
      return _previewManifestPromise;
    }

    // Resolve the slug whose previews to use: the item's own if present, else a manifest alias.
    // Agent cards never fall through to a linked workbench's shots.
    function resolvePreviewSlug(d) {
      if (!d || !d.slug) return "";
      var slug = d.slug;
      if (!_previewManifest) return slug;
      var previews = _previewManifest.previews || {};
      if (previews[slug] && previews[slug].length) return slug;
      if (d.kind === "agent") return slug;
      var aliases = _previewManifest.aliases || {};
      if (aliases[slug] && previews[aliases[slug]] && previews[aliases[slug]].length) {
        return aliases[slug];
      }
      return slug;
    }

    function getStudioPreviewImages(d) {
      var fromData = (d && d.previewImages) || [];
      if (fromData.length) return fromData;
      if (!_previewManifest) return [];
      var previews = _previewManifest.previews || {};
      var slug = resolvePreviewSlug(d);
      if (!slug) return [];
      if (previews[slug] && previews[slug].length) return previews[slug];
      if (d && d.kind === "agent") return [];
      return [];
    }

    function slideLabelText(slide, lang) {
      if (slide && slide.label && typeof slide.label === "object") {
        return slide.label[lang] || slide.label.en || slide.label.zh || "";
      }
      return slide && slide.label ? String(slide.label) : "";
    }

    function pickBilingual(obj, fallback) {
      if (!obj) return fallback || "";
      if (typeof obj === "string") return obj;
      var lang = document.documentElement.lang === "zh" ? "zh" : "en";
      return obj[lang] || obj.en || obj.zh || fallback || "";
    }

    function panelLabelForSlide(slide, d) {
      if (slide && slide.panelLabel) return pickBilingual(slide.panelLabel, "");
      var cat = slide && slide.category ? slide.category : "studio";
      if (cat === "output" || cat === "ui") return "UI";
      if (cat === "chat") return "CHAT";
      if (cat === "demo") return "DEMO";
      if (!d) return "";
      var slug = d.slug || "";
      var fromManifest = _previewManifest && _previewManifest.panelLabels && slug && _previewManifest.panelLabels[slug];
      if (fromManifest) return String(fromManifest).toUpperCase();
      var wb = d.caps && d.caps.workbench;
      return wb
        ? String(wb).toUpperCase()
        : String(slug).replace(/^wb-/, "").toUpperCase();
    }

    function mountStudioChromeFromSlide(d, slide) {
      var panel = $("mkmStudioPanel");
      if (!panel) return;
      if (!d) { panel.textContent = ""; return; }
      panel.textContent = panelLabelForSlide(slide, d);
    }

    // Structured slides from the manifest (image/video with poster + bilingual label); falls
    // back to a flat image list when a slug has no `slides` entry.
    function buildPreviewSlides(item, d) {
      var isAgent = d && d.kind === "agent";
      var slug = resolvePreviewSlug(d);
      var pageLang = document.documentElement.lang === "zh" ? "zh" : "en";
      var fromManifest = _previewManifest && _previewManifest.slides && slug && _previewManifest.slides[slug];
      if (fromManifest && fromManifest.length) {
        return fromManifest.map(function (slide, i) {
          var label = slideLabelText(slide, pageLang) || slideLabelText(slide, pageLang === "zh" ? "en" : "zh");
          return {
            type: slide.type || "image",
            src: resolvePreviewAssetUrl(slide.src),
            poster: slide.poster ? resolvePreviewAssetUrl(slide.poster) : "",
            category: slide.category || (isAgent ? "chat" : "studio"),
            panelLabel: slide.panelLabel || null,
            alt: label || ((isAgent ? "Agent chat preview " : "Studio preview ") + (i + 1)),
            label: label || ((isAgent ? "Chat " : "Studio ") + (i + 1)),
          };
        });
      }
      return getStudioPreviewImages(d).map(function (url, i) {
        return {
          type: "image",
          src: resolvePreviewAssetUrl(url),
          poster: "",
          category: isAgent ? "chat" : "studio",
          panelLabel: null,
          alt: (isAgent ? "Agent chat preview " : "Studio preview ") + (i + 1),
          label: (isAgent ? "Chat " : "Studio ") + (i + 1),
        };
      });
    }

    function openPreviewLightbox(src, alt) {
      var lb = $("mkPreviewLightbox");
      var img = $("mkPreviewLightboxImg");
      if (!lb || !img) return;
      img.src = src;
      img.alt = alt || "";
      lb.hidden = false;
      document.body.classList.add("mk-preview-lightbox-open");
      if (window.forgeaxRefreshIcons) window.forgeaxRefreshIcons(lb);
    }
    function closePreviewLightbox() {
      var lb = $("mkPreviewLightbox");
      var img = $("mkPreviewLightboxImg");
      if (!lb) return;
      lb.hidden = true;
      if (img) { img.src = ""; img.alt = ""; }
      document.body.classList.remove("mk-preview-lightbox-open");
    }

    function getActivePreviewIndex() {
      var frame = $("mkmPreviewFrame");
      if (!frame) return 0;
      var slides = frame.querySelectorAll(".mk-preview-slide");
      for (var i = 0; i < slides.length; i++) {
        if (slides[i].classList.contains("is-active")) return i;
      }
      return 0;
    }
    function setActivePreviewIndex(index) {
      var frame = $("mkmPreviewFrame");
      var track = $("mkmPreviewThumbsTrack");
      if (!frame) return;
      [].slice.call(frame.querySelectorAll(".mk-preview-slide")).forEach(function (sl, i) {
        var active = i === index;
        sl.classList.toggle("is-active", active);
        var vid = sl.querySelector("video");
        if (vid) {
          if (active) {
            try { vid.play(); } catch (e) { /* autoplay blocked */ }
          } else {
            vid.pause();
          }
        }
      });
      if (track) {
        [].slice.call(track.querySelectorAll(".mk-preview-thumb")).forEach(function (btn, i) {
          btn.classList.toggle("is-active", i === index);
          if (i === index) btn.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
        });
      }
      if (window._mkPreviewSlides && window._mkPreviewSlides[index]) {
        mountStudioChromeFromSlide(window._mkPreviewCardData, window._mkPreviewSlides[index]);
      }
      if (window._mkSyncPreviewNav) window._mkSyncPreviewNav();
    }
    function wirePreviewThumbNav(slideCount) {
      var prev = $("mkmPreviewPrev");
      var next = $("mkmPreviewNext");
      if (!prev || !next) return;
      var multi = slideCount >= 2;
      prev.hidden = !multi;
      next.hidden = !multi;
      if (!multi) { window._mkSyncPreviewNav = null; prev.onclick = null; next.onclick = null; return; }
      function syncNav() {
        var idx = getActivePreviewIndex();
        var atStart = idx <= 0;
        var atEnd = idx >= slideCount - 1;
        prev.disabled = atStart; next.disabled = atEnd;
        prev.classList.toggle("is-disabled", atStart);
        next.classList.toggle("is-disabled", atEnd);
      }
      prev.onclick = function () { var idx = getActivePreviewIndex(); if (idx > 0) setActivePreviewIndex(idx - 1); };
      next.onclick = function () { var idx = getActivePreviewIndex(); if (idx < slideCount - 1) setActivePreviewIndex(idx + 1); };
      window._mkSyncPreviewNav = syncNav;
      syncNav();
      requestAnimationFrame(syncNav);
    }

    function wrapHeroMedia(node, slide) {
      if (!node) return null;
      var wrap = document.createElement("div");
      wrap.className = "mk-preview-media";
      var bgSrc = slide.type === "video" ? (slide.poster || slide.src) : slide.src;
      if (bgSrc) {
        var bg = document.createElement("img");
        bg.className = "mk-preview-media-bg";
        bg.src = bgSrc;
        bg.alt = "";
        bg.setAttribute("aria-hidden", "true");
        bg.loading = "eager";
        wrap.appendChild(bg);
      }
      wrap.appendChild(node);
      return wrap;
    }

    function renderSlideContent(slide, isHero) {
      if (slide.type === "video") {
        var video = document.createElement("video");
        video.className = "mk-modal-preview-img" + (isHero ? " mk-modal-preview-img--hero" : "");
        video.src = slide.src;
        if (slide.poster) video.poster = slide.poster;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.controls = false;
        return isHero ? wrapHeroMedia(video, slide) : video;
      }
      if (slide.type === "image" || !slide.type) {
        var img = document.createElement("img");
        img.className = "mk-modal-preview-img" + (isHero ? " mk-modal-preview-img--hero is-zoomable" : "");
        img.src = slide.src;
        img.alt = slide.alt || "";
        img.loading = isHero ? "eager" : "lazy";
        if (isHero) {
          img.addEventListener("click", function (e) { e.stopPropagation(); openPreviewLightbox(slide.src, slide.alt || ""); });
        }
        return isHero ? wrapHeroMedia(img, slide) : img;
      }
      return null;
    }

    // Avatar cluster / single avatar / icon / placeholder, when there is no screenshot.
    function mountPreviewFallback(item, d, frame) {
      var kind = (d && d.kind) || (item && item.getAttribute("data-kind")) || "agent";

      var cluster = item && item.querySelector(".mk-avatar-cluster");
      if (cluster) {
        var c = document.createElement("div");
        c.className = "mk-avatar-cluster mk-modal-visual-cluster";
        [].slice.call(cluster.querySelectorAll(".mk-avatar")).forEach(function (slot) {
          var s = document.createElement("div");
          s.className = "mk-avatar";
          s.setAttribute("data-agent", slot.getAttribute("data-agent") || "");
          c.appendChild(s);
        });
        frame.appendChild(c);
        return;
      }

      var av = item && item.querySelector(".mk-avatar");
      if (av) {
        var slot = document.createElement("div");
        slot.className = "mk-avatar";
        slot.setAttribute("data-agent", av.getAttribute("data-agent") || "");
        frame.appendChild(slot);
        return;
      }

      if (d && window.forgeaxMountMarketplaceIcon) {
        var iconKind = d.kind === "cli-provider" ? "backend" : d.kind;
        if (["workbench", "skill", "backend", "tool", "binding", "model-binding"].indexOf(iconKind) >= 0) {
          var iconEl = document.createElement("div");
          iconEl.className = "mk-modal-icon ico";
          window.forgeaxMountMarketplaceIcon(iconEl, d.slug, iconKind === "model-binding" ? "binding" : iconKind);
          frame.appendChild(iconEl);
          return;
        }
      }

      var ph = document.createElement("div");
      ph.className = "mk-modal-preview-placeholder";
      var label = { agent: "PREVIEW", workbench: "WORKBENCH", skill: "SKILL", tool: "TOOL", backend: "CLI BACKEND", binding: "MODEL BINDING" };
      var lk = kind === "cli-provider" ? "backend" : (kind === "model-binding" ? "binding" : kind);
      ph.innerHTML = '<span class="mk-ph-label">' + (label[lk] || "PLUGIN") + '</span><span class="mk-ph-title">' + esc(UI.previewLive || "") + '</span>';
      frame.appendChild(ph);
    }

    function mountPreviewVisual(item, d, frame) {
      if (!frame) return;
      frame.innerHTML = "";
      var track = $("mkmPreviewThumbsTrack");
      var thumbsWrap = $("mkmPreviewThumbs");
      if (track) track.innerHTML = "";
      if (thumbsWrap) thumbsWrap.hidden = true;

      loadPreviewManifest().then(function () {
        // Guard against the modal being closed/reopened while the manifest was loading.
        if ($("mkmPreviewFrame") !== frame) return;
        var slides = buildPreviewSlides(item, d);
        window._mkPreviewSlides = slides;
        window._mkPreviewCardData = d;

        if (slides.length) {
          mountStudioChromeFromSlide(d, slides[0]);
          slides.forEach(function (slide, i) {
            var slideEl = document.createElement("div");
            slideEl.className = "mk-preview-slide" + (i === 0 ? " is-active" : "");
            var content = renderSlideContent(slide, true);
            if (content) slideEl.appendChild(content);
            frame.appendChild(slideEl);
            if (track) {
              var btn = document.createElement("button");
              btn.type = "button";
              btn.className = "mk-preview-thumb" + (i === 0 ? " is-active" : "");
              var thumbInner = renderSlideContent(slide, false);
              if (thumbInner) btn.appendChild(thumbInner);
              if (slide.label) btn.setAttribute("title", slide.label);
              btn.addEventListener("click", function () { setActivePreviewIndex(i); });
              track.appendChild(btn);
            }
          });
          if (track) track.classList.toggle("is-single", slides.length === 1);
          if (thumbsWrap) thumbsWrap.hidden = false;
          wirePreviewThumbNav(slides.length);
          return;
        }

        mountPreviewFallback(item, d, frame);
        [].slice.call(frame.querySelectorAll(".mk-avatar")).forEach(function (slot) {
          if (window.forgeaxEnsureAvatar) window.forgeaxEnsureAvatar(slot);
        });
        if (window.forgeaxRefreshIcons) window.forgeaxRefreshIcons();
      });
    }

    function mountStats(d) {
      var wrap = $("mkmStats");
      if (!wrap) return;
      wrap.innerHTML = "";
      if (!d) return;
      var c = d.caps || {};
      var toolPct = Math.min(100, (c.tools || 0) * 8);
      var skillPct = Math.min(100, (c.skills || 0) * 25);
      var stats = [
        { label: UI.statTools, value: String(c.tools || 0), pct: toolPct, ring: true },
        { label: UI.statSkills, value: String(c.skills || 0), pct: skillPct, ring: true },
        { label: UI.statVersion, value: "v" + esc(d.version), pct: 100, ring: false },
        { label: UI.statUpdated, value: esc(d.updated || d.created || "—"), pct: 72, ring: false },
      ];
      stats.forEach(function (s, i) {
        if (s.ring) {
          var dash = (s.pct * 1.005).toFixed(1);
          wrap.innerHTML += '<div class="mk-stat mk-stat--ring" style="animation-delay:' + (0.06 + i * 0.04) + 's">' +
            '<div class="mk-ring" style="--pct:' + s.pct + '">' +
            '<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="mk-ring-track" cx="20" cy="20" r="16"/>' +
            '<circle class="mk-ring-fill" cx="20" cy="20" r="16" pathLength="100" stroke-dasharray="' + dash + ' 100"/></svg>' +
            '<span class="mk-ring-val">' + s.value + '</span></div>' +
            '<div class="mk-stat-label">' + s.label + '</div></div>';
        } else {
          wrap.innerHTML += '<div class="mk-stat" style="animation-delay:' + (0.06 + i * 0.04) + 's">' +
            '<div class="mk-stat-label">' + s.label + '</div>' +
            '<div class="mk-stat-value">' + s.value + '</div>' +
            '<div class="mk-stat-bar"><i style="width:' + s.pct + '%"></i></div></div>';
        }
      });
    }

    function mountHudChrome(d, item) {
      var slug = (d && d.slug) || (item && item.getAttribute("data-slug")) || "—";
      var idShort = d ? String(d.id || slug).replace("@forgeax-plugin/", "") : slug;
      var idEl = $("mkmReadoutId");
      if (idEl) idEl.textContent = "ID · " + idShort.toUpperCase();
      var verEl = $("mkmReadoutVer");
      if (verEl) verEl.textContent = d ? "VER · v" + d.version : "VER · —";
      var kindEl = $("mkmReadoutKind");
      if (kindEl) kindEl.textContent = d ? String(d.kind || "plugin").replace("cli-provider", "CLI").replace("model-binding", "BIND").toUpperCase() : "PLUGIN";
    }

    function mountModels(d) {
      var wrap = $("mkmModelsWrap");
      var el = $("mkmModels");
      if (!wrap || !el) return;
      el.innerHTML = "";
      var stack = d && d.stack;
      if (!stack) { wrap.hidden = true; return; }

      var rows = [];
      if (stack.type === "agent") {
        if (stack.preferredCli) rows.push({ key: UI.mdlCliBackend, val: esc(stack.preferredCli) });
        if (stack.role) rows.push({ key: UI.mdlRole, val: esc(stack.role) });
        if (stack.defaultSkills && stack.defaultSkills.length) {
          rows.push({ key: UI.mdlDefaultSkills, val: stack.defaultSkills.map(esc).join(", ") });
        }
      } else if (stack.type === "cli") {
        rows.push({ key: UI.mdlProvider, val: esc(stack.provider) });
        if (stack.runner) rows.push({ key: UI.mdlRunner, val: '<span class="mono">' + esc(stack.runner) + '</span>' });
        if (stack.models && stack.models.length) {
          rows.push({
            key: UI.mdlModels,
            val: '<div class="mk-model-chips">' + stack.models.map(function (m) {
              return '<span class="mk-model-chip">' + esc(m) + '</span>';
            }).join("") + '</div>',
          });
        }
        var caps = stack.capabilities || {};
        var capKeys = Object.keys(caps).filter(function (k) { return caps[k]; });
        if (capKeys.length) {
          rows.push({ key: UI.mdlCaps, val: capKeys.map(esc).join(" · ") });
        }
      } else if (stack.type === "binding") {
        rows.push({ key: UI.mdlChannel, val: esc(stack.channel) });
        rows.push({ key: UI.mdlVendor, val: esc(stack.vendor) });
        if (stack.roles && stack.roles.length) {
          rows.push({ key: UI.mdlTiers, val: stack.roles.map(esc).join(" → ") });
        }
        if (stack.models && stack.models.length) {
          rows.push({
            key: UI.mdlModelPool,
            val: '<div class="mk-model-chips">' + stack.models.map(function (m) {
              return '<span class="mk-model-chip">' + esc(m) + '</span>';
            }).join("") + '</div>',
          });
        }
      }

      if (!rows.length) { wrap.hidden = true; return; }
      wrap.hidden = false;
      el.innerHTML = rows.map(function (r) {
        return '<div class="mk-model-row"><span class="mk-model-key">' + r.key + '</span><span class="mk-model-val">' + r.val + '</span></div>';
      }).join("");
    }

    function mountTutorial(d) {
      var wrap = $("mkmTutorialWrap");
      var el = $("mkmTutorial");
      if (!wrap || !el) return;
      el.innerHTML = "";
      var tut = (d && d.tutorial) || [];
      if (!tut.length) { wrap.hidden = true; return; }
      wrap.hidden = false;
      el.innerHTML = tut.map(function (step) { return "<li>" + esc(step) + "</li>"; }).join("");
    }

    function mountHistory(d) {
      var wrap = $("mkmHistoryWrap");
      var el = $("mkmHistory");
      if (!wrap || !el) return;
      el.innerHTML = "";
      var hist = (d && d.history) ? d.history.slice() : [];
      if (!hist.length) { wrap.hidden = true; return; }
      wrap.hidden = false;
      hist.sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
      el.innerHTML = hist.map(function (h) {
        var ver = h.version ? '<span class="mk-history-ver">v' + esc(h.version) + '</span>' : '';
        return '<li class="mk-history-row">' +
          '<div class="mk-history-head">' + ver + '<span class="mk-history-date">' + esc(h.date || "") + '</span></div>' +
          '<div class="mk-history-note">' + esc(h.note || "") + '</div>' +
        '</li>';
      }).join("");
    }

    // Studio viewport panel label: prefer the manifest's per-slug label, else the item's
    // workbench cap, else the slug (wb- prefix stripped).
    function mountStudioChrome(d) {
      var panel = $("mkmStudioPanel");
      if (!panel) return;
      if (!d) { panel.textContent = ""; return; }
      var slug = d.slug || "";
      var fromManifest = _previewManifest && _previewManifest.panelLabels && slug && _previewManifest.panelLabels[slug];
      if (fromManifest) { panel.textContent = String(fromManifest).toUpperCase(); return; }
      var wb = d.caps && d.caps.workbench;
      panel.textContent = wb
        ? String(wb).toUpperCase()
        : String(slug).replace(/^wb-/, "").toUpperCase();
    }

    // Live demo iframe when a plugin declares demoUrl; otherwise the screenshot/video gallery.
    function mountStudioDemo(item, d) {
      var embedWrap = $("mkmStudioEmbed");
      var frame = $("mkmPreviewFrame");
      if (embedWrap) { embedWrap.innerHTML = ""; embedWrap.hidden = true; }
      if (frame) { frame.hidden = false; mountPreviewVisual(item, d, frame); }

      var url = d && d.demoUrl;
      if (!url || !embedWrap) return;

      var iframe = document.createElement("iframe");
      iframe.className = "mk-studio-iframe";
      iframe.src = url;
      iframe.setAttribute("title", (d && d.name) ? String(d.name) : "Studio demo");
      iframe.loading = "lazy";
      iframe.setAttribute("allow", "fullscreen");
      embedWrap.appendChild(iframe);
      embedWrap.hidden = false;
      if (frame) frame.hidden = true;
      var thumbs = $("mkmPreviewThumbs");
      if (thumbs) thumbs.hidden = true;
    }

    function fill(d, fb, item) {
      var card = modal.querySelector(".mk-modal-card");
      var kind = (d && d.kind) || (item && item.getAttribute("data-kind")) || "agent";
      var kindAttr = kind === "cli-provider" ? "backend" : (kind === "model-binding" ? "binding" : kind);
      if (card) card.setAttribute("data-kind", kindAttr);
      modal.setAttribute("data-kind", kindAttr);

      $("mkmKind").textContent = d && d.kindLabel ? d.kindLabel : kindAttr.toUpperCase();
      $("mkmTitle").textContent = d ? d.name : (fb ? fb.name : "");

      loadPreviewManifest().then(function () {
        mountStudioDemo(item, d);
        mountStudioChrome(d);
      });
      mountStats(d);
      mountModels(d);
      mountTutorial(d);
      mountHistory(d);
      mountHudChrome(d, item);

      var meta = [];
      if (d && d.experimental) meta.push('<span class="mk-meta-exp">' + esc(UI.experimental) + "</span>");
      if (d) {
        meta.push('<span class="mono">' + esc(d.id) + '</span>');
        meta.push('<span>' + esc((UI.byAuthor || "") + d.author) + '</span>');
        if (d.created) meta.push('<span>' + esc((UI.created || "") + d.created) + '</span>');
      }
      $("mkmMeta").innerHTML = meta.join("");
      $("mkmDesc").textContent = d ? d.desc : (fb ? fb.desc : "");

      var caps = (d && d.capsList) || [];
      var capsWrap = $("mkmCapsWrap");
      if (caps.length) { capsWrap.hidden = false; $("mkmCaps").innerHTML = caps.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""); }
      else capsWrap.hidden = true;

      $("mkmKw").innerHTML = (d && d.keywords ? d.keywords : []).map(function (k) { return "<span>" + esc(k) + "</span>"; }).join("");

      var a = $("mkmRepo");
      a.className = "mk-modal-btn mk-modal-btn--ghost";
      if (d && d.repoUrl) { a.href = d.repoUrl; a.classList.remove("is-disabled"); a.removeAttribute("aria-disabled"); a.textContent = UI.actViewSource; }
      else if (d && d.repoUrl === null) { a.href = "#"; a.classList.add("is-disabled"); a.setAttribute("aria-disabled", "true"); a.textContent = UI.actNotOpen; }
      else { a.href = REPO_ROOT; a.classList.remove("is-disabled"); a.removeAttribute("aria-disabled"); a.textContent = UI.actBrowseAll; }

      var docs = $("mkmDocs");
      if (docs) {
        var docsUrl = d && d.repoUrl ? d.repoUrl.replace(/\/tree\/main\/plugins\/[^/]+$/, "/tree/main") : null;
        if (docsUrl) { docs.href = docsUrl; docs.hidden = false; docs.textContent = UI.actBrowseDocs; }
        else docs.hidden = true;
      }
    }

    var scrollLockY = 0;
    function lockScroll() {
      scrollLockY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = "fixed";
      document.body.style.top = "-" + scrollLockY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }
    function unlockScroll() {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollLockY);
    }

    function replayModalMotion() {
      [].slice.call(modal.querySelectorAll(
        ".mk-modal-anchor, .mk-hud-header, .mk-modal-hero, .mk-modal-main, .mk-hud-footer, .mk-modal-preview, .mk-halo-flow, .mk-hud-orbit, .mk-hud-radar, .mk-modal-head, .mk-modal-meta, #mkmDesc, .mk-kw, .mk-modal-actions, .mk-stat, .mk-modal-section, .mk-stat-bar i, .mk-modal-preview-frame > *"
      )).forEach(function (el) {
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = "";
      });
      var backdrop = modal.querySelector(".mk-modal-backdrop");
      if (backdrop) { backdrop.style.animation = "none"; void backdrop.offsetHeight; backdrop.style.animation = ""; }
      var closeBtn = modal.querySelector(".mk-modal-x");
      if (closeBtn) { closeBtn.style.animation = "none"; void closeBtn.offsetHeight; closeBtn.style.animation = ""; }
    }

    function cardFallback(item) {
      var h = item.querySelector("h3");
      var p = item.querySelector("p");
      var name = "";
      if (h) { var clone = h.cloneNode(true); var s = clone.querySelector(".slug"); if (s) s.remove(); name = clone.textContent.trim(); }
      return { name: name || item.getAttribute("data-slug"), desc: p ? p.textContent.trim() : "" };
    }

    function openCard(item) {
      var slug = item.getAttribute("data-slug");
      var d = DATA[slug];
      var fb = d ? null : cardFallback(item);
      fill(d, fb, item);
      modal.hidden = false;
      replayModalMotion();
      lockScroll();
      if (window.forgeaxRefreshIcons) window.forgeaxRefreshIcons();
      [].slice.call(modal.querySelectorAll(".mk-avatar")).forEach(function (slot) {
        if (window.forgeaxEnsureAvatar) window.forgeaxEnsureAvatar(slot);
      });
      var x = modal.querySelector(".mk-modal-x");
      if (x) { try { x.focus({ preventScroll: true }); } catch (e) { x.focus(); } }
    }
    function closeModal() {
      modal.hidden = true;
      unlockScroll();
      closePreviewLightbox();
      var frame = $("mkmPreviewFrame");
      if (frame) frame.innerHTML = "";
      var embed = $("mkmStudioEmbed");
      if (embed) { embed.innerHTML = ""; embed.hidden = true; }
      var track = $("mkmPreviewThumbsTrack");
      if (track) track.innerHTML = "";
      var thumbs = $("mkmPreviewThumbs");
      if (thumbs) thumbs.hidden = true;
    }

    [].slice.call(document.querySelectorAll(".mk-item")).forEach(function (it) {
      it.setAttribute("role", "button"); it.setAttribute("tabindex", "0");
      it.addEventListener("click", function () { openCard(it); });
      it.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCard(it); } });
    });
    modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]") || !e.target.closest(".mk-modal-card")) closeModal();
    });
    var lightbox = $("mkPreviewLightbox");
    if (lightbox) {
      lightbox.addEventListener("click", function (e) {
        if (e.target.closest("[data-close-lightbox]")) closePreviewLightbox();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var lb = $("mkPreviewLightbox");
      if (lb && !lb.hidden) { closePreviewLightbox(); return; }
      if (!modal.hidden) closeModal();
    });
    window.forgeaxLoadPreviewManifest = loadPreviewManifest;
  })();

  // ── agent idle avatars (locked to the "期待" idle state, looping) ──
  (function () {
    var BASE = "/assets/avatars";
    var IDLE_INDEX = 1; // 01.webm == 期待
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function srcFor(agent) { return BASE + "/" + agent + "/" + pad(IDLE_INDEX) + ".webm"; }

    function mkVideo() {
      var v = document.createElement("video");
      v.muted = true; v.playsInline = true; v.preload = "auto"; v.loop = true;
      v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
      return v;
    }
    function playIdle(slot) {
      var agent = slot.getAttribute("data-agent");
      if (!agent) return;
      var v = slot.querySelector("video");
      if (!v) return;
      v.classList.add("is-front");
      v.src = srcFor(agent);
      v.load();
      v.play().catch(function () {});
    }
    function ensureVideo(slot) {
      if (slot.querySelector("video")) return;
      slot.appendChild(mkVideo());
      playIdle(slot);
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { ensureVideo(e.target); io.unobserve(e.target); }
        });
      }, { rootMargin: "240px" });
      [].slice.call(document.querySelectorAll(".mk-avatar")).forEach(function (s) { io.observe(s); });
    } else {
      [].slice.call(document.querySelectorAll(".mk-avatar")).forEach(ensureVideo);
    }
    window.forgeaxEnsureAvatar = ensureVideo;
  })();
})();
