document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var query = input ? input.value.trim() : "";
            var target = form.getAttribute("action") || "search.html";
            if (query) {
                window.location.href = target + "?q=" + encodeURIComponent(query);
            } else {
                window.location.href = target;
            }
        });
    });

    var carousel = document.querySelector(".hero-carousel");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var next = carousel.querySelector("[data-hero-next]");
        var prev = carousel.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        show(0);
        start();
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var searchInput = document.querySelector("[data-page-search]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    function applySearch(value) {
        var query = (value || "").trim().toLowerCase();
        cards.forEach(function (card) {
            var haystack = (card.getAttribute("data-search") || "").toLowerCase();
            card.classList.toggle("is-hidden-card", query && haystack.indexOf(query) === -1);
        });
    }

    if (searchInput) {
        searchInput.value = initialQuery;
        applySearch(initialQuery);
        searchInput.addEventListener("input", function () {
            applySearch(searchInput.value);
        });
    }

    document.querySelectorAll(".filter-button[data-filter]").forEach(function (button) {
        button.addEventListener("click", function () {
            var filter = button.getAttribute("data-filter") || "all";
            var group = button.closest(".filter-bar");
            if (group) {
                group.querySelectorAll(".filter-button").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
            }
            cards.forEach(function (card) {
                var type = card.getAttribute("data-type") || "";
                var year = parseInt(card.getAttribute("data-year") || "0", 10);
                var match = filter === "all" || type.indexOf(filter) !== -1 || (filter === "new" && year >= 2024);
                card.classList.toggle("is-hidden-card", !match);
            });
        });
    });
});
