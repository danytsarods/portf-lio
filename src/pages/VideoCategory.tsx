import { Link, useParams } from 'react-router-dom'
import { categoryPath, videoCategories } from '../content/categories'
import { findVideoCategory, videoWorks } from '../content/works'
import { usePageMeta } from '../lib/seo'
import { PageHero, EmptyState } from '../components/SectionHeading'
import { VideoCard } from '../components/VideoCard'
import { useVideoPlayer } from '../components/VideoModal'
import { Reveal } from '../components/Reveal'
import { BudgetLink, CallToAction } from '../components/CallToAction'
import { ArrowLeftLink, NeighborNav } from '../components/NeighborNav'
import NotFound from './NotFound'

export default function VideoCategory() {
  const { slug } = useParams()
  const category = findVideoCategory(slug)
  const works = (category && videoWorks[category.slug]) || []
  const player = useVideoPlayer(works)
  usePageMeta({
    title: category ? `${category.title} · Vídeos` : 'Página não encontrada',
    path: category ? categoryPath(category) : '/404',
    description: category?.intro,
    image: works[0]?.poster,
    noindex: !category,
  })
  if (!category) return <NotFound />

  return (
    <>
      <PageHero
        eyebrow={<ArrowLeftLink to="/videos" label="Vídeos" current={category.kicker} />}
        title={category.title}
        intro={category.intro}
      >
        <div className="text-mute flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6 text-sm">
          <span>
            {works.length > 0
              ? `${works.length} ${works.length === 1 ? 'trabalho' : 'trabalhos'}`
              : 'Seleção em atualização'}
          </span>
          {works.length > 0 && (
            <span>
              Formatos:{' '}
              {[
                ...new Set(works.map((w) => (w.orientation === 'vertical' ? 'vertical 9:16' : 'horizontal 16:9'))),
              ].join(', ')}
            </span>
          )}
          <span className="ml-auto">
            <BudgetLink className="btn btn-primary !py-2.5 text-[13px]">
              Orçamento para {category.title.toLowerCase()}
            </BudgetLink>
          </span>
        </div>
      </PageHero>

      <section className="container-x pb-24 md:pb-32" aria-label={`Trabalhos de ${category.title}`}>
        {works.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
            {works.map((w, i) => (
              <li key={w.id} className={i % 2 === 1 ? 'md:mt-16' : ''}>
                <Reveal delay={(i % 3) * 80}>
                  <VideoCard work={w} onOpen={player.open} priority={i < 3} sizes="(min-width: 768px) 33vw, 50vw" />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Novos trabalhos chegando"
            text={`Os vídeos de ${category.title.toLowerCase()} estão sendo organizados e entram no portfólio em breve. Quer ver o que podemos fazer pela sua marca? Fale com a gente.`}
          >
            <BudgetLink />
            <Link to="/videos" className="btn btn-ghost">
              Ver outros vídeos
            </Link>
          </EmptyState>
        )}
      </section>

      <NeighborNav categories={videoCategories} current={category.slug} />
      <CallToAction
        eyebrow={category.title}
        title={
          <>
            Seu próximo vídeo de <span className="serif-accent">{category.title.toLowerCase()}</span>
          </>
        }
      />
      {player.modal}
    </>
  )
}
