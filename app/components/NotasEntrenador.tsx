'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Nota = { id: string; content: string; created_at: string; author?: string }

export default function NotasEntrenador({ athleteId, initial }: { athleteId: string; initial: Nota[] }) {
  const [notas, setNotas] = useState<Nota[]>(initial)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function addNota() {
    if (!content.trim()) return
    setSaving(true)
    const { data } = await supabase.from('coach_notes').insert({ athlete_id: athleteId, content: content.trim() }).select().single()
    if (data) setNotas(p => [data, ...p])
    setContent('')
    setSaving(false)
  }

  async function deleteNota(id: string) {
    await supabase.from('coach_notes').delete().eq('id', id)
    setNotas(p => p.filter(n => n.id !== id))
  }

  return (
    <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
        <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>📝 Notas del entrenador <span style={{ color: '#2A3550', fontSize: '11px', fontWeight: '400' }}>(solo staff)</span></p>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(75,163,217,0.04)', display: 'flex', gap: '8px' }}>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Añadir nota privada…" rows={2}
          style={{ flex: 1, backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '8px', color: '#CDD0E0', fontSize: '13px', padding: '8px 11px', outline: 'none', resize: 'none' }} />
        <button onClick={addNota} disabled={saving || !content.trim()}
          style={{ padding: '8px 14px', borderRadius: '8px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', alignSelf: 'flex-end', opacity: saving || !content.trim() ? 0.5 : 1 }}>
          {saving ? '…' : 'Guardar'}
        </button>
      </div>

      {notas.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin notas</div>
      ) : (
        notas.map((n, i) => (
          <div key={n.id} style={{ padding: '11px 16px', borderBottom: i < notas.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', lineHeight: '1.5', margin: '0 0 3px', whiteSpace: 'pre-wrap' }}>{n.content}</p>
              <span style={{ color: '#2A3550', fontSize: '10px' }}>{new Date(n.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <button onClick={() => deleteNota(n.id)} style={{ background: 'none', border: 'none', color: '#1A2040', fontSize: '14px', cursor: 'pointer', padding: '0', lineHeight: 1, flexShrink: 0 }}>✕</button>
          </div>
        ))
      )}
    </div>
  )
}
