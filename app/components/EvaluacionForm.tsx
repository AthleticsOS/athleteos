'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const CRITERIA = [
  { key: 'actitud', label: 'Actitud', desc: 'Disposición y compromiso' },
  { key: 'tecnica', label: 'Técnica', desc: 'Calidad de movimiento' },
  { key: 'fisico', label: 'Físico', desc: 'Condición y capacidades' },
  { key: 'constancia', label: 'Constancia', desc: 'Regularidad y esfuerzo' },
  { key: 'mental', label: 'Mental', desc: 'Fortaleza y concentración' },
]

export default function EvaluacionForm({ athleteId }: { athleteId: string }) {
  const [scores, setScores] = useState<Record<string, number>>({ actitud: 3, tecnica: 3, fisico: 3, constancia: 3, mental: 3 })
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function save() {
    setSaving(true)
    await supabase.from('athlete_evaluations').insert({ athlete_id: athleteId, ...scores, notes: notes || null })
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); window.location.reload() }, 1500)
  }

  const media = (Object.values(scores).reduce((a, b) => a + b, 0) / 5).toFixed(1)

  return (
    <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>+ Nueva evaluación</p>
        <div style={{ fontSize: '20px', fontWeight: '900', color: '#4BA3D9' }}>{media}</div>
      </div>

      {CRITERIA.map(c => (
        <div key={c.key} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '600' }}>{c.label} <span style={{ color: '#1A2040', fontWeight: '400' }}>— {c.desc}</span></label>
            <span style={{ color: '#4BA3D9', fontSize: '12px', fontWeight: '700' }}>{scores[c.key]}/5</span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setScores(p => ({ ...p, [c.key]: n }))}
                style={{ flex: 1, height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 100ms',
                  backgroundColor: n <= scores[c.key] ? '#4BA3D9' : 'rgba(255,255,255,0.05)',
                  boxShadow: n <= scores[c.key] ? '0 0 6px rgba(75,163,217,0.3)' : 'none',
                }}>{''}</button>
            ))}
          </div>
        </div>
      ))}

      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas adicionales…" rows={2}
        style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '8px', color: '#CDD0E0', fontSize: '12px', padding: '8px 10px', outline: 'none', resize: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />

      <button onClick={save} disabled={saving}
        style={{ width: '100%', padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
        {saved ? '✅ Guardado' : saving ? 'Guardando…' : 'Guardar evaluación'}
      </button>
    </div>
  )
}
