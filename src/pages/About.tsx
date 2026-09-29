import { Link } from 'react-router-dom'
import { creator } from '../content/config'
import { photos } from '../content/photos'
import { usePageMeta } from '../lib/seo'
import { Reveal } from '../components/Reveal'
import { Photo } from '../components/Photo'
import { CallToAction } from '../components/CallToAction'
import { ArrowRight } from '../components/Icons'

const pillars = [
  'Estratégia',
  'Comunicação',
  'Produção de conteúdo',
  'Posicionamento e branding',
  'Conexão com o público',
]

export default function About() {
  usePageMeta({
    title: 'Sobre',
    path: '/sobre',
    description: `${creator.name}: formação em Marketing, 8 anos na área comercial e 3 anos no audiovisual. Estratégia, comunicação e produção de conteúdo.`,
    image: '/media/site/creator-camera-sorriso-1280.jpg',
  })
  return (
    <>
      <section className="container-x pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col lg:col-span-7">
            <Reveal>
              <p className="eyebrow">Sobre · Creator</p>
              <h1 className="mt-8 font-serif text-[clamp(5rem,15vw,12rem)] leading-[0.82] italic">{creator.name}</h1>
              <p className="text-mute mt-6 text-sm tracking-wide">{creator.role}</p>
            </Reveal>
            <Reveal delay={120} className="mt-12 lg:mt-auto lg:pb-4">
              <p className="max-w-xl text-2xl leading-snug font-medium tracking-tight md:text-[2rem]">
                {creator.intro}
              </p>
            </Reveal>
          </div>
          <Reveal delay={160} className="lg:col-span-5">
            <Photo
              photo={photos['creator-bastidores-tripe']}
              priority
              sizes="(min-width: 1024px) 38vw, (min-width: 640px) 70vw, 100vw"
              className="mx-auto w-full max-w-md lg:max-w-none"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-coal border-t border-white/[0.07]">
        <div className="container-x py-24 md:py-32">
          <Reveal>
            <Photo
              photo={photos['creator-camera-sorriso']}
              sizes="(min-width: 1440px) 1344px, 100vw"
              className="w-full"
            />
          </Reveal>
          <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <p className="eyebrow">Trajetória</p>
            </Reveal>
            <div className="space-y-8 md:col-span-7 md:col-start-6">
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
        </div>
      </section>

      <section className="bg-black">
        <div className="container-x grid items-center gap-12 py-24 md:grid-cols-12 md:py-32">
          <Reveal className="md:col-span-5">
            <Photo
              photo={photos['creator-estudio-escuro']}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="mx-auto w-full max-w-sm md:max-w-none"
            />
          </Reveal>
          <Reveal delay={120} className="md:col-span-6 md:col-start-7">
            <p className="eyebrow">Como pensamos</p>
            <h2 className="display mt-6 text-[clamp(2.2rem,5vw,4.2rem)]">
              Além da <span className="serif-accent">estética</span>
            </h2>
            <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {pillars.map((item, i) => (
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
        </div>
      </section>

      <CallToAction />
    </>
  )
}
