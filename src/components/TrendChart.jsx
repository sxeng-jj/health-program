// 의존성 없이 SVG 로 그리는 간단한 꺾은선 그래프. points: [{ label, value }] (날짜 오름차순)
const W = 600
const H = 240
const PAD = { l: 44, r: 16, t: 16, b: 32 }

export default function TrendChart({ points, unit }) {
  if (points.length === 0) return <div className="text-muted text-center py-5">그래프로 그릴 기록이 없어요</div>

  const vals = points.map((p) => p.value)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const lo = min === max ? Math.max(0, min - 1) : Math.max(0, min - (max - min) * 0.2)
  const hi = min === max ? max + 1 : max + (max - min) * 0.2
  const x = (i) => PAD.l + (points.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i / (points.length - 1)) * (W - PAD.l - PAD.r))
  const y = (v) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b)
  const ticks = [lo, (lo + hi) / 2, hi]
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-100" role="img" aria-label="중량 추이 그래프">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--bs-border-color)" strokeDasharray="3 4" />
          <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--bs-secondary-color)">{Math.round(t)}</text>
        </g>
      ))}
      <text x={4} y={12} fontSize="11" fill="var(--bs-secondary-color)">{unit}</text>
      {points.length > 1 && <path d={path} fill="none" stroke="var(--bs-primary)" strokeWidth="2.5" strokeLinejoin="round" />}
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r="4.5" fill="var(--bs-primary)" />
          <text x={x(i)} y={y(p.value) - 10} textAnchor="middle" fontSize="11" fill="var(--bs-body-color)">{p.value}</text>
          {(points.length <= 8 || i % Math.ceil(points.length / 8) === 0) && (
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--bs-secondary-color)">{p.label.slice(5)}</text>
          )}
        </g>
      ))}
    </svg>
  )
}
