'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="fecha" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
          formatter={(value: unknown) => [`${value}${unit}`]}
          labelFormatter={(label: unknown) => String(label)}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          formatter={(value) => <span style={{ color: '#666' }}>{value}</span>}
        />
        {series.map(s => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={{ fill: s.color, strokeWidth: 0, r: 3 }}
            activeDot={{ fill: '#fff', stroke: s.color, strokeWidth: 2, r: 5 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}