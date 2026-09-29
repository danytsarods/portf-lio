import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { primaryContactHref } from '../content/config'
import { ArrowRight } from './Icons'
import { Reveal } from './Reveal'

export function BudgetLink({
  className = 'btn btn-primary',
  children = 'Solicitar orçamento',
}: {
  className?: string
  children?: ReactNode
}) {
  const external = /^(https?:|mailto:)/.test(primaryContactHref)
  return external ? (
    <a href={primaryContactHref} target="_blank" rel="noreferrer" className={className}>
      {children} <ArrowRight />
    </a>
  ) : (
    <Link to={primaryContactHref} className={className}>
      {children} <ArrowRight />
    </Link>
  )
}

export function CallToAction({
  eyebrow = 'Próximo projeto',
  title = (
    <>
      Vamos contar a <span className="serif-accent">sua</span> história?
    </>
  ),
  text = 'Conte sobre a sua marca, o seu evento ou a ideia que você quer tirar do papel. A gente pensa junto o melhor formato.',
}: {
  eyebrow?: string
  title?: ReactNode
  text?: string
}) {
  return (
    <section className="border-t border-white/[0.07]">
      <div className="container-x py-24 md:py-36">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display mt-6 max-w-5xl text-[clamp(2.6rem,7.5vw,7rem)]">{title}</h2>
        </Reveal>
        <Reveal delay={120} className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="text-soft max-w-md text-base leading-relaxed">{text}</p>
          <div className="flex flex-wrap gap-3">
            <BudgetLink />
            <Link to="/videos" className="btn btn-ghost">
              Ver portfólio
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
