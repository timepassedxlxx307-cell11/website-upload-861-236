import { H as Hls } from './video-player.js';

function preparePlayer(box) {
  const video = box.querySelector('video');
  const button = box.querySelector('.play-mask');
  const stream = box.getAttribute('data-stream');
  let loaded = false;
  let hls = null;

  function attach() {
    if (loaded || !video || !stream) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
    loaded = true;
  }

  function play() {
    attach();
    if (button) {
      button.classList.add('is-hidden');
    }
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.querySelectorAll('.movie-player').forEach(preparePlayer);
