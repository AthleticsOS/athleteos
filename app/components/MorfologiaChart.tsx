'use client'

type Point = { fecha: string; peso: number | null; grasa: number | null }

export default function MorfologiaChart({ data }: { data: Point[] }) {
  if (data.length < 2) return null

  const weights = data.map(d => d.peso).filter(Boolean) as number[]
  const minW = Math.min(...weights) - 2
  const maxW = Math.max(...weights) + 2
  const rangeW = maxW - minW || 1

  const W = 520, H = 160, padL = 36, padR = 12, padT = 10, padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const pts = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * innerW,
    y: d.peso !== null ? padT + innerH - ((d.peso - minW) / rangeW) * innerH : null,
    d,
  }))

  const linePath = pts
    .filter(p => p.y !== null)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y!.toFixed(1)}`)
    .join(' ')

  const areaPath = pts.filter(p => p.y !== null).length > 1
    ? linePath + ` L ${pts.filter(p => p.y !== null).at(-1)!.x.toFixed(1)} ${(padT + innerH).toFixed(1)} L ${padL} ${(padT + innerH).toFixed(1)} Z`
    : ''

  return (
    <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '16px 18px' }}>
      <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: '0 0 12px' }}>Evolución de peso (kg)</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4BA3D9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4BA3D9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = padT + t * innerH
          const val = (maxW - t * rangeW).toFixed(1)
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.25)">{val}</text>
            </g>
          )
        })}
        {/* Área */}
        {areaPath && <path d={areaPath} fill="url(#wgrad)" />}
        {/* Línea */}
        <path d={linePath} fill="none" stroke="#4BA3D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Puntos */}
        {pts.filter(p => p.y !== null).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y!} r="3" fill="#4BA3D9" />
            <title>{p.d.fecha}: {p.d.peso} kg</title>
          </g>
        ))}
        {/* Etiquetas eje X */}
        {data.filter((_, i) => i === 0 || i === data.length - 1 || (data.length > 4 && i % Math.floor(data.length / 4) === 0)).map((d, _, arr) => {
          const idx = data.indexOf(d)
          const x = padL + (idx / (data.length - 1)) * innerW
          return <text key={idx} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">{d.fecha}</text>
        })}
      </svg>
    </div>
  )
}
