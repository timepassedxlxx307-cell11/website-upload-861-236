import { H as Hls } from './hls-dru42stk.js';

function initPlayer(frame) {
  var video = frame.querySelector('video[data-hls-src]');
  var overlay = frame.querySelector('.player-overlay');
  var button = frame.querySelector('.player-start');
  if (!video) {
    return;
  }

  var hlsSource = video.getAttribute('data-hls-src');
  var mp4Source = video.getAttribute('data-mp4-src');

  function useMp4() {
    if (mp4Source && video.currentSrc !== mp4Source) {
      video.src = mp4Source;
    }
  }

  if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = hlsSource;
  } else if (hlsSource && Hls && Hls.isSupported()) {
    var hls = new Hls({ enableWorker: true, lowLatencyMode: false });
    hls.loadSource(hlsSource);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        hls.destroy();
        useMp4();
      }
    });
  } else {
    useMp4();
  }

  if (button) {
    button.addEventListener('click', function () {
      video.play().then(function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }).catch(function () {
        video.controls = true;
      });
    });
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.player-frame').forEach(initPlayer);
});
