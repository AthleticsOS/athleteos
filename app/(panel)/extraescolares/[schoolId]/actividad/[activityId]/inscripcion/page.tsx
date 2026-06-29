'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams } from 'next/navigation'

export default function NuevaInscripcion() {
  const { schoolId, activityId } = useParams()
  const [form, setForm] = useState({ student_name: '', student_birth_date: '', parent_name: '', parent_phone: '', parent_email: '', notes: '' })
  const [generatePayment, setGeneratePayment] = useState(true)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSubmit() {
    if (!form.student_name) return
    setLoading(true)
    const { data: enrollment } = await supabase.from('enrollments').insert({ activity_id: activityId, ...form, student_birth_date: form.student_birth_date || null, status: 'active' }).select().single()
    if (enrollment && generatePayment) {
      const { data: activity } = await supabase.from('activities').select('price_cents, name').eq('id', activityId).single()
      if (activity && activity.price_cents > 0) {
        const now = new Date()
        await supabase.from('activity_payments').insert({
          enrollment_id: enrollment.id,
          concept: `Cuota ${activity.name} - ${now.toLocaleDateString('es-ES',{month:'long',year:'numeric'})}`,
          amount_cents: activity.price_cents,
          status: 'pending',
          due_date: new Date(now.getFullYear(), now.getMonth()+1, 5).toISOString().split('T')[0],
        })
      }
    }
    window.location.href = `/extraescolares/${schoolId}/actividad/${activityId}`
  }

  const input = { width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties
  const label = { color: '#3A4A70', fontSize: '11px', fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href={`/extraescolares/${schoolId}/actividad/${activityId}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Nueva inscripción</h1>
        </div>
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>Datos del alumno</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1/-1' }}><label style={label}>Nombre completo *</label><input value={form.student_name} onChange={e => setForm({...form,student_name:e.target.value})} placeholder="Nombre y apellidos" style={input} /></div>
            <div><label style={label}>Fecha de nacimiento</label><input type="date" value={form.student_birth_date} onChange={e => setForm({...form,student_birth_date:e.target.value})} style={{...input,colorScheme:'dark'}} /></div>
          </div>

          <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>Datos del padre/madre/tutor</div>
          <div><label style={label}>Nombre del tutor</label><input value={form.parent_name} onChange={e => setForm({...form,parent_name:e.target.value})} placeholder="Nombre completo" style={input} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={label}>Teléfono</label><input value={form.parent_phone} onChange={e => setForm({...form,parent_phone:e.target.value})} placeholder="600 000 000" style={input} /></div>
            <div><label style={label}>Email</label><input value={form.parent_email} onChange={e => setForm({...form,parent_email:e.target.value})} placeholder="email@ejemplo.com" style={input} /></div>
          </div>
          <div><label style={label}>Notas</label><textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} placeholder="Alergias, necesidades especiales..." rows={2} style={{...input,resize:'vertical'}} /></div>

          <button onClick={() => setGeneratePayment(!generatePayment)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '9px', border: `1px solid ${generatePayment?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.06)'}`, backgroundColor: generatePayment?'rgba(16,185,129,0.06)':'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${generatePayment?'#10B981':'rgba(255,255,255,0.15)'}`, backgroundColor: generatePayment?'#10B981':'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', flexShrink: 0 }}>
              {generatePayment?'✓':''}
            </div>
            <span style={{ color: generatePayment?'#10B981':'#4A5580', fontSize: '13px' }}>Generar cobro automático del primer mes</span>
          </button>

          <button onClick={handleSubmit} disabled={loading || !form.student_name} style={{ padding: '12px', borderRadius: '10px', background: loading || !form.student_name ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading || !form.student_name ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Guardando...' : 'Inscribir alumno'}
          </button>
        </div>
      </div>
    </main>
  )
}
