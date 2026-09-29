import { useEffect, useRef, useState } from 'react'
import type { Photo } from '../content/works'
import { useFocusTrap } from '../lib/hooks'
import { MediaImage } from './MediaImage'
import { ChevronLeft, ChevronRight, Close } from './Icons'
import { Reveal } from './Reveal'

/**
 * Galeria editorial em colunas: cada foto mantém sua proporção original
 * (sem recortes), verticais e horizontais convivem na mesma grade.
 */
export function PhotoGallery({ photos, label }: { photos: Photo[]; label: string }) {
  const [active, setActive] = useState<number | null>(null)
  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4" aria-label={label}>
        {photos.map((p, i) => (
          <li key={p.src} className="break-inside-avoid">
            <Reveal delay={(i % 3) * 80}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className="group block w-full cursor-zoom-in"
                aria-label={`Ampliar foto ${i + 1} de ${photos.length}: ${p.alt}`}
              >
                <MediaImage
                  src={p.src}
                  srcSet={p.srcSet}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  alt={p.alt}
                  className="w-full"
                  imgClassName="group-hover:scale-[1.02]"
                  fit="contain"
                  aspect={p.width / p.height}
                />
                <span className="sr-only">Abrir em tela ampliada</span>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>
      {active !== null && (
        <Lightbox photos={photos} index={active} onChange={setActive} onClose={() => setActive(null)} />
      )}
    </>
  )
}

export function Lightbox({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: Photo[]
  index: number
  onChange: (i: number) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(true, ref)
  const photo = photos[index]
  const prev = () => onChange((index - 1 + photos.length) % photos.length)
  const next = () => onChange((index + 1) % photos.length)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${photos.length}`}
      className="fixed inset-0 z-[70] flex flex-col bg-black/95"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)()
        touchX.current = null
      }}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6">
        <p className="text-soft text-xs tabular-nums" aria-live="polite">
          {index + 1} / {photos.length}
        </p>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          aria-label="Fechar galeria"
          className="grid size-11 place-items-center rounded-full hover:bg-white/10"
        >
          <Close className="size-6" />
        </button>
      </div>
      <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center px-4 pb-8 sm:px-20">
        <img
          key={photo.src}
          src={photo.src}
          srcSet={photo.srcSet}
          sizes="100vw"
          alt={photo.alt}
          className="pointer-events-auto max-h-[calc(100dvh-110px)] max-w-full object-contain"
        />
      </div>
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Foto anterior"
            className="absolute top-1/2 left-2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 hover:border-white/50 sm:left-5"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próxima foto"
            className="absolute top-1/2 right-2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 hover:border-white/50 sm:right-5"
          >
            <ChevronRight />
          </button>
        </>
      )}
    </div>
  )
}
