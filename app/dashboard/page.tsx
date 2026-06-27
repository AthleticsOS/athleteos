export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <div>
            <h1 className="text-white font-medium text-lg">AthleteOS</h1>
            <p className="text-[#555] text-sm">WeAthletics</p>
          </div>
        </div>
        <h2 className="text-3xl font-medium text-white mb-2">
          Buenos días, Aaron
        </h2>
        <p className="text-[#555] mb-10">Temporada 2024–2025</p>
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Deportistas</p>
            <p className="text-white text-3xl font-medium">147</p>
            <p className="text-green-500 text-xs mt-2">↑ 12 este mes</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Ingresos</p>
            <p className="text-blue-400 text-3xl font-medium">€4.240</p>
            <p className="text-green-500 text-xs mt-2">↑ 8% vs mes anterior</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Sesiones</p>
            <p className="text-white text-3xl font-medium">23</p>
            <p className="text-[#555] text-xs mt-2">Esta semana</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Pendientes</p>
            <p className="text-red-400 text-3xl font-medium">8</p>
            <p className="text-red-400 text-xs mt-2">Cuotas sin pagar</p>
          </div>
        </div>
        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Actividad reciente</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 py-2 border-b border-[#1A1A1A]">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-medium">AC</div>
              <p className="text-[#AAA] text-sm flex-1">Aaron Cortés marcó nuevo récord personal — 100m en 10.82s</p>
              <span className="text-[#FFD700] text-xs">★ PR</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-[#1A1A1A]">
              <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-medium">MR</div>
              <p className="text-[#AAA] text-sm flex-1">María Ruiz tiene una cuota vencida de junio</p>
              <span className="text-red-400 text-xs">Pago</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-green-600/20 text-green-400 flex items-center justify-center text-xs font-medium">JL</div>
              <p className="text-[#AAA] text-sm flex-1">Jorge López inscrito en el Campeonato Regional</p>
              <span className="text-blue-400 text-xs">Comp.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}