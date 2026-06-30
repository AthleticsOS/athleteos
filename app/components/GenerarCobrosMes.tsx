'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Enrollment = { id: string, student_name: string }

export default function GenerarCobrosMes({ activityId, activityName, priceCents, enrollments }: {
  activityId: string, activityName: string, priceCents: number, enrollments: Enrollment[]
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleGenerar() {
    setLoading(true)
    const [year, mon] = month.split('-').map(Number)
    const monthName = new Date(year, mon-1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    const dueDate = new Date(year, mon-1, 5).toISOString().split('T')[0]
    await Promise.all(enrollments.map(e =>
      supabase.from('activity_payments').insert({
        enrollment_id: e.id,
        concept: `Cuota ${activityName} - ${monthName}`,
        amount_cents: priceCents,
        status: 'pending',
        due_date: dueDate,
      })
    ))
    setLoading(false); setDone(true); setOpen(false)
    window.location.reload()
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      padding: '8px 14px', borderRadius: '9px', backgroundColor: 'rgba(245,158,11,0.08)',
      border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none'
    }}>
      {done ? '✓ Cobros generados' : '€ Generar cobros del mes'}
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '16px', padding: '24px', width: '380px' }} onClick={e => e.stopPropagation()}>
        <div style={{ color: '#CDD0E0', fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Generar cobros del mes</div>
        <div style={{ color: '#3A4A70', fontSize: '12px', marginBottom: '18px' }}>
          Se creará un cobro de <strong style={{ color: '#F59E0B' }}>€{(priceCents/100).toFixed(0)}</strong> para {enrollments.length} alumno{enrollments.length !== 1 ? 's' : ''}.
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Mes</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleGenerar} disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg,#7C4A00,#F59E0B)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            {loading ? 'Generando...' : `Generar ${enrollments.length} cobros`}
          </button>
        </div>
      </div>
    </div>
  )
}
