import type { ReactNode } from 'react'
import { useState } from 'react'
import { errorMessage } from './supabase'

export const inputClass =
  'w-full rounded-lg border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-paper placeholder:text-mute/70 focus:border-accent focus:outline-none'

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-soft mb-1.5 block text-xs font-medium tracking-wide">{label}</span>
      {children}
      {hint && <span className="text-mute mt-1.5 block text-xs">{hint}</span>}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  ...rest
}: { value: string; onChange: (v: string) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
>) {
  return <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
}

export function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} resize-y leading-relaxed`}
    />
  )
}

export function Card({
  title,
  description,
  children,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="bg-coal rounded-2xl border border-white/10 p-5 sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-mute mt-1 text-sm">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  )
}

export type Status = { kind: 'idle' | 'busy' | 'ok' | 'error'; message?: string }

export function StatusLine({ status }: { status: Status }) {
  if (status.kind === 'idle') return null
  const color = status.kind === 'error' ? 'text-red-300' : status.kind === 'ok' ? 'text-emerald-300' : 'text-soft'
  return (
    <p role="status" className={`text-sm ${color}`}>
      {status.message ?? (status.kind === 'busy' ? 'Salvando…' : status.kind === 'ok' ? 'Salvo!' : 'Erro')}
    </p>
  )
}

/** Botão "Salvar" com estado de envio e mensagem de retorno. */
export function SaveBar({ onSave, label = 'Salvar' }: { onSave: () => Promise<void>; label?: string }) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const run = async () => {
    setStatus({ kind: 'busy' })
    try {
      await onSave()
      setStatus({ kind: 'ok', message: 'Salvo! Já aparece no site ao recarregar a página.' })
    } catch (err) {
      setStatus({ kind: 'error', message: errorMessage(err) })
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-5">
      <button
        type="button"
        onClick={run}
        disabled={status.kind === 'busy'}
        className="btn btn-primary disabled:opacity-60"
      >
        {status.kind === 'busy' ? 'Salvando…' : label}
      </button>
      <StatusLine status={status} />
    </div>
  )
}

/** Lista editável de itens (adicionar, remover, mover). */
export function ListEditor<T>({
  items,
  onChange,
  render,
  create,
  addLabel,
}: {
  items: T[]
  onChange: (items: T[]) => void
  render: (item: T, update: (item: T) => void) => ReactNode
  create: () => T
  addLabel: string
}) {
  const move = (i: number, d: number) => {
    const next = [...items]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3 sm:p-4">
          <div className="min-w-0 flex-1 space-y-3">
            {render(item, (v) => onChange(items.map((x, j) => (j === i ? v : x))))}
          </div>
          <div className="flex flex-col gap-1">
            <IconButton label="Subir" disabled={i === 0} onClick={() => move(i, -1)}>
              ↑
            </IconButton>
            <IconButton label="Descer" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              ↓
            </IconButton>
            <IconButton label="Remover" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              ✕
            </IconButton>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, create()])} className="btn btn-ghost !py-2.5">
        + {addLabel}
      </button>
    </div>
  )
}

export function IconButton({
  label,
  children,
  ...rest
}: { label: string; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      {...rest}
      className="text-soft hover:text-paper grid size-8 place-items-center rounded-md border border-white/10 text-sm hover:border-white/30 disabled:opacity-30"
    >
      {children}
    </button>
  )
}
