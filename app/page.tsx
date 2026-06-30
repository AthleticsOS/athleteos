export default function Home() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', fontFamily: "-apple-system,'Inter',sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        .hero-btn { transition: all 180ms ease; }
        .hero-btn:hover { opacity: 0.85; transform: translateY(-2px); }
        .feature-card { transition: border-color 180ms ease; }
        .feature-card:hover { border-color: rgba(75,163,217,0.22) !important; }

        @media (max-width: 640px) {
          .landing-nav { padding: 0 20px !important; height: 56px !important; }
          .landing-hero { padding: 52px 24px 44px !important; }
          .landing-h1 { font-size: 36px !important; line-height: 1.12 !important; }
          .landing-sub { font-size: 15px !important; }
          .landing-btns { flex-direction: column !important; gap: 10px !important; }
          .landing-btns a { text-align: center; }
          .landing-stats { grid-template-columns: repeat(3,1fr) !important; gap: 8px !important; padding: 0 20px !important; }
          .landing-stats-val { font-size: 20px !important; }
          .landing-features { grid-template-columns: 1fr 1fr !important; gap: 8px !important; padding: 0 20px 60px !important; }
          .landing-footer { padding: 20px !important; flex-direction: column !important; gap: 8px !important; text-align: center; }
          .landing-badge { font-size: 10px !important; }
        }
      `}</style>

      {/* Fondo decorativo */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(30,42,94,0.55) 0%,transparent 70%)', animation: 'pulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(75,163,217,0.07) 0%,transparent 70%)', animation: 'pulse 8s ease-in-out infinite 2s' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* NAV */}
        <nav className="landing-nav" style={{ padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(75,163,217,0.07)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(6,8,15,0.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={32} height={32} style={{ borderRadius: '50%', animation: 'float 4s ease-in-out infinite' }} />
            <span style={{ color: '#F0F4FF', fontSize: '15px', fontWeight: '800', letterSpacing: '-0.02em' }}>WeAthletics</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a href="/login" style={{ color: '#4A5580', fontSize: '14px', textDecoration: 'none', fontWeight: '600', padding: '6px 14px' }}>Acceder</a>
            <a href="/register" className="hero-btn" style={{ padding: '8px 18px', borderRadius: '20px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>Solicitar acceso</a>
          </div>
        </nav>

        {/* HERO */}
        <div className="landing-hero" style={{ maxWidth: '820px', margin: '0 auto', padding: '80px 40px 56px', textAlign: 'center' }}>
          <div className="landing-badge" style={{ display: 'inline-block', padding: '5px 14px', borderRadius: '20px', backgroundColor: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>
            Club Deportivo · Madrid
          </div>
          <h1 className="landing-h1" style={{ fontSize: '54px', fontWeight: '900', color: '#F0F4FF', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 20px' }}>
            Gestión deportiva<br />
            <span style={{ background: 'linear-gradient(135deg,#4BA3D9 0%,#6366F1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              para atletas de élite
            </span>
          </h1>
          <p className="landing-sub" style={{ color: '#4A5580', fontSize: '16px', lineHeight: '1.7', margin: '0 auto 36px', maxWidth: '480px' }}>
            Plataforma integral de WeAthletics. Entrenamientos, competiciones, bienestar y rendimiento en tiempo real.
          </p>
          <div className="landing-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/login" className="hero-btn" style={{ padding: '14px 30px', borderRadius: '12px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '15px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 8px 28px rgba(75,163,217,0.18)' }}>
              Acceder al club →
            </a>
            <a href="/register" className="hero-btn" style={{ padding: '14px 30px', borderRadius: '12px', backgroundColor: 'rgba(75,163,217,0.07)', border: '1px solid rgba(75,163,217,0.18)', color: '#4BA3D9', fontSize: '15px', fontWeight: '700', textDecoration: 'none' }}>
              Solicitar acceso
            </a>
          </div>
        </div>

        {/* STATS */}
        <div className="landing-stats" style={{ maxWidth: '720px', margin: '0 auto 56px', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {[
            { value: '360°', label: 'Control atleta', color: '#4BA3D9' },
            { value: 'Live', label: 'Datos en tiempo real', color: '#10B981' },
            { value: 'IA', label: 'Asistente integrado', color: '#A78BFA' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.07)', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
              <div className="landing-stats-val" style={{ fontSize: '24px', fontWeight: '900', color: s.color, letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</div>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 40px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Funcionalidades</div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Todo lo que necesita tu club</h2>
          </div>
        </div>
        <div className="landing-features" style={{ maxWidth: '860px', margin: '0 auto', padding: '0 40px 72px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
          {[
            { icon: '🏃', title: 'Entrenamientos', desc: 'Sesiones, series, tiempos y esfuerzo de cada atleta.' },
            { icon: '🏆', title: 'Competiciones', desc: 'Convocatorias, resultados y marcas personales.' },
            { icon: '📊', title: 'Estadísticas', desc: 'Gráficas de evolución, ranking y comparativa.' },
            { icon: '💙', title: 'Bienestar', desc: 'Encuestas diarias de sueño, energía y dolor.' },
            { icon: '💶', title: 'Finanzas', desc: 'Cuotas, pagos y cobros masivos mensuales.' },
            { icon: '🧠', title: 'Asistente IA', desc: '3 roles: director, entrenador y atleta.' },
          ].map(f => (
            <div key={f.title} className="feature-card" style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.07)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{f.title}</div>
              <div style={{ color: '#3A4A70', fontSize: '12px', lineHeight: '1.6' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div style={{ maxWidth: '600px', margin: '0 auto 72px', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '20px', padding: '36px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚡</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.02em', margin: '0 0 10px' }}>¿Eres atleta de WeAthletics?</h3>
            <p style={{ color: '#4A5580', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px' }}>Accede a tu portal personal para registrar bienestar, ver convocatorias y hablar con tu entrenador.</p>
            <a href="/login" className="hero-btn" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: '12px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>
              Entrar al portal →
            </a>
          </div>
        </div>

        {/* FOOTER */}
        <div className="landing-footer" style={{ borderTop: '1px solid rgba(75,163,217,0.05)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
