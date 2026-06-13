import { H as Hls } from "./hls-vendor.js";

const dataElement = document.getElementById("player-data");
const video = document.getElementById("player");
const playButton = document.getElementById("play-button");
const shell = document.querySelector("[data-player-shell]");
let hlsInstance = null;
let ready = false;

function readConfig() {
  if (!dataElement) {
    return null;
  }

  try {
    return JSON.parse(dataElement.textContent || "{}");
  } catch (error) {
    return null;
  }
}

function attachStream(stream) {
  if (!video || !stream) {
    return;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });
    hlsInstance.loadSource(stream);
    hlsInstance.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = stream;
  }

  ready = true;
}

function beginPlayback() {
  const config = readConfig();

  if (!config || !video) {
    return;
  }

  if (!ready) {
    attachStream(config.stream);
  }

  if (shell) {
    shell.classList.add("is-playing");
  }

  const playPromise = video.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(function () {
      video.controls = true;
    });
  }
}

if (playButton) {
  playButton.addEventListener("click", beginPlayback);
}

if (video) {
  video.addEventListener("play", function () {
    if (shell) {
      shell.classList.add("is-playing");
    }
  });

  video.addEventListener("emptied", function () {
    ready = false;
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
