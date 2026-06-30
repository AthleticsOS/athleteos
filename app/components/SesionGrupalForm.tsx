'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Athlete = { id: string; first_name: string; last_name: string; category?: string; sport?: string }

export default function SesionGrupalForm({ athletes }: { athletes: Athlete[] }) {
  const today = new Date().toISOString().split('T')[0]
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({ date: today, exercise: '', duration: '', effort: '7', notes: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [filter, setFilter] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const toggle = (id: string) => setSelected(prev => {
    const s = new Set(prev)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  })

  const selectAll = () => setSelected(new Set(filtered.map(a => a.id)))
  const clearAll = () => setSelected(new Set())

  const filtered = athletes.filter(a =>
    `${a.first_name} ${a.last_name} ${a.category || ''} ${a.sport || ''}`.toLowerCase().includes(filter.toLowerCase())
  )

  async function save() {
    if (selected.size === 0 || !form.exercise) return
    setSaving(true)
    const inserts = Array.from(selected).map(athleteId => ({
      athlete_id: athleteId,
      date: form.date,
      exercise: form.exercise,
      duration: form.duration ? parseInt(form.duration) : null,
      effort: parseInt(form.effort),
      notes: form.notes || null,
    }))
    await supabase.from('athlete_sessions').insert(inserts)
    setSaving(false)
    setDone(true)
  }

  if (done) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
      <p style={{ color: '#CDD0E0', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Sesión registrada</p>
      <p style={{ color: '#3A4A70', fontSize: '14px', marginBottom: '24px' }}>{selected.size} atleta{selected.size > 1 ? 's' : ''} · {form.exercise}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => { setDone(false); setSelected(new Set()); setForm({ date: today, exercise: '', duration: '', effort: '7', notes: '' }) }}
          style={{ padding: '10px 20px', borderRadius: '9px', backgroundColor: 'rgba(75,163,217,0.1)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          Nueva sesión
        </button>
        <a href="/training" style={{ padding: '10px 20px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '13px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' }}>
          Volver
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Datos sesión */}
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px' }}>
        <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', margin: '0 0 14px' }}>📋 Datos de la sesión</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Fecha', key: 'date', type: 'date', placeholder: '' },
            { label: 'Ejercicio / título', key: 'exercise', type: 'text', placeholder: 'Ej: Series 100m, Técnica de carrera…' },
            { label: 'Duración (min)', key: 'duration', type: 'number', placeholder: 'Ej: 90' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '8px', color: '#CDD0E0', fontSize: '13px', padding: '9px 11px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div>
            <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>Esfuerzo percibido (1-10): {form.effort}</label>
            <input type="range" min="1" max="10" value={form.effort} onChange={e => setForm(p => ({ ...p, effort: e.target.value }))}
              style={{ width: '100%', accentColor: '#4BA3D9' }} />
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>Notas</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Condiciones, observaciones…" rows={2}
            style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '8px', color: '#CDD0E0', fontSize: '13px', padding: '9px 11px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Selección atletas */}
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', margin: 0 }}>👥 Seleccionar atletas ({selected.size} seleccionados)</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={selectAll} style={{ padding: '5px 10px', borderRadius: '7px', backgroundColor: 'rgba(75,163,217,0.1)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Todos</button>
            <button onClick={clearAll} style={{ padding: '5px 10px', borderRadius: '7px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#3A4A70', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Ninguno</button>
          </div>
        </div>
        <div style={{ padding: '10px 18px', borderBottom: '1px solid rgba(75,163,217,0.04)' }}>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar atleta…"
            style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '8px', color: '#CDD0E0', fontSize: '13px', padding: '7px 11px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filtered.map((a, i) => (
            <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', cursor: 'pointer', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', backgroundColor: selected.has(a.id) ? 'rgba(75,163,217,0.04)' : 'transparent' }}>
              <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} style={{ accentColor: '#4BA3D9', width: '15px', height: '15px' }} />
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                {a.first_name[0]}{a.last_name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{a.first_name} {a.last_name}</div>
                {(a.category || a.sport) && <div style={{ color: '#2A3550', fontSize: '11px' }}>{[a.sport, a.category].filter(Boolean).join(' · ')}</div>}
              </div>
            </label>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving || selected.size === 0 || !form.exercise}
        style={{ padding: '13px', borderRadius: '11px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: (saving || selected.size === 0 || !form.exercise) ? 0.5 : 1 }}>
        {saving ? 'Guardando…' : `Registrar sesión para ${selected.size} atleta${selected.size !== 1 ? 's' : ''}`}
      </button>
    </div>
  )
}
