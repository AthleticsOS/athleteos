'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print"
      style={{padding:"9px 20px", borderRadius:"9px", background:"linear-gradient(135deg,#4BA3D9,#4BA3D9)", color:"white", fontSize:"13px", fontWeight:"600", border:"none", cursor:"pointer", boxShadow:"0 0 16px rgba(75,163,217,0.3)"}}>
      Descargar PDF
    </button>
  )
}
