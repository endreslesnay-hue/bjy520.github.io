# 520 · 给远方的你

温馨浪漫的表白页面，专为异地恋人设计。

## 快速开始

1. 用浏览器直接打开 `index.html`（推荐 Chrome / Edge / Safari）。
2. 可选：运行 `node scripts/generate-bgm.js` 生成浪漫钢琴背景音乐 `audio/bgm.wav`。
3. 将表白文字中的称呼、署名按需修改（见 `index.html` 内 `.letter` 区域）。

## 文件结构

```
520/
├── index.html      # 页面结构
├── css/style.css   # 样式与动画
├── js/script.js    # 交互与音乐逻辑
├── audio/          # 背景音乐目录
│   └── bgm.mp3     # （需自行添加）
└── README.md
```

## 功能说明

| 功能 | 说明 |
|------|------|
| 动态爱心 | 脉动动画 + 点击弹出隐藏情话 |
| SVG 玫瑰 | 茎叶绘制与花瓣绽放动画 |
| 表白信 | 加载后渐显，可自定义文案 |
| 惊喜按钮 | 全屏爱心雨与浪漫标语 |
| 花瓣飘落 | Canvas 背景特效 |
| 背景音乐 | 本地 WAV 或内置合成钢琴；加载后自动播放（受限时点击提示开启） |

## 自定义

- **文字**：编辑 `index.html` 中 `.letter` 与 `js/script.js` 中 `SECRET_MESSAGES`。
- **音乐**：运行 `node scripts/generate-bgm.js` 重新生成，或替换 `audio/bgm.wav`。
- **配色**：调整 `css/style.css` 顶部 `:root` 变量。

## 浏览器说明

因隐私策略，多数浏览器禁止无交互自动播放音频。若音乐未自动响起，点击页面顶部提示或任意位置即可开启。

---

愿你表白成功，早日结束异地，携手同行。💕
