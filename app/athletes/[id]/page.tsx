import { supabase } from '../../lib/supabase'

type Props = {
  params: Promise<{ id: string }>
}

export default async function AthleteProfile({ params }: Props) {
  const { id } = await params

  const { data: athlete } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', id)
    .single()

  if (!athlete) return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <p className="text-white">Deportista no encontrado</p>
    </main>
  )

  const initials = `${athlete.first_name[0]}${athlete.last_name[0]}`

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/athletes" className="text-[#555] text-sm hover:text-white transition-colors">← Deportistas</a>

        <div className="flex items-start gap-6 mt-6 mb-10">
          <div className="w-20 h-20 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-2xl font-medium flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white">{athlete.first_name} {athlete.last_name}</h1>
            <div className="flex gap-4 mt-2 flex-wrap">
              <span className="text-[#555] text-sm">{athlete.sport}</span>
              <span className="text-[#333]">·</span>
              <span className="text-[#555] text-sm">{athlete.category}</span>
            </div>
            <div className="mt-3">
              <span className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full">
                {athlete.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Deporte</p>
            <p className="text-white text-lg font-medium">{athlete.sport}</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Categoría</p>
            <p className="text-white text-lg font-medium">{athlete.category}</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Género</p>
            <p className="text-white text-lg font-medium">
              {athlete.gender === 'male' ? 'Masculino' : 'Femenino'}
            </p>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-6">
          <h2 className="text-white font-medium mb-4">Información de contacto</h2>
          <div className="flex flex-col gap-3">
            {athlete.email && (
              <div className="flex items-center gap-3 py-2 border-b border-[#1A1A1A]">
                <span className="text-[#555] text-sm w-24">Email</span>
                <span className="text-[#AAA] text-sm">{athlete.email}</span>
              </div>
            )}
            {athlete.phone && (
              <div className="flex items-center gap-3 py-2 border-b border-[#1A1A1A]">
                <span className="text-[#555] text-sm w-24">Teléfono</span>
                <span className="text-[#AAA] text-sm">{athlete.phone}</span>
              </div>
            )}
            {athlete.birth_date && (
              <div className="flex items-center gap-3 py-2">
                <span className="text-[#555] text-sm w-24">Nacimiento</span>
                <span className="text-[#AAA] text-sm">{new Date(athlete.birth_date).toLocaleDateString('es-ES')}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}