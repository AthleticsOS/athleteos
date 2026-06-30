'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Exercise = { name: string, series: string, reps: string, rest: string, notes: string }

export default function NuevaPlantilla() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('velocidad')
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', series: '', reps: '', rest: '', notes: '' }])
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  function updateEx(i: number, field: keyof Exercise, val: string) {
    setExercises(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e))
  }

  async function handleSave() {
    if (!name || exercises.every(e => !e.name)) return
    setLoading(true)
    const validEx = exercises.filter(e => e.name)
    await supabase.from('training_templates').insert({ name, description: description || null, category, exercises: validEx })
    window.location.href = '/training/plantillas'
  }

  const inputStyle = { width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#E8EAF0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href="/training/plantillas" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Plantillas</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Nueva plantilla</h1>
        </div>

        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Nombre *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="ej: Sesión de velocidad sprint" style={{ ...inputStyle, padding: '10px 14px', fontSize: '14px', borderRadius: '9px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Descripción</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Para qué sirve esta sesión..." style={{ ...inputStyle, padding: '10px 14px', fontSize: '14px', borderRadius: '9px' }} />
              </div>
              <div>
                <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Tipo</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, padding: '10px 14px', fontSize: '14px', borderRadius: '9px', colorScheme: 'dark' }}>
                  {['velocidad','fuerza','resistencia','técnica','polivalente'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
          <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Ejercicios</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 0.8fr 0.8fr 0.8fr 1.5fr auto', gap: '6px', marginBottom: '6px' }}>
            {['Ejercicio','Series','Reps','Descanso','Notas',''].map(h => (
              <div key={h} style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>
          {exercises.map((ex, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5fr 0.8fr 0.8fr 0.8fr 1.5fr auto', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
              <input value={ex.name} onChange={e => updateEx(i,'name',e.target.value)} placeholder="Salidas 30m..." style={inputStyle} />
              <input value={ex.series} onChange={e => updateEx(i,'series',e.target.value)} placeholder="4" style={inputStyle} />
              <input value={ex.reps} onChange={e => updateEx(i,'reps',e.target.value)} placeholder="6" style={inputStyle} />
              <input value={ex.rest} onChange={e => updateEx(i,'rest',e.target.value)} placeholder="3'" style={inputStyle} />
              <input value={ex.notes} onChange={e => updateEx(i,'notes',e.target.value)} placeholder="Al 95%..." style={inputStyle} />
              <button onClick={() => setExercises(prev => prev.filter((_,idx) => idx !== i))} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>×</button>
            </div>
          ))}
          <button onClick={() => setExercises(prev => [...prev, { name:'', series:'', reps:'', rest:'', notes:'' }])} style={{ width: '100%', padding: '9px', borderRadius: '8px', backgroundColor: 'rgba(75,163,217,0.04)', border: '1px dashed rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>
            + Añadir ejercicio
          </button>
        </div>

        <button onClick={handleSave} disabled={loading || !name} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: !name ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: !name ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Guardando...' : 'Guardar plantilla'}
        </button>
      </div>
    </main>
  )
}
