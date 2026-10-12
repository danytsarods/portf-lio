import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { usePageMeta } from '../lib/seo'
import { Brand } from '../components/Brand'
import { errorMessage, supabase } from './supabase'
import { WorksPanel } from './WorksPanel'
import { ContactPanel, TextsPanel } from './TextsPanel'
import { Field, StatusLine, TextInput, type Status } from './ui'

type Tab = 'trabalhos' | 'textos' | 'contato'
const tabs: { id: Tab; label: string }[] = [
  { id: 'trabalhos', label: 'Trabalhos' },
  { id: 'textos', label: 'Textos' },
  { id: 'contato', label: 'Contato' },
]

export default function Admin() {
  usePageMeta({ title: 'Painel', path: '/admin', noindex: true })
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return setIsAdmin(null)
    supabase.rpc('is_admin').then(({ data }) => setIsAdmin(!!data))
  }, [session])

  return (
    <div className="bg-ink min-h-dvh">
      <header className="bg-ink/90 sticky top-0 z-20 border-b border-white/10 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Brand height={22} />
            <span className="text-mute text-xs">Painel</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="/" target="_blank" rel="noreferrer" className="link-underline text-soft">
              Ver site ↗
            </a>
            {session && (
              <button type="button" onClick={() => supabase.auth.signOut()} className="link-underline text-soft">
                Sair
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {session === undefined ? (
          <p className="text-mute text-sm">Carregando…</p>
        ) : !session ? (
          <Login />
        ) : isAdmin === null ? (
          <p className="text-mute text-sm">Carregando…</p>
        ) : !isAdmin ? (
          <NoAccess email={session.user.email} />
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  )
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>(() => {
    const hash = location.hash.slice(1) as Tab
    return tabs.some((t) => t.id === hash) ? hash : 'trabalhos'
  })
  const choose = (t: Tab) => {
    setTab(t)
    history.replaceState(null, '', `#${t}`)
  }
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">
        Olá! <span className="serif-accent">O que vamos atualizar?</span>
      </h1>
      <nav className="mt-8 flex gap-1 border-b border-white/10" aria-label="Seções do painel">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => choose(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-accent text-paper' : 'text-mute hover:text-paper border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="mt-8">
        {tab === 'trabalhos' && <WorksPanel />}
        {tab === 'textos' && <TextsPanel />}
        {tab === 'contato' && <ContactPanel />}
      </div>
    </>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus({ kind: 'busy', message: 'Entrando…' })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setStatus(error ? { kind: 'error', message: errorMessage(error) } : { kind: 'idle' })
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Entrar no painel</h1>
      <Field label="E-mail">
        <TextInput type="email" autoComplete="email" required value={email} onChange={setEmail} />
      </Field>
      <Field label="Senha">
        <TextInput type="password" autoComplete="current-password" required value={password} onChange={setPassword} />
      </Field>
      <button type="submit" disabled={status.kind === 'busy'} className="btn btn-primary w-full disabled:opacity-60">
        Entrar
      </button>
      <StatusLine status={status} />
    </form>
  )
}

function NoAccess({ email }: { email?: string }) {
  return (
    <div className="mx-auto max-w-md space-y-4 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Sem permissão</h1>
      <p className="text-soft text-sm">
        O e-mail <strong>{email}</strong> entrou, mas não está autorizado a editar o site. Peça para incluí-lo na lista
        de administradores.
      </p>
      <button type="button" className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>
        Sair
      </button>
    </div>
  )
}
