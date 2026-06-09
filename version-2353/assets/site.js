(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var active = 0;
    var timer = null;

    function setSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(active + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function card(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
      '<span class="poster" style="background-image: url(\'' + item.image + '\');"></span>',
      '<span class="poster-glow"></span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
      '<p>' + escapeHtml(item.desc) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '<div class="card-action"><span>评分 ' + escapeHtml(item.rating) + '</span><a href="' + item.url + '">立即观看</a></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = document.getElementById('searchResults');
    var title = document.getElementById('searchTitle');
    var input = document.getElementById('searchInput');
    if (!results || !title || !window.movieSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q'));
    if (input && query) {
      input.value = params.get('q') || '';
    }
    if (!query) {
      return;
    }
    var words = query.split(/\s+/).filter(Boolean);
    var matches = window.movieSearchIndex.filter(function (item) {
      var haystack = normalize([item.title, item.region, item.type, item.category, item.tags.join(' '), item.desc].join(' '));
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    title.textContent = '搜索结果：' + (params.get('q') || '');
    if (!matches.length) {
      results.innerHTML = '<div class="detail-article"><h2>未找到相关影片</h2><p>可以尝试更换影片名、地区、类型或标签继续搜索。</p></div>';
      return;
    }
    results.innerHTML = matches.map(card).join('');
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchPage();
  });
})();
