(function () {
    function addHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader="ready"]');
        if (existing) {
            existing.addEventListener('load', callback);
            existing.addEventListener('error', callback);
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'ready');
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function startPlayer(player) {
        var video = player.querySelector('video');
        var stream = player.getAttribute('data-stream');
        if (!video || !stream) {
            return;
        }
        if (player.getAttribute('data-ready') === 'true') {
            player.classList.add('playing');
            video.play().catch(function () {});
            return;
        }
        player.setAttribute('data-ready', 'true');
        player.classList.add('playing');
        addHls(function () {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        video.src = stream;
                    }
                });
                return;
            }
            video.src = stream;
            video.play().catch(function () {});
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(function (player) {
        var button = player.querySelector('.play-overlay');
        var video = player.querySelector('video');
        if (button) {
            button.addEventListener('click', function () {
                startPlayer(player);
            });
        }
        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('playing');
            });
        }
    });
})();
