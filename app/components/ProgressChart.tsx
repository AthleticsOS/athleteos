'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

type DataPoint = {
  fecha: string
  marca: number
  competicion: string
}

type Props = {
  data: DataPoint[]
  unit: string
  lowerIsBetter?: boolean
}

export default function ProgressChart({ data, unit, lowerIsBetter = true }: Props) {
  if (!data || data.length < 2) return (
    <div style={{height:'120px', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#333', fontSize:'13px'}}>Necesitas al menos 2 marcas para ver la progresión</p>
    </div>
  )

  const best = lowerIsBetter
    ? Math.min(...data.map(d => d.marca))
    : Math.max(...data.map(d => d.marca))

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="fecha"
          tick={{ fill: '#444', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          hide
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '12px'
          }}
          formatter={(value: unknown) => [`${value}${unit}`, 'Marca']}
          labelFormatter={(label: unknown) => String(label)}
        />
        <ReferenceLine
          y={best}
          stroke="#FFD700"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <Line
          type="monotone"
          dataKey="marca"
          stroke="#2563EB"
          strokeWidth={2}
          dot={{ fill: '#2563EB', strokeWidth: 0, r: 3 }}
          activeDot={{ fill: '#fff', stroke: '#2563EB', strokeWidth: 2, r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}