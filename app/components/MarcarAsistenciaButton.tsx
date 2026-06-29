'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Enrollment = { id: string, name: string }
type Attendance = { id: string, enrollment_id: string, present: boolean }

export default function MarcarAsistenciaButton({ sessionId, enrollments, attendance }: { sessionId: string, enrollments: Enrollment[], attendance: Attendance[] }) {
  const [open, setOpen] = useState(false)
  const [present, setPresent] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    enrollments.forEach(e => {
      const a = attendance.find(a => a.enrollment_id === e.id)
      map[e.id] = a ? a.present : true
    })
    return map
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSave() {
    setSaving(true)
    await supabase.from('activity_attendance').delete().eq('session_id', sessionId)
    await Promise.all(enrollments.map(e =>
      supabase.from('activity_attendance').insert({ session_id: sessionId, enrollment_id: e.id, present: present[e.id] ?? true })
    ))
    setSaved(true); setSaving(false); setOpen(false)
    window.location.reload()
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ padding: '5px 12px', borderRadius: '7px', backgroundColor: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.15)', color: '#4BA3D9', fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 }}>
      {saved ? '✓ Guardado' : 'Asistencia'}
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setOpen(false)}>
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '16px', padding: '20px', width: '380px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Marcar asistencia</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {enrollments.map(e => (
            <button key={e.id} onClick={() => setPresent(p => ({...p, [e.id]: !p[e.id]}))} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '9px', border: `1px solid ${present[e.id] ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`, backgroundColor: present[e.id] ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.04)', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: present[e.id] ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                {present[e.id] ? '✓' : '✗'}
              </div>
              <span style={{ color: present[e.id] ? '#CDD0E0' : '#4A5580', fontSize: '13px', flex: 1 }}>{e.name}</span>
              <span style={{ color: present[e.id] ? '#10B981' : '#EF4444', fontSize: '11px', fontWeight: '600' }}>{present[e.id] ? 'Presente' : 'Ausente'}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            {saving ? 'Guardando...' : 'Guardar asistencia'}
          </button>
        </div>
      </div>
    </div>
  )
}
