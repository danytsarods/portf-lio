import { photoCategories } from '../content/categories'
import { usePageMeta } from '../lib/seo'
import { PageHero } from '../components/SectionHeading'
import { CategoryIndex } from '../components/CategoryIndex'
import { CallToAction } from '../components/CallToAction'

export default function Photography() {
  usePageMeta({
    title: 'Fotografia',
    path: '/fotografia',
    description: 'Fotografia profissional da RODS AUDIOVISUAL: moda, restaurantes, newborn, 15 anos e gestante.',
  })
  return (
    <>
      <PageHero
        eyebrow="Portfólio · Fotografia"
        title={
          <>
            Foto<span className="serif-accent">grafia</span>
          </>
        }
        intro="Ensaios e produções fotográficas com direção, luz e tratamento cuidadosos — de campanhas de moda aos primeiros dias de vida."
      />
      <section className="container-x pb-24 md:pb-36" aria-label="Categorias de fotografia">
        <CategoryIndex categories={photoCategories} size="lg" />
      </section>
      <CallToAction
        eyebrow="Ensaios"
        title={
          <>
            Vamos marcar o <span className="serif-accent">seu</span> ensaio?
          </>
        }
      />
    </>
  )
}
