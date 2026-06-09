
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(function (form) {
    var target = document.querySelector(form.getAttribute('data-target'));
    var input = form.querySelector('[data-filter-input]');
    var type = form.querySelector('[data-filter-type]');
    if (!target || !input) {
      return;
    }
    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));

    function run() {
      var query = input.value.trim().toLowerCase();
      var selected = type ? type.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var okQuery = !query || text.indexOf(query) !== -1;
        var okType = !selected || selected === cardType;
        card.classList.toggle('is-hidden', !(okQuery && okType));
      });
    }

    input.addEventListener('input', run);
    if (type) {
      type.addEventListener('change', run);
    }
  });
})();
