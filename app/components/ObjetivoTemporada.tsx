'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function ObjetivoTemporada({ athleteId, records }: { athleteId: string, records: { discipline: string, mark: string }[] }) {
  const [goals, setGoals] = useState<{id:string,discipline:string,goal_mark:string}[]>([])
  const [open, setOpen] = useState(false)
  const [discipline, setDiscipline] = useState('')
  const [goalMark, setGoalMark] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.from('athlete_goals').select('*').eq('athlete_id', athleteId).then(({ data }) => { if (data) setGoals(data) })
  }, [athleteId])

  async function handleSave() {
    if (!discipline || !goalMark) return
    setSaving(true)
    const { data } = await supabase.from('athlete_goals').insert({ athlete_id: athleteId, discipline, goal_mark: goalMark }).select().single()
    if (data) setGoals([...goals, data])
    setDiscipline(''); setGoalMark(''); setOpen(false); setSaving(false)
  }

  function parseMark(m: string): number {
    return parseFloat(m.replace(/[^0-9.]/g, ''))
  }

  return (
    <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
        <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Objetivos de temporada</p>
        <button onClick={() => setOpen(!open)} style={{ color: '#4BA3D9', fontSize: '11px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>+ Añadir</button>
      </div>

      {open && (
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '8px' }}>
          <input value={discipline} onChange={e => setDiscipline(e.target.value)} placeholder="Prueba (ej: 200m)" style={{ flex: 1, backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#E8EAF0', fontSize: '13px', outline: 'none' }} />
          <input value={goalMark} onChange={e => setGoalMark(e.target.value)} placeholder="Objetivo (ej: 24.50)" style={{ flex: 1, backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#E8EAF0', fontSize: '13px', outline: 'none', fontFamily: 'monospace' }} />
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 14px', borderRadius: '8px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Guardar</button>
        </div>
      )}

      {goals.length > 0 ? goals.map((g, i) => {
        const current = records.find(r => r.discipline === g.discipline)
        const currentVal = current ? parseMark(current.mark) : null
        const goalVal = parseMark(g.goal_mark)
        const pct = currentVal && goalVal ? Math.min(100, Math.round((goalVal / currentVal) * 100)) : null
        const achieved = currentVal !== null && currentVal <= goalVal

        return (
          <div key={g.id} style={{ padding: '12px 18px', borderBottom: i < goals.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{g.discipline}</span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {current && <span style={{ color: '#4A5580', fontSize: '12px', fontFamily: 'monospace' }}>Actual: {current.mark}</span>}
                <span style={{ color: achieved ? '#10B981' : '#4BA3D9', fontSize: '14px', fontWeight: '800', fontFamily: 'monospace' }}>{g.goal_mark}</span>
              </div>
            </div>
            {pct !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: achieved ? '#10B981' : '#4BA3D9', borderRadius: '4px' }} />
                </div>
                <span style={{ color: achieved ? '#10B981' : '#3A4A70', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>{achieved ? '✓ Conseguido' : `${pct}%`}</span>
              </div>
            )}
          </div>
        )
      }) : (
        <div style={{ padding: '24px 18px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin objetivos definidos</div>
      )}
    </div>
  )
}
