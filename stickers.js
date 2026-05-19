/**
 * 情话贴纸墙 · 信读完后再铺满全屏展示
 */
const StickerWall = (function () {
  "use strict";

  const HER_NAME = "乖卜卜小心肝";

  const MESSAGES = [
    `${HER_NAME}，想你每一天`,
    "你是我的小心肝",
    "异地也要好好爱你",
    "视频里你的笑容最好看",
    "晚安，梦里见",
    "等你回来抱抱",
    "全世界你最可爱",
    "牵手去看日落吧",
    "你是我的心之所向",
    "每一句想你都是真的",
    "愿距离再远，心也贴近",
    "我的偏爱都给你",
    `${HER_NAME}，520快乐`,
    "想陪你走过四季",
    "你的消息我会秒回",
    "见面第一件事：抱紧你",
    "你笑的时候世界都亮了",
    "我会一直等你",
    "爱你，没有保质期",
    "你是我的独家浪漫",
    "再远也值得",
    "想把星星摘给你",
    "你的名字最好听",
    "有你的日子很甜",
    "余生请多指教",
    "心跳因你加速",
    "你是我的宝藏女孩",
    "想和你看同一轮月亮",
    "乖，要开心呀",
    "我在，别怕",
    "未来想和你有个家",
    "你值得所有温柔",
  ];

  const VARIANTS = [
    "sticker--note",
    "sticker--heart",
    "sticker--tag",
    "sticker--polaroid",
    "sticker--ribbon",
    "sticker--round",
  ];

  let wallEl = null;
  let shown = false;

  function getStickerCount() {
    const area = window.innerWidth * window.innerHeight;
    return Math.min(42, Math.max(22, Math.floor(area / 28000)));
  }

  function measureSize(text, scale) {
    const baseW = Math.min(200, Math.max(88, text.length * 13 + 28));
    const baseH = Math.min(120, Math.max(52, Math.ceil(text.length / 8) * 18 + 36));
    return { w: baseW * scale, h: baseH * scale };
  }

  function computeLayout(count) {
    const pad = 10;
    const W = window.innerWidth - pad * 2;
    const H = window.innerHeight - pad * 2;
    const cols = Math.ceil(Math.sqrt(count * (W / H)));
    const rows = Math.ceil(count / cols);
    const cellW = W / cols;
    const cellH = H / rows;
    const placed = [];
    const items = [];
    const scales = [0.78, 0.88, 0.95, 1.05, 1.15, 1.22];
    const shuffled = [...MESSAGES].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const text = shuffled[i % shuffled.length];
      const scale = scales[Math.floor(Math.random() * scales.length)];
      const rot = -14 + Math.random() * 28;
      const variant = VARIANTS[i % VARIANTS.length];
      const size = measureSize(text, scale);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = (Math.random() - 0.5) * cellW * 0.35;
      const jitterY = (Math.random() - 0.5) * cellH * 0.35;
      let x = pad + col * cellW + (cellW - size.w) / 2 + jitterX;
      let y = pad + row * cellH + (cellH - size.h) / 2 + jitterY;
      x = Math.max(pad, Math.min(W + pad - size.w, x));
      y = Math.max(pad, Math.min(H + pad - size.h, y));

      let tries = 0;
      while (tries < 12) {
        const overlap = placed.some(
          (p) =>
            !(x + size.w < p.x || x > p.x + p.w || y + size.h < p.y || y > p.y + p.h)
        );
        if (!overlap) break;
        x += (Math.random() - 0.5) * 24;
        y += (Math.random() - 0.5) * 24;
        x = Math.max(pad, Math.min(W + pad - size.w, x));
        y = Math.max(pad, Math.min(H + pad - size.h, y));
        tries++;
      }
      placed.push({ x, y, w: size.w, h: size.h });
      items.push({ text, x, y, w: size.w, h: size.h, rot, variant, delay: i * 45 });
    }
    return items;
  }

  function createStickerEl(item) {
    const el = document.createElement("div");
    el.className = `sticker ${item.variant}`;
    el.setAttribute("role", "listitem");
    el.style.cssText = `left:${item.x}px;top:${item.y}px;width:${item.w}px;--rot:${item.rot}deg;--delay:${item.delay}ms`;
    const inner = document.createElement("span");
    inner.className = "sticker__text";
    inner.textContent = item.text;
    el.appendChild(inner);
    return el;
  }

  function ensureWall() {
    if (wallEl) return wallEl;
    wallEl = document.createElement("div");
    wallEl.id = "stickerWall";
    wallEl.className = "sticker-wall";
    wallEl.setAttribute("role", "list");
    wallEl.setAttribute("aria-label", "情话贴纸");
    wallEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(wallEl);
    return wallEl;
  }

  function show() {
    if (shown) return;
    shown = true;
    const wall = ensureWall();
    const layout = computeLayout(getStickerCount());
    const fragment = document.createDocumentFragment();
    layout.forEach((item) => fragment.appendChild(createStickerEl(item)));
    wall.appendChild(fragment);
    wall.classList.add("sticker-wall--visible");
    wall.setAttribute("aria-hidden", "false");
    document.body.classList.add("sticker-mode");
  }

  return { show, HER_NAME };
})();
