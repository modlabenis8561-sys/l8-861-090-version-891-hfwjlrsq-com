(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function textOf(card) {
    return [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.tags
    ].join(" ").toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
    show(0);
  }

  function initSearch() {
    var search = document.querySelector("[data-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var filterBar = document.querySelector("[data-filter-bar]");
    var empty = document.querySelector("[data-empty]");
    if (!search || !cards.length) {
      return;
    }
    var activeFilter = "all";
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      search.value = q;
    }
    function apply() {
      var term = search.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = textOf(card);
        var matchText = !term || haystack.indexOf(term) !== -1;
        var matchFilter = activeFilter === "all" || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        var visible = matchText && matchFilter;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    }
    search.addEventListener("input", apply);
    if (filterBar) {
      Array.prototype.slice.call(filterBar.querySelectorAll("[data-filter]")).forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.dataset.filter || "all";
          Array.prototype.slice.call(filterBar.querySelectorAll("[data-filter]")).forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
    }
    apply();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playerPlay");
    if (!video || !streamUrl) {
      return;
    }
    var started = false;
    function bind() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function start() {
      bind();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
  };

  ready(function () {
    initMenu();
    initHeroSlider();
    initSearch();
  });
})();
