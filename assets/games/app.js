// Games gallery — static card grid + client-side filter/sort (SEO detail pages are separate HTML).
(function () {
  var GAMES = window.GM_DATA || [];
  var UI = window.GM_UI || {};
  var bySlug = {};
  GAMES.forEach(function (g) { bySlug[g.slug] = g; });

  var grid = document.getElementById('gmGrid');
  var empty = document.getElementById('gmEmpty');
  var hero = document.getElementById('gmHero');
  var featuredMobile = document.getElementById('gmFeaturedMobile');
  var featuredStack = document.getElementById('gmFeaturedStack');
  var tagbar = document.getElementById('gmTagbar');
  var search = document.getElementById('gmSearch');
  var sortRoot = document.getElementById('gmSort');
  var sortTrigger = sortRoot && sortRoot.querySelector('.gm-sort__trigger');
  var sortMenu = document.getElementById('gmSortMenu');
  var sortValueEl = sortRoot && sortRoot.querySelector('.gm-sort__value');
  var tabs = document.getElementById('gmTabs');
  var secTitle = document.getElementById('gmSecTitle');
  var fly = document.getElementById('gmFly');
  if (!grid) return;

  var state = { q: '', tab: 'all', sort: 'feat', tags: new Set() };
  var featuredRank = {};
  (window.GM_FEATURED || []).forEach(function (slug, i) { featuredRank[slug] = i; });
  GAMES.forEach(function (g) {
    if (g.featuredRank == null && featuredRank[g.slug] != null) g.featuredRank = featuredRank[g.slug];
  });
  var carTimer = null;
  var carIdx = 0;
  var mqMobile = window.matchMedia('(max-width: 767px)');
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function prefersReducedMotion() {
    return mqReduce.matches;
  }

  function isMobileFeatured() {
    return mqMobile.matches;
  }

  function stopCarousel() {
    clearInterval(carTimer);
    carTimer = null;
  }

  function startCarousel(count) {
    stopCarousel();
    if (count <= 1 || isMobileFeatured() || prefersReducedMotion()) return;
    carTimer = setInterval(function () { carGo((carIdx + 1) % count); }, 6200);
  }

  function refreshIcons() {
    if (window.forgeaxRefreshIcons) window.forgeaxRefreshIcons();
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function t(key, fallback) {
    return UI[key] != null && UI[key] !== '' ? UI[key] : (fallback || key);
  }

  function normalizeTab(tab) {
    if (tab === 'edit' || tab === 'play') return tab === 'play' ? 'all' : 'download';
    if (tab === 'all' || tab === 'download') return tab;
    return 'all';
  }

  function parseHash() {
    var raw = (location.hash || '').replace(/^#/, '') || '/';
    var parts = raw.split('?');
    var p = new URLSearchParams(parts[1] || '');
    var tags = (p.get('tag') || '').split(',').filter(Boolean).map(decodeURIComponent);
    return {
      q: p.get('q') || '',
      tab: normalizeTab(p.get('tab')),
      sort: p.get('sort') || 'feat',
      tags: tags,
    };
  }

  function buildListHash(s) {
    var p = new URLSearchParams();
    if (s.q) p.set('q', s.q);
    if (s.tab && s.tab !== 'all') p.set('tab', s.tab);
    if (s.sort && s.sort !== 'feat') p.set('sort', s.sort);
    if (s.tags && s.tags.size) p.set('tag', Array.from(s.tags).join(','));
    var qs = p.toString();
    return '#/' + (qs ? '?' + qs : '');
  }

  function go(hash) {
    if (location.hash === hash) applyState();
    else location.hash = hash;
  }

  function filtered() {
    var list = GAMES.slice();
    if (state.tab === 'download') {
      list = list.filter(function (g) { return g.downloadable; });
    }
    if (state.q) {
      var q = state.q.toLowerCase();
      list = list.filter(function (g) {
        var hay = [g.slug, g.title, g.blurb].concat(g.tags || []).join(' ').toLowerCase();
        return hay.indexOf(q) >= 0;
      });
    }
    if (state.tags.size) {
      list = list.filter(function (g) {
        return Array.from(state.tags).every(function (tg) { return (g.tags || []).indexOf(tg) >= 0; });
      });
    }
    if (state.sort === 'az') {
      list.sort(function (a, b) { return String(a.title).localeCompare(String(b.title)); });
    } else if (state.sort === 'new') {
      list.sort(function (a, b) { return String(b.updated || '').localeCompare(String(a.updated || '')); });
    } else {
      list.sort(function (a, b) {
        var ra = a.featuredRank;
        var rb = b.featuredRank;
        var fa = ra != null && ra < 9999 ? ra : 9999;
        var fb = rb != null && rb < 9999 ? rb : 9999;
        if (fa !== fb) return fa - fb;
        return (a.order || 0) - (b.order || 0);
      });
    }
    return list;
  }

  function renderTagbar() {
    if (!tagbar) return;
    var chips = [];
    if (state.q) {
      chips.push('<span class="gm-fchip"><b>“' + esc(state.q) + '”</b><button type="button" class="x" data-drop-q>✕</button></span>');
    }
    state.tags.forEach(function (tg) {
      chips.push('<span class="gm-fchip">' + esc(tg) + '<button type="button" class="x" data-drop-tag="' + esc(encodeURIComponent(tg)) + '">✕</button></span>');
    });
    if (!chips.length) { tagbar.hidden = true; tagbar.innerHTML = ''; return; }
    tagbar.hidden = false;
    tagbar.innerHTML = chips.join('') + '<button type="button" class="clear" data-clear>' + esc(t('clearAll', 'Clear all')) + '</button>';
  }

  function renderGrid() {
    var list = filtered();
    var slugSet = {};
    list.forEach(function (g) { slugSet[g.slug] = true; });
    var cards = [].slice.call(grid.querySelectorAll('.gm-card'));
    cards.forEach(function (card) {
      card.hidden = !slugSet[card.getAttribute('data-slug')];
    });
    list.forEach(function (g) {
      var card = grid.querySelector('.gm-card[data-slug="' + g.slug + '"]');
      if (card) grid.appendChild(card);
    });
    if (empty) empty.hidden = list.length > 0;
    if (secTitle) {
      secTitle.textContent = state.tab === 'download'
        ? t('secEdit', 'Downloadable')
        : t('secAll', 'All games');
    }
    renderTagbar();
    refreshIcons();
  }

  function featuredItems() {
    var order = window.GM_FEATURED;
    if (order && order.length) {
      return order.map(function (slug) { return bySlug[slug]; }).filter(Boolean);
    }
    return GAMES.filter(function (g) { return g.featured; });
  }

  function canPlay(g) {
    return !!(g && g.built && !(g.tiers && g.tiers.play && g.tiers.play.on === false));
  }

  function detailPath(g) {
    return g.detailPath || ('/games/detail/' + g.slug + '.html');
  }

  function renderFeaturedMobile(items) {
    if (!featuredMobile || !featuredStack) return;
    if (!items.length) {
      featuredMobile.hidden = true;
      featuredStack.innerHTML = '';
      return;
    }
    featuredMobile.hidden = false;
    featuredStack.innerHTML = items.map(function (g) {
      var dp = detailPath(g);
      return '<a class="gm-spot-card" href="' + esc(dp) + '" data-slug="' + esc(g.slug) + '">' +
        '<div class="thumb">' +
          (g.cover ? '<img src="' + esc(g.cover) + '" alt="" loading="lazy">' : '') +
          '<div class="fade"></div>' +
        '</div>' +
        '<div class="body"><h3>' + esc(g.title) + '</h3>' +
          (g.blurb ? '<p>' + esc(g.blurb) + '</p>' : '') +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderHero() {
    var items = featuredItems();
    renderFeaturedMobile(items);

    if (!hero) return;
    if (!items.length) {
      hero.hidden = true;
      hero.innerHTML = '';
      stopCarousel();
      return;
    }
    hero.hidden = false;
    hero.setAttribute('aria-label', t('featured', 'Featured'));
    carIdx = 0;
    hero.innerHTML = '<div class="gm-hero-track">' + items.map(function (g, i) {
      var dp = detailPath(g);
      var active = i === 0;
      return '<div class="gm-cslide' + (active ? ' is-active' : '') + '" data-i="' + i + '" role="group" aria-roledescription="slide" aria-label="' + esc((i + 1) + ' / ' + items.length) + '"' + (active ? '' : ' aria-hidden="true"') + '>' +
        (g.cover ? '<img src="' + esc(g.cover) + '" alt="">' : '') +
        '<div class="veil"></div>' +
        '<div class="c-inner">' +
          '<div class="eyebrow">' + esc(t('featured', 'Featured')) + '</div>' +
          '<h2><a href="' + esc(dp) + '">' + esc(g.title) + '</a></h2>' +
          '<p>' + esc(g.blurb) + '</p>' +
          '<div class="c-row"><div class="cta">' +
            (canPlay(g)
              ? '<a class="btn primary" href="' + esc(g.href || ('/games/' + g.slug + '/')) + '" target="_blank" rel="noopener"><span class="btn-fx" aria-hidden="true"></span>' + esc(t('play', 'Play')) + '</a>'
              : '<span class="btn primary"><span class="btn-fx" aria-hidden="true"></span>' + esc(t('play', 'Play')) + '</span>') +
            '<a class="btn ghost" href="' + esc(dp) + '">' + esc(t('view', 'View')) + '</a>' +
          '</div></div>' +
          '<div class="c-meta"><span>' + esc((g.tags || []).slice(0, 3).join(' · ')) + '</span></div>' +
        '</div>' +
      '</div>';
    }).join('') + '</div>' +
      '<div class="gm-dots" role="tablist" aria-label="' + esc(t('featured', 'Featured')) + '">' + items.map(function (_, i) {
        return '<i class="' + (i === 0 ? 'on' : '') + '" data-car="' + i + '" role="tab" aria-selected="' + (i === 0 ? 'true' : 'false') + '" aria-label="' + esc((i + 1) + ' / ' + items.length) + '"></i>';
      }).join('') + '</div>';
    startCarousel(items.length);
  }

  function carGo(i) {
    if (!hero) return;
    var slides = hero.querySelectorAll('.gm-cslide');
    var count = slides.length;
    if (!count || i === carIdx) return;
    carIdx = i;
    var track = hero.querySelector('.gm-hero-track');
    if (track) track.style.transform = 'translate3d(' + (-i * 100) + '%,0,0)';
    slides.forEach(function (el, idx) {
      var active = idx === i;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    [].forEach.call(hero.querySelectorAll('.gm-dots i'), function (el, idx) {
      var on = idx === i;
      el.classList.toggle('on', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function hideFly() {
    if (fly) fly.hidden = true;
  }

  function showFly(card, slug) {
    var g = bySlug[slug];
    if (!g || !fly) return;
    fly.innerHTML = '<div class="gm-fly-body">' +
      '<h4>' + esc(g.title) + '</h4>' +
      '<div class="gm-fly-desc">' + esc(g.blurb) + '</div>' +
      '<div class="gm-fly-tags">' + (g.tags || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
    '</div>';
    fly.hidden = false;
    var r = card.getBoundingClientRect();
    var w = 320;
    var gap = 12;
    var left = r.right + gap;
    if (left + w > window.innerWidth - 8) left = r.left - w - gap;
    if (left < 8) left = 8;
    fly.style.left = left + 'px';
    fly.style.top = '0px';
    var top = r.top;
    if (top + fly.offsetHeight > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - fly.offsetHeight - 8);
    }
    fly.style.top = top + 'px';
  }

  function sortLabel(value) {
    if (!sortMenu) return value;
    var opt = sortMenu.querySelector('.gm-sort__opt[data-value="' + value + '"]');
    return opt ? opt.textContent.trim() : value;
  }

  function closeSortMenu() {
    if (!sortRoot || !sortMenu || !sortTrigger) return;
    sortRoot.classList.remove('is-open');
    sortMenu.hidden = true;
    sortTrigger.setAttribute('aria-expanded', 'false');
  }

  function openSortMenu() {
    if (!sortRoot || !sortMenu || !sortTrigger) return;
    sortRoot.classList.add('is-open');
    sortMenu.hidden = false;
    sortTrigger.setAttribute('aria-expanded', 'true');
  }

  function syncSortUI() {
    if (!sortRoot || !sortMenu) return;
    var v = state.sort || 'feat';
    [].forEach.call(sortMenu.querySelectorAll('.gm-sort__opt'), function (opt) {
      var on = opt.getAttribute('data-value') === v;
      opt.classList.toggle('is-on', on);
      opt.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (sortValueEl) sortValueEl.textContent = sortLabel(v);
  }

  function applyState() {
    if (search) search.value = state.q;
    syncSortUI();
    if (tabs) {
      [].forEach.call(tabs.querySelectorAll('button'), function (b) {
        var on = b.getAttribute('data-tab') === state.tab;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    renderHero();
    renderGrid();
  }

  function applyParsed(parsed) {
    state.q = parsed.q || '';
    state.tab = normalizeTab(parsed.tab);
    state.sort = parsed.sort === 'az' || parsed.sort === 'new' ? parsed.sort : 'feat';
    state.tags = new Set(parsed.tags || []);
    applyState();
  }

  function syncListHash() {
    go(buildListHash(state));
  }

  if (search) {
    var searchT;
    search.addEventListener('input', function () {
      var v = this.value;
      clearTimeout(searchT);
      searchT = setTimeout(function () {
        state.q = v.trim();
        syncListHash();
      }, 180);
    });
  }

  if (sortRoot && sortTrigger && sortMenu) {
    sortTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (sortRoot.classList.contains('is-open')) closeSortMenu();
      else openSortMenu();
    });
    sortMenu.addEventListener('click', function (e) {
      var opt = e.target.closest('.gm-sort__opt[data-value]');
      if (!opt) return;
      state.sort = opt.getAttribute('data-value');
      syncSortUI();
      closeSortMenu();
      syncListHash();
    });
    document.addEventListener('click', function (e) {
      if (!sortRoot.contains(e.target)) closeSortMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSortMenu();
    });
  }

  if (tabs) tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]');
    if (!b) return;
    state.tab = b.getAttribute('data-tab');
    syncListHash();
  });

  if (tagbar) tagbar.addEventListener('click', function (e) {
    if (e.target.closest('[data-drop-q]')) { state.q = ''; syncListHash(); return; }
    var drop = e.target.closest('[data-drop-tag]');
    if (drop) {
      state.tags.delete(decodeURIComponent(drop.getAttribute('data-drop-tag')));
      syncListHash();
      return;
    }
    if (e.target.closest('[data-clear]')) {
      state.q = '';
      state.tags = new Set();
      syncListHash();
    }
  });

  grid.addEventListener('mouseover', function (e) {
    var card = e.target.closest('.gm-card');
    if (card) showFly(card, card.getAttribute('data-slug'));
  });
  grid.addEventListener('mouseout', function (e) {
    var card = e.target.closest('.gm-card');
    if (card && (!e.relatedTarget || !card.contains(e.relatedTarget))) hideFly();
  });

  if (hero) {
    hero.addEventListener('click', function (e) {
      var car = e.target.closest('[data-car]');
      if (car) { e.preventDefault(); e.stopPropagation(); carGo(Number(car.getAttribute('data-car'))); }
    });
  }

  function onFeaturedLayoutChange() {
    startCarousel(featuredItems().length);
  }
  if (mqMobile.addEventListener) {
    mqMobile.addEventListener('change', onFeaturedLayoutChange);
    mqReduce.addEventListener('change', onFeaturedLayoutChange);
  } else if (mqMobile.addListener) {
    mqMobile.addListener(onFeaturedLayoutChange);
    mqReduce.addListener(onFeaturedLayoutChange);
  }

  window.addEventListener('hashchange', function () { applyParsed(parseHash()); });
  applyParsed(parseHash());
})();
