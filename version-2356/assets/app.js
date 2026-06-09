function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (!toggle || !mobileNav) {
    return;
  }
  toggle.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
  });
}

function initCarousel() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    let index = 0;
    let timer = null;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, itemIndex) => {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach((dot, itemIndex) => {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    };
    const play = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    };
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.heroDot || 0));
        play();
      });
    });
    carousel.addEventListener("mouseenter", () => window.clearInterval(timer));
    carousel.addEventListener("mouseleave", play);
    play();
  });
}

function initSearch() {
  const input = document.querySelector("[data-movie-search]");
  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  const clear = document.querySelector("[data-clear-search]");
  if (!input || cards.length === 0) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const preset = params.get("q");
  if (preset) {
    input.value = preset;
  }
  const apply = () => {
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.type,
        card.textContent
      ].join(" ").toLowerCase();
      const matched = terms.length === 0 || terms.every((term) => haystack.includes(term));
      card.hidden = !matched;
    });
  };
  input.addEventListener("input", apply);
  if (clear) {
    clear.addEventListener("click", () => {
      input.value = "";
      apply();
      input.focus();
    });
  }
  apply();
}

export function setupMoviePlayer(options, HlsConstructor) {
  const video = document.getElementById(options.videoId);
  const overlay = document.getElementById(options.overlayId);
  const button = document.getElementById(options.buttonId);
  if (!video || !overlay) {
    return;
  }
  let attached = false;
  let hlsInstance = null;
  const attach = () => {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.mediaUrl;
      return;
    }
    if (HlsConstructor && HlsConstructor.isSupported()) {
      hlsInstance = new HlsConstructor({ enableWorker: true, lowLatencyMode: false });
      hlsInstance.loadSource(options.mediaUrl);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = options.mediaUrl;
  };
  const play = () => {
    attach();
    overlay.classList.add("is-hidden");
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        overlay.classList.remove("is-hidden");
      });
    }
  };
  overlay.addEventListener("click", play);
  if (button) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      play();
    });
  }
  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", () => overlay.classList.add("is-hidden"));
  window.addEventListener("beforeunload", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

ready(() => {
  initNavigation();
  initCarousel();
  initSearch();
});
