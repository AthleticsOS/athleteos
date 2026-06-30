export default function Home() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', fontFamily: "-apple-system,'Inter',sans-serif", overflow: 'hidden' }}>
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .hero-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .feature-card:hover { border-color: rgba(75,163,217,0.25) !important; background-color: rgba(75,163,217,0.03) !important; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(30,42,94,0.5) 0%,transparent 70%)', animation: 'pulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(75,163,217,0.08) 0%,transparent 70%)', animation: 'pulse 8s ease-in-out infinite 2s' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* NAV */}
        <nav style={{ padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={36} height={36} style={{ borderRadius: '50%', animation: 'float 4s ease-in-out infinite' }} />
            <span style={{ color: '#F0F4FF', fontSize: '16px', fontWeight: '800', letterSpacing: '-0.02em' }}>WeAthletics</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a href="/login" style={{ color: '#3A4A70', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>Acceder</a>
            <a href="/register" style={{ padding: '8px 20px', borderRadius: '20px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>Solicitar acceso</a>
          </div>
        </nav>

        {/* HERO */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '80px 40px 60px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: '20px', backgroundColor: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '28px' }}>
            Club Deportivo · Madrid
          </div>
          <h1 style={{ fontSize: '58px', fontWeight: '900', color: '#F0F4FF', letterSpacing: '-0.04em', lineHeight: 1.08, margin: '0 0 22px' }}>
            Gestión deportiva<br />
            <span style={{ background: 'linear-gradient(135deg,#4BA3D9 0%,#1E2A5E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              para atletas de élite
            </span>
          </h1>
          <p style={{ color: '#4A5580', fontSize: '17px', lineHeight: '1.7', margin: '0 auto 44px', maxWidth: '520px' }}>
            Plataforma integral de WeAthletics. Control de entrenamientos, competiciones, bienestar y rendimiento en tiempo real.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/login" className="hero-btn" style={{ padding: '14px 32px', borderRadius: '12px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '15px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 8px 32px rgba(75,163,217,0.2)', transition: 'all 200ms' }}>
              Acceder al club →
            </a>
            <a href="/register" className="hero-btn" style={{ padding: '14px 32px', borderRadius: '12px', backgroundColor: 'rgba(75,163,217,0.07)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '15px', fontWeight: '700', textDecoration: 'none', transition: 'all 200ms' }}>
              Solicitar acceso
            </a>
          </div>
        </div>

        {/* STATS */}
        <div style={{ maxWidth: '780px', margin: '0 auto 64px', padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
            {[
              { value: '360°', label: 'Control del atleta', color: '#4BA3D9' },
              { value: 'Live', label: 'Datos en tiempo real', color: '#10B981' },
              { value: 'Madrid', label: 'WeAthletics Club', color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '14px', padding: '22px', textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: '900', color: s.color, letterSpacing: '-0.02em', marginBottom: '5px' }}>{s.value}</div>
                <div style={{ color: '#2A3550', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>Funcionalidades</div>
            <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Todo lo que necesita tu club</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {[
              { icon: '🏃', title: 'Entrenamientos', desc: 'Registra sesiones, series, tiempos y esfuerzo de cada atleta.' },
              { icon: '🏆', title: 'Competiciones', desc: 'Gestiona convocatorias, resultados y marcas personales.' },
              { icon: '📊', title: 'Estadísticas', desc: 'Gráficas de evolución, ranking y comparativa entre atletas.' },
              { icon: '💙', title: 'Bienestar', desc: 'Encuestas diarias de sueño, energía y estado físico.' },
              { icon: '💶', title: 'Finanzas', desc: 'Control de cuotas, pagos y generación de cobros mensuales.' },
              { icon: '🏫', title: 'Extraescolares', desc: 'Gestión de colegios, actividades, inscripciones y asistencia.' },
            ].map(f => (
              <div key={f.title} className="feature-card" style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.07)', borderRadius: '14px', padding: '22px', transition: 'all 200ms' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px' }}>{f.icon}</div>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>{f.title}</div>
                <div style={{ color: '#3A4A70', fontSize: '12px', lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '1px solid rgba(75,163,217,0.05)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#2A3550', fontSize: '12px' }}>© 2025 WeAthletics · Madrid</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/login" style={{ color: '#2A3550', fontSize: '12px', textDecoration: 'none' }}>Acceder</a>
            <a href="/register" style={{ color: '#2A3550', fontSize: '12px', textDecoration: 'none' }}>Registrarse</a>
          </div>
        </div>
      </div>
    </main>
  )
}
