let wasMuted = false;
let savedSpeed = 1;
let inAd = false;

function handleAds() {
  const player = document.querySelector('#movie_player');
  const videos = document.querySelectorAll('video');
  if (!player || !videos.length) return;

  const isAd = player.classList.contains('ad-showing');

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

    const skipBtn = document.querySelector('.ytp-skip-ad-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button');
    if (skipBtn && skipBtn.offsetParent !== null) {
      skipBtn.click();
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

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});

// Backup check every 250ms in case YouTube fades the Skip button in quietly
setInterval(handleAds, 250);
