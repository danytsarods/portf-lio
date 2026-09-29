import { Link } from 'react-router-dom'
import { site } from '../content/config'
import { photoCategories, videoCategories, categoryPath } from '../content/categories'
import { Brand } from './Brand'
import { navItems } from './Header'
import { ContactChannels } from './ContactChannels'

export function Footer() {
  return (
    <footer className="bg-ink border-t border-white/[0.07]">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Brand height={52} />
          <p className="text-mute mt-5 max-w-xs text-sm leading-relaxed">
            Produção audiovisual, fotografia e conteúdo estratégico.
          </p>
          <div className="mt-8">
            <ContactChannels variant="inline" />
          </div>
        </div>
        <FooterList title="Navegação" items={navItems.map((n) => ({ to: n.to, label: n.label }))} />
        <FooterList title="Vídeos" items={videoCategories.map((c) => ({ to: categoryPath(c), label: c.title }))} />
        <FooterList title="Fotografia" items={photoCategories.map((c) => ({ to: categoryPath(c), label: c.title }))} />
      </div>
      <div className="container-x text-mute flex flex-col gap-3 border-t border-white/[0.07] py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
        </p>
        <p>{site.credit.label}</p>
      </div>
    </footer>
  )
}

function FooterList({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <nav aria-label={title} className="md:col-span-2 md:first-of-type:col-start-7">
      <h2 className="eyebrow mb-5">{title}</h2>
      <ul className="text-soft space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="link-underline hover:text-paper transition-colors">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
