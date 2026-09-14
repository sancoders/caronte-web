import Link from 'next/link'

// El barquito. Caronte es el barquero que te cruza de una orilla a la otra.
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 15.5c1.6 1.2 3.2 1.2 4.8 0 1.6 1.2 3.2 1.2 4.8 0 1.6 1.2 3.2 1.2 4.8 0 1.2.9 2.4 1.15 3.6.75"
              stroke="#8b5cf6" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4.8 12.4h13.6l-1.9 2.9H6.7l-1.9-2.9Z" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11.6 12.2V4.6l5 4.2-5 1.1" stroke="#ece9f6" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">Caronte</span>
    </span>
  )
}

export function Cabecera({ paso }: { paso?: number }) {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
      <Link href="/" className="transition hover:opacity-80">
        <Logo />
      </Link>
      {paso ? (
        <span className="text-sm text-tenue">{paso} de 5</span>
      ) : (
        <Link href="/antes" className="text-sm text-tenue transition hover:text-[#ece9f6]">
          ¿Qué es esto?
        </Link>
      )}
    </header>
  )
}
