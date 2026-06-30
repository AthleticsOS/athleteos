'use client'
export default function ImprimirButton({ label = '🖨️ PDF' }: { label?: string }) {
  return (
    <button onClick={() => window.print()} style={{ padding: '8px 14px', borderRadius: '9px', backgroundColor: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
      {label}
    </button>
  )
}
