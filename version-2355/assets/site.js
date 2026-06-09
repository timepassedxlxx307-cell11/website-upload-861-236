(function() {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function() {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function() {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function(dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function() {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            dots.forEach(function(dot) {
                dot.addEventListener("click", function() {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function() {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function() {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function(form) {
            var scope = form.closest("main") || document;
            var input = form.querySelector("[data-filter-input]");
            var select = form.querySelector("[data-filter-select]");
            var list = scope.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var items = Array.prototype.slice.call(list.children);
            var params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
            }

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var year = select ? select.value : "";
                items.forEach(function(item) {
                    var haystack = [
                        item.getAttribute("data-title") || "",
                        item.getAttribute("data-region") || "",
                        item.getAttribute("data-year") || "",
                        item.getAttribute("data-genre") || "",
                        item.getAttribute("data-category") || "",
                        item.textContent || ""
                    ].join(" ").toLowerCase();
                    var yearText = item.getAttribute("data-year") || "";
                    var matched = (!query || haystack.indexOf(query) !== -1) && (!year || yearText.indexOf(year) !== -1);
                    item.classList.toggle("is-filter-hidden", !matched);
                });
            }

            form.addEventListener("submit", function(event) {
                event.preventDefault();
                applyFilter();
            });
            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (select) {
                select.addEventListener("change", applyFilter);
            }
            applyFilter();
        });
    });

    window.initMoviePlayer = function(streamUrl) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        if (!video || !streamUrl) {
            return;
        }
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function begin() {
            attach();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function() {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", begin);
        }
        video.addEventListener("click", function() {
            if (!attached || video.paused) {
                begin();
            }
        });
        window.addEventListener("beforeunload", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
