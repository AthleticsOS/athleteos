'use client'

import { useState, useRef, useEffect } from 'react'

type Role = 'director' | 'coach' | 'athlete'
type Message = { role: 'user' | 'assistant'; content: string }

const ROLES: { id: Role; label: string; icon: string; color: string; bg: string }[] = [
  { id: 'director', label: 'Director', icon: '👔', color: '#4BA3D9', bg: 'rgba(75,163,217,0.08)' },
  { id: 'coach', label: 'Entrenador', icon: '🏋️', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  { id: 'athlete', label: 'Atleta', icon: '🏃', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
]

const SUGGESTIONS: Record<Role, string[]> = {
  director: [
    '¿Cuál es el estado financiero del club?',
    'Dame un resumen del rendimiento de la temporada',
    'Redacta un aviso para todos los atletas',
    '¿Qué atletas llevan más de 7 días sin entrenar?',
  ],
  coach: [
    'Diseña una sesión de velocidad para mañana',
    '¿Qué atleta tiene mayor progresión este mes?',
    'Crea un plan de microciclo de 5 días',
    'Ejercicios de técnica de carrera para principiantes',
  ],
  athlete: [
    '¿Cómo puedo mejorar mi tiempo en 100m?',
    'Dame una rutina de calentamiento pre-competición',
    '¿Qué debo comer antes de una carrera?',
    'Consejos para la recuperación después del entreno',
  ],
}

// Renderizador de markdown simple
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Encabezado ##
    if (line.startsWith('## ')) {
      elements.push(
        <div key={i} style={{ color: '#F0F4FF', fontSize: '13px', fontWeight: '800', marginTop: '14px', marginBottom: '6px', letterSpacing: '-0.01em' }}>
          {parseInline(line.slice(3))}
        </div>
      )
    }
    // Encabezado #
    else if (line.startsWith('# ')) {
      elements.push(
        <div key={i} style={{ color: '#F0F4FF', fontSize: '15px', fontWeight: '800', marginTop: '14px', marginBottom: '6px' }}>
          {parseInline(line.slice(2))}
        </div>
      )
    }
    // Lista con •, - o *
    else if (/^[•\-\*]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[•\-\*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[•\-\*]\s/, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '6px 0', paddingLeft: '0', listStyle: 'none' }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: 'flex', gap: '8px', marginBottom: '3px', color: '#CDD0E0', fontSize: '13px', lineHeight: '1.6' }}>
              <span style={{ color: '#4BA3D9', flexShrink: 0, marginTop: '1px' }}>•</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }
    // Lista numerada
    else if (/^\d+\.\s/.test(line)) {
      const items: { num: string; text: string }[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const m = lines[i].match(/^(\d+)\.\s(.*)/)
        if (m) items.push({ num: m[1], text: m[2] })
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: '6px 0', paddingLeft: '0', listStyle: 'none' }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: 'flex', gap: '10px', marginBottom: '4px', color: '#CDD0E0', fontSize: '13px', lineHeight: '1.6' }}>
              <span style={{ color: '#4BA3D9', fontWeight: '700', flexShrink: 0, minWidth: '16px' }}>{item.num}.</span>
              <span>{parseInline(item.text)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }
    // Separador
    else if (line.startsWith('---') || line.startsWith('═══')) {
      elements.push(<div key={i} style={{ borderTop: '1px solid rgba(75,163,217,0.12)', margin: '10px 0' }} />)
    }
    // Línea en blanco
    else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '6px' }} />)
    }
    // Párrafo normal
    else {
      elements.push(
        <p key={i} style={{ color: '#CDD0E0', fontSize: '13px', lineHeight: '1.7', margin: '2px 0' }}>
          {parseInline(line)}
        </p>
      )
    }
    i++
  }

  return <>{elements}</>
}

function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    const italicMatch = remaining.match(/\*(.+?)\*/)
    const codeMatch = remaining.match(/`(.+?)`/)

    const matches = [
      boldMatch && { match: boldMatch, type: 'bold' },
      italicMatch && { match: italicMatch, type: 'italic' },
      codeMatch && { match: codeMatch, type: 'code' },
    ].filter(Boolean) as { match: RegExpMatchArray; type: string }[]

    if (matches.length === 0) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }

    const first = matches.reduce((a, b) => a.match.index! <= b.match.index! ? a : b)
    const idx = first.match.index!

    if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>)

    if (first.type === 'bold') {
      parts.push(<strong key={key++} style={{ color: '#F0F4FF', fontWeight: '700' }}>{first.match[1]}</strong>)
    } else if (first.type === 'italic') {
      parts.push(<em key={key++} style={{ color: '#CDD0E0', fontStyle: 'italic' }}>{first.match[1]}</em>)
    } else {
      parts.push(<code key={key++} style={{ backgroundColor: 'rgba(75,163,217,0.1)', borderRadius: '4px', padding: '1px 5px', fontSize: '12px', fontFamily: 'monospace', color: '#4BA3D9' }}>{first.match[1]}</code>)
    }

    remaining = remaining.slice(idx + first.match[0].length)
  }

  return <>{parts}</>
}

