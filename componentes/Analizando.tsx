import type { Problema, Run } from '@/lib/tipos'
import { NOMBRE_EJE } from '@/lib/tipos'

const PASOS = [
  { estado: 'bajando', texto: 'Bajando tu código' },
  { estado: 'revisando', texto: 'Revisando los archivos' },
  { estado: 'levantando', texto: 'Levantando tu app' },
  { estado: 'probando', texto: 'Probándola en celular y en compu' },
  { estado: 'armando_plan', texto: 'Armando tu plan' },
]

const ORDEN = ['en_cola', 'bajando', 'revisando', 'levantando', 'probando', 'armando_plan', 'listo']

export function Analizando({ run }: { run: Run }) {
  const actual = ORDEN.indexOf(run.estado)
  const problemas: Problema[] = run.resultado?.problemas ?? []

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Analizando tu app</h1>
      <p className="mt-3 text-[#b9b4cd]">{run.repo_url.replace('https://github.com/', '')}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <ol className="panel space-y-1 p-7">
          {PASOS.map((p, i) => {
            const indice = ORDEN.indexOf(p.estado)
            const hecho = actual > indice
            const enCurso = actual === indice
            return (
              <li key={p.estado} className="flex items-center gap-3.5 py-3">
                <Marca hecho={hecho} enCurso={enCurso} />
                <span className={hecho || enCurso ? 'text-[#ece9f6]' : 'text-tenue'}>
                  {p.texto}
                </span>
                <span className="ml-auto text-xs text-tenue">
                  {hecho ? 'Completado' : enCurso ? 'En proceso' : 'Pendiente'}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="panel p-7">
          <h2 className="font-medium">Problemas encontrados</h2>
          {problemas.length === 0 ? (
            <p className="mt-5 text-sm leading-relaxed text-tenue">
              Todavía no encontramos nada. Van a ir apareciendo acá a medida que revisamos.
            </p>
          ) : (
            <ul className="mt-5 space-y-3.5">
              {problemas.map((p) => (
                <li key={p.id} className="border-b border-borde pb-3.5 last:border-0">
                  <p className="text-[15px] leading-snug">{p.titulo}</p>
                  <p className="mt-1.5 text-xs text-tenue">{NOMBRE_EJE[p.eje]}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 border-t border-borde pt-5 text-xs leading-relaxed text-tenue">
            Los problemas van apareciendo a medida que los encontramos.
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-tenue">
        {run.paso ? `Ahora: ${run.paso}. ` : ''}
        Esto tarda entre 2 y 4 minutos. Podés dejar la pestaña abierta.
      </p>
    </main>
  )
}

function Marca({ hecho, enCurso }: { hecho: boolean; enCurso: boolean }) {
  if (hecho) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-acento/20">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m5 13 4 4L19 7" stroke="#a78bfa" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (enCurso) {
    return (
      <span className="flex h-6 w-6 items-center justify-center">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-acento border-t-transparent" />
      </span>
    )
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-borde" />
    </span>
  )
}
