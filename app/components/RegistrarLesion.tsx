'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function RegistrarLesion({ athleteId }: { athleteId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: '', body_part: '', severity: 'moderate', start_date: new Date().toISOString().split('T')[0], end_date: '', notes: '' })
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSave() {
    if (!form.type || !form.body_part) return
    setLoading(true)
    await supabase.from('injury_records').insert({ athlete_id: athleteId, ...form, end_date: form.end_date || null })
    setLoading(false); setOpen(false)
    window.location.reload()
  }

  const inputStyle = { width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
  const labelStyle = { color: '#3A4A70', fontSize: '11px', fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ padding: '8px 14px', borderRadius: '9px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
      + Registrar lesión
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px', width: '440px' }} onClick={e => e.stopPropagation()}>
        <div style={{ color: '#CDD0E0', fontSize: '15px', fontWeight: '700', marginBottom: '18px' }}>Registrar lesión</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={labelStyle}>Tipo de lesión</label><input value={form.type} onChange={e => setForm({...form, type: e.target.value})} placeholder="Esguince, rotura..." style={inputStyle} /></div>
            <div><label style={labelStyle}>Zona del cuerpo</label><input value={form.body_part} onChange={e => setForm({...form, body_part: e.target.value})} placeholder="Tobillo, isquio..." style={inputStyle} /></div>
          </div>
          <div>
            <label style={labelStyle}>Gravedad</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[['mild','Leve','#10B981'],['moderate','Moderada','#F59E0B'],['severe','Grave','#EF4444']].map(([val, label, color]) => (
                <button key={val} onClick={() => setForm({...form, severity: val})} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: `1px solid ${form.severity===val ? color+'60' : 'rgba(255,255,255,0.06)'}`, backgroundColor: form.severity===val ? color+'15' : 'rgba(255,255,255,0.02)', color: form.severity===val ? color : '#3A4A70', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={labelStyle}>Fecha inicio</label><input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} style={{...inputStyle, colorScheme:'dark'}} /></div>
            <div><label style={labelStyle}>Fecha alta (si ya)</label><input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={{...inputStyle, colorScheme:'dark'}} /></div>
          </div>
          <div><label style={labelStyle}>Notas</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} style={{...inputStyle, resize:'none'}} placeholder="Contexto, tratamiento previsto..." /></div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={loading || !form.type || !form.body_part} style={{ flex: 2, padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg,#7C1111,#EF4444)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            {loading ? 'Guardando...' : 'Registrar lesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
