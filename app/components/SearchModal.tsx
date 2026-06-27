'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Result = {
  id: string
  title: string
  subtitle: string
  type: string
  href: string
}

export default function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)

    const [athletes, competitions, sessions] = await Promise.all([
      supabase.from('athletes').select('id, first_name, last_name, sport, category').ilike('first_name', `%${q}%`).limit(4),
      supabase.from('competitions').select('id, name, location, date').ilike('name', `%${q}%`).limit(3),
      supabase.from('training_sessions').select('id, title, date, type').ilike('title', `%${q}%`).limit(3),
    ])

    const all: Result[] = [
      ...(athletes.data || []).map(a => ({
        id: a.id,
        title: `${a.first_name} ${a.last_name}`,
        subtitle: `${a.sport} · ${a.category}`,
        type: 'Deportista',
        href: `/athletes/${a.id}`,
      })),
      ...(competitions.data || []).map(c => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.location} · ${c.date ? new Date(c.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}`,
        type: 'Competición',
        href: `/competitions/${c.id}`,
      })),
      ...(sessions.data || []).map(s => ({
        id: s.id,
        title: s.title,
        subtitle: `${s.type} · ${s.date ? new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : ''}`,
        type: 'Entrenamiento',
        href: `/training`,
      })),
    ]

    setResults(all)
    setSelected(0)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200)
    return () => clearTimeout(timer)
  }, [query, search])

  function handleKeyNav(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) {
      window.location.href = results[selected].href
      setOpen(false)
    }
  }

  const typeColors: Record<string, string> = {
    'Deportista': '#60A5FA',
    'Competición': '#FBBF24',
    'Entrenamiento': '#A78BFA',
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '15vh',
    }} onClick={() => setOpen(false)}>
      <div style={{
        width: '100%', maxWidth: '560px', margin: '0 16px',
        backgroundColor: '#111',
        border: '1px solid #2A2A2A',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #1A1A1A'}}>
          <span style={{fontSize: '18px', color: '#444'}}>🔍</span>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyNav}
            placeholder="Buscar deportistas, competiciones, entrenamientos..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'white', fontSize: '15px',
            }}
          />
          {loading && <span style={{color: '#444', fontSize: '12px'}}>...</span>}
          <kbd style={{
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: '6px', padding: '2px 8px',
            color: '#555', fontSize: '11px',
          }}>ESC</kbd>
        </div>

        {results.length > 0 ? (
          <div style={{maxHeight: '360px', overflowY: 'auto'}}>
            {results.map((result, index) => (
              <a key={result.id} href={result.href} onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 20px',
                  backgroundColor: index === selected ? '#1A1A1A' : 'transparent',
                  borderBottom: '1px solid #161616',
                  textDecoration: 'none',
                  transition: 'background 100ms',
                }}
                onMouseEnter={() => setSelected(index)}>
                <div style={{flex: 1}}>
                  <div style={{color: 'white', fontSize: '14px', fontWeight: '500'}}>{result.title}</div>
                  <div style={{color: '#555', fontSize: '12px', marginTop: '2px'}}>{result.subtitle}</div>
                </div>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500',
                  backgroundColor: `${typeColors[result.type]}15`,
                  color: typeColors[result.type],
                }}>
                  {result.type}
                </span>
              </a>
            ))}
          </div>
        ) : query ? (
          <div style={{padding: '32px 20px', textAlign: 'center', color: '#444', fontSize: '14px'}}>
            Sin resultados para "{query}"
          </div>
        ) : (
          <div style={{padding: '20px'}}>
            <div style={{color: '#333', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px'}}>Accesos rápidos</div>
            {[
              { label: 'Ver todos los deportistas', href: '/athletes', icon: '👥' },
              { label: 'Competiciones', href: '/competitions', icon: '🏆' },
              { label: 'Calendario', href: '/calendar', icon: '📅' },
              { label: 'Asistente IA', href: '/ai', icon: '🧠' },
            ].map(item => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '8px',
                  textDecoration: 'none', color: '#666', fontSize: '13px',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#666' }}>
                <span>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        )}

        <div style={{padding: '10px 20px', borderTop: '1px solid #1A1A1A', display: 'flex', gap: '16px'}}>
          <span style={{color: '#333', fontSize: '11px'}}>↑↓ navegar</span>
          <span style={{color: '#333', fontSize: '11px'}}>↵ abrir</span>
          <span style={{color: '#333', fontSize: '11px'}}>ESC cerrar</span>
          <span style={{color: '#333', fontSize: '11px', marginLeft: 'auto'}}>⌘K para abrir</span>
        </div>
      </div>
    </div>
  )
}