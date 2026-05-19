/**
 * 生成极轻柔的氛围背景音乐 (WAV)
 * 风格：慢速和弦铺底，无突兀旋律，适合表白页
 * 运行: node scripts/generate-bgm.js
 */
const fs = require("fs");
const path = require("path");

const sampleRate = 44100;
const volume = 0.065;
const outPath = path.join(__dirname, "..", "audio", "bgm-romantic.wav");

// Cmaj7 → Am7 → Fmaj7 → Gadd9（安静浪漫）
const chords = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 293.66, 369.99],
];
const chordDur = 8.0;

function writeWav(samples) {
  const dataSize = samples.length * 2;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  const pcm = Buffer.alloc(dataSize);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-32767, Math.min(32767, Math.floor(samples[i] * 32767)));
    pcm.writeInt16LE(v, i * 2);
  }
  return Buffer.concat([header, pcm]);
}

function addPad(buf, start, len, freqs) {
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const dur = len / sampleRate;
    const attack = Math.min(1, t / 2.5);
    const release = Math.min(1, (dur - t) / 3.0);
    const env = attack * release;
    let s = 0;
    for (const f of freqs) {
      s += Math.sin(2 * Math.PI * f * t) * 0.28;
    }
    buf[start + i] += (s / freqs.length) * env * volume;
  }
}

function addSparseNote(buf, start, freq, len) {
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, t / 0.3) * Math.min(1, (len / sampleRate - t) / 1.2);
    buf[start + i] +=
      Math.sin(2 * Math.PI * freq * t) * env * volume * 0.35;
  }
}

const totalLen = Math.floor(chordDur * 4 * sampleRate);
const buffer = new Float32Array(totalLen);

for (let c = 0; c < 4; c++) {
  const start = Math.floor(c * chordDur * sampleRate);
  const len = Math.floor(chordDur * sampleRate);
  addPad(buffer, start, len, chords[c]);
  if (c % 2 === 0) {
    const noteStart = start + Math.floor(2.5 * sampleRate);
    const noteLen = Math.floor(2.8 * sampleRate);
    addSparseNote(buffer, noteStart, chords[c][2], noteLen);
  }
}

// 简单空间感：轻微延迟混响
const delaySamples = Math.floor(0.28 * sampleRate);
const wet = 0.22;
for (let i = delaySamples; i < buffer.length; i++) {
  buffer[i] += buffer[i - delaySamples] * wet;
  buffer[i] += buffer[i - Math.floor(delaySamples * 1.7)] * wet * 0.5;
}

let peak = 0;
for (const v of buffer) peak = Math.max(peak, Math.abs(v));
const norm = peak > 0 ? 0.75 / peak : 1;
for (let i = 0; i < buffer.length; i++) buffer[i] *= norm;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, writeWav(buffer));
console.log(
  "Created:",
  outPath,
  `(${Math.round(fs.statSync(outPath).size / 1024)} KB, ${(buffer.length / sampleRate).toFixed(1)}s)`
);
