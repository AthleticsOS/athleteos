'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Props = {
  enrollmentId: string
  studentName: string
  activityName: string
}

export default function MensajePadresButton({ enrollmentId, studentName, activityName }: Props) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function send() {
    if (!content.trim()) return
    setLoading(true)
    await supabase.from('parent_messages').insert({
      enrollment_id: enrollmentId,
      content: content.trim(),
      from_staff: true,
    })
    setLoading(false)
    setSent(true)
    setContent('')
    setTimeout(() => { setSent(false); setOpen(false) }, 2000)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
        ✉️ Mensaje a familia
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#0D1225', border: '1px solid rgba(75,163,217,0.2)', borderRadius: '20px', padding: '28px', width: '480px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: '#F0F4FF', fontSize: '17px', fontWeight: '800', margin: '0 0 4px' }}>Mensaje para la familia</h3>
                <p style={{ color: '#3A4A70', fontSize: '12px', margin: 0 }}>{studentName} · {activityName}</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#3A4A70', fontSize: '20px', cursor: 'pointer', padding: '0', lineHeight: 1 }}>×</button>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Escribe el mensaje para los padres/tutores..."
              rows={4}
              style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '10px', color: '#CDD0E0', fontSize: '14px', padding: '12px', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
              <button onClick={() => setOpen(false)} style={{ padding: '8px 18px', borderRadius: '9px', backgroundColor: 'transparent', border: '1px solid rgba(75,163,217,0.1)', color: '#3A4A70', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={send} disabled={loading || !content.trim()} style={{ padding: '8px 20px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: loading || !content.trim() ? 0.5 : 1 }}>
                {sent ? '✅ Enviado' : loading ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
