import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { VideoWork } from '../content/works'
import { useInView, useReducedMotion } from '../lib/hooks'
import { registerPlayer } from '../lib/playback'
import { MediaImage } from './MediaImage'
import { Play } from './Icons'

/**
 * Composição do hero: três quadros verticais com trabalhos reais. O quadro
 * central toca uma prévia silenciosa e leve (360p, sem áudio) quando visível.
 */
export function HeroReel({ works, onOpen }: { works: VideoWork[]; onOpen: (w: VideoWork) => void }) {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: '0px' })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [previewFailed, setPreviewFailed] = useState(false)
  const [left, center, right] = works

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const unregister = registerPlayer(v)
    if (inView) v.play().catch(() => undefined)
    else v.pause()
    return unregister
  }, [inView])

  if (!center) return null
  const showVideo = !reduced && !!center.preview && !previewFailed

  return (
    <div ref={ref} className="relative grid grid-cols-[1fr_1.3fr_1fr] items-start gap-3 sm:gap-4">
      <Frame onOpen={onOpen} work={left} className="mt-[30%] opacity-75 transition-opacity hover:opacity-100" />
      <Frame onOpen={onOpen} work={center} className="ring-1 ring-white/10">
        {showVideo && (
          <video
            ref={videoRef}
            src={center.preview}
            poster={center.poster}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
            onError={() => setPreviewFailed(true)}
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </Frame>
      <Frame onOpen={onOpen} work={right} className="mt-[60%] opacity-75 transition-opacity hover:opacity-100" />
    </div>
  )
}

function Frame({
  work,
  className,
  children,
  onOpen,
}: {
  work?: VideoWork
  className: string
  children?: ReactNode
  onOpen: (w: VideoWork) => void
}) {
  return work ? (
    <button
      type="button"
      onClick={() => onOpen(work)}
      aria-label={`Assistir ${work.title}`}
      className={`group bg-graphite relative block aspect-[9/16] overflow-hidden ${className}`}
    >
      <MediaImage
        src={work.poster}
        alt=""
        priority
        className="absolute inset-0"
        imgClassName="group-hover:scale-[1.03]"
      />
      {children}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <span className="group-hover:bg-paper group-hover:text-ink absolute bottom-3 left-3 grid size-9 place-items-center rounded-full border border-white/40 bg-black/25 backdrop-blur-md transition-colors duration-500">
        <Play className="ml-0.5 size-3" />
      </span>
    </button>
  ) : null
}
