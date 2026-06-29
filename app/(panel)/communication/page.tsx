import { supabase } from '@/app/lib/supabase'

export default async function Communication() {
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  const typeConfig: Record<string, { color: string, bg: string, border: string, label: string }> = {
    info:    { color: '#4BA3D9', bg: 'rgba(75,163,217,0.08)',  border: 'rgba(75,163,217,0.2)',  label: 'Aviso' },
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  label: 'Buenas noticias' },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  label: 'Atención' },
    urgent:  { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   label: 'Urgente' },
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Comunicación</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>Avisos y anuncios para los atletas del club</p>
          </div>
          <a href="/communication/nuevo" style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 16px rgba(75,163,217,0.2)' }}>
            + Nuevo aviso
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Total avisos', value: String(announcements?.length || 0), color: '#4BA3D9' },
            { label: 'Fijados', value: String(announcements?.filter(a => a.pinned).length || 0), color: '#F59E0B' },
            { label: 'Urgentes', value: String(announcements?.filter(a => a.type === 'urgent').length || 0), color: '#EF4444' },
            { label: 'Este mes', value: String(announcements?.filter(a => new Date(a.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length || 0), color: '#10B981' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {announcements && announcements.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcements.map(ann => {
              const config = typeConfig[ann.type] || typeConfig.info
              return (
                <div key={ann.id} style={{ backgroundColor: '#0A0E1A', border: `1px solid ${ann.pinned ? config.border : 'rgba(75,163,217,0.08)'}`, borderRadius: '14px', padding: '20px', borderLeft: `3px solid ${config.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {ann.pinned && <span style={{ color: '#F59E0B', fontSize: '11px', fontWeight: '700' }}>📌 Fijado</span>}
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
                        {config.label}
                      </span>
                    </div>
                    <span style={{ color: '#2A3550', fontSize: '11px' }}>
                      {new Date(ann.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <h3 style={{ color: '#F0F4FF', fontSize: '15px', fontWeight: '700', margin: '0 0 8px' }}>{ann.title}</h3>
                  <p style={{ color: '#4A5580', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{ann.content}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '14px', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ color: '#2A3550', fontSize: '14px', marginBottom: '12px' }}>No hay avisos publicados todavía</div>
            <a href="/communication/nuevo" style={{ color: '#4BA3D9', fontSize: '13px', textDecoration: 'none' }}>Crear el primero →</a>
          </div>
        )}
      </div>
    </main>
  )
}
