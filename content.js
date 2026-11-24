console.log("YouTube Ad Muter v2.4 (Zero-Idle) is LIVE!");

let wasMuted = false;
let savedSpeed = 1;
let inAd = false;
let skipTimer = null;
let lastClick = 0;

function clickSkip() {
  const now = Date.now();
  if (now - lastClick < 1000) return; // Cooldown: max 1 click per second

  const skipBtn = document.querySelector(
    '.ytp-skip-ad-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button, button[id^="skip-button"], .ytp-ad-skip-button-slot button'
  );
  if (skipBtn && skipBtn.offsetParent !== null) {
    lastClick = now;
    skipBtn.click();
  }
}

function checkPlayer() {
  const player = document.querySelector('#movie_player');
  if (!player) return;

  const isAd = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');
  const videos = player.querySelectorAll('video');

  if (isAd && !inAd) {
    inAd = true;
    if (videos.length) {
      wasMuted = videos[0].muted;
      savedSpeed = videos[0].playbackRate;
    }
    videos.forEach(v => {
      v.muted = true;
      v.style.opacity = '0';
      v.playbackRate = 2; // Native 2x avoids YouTube's anti-tamper lag
    });
    // Start skip checker ONLY while an ad is active
    if (!skipTimer) skipTimer = setInterval(clickSkip, 600);
  } else if (!isAd && inAd) {
    inAd = false;
    clearInterval(skipTimer);
    skipTimer = null;
    videos.forEach(v => {
      v.muted = wasMuted;
      v.style.opacity = '1';
      v.playbackRate = savedSpeed;
    });
  }
}

// Watch only #movie_player class changes (sleeps completely during normal videos)
const boot = setInterval(() => {
  const player = document.querySelector('#movie_player');
  if (player) {
    clearInterval(boot);
    new MutationObserver(checkPlayer).observe(player, {
      attributes: true,
      attributeFilter: ['class']
    });
    checkPlayer();
  }
}, 1000);
