(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("is-open");
                toggle.classList.toggle("is-open", open);
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === activeIndex);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === activeIndex);
            });
        }

        function startTimer() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }

            startTimer();
        }

        if (slides.length) {
            showSlide(0);
            startTimer();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                restartTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restartTimer();
            });
        });

        var filterGrids = Array.prototype.slice.call(document.querySelectorAll(".filter-grid"));

        filterGrids.forEach(function (grid) {
            var section = grid.closest("section") || document;
            var input = section.querySelector(".filter-input");
            var yearSelect = section.querySelector(".filter-year");
            var regionSelect = section.querySelector(".filter-region");
            var typeSelect = section.querySelector(".filter-type");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var empty = document.createElement("div");
            empty.className = "filter-empty";
            empty.textContent = "没有匹配的影片";

            function uniqueValues(attribute) {
                var values = cards.map(function (card) {
                    return card.getAttribute(attribute) || "";
                }).filter(Boolean);

                return Array.from(new Set(values)).sort(function (a, b) {
                    return String(b).localeCompare(String(a), "zh-CN");
                });
            }

            function fillSelect(select, attribute) {
                if (!select) {
                    return;
                }

                uniqueValues(attribute).forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            }

            function applyQueryParameter() {
                if (!input) {
                    return;
                }

                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");

                if (query) {
                    input.value = query;
                }
            }

            function filterCards() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var region = regionSelect ? regionSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var matched = true;
                    var text = (card.getAttribute("data-search") || "").toLowerCase();

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }

                    if (year && card.getAttribute("data-year") !== year) {
                        matched = false;
                    }

                    if (region && card.getAttribute("data-region") !== region) {
                        matched = false;
                    }

                    if (type && card.getAttribute("data-type") !== type) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";

                    if (matched) {
                        visible += 1;
                    }
                });

                if (!visible) {
                    if (!empty.parentNode) {
                        grid.appendChild(empty);
                    }
                } else if (empty.parentNode) {
                    empty.parentNode.removeChild(empty);
                }
            }

            fillSelect(yearSelect, "data-year");
            fillSelect(regionSelect, "data-region");
            fillSelect(typeSelect, "data-type");
            applyQueryParameter();

            [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filterCards);
                    control.addEventListener("change", filterCards);
                }
            });

            filterCards();
        });
    });
})();
