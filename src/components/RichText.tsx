import { Fragment } from 'react'

/** Texto editável no painel: trechos entre `*asteriscos*` recebem o destaque serifado. */
export function RichText({ text }: { text: string }) {
  return text.split(/\*([^*]+)\*/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="serif-accent">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}
