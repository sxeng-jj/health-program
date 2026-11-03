import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Routine from './pages/Routine'
import Workout from './pages/Workout'
import Timer from './pages/Timer'
import Log from './pages/Log'
import NotFound from './pages/NotFound'

// 페이지를 추가할 때: ① pages/에 파일 만들기 ② NAV_ITEMS 에 한 줄 ③ routes 에 한 줄
// 아이콘 이름: https://icons.getbootstrap.com
export const NAV_ITEMS = [
  { to: '/', label: '홈', icon: 'house' },
  { to: '/routine', label: '루틴', icon: 'calendar-week' },
  { to: '/workout', label: '운동', icon: 'activity' },
  { to: '/timer', label: '타이머', icon: 'stopwatch' },
  { to: '/log', label: '기록', icon: 'journal-text' },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'routine', element: <Routine /> },
      { path: 'workout', element: <Workout /> },
      { path: 'timer', element: <Timer /> },
      { path: 'log', element: <Log /> },
    ],
  },
])
