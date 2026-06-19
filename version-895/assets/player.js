(function () {
    function bindSource(video, source) {
        if (!video || !source) {
            return null;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return hls;
        }
        video.src = source;
        return null;
    }

    window.initMoviePlayer = function (source, videoId, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls = bindSource(video, source);

        function play() {
            if (!video) {
                return;
            }
            if (overlay) {
                overlay.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove("hidden");
                }
            });
            video.addEventListener("ended", function () {
                if (overlay) {
                    overlay.classList.remove("hidden");
                }
            });
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }

        return hls;
    };
})();
