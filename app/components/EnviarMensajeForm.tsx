'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function EnviarMensajeForm({ athleteId }: { athleteId: string }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSend() {
    if (!content.trim()) return
    setLoading(true)
    await supabase.from('direct_messages').insert({ athlete_id: athleteId, content: content.trim(), from_director: true, read: false })
    setContent('')
    setLoading(false)
    window.location.reload()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Escribe un mensaje... (⌘+Enter para enviar)"
        rows={2}
        style={{ flex: 1, backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '12px', padding: '12px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', resize: 'none' }}
      />
      <button onClick={handleSend} disabled={loading || !content.trim()} style={{
        padding: '12px 18px', borderRadius: '12px', background: content.trim() ? 'linear-gradient(135deg,#1E2A5E,#4BA3D9)' : 'rgba(75,163,217,0.1)',
        border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: content.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, height: '52px',
      }}>
        {loading ? '...' : '↑'}
      </button>
    </div>
  )
}
