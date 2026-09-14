export function Anillo({ total, sobre }: { total: number; sobre: number }) {
  const r = 62
  const largo = 2 * Math.PI * r
  const proporcion = sobre > 0 ? Math.max(0, Math.min(1, total / sobre)) : 0
  // Rojo abajo, ambar al medio, verde arriba. El color dice el estado de un vistazo.
  const color = proporcion < 0.4 ? '#f87171' : proporcion < 0.7 ? '#fbbf24' : '#4ade80'

  return (
    <div className="relative h-[164px] w-[164px] shrink-0">
      <svg viewBox="0 0 164 164" className="h-full w-full -rotate-90">
        <circle cx="82" cy="82" r={r} fill="none" stroke="#252239" strokeWidth="12" />
        <circle
          cx="82" cy="82" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={largo} strokeDashoffset={largo * (1 - proporcion)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[2.6rem] font-semibold leading-none tracking-tight">{total}</span>
        <span className="mt-1 text-sm text-tenue">de {sobre}</span>
      </div>
    </div>
  )
}
