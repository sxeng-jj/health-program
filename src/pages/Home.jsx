import { Card, Col, Form, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'

export default function Home() {
  const nickname = useAppStore((s) => s.nickname)
  const setNickname = useAppStore((s) => s.setNickname)

  return (
    <>
      <section className="hero rounded-4 p-4 p-md-5 mb-4">
        <div className="small text-uppercase fw-bold mb-2 hero-tag">주 4회 · 상체 프레임 · 벌크업</div>
        <h1 className="fw-bold display-5">Upper Frame</h1>
        <p className="lead mb-0">어깨 · 등 · 가슴. 루틴을 따라가고, 쉬는 시간을 재고, 기록으로 남기세요.</p>
      </section>

      <Row xs={1} sm={2} lg={4} className="g-3">
        {NAV_ITEMS.filter((i) => i.to !== '/').map((i) => (
          <Col key={i.to}>
            <Card as={Link} to={i.to} className="h-100 text-decoration-none menu-card">
              <Card.Body className="text-center py-4">
                <i className={`bi bi-${i.icon} fs-1 text-primary`} />
                <div className="fw-bold mt-2">{i.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="mt-4">
        <Card.Body>
          <Card.Title className="fs-6 fw-bold"><i className="bi bi-person me-2" />닉네임</Card.Title>
          <Form.Control placeholder="기록에 사용할 닉네임" value={nickname}
            onChange={(e) => setNickname(e.target.value)} style={{ maxWidth: 320 }} />
          <Form.Text>운동 기록이 이 닉네임으로 저장됩니다. 새로고침해도 남아 있습니다.</Form.Text>
        </Card.Body>
      </Card>
    </>
  )
}
