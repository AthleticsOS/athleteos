'use client'
import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Result = { type: string; label: string; sub: string; href: string; icon: string }

export default function BusquedaGlobal() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const term = `%${q}%`
      const [{ data: athletes }, { data: competitions }, { data: activities }] = await Promise.all([
        supabase.from('athletes').select('id, first_name, last_name, sport, category').ilike('first_name', term).limit(5),
        supabase.from('competitions').select('id, name, location, date').ilike('name', term).limit(4),
        supabase.from('activities').select('id, name, schools(name)').ilike('name', term).limit(4),
      ])
      const r: Result[] = [
        ...(athletes || []).map(a => ({ type: 'Atleta', label: `${a.first_name} ${a.last_name}`, sub: [a.sport, a.category].filter(Boolean).join(' · '), href: `/athletes/${a.id}`, icon: '👤' })),
        ...(competitions || []).map(c => ({ type: 'Competición', label: c.name, sub: `${c.location || ''} · ${c.date ? new Date(c.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'2-digit'}) : ''}`, href: `/competitions/${c.id}`, icon: '🏆' })),
        ...(activities || []).map(a => ({ type: 'Actividad', label: a.name, sub: (a as any).schools?.name || '', href: '#', icon: '🏫' })),
      ]
      setResults(r)
      setLoading(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [q])

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(75,163,217,0.1)', color: '#2A3550', fontSize: '12px', cursor: 'pointer', width: '200px' }}>
      <span>🔍</span>
      <span style={{ flex: 1, textAlign: 'left' }}>Buscar…</span>
      <span style={{ fontSize: '10px', color: '#1A2040', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '4px' }}>⌘K</span>
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px' }} onClick={() => setOpen(false)}>
      <div style={{ backgroundColor: '#0D1225', border: '1px solid rgba(75,163,217,0.2)', borderRadius: '16px', width: '560px', maxWidth: '90vw', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid rgba(75,163,217,0.08)' }}>
          <span style={{ color: '#3A4A70' }}>🔍</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar atletas, competiciones, actividades…"
            style={{ flex: 1, background: 'none', border: 'none', color: '#CDD0E0', fontSize: '14px', outline: 'none' }} />
          {loading && <span style={{ color: '#2A3550', fontSize: '12px' }}>…</span>}
          <kbd onClick={() => setOpen(false)} style={{ color: '#2A3550', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: '4px', cursor: 'pointer' }}>Esc</kbd>
        </div>
        {results.length > 0 ? (
          <div>
            {results.map((r, i) => (
              <a key={i} href={r.href} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', textDecoration: 'none', transition: 'background 100ms' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(75,163,217,0.05)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ fontSize: '18px' }}>{r.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                  <div style={{ color: '#2A3550', fontSize: '11px' }}>{r.sub}</div>
                </div>
                <span style={{ color: '#1A2040', fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: '4px' }}>{r.type}</span>
              </a>
            ))}
          </div>
        ) : q.trim() ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin resultados para "{q}"</div>
        ) : (
          <div style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Atletas', 'Competiciones', 'Finanzas', 'Extraescolares'].map(s => (
              <span key={s} style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(75,163,217,0.06)', border: '1px solid rgba(75,163,217,0.1)', color: '#3A4A70', fontSize: '11px' }}>{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
