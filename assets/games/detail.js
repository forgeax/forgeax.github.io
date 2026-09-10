// Game detail page — Studio handoff toast; source download is a plain <a download> link.
(function () {
  var UI = window.GM_UI || {};
  var GAME = window.GM_GAME || {};
  var toastEl = document.getElementById('gmToast');
  var toastT = null;

  function t(key, fallback) {
    return UI[key] != null && UI[key] !== '' ? UI[key] : (fallback || key);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function showToast(html) {
    if (!toastEl) return;
    toastEl.innerHTML = html;
    toastEl.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.hidden = true; }, 3400);
  }

  document.addEventListener('click', function (e) {
    var studio = e.target.closest('[data-gm-studio]');
    if (studio) {
      showToast(esc(t('studioHandoff', 'Handing off to Studio: ')) +
        '<span class="em">forgeax://open?slug=' + esc(studio.getAttribute('data-gm-studio')) + '</span>');
    }
  });

  if (window.forgeaxRefreshIcons) window.forgeaxRefreshIcons();
})();
