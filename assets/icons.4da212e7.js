/* Lucide icons — forgeax-studio DESIGN-SYSTEM §图标 */
(function () {
  var ICON_ATTRS = {
    width: "20",
    height: "20",
    "stroke-width": "1.8",
    "aria-hidden": "true",
  };

  function refreshIcons() {
    if (typeof lucide === "undefined" || !lucide.createIcons) return;
    lucide.createIcons({ attrs: ICON_ATTRS });
  }

  window.forgeaxRefreshIcons = refreshIcons;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refreshIcons);
  } else {
    refreshIcons();
  }
})();
