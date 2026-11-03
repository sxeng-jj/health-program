import { useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, ButtonGroup, Card, Col, Form, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import TrendChart from '../components/TrendChart'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

const METRICS = {
  max: { label: '최고 중량', unit: 'kg', calc: (rows) => Math.max(...rows.map((r) => Number(r.weight ?? 0))) },
  volume: { label: '총 볼륨', unit: 'kg', calc: (rows) => rows.reduce((n, r) => n + Number(r.weight ?? 0) * (r.reps ?? 0), 0) },
  reps: { label: '총 횟수', unit: '회', calc: (rows) => rows.reduce((n, r) => n + (r.reps ?? 0), 0) },
}
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']
const dayLabel = (d) => `${d} (${WEEKDAY[new Date(`${d}T00:00:00`).getDay()]})`

export default function Log() {
  const nickname = useAppStore((s) => s.nickname)
  const toast = useAppStore((s) => s.toast)
  const who = nickname || '익명'
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState('')
  const [exercise, setExercise] = useState('')
  const [metric, setMetric] = useState('max')

  useEffect(() => {
    if (!supabase) return
    let alive = true
    supabase.from('workout_logs').select('*').eq('nickname', who)
      .order('log_date', { ascending: false }).order('id', { ascending: false }).limit(1000)
      .then(({ data, error: e }) => {
        if (!alive) return
        setLoading(false)
        setError(e ? e.message : '')
        if (data) setRows(data)
      })
    return () => { alive = false }
  }, [who])

  const remove = async (id) => {
    const { error: e } = await supabase.from('workout_logs').delete().eq('id', id)
    if (e) return toast(`삭제 실패: ${e.message}`, 'danger')
    setRows((rs) => rs.filter((r) => r.id !== id))
  }

  const byDate = useMemo(() => {
    const m = new Map()
    for (const r of rows) m.set(r.log_date, [...(m.get(r.log_date) ?? []), r])
    return [...m.entries()] // 이미 최신 날짜순
  }, [rows])

  const exercises = useMemo(() => [...new Set(rows.map((r) => r.exercise))], [rows])
  const current = exercises.includes(exercise) ? exercise : exercises[0] ?? ''

  const points = useMemo(() => {
    const m = METRICS[metric]
    return byDate.map(([date, rs]) => [date, rs.filter((r) => r.exercise === current)])
      .filter(([, rs]) => rs.length)
      .map(([date, rs]) => ({ label: date, value: Math.round(m.calc(rs) * 10) / 10 }))
      .reverse()
  }, [byDate, current, metric])

  if (!supabase) {
    return (
      <>
        <PageHeader icon="journal-text" title="운동 기록" subtitle="날짜별 기록과 중량 추이" />
        <Alert variant="warning">Supabase 설정(.env.local)이 없어 기록을 볼 수 없어요.</Alert>
      </>
    )
  }

  return (
    <>
      <PageHeader icon="journal-text" title="운동 기록" subtitle={`${who} 님의 기록 · 날짜별 기록과 중량 추이`} />
      {!nickname && <Alert variant="secondary">닉네임이 없어 <b>익명</b> 기록을 보고 있어요. <Link to="/">홈에서 닉네임 설정</Link></Alert>}
      <ErrorAlert error={error} />
      {loading ? <Loading /> : rows.length === 0 ? (
        <Empty text="아직 기록이 없어요. 운동 페이지에서 첫 세트를 완료해 보세요" />
      ) : (
        <>
          <Row xs={3} className="g-2 mb-4 text-center">
            <Col><Stat label="운동한 날" value={byDate.length} unit="일" /></Col>
            <Col><Stat label="총 세트" value={rows.length} unit="세트" /></Col>
            <Col><Stat label="최근 운동" value={byDate[0][0].slice(5)} /></Col>
          </Row>

          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h6 className="fw-bold mb-0"><i className="bi bi-graph-up me-2" />종목별 추이</h6>
                <div className="d-flex gap-2">
                  <Form.Select size="sm" value={current} onChange={(e) => setExercise(e.target.value)} aria-label="종목">
                    {exercises.map((x) => <option key={x}>{x}</option>)}
                  </Form.Select>
                  <ButtonGroup size="sm">
                    {Object.entries(METRICS).map(([k, m]) => (
                      <Button key={k} variant={metric === k ? 'primary' : 'outline-primary'} className="text-nowrap" onClick={() => setMetric(k)}>{m.label}</Button>
                    ))}
                  </ButtonGroup>
                </div>
              </div>
              <TrendChart points={points} unit={METRICS[metric].unit} />
            </Card.Body>
          </Card>

          <h6 className="fw-bold mb-3"><i className="bi bi-calendar3 me-2" />날짜별 기록</h6>
          {byDate.map(([date, rs]) => <DayCard key={date} date={date} rows={rs} onDelete={remove} />)}
        </>
      )}
    </>
  )
}

function Stat({ label, value, unit }) {
  return (
    <Card><Card.Body className="py-3">
      <div className="small text-muted">{label}</div>
      <div className="fs-4 fw-bold">{value}{unit && <span className="fs-6 ms-1">{unit}</span>}</div>
    </Card.Body></Card>
  )
}

function DayCard({ date, rows, onDelete }) {
  // 종목별로 묶기 (입력한 순서 = id 오름차순)
  const groups = useMemo(() => {
    const m = new Map()
    for (const r of [...rows].sort((a, b) => a.id - b.id)) m.set(r.exercise, [...(m.get(r.exercise) ?? []), r])
    return [...m.entries()]
  }, [rows])

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0">{dayLabel(date)}</h6>
          <div className="small text-muted">{rows.length}세트 · 컨디션 <Badge bg="secondary">{rows[0].condition ?? '-'}</Badge></div>
        </div>
        {groups.map(([name, rs]) => (
          <div key={name} className="mb-2">
            <div className="fw-bold small">{name}</div>
            <div className="d-flex flex-wrap gap-2">
              {rs.map((r) => (
                <span key={r.id} className="log-chip">
                  {r.set_no}세트 · {r.weight != null ? `${Number(r.weight)}kg × ` : ''}{r.reps}
                  <button type="button" className="btn-close btn-close-white ms-2" aria-label="기록 삭제"
                    onClick={() => confirm('이 세트 기록을 삭제할까요?') && onDelete(r.id)} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </Card.Body>
    </Card>
  )
}
