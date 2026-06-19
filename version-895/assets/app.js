(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function items(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = items("[data-hero-slide]", slider);
        var dots = items("[data-hero-dot]", slider);
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var inputs = items("[data-search-input]");
        if (!inputs.length) {
            return;
        }
        inputs.forEach(function (input) {
            var section = input.closest("section") || document;
            var root = section.querySelector(".movie-grid") ? section : document;
            var cards = items("[data-card]", root);
            var typeSelect = root.querySelector("[data-filter-type]");
            var yearSelect = root.querySelector("[data-filter-year]");
            var empty = root.querySelector("[data-empty-message]");

            function apply() {
                var query = normalize(input.value);
                var type = normalize(typeSelect ? typeSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var cardType = normalize(card.dataset.type);
                    var cardYear = normalize(card.dataset.year);
                    var matched = (!query || text.indexOf(query) !== -1) && (!type || cardType.indexOf(type) !== -1) && (!year || cardYear === year);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            input.addEventListener("input", apply);
            if (typeSelect) {
                typeSelect.addEventListener("change", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
