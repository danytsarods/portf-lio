import { contact, contactLinks } from '../content/config'
import { ArrowUpRight, Instagram, Mail, WhatsApp } from './Icons'

/** Lista os canais de contato configurados. Canais sem dado real não são exibidos. */
export function ContactChannels({ variant = 'list' }: { variant?: 'list' | 'inline' }) {
  const channels = [
    contactLinks.whatsapp && {
      href: contactLinks.whatsapp,
      label: 'WhatsApp',
      detail: contact.whatsappDisplay ?? 'Conversar agora',
      Icon: WhatsApp,
    },
    contactLinks.instagram && {
      href: contactLinks.instagram,
      label: 'Instagram',
      detail: `@${contact.instagram}`,
      Icon: Instagram,
    },
    contactLinks.email && { href: contactLinks.email, label: 'E-mail', detail: contact.email ?? '', Icon: Mail },
  ].filter(Boolean) as { href: string; label: string; detail: string; Icon: typeof Mail }[]

  if (!channels.length) {
    if (variant === 'inline') return null
    return (
      <p className="text-soft max-w-md text-sm leading-relaxed" role="note">
        Os canais oficiais de atendimento (WhatsApp, Instagram e e-mail) estão sendo atualizados e serão publicados aqui
        em breve.
      </p>
    )
  }

  if (variant === 'inline') {
    return (
      <ul className="flex flex-wrap gap-3">
        {channels.map(({ href, label, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="btn btn-ghost"
            >
              <Icon className="size-4" /> {label}
            </a>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="divide-y divide-white/10 border-y border-white/10">
      {channels.map(({ href, label, detail, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="group flex items-center gap-5 py-6 transition-colors hover:text-white"
          >
            <Icon className="text-soft group-hover:text-paper size-6 transition-colors" />
            <span className="flex-1">
              <span className="block text-2xl font-medium tracking-tight sm:text-3xl">{label}</span>
              <span className="text-mute mt-1 block text-sm">{detail}</span>
            </span>
            <ArrowUpRight className="text-mute group-hover:text-paper size-6 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </li>
      ))}
    </ul>
  )
}
