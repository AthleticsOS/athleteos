export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system,'Inter',sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={100} height={100} style={{ margin: '0 auto 28px', display: 'block' }} />
        <div style={{ fontSize: '64px', fontWeight: '900', color: '#4BA3D9', letterSpacing: '-0.04em', lineHeight: 1 }}>404</div>
        <div style={{ color: '#F0F4FF', fontSize: '18px', fontWeight: '700', marginTop: '12px' }}>Página no encontrada</div>
        <p style={{ color: '#3A4A70', fontSize: '14px', marginTop: '8px', maxWidth: '320px', margin: '8px auto 28px' }}>
          Esta página no existe o se ha movido.
        </p>
        <a href="/dashboard" style={{ display: 'inline-block', padding: '11px 24px', borderRadius: '10px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '14px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 20px rgba(75,163,217,0.25)' }}>
          Volver al inicio
        </a>
      </div>
    </main>
  )
}
