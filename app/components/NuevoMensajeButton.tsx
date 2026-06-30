'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Athlete = { id: string, first_name: string, last_name: string }

export default function NuevoMensajeButton({ athletes }: { athletes: Athlete[] }) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSend() {
    if (!selectedId || !content.trim()) return
    setLoading(true)
    await supabase.from('direct_messages').insert({ athlete_id: selectedId, content: content.trim(), from_director: true, read: false })
    window.location.href = `/communication/mensajes/${selectedId}`
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
      + Nuevo mensaje
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '16px', padding: '24px', width: '420px' }} onClick={e => e.stopPropagation()}>
        <div style={{ color: '#CDD0E0', fontSize: '15px', fontWeight: '700', marginBottom: '18px' }}>Nuevo mensaje</div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Atleta</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', colorScheme: 'dark' }}>
            <option value="">Seleccionar atleta...</option>
            {athletes.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Mensaje</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Escribe tu mensaje..." rows={4} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSend} disabled={loading || !selectedId || !content.trim()} style={{ flex: 2, padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: !selectedId || !content.trim() ? 0.5 : 1 }}>
            {loading ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </div>
      </div>
    </div>
  )
}
