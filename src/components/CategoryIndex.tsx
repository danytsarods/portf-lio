import { Link } from 'react-router-dom'
import type { Category } from '../content/categories'
import { categoryPath } from '../content/categories'
import { coverFor, photoWorks, videoWorks } from '../content/works'
import { ArrowUpRight } from './Icons'
import { MediaImage } from './MediaImage'

const countFor = (c: Category) => (c.kind === 'videos' ? videoWorks[c.slug]?.length : photoWorks[c.slug]?.length) ?? 0

/** Índice editorial de categorias (substitui os antigos círculos). */
export function CategoryIndex({ categories, size = 'md' }: { categories: Category[]; size?: 'md' | 'lg' }) {
  return (
    <ul className="border-t border-white/10">
      {categories.map((c, i) => {
        const count = countFor(c)
        const cover = coverFor(c)
        return (
          <li key={c.slug} className="border-b border-white/10">
            <Link
              to={categoryPath(c)}
              className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-4 py-5 sm:grid-cols-[3rem_1fr_auto_auto] sm:gap-x-8 md:py-7"
            >
              <span className="text-mute text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0">
                <span
                  className={`block font-semibold tracking-[-0.03em] transition-transform duration-700 ease-[var(--ease-cine)] group-hover:translate-x-2 ${
                    size === 'lg'
                      ? 'text-[clamp(2rem,6vw,4.5rem)] leading-[1]'
                      : 'text-[clamp(1.6rem,3.6vw,2.6rem)] leading-[1.05]'
                  }`}
                >
                  {c.title}
                </span>
                <span className="text-mute mt-1.5 block text-sm">{c.kicker}</span>
              </span>
              <span className="text-mute hidden text-right text-xs sm:block">
                {count > 0
                  ? `${count} ${c.kind === 'videos' ? (count === 1 ? 'vídeo' : 'vídeos') : 'fotos'}`
                  : 'Em atualização'}
              </span>
              <span className="flex items-center gap-4">
                {cover ? (
                  <MediaImage
                    src={cover}
                    alt=""
                    className="hidden aspect-[4/5] w-12 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block"
                  />
                ) : (
                  <span className="hidden w-12 md:block" aria-hidden="true" />
                )}
                <ArrowUpRight className="text-mute group-hover:text-paper size-5 transition-[color,transform] duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
