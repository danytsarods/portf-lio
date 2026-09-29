import { Link, useSearchParams } from 'react-router-dom'
import { videoCategories, categoryPath } from '../content/categories'
import { allVideoWorks, videoWorks } from '../content/works'
import { usePageMeta } from '../lib/seo'
import { PageHero, EmptyState } from '../components/SectionHeading'
import { VideoCard } from '../components/VideoCard'
import { useVideoPlayer } from '../components/VideoModal'
import { Reveal } from '../components/Reveal'
import { CategoryIndex } from '../components/CategoryIndex'
import { BudgetLink, CallToAction } from '../components/CallToAction'
import { ArrowRight } from '../components/Icons'

export default function Videos() {
  usePageMeta({
    title: 'Vídeos',
    path: '/videos',
    description: 'Portfólio de vídeos da RODS AUDIOVISUAL: gastronomia, eventos, estética, influencer, gym e moda.',
  })
  const [params, setParams] = useSearchParams()
  const active = videoCategories.find((c) => c.slug === params.get('categoria'))
  const works = active ? (videoWorks[active.slug] ?? []) : allVideoWorks
  const player = useVideoPlayer(works)

  const select = (slug?: string) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        if (slug) n.set('categoria', slug)
        else n.delete('categoria')
        n.delete('assistir')
        return n
      },
      { preventScrollReset: true, replace: true },
    )

  const chip = (selected: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
      selected ? 'border-paper bg-paper text-ink' : 'border-white/15 text-soft hover:border-white/50 hover:text-paper'
    }`

  return (
    <>
      <PageHero
        eyebrow="Portfólio · Vídeo"
        title={
          <>
            Vídeos<span className="serif-accent text-paper/50">.</span>
          </>
        }
        intro="Produções verticais e horizontais para marcas, negócios e pessoas. Escolha uma categoria ou assista a tudo."
      />

      <section className="container-x pb-24 md:pb-32" aria-label="Trabalhos em vídeo">
        <div className="bg-ink/85 sticky top-[72px] z-20 -mx-4 mb-10 border-b border-white/[0.07] px-4 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div
            role="group"
            aria-label="Filtrar por categoria"
            className="flex [scrollbar-width:none] gap-2 overflow-x-auto"
          >
            <button type="button" aria-pressed={!active} onClick={() => select()} className={chip(!active)}>
              Todos <span className="text-xs opacity-60">{allVideoWorks.length}</span>
            </button>
            {videoCategories.map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={active?.slug === c.slug}
                onClick={() => select(c.slug)}
                className={`${chip(active?.slug === c.slug)} shrink-0`}
              >
                {c.title}
                {!!videoWorks[c.slug]?.length && (
                  <span className="text-xs opacity-60">{videoWorks[c.slug].length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {works.length} {works.length === 1 ? 'vídeo' : 'vídeos'} {active ? `em ${active.title}` : 'no total'}
        </p>

        {active && (
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">{active.title}</h2>
              <p className="text-soft mt-2 max-w-xl">{active.intro}</p>
            </div>
            <Link to={categoryPath(active)} className="link-underline inline-flex shrink-0 items-center gap-2 text-sm">
              Página da categoria <ArrowRight />
            </Link>
          </div>
        )}

        {works.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {works.map((w, i) => (
              <li
                key={w.id}
                className={w.orientation === 'horizontal' ? 'col-span-2' : i % 4 === 1 || i % 4 === 3 ? 'lg:mt-16' : ''}
              >
                <Reveal delay={(i % 4) * 70}>
                  <VideoCard
                    work={w}
                    onOpen={player.open}
                    sizes={
                      w.orientation === 'horizontal'
                        ? '(min-width: 1024px) 50vw, 100vw'
                        : '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'
                    }
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title={`${active?.title ?? 'Vídeos'}: seleção em atualização`}
            text="Os trabalhos desta categoria estão sendo organizados e entram no portfólio em breve. Enquanto isso, veja outras produções ou fale com a gente."
          >
            <button type="button" onClick={() => select()} className="btn btn-ghost">
              Ver todos os vídeos
            </button>
            <BudgetLink />
          </EmptyState>
        )}
      </section>

      <section className="bg-coal border-t border-white/[0.07]">
        <div className="container-x py-24 md:py-32">
          <Reveal>
            <p className="eyebrow">Categorias</p>
          </Reveal>
          <div className="mt-10">
            <CategoryIndex categories={videoCategories} size="lg" />
          </div>
        </div>
      </section>
      <CallToAction />
      {player.modal}
    </>
  )
}
