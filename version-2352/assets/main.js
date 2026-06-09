(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === current);
                });
            }

            function play() {
                stop();
                timer = setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    play();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    play();
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    play();
                });
            });

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', play);
            show(0);
            play();
        }

        var input = document.querySelector('[data-page-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-key]'));
        var activeKey = '';

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var key = activeKey.toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var passKeyword = !keyword || text.indexOf(keyword) !== -1;
                var passKey = !key || text.indexOf(key) !== -1;
                card.classList.toggle('is-hidden', !(passKeyword && passKey));
            });
        }

        if (input && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', applyFilter);
            applyFilter();
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeKey = button.getAttribute('data-filter-key') || '';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });
    });
})();
