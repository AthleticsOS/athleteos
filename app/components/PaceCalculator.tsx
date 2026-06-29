'use client'

type Rec = { discipline: string; mark: string }
type Props = { records: Rec[]; distance: number; percentage: number }

function toSec(mark: string): number | null {
  const s = mark.trim().replace(",", ".")
  const n = parseFloat(s.replace(/[^0-9.]/g, ""))
  if (isNaN(n) || n <= 0 || n > 120) return null
  return n
}

function getDist(d: string): number | null {
  const low = d.toLowerCase()
  const pairs: [number, string][] = [[400,"400"],[300,"300"],[200,"200"],[150,"150"],[120,"120"],[100,"100"],[80,"80"],[60,"60"],[50,"50"],[40,"40"],[30,"30"],[20,"20"]]
  for (const [v, k] of pairs) {
    if (low.includes(k + "m") || low.startsWith(k)) return v
  }
  return null
}

function fmt(s: number): string {
  if (s < 60) return s.toFixed(2) + "s"
  const m = Math.floor(s / 60)
  const sec = (s % 60).toFixed(1).padStart(4, "0")
  return m + ":" + sec
}

export default function PaceCalculator({ records, distance, percentage }: Props) {
  const known: {d: number; t: number}[] = []
  for (const r of records) {
    const d = getDist(r.discipline)
    const t = toSec(r.mark)
    if (d && t) known.push({ d, t })
  }

  let base: number | null = null
  const exact = known.find(k => k.d === distance)
  if (exact) {
    base = exact.t
  } else if (known.length > 0) {
    known.sort((a, b) => a.d - b.d)
    const lo = known.filter(k => k.d < distance)
    const hi = known.filter(k => k.d > distance)
    if (lo.length > 0 && hi.length > 0) {
      const l = lo[lo.length - 1], h = hi[0]
      base = l.t + (h.t - l.t) * (distance - l.d) / (h.d - l.d)
    } else {
      const ref = known[0]
      base = (ref.t / ref.d) * distance
    }
  }

  if (!base) return (
    <div style={{backgroundColor:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:"10px",padding:"12px 16px"}}>
      <p style={{color:"#F59E0B",fontSize:"13px",margin:0}}>Sin marcas para calcular ritmo en {distance}m</p>
    </div>
  )

  const target = base / (percentage / 100)

  return (
    <div style={{backgroundColor:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:"12px",padding:"16px"}}>
      <div style={{color:"#818CF8",fontSize:"12px",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"10px"}}>
        Ritmo objetivo — {distance}m al {percentage}%
      </div>
      <div style={{display:"flex",alignItems:"baseline",gap:"12px",marginBottom:"8px"}}>
        <div style={{fontSize:"36px",fontWeight:"800",color:"#A5B4FC",fontFamily:"monospace",letterSpacing:"-0.02em"}}>{fmt(target)}</div>
        <div style={{color:"#555",fontSize:"13px"}}>por serie</div>
      </div>
      <div style={{color:"#444",fontSize:"12px"}}>
        Marca base {fmt(base)} en {distance}m · al {percentage}% = {fmt(target)}
      </div>
    </div>
  )
}
