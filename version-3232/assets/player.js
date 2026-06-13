(function () {
    function initPlayer() {
        var video = document.getElementById("movie-video");
        var button = document.getElementById("movie-play");
        var layer = document.querySelector(".play-layer");
        if (!video || !button) {
            return;
        }

        var url = button.getAttribute("data-url");
        var bound = false;
        var hlsInstance = null;

        function bindSource() {
            if (bound || !url) {
                return;
            }
            bound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
                return;
            }
            video.src = url;
        }

        function start() {
            bindSource();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    if (document.readyState !== "loading") {
        initPlayer();
    } else {
        document.addEventListener("DOMContentLoaded", initPlayer);
    }
}());
