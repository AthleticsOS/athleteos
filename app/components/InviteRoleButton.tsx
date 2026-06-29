'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function InviteRoleButton() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('coach')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const roles = [
    { value: 'coach', label: 'Entrenador' },
    { value: 'admin_readonly', label: 'Admin solo lectura' },
    { value: 'staff', label: 'Staff' },
  ]

  async function handleSave() {
    if (!name || !role) { setError('El nombre y el rol son obligatorios'); return }
    setLoading(true); setError('')
    const { error } = await supabase.from('club_roles').insert({ name, email: email || null, role })
    if (error) { setError('Error al guardar'); setLoading(false); return }
    setSaved(true); setLoading(false)
    setTimeout(() => window.location.reload(), 1000)
  }

  if (saved) return <div style={{ color: '#10B981', fontSize: '13px' }}>✓ Rol añadido correctamente</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: '10px' }}>
        <div>
          <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Nombre *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Iván García" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '9px 12px', color: '#E8EAF0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="ivan@weathletics.com" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '9px 12px', color: '#E8EAF0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Rol *</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '9px 12px', color: '#E8EAF0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>
      {error && <p style={{ color: '#EF4444', fontSize: '12px', margin: 0 }}>{error}</p>}
      <button onClick={handleSave} disabled={loading || !name} style={{ alignSelf: 'flex-start', padding: '9px 20px', borderRadius: '9px', background: loading || !name ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: loading || !name ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Guardando...' : 'Añadir rol'}
      </button>
    </div>
  )
}
