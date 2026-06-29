'use client'

export default function ExportCSV({ data, filename, label }: { data: Record<string,any>[], filename: string, label?: string }) {
  function handleExport() {
    if (!data || data.length === 0) return
    const keys = Object.keys(data[0])
    const csv = [
      keys.join(','),
      ...data.map(row => keys.map(k => {
        const val = row[k] ?? ''
        const str = String(val).replace(/"/g, '""')
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
      }).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleExport} style={{
      padding: '8px 16px', borderRadius: '9px',
      backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
      color: '#10B981', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    }}>
      {label || 'Exportar CSV'}
    </button>
  )
}
