/* Marketplace card icons — one unique Lucide icon per plugin slug */
(function () {
  /** @type {Record<string, string>} */
  var CARD_ICONS = {
    "character": "message-square-text",
    "anim": "film",
    "skill": "sparkles",
    "lowpoly-obj": "user",
    "3d-lowpoly": "workflow",
    "gen3d": "boxes",
    "2d-scene-asset-generator": "images",
    "scene-generator": "map",
    "ui": "layout-dashboard",
    "items": "package",
    "look": "palette",
    "bgm": "music-2",
    "narrative": "book-open",
    "reel": "clapperboard",
    "balance": "bar-chart-3",
    "code": "code-2",
    "observatory": "telescope",
    "agent-persona": "user-cog",
    "plugin-author": "plug",
    admin: "settings",
    "skill-author-plugin": "notebook-pen",
    "skill-make-game-design": "gamepad-2",
    "cli-claude-code": "command",
    "cli-codex": "square-code",
    "cli-cursor-agent": "mouse-pointer-click",
    "cli-forgeax": "cpu",
    "tool-balance-resim": "repeat-2",
    "model-anthropic-text": "text-cursor-input",
  };

  var KIND_FALLBACK = {
    authoring: "blocks",
    skill: "wand-sparkles",
    backend: "terminal",
    tool: "wrench",
    binding: "link-2",
  };

  function lucideForCard(slug, kind) {
    return CARD_ICONS[slug] || KIND_FALLBACK[kind] || "box";
  }

  function refreshLucide() {
    if (typeof lucide !== "undefined" && window.forgeaxRefreshIcons) {
      window.forgeaxRefreshIcons();
      return true;
    }
    return false;
  }

  function mountIcon(el, slug, kind) {
    if (!el) return;
    var name = lucideForCard(slug, kind);
    var modal = el.classList.contains("mk-modal-icon");
    el.className = (modal ? "mk-modal-icon" : "mk-card-icon") + " ico mk-card-icon--" + kind;
    el.setAttribute("data-slug", slug);
    el.innerHTML = '<i data-lucide="' + name + '"></i>';
    if (!refreshLucide()) {
      var tries = 0;
      var timer = setInterval(function () {
        if (refreshLucide() || ++tries > 50) clearInterval(timer);
      }, 100);
    }
  }

  window.forgeaxMountMarketplaceIcon = mountIcon;
  window.forgeaxMountAuthoringIcon = function (el, slug) {
    mountIcon(el, slug, "authoring");
  };
  window.forgeaxLucideForMarketplaceCard = lucideForCard;
  window.forgeaxMarketplaceCardIcons = CARD_ICONS;

  function boot() {
    refreshLucide();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
