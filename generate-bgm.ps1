# 生成本地浪漫钢琴背景音乐 (WAV)
$sampleRate = 44100
$volume = 0.22
$outPath = Join-Path $PSScriptRoot "..\audio\bgm.wav"

$melody = @(
  @(523.25, 0.9), @(659.25, 0.9), @(783.99, 1.1), @(880.00, 1.2),
  @(783.99, 0.8), @(659.25, 0.9), @(587.33, 1.0), @(523.25, 1.2),
  @(493.88, 0.8), @(587.33, 0.9), @(659.25, 1.0), @(783.99, 1.3),
  @(880.00, 1.0), @(783.99, 0.9), @(659.25, 1.1), @(523.25, 1.5),
  @(392.00, 0.9), @(493.88, 0.9), @(587.33, 1.0), @(659.25, 1.2),
  @(783.99, 1.4), @(659.25, 1.0), @(587.33, 0.9), @(523.25, 2.0)
)

$totalSamples = 0
$segments = @()
foreach ($n in $melody) {
  $len = [int]($n[1] * $sampleRate)
  $totalSamples += $len
  $segments += @{ freq = $n[0]; len = $len }
}

$buffer = New-Object float[] $totalSamples
$pos = 0
foreach ($seg in $segments) {
  $freq = $seg.freq
  $len = $seg.len
  for ($i = 0; $i -lt $len; $i++) {
    $t = $i / $sampleRate
    $dur = $len / $sampleRate
    $attack = [Math]::Min(1.0, $t / 0.05)
    $release = [Math]::Min(1.0, ($dur - $t) / 0.12)
    $env = $attack * $release
    $s = [Math]::Sin(2 * [Math]::PI * $freq * $t) * 0.55
    $s += [Math]::Sin(2 * [Math]::PI * $freq * 2 * $t) * 0.2
    $s += [Math]::Sin(2 * [Math]::PI * $freq * 0.5 * $t) * 0.15
    $buffer[$pos + $i] = $s * $env * $volume
  }
  $pos += $len
}

$dir = Split-Path $outPath -Parent
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

$fs = [IO.File]::Create($outPath)
$bw = New-Object IO.BinaryWriter($fs)
$dataSize = $buffer.Length * 2
$bw.Write([Text.Encoding]::ASCII.GetBytes("RIFF"))
$bw.Write([int](36 + $dataSize))
$bw.Write([Text.Encoding]::ASCII.GetBytes("WAVEfmt "))
$bw.Write([int]16)
$bw.Write([short]1)
$bw.Write([short]1)
$bw.Write([int]$sampleRate)
$bw.Write([int]($sampleRate * 2))
$bw.Write([short]2)
$bw.Write([short]16)
$bw.Write([Text.Encoding]::ASCII.GetBytes("data"))
$bw.Write([int]$dataSize)
foreach ($s in $buffer) {
  $v = [int][Math]::Max(-32767, [Math]::Min(32767, $s * 32767))
  $bw.Write([short]$v)
}
$bw.Close()
$fs.Close()
Write-Host "OK: $outPath ($((Get-Item $outPath).Length) bytes)"
