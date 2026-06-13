(function () {
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle("is-active", current === activeSlide);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle("is-active", current === activeSlide);
    });
  }

  function nextSlide() {
    showSlide(activeSlide + 1);
  }

  if (slides.length > 1) {
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-go-slide"));
        showSlide(target);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(nextSlide, 5200);
      });
    });
    timer = window.setInterval(nextSlide, 5200);
  }

  var globalSearch = document.getElementById("globalSearch");
  var clearSearch = document.getElementById("clearSearch");
  var searchResults = document.getElementById("searchResults");

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function renderSearch(items) {
    if (!searchResults) {
      return;
    }
    searchResults.innerHTML = "";
    items.slice(0, 12).forEach(function (movie) {
      var link = document.createElement("a");
      link.className = "search-card";
      link.href = "./" + movie.file;

      var img = document.createElement("img");
      img.src = movie.cover;
      img.alt = movie.title;
      img.loading = "lazy";

      var body = document.createElement("div");
      var title = document.createElement("strong");
      var meta = document.createElement("span");
      title.textContent = movie.title;
      meta.textContent = movie.year + " · " + movie.region + " · " + movie.genre;
      body.appendChild(title);
      body.appendChild(meta);
      link.appendChild(img);
      link.appendChild(body);
      searchResults.appendChild(link);
    });
  }

  if (globalSearch && searchResults && Array.isArray(window.SEARCH_INDEX)) {
    globalSearch.addEventListener("input", function () {
      var keyword = normalize(globalSearch.value);
      if (!keyword) {
        searchResults.innerHTML = "";
        return;
      }
      var matches = window.SEARCH_INDEX.filter(function (movie) {
        return normalize(movie.search).indexOf(keyword) !== -1;
      });
      renderSearch(matches);
    });
  }

  if (clearSearch && globalSearch && searchResults) {
    clearSearch.addEventListener("click", function () {
      globalSearch.value = "";
      searchResults.innerHTML = "";
      globalSearch.focus();
    });
  }

  var pageFilter = document.getElementById("pageFilter");
  var filterScope = document.getElementById("filterScope");

  if (pageFilter && filterScope) {
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll(".movie-card"));
    var empty = document.createElement("div");
    empty.className = "empty-filter";
    empty.textContent = "暂无匹配内容";

    pageFilter.addEventListener("input", function () {
      var keyword = normalize(pageFilter.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (!visible && !empty.parentNode) {
        filterScope.appendChild(empty);
      }
      if (visible && empty.parentNode) {
        empty.parentNode.removeChild(empty);
      }
    });
  }
}());
