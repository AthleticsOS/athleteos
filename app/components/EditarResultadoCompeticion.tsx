'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Athlete = { id: string, first_name: string, last_name: string }

export default function EditarResultadoCompeticion({ competitionId, athletes, existingResults }: { competitionId: string, athletes: Athlete[], existingResults: any[] }) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<{ athlete_id: string, discipline: string, mark: string, position: string, wind: string }[]>(
    existingResults.map(r => ({ athlete_id: r.athlete_id, discipline: r.discipline || '', mark: r.mark || '', position: String(r.position || ''), wind: r.wind || '' }))
  )
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  function addRow() {
    setResults(prev => [...prev, { athlete_id: '', discipline: '', mark: '', position: '', wind: '' }])
  }

  function update(i: number, field: string, val: string) {
    setResults(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  function remove(i: number) {
    setResults(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    setLoading(true)
    await supabase.from('competition_results').delete().eq('competition_id', competitionId)
    const toInsert = results.filter(r => r.athlete_id && r.mark).map(r => ({
      competition_id: competitionId,
      athlete_id: r.athlete_id,
      discipline: r.discipline || null,
      mark: r.mark,
      position: r.position ? parseInt(r.position) : null,
      wind: r.wind || null,
    }))
    if (toInsert.length > 0) await supabase.from('competition_results').insert(toInsert)
    setLoading(false); setOpen(false)
    window.location.reload()
  }

  const cellStyle = { backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '7px', padding: '8px 10px', color: '#E8EAF0', fontSize: '13px', outline: 'none', width: '100%' } as React.CSSProperties

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ padding: '8px 14px', borderRadius: '9px', backgroundColor: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
      Editar resultados
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setOpen(false)}>
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '760px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ color: '#CDD0E0', fontSize: '15px', fontWeight: '700', marginBottom: '18px' }}>Editar resultados</div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '6px', marginBottom: '8px' }}>
          {['Atleta', 'Prueba', 'Marca', 'Pos.', 'Viento', ''].map(h => (
            <div key={h} style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
          ))}
        </div>

        {results.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
            <select value={r.athlete_id} onChange={e => update(i, 'athlete_id', e.target.value)} style={{...cellStyle, colorScheme: 'dark'}}>
              <option value="">Seleccionar...</option>
              {athletes.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
            </select>
            <input value={r.discipline} onChange={e => update(i, 'discipline', e.target.value)} placeholder="100m..." style={cellStyle} />
            <input value={r.mark} onChange={e => update(i, 'mark', e.target.value)} placeholder="10.50" style={cellStyle} />
            <input value={r.position} onChange={e => update(i, 'position', e.target.value)} placeholder="1" type="number" style={cellStyle} />
            <input value={r.wind} onChange={e => update(i, 'wind', e.target.value)} placeholder="+1.2" style={cellStyle} />
            <button onClick={() => remove(i)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>×</button>
          </div>
        ))}

        <button onClick={addRow} style={{ width: '100%', padding: '9px', borderRadius: '8px', backgroundColor: 'rgba(75,163,217,0.04)', border: '1px dashed rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '12px', cursor: 'pointer', marginTop: '8px', marginBottom: '18px' }}>
          + Añadir fila
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            {loading ? 'Guardando...' : 'Guardar resultados'}
          </button>
        </div>
      </div>
    </div>
  )
}
