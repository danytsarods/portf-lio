import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'
import { Reveal } from '../components/Reveal'
import { ContactChannels } from '../components/ContactChannels'
import { ArrowRight } from '../components/Icons'

export default function Contact() {
  usePageMeta({
    title: 'Contato',
    path: '/contato',
    description: 'Fale com a RODS AUDIOVISUAL sobre o seu projeto de vídeo, fotografia ou conteúdo para redes.',
  })
  return (
    <section className="container-x grid min-h-[90svh] gap-14 pt-36 pb-24 md:pt-48 lg:grid-cols-12">
      <Reveal className="lg:col-span-7">
        <p className="eyebrow">Contato</p>
        <h1 className="display mt-6 text-[clamp(3.2rem,9vw,8.5rem)]">
          Vamos criar <span className="serif-accent">juntos</span>.
        </h1>
        <p className="text-soft mt-10 max-w-lg text-lg leading-relaxed">
          Conte o que você precisa — um vídeo institucional, conteúdos para Reels, um ensaio fotográfico ou a cobertura
          de um evento. A conversa começa direto com a gente.
        </p>
      </Reveal>
      <Reveal delay={150} className="lg:col-span-5 lg:pt-40">
        <h2 className="eyebrow mb-6">Canais diretos</h2>
        <ContactChannels />
        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link to="/videos" className="link-underline inline-flex items-center gap-2">
            Ver vídeos <ArrowRight />
          </Link>
          <Link to="/fotografia" className="link-underline inline-flex items-center gap-2">
            Ver fotografia <ArrowRight />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
