'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Cabecera } from '@/componentes/Cabecera'
import { Analizando } from '@/componentes/Analizando'
import { Resultado } from '@/componentes/Resultado'
import { supabase } from '@/lib/supabase'
import type { Run, Resultado as Datos } from '@/lib/tipos'
import ejemplo from '@/datos/ejemplo.json'

export default function PaginaRun() {
  const { id } = useParams<{ id: string }>()
  const esDemo = id === 'demo'

  const [run, setRun] = useState<Run | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (esDemo || !supabase) return
    let vivo = true

    async function traer() {
      const { data, error } = await supabase!
        .from('runs').select('*').eq('id', id).single()
      if (!vivo) return
      if (error) { setError('No encontramos ese análisis.'); return }
      setRun(data as Run)
    }

    traer()

    // Realtime para que la pantalla 4 se mueva sola, y un poll cada 2 segundos por si
    // el socket se cae. Vale lo que llegue ultimo.
    const canal = supabase
      .channel(`run-${id}`)
      .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'runs', filter: `id=eq.${id}` },
          (msg) => setRun(msg.new as Run))
      .subscribe()

    const reloj = setInterval(traer, 2000)
    return () => { vivo = false; clearInterval(reloj); supabase!.removeChannel(canal) }
  }, [id, esDemo])

  if (esDemo) {
    return (
      <>
        <Cabecera paso={5} />
        <Resultado datos={ejemplo as unknown as Datos} />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Cabecera />
        <main className="mx-auto max-w-2xl px-5 pt-16">
          <h1 className="text-2xl font-semibold">{error}</h1>
          <p className="mt-3 text-[#b9b4cd]">
            Puede que el link esté mal copiado. Probá de nuevo desde el inicio.
          </p>
        </main>
      </>
    )
  }

  if (!run) {
    return (
      <>
        <Cabecera />
        <main className="mx-auto max-w-2xl px-5 pt-16 text-tenue">Buscando tu análisis…</main>
      </>
    )
  }

  if (run.estado === 'error') {
    return (
      <>
        <Cabecera paso={4} />
        <main className="mx-auto max-w-2xl px-5 pt-16">
          <h1 className="text-2xl font-semibold">Se nos cortó el análisis</h1>
          <p className="mt-3 leading-relaxed text-[#b9b4cd]">
            {run.paso ?? 'No pudimos terminar de revisar tu app.'}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-tenue">
            No tocamos nada de tu app: Caronte solo mira. Podés volver a intentarlo.
          </p>
        </main>
      </>
    )
  }

  if (run.estado !== 'listo' || !run.resultado) {
    return (
      <>
        <Cabecera paso={4} />
        <Analizando run={run} />
      </>
    )
  }

  return (
    <>
      <Cabecera paso={5} />
      <Resultado datos={run.resultado} />
    </>
  )
}
