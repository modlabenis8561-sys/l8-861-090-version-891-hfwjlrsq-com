(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const searchInputs = document.querySelectorAll("[data-search-input]");

  searchInputs.forEach(function (input) {
    const scope = input.closest("main") || document;
    const cards = Array.from(scope.querySelectorAll(".movie-card"));

    input.addEventListener("input", function () {
      const query = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();

        card.classList.toggle("is-hidden-by-search", query !== "" && !haystack.includes(query));
      });
    });
  });

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
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
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        reset();
      });
    });

    showSlide(0);
    start();
  }
})();
