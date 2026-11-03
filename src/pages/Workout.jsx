import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, ProgressBar, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { WEEK, todayIndex } from '../data/routine'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { setKey, useWorkoutStore } from '../store/useWorkoutStore'

const TRAIN_DAYS = [2, 3, 5, 6] // 화 수 금 토
const CONDITIONS = ['좋음', '보통', '나쁨']

export default function Workout() {
  const session = useWorkoutStore((s) => s.session)
  return (
    <>
      <PageHeader icon="activity" title="오늘의 운동" subtitle="세트를 완료하면 기록이 저장되고 휴식 타이머가 시작됩니다" />
      {session ? <Session /> : <Start />}
    </>
  )
}

function Start() {
  const startSession = useWorkoutStore((s) => s.startSession)
  const today = todayIndex()

  return (
    <>
      {!TRAIN_DAYS.includes(today) && (
        <Alert variant="secondary"><i className="bi bi-moon-stars me-2" />오늘은 휴식일이에요. 원하면 다른 요일 루틴을 골라 시작할 수 있어요.</Alert>
      )}
      <Row xs={1} sm={2} className="g-3">
        {TRAIN_DAYS.map((i) => {
          const d = WEEK[i]
          return (
            <Col key={d.key}>
              <Card className={`h-100 ${i === today ? 'border-primary' : ''}`}>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between">
                    <h5 className="fw-bold">{d.label}요일 {i === today && <Badge bg="warning" text="dark">오늘</Badge>}</h5>
                    <span className="text-muted small">{d.exercises.length}종목</span>
                  </div>
                  <div className="fw-bold">{d.title}</div>
                  <div className="text-muted small mb-3">{d.desc}</div>
                  <Button className="mt-auto" variant={i === today ? 'primary' : 'outline-primary'} onClick={() => startSession(i)}>
                    <i className="bi bi-play-fill me-1" />운동 시작
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>
    </>
  )
}

function Session() {
  const { session, setCondition, endSession } = useWorkoutStore()
  const nickname = useAppStore((s) => s.nickname)
  const day = WEEK[session.dayIdx]
  const [last, setLast] = useState({}) // 운동 이름 → 지난번 { weight, reps }

  // 지난번 기록을 불러와 입력칸 기본값으로 씁니다
  useEffect(() => {
    if (!supabase) return
    supabase.from('workout_logs').select('exercise,weight,reps,log_date')
      .eq('nickname', nickname || '익명').lt('log_date', session.date)
      .order('log_date', { ascending: false }).order('id', { ascending: false }).limit(300)
      .then(({ data }) => {
        const map = {}
        for (const r of data ?? []) if (!map[r.exercise]) map[r.exercise] = r
        setLast(map)
      })
  }, [nickname, session.date])

  const total = day.exercises.reduce((n, e) => n + e.sets, 0)
  const done = Object.values(session.sets).filter((s) => s.done).length
  const finished = done >= total

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <div>
              <h5 className="fw-bold mb-0">{day.label}요일 — {day.title}</h5>
              <div className="text-muted small">{session.date} · {done}/{total} 세트 완료</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Form.Select size="sm" value={session.condition} onChange={(e) => setCondition(e.target.value)} aria-label="컨디션">
                {CONDITIONS.map((c) => <option key={c} value={c}>컨디션 {c}</option>)}
              </Form.Select>
              <Button size="sm" variant="outline-danger" onClick={() => { if (confirm('진행 중인 운동 화면을 닫을까요? 저장된 기록은 유지돼요.')) endSession() }}>종료</Button>
            </div>
          </div>
          <ProgressBar now={(done / total) * 100} variant={finished ? 'success' : 'primary'} style={{ height: 8 }} />
        </Card.Body>
      </Card>

      {!nickname && (
        <Alert variant="warning">닉네임이 없어 <b>익명</b>으로 저장돼요. <Link to="/">홈에서 닉네임 설정</Link></Alert>
      )}
      {finished && (
        <Alert variant="success"><i className="bi bi-trophy me-2" />오늘 운동 완료! 수고했어요. 기록은 <Link to="/log">기록</Link> 페이지에서 볼 수 있어요.</Alert>
      )}

      {day.exercises.map((ex, exIdx) => (
        <Exercise key={ex.name + exIdx} ex={ex} exIdx={exIdx} last={last[ex.name]}
          isFinalExercise={exIdx === day.exercises.length - 1} />
      ))}
    </>
  )
}

function Exercise({ ex, exIdx, last, isFinalExercise }) {
  const { session, setField, completeSet, undoSet } = useWorkoutStore()
  const unit = ex.timed ? '초' : '회'
  const doneCount = Array.from({ length: ex.sets }, (_, i) => session.sets[setKey(exIdx, i + 1)]?.done).filter(Boolean).length

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="fw-bold mb-0">{exIdx + 1}. {ex.name}</h6>
            <div className="text-muted small">{ex.sets}세트 × {ex.reps} · 휴식 {ex.rest}</div>
          </div>
          <Badge bg={doneCount === ex.sets ? 'success' : 'secondary'}>{doneCount}/{ex.sets}</Badge>
        </div>
        <details className="small text-muted mb-2">
          <summary>운동 방법</summary>
          <div className="mt-1">{ex.how}</div>
        </details>
        {last && <div className="small text-info mb-2"><i className="bi bi-clock-history me-1" />지난번 {last.weight != null ? `${last.weight}kg × ` : ''}{last.reps}{unit}</div>}

        {Array.from({ length: ex.sets }, (_, i) => {
          const setNo = i + 1
          const s = session.sets[setKey(exIdx, setNo)] ?? {}
          const weight = s.weight ?? last?.weight ?? ''
          const reps = s.reps ?? last?.reps ?? ''
          const isLast = isFinalExercise && setNo === ex.sets
          return (
            <div key={setNo} className={`set-row d-flex align-items-center gap-2 mb-2 ${s.done ? 'is-done' : ''}`}>
              <span className="set-no">{setNo}</span>
              {!ex.timed && (
                <Form.Control size="sm" type="number" inputMode="decimal" min="0" step="0.5" placeholder="kg"
                  value={weight} disabled={s.done} aria-label={`${setNo}세트 중량`}
                  onChange={(e) => setField(setKey(exIdx, setNo), 'weight', e.target.value)} />
              )}
              <Form.Control size="sm" type="number" inputMode="numeric" min="0" placeholder={unit}
                value={reps} disabled={s.done} aria-label={`${setNo}세트 ${unit}`}
                onChange={(e) => setField(setKey(exIdx, setNo), 'reps', e.target.value)} />
              {s.done ? (
                <Button size="sm" variant="success" onClick={() => undoSet({ exIdx, setNo })} title="완료 취소">
                  <i className="bi bi-check-lg" />
                </Button>
              ) : (
                <Button size="sm" variant="outline-primary" disabled={!reps || Number(reps) <= 0}
                  onClick={() => completeSet({ ex, exIdx, setNo, weight, reps, rest: !isLast })}>
                  완료
                </Button>
              )}
            </div>
          )
        })}
      </Card.Body>
    </Card>
  )
}
