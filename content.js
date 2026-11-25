console.log("YouTube Ad Muter v2.5 is LIVE!");

let wasMuted = false;
let inAd = false;
let skipTimer = null;
let failsafe = null;
let lastClick = 0;
let player = null;
let observer = null;

function clickSkip() {
  const now = Date.now();
  if (now - lastClick < 300) return; // short cooldown so we don't miss the skip window

  const skipBtn = document.querySelector(
    '.ytp-skip-ad-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button, button[id^="skip-button"], .ytp-ad-skip-button-slot button'
  );
  if (!skipBtn) return;

  // offsetParent is null for position:fixed elements, so check the real size instead
  const r = skipBtn.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return;

  lastClick = now;
  skipBtn.click();
}

function endAd() {
  if (!inAd) return;
  inAd = false;
  clearInterval(skipTimer);
  clearTimeout(failsafe);
  skipTimer = null;
  failsafe = null;
  if (player) {
    player.querySelectorAll('video').forEach(v => {
      v.muted = wasMuted;
    });
  }
}

function checkPlayer() {
  if (!player) return;

  const isAd = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');

  if (isAd && !inAd) {
    inAd = true;
    const videos = player.querySelectorAll('video');
    if (videos.length) wasMuted = videos[0].muted;
    videos.forEach(v => { v.muted = true; }); // mute only: no hiding, no speed-up
    if (!skipTimer) skipTimer = setInterval(clickSkip, 400);
    // Safety net: never stay in "ad mode" longer than 2 minutes
    failsafe = setTimeout(endAd, 120000);
  } else if (!isAd && inAd) {
    endAd();
  }
}

function attach() {
  const p = document.querySelector('#movie_player');
  if (!p) return false;
  if (p === player && p.isConnected) return true; // already watching this one

  if (observer) observer.disconnect();
  endAd();
  player = p;
  observer = new MutationObserver(checkPlayer);
  observer.observe(player, { attributes: true, attributeFilter: ['class'] });
  checkPlayer();
  return true;
}

// YouTube is a single-page app: re-attach after in-site navigation
document.addEventListener('yt-navigate-finish', attach);

// Initial load: wait for the player to exist
if (!attach()) {
  const boot = setInterval(() => {
    if (attach()) clearInterval(boot);
  }, 1000);
}
