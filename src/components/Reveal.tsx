import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInView } from '../lib/hooks'

type Props = { as?: ElementType; delay?: number; className?: string; children: ReactNode }

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children }: Props) {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
