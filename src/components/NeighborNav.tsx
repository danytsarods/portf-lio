import { Link } from 'react-router-dom'
import type { Category } from '../content/categories'
import { categoryPath } from '../content/categories'
import { ChevronLeft } from './Icons'

export function ArrowLeftLink({ to, label, current }: { to: string; label: string; current: string }) {
  return (
    <span className="flex flex-wrap items-center gap-3">
      <Link to={to} className="text-paper inline-flex items-center gap-1.5 hover:underline">
        <ChevronLeft className="size-3.5" /> {label}
      </Link>
      <span className="h-px w-6 bg-white/25" aria-hidden="true" />
      <span>{current}</span>
    </span>
  )
}

/** Navegação para a categoria anterior/seguinte. */
export function NeighborNav({ categories, current }: { categories: Category[]; current: string }) {
  const i = categories.findIndex((c) => c.slug === current)
  const prev = categories[(i - 1 + categories.length) % categories.length]
  const next = categories[(i + 1) % categories.length]
  return (
    <nav aria-label="Outras categorias" className="border-t border-white/[0.07]">
      <div className="container-x grid grid-cols-2">
        <Link to={categoryPath(prev)} className="group border-r border-white/[0.07] py-10 pr-4 md:py-14">
          <span className="eyebrow">Anterior</span>
          <span className="mt-3 block text-[clamp(1.4rem,3.4vw,2.8rem)] font-semibold tracking-tight transition-transform duration-500 group-hover:-translate-x-1">
            {prev.title}
          </span>
        </Link>
        <Link to={categoryPath(next)} className="group py-10 pl-4 text-right md:py-14">
          <span className="eyebrow">Próxima</span>
          <span className="mt-3 block text-[clamp(1.4rem,3.4vw,2.8rem)] font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1">
            {next.title}
          </span>
        </Link>
      </div>
    </nav>
  )
}
