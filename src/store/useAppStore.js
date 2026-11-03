import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 앱 전체가 함께 쓰는 상태. 여러 페이지에서 같이 쓰는 값만 여기에 둡니다.
// 사용법:  const nickname = useAppStore((s) => s.nickname)
export const useAppStore = create(
  persist(
    (set, get) => ({
      // 사용자 — localStorage 에 저장되어 새로고침해도 유지
      nickname: '',
      setNickname: (nickname) => set({ nickname: nickname.trim() }),

      // 알림(토스트) — 어느 페이지에서든 get().toast('메시지')
      toasts: [],
      toast: (message, variant = 'success') => {
        const id = Date.now() + Math.random()
        set({ toasts: [...get().toasts, { id, message, variant }] })
        setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 2500)
      },
    }),
    {
      name: 'upper-frame-store',
      partialize: (s) => ({ nickname: s.nickname }),
    },
  ),
)
