(function () {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

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

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  const filterRoot = document.querySelector("[data-filter-root]");

  if (filterRoot) {
    const input = filterRoot.querySelector("[data-filter-input]");
    const year = filterRoot.querySelector("[data-year-filter]");
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (input && input.hasAttribute("data-page-search")) {
      input.value = query;
    }

    const normalize = function (value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    };

    const apply = function () {
      const keyword = normalize(input ? input.value : "");
      const selectedYear = year ? year.value : "";

      cards.forEach(function (card) {
        const text = normalize(card.getAttribute("data-search"));
        const cardYear = card.getAttribute("data-year") || "";
        const matchText = !keyword || text.includes(keyword);
        const matchYear = !selectedYear || cardYear === selectedYear;
        card.hidden = !(matchText && matchYear);
      });
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    if (year) {
      year.addEventListener("change", apply);
    }

    apply();
  }
})();
