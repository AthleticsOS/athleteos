'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Athlete = { id: string; first_name: string; last_name: string; category?: string }
type Session = { id: string; title: string; date: string; type?: string }

export default function AsistenciaEntrenamientoForm({ athletes, sessions }: { athletes: Athlete[]; sessions: Session[] }) {
  const today = new Date().toISOString().split('T')[0]
  const [sessionId, setSessionId] = useState(sessions[0]?.id || '')
  const [fecha, setFecha] = useState(today)
  const [titulo, setTitulo] = useState('')
  const [mode, setMode] = useState<'session' | 'nueva'>('nueva')
  const [present, setPresent] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const toggle = (id: string) => setPresent(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s })
  const selectAll = () => setPresent(new Set(athletes.map(a => a.id)))
  const clearAll = () => setPresent(new Set())

  async function save() {
    if (athletes.length === 0) return
    setSaving(true)

    let sid = sessionId
    if (mode === 'nueva') {
      const { data } = await supabase.from('training_sessions').insert({ title: titulo || 'Entrenamiento', date: fecha, type: 'club' }).select().single()
      sid = data?.id || ''
    }

    const inserts = athletes.map(a => ({ session_id: sid, athlete_id: a.id, present: present.has(a.id) }))
    await supabase.from('training_attendance').upsert(inserts, { onConflict: 'session_id,athlete_id' })
    setSaving(false)
    setDone(true)
  }

  if (done) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ fontSize: '44px', marginBottom: '12px' }}>✅</div>
      <p style={{ color: '#CDD0E0', fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>Asistencia guardada</p>
      <p style={{ color: '#3A4A70', fontSize: '13px', marginBottom: '24px' }}>{present.size} presentes · {athletes.length - present.size} ausentes</p>
      <button onClick={() => { setDone(false); setPresent(new Set()) }} style={{ padding: '10px 20px', borderRadius: '9px', backgroundColor: 'rgba(75,163,217,0.1)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
        Nueva asistencia
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Selección de sesión */}
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '18px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {[{ id: 'nueva', label: '+ Sesión nueva' }, { id: 'session', label: 'Sesión existente' }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id as any)} style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none',
              backgroundColor: mode === m.id ? 'rgba(75,163,217,0.1)' : 'rgba(255,255,255,0.04)',
              color: mode === m.id ? '#4BA3D9' : '#3A4A70',
              outline: mode === m.id ? '1px solid rgba(75,163,217,0.25)' : 'none',
            }}>{m.label}</button>
          ))}
        </div>

        {mode === 'nueva' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '8px', color: '#CDD0E0', fontSize: '13px', padding: '9px 11px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>Título</label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Entrenamiento de velocidad"
                style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '8px', color: '#CDD0E0', fontSize: '13px', padding: '9px 11px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        ) : (
          <select value={sessionId} onChange={e => setSessionId(e.target.value)}
            style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '8px', color: '#CDD0E0', fontSize: '13px', padding: '9px 11px', outline: 'none' }}>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.date} — {s.title}</option>)}
          </select>
        )}
      </div>

      {/* Lista atletas */}
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>
            ✅ Presentes: <span style={{ color: '#10B981' }}>{present.size}</span> · Ausentes: <span style={{ color: '#EF4444' }}>{athletes.length - present.size}</span>
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={selectAll} style={{ padding: '5px 10px', borderRadius: '7px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Todos presentes</button>
            <button onClick={clearAll} style={{ padding: '5px 10px', borderRadius: '7px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Limpiar</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
          {athletes.map((a, i) => {
            const isPresent = present.has(a.id)
            return (
              <label key={a.id} onClick={() => toggle(a.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', cursor: 'pointer', borderBottom: Math.floor(i / 2) < Math.floor(athletes.length / 2) ? '1px solid rgba(255,255,255,0.03)' : 'none', borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                backgroundColor: isPresent ? 'rgba(16,185,129,0.04)' : 'transparent', transition: 'background 100ms',
              }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', border: `2px solid ${isPresent ? '#10B981' : 'rgba(255,255,255,0.08)'}`, backgroundColor: isPresent ? 'rgba(16,185,129,0.15)' : 'transparent', transition: 'all 100ms' }}>
                  {isPresent ? '✓' : ''}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: isPresent ? '#CDD0E0' : '#4A5580', fontSize: '13px', fontWeight: isPresent ? '600' : '400' }}>{a.first_name} {a.last_name}</div>
                  {a.category && <div style={{ color: '#2A3550', fontSize: '10px' }}>{a.category}</div>}
                </div>
              </label>
            )
          })}
        </div>
      </div>

      <button onClick={save} disabled={saving}
        style={{ padding: '13px', borderRadius: '11px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Guardando…' : `Guardar asistencia (${present.size}/${athletes.length})`}
      </button>
    </div>
  )
}
