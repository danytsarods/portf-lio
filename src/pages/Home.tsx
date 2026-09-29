import { Link } from 'react-router-dom'
import { creator, services } from '../content/config'
import { photoCategories, videoCategories } from '../content/categories'
import { allVideoWorks, videoWorks } from '../content/works'
import { usePageMeta } from '../lib/seo'
import { Photo } from '../components/Photo'
import { photos } from '../content/photos'
import { VideoCard } from '../components/VideoCard'
import { useVideoPlayer } from '../components/VideoModal'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { CategoryIndex } from '../components/CategoryIndex'
import { BudgetLink, CallToAction } from '../components/CallToAction'
import { ArrowRight } from '../components/Icons'

// Posições da grade assimétrica de destaques (desktop)
const featuredLayout = [
  'md:col-span-4',
  'md:col-span-3 md:col-start-6 md:mt-32',
  'md:col-span-3 md:col-start-10 md:mt-8',
  'md:col-span-3 md:col-start-2 md:mt-10',
  'md:col-span-4 md:col-start-6 md:mt-36',
  'md:col-span-2 md:col-start-11 md:mt-10',
]

export default function Home() {
  usePageMeta({ path: '/' })
  // um trabalho vertical de cada categoria (completa com outros se faltar)
  const firsts = videoCategories
    .map((c) => videoWorks[c.slug]?.find((w) => w.orientation === 'vertical'))
    .filter(Boolean) as typeof allVideoWorks
  const featured = [
    ...firsts,
    ...allVideoWorks.filter((w) => w.orientation === 'vertical' && !firsts.includes(w)),
  ].slice(0, 6)
  const player = useVideoPlayer(allVideoWorks)

  return (
    <>
      {/* HERO — retrato em estúdio escuro; o texto nunca fica sobre o rosto */}
      <section className="relative overflow-hidden bg-black">
        {/* celular/tablet: foto no topo com a base esmaecendo para o texto */}
        <Photo
          photo={photos['creator-estudio-escuro']}
          mode="fill"
          priority
          sizes="100vw"
          className="mt-14 h-[62svh] min-h-[420px] w-full [mask-image:linear-gradient(to_bottom,black_55%,transparent)] lg:hidden"
        />
        {/* desktop: foto ocupando a metade direita, fundindo com o preto à esquerda */}
        <Photo
          photo={photos['creator-estudio-escuro']}
          mode="fill"
          priority
          sizes="55vw"
          className="absolute inset-y-0 right-0 hidden w-[55%] [mask-image:linear-gradient(to_right,transparent,black_28%),linear-gradient(to_top,transparent,black_18%)] [mask-composite:intersect] lg:block"
        />
        <div className="container-x relative -mt-28 grid pb-16 sm:-mt-36 lg:mt-0 lg:min-h-[100svh] lg:grid-cols-12 lg:items-center lg:pt-28 lg:pb-24">
          <div className="lg:col-span-7 xl:col-span-6">
            <Reveal>
              <p className="eyebrow">Produção audiovisual · Fotografia · Conteúdo estratégico</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display mt-6 text-[clamp(2.8rem,6.2vw,6.4rem)] lg:mt-7">
                Histórias que ganham vida.{' '}
                <span className="text-paper/60">
                  Marcas que deixam <span className="serif-accent text-paper">sua marca.</span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={180} className="mt-8 max-w-lg lg:mt-9">
              <p className="text-soft text-lg leading-relaxed">
                A RODS AUDIOVISUAL cria vídeos, fotografias e conteúdos estratégicos que traduzem a essência de cada
                marca em imagens feitas para serem lembradas.
              </p>
            </Reveal>
            <Reveal delay={260} className="mt-10 flex flex-wrap gap-3">
              <Link to="/videos" className="btn btn-primary">
                Explorar portfólio <ArrowRight />
              </Link>
              <BudgetLink className="btn btn-ghost" />
            </Reveal>
          </div>
        </div>
        <div className="container-x text-mute relative hidden items-center justify-between pb-8 text-xs lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex">
          <span>
            {creator.name} · {creator.role}
          </span>
          <span className="flex items-center gap-3">
            Role para ver <span className="h-px w-10 bg-white/25" aria-hidden="true" />
          </span>
        </div>
      </section>

      {/* TRABALHOS SELECIONADOS */}
      {featured.length > 0 && (
        <section className="container-x py-24 md:py-36" aria-labelledby="destaques">
          <SectionHeading
            index="01"
            eyebrow="Trabalhos selecionados"
            title={
              <span id="destaques">
                Histórias em <span className="serif-accent">movimento</span>
              </span>
            }
            aside={
              <Link to="/videos" className="link-underline inline-flex items-center gap-2 text-sm">
                Ver todos os vídeos <ArrowRight />
              </Link>
            }
          />
          <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-24 md:grid-cols-12 md:gap-x-6">
            {featured.map((w, i) => (
              <li key={w.id} className={featuredLayout[i]}>
                <Reveal delay={(i % 3) * 90}>
                  <VideoCard work={w} onOpen={player.open} sizes="(min-width: 768px) 33vw, 50vw" />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CREATOR */}
      <section className="bg-coal border-t border-white/[0.07]" aria-labelledby="creator">
        <div className="container-x grid gap-12 py-24 md:py-32 lg:grid-cols-12 lg:gap-10 lg:py-36">
          <Reveal className="lg:col-span-7">
            <Photo
              photo={photos['creator-camera-sorriso']}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="w-full"
            />
          </Reveal>
          <div className="lg:col-span-5 lg:flex lg:flex-col lg:justify-center lg:pl-6">
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="text-paper">02</span>
                <span className="h-px w-8 bg-white/25" aria-hidden="true" />
                Creator
              </p>
              <h2 id="creator" className="mt-6 font-serif text-[clamp(4rem,9vw,7.5rem)] leading-[0.85] italic">
                {creator.name}
              </h2>
              <p className="text-mute mt-4 text-sm tracking-wide">{creator.role}</p>
              <p className="mt-8 text-xl leading-snug font-medium tracking-tight md:text-2xl">{creator.intro}</p>
              <p className="text-soft mt-5 leading-relaxed">{creator.body[0]}</p>
            </Reveal>
            <Reveal delay={120}>
              <dl className="mt-10 grid grid-cols-3 border-t border-white/10">
                {creator.facts.map((f) => (
                  <div
                    key={f.label}
                    className="border-r border-white/10 pt-5 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4"
                  >
                    <dt className="text-mute text-xs">{f.label}</dt>
                    <dd className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <Link to="/sobre" className="link-underline mt-10 inline-flex items-center gap-2 text-sm">
                Conhecer a creator <ArrowRight />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="container-x py-24 md:py-36" aria-labelledby="servicos">
        <SectionHeading
          index="03"
          eyebrow="Serviços"
          title={
            <span id="servicos">
              Do roteiro à <span className="serif-accent">última cena</span>
            </span>
          }
          aside={
            <Link to="/servicos" className="link-underline inline-flex items-center gap-2 text-sm">
              Todos os serviços <ArrowRight />
            </Link>
          }
        />
        <div className="mt-16 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-4">
            <figure className="lg:sticky lg:top-28">
              <Photo
                photo={photos['creator-bastidores-tripe']}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 60vw, 100vw"
                className="mx-auto w-full max-w-md lg:max-w-none"
              />
              <figcaption className="text-mute mt-4 flex items-center gap-3 text-xs">
                <span className="h-px w-6 bg-white/25" aria-hidden="true" />
                Bastidores · luz, câmera e direção no set
              </figcaption>
            </figure>
          </Reveal>
          <ul className="grid content-start gap-px border-y border-white/10 bg-white/10 md:grid-cols-2 lg:col-span-8">
            {services.map((s, i) => (
              <li key={s.title} className="bg-ink py-9 md:p-8 lg:p-9">
                <Reveal delay={(i % 2) * 80}>
                  <span className="text-mute text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="text-soft mt-3 max-w-sm leading-relaxed">{s.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="bg-coal border-t border-white/[0.07]" aria-labelledby="categorias">
        <div className="container-x py-24 md:py-36">
          <SectionHeading
            index="04"
            eyebrow="Portfólio"
            title={
              <span id="categorias">
                Vídeo e <span className="serif-accent">fotografia</span>
              </span>
            }
          />
          <div className="mt-16 grid gap-16 md:mt-20 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <div className="mb-6 flex items-baseline justify-between">
                <h3 className="text-sm font-medium">Vídeos</h3>
                <Link to="/videos" className="link-underline text-mute hover:text-paper text-xs">
                  Ver página
                </Link>
              </div>
              <CategoryIndex categories={videoCategories} />
            </Reveal>
            <Reveal delay={120}>
              <div className="mb-6 flex items-baseline justify-between">
                <h3 className="text-sm font-medium">Fotografia</h3>
                <Link to="/fotografia" className="link-underline text-mute hover:text-paper text-xs">
                  Ver página
                </Link>
              </div>
              <CategoryIndex categories={photoCategories} />
            </Reveal>
          </div>
        </div>
      </section>

      <CallToAction />
      {player.modal}
    </>
  )
}
