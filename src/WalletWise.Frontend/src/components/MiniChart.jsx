const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export function chartAxisLabels(daysCount = 30) {
  const today = new Date()
  const start = new Date(today); start.setDate(start.getDate() - (daysCount - 1))
  const mid   = new Date(today); mid.setDate(mid.getDate() - Math.floor((daysCount - 1) / 2))
  return [MESES[start.getMonth()], MESES[mid.getMonth()], MESES[today.getMonth()]]
}

export function calcTrend(historico) {
  if (!historico?.length || historico.length < 4) return null
  const mid    = Math.floor(historico.length / 2)
  const recent = historico.slice(0, mid).reduce((a, b) => a + b, 0) / mid
  const older  = historico.slice(mid).reduce((a, b) => a + b, 0) / (historico.length - mid)
  const diff   = (recent - older) / older * 100
  if (diff < -2) return { text: 'Tendência de queda no médio prazo', icon: 'trending_down', cls: 'text-secondary', dot: 'bg-secondary' }
  if (diff > 2)  return { text: 'Tendência de alta no médio prazo',  icon: 'trending_up',   cls: 'text-error',     dot: 'bg-error'     }
  return           { text: 'Câmbio estável no médio prazo',          icon: 'trending_flat',  cls: 'text-accent',    dot: 'bg-accent'    }
}

// Catmull-Rom → cubic bezier conversion for smooth curves
function smoothPath(coords) {
  if (coords.length < 2) return ''
  const t = 0.35
  return coords.map(([x, y], i) => {
    if (i === 0) return `M${x} ${y}`
    const [px, py] = coords[i - 1]
    const [nx, ny] = coords[i + 1] ?? [x, y]
    const [ppx, ppy] = coords[i - 2] ?? [px, py]
    const cp1x = (px + (x - ppx) * t).toFixed(2)
    const cp1y = (py + (y - ppy) * t).toFixed(2)
    const cp2x = (x  - (nx - px) * t).toFixed(2)
    const cp2y = (y  - (ny - py) * t).toFixed(2)
    return `C${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x} ${y}`
  }).join(' ')
}

export default function MiniChart({ historico, colorCls = 'text-secondary', chartId = 'default' }) {
  if (!historico?.length || historico.length < 2) return null

  const pts = [...historico].reverse()
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || min * 0.01 || 1

  const W = 300, H = 90, PX = 4, PY = 8
  const coords = pts.map((v, i) => [
    +(PX + (i / (pts.length - 1)) * (W - PX * 2)).toFixed(2),
    +((H - PY) - ((v - min) / range) * (H - PY * 2)).toFixed(2),
  ])

  const linePath = smoothPath(coords)
  const [lx, ly] = coords[coords.length - 1]
  const [fx]     = coords[0]
  const fillPath = `${linePath} L${lx} ${H} L${fx} ${H} Z`
  const gradId   = `cg-${chartId}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full h-full ${colorCls}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="4.5" fill="currentColor" />
    </svg>
  )
}
