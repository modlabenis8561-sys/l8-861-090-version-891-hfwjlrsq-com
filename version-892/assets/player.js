function setupPlayer(videoId, overlayId, streamUrl) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);

  if (!video || !overlay || !streamUrl) {
    return;
  }

  let ready = false;
  let hls = null;

  function attachStream() {
    if (ready) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = streamUrl;
    ready = true;
  }

  function begin() {
    attachStream();
    overlay.classList.add("is-hidden");
    const attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", begin);
  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
