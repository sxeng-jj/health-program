import { Button, Card, Col, ProgressBar, Row, Table } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { fmt, useNow } from '../hooks/useNow'
import { cdLeft, swElapsed, useTimerStore } from '../store/useTimerStore'

const PRESETS = [30, 60, 90, 120, 180]
const label = (s) => (s >= 60 ? `${s / 60}분` : `${s}초`)

export default function Timer() {
  const { sw, cd } = useTimerStore()
  const now = useNow(sw.running || cd.running)

  return (
    <>
      <PageHeader icon="stopwatch" title="스톱워치·타이머" subtitle="휴식 시간과 세트 시간을 측정합니다" />
      <Row className="g-3">
        <Col lg={6}><Rest cd={cd} now={now} /></Col>
        <Col lg={6}><Stopwatch sw={sw} now={now} /></Col>
      </Row>
    </>
  )
}

function Rest({ cd, now }) {
  const { cdStart, cdToggle, cdAdd, cdReset } = useTimerStore()
  const left = cdLeft(cd, now)
  const idle = cd.total === 0
  const pct = cd.total ? (left / cd.total) * 100 : 0

  return (
    <Card className="h-100">
      <Card.Body className="text-center">
        <h5 className="fw-bold"><i className="bi bi-hourglass-split me-2" />휴식 타이머</h5>
        {cd.label && <div className="small text-muted">{cd.label}</div>}
        <div className={`clock my-3 ${cd.done ? 'text-warning' : ''}`}>
          {cd.done ? '휴식 끝!' : fmt(Math.ceil(left / 1000) * 1000)}
        </div>
        <ProgressBar now={pct} variant={cd.done ? 'warning' : 'primary'} className="mb-3" style={{ height: 8 }} />

        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {PRESETS.map((s) => (
            <Button key={s} variant="outline-primary" size="sm" onClick={() => cdStart(s)}>{label(s)}</Button>
          ))}
        </div>

        <div className="d-flex justify-content-center gap-2">
          <Button variant="outline-secondary" disabled={idle || cd.done} onClick={() => cdAdd(-15)}>−15초</Button>
          <Button variant={cd.running ? 'warning' : 'primary'} disabled={idle || cd.done} onClick={cdToggle}>
            <i className={`bi bi-${cd.running ? 'pause' : 'play'}-fill me-1`} />{cd.running ? '일시정지' : '시작'}
          </Button>
          <Button variant="outline-secondary" disabled={idle || cd.done} onClick={() => cdAdd(15)}>+15초</Button>
          <Button variant="outline-danger" disabled={idle} onClick={cdReset}>리셋</Button>
        </div>
      </Card.Body>
    </Card>
  )
}

function Stopwatch({ sw, now }) {
  const { swStart, swStop, swLap, swReset } = useTimerStore()
  const elapsed = swElapsed(sw, now)

  return (
    <Card className="h-100">
      <Card.Body className="text-center">
        <h5 className="fw-bold"><i className="bi bi-stopwatch me-2" />스톱워치</h5>
        <div className="clock my-3">{fmt(elapsed, true)}</div>

        <div className="d-flex justify-content-center gap-2 mb-3">
          {sw.running ? (
            <Button variant="warning" onClick={swStop}><i className="bi bi-pause-fill me-1" />정지</Button>
          ) : (
            <Button variant="primary" onClick={swStart}><i className="bi bi-play-fill me-1" />{elapsed ? '계속' : '시작'}</Button>
          )}
          <Button variant="outline-secondary" disabled={!sw.running} onClick={swLap}><i className="bi bi-flag me-1" />랩</Button>
          <Button variant="outline-danger" disabled={!elapsed} onClick={swReset}>리셋</Button>
        </div>

        {sw.laps.length > 0 && (
          <div className="lap-list">
            <Table size="sm" className="mb-0 text-start">
              <thead><tr><th>랩</th><th>구간</th><th>누적</th></tr></thead>
              <tbody>
                {sw.laps.map((l, i) => (
                  <tr key={l.total}>
                    <td>{sw.laps.length - i}</td>
                    <td>{fmt(l.split, true)}</td>
                    <td>{fmt(l.total, true)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
