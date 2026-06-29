import { supabase } from '@/app/lib/supabase'
import InviteRoleButton from '@/app/components/InviteRoleButton'

export default async function Roles() {
  const { data: roles } = await supabase.from('club_roles').select('*').order('created_at', { ascending: false })

  const roleConfig: Record<string, { label: string, color: string, desc: string }> = {
    coach:          { label: 'Entrenador', color: '#4BA3D9', desc: 'Acceso a rendimiento y sesiones de atletas' },
    admin_readonly: { label: 'Admin solo lectura', color: '#F59E0B', desc: 'Puede ver todo pero no editar' },
    staff:          { label: 'Staff', color: '#10B981', desc: 'Gestiona pagos y comunicación' },
    director:       { label: 'Director', color: '#A78BFA', desc: 'Acceso completo a todo' },
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <a href="/settings" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Configuración</a>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Roles y permisos</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Gestiona quién tiene acceso a AthleteOS</p>
          </div>
        </div>

        {/* Tipos de rol */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '20px' }}>
          {Object.entries(roleConfig).map(([key, cfg]) => (
            <div key={key} style={{ backgroundColor: '#0A0E1A', border: `1px solid ${cfg.color}20`, borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cfg.color }} />
                <span style={{ color: cfg.color, fontSize: '12px', fontWeight: '700' }}>{cfg.label}</span>
              </div>
              <div style={{ color: '#3A4A70', fontSize: '11px' }}>{cfg.desc}</div>
            </div>
          ))}
        </div>

        {/* Usuarios con acceso */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Usuarios con acceso · {roles?.length || 0}</p>
          </div>

          {roles && roles.length > 0 ? roles.map((r, i) => {
            const cfg = roleConfig[r.role] || { label: r.role, color: '#888', desc: '' }
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < roles.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                  {r.name?.[0] || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{r.name || 'Sin nombre'}</div>
                  <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '1px' }}>{r.email || 'Sin email'}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
                  {cfg.label}
                </span>
              </div>
            )
          }) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#2A3550', fontSize: '13px' }}>
              No hay usuarios con roles asignados
            </div>
          )}
        </div>

        {/* Añadir nuevo rol */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: '0 0 14px' }}>Añadir acceso</p>
          <InviteRoleButton />
        </div>

      </div>
    </main>
  )
}
