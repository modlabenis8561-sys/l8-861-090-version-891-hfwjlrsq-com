(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    var panel = document.querySelector('.search-panel');
    var cards = all('.movie-card');
    if (!panel || !cards.length) {
      return;
    }
    var input = panel.querySelector('.js-search-input');
    var filters = all('.js-filter', panel);
    var emptyState = panel.querySelector('[data-empty-state]');
    function text(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
    }
    function selected(name) {
      var item = filters.find(function (select) {
        return select.getAttribute('data-filter') === name;
      });
      return item ? item.value : '';
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = selected('year');
      var type = selected('type');
      var category = selected('category');
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        if (query && text(card).indexOf(query) === -1) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        if (category && card.getAttribute('data-category') !== category) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    filters.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  function initPlayers() {
    all('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-trigger');
      var status = shell.querySelector('[data-player-status]');
      var source = shell.getAttribute('data-src');
      var hlsInstance = null;
      if (!video || !source) {
        return;
      }
      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }
      function load() {
        if (video.getAttribute('data-ready') === 'true') {
          return Promise.resolve();
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.setAttribute('data-ready', 'true');
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          video.setAttribute('data-ready', 'true');
          return Promise.resolve();
        }
        video.src = source;
        video.setAttribute('data-ready', 'true');
        return Promise.resolve();
      }
      function play() {
        setStatus('正在加载片源');
        load().then(function () {
          var result = video.play();
          shell.classList.add('is-playing');
          setStatus('正在播放');
          if (result && typeof result.catch === 'function') {
            result.catch(function () {
              setStatus('请点击播放器继续播放');
            });
          }
        });
      }
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }
      shell.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        play();
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setStatus('正在播放');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          setStatus('已暂停');
        }
      });
      video.addEventListener('ended', function () {
        setStatus('播放结束');
      });
      video.addEventListener('error', function () {
        setStatus('片源加载失败，请刷新后重试');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
}());
