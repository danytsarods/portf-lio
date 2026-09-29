import { useCallback, useState } from 'react'

type Props = {
  src?: string
  srcSet?: string
  sizes?: string
  alt: string
  className?: string
  imgClassName?: string
  /** 'cover' só para capas de mesma proporção; galerias usam 'contain' */
  fit?: 'cover' | 'contain'
  priority?: boolean
  fallbackLabel?: string
  /** Proporção largura/altura para reservar espaço (evita saltos de layout) */
  aspect?: number
}

/** Imagem com carregamento sob demanda, estado de carregamento e fallback de erro. */
export function MediaImage({
  src,
  srcSet,
  sizes,
  alt,
  className = '',
  imgClassName = '',
  fit = 'cover',
  priority,
  fallbackLabel = 'Imagem indisponível',
  aspect,
}: Props) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error')
  // Imagens já em cache podem concluir antes do onLoad ser observado
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setState(img.naturalWidth > 0 ? 'loaded' : 'error')
  }, [])
  return (
    <div
      className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} bg-graphite overflow-hidden ${className}`}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      {state === 'loading' && <div className="media-shimmer absolute inset-0" aria-hidden="true" />}
      {state === 'error' && (
        <div className="absolute inset-0 flex items-end p-4" aria-hidden="true">
          <span className="text-mute text-[10px] tracking-[0.2em] uppercase">{fallbackLabel}</span>
        </div>
      )}
      {src && state !== 'error' && (
        <img
          ref={imgRef}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={`absolute inset-0 size-full transition-[opacity,transform] duration-700 ease-[var(--ease-cine)] ${
            fit === 'cover' ? 'object-cover' : 'object-contain'
          } ${state === 'loaded' ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      )}
    </div>
  )
}
