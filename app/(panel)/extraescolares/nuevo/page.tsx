'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function NuevoColegio() {
  const [form, setForm] = useState({ name: '', address: '', contact_name: '', contact_phone: '', contact_email: '' })
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSubmit() {
    if (!form.name) return
    setLoading(true)
    await supabase.from('schools').insert(form)
    window.location.href = '/extraescolares'
  }

  const input = { width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
  const label = { color: '#3A4A70', fontSize: '11px', fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href="/extraescolares" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Nuevo colegio</h1>
        </div>
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={label}>Nombre del colegio *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="CEIP Juan Zaragüeta" style={input} /></div>
          <div><label style={label}>Dirección</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Calle..." style={input} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={label}>Persona de contacto</label><input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} placeholder="Nombre" style={input} /></div>
            <div><label style={label}>Teléfono</label><input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} placeholder="600 000 000" style={input} /></div>
          </div>
          <div><label style={label}>Email de contacto</label><input value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} placeholder="contacto@colegio.es" style={input} /></div>
          <button onClick={handleSubmit} disabled={loading || !form.name} style={{ padding: '12px', borderRadius: '10px', background: loading || !form.name ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading || !form.name ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Guardando...' : 'Crear colegio'}
          </button>
        </div>
      </div>
    </main>
  )
}
