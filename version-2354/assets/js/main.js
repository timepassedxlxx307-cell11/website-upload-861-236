(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
            });
        }
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('.filter-input');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('.filter-grid [data-text]'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!filterItems.length) {
            return;
        }
        var query = normalize(filterInput ? filterInput.value : '');
        var values = {};
        filterSelects.forEach(function (select) {
            values[select.getAttribute('data-filter')] = normalize(select.value);
        });
        filterItems.forEach(function (item) {
            var text = normalize(item.getAttribute('data-text'));
            var matched = !query || text.indexOf(query) !== -1;
            if (values.type) {
                matched = matched && normalize(item.getAttribute('data-type')) === values.type;
            }
            if (values.year) {
                matched = matched && normalize(item.getAttribute('data-year')) === values.year;
            }
            item.hidden = !matched;
        });
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
        }
        filterInput.addEventListener('input', applyFilters);
    }

    filterSelects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });

    applyFilters();

    var scrollTop = document.querySelector('.scroll-top');
    if (scrollTop) {
        window.addEventListener('scroll', function () {
            scrollTop.classList.toggle('visible', window.scrollY > 360);
        });
        scrollTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
