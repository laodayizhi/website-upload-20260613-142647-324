(function () {
    var hlsPromise = null;

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('HLS unavailable'));
                }
            };
            script.onerror = function () {
                reject(new Error('HLS unavailable'));
            };
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function setupPlayer(stage) {
        var video = stage.querySelector('video');
        var button = stage.querySelector('.player-button');
        var errorBox = stage.querySelector('.player-error');
        var source = video ? video.getAttribute('data-src') : '';
        var initialized = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function setError(message) {
            if (errorBox) {
                errorBox.textContent = message || '';
            }
        }

        function initialize() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;
            setError('');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }
            return loadHlsLibrary().then(function (Hls) {
                if (Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            setError('网络连接暂时不稳定，正在重新加载。');
                            hlsInstance.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            setError('媒体解码异常，正在恢复播放。');
                            hlsInstance.recoverMediaError();
                        } else {
                            setError('当前浏览器暂时无法播放该视频。');
                            hlsInstance.destroy();
                        }
                    });
                } else {
                    video.src = source;
                }
            }).catch(function () {
                video.src = source;
            });
        }

        function play() {
            initialize().then(function () {
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {
                        setError('点击视频区域即可继续播放。');
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

        stage.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            play();
        });

        video.addEventListener('play', function () {
            stage.classList.add('playing');
            setError('');
        });

        video.addEventListener('pause', function () {
            stage.classList.remove('playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
    });
}());
