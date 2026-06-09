(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.site-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('#heroSlider');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var prev = slider.querySelector('.hero-prev');
        var next = slider.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle('is-active', pos === index);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle('is-active', pos === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                play();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.search-input, .listing-search'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('.no-results');
        if (!inputs.length || !cards.length) {
            return;
        }

        function apply(value) {
            var text = value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-region') || ''
                ].join(' ').toLowerCase();
                var match = !text || haystack.indexOf(text) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                inputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                apply(input.value);
            });
        });
    }

    function setupFilters() {
        var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        if (!chips.length || !cards.length) {
            return;
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var value = chip.getAttribute('data-filter') || '';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                cards.forEach(function (card) {
                    var genre = card.getAttribute('data-genre') || '';
                    var tags = card.getAttribute('data-tags') || '';
                    var match = !value || genre.indexOf(value) !== -1 || tags.indexOf(value) !== -1;
                    card.style.display = match ? '' : 'none';
                });
            });
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.player-cover');
            var stream = shell.getAttribute('data-stream');
            var initialized = false;
            var hls = null;

            function bind() {
                if (!video || !stream || initialized) {
                    return;
                }
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function start() {
                bind();
                shell.classList.add('is-playing');
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', start);
            }
            if (video) {
                video.addEventListener('play', function () {
                    shell.classList.add('is-playing');
                });
            }
            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupFilters();
        setupPlayers();
    });
})();
