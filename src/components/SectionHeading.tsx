import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

export function SectionHeading({
  index,
  eyebrow,
  title,
  aside,
  className = '',
}: {
  index?: string
  eyebrow: string
  title: ReactNode
  aside?: ReactNode
  className?: string
}) {
  return (
    <div className={`grid gap-8 md:grid-cols-12 md:items-end ${className}`}>
      <Reveal className="md:col-span-8">
        <p className="eyebrow flex items-center gap-3">
          {index && <span className="text-paper">{index}</span>}
          {index && <span className="h-px w-8 bg-white/25" aria-hidden="true" />}
          {eyebrow}
        </p>
        <h2 className="display mt-5 text-[clamp(2.4rem,6vw,5.25rem)]">{title}</h2>
      </Reveal>
      {aside && (
        <Reveal delay={120} className="md:col-span-4 md:justify-self-end">
          {aside}
        </Reveal>
      )}
    </div>
  )
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: ReactNode
  title: ReactNode
  intro?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="container-x pt-36 pb-14 md:pt-48 md:pb-20">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-6 text-[clamp(3.2rem,11vw,10rem)]">{title}</h1>
      </Reveal>
      {(intro || children) && (
        <Reveal delay={120} className="mt-10 grid gap-8 md:grid-cols-12">
          {intro && <p className="text-soft max-w-xl text-lg leading-relaxed md:col-span-6 md:col-start-7">{intro}</p>}
          {children && <div className="md:col-span-12">{children}</div>}
        </Reveal>
      )}
    </section>
  )
}

export function EmptyState({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden border border-white/10 px-6 py-16 sm:px-12 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full border border-white/[0.06]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -bottom-8 size-40 rounded-full border border-white/[0.06]"
      />
      <p className="eyebrow">Em atualização</p>
      <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      <p className="text-soft mt-4 max-w-lg leading-relaxed">{text}</p>
      {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
    </div>
  )
}
