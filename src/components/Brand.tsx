export function Brand({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 leading-none tracking-[0.18em] ${className}`}>
      <span className="font-semibold">RODS</span>
      <span className="text-soft font-light">AUDIOVISUAL</span>
    </span>
  )
}
