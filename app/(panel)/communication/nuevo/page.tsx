'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function NuevoAviso() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('info')
  const [pinned, setPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit() {
    if (!title || !content) { setError('El título y el contenido son obligatorios'); return }
    setLoading(true)
    const { error } = await supabase.from('announcements').insert([{ title, content, type, pinned }])
    if (error) { setError('Error al guardar. Inténtalo de nuevo.'); setLoading(false); return }
    window.location.href = '/communication'
  }

  const types = [
    { value: 'info',    label: 'Aviso general',    color: '#4BA3D9' },
    { value: 'success', label: 'Buenas noticias',  color: '#10B981' },
    { value: 'warning', label: 'Atención',          color: '#F59E0B' },
    { value: 'urgent',  label: 'Urgente',           color: '#EF4444' },
  ]

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <a href="/communication" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Nuevo aviso</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Se mostrará a todos los atletas en su portal</p>
        </div>

        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Título *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Cambio de horario del martes" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Mensaje *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Escribe aquí el mensaje para los atletas..." rows={5} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>Tipo de aviso</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
              {types.map(t => (
                <button key={t.value} onClick={() => setType(t.value)} style={{ padding: '10px 14px', borderRadius: '9px', border: `1px solid ${type === t.value ? t.color : 'rgba(255,255,255,0.06)'}`, backgroundColor: type === t.value ? `${t.color}15` : 'rgba(255,255,255,0.02)', color: type === t.value ? t.color : '#4A5580', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: t.color, flexShrink: 0 }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setPinned(!pinned)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '9px', border: `1px solid ${pinned ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`, backgroundColor: pinned ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${pinned ? '#F59E0B' : 'rgba(255,255,255,0.15)'}`, backgroundColor: pinned ? '#F59E0B' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', flexShrink: 0 }}>
              {pinned ? '✓' : ''}
            </div>
            <span style={{ color: pinned ? '#F59E0B' : '#4A5580', fontSize: '13px', fontWeight: '500' }}>📌 Fijar este aviso arriba del todo</span>
          </button>

          {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#EF4444', fontSize: '13px' }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading || !title || !content} style={{ padding: '13px', borderRadius: '10px', background: loading || !title || !content ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading || !title || !content ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Publicando...' : 'Publicar aviso'}
          </button>
        </div>
      </div>
    </main>
  )
}
