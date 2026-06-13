(function () {
  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initSearchRedirects() {
    toArray(document.querySelectorAll(".search-redirect")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("data-target") || "search.html";
        if (query) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = toArray(hero.querySelectorAll(".hero-slide"));
    var dots = toArray(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function initFilters() {
    toArray(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
      var input = scope.querySelector(".filter-input");
      var selects = toArray(scope.querySelectorAll(".filter-select"));
      var cards = toArray(scope.querySelectorAll(".movie-card"));

      if (input && input.classList.contains("main-search-input")) {
        input.value = getQueryParam("q");
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var filters = selects.map(function (select) {
          return {
            name: select.getAttribute("data-filter"),
            value: normalize(select.value)
          };
        });
        cards.forEach(function (card) {
          var searchable = normalize(card.getAttribute("data-search"));
          var matchesQuery = !query || searchable.indexOf(query) !== -1;
          var matchesFilters = filters.every(function (filter) {
            if (!filter.value) {
              return true;
            }
            return normalize(card.getAttribute("data-" + filter.name)).indexOf(filter.value) !== -1;
          });
          card.classList.toggle("is-hidden", !(matchesQuery && matchesFilters));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initSearchRedirects();
    initHero();
    initFilters();
  });
})();
