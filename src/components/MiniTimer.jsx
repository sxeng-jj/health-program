import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fmt, useNow } from '../hooks/useNow'
import { cdLeft, swElapsed, useTimerStore } from '../store/useTimerStore'

// 레이아웃에 항상 떠 있는 작은 타이머. 다른 페이지에 있어도 휴식 종료를 감지해 알림을 울립니다.
export default function MiniTimer() {
  const { sw, cd, cdCheck } = useTimerStore()
  const { pathname } = useLocation()
  const active = sw.running || cd.running
  const now = useNow(active)

  useEffect(() => { cdCheck(now) }, [now, cdCheck])

  const showCd = cd.total > 0
  const showSw = sw.running || sw.acc > 0
  if (pathname === '/timer' || (!showCd && !showSw)) return null

  return (
    <Link to="/timer" className={`mini-timer text-decoration-none ${cd.done ? 'done' : ''}`}>
      {showCd && (
        <span>
          <i className="bi bi-hourglass-split me-1" />
          {cd.done ? '휴식 끝!' : fmt(Math.ceil(cdLeft(cd, now) / 1000) * 1000)}
        </span>
      )}
      {showSw && (
        <span><i className="bi bi-stopwatch me-1" />{fmt(swElapsed(sw, now))}</span>
      )}
    </Link>
  )
}
