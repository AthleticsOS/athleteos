'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Register() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleRegister() {
    if (!email || !password || !firstName || !lastName) { setError('Rellena todos los campos obligatorios'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('athletes').insert({
        first_name: firstName,
        last_name: lastName,
        email,
        birth_date: birthDate || null,
        category: category || 'Sin categoría',
        sport: 'Atletismo',
        status: 'pending',
        user_id: data.user.id,
      })
    }

    setDone(true)
    setLoading(false)
  }

  if (done) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system,'Inter',sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={80} height={80} style={{ margin: '0 auto 20px', display: 'block' }} />
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
        <h1 style={{ color: '#F0F4FF', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Solicitud enviada</h1>
        <p style={{ color: '#3A4A70', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          Tu solicitud de registro ha sido enviada. El equipo de WeAthletics la revisará y activará tu cuenta en breve.
        </p>
        <a href="/login" style={{ color: '#4BA3D9', fontSize: '13px', textDecoration: 'none' }}>← Volver al inicio de sesión</a>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', display: 'flex', fontFamily: "-apple-system,'Inter',sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .reg-panel { padding: clamp(20px,5vw,40px) !important; }
          .reg-side { display: none !important; }
          .reg-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Panel izquierdo - formulario */}
      <div className="reg-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={80} height={80} style={{ margin: '0 auto 16px', display: 'block' }} />
            <div style={{ fontFamily: 'Airstrike, -apple-system, sans-serif', fontSize: '28px', fontWeight: '900' }}>
              <span style={{ color: '#4BA3D9' }}>WE</span><span style={{ color: 'white' }}>ATHLETICS</span>
            </div>
            <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '8px' }}>Solicitud de acceso al club</p>
          </div>

          {/* Indicador de pasos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', backgroundColor: step >= s ? '#4BA3D9' : 'rgba(75,163,217,0.1)', color: step >= s ? 'white' : '#3A4A70' }}>{s}</div>
                {s < 2 && <div style={{ width: '40px', height: '2px', backgroundColor: step > s ? '#4BA3D9' : 'rgba(75,163,217,0.1)' }} />}
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {step === 1 ? (
              <>
                <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Tu cuenta</div>
                <div>
                  <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Contraseña *</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button onClick={() => { if (!email || !password) { setError('Rellena el email y contraseña'); return }; setError(''); setStep(2) }} style={{ padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }}>
                  Continuar →
                </button>
              </>
            ) : (
              <>
                <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Tus datos</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Nombre *</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="María" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Apellidos *</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="García López" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Fecha de nacimiento</label>
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Categoría</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">Seleccionar...</option>
                    <option value="Sub-12">Sub-12</option>
                    <option value="Sub-14">Sub-14</option>
                    <option value="Sub-16">Sub-16</option>
                    <option value="Sub-18">Sub-18</option>
                    <option value="Sub-20">Sub-20</option>
                    <option value="Sub-23">Sub-23</option>
                    <option value="Absoluto">Absoluto</option>
                    <option value="Veterano">Veterano</option>
                  </select>
                </div>
                {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#EF4444', fontSize: '13px' }}>{error}</div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '14px', cursor: 'pointer' }}>← Atrás</button>
                  <button onClick={handleRegister} disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: '10px', background: loading ? 'rgba(75,163,217,0.15)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Enviando...' : 'Solicitar acceso'}
                  </button>
                </div>
              </>
            )}

            {step === 1 && error && <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#EF4444', fontSize: '13px' }}>{error}</div>}
          </div>

          <p style={{ textAlign: 'center', color: '#3A4A70', fontSize: '13px', marginTop: '20px' }}>
            ¿Ya tienes cuenta? <a href="/login" style={{ color: '#4BA3D9', textDecoration: 'none', fontWeight: '600' }}>Iniciar sesión</a>
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="reg-side" style={{ width: '420px', background: 'linear-gradient(160deg,#0D1428 0%,#1E2A5E 50%,#0A1530 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#4BA3D9', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Únete al club</div>
          {[
            'Accede a tu rendimiento en tiempo real',
            'Recibe convocatorias y avisos del club',
            'Registra tus sesiones de entrenamiento',
            'Consulta tus marcas personales',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(75,163,217,0.08)' : 'none', textAlign: 'left' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(75,163,217,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4BA3D9' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
