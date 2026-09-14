import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Caronte · de tu repo a tu app publicada',
  description:
    'Pegá el link de tu repo y te decimos qué le falta para que tu app se publique. Te armamos el plan y tenés una IA al lado.',
  openGraph: {
    title: 'Caronte · de tu repo a tu app publicada',
    description: 'Tu app vibecodeada, a producción.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  )
}
