(function () {
  window.initVideoPlayer = function (playUrl) {
    var video = document.querySelector(".media-video");
    var cover = document.querySelector(".play-cover");
    var status = document.querySelector(".player-status");
    var hls = null;
    var loaded = false;

    if (!video || !playUrl) {
      return;
    }

    function setStatus(text) {
      if (!status) {
        return;
      }
      status.textContent = text || "";
      status.hidden = !text;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          setStatus("点击播放");
        });
      }
    }

    function loadVideo() {
      if (loaded) {
        return;
      }
      loaded = true;
      setStatus("正在加载影片");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playUrl;
        video.load();
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (hls) {
              hls.destroy();
              hls = null;
            }
            video.src = playUrl;
            video.load();
            playVideo();
          }
        });
        return;
      }
      video.src = playUrl;
      video.load();
      playVideo();
    }

    function start() {
      hideCover();
      loadVideo();
      playVideo();
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("playing", function () {
      setStatus("");
      hideCover();
    });
    video.addEventListener("pause", function () {
      setStatus("");
    });
    video.addEventListener("error", function () {
      setStatus("播放遇到问题，请稍后重试");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
