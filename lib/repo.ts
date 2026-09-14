// Lo que sabemos de un link de GitHub antes de tocar nada.
export function parsearRepo(url: string) {
  const limpio = url.trim().replace(/\.git$/, '').replace(/\/+$/, '')
  const m = limpio.match(/^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)$/i)
  if (!m) return null
  return { duenio: m[1], nombre: m[2], url: `https://github.com/${m[1]}/${m[2]}` }
}

export type ChequeoRepo =
  | { ok: true; url: string; nombre: string }
  | { ok: false; motivo: 'formato' | 'no_existe' | 'privado' | 'sin_conexion' }

// GitHub contesta 404 tanto si el repo no existe como si es privado y no estamos
// logueados, asi que no podemos distinguirlos. Lo decimos de las dos formas.
export async function chequearRepo(url: string): Promise<ChequeoRepo> {
  const r = parsearRepo(url)
  if (!r) return { ok: false, motivo: 'formato' }
  try {
    const resp = await fetch(`https://api.github.com/repos/${r.duenio}/${r.nombre}`, {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-store',
    })
    if (resp.status === 404) return { ok: false, motivo: 'privado' }
    if (!resp.ok) return { ok: false, motivo: 'sin_conexion' }
    return { ok: true, url: r.url, nombre: r.nombre }
  } catch {
    return { ok: false, motivo: 'sin_conexion' }
  }
}

export const MOTIVO: Record<string, string> = {
  formato:
    'Ese link no parece de GitHub. Tiene que ser del estilo github.com/tu-usuario/tu-app.',
  no_existe: 'No encontramos ese repositorio.',
  privado:
    'No pudimos entrar a ese repositorio: o no existe, o está en privado. Si es tuyo y está en privado, ponelo en público desde Settings y volvé a probar.',
  sin_conexion: 'No pudimos consultarle a GitHub. Probá de nuevo en un minuto.',
}
