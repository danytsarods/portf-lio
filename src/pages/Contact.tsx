import { Link } from 'react-router-dom'
import { photos } from '../content/photos'
import { usePageMeta } from '../lib/seo'
import { Reveal } from '../components/Reveal'
import { Photo } from '../components/Photo'
import { ContactChannels } from '../components/ContactChannels'
import { ArrowRight } from '../components/Icons'

export default function Contact() {
  usePageMeta({
    title: 'Contato',
    path: '/contato',
    description: 'Fale com a RODS AUDIOVISUAL sobre o seu projeto de vídeo, fotografia ou conteúdo para redes.',
  })
  return (
    <section className="bg-black">
      <div className="container-x grid gap-14 pt-32 pb-24 md:pt-44 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">Contato</p>
            <h1 className="display mt-6 text-[clamp(3.2rem,8.5vw,8rem)]">
              Vamos criar <span className="serif-accent">juntos</span>.
            </h1>
            <p className="text-soft mt-10 max-w-lg text-lg leading-relaxed">
              Conte o que você precisa — um vídeo institucional, conteúdos para Reels, um ensaio fotográfico ou a
              cobertura de um evento. A conversa começa direto com a gente.
            </p>
          </Reveal>
          <Reveal delay={150} className="mt-14 max-w-xl">
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
        </div>
        <Reveal delay={200} className="lg:col-span-5">
          <Photo
            photo={photos['creator-estudio-escuro']}
            sizes="(min-width: 1024px) 38vw, (min-width: 640px) 70vw, 100vw"
            className="mx-auto w-full max-w-md lg:max-w-none"
          />
        </Reveal>
      </div>
    </section>
  )
}
