'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams } from 'next/navigation'

export default function NuevaActividad() {
  const { schoolId } = useParams()
  const [form, setForm] = useState({ name: '', schedule: '', max_students: '', price_cents: '', teacher: '', season: '2024-2025' })
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSubmit() {
    if (!form.name) return
    setLoading(true)
    await supabase.from('activities').insert({
      school_id: schoolId,
      name: form.name,
      schedule: form.schedule || null,
      max_students: form.max_students ? parseInt(form.max_students) : null,
      price_cents: form.price_cents ? Math.round(parseFloat(form.price_cents) * 100) : 0,
      teacher: form.teacher || null,
      season: form.season,
      active: true,
    })
    window.location.href = `/extraescolares/${schoolId}`
  }

  const input = { width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
  const label = { color: '#3A4A70', fontSize: '11px', fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href={`/extraescolares/${schoolId}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Nueva actividad</h1>
        </div>
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={label}>Nombre de la actividad *</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Atletismo, Natación, Baloncesto..." style={input} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={label}>Horario</label><input value={form.schedule} onChange={e => setForm({...form,schedule:e.target.value})} placeholder="Lunes y miércoles 17h" style={input} /></div>
            <div><label style={label}>Responsable</label><input value={form.teacher} onChange={e => setForm({...form,teacher:e.target.value})} placeholder="Nombre del monitor" style={input} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={label}>Máximo alumnos</label><input type="number" value={form.max_students} onChange={e => setForm({...form,max_students:e.target.value})} placeholder="20" style={input} /></div>
            <div><label style={label}>Precio mensual (€)</label><input type="number" step="0.01" value={form.price_cents} onChange={e => setForm({...form,price_cents:e.target.value})} placeholder="30.00" style={input} /></div>
          </div>
          <div><label style={label}>Temporada</label><input value={form.season} onChange={e => setForm({...form,season:e.target.value})} placeholder="2024-2025" style={input} /></div>
          <button onClick={handleSubmit} disabled={loading || !form.name} style={{ padding: '12px', borderRadius: '10px', background: loading || !form.name ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading || !form.name ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Guardando...' : 'Crear actividad'}
          </button>
        </div>
      </div>
    </main>
  )
}
