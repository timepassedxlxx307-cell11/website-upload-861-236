
(function () {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play]');
  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var started = false;
  var hls = null;

  function init() {
    if (started || !source) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    init();
    video.setAttribute('controls', 'controls');
    if (button) {
      button.classList.add('is-hidden');
    }
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('playing', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
