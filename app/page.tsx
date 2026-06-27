export default function Home() {
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
        <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
          Entrar
        </a>
      </div>
    </main>
  )
}