// Cursor parpadeante
function Cursor() {
  return (
    <span style={{ display: 'inline-block', width: '2px', height: '14px', backgroundColor: '#4BA3D9', marginLeft: '2px', verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite' }} />
  )
}

export default function AIPage() {
  const [role, setRole] = useState<Role>('director')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const currentRole = ROLES.find(r => r.id === role)!

  async function sendMessage(text?: string) {
    const msg = (text || input).trim()
    if (!msg || streaming) return
    setInput('')

    const userMsg: Message = { role: 'user', content: msg }
    const updatedHistory = [...messages, userMsg]
    setMessages([...updatedHistory, { role: 'assistant', content: '' }])
    setStreaming(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages, role }),
      })

      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        const final = accumulated
        setMessages([...updatedHistory, { role: 'assistant', content: final }])
      }
    } catch {
      setMessages([...updatedHistory, { role: 'assistant', content: 'Error al conectar. Inténtalo de nuevo.' }])
    }

    setStreaming(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', display: 'flex', flexDirection: 'column', fontFamily: "-apple-system,'Inter',sans-serif" }}>
      <style>{`
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
        .msg-in { animation: fadeIn 200ms ease forwards; }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%', padding: '24px 32px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `linear-gradient(135deg,#1E2A5E,${currentRole.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: `0 0 20px ${currentRole.color}30` }}>
              🧠
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Asistente IA</h1>
              <p style={{ color: '#2A3550', fontSize: '12px', margin: 0 }}>WeAthletics · modo {currentRole.label}</p>
            </div>
          </div>

          {/* Selector de rol */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '12px', padding: '4px' }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => { setRole(r.id); setMessages([]) }}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: 'none', transition: 'all 150ms',
                  backgroundColor: role === r.id ? r.bg : 'transparent',
                  color: role === r.id ? r.color : '#2A3550',
                  outline: role === r.id ? `1px solid ${r.color}30` : 'none',
                }}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* CHAT */}
        <div style={{ flex: 1, backgroundColor: '#07090F', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {messages.length === 0 && (
              <div style={{ margin: 'auto 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>{currentRole.icon}</div>
                  <p style={{ color: '#2A3550', fontSize: '13px', margin: 0 }}>
                    Modo <strong style={{ color: currentRole.color }}>{currentRole.label}</strong> — pregúntame lo que necesites
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {SUGGESTIONS[role].map(s => (
                    <button key={s} onClick={() => sendMessage(s)} style={{ padding: '12px 14px', borderRadius: '12px', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid rgba(${role === 'director' ? '75,163,217' : role === 'coach' ? '16,185,129' : '245,158,11'},0.12)`, color: '#3A4A70', fontSize: '12px', cursor: 'pointer', lineHeight: '1.4', transition: 'all 150ms' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = currentRole.bg; e.currentTarget.style.color = currentRole.color }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = '#3A4A70' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              const isLast = i === messages.length - 1
              const isStreaming = streaming && isLast && !isUser

              return (
                <div key={i} className="msg-in" style={{ display: 'flex', gap: '12px', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700',
                    background: isUser ? 'rgba(75,163,217,0.15)' : `linear-gradient(135deg,#1E2A5E,${currentRole.color})`,
                    color: isUser ? '#4BA3D9' : 'white', border: isUser ? '1px solid rgba(75,163,217,0.2)' : 'none',
                  }}>
                    {isUser ? 'Tú' : '🧠'}
                  </div>

                  {/* Burbuja */}
                  <div style={{ maxWidth: '78%',
                    padding: isUser ? '10px 14px' : '14px 16px',
                    borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    backgroundColor: isUser ? 'rgba(75,163,217,0.1)' : '#0D1020',
                    border: isUser ? '1px solid rgba(75,163,217,0.18)' : '1px solid rgba(75,163,217,0.08)',
                  }}>
                    {isUser ? (
                      <p style={{ color: '#BDD4F0', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{msg.content}</p>
                    ) : (
                      <div>
                        {/* Pensando... */}
                        {isStreaming && msg.content === '' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {[0, 1, 2].map(j => (
                                <div key={j} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: currentRole.color, animation: `blink 1.2s ease-in-out infinite`, animationDelay: `${j * 0.2}s` }} />
                              ))}
                            </div>
                            <span style={{ color: '#2A3550', fontSize: '12px' }}>Pensando…</span>
                          </div>
                        ) : (
                          <div>
                            <MarkdownText text={msg.content} />
                            {isStreaming && <Cursor />}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(75,163,217,0.06)', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#06080F' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Pregunta como ${currentRole.label.toLowerCase()}…`}
              disabled={streaming}
              style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${role === 'director' ? '75,163,217' : role === 'coach' ? '16,185,129' : '245,158,11'},0.15)`, borderRadius: '12px', padding: '11px 16px', color: '#CDD0E0', fontSize: '13px', outline: 'none' }}
            />
            <button onClick={() => sendMessage()} disabled={streaming || !input.trim()}
              style={{ padding: '11px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', background: streaming || !input.trim() ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,#1E2A5E,${currentRole.color})`, color: streaming || !input.trim() ? '#2A3550' : 'white', border: 'none', cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer', transition: 'all 150ms', boxShadow: streaming || !input.trim() ? 'none' : `0 4px 16px ${currentRole.color}30`, whiteSpace: 'nowrap' }}>
              {streaming ? '…' : 'Enviar →'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '10px', color: '#1A2040', fontSize: '10px' }}>
          AthleteOS AI · claude-haiku-4-5 · datos en tiempo real
        </div>
      </div>
    </main>
  )
}
