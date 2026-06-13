import { H as Hls } from "./hls-vendor.js";

export function startMoviePlayer(sourceUrl) {
    const video = document.getElementById("movie-player");
    const overlay = document.getElementById("player-overlay");
    const message = document.getElementById("player-message");

    if (!video || !overlay || !sourceUrl) {
        return;
    }

    let initialized = false;
    let hls = null;

    const showMessage = () => {
        if (message) {
            message.hidden = false;
        }
    };

    const hideMessage = () => {
        if (message) {
            message.hidden = true;
        }
    };

    const requestPlay = () => {
        hideMessage();
        overlay.classList.add("is-hidden");
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                overlay.classList.remove("is-hidden");
                showMessage();
            });
        }
    };

    const attachSource = () => {
        if (initialized) {
            requestPlay();
            return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            requestPlay();
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, requestPlay);
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }

                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }

                showMessage();
            });
            return;
        }

        video.src = sourceUrl;
        requestPlay();
    };

    overlay.addEventListener("click", attachSource);
    video.addEventListener("click", () => {
        if (!initialized) {
            attachSource();
        }
    });

    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
