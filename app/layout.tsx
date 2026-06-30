import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from './components/ServiceWorkerRegister'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AthleteOS',
  description: 'El sistema operativo de tu club deportivo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#0A0A0A]`}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}