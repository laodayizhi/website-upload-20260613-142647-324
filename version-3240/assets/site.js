(function () {
  function getRoot() {
    return document.body ? document.body.getAttribute('data-root') || '' : '';
  }

  function setupMobileMenu() {
    const button = document.querySelector('[data-mobile-menu]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupGlobalSearch() {
    const forms = document.querySelectorAll('[data-site-search]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const input = form.querySelector('input[name="q"], input[type="search"]');
        const query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = getRoot() + 'search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      }, { once: true });
    });
  }

  function setupHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        render(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        render(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        render(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        render(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    render(0);
    start();
  }

  function setupCardFilters() {
    const grid = document.querySelector('[data-card-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-card]')) : Array.from(document.querySelectorAll('[data-card]'));
    const filterInput = document.querySelector('[data-filter-cards]');
    const sortButtons = document.querySelectorAll('[data-sort-cards]');
    if (!cards.length) {
      return;
    }

    function applyFilter() {
      const value = filterInput ? filterInput.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const text = (card.getAttribute('data-text') || '').toLowerCase();
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        card.classList.toggle('hidden-card', value && !text.includes(value) && !title.includes(value));
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    sortButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const type = button.getAttribute('data-sort-cards');
        const sorted = cards.slice().sort(function (left, right) {
          if (type === 'year') {
            return Number(right.getAttribute('data-year')) - Number(left.getAttribute('data-year'));
          }
          return Number(right.getAttribute('data-views')) - Number(left.getAttribute('data-views'));
        });
        if (grid) {
          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        }
      });
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.onload = function () {
      callback(Boolean(window.Hls));
    };
    script.onerror = function () {
      callback(false);
    };
    document.head.appendChild(script);
  }

  function setupPlayer() {
    const button = document.querySelector('[data-player-start]');
    const video = document.getElementById('movie-player');
    if (!button || !video) {
      return;
    }

    function fallbackToMp4() {
      const mp4 = video.getAttribute('data-mp4');
      if (mp4) {
        video.src = mp4;
      }
      video.load();
      video.play().catch(function () {});
    }

    function playHls() {
      const hlsSource = video.getAttribute('data-hls');
      button.classList.add('hidden');
      if (!hlsSource) {
        fallbackToMp4();
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSource;
        video.play().catch(function () {
          fallbackToMp4();
        });
        return;
      }

      loadHls(function (isReady) {
        if (isReady && window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(hlsSource);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hls.destroy();
              fallbackToMp4();
            }
          });
        } else {
          fallbackToMp4();
        }
      });
    }

    button.addEventListener('click', playHls);
  }

  function createSearchCard(item, root) {
    const tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card" data-card data-title="' + escapeHtml(item.title) + '" data-year="' + item.year + '" data-views="' + item.views + '">' +
      '  <a class="poster" href="' + root + item.url + '" data-title="' + escapeHtml(item.title) + '">' +
      '    <img src="' + root + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '    <span class="play-mark">▶</span>' +
      '    <span class="duration-badge">' + escapeHtml(item.duration) + '</span>' +
      '  </a>' +
      '  <div class="movie-card-body">' +
      '    <h3><a href="' + root + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
      '    <div class="movie-meta"><span>' + item.year + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.category) + '</span></div>' +
      '    <p class="movie-desc">' + escapeHtml(item.oneLine || item.summary || '') + '</p>' +
      '    <div class="tag-row">' + tags + '</div>' +
      '  </div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupLocalSearch() {
    const form = document.querySelector('[data-local-search-form]');
    const results = document.querySelector('[data-search-results]');
    const title = document.querySelector('[data-search-title]');
    const status = document.querySelector('[data-search-status]');
    if (!form || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    const root = getRoot();
    const input = form.querySelector('input[name="q"]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    if (input) {
      input.value = initialQuery;
    }

    function runSearch(query) {
      const normalized = query.trim().toLowerCase();
      if (!normalized) {
        return;
      }
      const tokens = normalized.split(/\s+/).filter(Boolean);
      const matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        const text = [
          item.title,
          item.year,
          item.type,
          item.region,
          item.genre,
          item.category,
          (item.tags || []).join(' '),
          item.oneLine,
          item.summary
        ].join(' ').toLowerCase();
        return tokens.every(function (token) {
          return text.includes(token);
        });
      }).slice(0, 120);
      if (status) {
        status.textContent = 'Search';
      }
      if (title) {
        title.textContent = '搜索结果：' + query + '（' + matches.length + '）';
      }
      results.innerHTML = matches.length
        ? matches.map(function (item) { return createSearchCard(item, root); }).join('')
        : '<p class="content-card">没有找到匹配内容，可以尝试更短的关键词。</p>';
      setupImageFallbacks();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input ? input.value.trim() : '';
      if (query) {
        history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(query));
        runSearch(query);
      }
    });

    if (initialQuery) {
      runSearch(initialQuery);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupGlobalSearch();
    setupImageFallbacks();
    setupHero();
    setupCardFilters();
    setupPlayer();
    setupLocalSearch();
  });
})();
