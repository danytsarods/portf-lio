import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { VideoWork } from '../content/works'
import { aspectLabel, formatDuration } from '../content/works'
import { useFocusTrap } from '../lib/hooks'
import { pauseAll, registerPlayer } from '../lib/playback'
import { ChevronLeft, ChevronRight, Close, Expand } from './Icons'

/**
 * Controla o player via parâmetro de URL (?assistir=<id>), permitindo link direto
 * para um trabalho e o botão "voltar" do navegador.
 */
export function useVideoPlayer(works: VideoWork[]) {
  const [params, setParams] = useSearchParams()
  const id = params.get('assistir')
  const index = works.findIndex((w) => w.id === id)
  const open = useCallback(
    (work: VideoWork) => {
      pauseAll()
      setParams(
        (p) => {
          const n = new URLSearchParams(p)
          n.set('assistir', work.id)
          return n
        },
        { preventScrollReset: true, replace: !!id },
      )
    },
    [setParams, id],
  )
  const close = useCallback(() => {
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        n.delete('assistir')
        return n
      },
      { preventScrollReset: true, replace: true },
    )
  }, [setParams])
  const modal =
    index >= 0 ? <VideoModal works={works} index={index} onClose={close} onNavigate={(i) => open(works[i])} /> : null
  return { open, modal }
}

type Props = { works: VideoWork[]; index: number; onClose: () => void; onNavigate: (index: number) => void }

export function VideoModal({ works, index, onClose, onNavigate }: Props) {
  const work = works[index]
  const dialogRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  useFocusTrap(true, dialogRef)

  const hasPrev = index > 0
  const hasNext = index < works.length - 1

  useEffect(() => {
    setStatus('loading')
    const v = videoRef.current
    if (!v) return
    const unregister = registerPlayer(v)
    v.play().catch(() => undefined)
    return () => {
      v.pause()
      unregister()
    }
  }, [work.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.target instanceof HTMLVideoElement) return
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1)
      if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, hasPrev, hasNext, onClose, onNavigate])

  const fullscreen = () => {
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!v) return
    if (v.requestFullscreen) v.requestFullscreen().catch(() => v.webkitEnterFullscreen?.())
    else v.webkitEnterFullscreen?.()
  }

  const headingId = `player-title-${work.id}`

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-sm"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h2 id={headingId} className="truncate text-sm font-medium">
            {work.title}
          </h2>
          <p className="text-mute text-xs">
            {aspectLabel(work)} · {formatDuration(work.durationSeconds)} · {index + 1} de {works.length}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={fullscreen}
            className="grid size-11 place-items-center rounded-full hover:bg-white/10"
            aria-label="Tela cheia"
          >
            <Expand className="size-5" />
          </button>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full hover:bg-white/10"
            aria-label="Fechar player"
          >
            <Close className="size-6" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center px-4 pb-6 sm:px-20">
        <div
          className="bg-graphite pointer-events-auto relative overflow-hidden shadow-2xl"
          style={{
            aspectRatio: work.aspect,
            width: `min(100%, calc((100dvh - 110px) * ${work.aspect}))`,
            maxWidth: 1600,
          }}
        >
          {status === 'loading' && (
            <div className="absolute inset-0 grid place-items-center" role="status" aria-label="Carregando vídeo">
              <span className="border-t-paper size-9 animate-spin rounded-full border-2 border-white/15" />
            </div>
          )}
          {status === 'error' && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
              role="alert"
            >
              <p className="text-soft text-sm">Não foi possível carregar este vídeo agora.</p>
              <a href={work.src} target="_blank" rel="noreferrer" className="btn btn-ghost !py-2.5 text-xs">
                Abrir arquivo em nova aba
              </a>
            </div>
          )}
          <video
            key={work.id}
            ref={videoRef}
            src={work.src}
            poster={work.poster}
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
            onCanPlay={() => setStatus('ready')}
            onWaiting={() => setStatus((s) => (s === 'error' ? s : 'loading'))}
            onPlaying={() => setStatus('ready')}
            onError={() => setStatus('error')}
            className={`absolute inset-0 size-full bg-black object-contain ${status === 'error' ? 'invisible' : ''}`}
          ></video>
        </div>
      </div>

      {hasPrev && (
        <button
          type="button"
          onClick={() => onNavigate(index - 1)}
          aria-label="Vídeo anterior"
          className="absolute top-1/2 left-2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur hover:border-white/50 sm:left-5"
        >
          <ChevronLeft />
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={() => onNavigate(index + 1)}
          aria-label="Próximo vídeo"
          className="absolute top-1/2 right-2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur hover:border-white/50 sm:right-5"
        >
          <ChevronRight />
        </button>
      )}
    </div>
  )
}
