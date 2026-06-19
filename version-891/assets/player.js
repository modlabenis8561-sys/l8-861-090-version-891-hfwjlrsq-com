(function () {
    function playVideo(video) {
        var address = video.getAttribute('src');
        var wrapper = video.closest('.player-shell');
        var overlay = wrapper ? wrapper.querySelector('.player-overlay') : null;
        var started = video.getAttribute('data-started') === '1';
        function begin() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }
        if (!started) {
            video.setAttribute('data-started', '1');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = address;
                video.load();
                begin();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video.removeAttribute('src');
                video.load();
                hls.loadSource(address);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, begin);
                return;
            }
            video.src = address;
            video.load();
        }
        begin();
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.player-shell').forEach(function (wrapper) {
            var video = wrapper.querySelector('.movie-player');
            var overlay = wrapper.querySelector('.player-overlay');
            if (!video) {
                return;
            }
            if (overlay) {
                overlay.addEventListener('click', function () {
                    playVideo(video);
                });
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo(video);
                }
            });
        });
    });
}());
