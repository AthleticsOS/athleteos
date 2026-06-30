'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Athlete = { id: string, first_name: string, last_name: string, email: string | null, phone: string | null }

export default function EditarDatosAtleta({ athlete }: { athlete: Athlete }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ first_name: athlete.first_name, last_name: athlete.last_name, email: athlete.email || '', phone: athlete.phone || '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSave() {
    setLoading(true)
    await supabase.from('athletes').update(form).eq('id', athlete.id)
    setSaved(true); setLoading(false)
    setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
  }

  const inputStyle = { width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties

  return (
    <div style={{ marginBottom: '12px' }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#3A4A70', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          ✏️ Actualizar mis datos
        </button>
      ) : (
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Mis datos</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Nombre</label>
              <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Apellidos</label>
              <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Teléfono</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: '9px', background: saved ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: saved ? '1px solid rgba(16,185,129,0.3)' : 'none', color: saved ? '#10B981' : 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              {loading ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
