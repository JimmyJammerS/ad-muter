console.log("YouTube Ad Muter v2.3 (Lightweight) is LIVE!");

let wasMuted = false;
let savedSpeed = 1;
let inAd = false;
let observedPlayer = null;

function triggerRealClick(el) {
  const rect = el.getBoundingClientRect();
  const opts = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2
  };
  el.dispatchEvent(new PointerEvent('pointerdown', opts));
  el.dispatchEvent(new MouseEvent('mousedown', opts));
  el.dispatchEvent(new PointerEvent('pointerup', opts));
  el.dispatchEvent(new MouseEvent('mouseup', opts));
  el.click();
}

function handleAds() {
  const player = document.querySelector('#movie_player');
  if (!player) return;

  // Attach observer ONLY to #movie_player instead of the whole page
  if (player !== observedPlayer) {
    observedPlayer = player;
    observer.disconnect();
    observer.observe(player, { attributes: true, attributeFilter: ['class'] });
  }

  const videos = player.querySelectorAll('video');
  if (!videos.length) return;

  const isAd = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');

  if (isAd) {
    if (!inAd) {
      inAd = true;
      wasMuted = videos.muted;
      savedSpeed = videos.playbackRate;
    }
    videos.forEach(v => {
      if (!v.muted) v.muted = true;
      if (v.style.opacity !== '0') v.style.opacity = '0';
      if (v.playbackRate !== 2.5) v.playbackRate = 2.5;
    });

    const skipBtn = player.querySelector(
      '.ytp-skip-ad-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button, button[id^="skip-button"], .ytp-ad-skip-button-slot button, .ytp-ad-overlay-close-button'
    );
    if (skipBtn && skipBtn.offsetParent !== null && getComputedStyle(skipBtn).opacity !== '0') {
      triggerRealClick(skipBtn);
    }
  } else if (inAd) {
    inAd = false;
    videos.forEach(v => {
      v.muted = wasMuted;
      v.style.opacity = '1';
      v.playbackRate = savedSpeed;
    });
  }
}

const observer = new MutationObserver(handleAds);

// Lightweight 500ms heartbeat to attach to player & catch skip buttons
setInterval(handleAds, 500);

