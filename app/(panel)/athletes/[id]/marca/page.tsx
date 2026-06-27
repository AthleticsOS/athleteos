'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Props = {
  params: Promise<{ id: string }>
}

export default function NuevaMarca({ params }: Props) {
  const [athleteId, setAthleteId] = useState('')
  const [form, setForm] = useState({
    discipline: '100m lisos',
    mark: '',
    competition: '',
    date: '',
    wind: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useState(() => {
    params.then(({ id }) => setAthleteId(id))
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.discipline || !form.mark || !form.date) {
      setMessage('La prueba, marca y fecha son obligatorias')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('personal_records').insert([{
      ...form,
      athlete_id: athleteId,
    }])
    if (error) {
      setMessage('Error al guardar. Inténtalo de nuevo.')
    } else {
      window.location.href = `/athletes/${athleteId}`
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-lg mx-auto">
        <a href={`/athletes/${athleteId}`} className="text-[#555] text-sm hover:text-white transition-colors">← Perfil</a>
        <h1 className="text-2xl font-medium text-white mt-2 mb-8">Nueva marca personal</h1>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Prueba</label>
            <input name="discipline" value={form.discipline} onChange={handleChange}
              placeholder="100m lisos"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Marca</label>
              <input name="mark" value={form.mark} onChange={handleChange}
                placeholder="10.82s"
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors font-mono" />
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Viento (m/s)</label>
              <input name="wind" value={form.wind} onChange={handleChange}
                placeholder="+0.2"
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Competición</label>
            <input name="competition" value={form.competition} onChange={handleChange}
              placeholder="Meeting Internacional Madrid"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Fecha</label>
            <input name="date" type="date" value={form.date} onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>

          {message && <p className="text-red-400 text-sm">{message}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar marca'}
          </button>
        </div>
      </div>
    </main>
  )
}