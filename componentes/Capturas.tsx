import type { Captura } from '@/lib/tipos'

// Las capturas son la prueba de que abrimos la app de verdad. La de celular es la que
// convence: se ve el recorte, no hay que explicarlo.
export function Capturas({ capturas }: { capturas: Captura[] }) {
  const verdaderas = capturas.filter((c) => c.url.startsWith('http'))
  if (verdaderas.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">Así se ve tu app</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[#b9b4cd]">
        La abrimos de verdad, no la miramos por arriba. Esto es lo que ve alguien que entra.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {verdaderas.map((c) => (
          <figure key={`${c.ruta}-${c.pantalla}`} className="panel overflow-hidden p-0">
            <img
              src={c.url}
              alt={`${c.ruta} en ${c.pantalla}`}
              loading="lazy"
              className="block max-h-72 w-full object-cover object-top"
            />
            <figcaption className="border-t border-borde px-4 py-3 text-xs text-tenue">
              {c.ruta} · en {c.pantalla}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
