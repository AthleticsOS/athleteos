'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Goal = { id: string; discipline: string; target_mark: string; current_mark?: string | null; notes?: string | null }

export default function ObjetivosAtleta({ athleteId, initial }: { athleteId: string; initial: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initial)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ discipline: '', target_mark: '', current_mark: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function addGoal() {
    if (!form.discipline || !form.target_mark) return
    setSaving(true)
    const { data } = await supabase.from('athlete_goals').insert({
      athlete_id: athleteId,
      discipline: form.discipline,
      target_mark: form.target_mark,
      current_mark: form.current_mark || null,
      notes: form.notes || null,
    }).select().single()
    if (data) setGoals(p => [...p, data])
    setSaving(false)
    setAdding(false)
    setForm({ discipline: '', target_mark: '', current_mark: '', notes: '' })
  }

  async function deleteGoal(id: string) {
    await supabase.from('athlete_goals').delete().eq('id', id)
    setGoals(p => p.filter(g => g.id !== id))
  }

  return (
    <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
        <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>🎯 Objetivos de temporada</p>
        <button onClick={() => setAdding(!adding)} style={{ padding: '5px 12px', borderRadius: '8px', backgroundColor: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          {adding ? 'Cancelar' : '+ Añadir'}
        </button>
      </div>

      {adding && (
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Disciplina', key: 'discipline', placeholder: 'Ej: 100m, Salto de longitud…' },
              { label: 'Marca objetivo', key: 'target_mark', placeholder: 'Ej: 10.50s, 7.20m…' },
              { label: 'Marca actual', key: 'current_mark', placeholder: 'Ej: 10.80s (opcional)' },
              { label: 'Notas', key: 'notes', placeholder: 'Contexto, fecha objetivo…' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '3px' }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '7px', color: '#CDD0E0', fontSize: '12px', padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <button onClick={addGoal} disabled={saving || !form.discipline || !form.target_mark}
            style={{ alignSelf: 'flex-end', padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: saving || !form.discipline || !form.target_mark ? 0.5 : 1 }}>
            {saving ? 'Guardando…' : 'Guardar objetivo'}
          </button>
        </div>
      )}

      {goals.length === 0 && !adding && (
        <div style={{ padding: '24px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin objetivos definidos aún</div>
      )}

      {goals.map((g, i) => {
        const curr = g.current_mark ? parseFloat(g.current_mark.replace(/[^0-9.]/g, '')) : null
        const target = parseFloat(g.target_mark.replace(/[^0-9.]/g, ''))
        let progress: number | null = null
        if (curr && target && !isNaN(curr) && !isNaN(target) && target > 0) {
          progress = Math.min(Math.round((curr / target) * 100), 100)
        }

        return (
          <div key={g.id} style={{ padding: '12px 18px', borderBottom: i < goals.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: progress !== null ? '8px' : 0 }}>
              <div>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{g.discipline}</div>
                <div style={{ color: '#3A4A70', fontSize: '11px', marginTop: '2px' }}>
                  {g.current_mark && <span style={{ color: '#4BA3D9' }}>{g.current_mark}</span>}
                  {g.current_mark && ' → '}
                  <span style={{ color: '#10B981', fontWeight: '700' }}>🎯 {g.target_mark}</span>
                  {g.notes && <span style={{ color: '#3A4A70' }}> · {g.notes}</span>}
                </div>
              </div>
              <button onClick={() => deleteGoal(g.id)} style={{ background: 'none', border: 'none', color: '#2A3550', fontSize: '14px', cursor: 'pointer', padding: '0', lineHeight: 1 }}>✕</button>
            </div>
            {progress !== null && (
              <div>
                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#4BA3D9,#10B981)', borderRadius: '2px' }} />
                </div>
                <div style={{ color: '#3A4A70', fontSize: '10px', marginTop: '3px' }}>{progress}% del objetivo</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
