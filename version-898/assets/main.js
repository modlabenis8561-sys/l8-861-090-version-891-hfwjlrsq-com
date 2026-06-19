(function () {
    var hlsScriptLoading = false;
    var hlsCallbacks = [];

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        hlsCallbacks.push(callback);

        if (hlsScriptLoading) {
            return;
        }

        hlsScriptLoading = true;
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
        script.async = true;
        script.onload = function () {
            hlsScriptLoading = false;
            var callbacks = hlsCallbacks.slice();
            hlsCallbacks = [];
            callbacks.forEach(function (item) {
                item();
            });
        };
        script.onerror = function () {
            hlsScriptLoading = false;
            hlsCallbacks = [];
        };
        document.head.appendChild(script);
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === current);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function initFilters() {
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        if (!cards.length) {
            return;
        }

        var state = {
            keyword: '',
            filter: 'all'
        };

        function apply() {
            var keyword = state.keyword.trim().toLowerCase();
            var filter = state.filter;

            cards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var keywordMatch = !keyword || search.indexOf(keyword) !== -1;
                var filterMatch = filter === 'all' || search.indexOf(filter.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(keywordMatch && filterMatch));
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener('input', function () {
                state.keyword = input.value || '';
                searchInputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = state.keyword;
                    }
                });
                apply();
            });
        });

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                state.filter = chip.getAttribute('data-filter-value') || 'all';
                chips.forEach(function (other) {
                    other.classList.toggle('is-active', other.getAttribute('data-filter-value') === state.filter);
                });
                apply();
            });
        });
    }

    function startVideo(player) {
        if (!player || player.getAttribute('data-ready') === 'true') {
            return;
        }

        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');

        if (!source) {
            return;
        }

        player.setAttribute('data-ready', 'true');

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }

        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = source;
                video.play().catch(function () {});
            }
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var overlay = player.querySelector('.player-overlay');
            var video = player.querySelector('video');

            if (overlay) {
                overlay.addEventListener('click', function () {
                    startVideo(player);
                });
            }

            if (video) {
                video.addEventListener('click', function () {
                    startVideo(player);
                }, { once: true });
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
