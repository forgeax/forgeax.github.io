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

  /* ── editor install (one command for Claude / Codex / Cursor) ── */
  (function editorInstall() {
    var box = document.getElementById("fxEditorInstall");
    var trigger = document.querySelector("[data-editor-install]");
    if (!box || !trigger) return;

    var INSTALL = "npx -y @forgeax/game install --ide claude,codex,cursor";
    var host = trigger.closest(".cta-path__anchor") || trigger.parentElement;
    var promptEl = box.querySelector("[data-editor-prompt]");
    var proofBtn = document.querySelector("[data-copy-prompt]");
    var hideTimer = 0;
    var canHover = window.matchMedia("(hover: hover)").matches;
    var bin = box.getAttribute("data-install-bin") || "npx -y @forgeax/game";

    function attr(name) {
      return box.getAttribute(name) || "";
    }

    function buildPrompt() {
      return [
        attr("data-step1-label"),
        INSTALL,
        attr("data-step1-note"),
        "",
        attr("data-step2-label"),
        attr("data-step2-note"),
        bin + " init"
      ].join("\n");
    }

    function isOpen() {
      return host.classList.contains("is-open");
    }

    function setOpen(next) {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = 0; }
      host.classList.toggle("is-open", !!next);
      trigger.setAttribute("aria-expanded", next ? "true" : "false");
    }

    function closeSoon() {
      hideTimer = setTimeout(function () { setOpen(false); }, 140);
    }

    function copyText(text, btn) {
      if (!text) return;
      var done = function () {
        var was = btn.getAttribute("data-label") || btn.textContent;
        btn.setAttribute("data-label", was);
        btn.textContent = btn.getAttribute("data-copied") || was;
        setTimeout(function () { btn.textContent = was; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
        return;
      }
      var range = document.createRange();
      var code = btn.previousElementSibling;
      if (!code) return;
      range.selectNodeContents(code);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
      sel.removeAllRanges();
    }

    /* Pages cannot list installed apps. Copy is the fallback; the same click
     * also fires each known Agent protocol. Registered handlers prefill the
     * prompt. Unknown schemes usually no-op (Windows may show a system dialog,
     * so we only open the preferred handler there). */
    var AGENT_STORE = "forgeax.local-agent";
    var AGENTS = [
      {
        id: "cursor",
        url: function (prompt) {
          return "cursor://anysphere.cursor-deeplink/prompt?text=" + encodeURIComponent(prompt);
        }
      },
      {
        id: "codex",
        url: function (prompt) {
          return "codex://new?prompt=" + encodeURIComponent(prompt);
        }
      },
      {
        id: "claude",
        url: function (prompt) {
          var q = prompt.length > 5000 ? prompt.slice(0, 5000) : prompt;
          return "claude-cli://open?q=" + encodeURIComponent(q);
        }
      }
    ];

    function readLastAgent() {
      try { return localStorage.getItem(AGENT_STORE) || ""; } catch (e) { return ""; }
    }

    function writeLastAgent(id) {
      try { localStorage.setItem(AGENT_STORE, id); } catch (e) { /* private mode */ }
    }

    function agentById(id) {
      var i = 0;
      for (; i < AGENTS.length; i++) if (AGENTS[i].id === id) return AGENTS[i];
      return null;
    }

    function orderedAgents() {
      var last = readLastAgent();
      var preferred = agentById(last);
      if (!preferred) return AGENTS.slice();
      return [preferred].concat(AGENTS.filter(function (a) { return a.id !== last; }));
    }

    function isWindows() {
      return /Windows/i.test(navigator.userAgent);
    }

    function openProtocol(url) {
      window.location.href = url;
    }

    function openProtocolHidden(url) {
      var iframe = document.createElement("iframe");
      iframe.setAttribute("hidden", "");
      iframe.setAttribute("aria-hidden", "true");
      iframe.tabIndex = -1;
      iframe.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;border:0;overflow:hidden";
      iframe.src = url;
      document.body.appendChild(iframe);
      setTimeout(function () {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 2500);
    }

    function watchAgentOpen(id, rotateOnMiss) {
      var hit = false;
      function mark() {
        if (hit) return;
        hit = true;
        writeLastAgent(id);
        cleanup();
      }
      function vis() {
        if (document.hidden) mark();
      }
      function cleanup() {
        window.removeEventListener("blur", mark);
        document.removeEventListener("visibilitychange", vis);
      }
      window.addEventListener("blur", mark);
      document.addEventListener("visibilitychange", vis);
      setTimeout(function () {
        cleanup();
        if (hit || !rotateOnMiss) return;
        var order = AGENTS.map(function (a) { return a.id; });
        var idx = order.indexOf(id);
        if (idx < 0) return;
        writeLastAgent(order[(idx + 1) % order.length]);
      }, 1800);
    }

    function openLocalAgent(prompt) {
      if (!prompt) return;
      var known = readLastAgent();
      var agents = orderedAgents();
      var primary = agents[0];
      var single = !!known || isWindows();
      watchAgentOpen(primary.id, single);
      /* Hidden fallbacks first so a custom-scheme navigation cannot cancel them. */
      if (!single) {
        var i = 1;
        for (; i < agents.length; i++) openProtocolHidden(agents[i].url(prompt));
      }
      openProtocol(primary.url(prompt));
    }

    var prompt = buildPrompt();
    if (promptEl) promptEl.textContent = prompt;
    if (proofBtn) proofBtn.setAttribute("data-copy-text", prompt);

    host.addEventListener("mouseenter", function () { setOpen(true); });
    host.addEventListener("mouseleave", closeSoon);
    host.addEventListener("focusin", function () { setOpen(true); });
    host.addEventListener("focusout", function (e) {
      if (!host.contains(e.relatedTarget)) closeSoon();
    });
    trigger.addEventListener("click", function () {
      if (canHover) return;
      setOpen(!isOpen());
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-copy-cmd]"), function (btn) {
      btn.addEventListener("click", function (e) {
        var text = btn.getAttribute("data-copy-text");
        if (!text) {
          var code = btn.parentNode && btn.parentNode.querySelector("code");
          text = code ? code.textContent : "";
        }
        if (!text) return;
        if (btn.tagName === "A") e.preventDefault();
        copyText(text, btn);
        if (btn.hasAttribute("data-open-agent")) openLocalAgent(text);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        trigger.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (canHover || !isOpen()) return;
      if (host.contains(e.target)) return;
      setOpen(false);
    });
  })();
})();
