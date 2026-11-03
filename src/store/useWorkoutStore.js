import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { useAppStore } from './useAppStore'
import { useTimerStore } from './useTimerStore'

// 진행 중인 오늘의 운동. 다른 페이지로 옮기거나 새로고침해도 이어지도록 localStorage 에 저장합니다.
// 세트를 완료하면 Supabase workout_logs 에 바로 한 줄 저장하고, 휴식 타이머를 시작합니다.

export const setKey = (exIdx, setNo) => `${exIdx}-${setNo}`

export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      session: null, // { dayIdx, date, condition, sets: { '0-1': { weight, reps, done, id } } }

      startSession: (dayIdx) =>
        set({ session: { dayIdx, date: localDate(), condition: '보통', sets: {} } }),
      endSession: () => set({ session: null }),
      setCondition: (condition) => set({ session: { ...get().session, condition } }),

      setField: (key, field, value) => {
        const { session } = get()
        const prev = session.sets[key] ?? {}
        set({ session: { ...session, sets: { ...session.sets, [key]: { ...prev, [field]: value } } } })
      },

      // ex: routine 의 운동 한 개, rest: 완료 후 휴식 타이머를 켤지
      completeSet: async ({ ex, exIdx, setNo, weight, reps, rest }) => {
        const { toast, nickname } = useAppStore.getState()
        const key = setKey(exIdx, setNo)
        const { session } = get()
        const mark = (patch) => {
          const cur = get().session
          if (!cur) return
          set({ session: { ...cur, sets: { ...cur.sets, [key]: { ...cur.sets[key], weight, reps, ...patch } } } })
        }

        mark({ done: true, id: null })
        if (rest) useTimerStore.getState().cdStart(ex.restSec, `${ex.name} 휴식`)

        if (!supabase) return toast('Supabase 설정이 없어 이 기기에만 기록돼요', 'warning')
        const { data, error } = await supabase.from('workout_logs').insert({
          nickname: nickname || '익명',
          log_date: session.date,
          exercise: ex.name,
          set_no: setNo,
          weight: weight === '' ? null : Number(weight),
          reps: Number(reps),
          condition: session.condition,
        }).select('id').single()
        if (error) return toast(`저장 실패: ${error.message}`, 'danger')
        mark({ id: data.id })
      },

      undoSet: async ({ exIdx, setNo }) => {
        const key = setKey(exIdx, setNo)
        const { session } = get()
        const cur = session.sets[key]
        set({ session: { ...session, sets: { ...session.sets, [key]: { ...cur, done: false, id: null } } } })
        if (cur?.id && supabase) {
          const { error } = await supabase.from('workout_logs').delete().eq('id', cur.id)
          if (error) useAppStore.getState().toast(`삭제 실패: ${error.message}`, 'danger')
        }
      },
    }),
    { name: 'upper-frame-workout' },
  ),
)
