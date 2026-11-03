import { useState } from 'react'
import { Accordion, Badge, Card, Col, Row, Table } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { GOAL, PRINCIPLES, STRETCH, WEEK, WEEK_ORDER, todayIndex } from '../data/routine'

export default function Routine() {
  const today = todayIndex()
  const [sel, setSel] = useState(today)
  const day = WEEK[sel]

  return (
    <>
      <PageHeader icon="calendar-week" title="주간 루틴" subtitle={`주 4회 (화·수·금·토) · ${GOAL.title}`} />

      <Row xs={7} className="g-2 mb-4 text-center">
        {WEEK_ORDER.map((i) => {
          const d = WEEK[i]
          return (
            <Col key={d.key}>
              <button type="button" onClick={() => setSel(i)}
                className={`day-btn w-100 rounded-3 py-2 ${i === sel ? 'active' : ''} ${d.rest ? 'is-rest' : ''}`}>
                <div className="fw-bold">{d.label}</div>
                <div className="small d-none d-md-block">{d.rest ? '휴식' : d.title.split(' + ')[0]}</div>
                {i === today && <Badge bg="warning" text="dark" className="mt-1">오늘</Badge>}
              </button>
            </Col>
          )
        })}
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <h4 className="fw-bold mb-1">{day.label}요일 — {day.title}</h4>
          <p className="text-muted">{day.desc}</p>

          {day.rest ? (
            <p className="mb-0"><i className="bi bi-moon-stars me-2" />쉬는 날이에요. 충분히 자고 잘 먹는 것도 운동의 일부입니다.</p>
          ) : (
            <>
              <div className="table-responsive">
                <Table className="align-middle mb-0">
                  <thead>
                    <tr><th>순서</th><th>운동</th><th>세트 × 반복</th><th>휴식</th></tr>
                  </thead>
                  <tbody>
                    {day.exercises.map((e, n) => (
                      <tr key={e.name}>
                        <td>{n + 1}</td>
                        <td className="fw-bold">{e.name}</td>
                        <td>{e.sets} × {e.reps}</td>
                        <td>{e.rest}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <h6 className="fw-bold mt-4"><i className="bi bi-list-check me-2" />운동 방법</h6>
              <Accordion alwaysOpen>
                {day.exercises.map((e, n) => (
                  <Accordion.Item eventKey={String(n)} key={e.name}>
                    <Accordion.Header>{n + 1}. {e.name}</Accordion.Header>
                    <Accordion.Body>{e.how}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
              {day.note && <p className="small text-muted mt-3 mb-0"><i className="bi bi-info-circle me-1" />{day.note}</p>}
            </>
          )}
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={6}>
          <Card className="h-100"><Card.Body>
            <h6 className="fw-bold"><i className="bi bi-fire me-2" />운동 전 · {STRETCH.before.time}</h6>
            <ol className="mb-3 ps-3">{STRETCH.before.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <h6 className="fw-bold"><i className="bi bi-wind me-2" />운동 후 · {STRETCH.after.time}</h6>
            <ul className="mb-0 ps-3">{STRETCH.after.steps.map((s) => <li key={s}>{s}</li>)}</ul>
          </Card.Body></Card>
        </Col>
        <Col md={6}>
          <Card className="h-100"><Card.Body>
            <h6 className="fw-bold"><i className="bi bi-graph-up-arrow me-2" />강도와 중량 증가 기준</h6>
            <ul className="mb-2 ps-3">{PRINCIPLES.map((s) => <li key={s} className="mb-1">{s}</li>)}</ul>
            <p className="small text-muted mb-0">{GOAL.note}</p>
          </Card.Body></Card>
        </Col>
      </Row>
    </>
  )
}
