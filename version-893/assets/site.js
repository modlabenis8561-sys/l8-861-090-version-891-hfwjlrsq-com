(function () {
    var MovieSite = {
        initNavigation: function () {
            var button = document.querySelector('.nav-toggle');
            var nav = document.querySelector('.mobile-nav');
            if (!button || !nav) {
                return;
            }
            button.addEventListener('click', function () {
                var isOpen = nav.classList.toggle('open');
                button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        },
        initHero: function () {
            var root = document.querySelector('[data-hero]');
            if (!root) {
                return;
            }
            var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
            if (slides.length <= 1) {
                return;
            }
            var current = 0;
            var timer = null;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            };
            var start = function () {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5600);
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    if (timer) {
                        window.clearInterval(timer);
                    }
                    show(index);
                    start();
                });
            });
            show(0);
            start();
        },
        initFilters: function () {
            var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
            panels.forEach(function (panel) {
                var input = panel.querySelector('[data-filter-input]');
                var scopeName = panel.getAttribute('data-filter-panel');
                var scope = document.querySelector('[data-filter-list="' + scopeName + '"]');
                if (!input || !scope) {
                    return;
                }
                var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
                var empty = document.querySelector('[data-empty-for="' + scopeName + '"]');
                input.addEventListener('input', function () {
                    var value = input.value.trim().toLowerCase();
                    var visible = 0;
                    cards.forEach(function (card) {
                        var haystack = [
                            card.getAttribute('data-title') || '',
                            card.getAttribute('data-region') || '',
                            card.getAttribute('data-tags') || '',
                            card.textContent || ''
                        ].join(' ').toLowerCase();
                        var matched = !value || haystack.indexOf(value) !== -1;
                        card.style.display = matched ? '' : 'none';
                        if (matched) {
                            visible += 1;
                        }
                    });
                    if (empty) {
                        empty.classList.toggle('visible', visible === 0);
                    }
                });
            });
        },
        initPlayer: function (sourceUrl) {
            var setup = function () {
                var video = document.getElementById('movie-player');
                var overlay = document.getElementById('player-cover');
                if (!video || !overlay || !sourceUrl) {
                    return;
                }
                var loaded = false;
                var hlsInstance = null;
                var load = function () {
                    if (loaded) {
                        return;
                    }
                    loaded = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = sourceUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true });
                        hlsInstance.loadSource(sourceUrl);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = sourceUrl;
                    }
                };
                var play = function () {
                    load();
                    overlay.classList.add('hidden');
                    var promise = video.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(function () {
                            overlay.classList.remove('hidden');
                        });
                    }
                };
                overlay.addEventListener('click', play);
                video.addEventListener('click', function () {
                    if (!loaded || video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener('play', function () {
                    overlay.classList.add('hidden');
                });
                video.addEventListener('pause', function () {
                    if (loaded && video.currentTime > 0 && !video.ended) {
                        overlay.classList.remove('hidden');
                    }
                });
                video.addEventListener('ended', function () {
                    overlay.classList.remove('hidden');
                });
                window.addEventListener('pagehide', function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                });
            };
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', setup);
            } else {
                setup();
            }
        }
    };
    window.MovieSite = MovieSite;
    var init = function () {
        MovieSite.initNavigation();
        MovieSite.initHero();
        MovieSite.initFilters();
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
