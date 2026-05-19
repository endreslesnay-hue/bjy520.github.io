/**
 * 背景音乐 · 仅播放本地轻柔氛围曲，无刺耳合成旋律
 */
const RomanticMusic = (function () {
  "use strict";

  const LOCAL_SRC = "audio/bgm-romantic.wav";
  const VOLUME = 0.28;

  let audioEl = null;
  let isPlaying = false;

  function getAudio() {
    if (!audioEl) {
      audioEl = new Audio(LOCAL_SRC);
      audioEl.loop = true;
      audioEl.volume = VOLUME;
      audioEl.preload = "auto";
    }
    return audioEl;
  }

  async function play() {
    const el = getAudio();
    if (isPlaying && !el.paused) return true;
    try {
      await el.play();
      isPlaying = true;
      return true;
    } catch {
      return false;
    }
  }

  async function resume() {
    return play();
  }

  return { play, resume };
})();
