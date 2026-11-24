console.log("YouTube Ad Muter v2.1 is LIVE!");

let wasMuted = false;
let savedSpeed = 1;
let inAd = false;

function handleAds() {
  const player = document.querySelector('#movie_player');
  const videos = document.querySelectorAll('video');
  if (!player || !videos.length) return;

  const isAd = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');

  if (isAd) {
    if (!inAd) {
      inAd = true;
      wasMuted = videos[0].muted;
      savedSpeed = videos[0].playbackRate;
    }
    videos.forEach(v => {
      v.muted = true;
      v.style.opacity = '0';
      if (v.playbackRate < 16) v.playbackRate = 16;
    });
  } else if (inAd) {
    inAd = false;
    videos.forEach(v => {
      v.muted = wasMuted;
      v.style.opacity = '1';
      v.playbackRate = savedSpeed;
    });
  }

  // Always check for Skip buttons (including post-video static ad end-cards)
  const skipBtn = document.querySelector(
    '.ytp-skip-ad-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button, button[id^="skip-button"], .ytp-ad-skip-button-slot button, .ytp-ad-overlay-close-button'
  );
  if (skipBtn && skipBtn.offsetParent !== null) {
    skipBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    skipBtn.click();
  }
}

const observer = new MutationObserver(handleAds);

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});

setInterval(handleAds, 250);
