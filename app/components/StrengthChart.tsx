'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine, CartesianGrid } from 'recharts'

type DataPoint = {
  fecha: string
  [key: string]: string | number | null
}

type Serie = {
  key: string
  label: string
  color: string
}

type Props = {
  data: DataPoint[]
  series: Serie[]
  unit?: string
}

export default function StrengthChart({ data, series, unit = 'kg' }: Props) {
  if (!data || data.length < 2) return (
    <div style={{height:'120px', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#333', fontSize:'13px'}}>Necesitas al menos 2 registros para ver la progresion</p>
    </div>
  )

  const allValues = data.flatMap(d =>
    series.map(s => d[s.key]).filter(v => v !== null && v !== undefined) as number[]
  )
  const minVal = Math.floor(Math.min(...allValues) * 0.95)
  const maxVal = Math.ceil(Math.max(...allValues) * 1.05)
  const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length

  return (
    <div>
      <div style={{display:'flex', gap:'16px', marginBottom:'12px', flexWrap:'wrap'}}>
        {series.map(s => {
          const vals = data.map(d => d[s.key]).filter(v => v !== null && v !== undefined) as number[]
          if (vals.length === 0) return null
          const last = vals[vals.length - 1]
          const first = vals[0]
          const diff = last - first
          return (
            <div key={s.key} style={{display:'flex', alignItems:'center', gap:'8px', backgroundColor:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'8px 12px'}}>
              <div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:s.color, flexShrink:0}}/>
              <div>
                <div style={{color:'#555', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.06em'}}>{s.label}</div>
                <div style={{display:'flex', alignItems:'baseline', gap:'6px', marginTop:'2px'}}>
                  <span style={{color:s.color, fontSize:'16px', fontWeight:'700', fontFamily:'monospace'}}>{last}{unit}</span>
                  {diff !== 0 && (
                    <span style={{fontSize:'11px', color: diff > 0 ? '#10B981' : '#EF4444', fontWeight:'600'}}>
                      {diff > 0 ? '↑' : '↓'} {Math.abs(diff)}{unit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="fecha" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[minVal, maxVal]} tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} width={35}
            tickFormatter={(v) => `${v}${unit}`} />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            formatter={(value: unknown) => [`${value}${unit}`]}
            labelFormatter={(label: unknown) => String(label)}
          />
          <ReferenceLine y={avg} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} formatter={(value) => <span style={{ color: '#555' }}>{value}</span>} />
          {series.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ fill: s.color, strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#fff', stroke: s.color, strokeWidth: 2, r: 6 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}