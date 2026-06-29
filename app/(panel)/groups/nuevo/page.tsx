'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const COLORS = ['#4BA3D9','#10B981','#F59E0B','#EF4444','#A78BFA','#F472B6','#34D399','#FB923C']

export default function NuevoGrupo() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [season, setSeason] = useState('2024-2025')
  const [color, setColor] = useState('#4BA3D9')
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([])
  const [athletes, setAthletes] = useState<{id:string,first_name:string,last_name:string,category:string}[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.from('athletes').select('id, first_name, last_name, category').order('first_name').then(({ data }) => {
      if (data) setAthletes(data)
    })
  }, [])

  function toggleAthlete(id: string) {
    setSelectedAthletes(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  async function handleSubmit() {
    if (!name) return
    setLoading(true)
    const { data: group } = await supabase.from('groups').insert({ name, category: category || null, season, color }).select().single()
    if (group && selectedAthletes.length > 0) {
      await Promise.all(selectedAthletes.map(id =>
        supabase.from('athletes').update({ group_id: group.id }).eq('id', id)
      ))
    }
    window.location.href = '/groups'
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <a href="/groups" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Nuevo grupo</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Organiza atletas por equipo o categoría de entrenamiento</p>
        </div>

        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Nombre del grupo *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Grupo Velocidad, Sub-23..." style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Categoría</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej: Absoluto, Sub-23..." style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Temporada</label>
              <input value={season} onChange={e => setSeason(e.target.value)} placeholder="2024-2025" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>Color del grupo</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: c, border: color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
              ))}
            </div>
          </div>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
              Atletas <span style={{ color: '#4BA3D9' }}>({selectedAthletes.length} seleccionados)</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {athletes.map(a => {
                const selected = selectedAthletes.includes(a.id)
                return (
                  <button key={a.id} onClick={() => toggleAthlete(a.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${selected ? `${color}50` : 'rgba(255,255,255,0.06)'}`, backgroundColor: selected ? `${color}10` : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${selected ? color : 'rgba(255,255,255,0.15)'}`, backgroundColor: selected ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', flexShrink: 0 }}>
                      {selected ? '✓' : ''}
                    </div>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                      {a.first_name[0]}{a.last_name[0]}
                    </div>
                    <span style={{ color: selected ? '#CDD0E0' : '#4A5580', fontSize: '14px', fontWeight: '500', flex: 1 }}>{a.first_name} {a.last_name}</span>
                    <span style={{ color: '#2A3550', fontSize: '11px' }}>{a.category}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !name} style={{ padding: '13px', borderRadius: '10px', background: loading || !name ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading || !name ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Guardando...' : 'Crear grupo'}
          </button>
        </div>
      </div>
    </main>
  )
}
