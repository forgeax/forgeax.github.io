/* Homepage v2 — closed-loop demo player + inline Idea Lab agent.
 * All user-facing copy lives in the template (i18n dictionaries); this file only
 * toggles state, so nothing here needs translating. */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Set by the demo player, read by the inline Idea Lab: while the agent owns the
  // hero frame the demo must stay parked, including across scroll and tab changes.
  var loopControl = null;

  /* ── §1 closed-loop demo ───────────────────────────────────────────────── */
  (function loopDemo() {
    var root = document.querySelector("[data-loop]");
    if (!root) return;

    var steps = Array.prototype.slice.call(root.querySelectorAll("[data-loop-step]"));
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-loop-panel]"));
    var video = root.querySelector("[data-loop-video]");
    var playBtn = root.querySelector("[data-loop-play]");
    if (!steps.length || steps.length !== panels.length) return;

    var DWELL = 4600;
    var index = 0;
    var startedAt = 0;
    var elapsed = 0;
    var raf = 0;
    var paused = true;
    // Parked by the inline Idea Lab. Distinct from `paused`, which the observer and
    // the visibility handler own — those must not un-park a hidden demo.
    var suspended = false;
    // Advance on <video> ended only when steps point at distinct clips. Shared
    // placeholders keep the fixed dwell timer so a long reel doesn't stall the rail.
    var advanceOnEnded = false;

    function panelSrc(panel) {
      return (panel && panel.getAttribute("data-loop-src")) || "";
    }

    function refreshAdvanceMode() {
      var srcs = panels.map(panelSrc).filter(Boolean);
      advanceOnEnded = srcs.length === panels.length && new Set(srcs).size > 1;
      if (video) video.loop = !advanceOnEnded;
    }

    function setPlayBtn(show) {
      if (!playBtn) return;
      if (show) playBtn.removeAttribute("hidden");
      else playBtn.setAttribute("hidden", "");
    }

    function syncVideo(restartClip) {
      if (!video) return;
      var src = panelSrc(panels[index]);
      if (!src) return;
      var abs = new URL(src, location.href).href;
      var needsLoad = video.currentSrc !== abs && video.getAttribute("src") !== src;
      if (needsLoad) {
        video.src = src;
        video.load();
      } else if (restartClip && advanceOnEnded) {
        try { video.currentTime = 0; } catch (e) { /* ignore seek-before-ready */ }
      }
      if (!paused && !reduced) {
        var p = video.play();
        if (p && p.catch) p.catch(function () { setPlayBtn(true); });
        else setPlayBtn(false);
      } else {
        video.pause();
      }
    }

    function select(i, fromUser) {
      index = ((i % steps.length) + steps.length) % steps.length;
      steps.forEach(function (s, n) {
        s.setAttribute("aria-selected", n === index ? "true" : "false");
        s.setAttribute("tabindex", n === index ? "0" : "-1");
        s.classList.toggle("is-done", n < index);
      });
      panels.forEach(function (p, n) {
        p.classList.toggle("is-active", n === index);
        p.hidden = n !== index;
      });
      elapsed = 0;
      startedAt = performance.now();
      syncVideo(true);
      if (fromUser) restart();
    }

    function paint(now) {
      raf = 0;
      if (paused || advanceOnEnded) return;
      var t = elapsed + (now - startedAt);
      if (t >= DWELL) {
        select(index + 1);
        if (!paused && !advanceOnEnded) raf = requestAnimationFrame(paint);
        return;
      }
      raf = requestAnimationFrame(paint);
    }

    function play() {
      if (reduced || suspended || !paused) return;
      paused = false;
      root.classList.remove("is-paused");
      startedAt = performance.now();
      syncVideo(false);
      if (!advanceOnEnded && !raf) raf = requestAnimationFrame(paint);
    }

    function pause() {
      if (paused) return;
      if (!advanceOnEnded) elapsed += performance.now() - startedAt;
      paused = true;
      root.classList.add("is-paused");
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (video) video.pause();
    }

    function restart() {
      elapsed = 0;
      startedAt = performance.now();
    }

    steps.forEach(function (s, n) {
      s.addEventListener("click", function () { select(n, true); });
      s.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : (e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0);
        if (!d) return;
        e.preventDefault();
        select(index + d, true);
        steps[index].focus();
      });
    });

    if (video) {
      refreshAdvanceMode();
      video.addEventListener("ended", function () {
        if (!advanceOnEnded || paused || reduced) return;
        select(index + 1);
      });
      video.addEventListener("play", function () { setPlayBtn(false); });
      video.addEventListener("pause", function () {
        if (paused || reduced) setPlayBtn(true);
      });
      if (playBtn) {
        playBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          play();
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        });
      }
    }

    // With a real clip in the stage, hover-to-pause would freeze the footage the
    // visitor is trying to watch. Keep focus/visibility gating only.
    if (!video) {
      root.addEventListener("mouseenter", pause);
      root.addEventListener("mouseleave", play);
      root.addEventListener("focusin", pause);
      root.addEventListener("focusout", function (e) {
        if (!root.contains(e.relatedTarget)) play();
      });
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause(); else play();
    });

    loopControl = {
      suspend: function () { suspended = true; pause(); },
      resume: function () { suspended = false; play(); }
    };

    select(0);
    if (reduced) {
      root.classList.add("is-paused");
      setPlayBtn(true);
      return;
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) play(); else pause(); });
      }, { threshold: 0.25 }).observe(root);
    } else {
      play();
    }
  })();

  /* ── scroll cue ────────────────────────────────────────────────────────────
   * The cue is pinned to the viewport instead of the end of the hero: hero height
   * varies a lot by locale (de/fr/pt copy runs long), so an in-flow cue would end
   * up straddling or below the fold. Fades out once the hero leaves the screen. */
  (function scrollCue() {
    var cue = document.querySelector(".scroll-cue");
    var hero = document.getElementById("sec-hero");
    if (!cue || !hero) return;

    if (!("IntersectionObserver" in window)) {
      document.body.classList.add("is-hero-onscreen");
      return;
    }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        document.body.classList.toggle("is-hero-onscreen", en.intersectionRatio > 0.5);
      });
    }, { threshold: [0, 0.5, 1] }).observe(hero);
  })();

  /* ── Idea Lab, inline in the hero frame ─────────────────────────────────────
   * One frame, three states: the closed-loop demo, the agent that replaces it on
   * the secondary CTA, and the brief that takes the frame over once the agent has
   * actually produced one. The brief's only forward move is the client download.
   *
   *   demo ──click CTA──▶ chat ──forgeax:gdd──▶ brief
   *     ◀──── back ────────┴───── back ──────────┘
   *
   * The chat iframe is created once and only ever hidden, so stepping back to the
   * demo or the conversation never restarts the session. */
  (function ideaLabInline() {
    var panel = document.getElementById("fxIdeaLab");
    if (!panel) return;

    var cfg = window.FX_EXPERIENCE || {};
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-open-experience]"));
    var frame = panel.querySelector("[data-fxi-frame]");
    var boot = panel.querySelector("[data-fxi-boot]");
    var waitlist = panel.querySelector("[data-fxi-waitlist]");
    var limitNote = panel.querySelector("[data-fxi-limit]");
    var gddOut = panel.querySelector("[data-fxi-gdd]");
    var copyBtn = panel.querySelector("[data-fxi-copy]");
    var embedded = !!(cfg.chatUrl && frame);
    // If the embed never says hello, the visitor is staring at a blank rectangle — worse than
    // the honest "opening soon" state. Fall back once this window passes without a ready ping.
    var READY_TIMEOUT_MS = 20000;
    var readyTimer = 0;
    var ready = false;
    // Only the configured chat origin may fill the brief. Falling back to the
    // chatUrl origin keeps chatOrigin optional without ever accepting "any origin".
    var chatOrigin = "";
    try {
      chatOrigin = cfg.chatOrigin || (cfg.chatUrl ? new URL(cfg.chatUrl, location.href).origin : "");
    } catch (e) { chatOrigin = ""; }
    var gddMarkdown = "";
    var lastFocus = null;

    // Kill switch (empty chatUrl): the frame never loads, so the state the CTA
    // opens is the honest "opening soon" one plus the download.
    if (!embedded) {
      if (boot) boot.hidden = true;
      if (waitlist) waitlist.hidden = false;
      if (frame) frame.hidden = true;
    }

    // chat-questioner resolves the parent via ?parent= (preferred) or document.referrer.
    // Writing parent explicitly survives referrer stripping / cross-site policies.
    function buildChatSrc() {
      try {
        var url = new URL(cfg.chatUrl, location.href);
        if (!url.searchParams.get("parent")) {
          url.searchParams.set("parent", location.origin);
        }
        return url.toString();
      } catch (e) {
        return cfg.chatUrl;
      }
    }

    function fallBackToWaitlist() {
      readyTimer = 0;
      if (ready) return;
      if (boot) boot.hidden = true;
      if (frame) frame.hidden = true;
      if (waitlist) waitlist.hidden = false;
    }

    function setStage(next) {
      if (panel.getAttribute("data-stage") === next) return;
      panel.setAttribute("data-stage", next);
      var live = next !== "demo";
      triggers.forEach(function (b) { b.setAttribute("aria-expanded", live ? "true" : "false"); });
      if (!loopControl) return;
      if (live) loopControl.suspend();
      else loopControl.resume();
    }

    function openChat() {
      var first = panel.getAttribute("data-stage") === "demo";
      if (first) lastFocus = document.activeElement;
      setStage("chat");
      if (embedded && !frame.getAttribute("src")) {
        frame.setAttribute("src", buildChatSrc());
        readyTimer = window.setTimeout(fallBackToWaitlist, READY_TIMEOUT_MS);
      }
      // Stacked, the frame sits below the CTA and the swap would happen off screen.
      // Asking the frame whether it is actually in view beats repeating the hero's
      // stacking breakpoint here — that copy silently went stale when the CSS moved
      // the breakpoint, and it is the visibility we care about either way.
      if (first) {
        var nav = document.querySelector(".forgeax-site header, .site-header, header");
        var navH = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
        var box = panel.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (box.top < navH + 8 || box.bottom > vh) {
          panel.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
        }
      }
      focusPanel();
    }

    function backToDemo() {
      setStage("demo");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // Focus moves to the region that just took the frame, not to a control inside
    // it: keyboard and screen-reader users get the region label first and tab into
    // the conversation or the brief from there, and Escape has somewhere to land.
    // preventScroll keeps the phone's scrollIntoView animation from being cut off.
    function focusPanel() {
      var stage = panel.getAttribute("data-stage");
      var layer = stage === "brief"
        ? panel.querySelector("[data-fxi-brief]")
        : panel.querySelector("[data-fxi-chat]");
      if (!layer || !layer.focus) return;
      var x = window.scrollX;
      var y = window.scrollY;
      layer.focus({ preventScroll: true });
      // Newly shown regions (display:none → flex) still make some browsers
      // scroll the focused box under the sticky nav, ignoring preventScroll.
      if (window.scrollX !== x || window.scrollY !== y) window.scrollTo(x, y);
    }

    triggers.forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); openChat(); });
    });
    panel.querySelectorAll("[data-fxi-exit]").forEach(function (b) {
      b.addEventListener("click", backToDemo);
    });
    panel.querySelectorAll("[data-fxi-brief-back]").forEach(function (b) {
      b.addEventListener("click", function () { setStage("chat"); focusPanel(); });
    });

    // Escape peels one state at a time, but only while focus is inside the frame:
    // the panel is part of the page now, so a global Escape would fire while the
    // visitor is reading a section further down.
    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var stage = panel.getAttribute("data-stage");
      if (stage === "brief") { setStage("chat"); focusPanel(); }
      else if (stage === "chat") backToDemo();
    });

    // chat-questioner handoff. Three messages, all origin-checked:
    //   forgeax:ready — embed booted; cancels the blank-iframe fallback
    //   forgeax:gdd   — finished Vertical Slice Brief (markdown only; DSL / resolution stay
    //                   server-side, per idea-lab-marketing-spec)
    //   forgeax:limit — guest turn budget; at zero we surface the download nudge
    window.addEventListener("message", function (e) {
      if (!embedded || !chatOrigin || e.origin !== chatOrigin) return;
      if (e.source !== frame.contentWindow) return;
      var d = e.data;
      if (!d) return;

      if (d.type === "forgeax:ready") {
        ready = true;
        if (readyTimer) { clearTimeout(readyTimer); readyTimer = 0; }
        if (boot) boot.hidden = true;
        if (waitlist) waitlist.hidden = true;
        if (frame) frame.hidden = false;
        return;
      }

      if (d.type === "forgeax:gdd" && typeof d.gddMarkdown === "string") {
        gddMarkdown = d.gddMarkdown;
        if (gddOut) gddOut.textContent = gddMarkdown;
        setStage("brief");
        focusPanel();
        return;
      }

      if (d.type === "forgeax:limit" && d.remaining === 0 && limitNote) {
        limitNote.hidden = false;
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var text = gddMarkdown || (gddOut ? gddOut.textContent : "");
        if (!text || !navigator.clipboard) return;
        navigator.clipboard.writeText(text).then(function () {
          var was = copyBtn.textContent;
          copyBtn.textContent = copyBtn.getAttribute("data-copied") || was;
          setTimeout(function () { copyBtn.textContent = was; }, 1800);
        });
      });
    }
  })();

  /* ── install command + paste-into-agent prompt ── */
  (function installCommand() {
    var root = document.querySelector("main.home-v2");
    var BIN = (root && root.getAttribute("data-install-bin")) || "npx -y @forgeax/game";
    var DEFAULT_IDE = "";
    var PREFERRED_IDE_KEY = "forgeax.preferred-ide";
    var ide = DEFAULT_IDE;
    var command = commandFor(ide);
    var prompt = "";

    function attr(name) {
      return (root && root.getAttribute(name)) || "";
    }

    function commandFor(nextIde) {
      if (!nextIde) return BIN + " install";
      return BIN + " install --ide " + nextIde;
    }

    function isSingleIde(value) {
      return !!value && value.indexOf(",") === -1;
    }

    function readPreferredIde() {
      try {
        var saved = window.localStorage.getItem(PREFERRED_IDE_KEY);
        return isSingleIde(saved) ? saved : "";
      } catch (e) {
        return "";
      }
    }

    function rememberIde(nextIde) {
      if (!isSingleIde(nextIde) || !deeplinkFor(nextIde, "x")) return;
      try { window.localStorage.setItem(PREFERRED_IDE_KEY, nextIde); } catch (e) { /* ignore */ }
    }

    function openerIde(current) {
      if (isSingleIde(current)) return current;
      var saved = readPreferredIde();
      if (saved && deeplinkFor(saved, "x")) return saved;
      return "cursor";
    }

    function deeplinkFor(agent, text) {
      if (!agent || !text) return "";
      if (agent === "cursor") {
        return "cursor://anysphere.cursor-deeplink/prompt?text=" + encodeURIComponent(text);
      }
      if (agent === "codex") {
        return "codex://new?prompt=" + encodeURIComponent(text);
      }
      if (agent === "claude") {
        var q = text.length > 5000 ? text.slice(0, 5000) : text;
        return "claude-cli://open?q=" + encodeURIComponent(q);
      }
      return "";
    }

    function openLocalAgent(url) {
      if (!url) return;
      var link = document.createElement("a");
      link.href = url;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function buildPrompt() {
      return [
        attr("data-step1-label"),
        command,
        attr("data-step1-note"),
        "",
        attr("data-step2-label"),
        attr("data-step2-note"),
        BIN + " init"
      ].filter(function (line, i, arr) {
        return line || (i > 0 && arr[i - 1]);
      }).join("\n");
    }

    function setCopied(btn) {
      var copied = btn.getAttribute("data-copied");
      var keepWidth = btn.classList.contains("hero-prompt-btn")
        || btn.querySelector("svg, i, [data-lucide]");
      if (keepWidth) {
        btn.classList.add("is-copied");
        if (copied) {
          if (!btn.getAttribute("data-aria-orig")) {
            btn.setAttribute("data-aria-orig", btn.getAttribute("aria-label") || btn.textContent.trim() || "");
          }
          btn.setAttribute("aria-label", copied);
        }
        setTimeout(function () {
          btn.classList.remove("is-copied");
          var orig = btn.getAttribute("data-aria-orig");
          if (orig) btn.setAttribute("aria-label", orig);
        }, 1600);
        return;
      }
      var was = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", was);
      btn.textContent = copied || was;
      btn.classList.add("is-copied");
      setTimeout(function () {
        btn.textContent = was;
        btn.classList.remove("is-copied");
      }, 1600);
    }

    function copyText(text, btn) {
      if (!text) return;
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); setCopied(btn); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { setCopied(btn); }, fallback);
        return;
      }
      fallback();
    }

    function applyCommand() {
      command = commandFor(ide);
      prompt = buildPrompt();
      Array.prototype.forEach.call(document.querySelectorAll("[data-install-prompt]"), function (el) {
        el.textContent = command;
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-copy-cmd]"), function (btn) {
        btn.setAttribute("data-copy-text", command);
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-copy-prompt]"), function (btn) {
        btn.setAttribute("data-copy-text", prompt);
      });
    }

    function closeScheme(box) {
      var btn = box.querySelector("[data-scheme-toggle]");
      var menu = box.querySelector(".hero-scheme__menu");
      box.classList.remove("is-open");
      if (btn) btn.setAttribute("aria-expanded", "false");
      if (menu) menu.hidden = true;
    }

    function closeAllSchemes() {
      Array.prototype.forEach.call(document.querySelectorAll("[data-scheme]"), closeScheme);
    }

    function selectScheme(nextIde) {
      ide = nextIde || DEFAULT_IDE;
      rememberIde(ide);
      applyCommand();
      Array.prototype.forEach.call(document.querySelectorAll("[data-scheme]"), function (box) {
        Array.prototype.forEach.call(box.querySelectorAll("[data-scheme-opt]"), function (opt) {
          opt.setAttribute("aria-selected", opt.getAttribute("data-ide") === ide ? "true" : "false");
        });
        closeScheme(box);
      });
    }

    applyCommand();

    Array.prototype.forEach.call(document.querySelectorAll("[data-scheme]"), function (box) {
      var toggle = box.querySelector("[data-scheme-toggle]");
      var menu = box.querySelector(".hero-scheme__menu");
      if (!toggle || !menu) return;
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = box.classList.contains("is-open");
        closeAllSchemes();
        if (open) return;
        box.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        menu.hidden = false;
      });
      Array.prototype.forEach.call(box.querySelectorAll("[data-scheme-opt]"), function (opt) {
        opt.addEventListener("click", function (e) {
          e.stopPropagation();
          selectScheme(opt.getAttribute("data-ide"));
        });
      });
    });

    document.addEventListener("click", closeAllSchemes);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAllSchemes();
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-copy-cmd]"), function (btn) {
      btn.addEventListener("click", function (e) {
        var text = btn.getAttribute("data-copy-text") || command;
        if (!text) return;
        if (btn.tagName === "A") e.preventDefault();
        copyText(text, btn);
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-copy-prompt]"), function (btn) {
      btn.addEventListener("click", function (e) {
        if (btn.tagName === "A") e.preventDefault();
        var text = btn.getAttribute("data-copy-text") || prompt;
        if (!text) return;
        copyText(text, btn);
        openLocalAgent(deeplinkFor(openerIde(ide), text));
      });
    });
  })();
})();
