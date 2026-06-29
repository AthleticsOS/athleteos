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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar con la IA.' }])
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-3xl mx-auto">
        <a href="/dashboard" className="text-[#555] text-sm hover:text-white transition-colors">← Dashboard</a>
        <div className="flex items-center gap-3 mt-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1E2A5E]/20 border border-[#4BA3D9]/30 flex items-center justify-center text-lg">🧠</div>
          <div>
            <h1 className="text-2xl font-medium text-white">Asistente IA</h1>
            <p className="text-[#555] text-sm">Conoce todos los datos de WeAthletics</p>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl overflow-hidden mb-4">
          <div className="p-6 min-h-96 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex flex-col gap-3 mt-4">
                <p className="text-[#444] text-sm text-center mb-4">Puedes preguntarme cualquier cosa sobre el club</p>
                {[
                  'Genera un entrenamiento de velocidad para mañana',
                  'Escribe un aviso para la convocatoria del campeonato',
                  'Dame consejos para mejorar el tiempo en 100m',
                  'Crea un plan de entrenamiento para esta semana'
                ].map((suggestion) => (
                  <button key={suggestion} onClick={() => setInput(suggestion)}
                    className="text-left bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#333] rounded-lg px-4 py-3 text-[#666] text-sm transition-colors hover:text-white">
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-400' : 'bg-[#1E2A5E]/20 text-[#4BA3D9]'}`}>
                  {msg.role === 'user' ? 'AC' : '🧠'}
                </div>
                <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed max-w-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600/10 text-white border border-blue-500/20' : 'bg-[#1A1A1A] text-white border border-[#333]'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1E2A5E]/20 text-[#4BA3D9] flex items-center justify-center text-xs">🧠</div>
                <div className="bg-[#1A1A1A] border border-[#222] rounded-xl px-4 py-3 text-[#555] text-sm">
                  Pensando...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#1A1A1A] p-4 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#4BA3D9] transition-colors"
            />
            <button onClick={sendMessage} disabled={loading}
              className="bg-[#1E2A5E] hover:bg-[#1E2A5E] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}