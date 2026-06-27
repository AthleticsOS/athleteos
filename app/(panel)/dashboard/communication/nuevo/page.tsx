'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function NuevoAviso() {
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'info',
    pinned: false,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.title || !form.content) {
      setMessage('El título y el contenido son obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('announcements').insert([form])
    if (error) {
      setMessage('Error al guardar. Inténtalo de nuevo.')
    } else {
      window.location.href = '/communication'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-lg mx-auto">
        <a href="/communication" className="text-[#555] text-sm hover:text-white transition-colors">← Comunicación</a>
        <h1 className="text-3xl font-medium text-white mt-2 mb-8">Nuevo aviso</h1>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Título</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Convocatoria Campeonato Regional"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Contenido</label>
            <textarea name="content" value={form.content} onChange={handleChange}
              placeholder="Escribe aquí el mensaje para los deportistas..."
              rows={5}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors resize-none" />
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Tipo</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
              <option value="info">Aviso general</option>
              <option value="success">Buenas noticias</option>
              <option value="warning">Atención</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="pinned" checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="pinned" className="text-[#888] text-sm">Fijar este aviso arriba del todo</label>
          </div>

          {message && <p className="text-red-400 text-sm">{message}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? 'Publicando...' : 'Publicar aviso'}
          </button>
        </div>
      </div>
    </main>
  )
}