'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import CerrarTemporadaButton from '@/app/components/CerrarTemporadaButton'

export default function Settings() {
  const [form, setForm] = useState({ name: '', legal_name: '', country: 'ES', slug: '', season: '2024-2025' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [saved, setSaved] = useState(false)
  const [clubId, setClubId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.from('clubs').select('*').single().then(({ data }) => {
      if (data) {
        setClubId(data.id)
        setForm({
          name: data.name || '',
          legal_name: data.legal_name || '',
          country: data.country || 'ES',
          slug: data.slug || '',
          season: data.season || '2024-2025',
        })
      }
      setFetching(false)
    })
  }, [])

  async function handleSubmit() {
    setLoading(true); setSaved(false)
    await supabase.from('clubs').update(form).eq('id', clubId)
    setSaved(true); setLoading(false)
  }

  async function handlePasswordChange() {
    if (newPassword.length < 6) { setPwMessage('La contraseña debe tener al menos 6 caracteres'); return }
    setPwLoading(true); setPwMessage('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPwMessage('Error al cambiar la contraseña')
    else { setPwMessage('✓ Contraseña actualizada correctamente'); setNewPassword('') }
    setPwLoading(false)
  }

  if (fetching) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <p style={{ color: '#3A4A70' }}>Cargando...</p>
    </main>
  )

  const input = { width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
  const label = { color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' } as React.CSSProperties

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Configuración</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>Datos y configuración de WeAthletics</p>
        </div>

        {/* Info del club */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', backgroundColor: 'rgba(75,163,217,0.03)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Información del club</p>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={label}>Nombre del club</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="WeAthletics" style={input} />
            </div>
            <div>
              <label style={label}>Razón social</label>
              <input value={form.legal_name} onChange={e => setForm({...form, legal_name: e.target.value})} placeholder="WeAthletics Club Deportivo" style={input} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={label}>Temporada activa</label>
                <input value={form.season} onChange={e => setForm({...form, season: e.target.value})} placeholder="2024-2025" style={input} />
              </div>
              <div>
                <label style={label}>País</label>
                <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} style={{...input, cursor:'pointer'}}>
                  <option value="ES">España</option>
                  <option value="PT">Portugal</option>
                  <option value="FR">Francia</option>
                  <option value="DE">Alemania</option>
                  <option value="IT">Italia</option>
                  <option value="GB">Reino Unido</option>
                </select>
              </div>
            </div>
            <div>
              <label style={label}>Slug (URL del club)</label>
              <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="weathleticsclub" style={input} />
              <p style={{ color: '#2A3550', fontSize: '11px', marginTop: '4px' }}>Solo letras minúsculas y guiones. Sin espacios.</p>
            </div>
          </div>
        </div>

        {/* Vista previa */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Vista previa</p>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={44} height={44} style={{ borderRadius: '50%' }} />
              <div>
                <div style={{ color: '#F0F4FF', fontWeight: '700', fontSize: '15px' }}>{form.name || 'Nombre del club'}</div>
                <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '2px' }}>Temporada {form.season} · {form.country}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mi cuenta */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Mi cuenta</p>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={label}>Cambiar contraseña</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña" style={{ ...input, flex: 1 }} />
              <button onClick={handlePasswordChange} disabled={pwLoading || !newPassword} style={{ padding: '10px 18px', borderRadius: '9px', background: pwLoading || !newPassword ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: pwLoading || !newPassword ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                {pwLoading ? 'Cambiando...' : 'Cambiar'}
              </button>
            </div>
            {pwMessage && <p style={{ color: pwMessage.startsWith('✓') ? '#10B981' : '#EF4444', fontSize: '12px', margin: 0 }}>{pwMessage}</p>}
          </div>
        </div>

        {/* Sección peligrosa */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Zona de peligro</p>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#888', fontSize: '13px', fontWeight: '500' }}>Cerrar temporada</div>
                <div style={{ color: '#3A4A70', fontSize: '11px', marginTop: '2px' }}>Archiva todos los datos de la temporada actual</div>
              </div>
              <CerrarTemporadaButton currentSeason={form.season || '2024-2025'} />
            </div>
          </div>
        </div>

        {saved && (
          <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#10B981', fontSize: '13px', marginBottom: '12px' }}>
            ✓ Cambios guardados correctamente
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: loading ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>

      </div>
    </main>
  )
}
