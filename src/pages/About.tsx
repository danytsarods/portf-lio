import { Link } from 'react-router-dom'
import { creator } from '../content/config'
import { usePageMeta } from '../lib/seo'
import { Reveal } from '../components/Reveal'
import { MediaImage } from '../components/MediaImage'
import { CallToAction } from '../components/CallToAction'
import { ArrowRight } from '../components/Icons'

export default function About() {
  usePageMeta({
    title: 'Sobre',
    path: '/sobre',
    description: `${creator.name}: formação em Marketing, 8 anos na área comercial e 3 anos no audiovisual. Estratégia, comunicação e produção de conteúdo.`,
  })
  const portrait = creator.portrait
  return (
    <>
      <section className="container-x pt-36 pb-20 md:pt-48 md:pb-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow">Sobre · Creator</p>
              <h1 className="mt-8 font-serif text-[clamp(5rem,16vw,13rem)] leading-[0.82] italic">{creator.name}</h1>
              <p className="text-mute mt-6 text-sm tracking-wide">{creator.role}</p>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            {portrait ? (
              <Reveal delay={120}>
                <MediaImage
                  src={portrait.src}
                  alt={portrait.alt}
                  aspect={portrait.width / portrait.height}
                  priority
                  className="w-full"
                  imgClassName="object-[50%_25%]"
                />
              </Reveal>
            ) : (
              <Reveal delay={120} className="lg:pt-24">
                <p className="text-2xl leading-snug font-medium tracking-tight md:text-[2rem]">{creator.intro}</p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section className="bg-coal border-t border-white/[0.07]">
        <div className="container-x grid gap-14 py-24 md:grid-cols-12 md:py-32">
          <Reveal className="md:col-span-4">
            <p className="eyebrow">Trajetória</p>
          </Reveal>
          <div className="space-y-8 md:col-span-7 md:col-start-6">
            {portrait && (
              <Reveal>
                <p className="text-2xl leading-snug font-medium tracking-tight md:text-3xl">{creator.intro}</p>
              </Reveal>
            )}
            {creator.body.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <p className="text-soft text-lg leading-relaxed">{p}</p>
              </Reveal>
            ))}
            <Reveal delay={200}>
              <dl className="grid grid-cols-1 border-t border-white/10 sm:grid-cols-3">
                {creator.facts.map((f) => (
                  <div
                    key={f.label}
                    className="border-b border-white/10 py-6 sm:border-r sm:border-b-0 sm:px-5 sm:first:pl-0 sm:last:border-r-0"
                  >
                    <dt className="text-mute text-xs">{f.label}</dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-tight">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-24 md:grid-cols-12 md:py-32">
        <Reveal className="md:col-span-5">
          <p className="eyebrow">Como pensamos</p>
          <h2 className="display mt-6 text-[clamp(2.2rem,5vw,4.2rem)]">
            Além da <span className="serif-accent">estética</span>
          </h2>
        </Reveal>
        <Reveal delay={120} className="md:col-span-6 md:col-start-7">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {[
              'Estratégia',
              'Comunicação',
              'Produção de conteúdo',
              'Posicionamento e branding',
              'Conexão com o público',
            ].map((item, i) => (
              <li key={item} className="flex items-baseline gap-6 py-5">
                <span className="text-mute text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xl font-medium tracking-tight">{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/servicos" className="link-underline mt-10 inline-flex items-center gap-2 text-sm">
            Ver serviços <ArrowRight />
          </Link>
        </Reveal>
      </section>

      <CallToAction />
    </>
  )
}
