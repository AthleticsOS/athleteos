'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function NuevoGrupo() {
  const [form, setForm] = useState({
    name: '',
    category: 'Absoluto',
    season: '2024-2025',
    color: '#2563EB',
    max_members: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.name) {
      setMessage('El nombre es obligatorio')
      return
    }
    setLoading(true)

    const { data: club } = await supabase.from('clubs').select('id').single()
    if (!club) { setMessage('Error al obtener el club'); setLoading(false); return }

    const { error } = await supabase.from('groups').insert([{
      ...form,
      club_id: club.id,
      max_members: form.max_members ? Number(form.max_members) : null
    }])

    if (error) {
      setMessage('Error al guardar. Inténtalo de nuevo.')
    } else {
      window.location.href = '/groups'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-lg mx-auto">
        <a href="/groups" className="text-[#555] text-sm hover:text-white transition-colors">← Grupos</a>
        <h1 className="text-2xl font-medium text-white mt-2 mb-8">Nuevo grupo</h1>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Nombre del grupo</label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Élite Senior"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Categoría</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
                <option>Absoluto</option>
                <option>Sub-23</option>
                <option>Juvenil</option>
                <option>Cadete</option>
                <option>Infantil</option>
                <option>Benjamín</option>
              </select>
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Temporada</label>
              <input name="season" value={form.season} onChange={handleChange}
                placeholder="2024-2025"
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Color del grupo</label>
              <div className="flex gap-3 items-center">
                <input type="color" name="color" value={form.color} onChange={handleChange}
                  className="w-12 h-12 rounded-lg border border-[#222] bg-[#0A0A0A] cursor-pointer" />
                <input name="color" value={form.color} onChange={handleChange}
                  className="flex-1 bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors font-mono" />
              </div>
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Máximo de miembros</label>
              <input name="max_members" type="number" value={form.max_members} onChange={handleChange}
                placeholder="Sin límite"
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
          </div>

          {message && <p className="text-red-400 text-sm">{message}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Crear grupo'}
          </button>
        </div>
      </div>
    </main>
  )
}