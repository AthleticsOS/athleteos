import { supabase } from '@/app/lib/supabase'

export default async function PlantillasPage() {
  const { data: templates } = await supabase.from('training_templates').select('*').order('created_at', { ascending: false })

  return (
    <main className="plant-main" style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <style>{`
        @media (max-width: 768px) {
          .plant-main { padding: 16px !important; }
          .plant-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <a href="/training" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Entrenamientos</a>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Plantillas de entrenamiento</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Sesiones tipo para reusar con atletas y grupos</p>
          </div>
          <a href="/training/plantillas/nueva" style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>+ Nueva plantilla</a>
        </div>

        {(!templates || templates.length === 0) ? (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '600' }}>Sin plantillas todavía</div>
            <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '4px' }}>Crea tu primera plantilla de entrenamiento</div>
          </div>
        ) : (
          <div className="plant-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
            {templates.map(t => {
              const exercises = Array.isArray(t.exercises) ? t.exercises : []
              return (
                <div key={t.id} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ color: '#F0F4FF', fontSize: '15px', fontWeight: '700' }}>{t.name}</div>
                    <span style={{ padding: '2px 8px', borderRadius: '8px', backgroundColor: 'rgba(75,163,217,0.08)', color: '#4BA3D9', fontSize: '10px', fontWeight: '700' }}>{exercises.length} ejercicios</span>
                  </div>
                  {t.description && <div style={{ color: '#3A4A70', fontSize: '12px', marginBottom: '12px' }}>{t.description}</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                    {exercises.slice(0,3).map((ex: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#4BA3D9', flexShrink: 0 }} />
                        <span style={{ color: '#CDD0E0', fontSize: '12px' }}>{ex.name}</span>
                        {ex.series && <span style={{ color: '#2A3550', fontSize: '11px' }}>{ex.series}×{ex.reps}</span>}
                      </div>
                    ))}
                    {exercises.length > 3 && <div style={{ color: '#2A3550', fontSize: '11px', paddingLeft: '12px' }}>+{exercises.length-3} más</div>}
                  </div>
                  <a href={`/training/plantillas/${t.id}`} style={{ display: 'inline-block', padding: '7px 14px', borderRadius: '8px', backgroundColor: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>Usar plantilla</a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
