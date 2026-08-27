/* Marketplace card icons — one unique Lucide icon per plugin slug */
(function () {
  /** @type {Record<string, string>} */
  var CARD_ICONS = {
    "wb-character": "message-square-text",
    "wb-anim": "film",
    "wb-skill": "sparkles",
    "wb-lowpoly-obj": "user",
    "wb-3d-lowpoly": "workflow",
    "wb-gen3d": "boxes",
    "wb-2d-scene-asset-generator": "images",
    "wb-scene-generator": "map",
    "wb-ui": "layout-dashboard",
    "wb-items": "package",
    "wb-look": "palette",
    "wb-bgm": "music-2",
    "wb-narrative": "book-open",
    "wb-reel": "clapperboard",
    "wb-balance": "bar-chart-3",
    "wb-code": "code-2",
    "wb-observatory": "telescope",
    "wb-agent-persona": "user-cog",
    "wb-plugin-author": "plug",
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
    workbench: "blocks",
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
  window.forgeaxMountWorkbenchIcon = function (el, slug) {
    mountIcon(el, slug, "workbench");
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
