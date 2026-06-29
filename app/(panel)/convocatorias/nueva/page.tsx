'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function NuevaConvocatoria() {
  const [competitionName, setCompetitionName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([])
  const [athletes, setAthletes] = useState<{id:string,first_name:string,last_name:string}[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (!loaded) {
    supabase.from('athletes').select('id, first_name, last_name').order('first_name').then(({ data }) => {
      if (data) setAthletes(data)
      setLoaded(true)
    })
  }

  function toggleAthlete(id: string) {
    setSelectedAthletes(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  async function handleSubmit() {
    if (!competitionName || !date) return
    setLoading(true)
    const { error } = await supabase.from('convocatorias').insert({
      competition_name: competitionName,
      date,
      location: location || null,
      description: description || null,
      athlete_ids: selectedAthletes,
    })
    if (!error) window.location.href = '/convocatorias'
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <a href="/convocatorias" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Nueva convocatoria</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Selecciona los atletas convocados para la competición</p>
        </div>

        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Competición *</label>
            <input value={competitionName} onChange={e => setCompetitionName(e.target.value)} placeholder="Ej: Campeonato de Madrid" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Fecha *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Lugar</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Estadio Vallehermoso" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Notas / Instrucciones</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Hora de presentación, qué traer, pruebas..." rows={3} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
              Atletas convocados <span style={{ color: '#4BA3D9' }}>({selectedAthletes.length} seleccionados)</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {athletes.map(a => {
                const selected = selectedAthletes.includes(a.id)
                return (
                  <button key={a.id} onClick={() => toggleAthlete(a.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${selected ? 'rgba(75,163,217,0.3)' : 'rgba(255,255,255,0.06)'}`, backgroundColor: selected ? 'rgba(75,163,217,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${selected ? '#4BA3D9' : 'rgba(255,255,255,0.15)'}`, backgroundColor: selected ? '#4BA3D9' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', color: 'white' }}>
                      {selected ? '✓' : ''}
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                      {a.first_name[0]}{a.last_name[0]}
                    </div>
                    <span style={{ color: selected ? '#CDD0E0' : '#4A5580', fontSize: '14px', fontWeight: '500' }}>{a.first_name} {a.last_name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !competitionName || !date} style={{ padding: '13px', borderRadius: '10px', background: loading || !competitionName || !date ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading || !competitionName || !date ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Guardando...' : 'Crear convocatoria'}
          </button>

        </div>
      </div>
    </main>
  )
}
