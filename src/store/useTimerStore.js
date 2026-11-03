import { create } from 'zustand'
import { playAlarm, prepareAlarm } from '../lib/alarm'

// 스톱워치 + 휴식 카운트다운. 값을 1초마다 깎지 않고 "시작 시각"만 저장해서
// 필요할 때 계산합니다 → 페이지를 옮기거나 탭이 백그라운드여도 시간이 어긋나지 않습니다.

export const swElapsed = (sw, now) => sw.acc + (sw.running ? Math.max(0, now - sw.startedAt) : 0)
export const cdLeft = (cd, now) => (cd.running ? Math.max(0, cd.endAt - now) : cd.left)

const CD_IDLE = { total: 0, left: 0, endAt: 0, running: false, done: false, label: '' }

export const useTimerStore = create((set, get) => ({
  // ── 스톱워치 ──
  sw: { running: false, startedAt: 0, acc: 0, laps: [] },
  swStart: () => set({ sw: { ...get().sw, running: true, startedAt: Date.now() } }),
  swStop: () => {
    const { sw } = get()
    set({ sw: { ...sw, running: false, acc: swElapsed(sw, Date.now()) } })
  },
  swLap: () => {
    const { sw } = get()
    const total = swElapsed(sw, Date.now())
    const prev = sw.laps.length ? sw.laps[0].total : 0
    set({ sw: { ...sw, laps: [{ total, split: total - prev }, ...sw.laps] } })
  },
  swReset: () => set({ sw: { running: false, startedAt: 0, acc: 0, laps: [] } }),

  // ── 휴식 카운트다운 ──
  cd: CD_IDLE,
  cdStart: (sec, label = '') => {
    prepareAlarm()
    const ms = sec * 1000
    set({ cd: { total: ms, left: ms, endAt: Date.now() + ms, running: true, done: false, label } })
  },
  cdToggle: () => {
    const { cd } = get()
    const now = Date.now()
    if (cd.running) set({ cd: { ...cd, running: false, left: cdLeft(cd, now) } })
    else if (cd.left > 0) { prepareAlarm(); set({ cd: { ...cd, running: true, endAt: now + cd.left } }) }
  },
  cdAdd: (sec) => {
    const { cd } = get()
    const ms = sec * 1000
    const left = Math.max(0, cdLeft(cd, Date.now()) + ms)
    if (left === 0) return
    set({
      cd: {
        ...cd, done: false, left, total: Math.max(cd.total, left),
        endAt: cd.running ? Date.now() + left : cd.endAt,
      },
    })
  },
  cdReset: () => set({ cd: CD_IDLE }),
  // 화면 어디서든 주기적으로 불러 종료 시점을 감지합니다 (한 번만 울림)
  cdCheck: (now) => {
    const { cd } = get()
    if (cd.running && now >= cd.endAt) {
      set({ cd: { ...cd, running: false, left: 0, done: true } })
      playAlarm()
    }
  },
}))
