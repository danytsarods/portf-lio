import { useCallback, useState, type CSSProperties } from 'react'
import type { SitePhoto } from '../content/photos'
import { photoSrc } from '../content/photos'

type Props = {
  photo: SitePhoto
  sizes: string
  className?: string
  imgClassName?: string
  /** 'natural' mantém a proporção original; 'fill' preenche o contêiner usando o ponto de foco */
  mode?: 'natural' | 'fill'
  priority?: boolean
  alt?: string
}

/** Foto responsiva (AVIF/WebP/JPEG) com enquadramento separado para celular e desktop. */
export function Photo({ photo, sizes, className = '', imgClassName = '', mode = 'natural', priority, alt }: Props) {
  const [loaded, setLoaded] = useState(false)
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth) setLoaded(true)
  }, [])
  const srcSet = (ext: 'avif' | 'webp' | 'jpg') =>
    photo.widths.map((w) => `${photoSrc(photo, ext, w)} ${w}w`).join(', ')
  const style = {
    '--focus-m': photo.focus.mobile,
    '--focus-d': photo.focus.desktop,
    ...(mode === 'natural' ? { aspectRatio: `${photo.width} / ${photo.height}` } : {}),
  } as CSSProperties

  return (
    <div
      className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} bg-coal overflow-hidden ${className}`}
      style={style}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
        <img
          ref={ref}
          src={photoSrc(photo, 'jpg', photo.widths.find((w) => w >= 1280) ?? photo.widths[photo.widths.length - 1])}
          srcSet={srcSet('jpg')}
          sizes={sizes}
          alt={alt ?? photo.alt}
          width={photo.width}
          height={photo.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 size-full object-cover object-[var(--focus-m)] transition-opacity duration-1000 ease-[var(--ease-cine)] md:object-[var(--focus-d)] ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      </picture>
    </div>
  )
}
