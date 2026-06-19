(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobileMenu.classList.contains("is-open"));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var current = 0;
      var showSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
      showSlide(0);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    searchInputs.forEach(function (input) {
      var scope = input.closest("[data-filter-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var noResults = scope.querySelector("[data-no-results]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
      var activeType = "all";

      var update = function () {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var type = (card.getAttribute("data-type") || "").toLowerCase();
          var typeMatch = activeType === "all" || type.indexOf(activeType.toLowerCase()) !== -1;
          var textMatch = !query || text.indexOf(query) !== -1;
          var shouldShow = typeMatch && textMatch;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });
        if (noResults) {
          noResults.classList.toggle("is-visible", visible === 0);
        }
      };

      input.addEventListener("input", update);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeType = button.getAttribute("data-filter-button") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          update();
        });
      });
      update();
    });
  });
})();

function initMoviePlayer(streamUrl) {
  var player = document.querySelector("[data-player]");
  if (!player) {
    return;
  }
  var video = player.querySelector("video");
  var overlay = player.querySelector(".player-overlay");
  var button = player.querySelector("[data-play-button]");
  var prepared = false;
  var hlsInstance = null;

  var prepare = function () {
    if (prepared || !video) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  };

  var start = function () {
    prepare();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  };

  if (button) {
    button.addEventListener("click", start);
  }
  if (overlay) {
    overlay.addEventListener("click", start);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
