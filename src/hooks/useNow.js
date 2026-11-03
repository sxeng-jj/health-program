import { useEffect, useState } from 'react'

// active 가 true 인 동안 intervalMs 마다 현재 시각을 갱신해 화면을 다시 그리게 합니다.
export function useNow(active = true, intervalMs = 100) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs])
  return now
}

// 1:05 / 12:05.3 형태로 표시
export function fmt(ms, centi = false) {
  const total = Math.floor(ms / 10)
  const cs = total % 100
  const s = Math.floor(total / 100) % 60
  const m = Math.floor(total / 6000)
  const base = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return centi ? `${base}.${String(cs).padStart(2, '0')}` : base
}
