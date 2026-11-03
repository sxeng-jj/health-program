// 휴식 종료 알림: 삐 소리 3번 + 진동. 소리는 사용자 클릭 이후에만 재생할 수 있어
// 타이머를 시작하는 순간 prepareAlarm() 으로 오디오를 미리 깨워 둡니다.
let ctx

export function prepareAlarm() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
  } catch { /* 소리를 못 쓰는 환경이면 진동만 */ }
}

export function playAlarm() {
  navigator.vibrate?.([300, 150, 300, 150, 300])
  if (!ctx) return
  const t0 = ctx.currentTime
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.25, t0 + i * 0.4)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.4 + 0.3)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0 + i * 0.4)
    osc.stop(t0 + i * 0.4 + 0.3)
  }
}
