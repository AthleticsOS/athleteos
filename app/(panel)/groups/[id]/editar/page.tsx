'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams } from 'next/navigation'

export default function EditarGrupo() {
  const params = useParams()
  const groupId = params.id as string
  const [group, setGroup] = useState<any>(null)
  const [athletes, setAthletes] = useState<{id:string,first_name:string,last_name:string,category:string,group_id:string|null}[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.from('groups').select('*').eq('id', groupId).single().then(({ data }) => setGroup(data))
    supabase.from('athletes').select('id, first_name, last_name, category, group_id').order('first_name').then(({ data }) => { if (data) setAthletes(data); setFetched(true) })
  }, [groupId])

  async function toggleAthlete(athleteId: string, isMember: boolean) {
    setLoading(true)
    await supabase.from('athletes').update({ group_id: isMember ? null : groupId }).eq('id', athleteId)
    setAthletes(prev => prev.map(a => a.id === athleteId ? { ...a, group_id: isMember ? null : groupId } : a))
    setLoading(false)
  }

  if (!fetched) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <p style={{ color: '#3A4A70' }}>Cargando...</p>
    </main>
  )

  const color = group?.color || '#4BA3D9'
  const miembros = athletes.filter(a => a.group_id === groupId)
  const otros = athletes.filter(a => a.group_id !== groupId)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <a href="/groups" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver a grupos</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '8px 0 4px' }}>{group?.name || 'Grupo'}</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Gestiona los atletas de este grupo</p>
        </div>

        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', overflow: 'hidden' }}>

          {/* Miembros actuales */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', backgroundColor: `${color}08` }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', margin: 0 }}>En el grupo · {miembros.length}</p>
          </div>
          {miembros.length > 0 ? miembros.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                {a.first_name[0]}{a.last_name[0]}
              </div>
              <span style={{ flex: 1, color: '#CDD0E0', fontSize: '14px', fontWeight: '500' }}>{a.first_name} {a.last_name}</span>
              <span style={{ color: '#2A3550', fontSize: '11px' }}>{a.category}</span>
              <button onClick={() => toggleAthlete(a.id, true)} disabled={loading} style={{ padding: '5px 12px', borderRadius: '7px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                Quitar
              </button>
            </div>
          )) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin atletas en este grupo</div>
          )}

          {/* Otros atletas */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', borderTop: '1px solid rgba(75,163,217,0.06)' }}>
            <p style={{ color: '#3A4A70', fontSize: '12px', fontWeight: '700', margin: 0 }}>Añadir atletas</p>
          </div>
          {otros.length > 0 ? otros.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#4A5580', flexShrink: 0 }}>
                {a.first_name[0]}{a.last_name[0]}
              </div>
              <span style={{ flex: 1, color: '#4A5580', fontSize: '14px' }}>{a.first_name} {a.last_name}</span>
              <span style={{ color: '#2A3550', fontSize: '11px' }}>{a.category}</span>
              <button onClick={() => toggleAthlete(a.id, false)} disabled={loading} style={{ padding: '5px 12px', borderRadius: '7px', backgroundColor: `${color}15`, border: `1px solid ${color}30`, color: color, fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                + Añadir
              </button>
            </div>
          )) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Todos los atletas ya están en algún grupo de aquí</div>
          )}
        </div>
      </div>
    </main>
  )
}
