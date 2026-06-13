(() => {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", () => {
            mobilePanel.classList.toggle("open");
            menuButton.textContent = mobilePanel.classList.contains("open") ? "×" : "☰";
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let currentSlide = 0;
    let heroTimer = null;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    };

    const restartHeroTimer = () => {
        if (!slides.length) {
            return;
        }

        if (heroTimer) {
            window.clearInterval(heroTimer);
        }

        heroTimer = window.setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    };

    if (slides.length) {
        prev?.addEventListener("click", () => {
            showSlide(currentSlide - 1);
            restartHeroTimer();
        });
        next?.addEventListener("click", () => {
            showSlide(currentSlide + 1);
            restartHeroTimer();
        });
        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                showSlide(Number(dot.dataset.heroDot || 0));
                restartHeroTimer();
            });
        });
        restartHeroTimer();
    }

    const filterPanel = document.querySelector("[data-filter-panel]");

    if (filterPanel) {
        const input = filterPanel.querySelector("[data-category-filter]");
        const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
        const chips = Array.from(filterPanel.querySelectorAll(".filter-chip"));
        const emptyState = document.querySelector("[data-empty-state]");
        let activeKind = "all";
        let activeValue = "all";

        const applyFilter = () => {
            const keyword = (input?.value || "").trim().toLowerCase();
            let visibleCount = 0;

            cards.forEach((card) => {
                const text = card.dataset.search || "";
                const matchesKeyword = !keyword || text.includes(keyword);
                let matchesChip = true;

                if (activeKind === "type") {
                    matchesChip = card.dataset.typeKey === activeValue;
                }

                if (activeKind === "year") {
                    matchesChip = card.dataset.yearGroup === activeValue;
                }

                const visible = matchesKeyword && matchesChip;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        };

        input?.addEventListener("input", applyFilter);
        chips.forEach((chip) => {
            chip.addEventListener("click", () => {
                chips.forEach((item) => item.classList.remove("active"));
                chip.classList.add("active");
                activeKind = chip.dataset.filterKind || "all";
                activeValue = chip.dataset.filterValue || "all";
                if (activeKind === "all") {
                    activeValue = "all";
                }
                applyFilter();
            });
        });
    }

    const searchResults = document.getElementById("search-results");

    if (searchResults && Array.isArray(window.SEARCH_MOVIES)) {
        const params = new URLSearchParams(window.location.search);
        const query = (params.get("q") || "").trim();
        const input = document.getElementById("search-page-input");
        const title = document.getElementById("search-title");
        const empty = document.getElementById("search-empty");

        if (input) {
            input.value = query;
        }

        const normalizedQuery = query.toLowerCase();
        const pool = normalizedQuery
            ? window.SEARCH_MOVIES.filter((movie) => movie.search.includes(normalizedQuery))
            : window.SEARCH_MOVIES.slice(0, 36);

        if (title) {
            title.textContent = normalizedQuery ? `“${query}” 的搜索结果` : "热门影片推荐";
        }

        searchResults.innerHTML = pool.slice(0, 240).map(renderSearchCard).join("");

        if (empty) {
            empty.hidden = pool.length > 0;
        }
    }

    function escapeText(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function renderSearchCard(movie) {
        const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeText(tag)}</span>`).join("");

        return `
            <article class="movie-card" data-movie-card>
                <a class="poster-link" href="${escapeText(movie.url)}" aria-label="观看 ${escapeText(movie.title)}">
                    <img src="${escapeText(movie.cover)}" alt="${escapeText(movie.title)}" loading="lazy" decoding="async">
                    <span class="card-glow"></span>
                    <span class="card-play">▶</span>
                    <span class="card-badge">${escapeText(movie.region)}</span>
                </a>
                <div class="card-body">
                    <div class="card-meta">
                        <span>${escapeText(movie.year)}</span>
                        <span>${escapeText(movie.type)}</span>
                    </div>
                    <h3><a href="${escapeText(movie.url)}">${escapeText(movie.title)}</a></h3>
                    <p>${escapeText(movie.oneLine)}</p>
                    <div class="tag-row">${tags}</div>
                </div>
            </article>
        `;
    }
})();
