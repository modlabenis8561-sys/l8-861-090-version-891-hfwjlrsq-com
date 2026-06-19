(function () {
    window.setupMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("movie-video");
        var startButton = document.getElementById("video-start");
        var hlsInstance = null;
        var initialized = false;

        if (!video || !startButton || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (initialized) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }

            initialized = true;
        }

        function startVideo() {
            attachSource();
            video.controls = true;
            startButton.classList.add("is-hidden");

            var playAction = video.play();

            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {
                    startButton.classList.remove("is-hidden");
                });
            }
        }

        startButton.addEventListener("click", startVideo);

        video.addEventListener("click", function () {
            if (video.paused) {
                startVideo();
            }
        });

        video.addEventListener("play", function () {
            startButton.classList.add("is-hidden");
        });

        video.addEventListener("ended", function () {
            if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
                hlsInstance.stopLoad();
            }
        });
    };
})();
