/**
 * 520 表白页 · 交互脚本
 * 功能：背景音乐、花瓣飘落、爱心点击、惊喜弹层
 */

(function () {
  "use strict";

  const HER_NAME = "乖卜卜小心肝";

  /** 点击爱心后逐条显示的隐藏情话 */
  const SECRET_MESSAGES = [
    `${HER_NAME}，想你了就看我们的聊天记录，那是离你最近的地方。`,
    "每次听到你喜欢的歌，都会忍不住分享给你。",
    "我已经在规划下一次见面要做的每一件小事。",
    "你值得这世界上所有的温柔，而我恰好想给你。",
    `${HER_NAME}，异地只是暂时的，爱你是一直的。❤️`,
  ];

  /* ---------- DOM 引用 ---------- */
  const musicHint = document.getElementById("musicHint");
  const heartBtn = document.getElementById("heartBtn");
  const secretModal = document.getElementById("secretModal");
  const secretList = document.getElementById("secretList");
  const surpriseBtn = document.getElementById("surpriseBtn");
  const surpriseOverlay = document.getElementById("surpriseOverlay");
  const closeSurprise = document.getElementById("closeSurprise");
  const floatingHearts = document.querySelector(".floating-hearts");
  const petalCanvas = document.getElementById("petalCanvas");
  const modalClose = document.querySelector(".modal-close");
  const loveLetter = document.getElementById("loveLetter");
  const footerActions = document.getElementById("footerActions");

  let musicStarted = false;
  let petalAnimationId = null;
  let letterDone = false;

  /* ---------- 背景音乐（RomanticMusic 模块） ---------- */
  function showMusicHint() {
    musicHint?.classList.remove("hidden");
  }

  function hideMusicHint() {
    musicHint?.classList.add("hidden");
  }

  /** 启动背景音乐 */
  async function startMusic() {
    if (musicStarted || typeof RomanticMusic === "undefined") return;
    const ok = await RomanticMusic.play();
    if (ok) {
      musicStarted = true;
      hideMusicHint();
    } else {
      showMusicHint();
    }
  }

  /** 用户交互后启动（绕过浏览器自动播放限制） */
  async function startMusicOnInteraction() {
    if (typeof RomanticMusic === "undefined") return;
    if (musicStarted) {
      await RomanticMusic.resume();
      return;
    }
    await startMusic();
  }

  async function initMusic() {
    const ok = await startMusic();
    if (!ok) showMusicHint();
  }

  musicHint?.addEventListener("click", startMusicOnInteraction);
  document.addEventListener("click", startMusicOnInteraction, { once: true });
  document.addEventListener("touchstart", startMusicOnInteraction, { once: true, passive: true });

  /* ---------- 表白信逐行渐显 → 贴纸墙 ---------- */
  function initLetterReveal() {
    const lines = loveLetter?.querySelectorAll(".letter-line");
    if (!lines?.length) {
      onLetterComplete();
      return;
    }

    const lineDelay = 1400;
    const startDelay = 2600;

    lines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add("letter-line--shown");
        if (i === lines.length - 1) {
          setTimeout(onLetterComplete, lineDelay + 400);
        }
      }, startDelay + i * lineDelay);
    });
  }

  function onLetterComplete() {
    if (letterDone) return;
    letterDone = true;
    footerActions?.classList.add("actions--visible");
    if (typeof StickerWall !== "undefined") {
      requestAnimationFrame(() => StickerWall.show());
    }
  }

  /* ---------- 花瓣飘落（Canvas） ---------- */
  function initPetals() {
    const ctx = petalCanvas.getContext("2d");
    if (!ctx) return;

    const petals = [];
    const colors = ["#ffb3c6", "#ff8fab", "#ffccd5", "#ff4d6d", "#ffc2d1"];

    function resize() {
      petalCanvas.width = window.innerWidth;
      petalCanvas.height = window.innerHeight;
    }

    function createPetal() {
      return {
        x: Math.random() * petalCanvas.width,
        y: Math.random() * petalCanvas.height - petalCanvas.height,
        size: 6 + Math.random() * 10,
        speedY: 0.6 + Math.random() * 1.2,
        speedX: -0.5 + Math.random(),
        rotation: Math.random() * Math.PI * 2,
        spin: -0.02 + Math.random() * 0.04,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.4 + Math.random() * 0.5,
      };
    }

    const count = Math.min(40, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < count; i++) {
      petals.push(createPetal());
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);

      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.spin;

        if (p.y > petalCanvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * petalCanvas.width;
        }

        drawPetal(p);
      });

      petalAnimationId = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();
  }

  /* ---------- 爱心点击：弹出隐藏情话 ---------- */
  function openSecretModal() {
    if (!secretModal || !secretList) return;

    secretList.innerHTML = "";
    SECRET_MESSAGES.forEach((text, i) => {
      const li = document.createElement("li");
      li.textContent = text;
      li.style.animationDelay = `${0.15 + i * 0.2}s`;
      secretList.appendChild(li);
    });

    heartBtn?.classList.add("clicked");
    setTimeout(() => heartBtn?.classList.remove("clicked"), 600);

    if (typeof secretModal.showModal === "function") {
      secretModal.showModal();
    } else {
      secretModal.setAttribute("open", "");
    }

    spawnClickHearts(6);
  }

  heartBtn?.addEventListener("click", openSecretModal);

  modalClose?.addEventListener("click", () => secretModal?.close());
  secretModal?.addEventListener("click", (e) => {
    if (e.target === secretModal) secretModal.close();
  });

  /* ---------- 惊喜按钮：全屏爱心雨 ---------- */
  function showSurprise() {
    surpriseOverlay?.classList.remove("hidden");
    surpriseOverlay?.classList.add("visible");
    surpriseOverlay?.setAttribute("aria-hidden", "false");
    spawnFloatingHearts(24);
    startMusicOnInteraction();
  }

  function hideSurprise() {
    surpriseOverlay?.classList.add("hidden");
    surpriseOverlay?.classList.remove("visible");
    surpriseOverlay?.setAttribute("aria-hidden", "true");
    if (floatingHearts) floatingHearts.innerHTML = "";
  }

  surpriseBtn?.addEventListener("click", showSurprise);
  closeSurprise?.addEventListener("click", hideSurprise);

  /** 在点击位置附近生成小爱心 */
  function spawnClickHearts(n) {
    const rect = heartBtn?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < n; i++) {
      const el = document.createElement("span");
      el.textContent = "❤";
      el.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        font-size: ${12 + Math.random() * 14}px;
        color: #ff4d6d;
        pointer-events: none;
        z-index: 99;
        animation: floatUp ${1.5 + Math.random()}s ease-out forwards;
      `;
      el.style.setProperty(
        "transform",
        `translate(${(Math.random() - 0.5) * 80}px, ${(Math.random() - 0.5) * 40}px)`
      );
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }
  }

  /** 全屏惊喜层内漂浮爱心 */
  function spawnFloatingHearts(count) {
    if (!floatingHearts) return;
    floatingHearts.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const h = document.createElement("span");
      h.className = "mini-heart";
      h.textContent = ["❤", "💕", "💖", "🌹"][Math.floor(Math.random() * 4)];
      h.style.left = `${Math.random() * 100}%`;
      h.style.bottom = "-20px";
      h.style.animationDelay = `${Math.random() * 2}s`;
      h.style.animationDuration = `${3 + Math.random() * 3}s`;
      floatingHearts.appendChild(h);
    }
  }

  /* ---------- 页面加载完成后初始化 ---------- */
  window.addEventListener("DOMContentLoaded", () => {
    initPetals();
    initMusic();
    initLetterReveal();
  });

  window.addEventListener("beforeunload", () => {
    if (petalAnimationId) cancelAnimationFrame(petalAnimationId);
  });
})();
