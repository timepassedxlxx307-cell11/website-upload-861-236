(function () {
  var base = document.body ? (document.body.getAttribute('data-base') || '') : '';

  function href(path) {
    return base + path;
  }

  function markBrokenImages(root) {
    var scope = root || document;
    scope.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-failed');
      }, { once: true });
    });
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.site-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function resultCard(item) {
    var tags = [item.year, item.region, item.genre].filter(Boolean).join(' · ');
    return '' +
      '<a class="movie-card" href="' + href(item.url) + '">' +
      '  <figure class="movie-thumb">' +
      '    <img src="' + href(item.cover) + '" alt="' + escapeHtml(item.title) + ' 封面" loading="lazy">' +
      '    <span class="quality">高清</span>' +
      '    <span class="play-badge" aria-hidden="true">▶</span>' +
      '  </figure>' +
      '  <div class="movie-info">' +
      '    <h3>' + escapeHtml(item.title) + '</h3>' +
      '    <p>' + escapeHtml(item.line || '') + '</p>' +
      '    <div class="meta-row"><span>' + escapeHtml(tags) + '</span></div>' +
      '  </div>' +
      '</a>';
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch];
    });
  }

  function getMatches(query, limit) {
    var q = String(query || '').trim().toLowerCase();
    if (!q || !window.movieSearchIndex) {
      return [];
    }
    var terms = q.split(/\s+/).filter(Boolean);
    var results = [];
    window.movieSearchIndex.forEach(function (item) {
      var hay = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.line].join(' ').toLowerCase();
      var ok = terms.every(function (term) {
        return hay.indexOf(term) !== -1;
      });
      if (ok) {
        results.push(item);
      }
    });
    return results.slice(0, limit || 24);
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll('.header-search');
    forms.forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var box = form.querySelector('.search-suggest');
      if (!input || !box) {
        return;
      }
      input.addEventListener('input', function () {
        var matches = getMatches(input.value, 6);
        if (!matches.length) {
          box.classList.remove('is-open');
          box.innerHTML = '';
          return;
        }
        box.innerHTML = matches.map(function (item) {
          return '<a href="' + href(item.url) + '">' +
            '<img src="' + href(item.cover) + '" alt="' + escapeHtml(item.title) + ' 封面" loading="lazy">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span>' +
            '</a>';
        }).join('');
        box.classList.add('is-open');
        markBrokenImages(box);
      });
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) {
          box.classList.remove('is-open');
        }
      });
    });
  }

  function setupSearchPage() {
    var area = document.querySelector('[data-search-results]');
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    if (!area || !input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var query = input.value.trim();
      var matches = getMatches(query, 80);
      if (!query) {
        area.innerHTML = '<div class="empty-state">输入影片名称、地区、类型或标签后即可搜索。</div>';
        return;
      }
      if (!matches.length) {
        area.innerHTML = '<div class="empty-state">暂未找到匹配内容，可尝试更短的关键词。</div>';
        return;
      }
      area.innerHTML = matches.map(resultCard).join('');
      markBrokenImages(area);
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var next = window.location.pathname + (query ? '?q=' + encodeURIComponent(query) : '');
        window.history.replaceState({}, '', next);
        render();
      });
    }
    render();
  }

  function setupLocalFilters() {
    var input = document.querySelector('[data-local-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-text]'));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        card.style.display = !q || text.indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }

  function setupBasicPlayers() {
    document.querySelectorAll('.player-frame').forEach(function (frame) {
      var video = frame.querySelector('video');
      var overlay = frame.querySelector('.player-overlay');
      var button = frame.querySelector('.player-start');
      if (!video || !button) {
        return;
      }
      button.addEventListener('click', function () {
        video.play().then(function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        }).catch(function () {
          video.controls = true;
        });
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    markBrokenImages(document);
    setupMenu();
    setupHero();
    setupHeaderSearch();
    setupSearchPage();
    setupLocalFilters();
    setupBasicPlayers();
  });
})();
