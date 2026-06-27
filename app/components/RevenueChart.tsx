'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { mes: 'Ene', ingresos: 320 },
  { mes: 'Feb', ingresos: 480 },
  { mes: 'Mar', ingresos: 420 },
  { mes: 'Abr', ingresos: 560 },
  { mes: 'May', ingresos: 490 },
  { mes: 'Jun', ingresos: 680 },
]

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="mes" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
          formatter={(value: number) => [`€${value}`, 'Ingresos']}
        />
        <Area type="monotone" dataKey="ingresos" stroke="#2563EB" strokeWidth={2} fill="url(#colorIngresos)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}