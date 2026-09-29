import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/seo'
import { navItems } from '../components/Header'
import { ArrowRight } from '../components/Icons'

export default function NotFound() {
  usePageMeta({ title: 'Página não encontrada', path: '/404', noindex: true })
  return (
    <section className="container-x flex min-h-[85svh] flex-col justify-center pt-32 pb-20">
      <p className="eyebrow">Erro 404</p>
      <h1 className="display mt-6 text-[clamp(3rem,10vw,9rem)]">
        Cena <span className="serif-accent">cortada</span>.
      </h1>
      <p className="text-soft mt-8 max-w-md text-lg">A página que você procura não existe ou mudou de endereço.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-primary">
          Voltar ao início <ArrowRight />
        </Link>
        <Link to="/videos" className="btn btn-ghost">
          Ver portfólio
        </Link>
      </div>
      <nav aria-label="Páginas do site" className="mt-16 border-t border-white/10 pt-6">
        <ul className="text-mute flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {navItems.map((n) => (
            <li key={n.to}>
              <Link to={n.to} className="link-underline hover:text-paper">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
