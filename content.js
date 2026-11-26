console.log("Barebones Ad Muter + Smart Chime LIVE");

let wasMuted = false;
let inAd = false;
let skipChimed = false;
let endTimer = null;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

document.addEventListener('click', getAudioContext, { passive: true });

function playChime(isSkipReady = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (isSkipReady) {
      // Single soft ping when Skip becomes clickable
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    } else {
      // Two-note chime when the ad is completely over
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.log("Chime blocked:", e);
  }
}

function isSkipVisible() {
  const btn = document.querySelector(
    '.ytp-skip-ad-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button, button[id^="skip-button"], .ytp-ad-skip-button-slot button'
  );
  if (!btn) return false;
  const r = btn.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

setInterval(() => {
  const player = document.querySelector('#movie_player');
  if (!player) return;

  const videos = player.querySelectorAll('video');
  if (!videos.length) return;

  const isAd = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');

  if (isAd) {
    if (endTimer) {
      clearTimeout(endTimer);
      endTimer = null;
    }
    if (!inAd) {
      inAd = true;
      skipChimed = false;
      wasMuted = videos[0].muted;
    }

    videos.forEach(v => {
      if (!v.muted) v.muted = true;
    });

    // Ring a single soft note once when the Skip button appears
    if (!skipChimed && isSkipVisible()) {
      skipChimed = true;
      playChime(true);
    }
  } else if (!isAd && inAd && !endTimer) {
    endTimer = setTimeout(() => {
      inAd = false;
      skipChimed = false;
      endTimer = null;
      videos.forEach(v => {
        v.muted = wasMuted;
      });
      playChime(false);
    }, 800);
  }
}, 250);
