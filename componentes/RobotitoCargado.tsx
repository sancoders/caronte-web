'use client'

import dynamic from 'next/dynamic'

// three pesa, y el robotito no puede demorar la pantalla que la persona vino a ver.
// Se carga aparte, despues, y nunca en el servidor.
export const RobotitoCargado = dynamic(
  () => import('./Robotito').then((m) => m.Robotito),
  { ssr: false },
)
