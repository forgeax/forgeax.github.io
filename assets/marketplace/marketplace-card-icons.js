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

  var ICON_KINDS = ["workbench", "skill", "backend", "tool", "binding"];

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
    el.className = "mk-card-icon ico mk-card-icon--" + kind;
    el.setAttribute("data-slug", slug);
    el.innerHTML = '<i data-lucide="' + name + '"></i>';
    if (!refreshLucide()) {
      var tries = 0;
      var timer = setInterval(function () {
        if (refreshLucide() || ++tries > 50) clearInterval(timer);
      }, 100);
    }
  }

  function initCard(item) {
    var kind = item.getAttribute("data-kind") || "";
    if (ICON_KINDS.indexOf(kind) < 0) return;
    // 已有专属 agent 徽章的 workbench 卡片：不再挂载大 icon（避免右上角与徽章重叠、卡片过挤）
    if (item.querySelector(".mk-agent-badge")) return;

    item.classList.add("is-mk-card");
    if (kind === "workbench") item.classList.add("is-workbench");

    var main = item.querySelector(".mk-card-main");
    if (!main) {
      main = document.createElement("div");
      main.className = "mk-card-main";
      while (item.firstChild) main.appendChild(item.firstChild);
      item.appendChild(main);
    }

    var slug = item.getAttribute("data-slug") || "";
    var icon = item.querySelector(".mk-card-icon");
    if (!icon) {
      icon = document.createElement("div");
      icon.setAttribute("aria-hidden", "true");
      item.appendChild(icon);
    }
    mountIcon(icon, slug, kind);
  }

  function initCards() {
    ICON_KINDS.forEach(function (kind) {
      [].slice.call(document.querySelectorAll('.mk-item[data-kind="' + kind + '"]')).forEach(initCard);
    });
  }

  window.forgeaxMountMarketplaceIcon = mountIcon;
  window.forgeaxMountWorkbenchIcon = function (el, slug) {
    mountIcon(el, slug, "workbench");
  };
  window.forgeaxLucideForMarketplaceCard = lucideForCard;
  window.forgeaxMarketplaceCardIcons = CARD_ICONS;

  function boot() {
    initCards();
    refreshLucide();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
