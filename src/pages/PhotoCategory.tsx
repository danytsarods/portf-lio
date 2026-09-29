import { Link, useParams } from 'react-router-dom'
import { categoryPath, photoCategories } from '../content/categories'
import { findPhotoCategory, photoWorks } from '../content/works'
import { usePageMeta } from '../lib/seo'
import { PageHero, EmptyState } from '../components/SectionHeading'
import { PhotoGallery } from '../components/PhotoGallery'
import { BudgetLink, CallToAction } from '../components/CallToAction'
import { ArrowLeftLink, NeighborNav } from '../components/NeighborNav'
import NotFound from './NotFound'

export default function PhotoCategory() {
  const { slug } = useParams()
  const category = findPhotoCategory(slug)
  const photos = (category && photoWorks[category.slug]) || []
  usePageMeta({
    title: category ? `${category.title} · Fotografia` : 'Página não encontrada',
    path: category ? categoryPath(category) : '/404',
    description: category?.intro,
    image: photos[0]?.src,
    noindex: !category,
  })
  if (!category) return <NotFound />
  const topic = `fotografia de ${category.title.toLowerCase()}`

  return (
    <>
      <PageHero
        eyebrow={<ArrowLeftLink to="/fotografia" label="Fotografia" current={category.kicker} />}
        title={category.title}
        intro={category.intro}
      >
        <div className="text-mute flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6 text-sm">
          <span>{photos.length > 0 ? `${photos.length} fotos` : 'Galeria em atualização'}</span>
          <span className="ml-auto">
            <BudgetLink topic={topic} className="btn btn-primary !py-2.5 text-[13px]">
              Agendar ensaio
            </BudgetLink>
          </span>
        </div>
      </PageHero>
      <section className="container-x pb-24 md:pb-32">
        {photos.length > 0 ? (
          <PhotoGallery photos={photos} label={`Fotos de ${category.title}`} />
        ) : (
          <EmptyState
            title="Galeria em atualização"
            text={`As fotos de ${category.title.toLowerCase()} estão sendo selecionadas e entram no portfólio em breve. Para saber mais sobre este tipo de ensaio, fale com a gente.`}
          >
            <BudgetLink topic={topic} />
            <Link to="/fotografia" className="btn btn-ghost">
              Outras categorias
            </Link>
          </EmptyState>
        )}
      </section>
      <NeighborNav categories={photoCategories} current={category.slug} />
      <CallToAction
        topic={topic}
        eyebrow={category.title}
        title={
          <>
            Vamos criar <span className="serif-accent">juntos</span>?
          </>
        }
      />
    </>
  )
}
