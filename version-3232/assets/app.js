(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function cardHtml(item) {
        return [
            '<article class="movie-card">',
            '<a class="card-link" href="' + item.url + '" title="' + escapeHtml(item.title) + '">',
            '<div class="poster-wrap">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="poster-gradient"></span>',
            '<span class="card-badge">片库</span>',
            '<span class="heat-tag">热度 ' + item.heat + '</span>',
            '<span class="play-mark">▶</span>',
            '</div>',
            '<div class="card-body">',
            '<h3>' + escapeHtml(item.title) + '</h3>',
            '<p class="card-meta">' + escapeHtml([item.region, item.type, item.year].filter(Boolean).join(' · ')) + '</p>',
            '<p class="card-genre">' + escapeHtml(item.genre) + '</p>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function queryValue() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim();
    }

    function initSearchPage() {
        var input = document.querySelector(".search-page-input");
        var results = document.querySelector(".search-results");
        var status = document.querySelector(".search-status");
        if (!input || !results || !window.siteSearchIndex) {
            return;
        }
        var current = queryValue();
        input.value = current;

        function render(term) {
            var q = String(term || "").trim().toLowerCase();
            var list = window.siteSearchIndex;
            var matched = q ? list.filter(function (item) {
                var haystack = [item.title, item.region, item.type, item.year, item.genre, item.category].join(" ").toLowerCase();
                return haystack.indexOf(q) !== -1;
            }) : list.slice(0, 36);
            matched = matched.slice(0, 80);
            results.innerHTML = matched.map(cardHtml).join("");
            if (status) {
                status.textContent = q ? "相关内容" : "热门内容优先展示";
            }
        }

        render(current);
        input.addEventListener("input", function () {
            render(input.value);
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchPage();
    });
}());
