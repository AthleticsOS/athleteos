'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

type Props = {
  params: Promise<{ id: string }>
}

export default function NuevoResultado({ params }: Props) {
  const [competitionId, setCompetitionId] = useState('')
  const [athletes, setAthletes] = useState<any[]>([])
  const [form, setForm] = useState({
    athlete_id: '',
    discipline: '100m lisos',
    mark: '',
    position: 1,
    wind: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    params.then(({ id }) => setCompetitionId(id))
    supabase.from('athletes').select('id, first_name, last_name').then(({ data }) => {
      if (data) setAthletes(data)
    })
  }, [params])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.athlete_id || !form.mark) {
      setMessage('El atleta y la marca son obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('competition_results').insert([{
      ...form,
      competition_id: competitionId,
      position: Number(form.position)
    }])
    if (error) {
      setMessage('Error al guardar.')
    } else {
      window.location.href = `/competitions/${competitionId}`
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-lg mx-auto">
        <a href={`/competitions/${competitionId}`} className="text-[#555] text-sm hover:text-white transition-colors">← Competición</a>
        <h1 className="text-3xl font-medium text-white mt-2 mb-8">Añadir resultado</h1>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Atleta</label>
            <select name="athlete_id" value={form.athlete_id} onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
              <option value="">Seleccionar atleta</option>
              {athletes.map(a => (
                <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Prueba</label>
            <input name="discipline" value={form.discipline} onChange={handleChange}
              placeholder="100m lisos"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Marca</label>
              <input name="mark" value={form.mark} onChange={handleChange}
                placeholder="10.82s"
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Posición</label>
              <input name="position" type="number" value={form.position} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Viento (m/s)</label>
            <input name="wind" value={form.wind} onChange={handleChange}
              placeholder="+0.2"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>

          {message && <p className="text-red-400 text-sm">{message}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar resultado'}
          </button>
        </div>
      </div>
    </main>
  )
}