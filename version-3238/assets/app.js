document.addEventListener('DOMContentLoaded', function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    startHero();
  }

  var filterInput = document.querySelector('[data-card-filter]');
  var cardList = document.querySelector('[data-card-list]');

  function applyFilter(value) {
    if (!cardList) {
      return;
    }
    var query = (value || '').trim().toLowerCase();
    cardList.querySelectorAll('.movie-card').forEach(function (card) {
      var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-hidden', Boolean(query) && text.indexOf(query) === -1);
    });
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      filterInput.value = query;
    }
    applyFilter(filterInput.value);
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }

  document.querySelectorAll('[data-search-page-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('[data-card-filter]');
      applyFilter(input ? input.value : '');
      if (input && input.value.trim()) {
        var url = new URL(window.location.href);
        url.searchParams.set('q', input.value.trim());
        window.history.replaceState({}, '', url.toString());
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');

    function beginPlayback() {
      if (!video || !button) {
        return;
      }
      var stream = button.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      shell.classList.add('is-playing');
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
        video._hlsInstance = null;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        video._hlsInstance = hls;
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = stream;
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', beginPlayback);
    }

    shell.addEventListener('click', function (event) {
      if (!shell.classList.contains('is-playing') && event.target !== button) {
        beginPlayback();
      }
    });
  });
});
