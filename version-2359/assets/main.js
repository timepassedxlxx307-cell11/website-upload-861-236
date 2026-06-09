(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var menu = qs('[data-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  qsa('[data-filter-scope]').forEach(function (panel) {
    var root = panel.parentElement || document;
    var input = qs('[data-filter-input]', panel);
    var region = qs('[data-filter-region]', panel);
    var year = qs('[data-filter-year]', panel);
    var type = qs('[data-filter-type]', panel);
    var cards = qsa('[data-movie-card]', root);
    var empty = qs('[data-empty-state]', root);

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var regionValue = region ? region.value : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var showCard = matchKeyword && matchRegion && matchYear && matchType;
        card.hidden = !showCard;
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  });

  qsa('[data-player]').forEach(function (panel) {
    var video = qs('video', panel);
    var cover = qs('.play-cover', panel);
    var hls = null;
    var ready = false;

    function stream() {
      return video ? video.getAttribute('data-stream') : '';
    }

    function prepare() {
      if (!video || ready) {
        return;
      }
      var url = stream();
      if (!url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      ready = true;
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var result = video && video.play ? video.play() : null;
      if (result && result.catch) {
        result.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  });

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderSearch() {
    var target = qs('#search-results');
    if (!target || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = String(params.get('q') || '').trim();
    var title = qs('[data-search-title]');
    var subtitle = qs('[data-search-subtitle]');
    var empty = qs('#search-empty');
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 160);

    if (title) {
      title.textContent = '搜索结果';
    }
    if (subtitle) {
      subtitle.textContent = '关键词：' + query;
    }

    target.innerHTML = results.map(function (movie) {
      var tags = String(movie.tags || '').split(' ').filter(Boolean).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card" data-movie-card>' +
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"></a>' +
        '<div class="movie-card-body">' +
        '<div class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>' +
        '<h3 class="movie-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }).join('');

    if (empty) {
      empty.hidden = results.length !== 0;
    }
  }

  renderSearch();
})();
