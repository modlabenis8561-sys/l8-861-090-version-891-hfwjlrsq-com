(function () {
    function setActiveSlide(carousel, index) {
        var slides = carousel.querySelectorAll('.hero-slide');
        var dots = carousel.querySelectorAll('.hero-dot');
        if (!slides.length) {
            return;
        }
        var nextIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === nextIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === nextIndex);
        });
        carousel.setAttribute('data-active-slide', String(nextIndex));
    }

    function initHero() {
        document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
            var slides = carousel.querySelectorAll('.hero-slide');
            if (slides.length < 2) {
                return;
            }
            var current = 0;
            var prev = carousel.querySelector('.hero-prev');
            var next = carousel.querySelector('.hero-next');
            var dots = carousel.querySelectorAll('.hero-dot');
            var go = function (index) {
                current = (index + slides.length) % slides.length;
                setActiveSlide(carousel, current);
            };
            if (prev) {
                prev.addEventListener('click', function () {
                    go(current - 1);
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    go(current + 1);
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    go(Number(dot.getAttribute('data-slide') || 0));
                });
            });
            setInterval(function () {
                go(current + 1);
            }, 5200);
        });
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFiltering() {
        var input = document.querySelector('[data-page-search]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
        var empty = document.querySelector('.empty-state');
        if (!cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var activeFilter = 'all';
        if (input && query) {
            input.value = query;
        }
        function apply() {
            var text = normalize(input ? input.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
                var filterMatch = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
                var textMatch = !text || haystack.indexOf(text) !== -1;
                var show = filterMatch && textMatch;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                activeFilter = chip.getAttribute('data-filter') || 'all';
                apply();
            });
        });
        apply();
    }

    function initHeaderSearch() {
        document.querySelectorAll('.header-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                event.preventDefault();
                var target = form.getAttribute('action') || 'search.html';
                window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFiltering();
        initHeaderSearch();
    });
}());
