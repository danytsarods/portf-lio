import { Link } from 'react-router-dom'
import { services } from '../content/config'
import { usePageMeta } from '../lib/seo'
import { PageHero } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { CallToAction } from '../components/CallToAction'
import { ArrowRight } from '../components/Icons'

const related: Record<string, { to: string; label: string }> = {
  'Fotografia profissional': { to: '/fotografia', label: 'Ver fotografia' },
  'Conteúdos para Reels': { to: '/videos', label: 'Ver vídeos' },
}

export default function Services() {
  usePageMeta({
    title: 'Serviços',
    path: '/servicos',
    description:
      'Vídeos institucionais, fotografia profissional, conteúdos para Reels, stop motion e lifestyle, imagens com drone, making of e bastidores.',
  })
  return (
    <>
      <PageHero
        eyebrow="Serviços"
        title={
          <>
            O que a <span className="serif-accent">RODS</span> entrega
          </>
        }
        intro="Produção audiovisual e fotográfica completa, pensada para a comunicação da sua marca — em formatos para site, campanhas e redes sociais."
      />
      <section className="container-x pb-24 md:pb-36">
        <ol className="border-t border-white/10">
          {services.map((s, i) => (
            <li key={s.title} className="border-b border-white/10">
              <Reveal className="grid gap-4 py-10 md:grid-cols-12 md:gap-8 md:py-14">
                <span className="text-mute text-xs tabular-nums md:col-span-1 md:pt-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="text-[clamp(1.9rem,4.4vw,3.6rem)] leading-[1] font-semibold tracking-[-0.03em] md:col-span-6">
                  {s.title}
                </h2>
                <div className="md:col-span-5 md:pt-2">
                  <p className="text-soft max-w-md text-lg leading-relaxed">{s.text}</p>
                  {related[s.title] && (
                    <Link
                      to={related[s.title].to}
                      className="link-underline mt-5 inline-flex items-center gap-2 text-sm"
                    >
                      {related[s.title].label} <ArrowRight />
                    </Link>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>
      <CallToAction
        eyebrow="Orçamento"
        title={
          <>
            Qual formato é o <span className="serif-accent">seu</span>?
          </>
        }
      />
    </>
  )
}
