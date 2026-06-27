import Sidebar from '../components/Sidebar'

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main style={{marginLeft:'224px', flex:1, minHeight:'100vh'}}>
        {children}
      </main>
    </div>
  )
}