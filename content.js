console.log("YouTube Ad Muter v2.7 is LIVE!");

let wasMuted = false;
let inAd = false;

setInterval(() => {
  const player = document.querySelector('#movie_player');
  const video = document.querySelector('video');
  if (!player || !video) return;

  const isAd = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');

  if (isAd && !inAd) {
    inAd = true;
    wasMuted = video.muted;
    video.muted = true;
  } else if (!isAd && inAd) {
    inAd = false;
    video.muted = wasMuted;
  }
}, 250);

