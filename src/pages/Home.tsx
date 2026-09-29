import { Link } from 'react-router-dom'
import { creator, services, site } from '../content/config'
import { photoCategories, videoCategories } from '../content/categories'
import { allVideoWorks } from '../content/works'
import { usePageMeta } from '../lib/seo'
import { HeroReel } from '../components/HeroReel'
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
  const heroWorks = [allVideoWorks[4], allVideoWorks[0], allVideoWorks[7]].filter(Boolean)
  const featured = allVideoWorks.filter((w) => !heroWorks.includes(w)).slice(0, 6)
  const player = useVideoPlayer(allVideoWorks)

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-20%] right-[-10%] size-[70vw] max-w-[1100px] rounded-full bg-[radial-gradient(closest-side,rgba(200,178,138,0.09),transparent)]"
        />
        <div className="container-x relative grid min-h-[100svh] items-center gap-14 pt-28 pb-16 lg:grid-cols-12 lg:gap-10 lg:pt-24">
          <div className="lg:col-span-7 xl:col-span-6">
            <Reveal>
              <p className="eyebrow">Produção audiovisual · Fotografia · Conteúdo estratégico</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display mt-7 text-[clamp(2.9rem,6.5vw,6.6rem)]">
                Histórias que ganham vida.{' '}
                <span className="text-paper/60">
                  Marcas que deixam <span className="serif-accent text-paper">sua marca.</span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={180} className="mt-9 max-w-lg">
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
          <Reveal
            delay={200}
            className="mx-auto w-full max-w-[560px] lg:col-span-5 lg:max-w-none xl:col-span-6 xl:pl-8"
          >
            <HeroReel works={heroWorks} onOpen={player.open} />
          </Reveal>
        </div>
        <div className="container-x text-mute relative hidden items-center justify-between pb-8 text-xs lg:flex">
          <span>{site.name}</span>
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
                Imagens que <span className="serif-accent">abrem o apetite</span>
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
        <div className="container-x grid gap-14 py-24 md:grid-cols-12 md:py-36">
          <Reveal className="md:col-span-5">
            <p className="eyebrow flex items-center gap-3">
              <span className="text-paper">02</span>
              <span className="h-px w-8 bg-white/25" aria-hidden="true" />
              Creator
            </p>
            <h2 id="creator" className="mt-8 font-serif text-[clamp(4.5rem,12vw,10rem)] leading-[0.85] italic">
              {creator.name}
            </h2>
            <p className="text-mute mt-6 text-sm tracking-wide">{creator.role}</p>
          </Reveal>
          <div className="md:col-span-6 md:col-start-7 md:pt-16">
            <Reveal>
              <p className="text-2xl leading-snug font-medium tracking-tight md:text-3xl">{creator.intro}</p>
              <p className="text-soft mt-6 leading-relaxed">{creator.body[0]}</p>
            </Reveal>
            <Reveal delay={120}>
              <dl className="mt-12 grid grid-cols-3 border-t border-white/10">
                {creator.facts.map((f) => (
                  <div
                    key={f.label}
                    className="border-r border-white/10 pt-5 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4"
                  >
                    <dt className="text-mute text-xs">{f.label}</dt>
                    <dd className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <Link to="/sobre" className="link-underline mt-12 inline-flex items-center gap-2 text-sm">
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
        <ul className="mt-16 grid gap-px border-y border-white/10 bg-white/10 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.title} className="bg-ink py-9 md:p-8 lg:p-10">
              <Reveal delay={(i % 3) * 80}>
                <span className="text-mute text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">{s.title}</h3>
                <p className="text-soft mt-3 max-w-sm leading-relaxed">{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
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
