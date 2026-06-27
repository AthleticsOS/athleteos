'use client'

import { useState } from 'react'

export default function AIAssistant() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar. Inténtalo de nuevo.' }])
    }
    setLoading(false)
  }

  const suggestions = [
    '¿Cuál es el mejor atleta del club en 100m?',
    'Genera un entrenamiento de velocidad para mañana',
    'Escribe un aviso para la convocatoria del campeonato',
    'Dame un resumen de la temporada actual',
  ]

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px', display:'flex', flexDirection:'column'}}>
      <div style={{maxWidth:'800px', margin:'0 auto', width:'100%', flex:1, display:'flex', flexDirection:'column'}}>

        <div style={{marginBottom:'28px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <div style={{
              width:'40px', height:'40px', borderRadius:'12px',
              background:'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'18px', boxShadow:'0 0 20px rgba(99,102,241,0.3)',
            }}>🧠</div>
            <div>
              <h1 style={{fontSize:'22px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>Asistente IA</h1>
              <p style={{color:'#333', fontSize:'13px', margin:'3px 0 0'}}>Conoce todos los datos de WeAthletics en tiempo real</p>
            </div>
          </div>
        </div>

        <div style={{
          flex:1, backgroundColor:'#0E0E0E',
          border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'16px', overflow:'hidden',
          display:'flex', flexDirection:'column',
          minHeight:'500px',
        }}>
          <div style={{flex:1, padding:'20px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'16px'}}>
            {messages.length === 0 && (
              <div style={{margin:'auto 0'}}>
                <p style={{color:'#2A2A2A', fontSize:'13px', textAlign:'center', marginBottom:'20px'}}>Pregúntame cualquier cosa sobre el club</p>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => setInput(s)} style={{
                      padding:'12px 14px', borderRadius:'10px', textAlign:'left',
                      backgroundColor:'rgba(255,255,255,0.03)',
                      border:'1px solid rgba(255,255,255,0.06)',
                      color:'#555', fontSize:'13px', cursor:'pointer',
                      transition:'all 150ms',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#818CF8'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{display:'flex', gap:'12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'}}>
                <div style={{
                  width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'13px', fontWeight:'700',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))'
                    : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: msg.role === 'user' ? '#A5B4FC' : 'white',
                }}>
                  {msg.role === 'user' ? 'AC' : '🧠'}
                </div>
                <div style={{
                  maxWidth:'75%', padding:'12px 16px', borderRadius:'14px',
                  fontSize:'13px', lineHeight:'1.6', whiteSpace:'pre-wrap',
                  backgroundColor: msg.role === 'user' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                  border: msg.role === 'user' ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  color: msg.role === 'user' ? '#C7D2FE' : '#CCC',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display:'flex', gap:'12px'}}>
                <div style={{
                  width:'32px', height:'32px', borderRadius:'50%',
                  background:'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px',
                }}>🧠</div>
                <div style={{
                  padding:'12px 16px', borderRadius:'14px', fontSize:'13px',
                  backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)',
                  color:'#333',
                }}>
                  Pensando...
                </div>
              </div>
            )}
          </div>

          <div style={{padding:'16px', borderTop:'1px solid rgba(255,255,255,0.04)', display:'flex', gap:'10px'}}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu pregunta..."
              style={{
                flex:1, backgroundColor:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:'10px', padding:'11px 14px',
                color:'white', fontSize:'13px', outline:'none',
              }}
            />
            <button onClick={sendMessage} disabled={loading} style={{
              padding:'11px 20px', borderRadius:'10px', fontSize:'13px', fontWeight:'600',
              background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color:'white', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 16px rgba(99,102,241,0.3)',
            }}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}