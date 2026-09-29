import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Brand } from './Brand'
import { ArrowRight, Close } from './Icons'
import { useFocusTrap } from '../lib/hooks'

export const navItems = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/videos', label: 'Vídeos' },
  { to: '/fotografia', label: 'Fotografia' },
  { to: '/contato', label: 'Contato' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(open, panelRef)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background,border-color,backdrop-filter] duration-500 ${
          scrolled ? 'bg-ink/80 border-b border-white/[0.06] backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <a
          href="#conteudo"
          className="focus:bg-paper focus:text-ink sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:px-4 focus:py-2"
        >
          Pular para o conteúdo
        </a>
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <Link to="/" aria-label="RODS AUDIOVISUAL — página inicial" className="text-[13px]">
            <Brand />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="text-soft flex items-center gap-8 text-[13px]">
              {navItems.slice(1).map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `link-underline hover:text-paper pb-0.5 transition-colors ${isActive ? 'text-paper' : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/contato" className="btn btn-primary hidden !px-5 !py-2.5 text-[13px] sm:inline-flex">
              Vamos criar juntos
              <ArrowRight className="size-3.5" />
            </Link>
            <button
              type="button"
              className="-mr-2 inline-flex size-11 items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label="Abrir menu"
              onClick={() => setOpen(true)}
            >
              <span aria-hidden="true" className="flex w-6 flex-col gap-[7px]">
                <span className="bg-paper h-px w-full" />
                <span className="bg-paper h-px w-2/3 self-end" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="menu-mobile"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="bg-ink fixed inset-0 z-50 flex h-dvh flex-col lg:hidden"
      >
        <div className="container-x flex h-[72px] items-center justify-between">
          <Brand className="text-[13px]" />
          <button
            type="button"
            data-autofocus
            className="-mr-2 inline-flex size-11 items-center justify-center"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          >
            <Close className="size-6" />
          </button>
        </div>
        <nav aria-label="Menu móvel" className="container-x flex flex-1 flex-col justify-center">
          <ul className="space-y-1">
            {navItems.map((item, i) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-baseline gap-4 py-2 text-[clamp(2.2rem,10vw,3.5rem)] font-semibold tracking-[-0.03em] ${
                      isActive ? 'text-paper' : 'text-paper/55'
                    }`
                  }
                >
                  <span className="text-mute w-8 text-xs font-normal tracking-normal">0{i + 1}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="container-x pb-10">
          <Link to="/contato" className="btn btn-primary w-full">
            Vamos criar juntos <ArrowRight />
          </Link>
        </div>
      </div>
    </>
  )
}
