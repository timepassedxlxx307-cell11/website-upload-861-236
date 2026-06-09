(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));

        boxes.forEach(function (box) {
            var video = box.querySelector('video');
            var trigger = box.querySelector('[data-player-trigger]');
            var stream = video ? video.getAttribute('data-stream') : '';
            var loaded = false;
            var hls = null;

            function attach() {
                if (!video || !stream || loaded) {
                    return;
                }
                loaded = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                }
            }

            function start(event) {
                if (event && event.type === 'click') {
                    event.preventDefault();
                }
                attach();
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (trigger) {
                            trigger.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (trigger) {
                trigger.addEventListener('click', start);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (!loaded) {
                        start();
                    }
                });
                video.addEventListener('play', function () {
                    if (trigger) {
                        trigger.classList.add('is-hidden');
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
})();
