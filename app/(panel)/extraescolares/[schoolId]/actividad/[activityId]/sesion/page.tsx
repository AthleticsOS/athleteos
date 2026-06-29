'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams } from 'next/navigation'

export default function NuevaSesionActividad() {
  const { schoolId, activityId } = useParams()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSubmit() {
    setLoading(true)
    await supabase.from('activity_sessions').insert({ activity_id: activityId, date, notes: notes || null })
    window.location.href = `/extraescolares/${schoolId}/actividad/${activityId}`
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href={`/extraescolares/${schoolId}/actividad/${activityId}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Registrar sesión</h1>
        </div>
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
          </div>
          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Notas (opcional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones de la sesión..." rows={3} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <p style={{ color: '#3A4A70', fontSize: '12px', margin: 0 }}>Después de crear la sesión podrás marcar la asistencia de cada alumno.</p>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '12px', borderRadius: '10px', background: loading ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Guardando...' : 'Crear sesión'}
          </button>
        </div>
      </div>
    </main>
  )
}
