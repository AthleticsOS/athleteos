'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams } from 'next/navigation'

export default function NuevaSesionGrupo() {
  const params = useParams()
  const groupId = params.id as string
  const [group, setGroup] = useState<any>(null)
  const [athletes, setAthletes] = useState<{id:string,first_name:string,last_name:string}[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [exercise, setExercise] = useState('')
  const [effort, setEffort] = useState('7')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.from('groups').select('*').eq('id', groupId).single().then(({ data }) => setGroup(data))
    supabase.from('athletes').select('id, first_name, last_name').eq('group_id', groupId).then(({ data }) => { if (data) setAthletes(data) })
  }, [groupId])

  async function handleSubmit() {
    if (!exercise || athletes.length === 0) return
    setLoading(true)
    await Promise.all(athletes.map(a =>
      supabase.from('athlete_sessions').insert({
        athlete_id: a.id,
        date,
        exercise,
        effort: parseInt(effort),
      })
    ))
    setDone(true)
    setLoading(false)
  }

  if (done) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
        <h1 style={{ color: '#F0F4FF', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Sesión aplicada</h1>
        <p style={{ color: '#3A4A70', fontSize: '13px', marginBottom: '24px' }}>Se registró para {athletes.length} atletas de {group?.name}</p>
        <a href="/groups" style={{ color: '#4BA3D9', fontSize: '13px', textDecoration: 'none' }}>← Volver a grupos</a>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <a href="/groups" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Sesión de grupo</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>{group?.name ? `Se aplicará a los ${athletes.length} atletas de ${group.name}` : 'Cargando...'}</p>
        </div>

        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {athletes.length > 0 && (
            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Se aplicará a</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {athletes.map(a => (
                  <span key={a.id} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: 'rgba(75,163,217,0.08)', color: '#4BA3D9', border: '1px solid rgba(75,163,217,0.15)' }}>{a.first_name} {a.last_name}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
          </div>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Ejercicio / Descripción *</label>
            <input value={exercise} onChange={e => setExercise(e.target.value)} placeholder="Ej: 6×200m, Técnica de carrera..." style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Esfuerzo previsto: <span style={{ color: '#4BA3D9' }}>{effort}/10</span></label>
            <input type="range" min="1" max="10" value={effort} onChange={e => setEffort(e.target.value)} style={{ width: '100%', accentColor: '#4BA3D9' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading || !exercise || athletes.length === 0} style={{ padding: '13px', borderRadius: '10px', background: loading || !exercise ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading || !exercise ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Aplicando...' : `Aplicar a ${athletes.length} atletas`}
          </button>
        </div>
      </div>
    </main>
  )
}
