(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupMenu() {
        var button = qs('.menu-toggle');
        var nav = qs('.site-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupForms() {
        qsa('.search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var value = input ? input.value.trim() : '';
                if (value) {
                    window.location.href = './search.html?q=' + encodeURIComponent(value);
                }
            });
        });
    }

    function setupHero() {
        var slider = qs('.hero-slider');
        if (!slider) {
            return;
        }
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('.hero-dot', slider);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
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
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var bars = qsa('[data-filter-bar]');
        bars.forEach(function (bar) {
            var targetSelector = bar.getAttribute('data-target');
            var cards = qsa(targetSelector || '.movie-card');
            qsa('.filter-button', bar).forEach(function (button) {
                button.addEventListener('click', function () {
                    var value = button.getAttribute('data-filter') || 'all';
                    qsa('.filter-button', bar).forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    cards.forEach(function (card) {
                        var text = card.getAttribute('data-filter-text') || '';
                        var matched = value === 'all' || text.indexOf(value) !== -1;
                        card.classList.toggle('hidden-card', !matched);
                    });
                });
            });
        });
    }

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function buildCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
            '    <div class="card-poster">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
            '        <span class="card-ribbon">' + escapeHtml(movie.year || movie.region) + '</span>',
            '    </div>',
            '    <div class="card-body">',
            '        <h3 class="card-title">' + escapeHtml(movie.title) + '</h3>',
            '        <div class="movie-meta">',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '        <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="card-tags">' + tags + '</div>',
            '    </div>',
            '</a>'
        ].join('');
    }

    function setupSearchPage() {
        var form = qs('[data-search-page-form]');
        var input = qs('[data-search-page-input]');
        var results = qs('[data-search-results]');
        if (!form || !input || !results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        function render(query) {
            var lower = query.toLowerCase();
            var pool = window.MOVIE_SEARCH_INDEX;
            var matched = lower ? pool.filter(function (movie) {
                return movie.searchText.indexOf(lower) !== -1;
            }) : pool.slice(0, 40);
            var html = matched.slice(0, 120).map(buildCard).join('');
            results.innerHTML = html || '<p class="section-desc">换一个关键词试试。</p>';
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = input.value.trim();
            var url = './search.html';
            if (value) {
                url += '?q=' + encodeURIComponent(value);
            }
            window.history.replaceState(null, '', url);
            render(value);
        });
        var query = getQueryValue();
        input.value = query;
        render(query);
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupForms();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
