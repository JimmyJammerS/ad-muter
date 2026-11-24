let wasMuted = false;
let savedSpeed = 1;
let inAd = false;

const observer = new MutationObserver(() => {
  const player = document.querySelector('#movie_player');
  const video = document.querySelector('video');
  if (!player || !video) return;

  const isAd = player.classList.contains('ad-showing');

  if (isAd && !inAd) {
    inAd = true;
    wasMuted = video.muted;
    savedSpeed = video.playbackRate;
    video.muted = true;
    video.style.opacity = '0';
    video.playbackRate = 2;
  } else if (!isAd && inAd) {
    inAd = false;
    video.muted = wasMuted;
    video.style.opacity = '1';
    video.playbackRate = savedSpeed;
  }

  // Gently click Skip once the real countdown finishes
  if (isAd) {
    const skipBtn = document.querySelector('.ytp-skip-ad-button, .ytp-ad-skip-button-modern');
    if (skipBtn && skipBtn.offsetParent !== null) {
      skipBtn.click();
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});