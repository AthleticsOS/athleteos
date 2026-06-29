import { supabase } from '@/app/lib/supabase'

export default async function Groups() {
  const { data: groups } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
  const { data: athletes } = await supabase.from('athletes').select('id, first_name, last_name, category, group_id').order('first_name')

  const sinGrupo = athletes?.filter(a => !a.group_id) || []

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Grupos</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>{groups?.length || 0} grupos · {athletes?.length || 0} atletas en total</p>
          </div>
          <a href="/groups/nuevo" style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 16px rgba(75,163,217,0.2)' }}>
            + Nuevo grupo
          </a>
        </div>

        {groups && groups.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '16px' }}>
            {groups.map(group => {
              const miembros = athletes?.filter(a => a.group_id === group.id) || []
              const color = group.color || '#4BA3D9'
              return (
                <div key={group.id} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: color, fontWeight: '800', fontSize: '16px' }}>{group.name?.[0]}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#F0F4FF', fontSize: '15px', fontWeight: '700' }}>{group.name}</div>
                      <div style={{ color: '#3A4A70', fontSize: '11px', marginTop: '2px' }}>
                        {group.category && `${group.category} · `}{group.season && group.season}
                      </div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: `${color}15`, color: color, border: `1px solid ${color}30` }}>
                      {miembros.length} atletas
                    </span>
                    <a href={`/groups/${group.id}/editar`} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.04)', color: '#CDD0E0', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}>Gestionar</a>
                    {miembros.length > 0 && (
                      <a href={`/groups/${group.id}/sesion`} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(75,163,217,0.08)', color: '#4BA3D9', border: '1px solid rgba(75,163,217,0.15)', textDecoration: 'none' }}>+ Sesión</a>
                    )}
                  </div>

                  <div style={{ padding: '14px 20px' }}>
                    {miembros.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {miembros.map(a => (
                          <a key={a.id} href={`/athletes/${a.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', textDecoration: 'none' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                              {a.first_name[0]}{a.last_name[0]}
                            </div>
                            <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{a.first_name} {a.last_name}</span>
                            <span style={{ color: '#2A3550', fontSize: '11px', marginLeft: 'auto' }}>{a.category}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#2A3550', fontSize: '12px', textAlign: 'center', padding: '12px 0' }}>Sin atletas asignados</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '16px', padding: '60px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ color: '#2A3550', fontSize: '14px', marginBottom: '12px' }}>Sin grupos todavía</div>
            <a href="/groups/nuevo" style={{ color: '#4BA3D9', fontSize: '13px', textDecoration: 'none' }}>Crear el primero →</a>
          </div>
        )}

        {/* Atletas sin grupo */}
        {sinGrupo.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ color: '#3A4A70', fontSize: '13px', fontWeight: '600', margin: 0 }}>Sin grupo asignado · {sinGrupo.length}</p>
            </div>
            <div style={{ padding: '12px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {sinGrupo.map(a => (
                <a key={a.id} href={`/athletes/${a.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: 'white' }}>
                    {a.first_name[0]}{a.last_name[0]}
                  </div>
                  <span style={{ color: '#4A5580', fontSize: '12px' }}>{a.first_name} {a.last_name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
