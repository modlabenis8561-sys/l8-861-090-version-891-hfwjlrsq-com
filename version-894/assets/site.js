(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = nav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

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

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-search"));
        inputs.forEach(function (input) {
            var section = input.closest(".section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var chips = Array.prototype.slice.call(section.querySelectorAll(".filter-chip"));
            var activeFilter = "all";

            function cardText(card) {
                return normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category")
                ].join(" "));
            }

            function apply() {
                var query = normalize(input.value);
                cards.forEach(function (card) {
                    var text = cardText(card);
                    var category = normalize(card.getAttribute("data-category"));
                    var matchesText = !query || text.indexOf(query) !== -1;
                    var matchesFilter = activeFilter === "all" || text.indexOf(activeFilter) !== -1 || category === activeFilter;
                    card.classList.toggle("search-hidden", !(matchesText && matchesFilter));
                });
            }

            input.addEventListener("input", apply);
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    chip.classList.add("active");
                    activeFilter = normalize(chip.getAttribute("data-filter") || "all");
                    apply();
                });
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
    });
}());

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playButton");
    if (!video || !button || !streamUrl) {
        return;
    }
    var attached = false;
    var hlsInstance = null;

    function attachMedia() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playMedia() {
        attachMedia();
        video.controls = true;
        button.classList.add("is-hidden");
        var playAction = video.play();
        if (playAction && typeof playAction.catch === "function") {
            playAction.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", playMedia);
    video.addEventListener("click", function () {
        if (video.paused) {
            playMedia();
        } else {
            video.pause();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
