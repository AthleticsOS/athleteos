import { supabase } from './lib/supabase'

export default async function Home() {
  const { data: clubs } = await supabase.from('clubs').select('*')

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-white text-2xl font-bold">A</span>
        </div>
        <h1 className="text-5xl font-medium text-white tracking-tight mb-4">
          AthleteOS
        </h1>
        <p className="text-[#555] text-lg mb-8">
          El sistema operativo de tu club deportivo
        </p>
        <div className="mt-8 border border-[#1A1A1A] rounded-xl p-6">
          <p className="text-[#444] text-xs uppercase tracking-widest mb-4">Clubs en el sistema</p>
          {clubs?.map((club) => (
            <div key={club.id} className="flex items-center gap-3 bg-[#111] rounded-lg px-4 py-3">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-white font-medium">{club.name}</span>
              <span className="text-[#444] text-sm ml-auto">{club.country}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}