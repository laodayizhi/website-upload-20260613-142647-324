(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = selectAll(".hero-slide", slider);
        var dots = selectAll(".hero-dot", slider);
        var previous = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var active = 0;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === active);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === active);
            });
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(active - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
    }

    function filterCards(input) {
        var scope = input.closest("main") || document;
        var cards = selectAll(".movie-card", scope);
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
            var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
            card.classList.toggle("is-hidden-card", value !== "" && text.indexOf(value) === -1);
        });
    }

    function initFilters() {
        selectAll(".filter-input").forEach(function (input) {
            input.addEventListener("input", function () {
                filterCards(input);
            });
        });
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get("q");
        if (keyword) {
            selectAll(".search-page-input").forEach(function (input) {
                input.value = keyword;
                filterCards(input);
            });
        }
    }

    window.SitePlayer = {
        init: function (streamUrl) {
            onReady(function () {
                var video = document.getElementById("movie-player");
                var overlay = document.querySelector(".player-overlay");
                var started = false;
                var playerInstance = null;

                if (!video || !overlay || !streamUrl) {
                    return;
                }

                function start() {
                    if (!started) {
                        started = true;
                        if (video.canPlayType("application/vnd.apple.mpegurl")) {
                            video.src = streamUrl;
                            video.load();
                        } else if (window.Hls && window.Hls.isSupported()) {
                            playerInstance = new window.Hls({
                                enableWorker: true,
                                lowLatencyMode: true
                            });
                            playerInstance.loadSource(streamUrl);
                            playerInstance.attachMedia(video);
                        } else {
                            video.src = streamUrl;
                            video.load();
                        }
                    }
                    overlay.classList.add("is-hidden");
                    video.controls = true;
                    var playTask = video.play();
                    if (playTask && typeof playTask.catch === "function") {
                        playTask.catch(function () {});
                    }
                }

                overlay.addEventListener("click", start);
                video.addEventListener("click", function () {
                    if (!started || video.paused) {
                        start();
                    }
                });
                window.addEventListener("pagehide", function () {
                    if (playerInstance && typeof playerInstance.destroy === "function") {
                        playerInstance.destroy();
                    }
                });
            });
        }
    };

    onReady(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
