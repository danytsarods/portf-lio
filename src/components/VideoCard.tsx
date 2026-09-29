import { useEffect, useRef, useState } from 'react'
import type { VideoWork } from '../content/works'
import { aspectLabel, formatDuration } from '../content/works'
import { registerPlayer } from '../lib/playback'
import { useReducedMotion } from '../lib/hooks'
import { MediaImage } from './MediaImage'
import { Play } from './Icons'

type Props = {
  work: VideoWork
  onOpen: (work: VideoWork) => void
  className?: string
  sizes?: string
  showMeta?: boolean
  priority?: boolean
}

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/**
 * Capa de um vídeo. No desktop, o hover toca uma prévia silenciosa de baixa
 * resolução (carregada só nesse momento). O vídeo completo abre no player.
 */
export function VideoCard({ work, onOpen, className = '', sizes, showMeta = true, priority }: Props) {
  const reduced = useReducedMotion()
  const [preview, setPreview] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const allowPreview = !!work.preview && !reduced

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const unregister = registerPlayer(v)
    v.play().catch(() => setPreview(false))
    return unregister
  }, [preview])

  return (
    <button
      type="button"
      onClick={() => {
        setPreview(false)
        onOpen(work)
      }}
      onMouseEnter={() => allowPreview && canHover() && setPreview(true)}
      onMouseLeave={() => setPreview(false)}
      className={`group relative block w-full cursor-pointer text-left ${className}`}
      aria-label={`Assistir ${work.title} (${formatDuration(work.durationSeconds)})`}
    >
      <div className="bg-graphite relative overflow-hidden" style={{ aspectRatio: work.aspect }}>
        <MediaImage
          src={work.poster}
          alt=""
          sizes={sizes}
          priority={priority}
          className="absolute inset-0"
          imgClassName="group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
          fallbackLabel="Capa indisponível"
        />
        {preview && (
          <video
            ref={videoRef}
            src={work.preview}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            onError={() => setPreview(false)}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="text-paper absolute bottom-4 left-4 inline-flex items-center gap-2.5 text-xs font-medium tracking-wide">
          <span className="group-hover:border-paper group-hover:bg-paper group-hover:text-ink grid size-10 place-items-center rounded-full border border-white/40 bg-black/25 backdrop-blur-md transition-[background,border-color,transform] duration-500 group-hover:scale-105">
            <Play className="ml-0.5 size-3.5" />
          </span>
          <span className="tabular-nums">{formatDuration(work.durationSeconds)}</span>
        </span>
      </div>
      {showMeta && (
        <div className="mt-3 flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium">{work.title}</span>
          <span className="text-mute hidden text-xs sm:inline">{aspectLabel(work)}</span>
        </div>
      )}
    </button>
  )
}
