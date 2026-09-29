import { mediaUrl } from './media'
import { photoCategories, videoCategories, type Category } from './categories'

export type Orientation = 'vertical' | 'horizontal' | 'square'

export type VideoWork = {
  id: string
  category: string
  title: string
  index: number
  orientation: Orientation
  /** Proporção largura/altura do arquivo */
  aspect: number
  durationSeconds: number
  src: string
  poster: string
  /** Variante leve (sem áudio) usada apenas para prévias silenciosas */
  preview?: string
}

export type Photo = {
  src: string
  width: number
  height: number
  alt: string
  srcSet?: string
}

type Imported = {
  source: { pageUrl: string; pageTitle: string }
  videos: {
    canvaId: string
    sourceWidth: number
    sourceHeight: number
    orientation: string
    durationSeconds: number
    video: { url: string }
    poster: { url: string }
    preview: { url: string } | null
  }[]
  photos: {
    canvaId: string
    width: number
    height: number
    large: { url: string; width: number }
    small: { url: string; width: number }
  }[]
}

// Inventários gerados por scripts/import-canva.mjs (um arquivo por categoria)
const load = (files: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(files).map(([path, mod]) => [path.split('/').pop()!.replace('.json', ''), mod as Imported]),
  )
const importedVideos = load(import.meta.glob('./imported/videos/*.json', { eager: true, import: 'default' }))
const importedPhotos = load(import.meta.glob('./imported/fotografia/*.json', { eager: true, import: 'default' }))

const pad = (n: number) => String(n).padStart(2, '0')

const toVideos = (c: Category): VideoWork[] =>
  (importedVideos[c.slug]?.videos ?? []).map((v, i) => ({
    id: `${c.slug}-${pad(i + 1)}`,
    category: c.slug,
    title: `${c.title} ${pad(i + 1)}`,
    index: i + 1,
    orientation: v.orientation as Orientation,
    aspect: v.sourceWidth / v.sourceHeight,
    durationSeconds: v.durationSeconds,
    src: mediaUrl(v.video.url),
    poster: mediaUrl(v.poster.url),
    preview: v.preview ? mediaUrl(v.preview.url) : undefined,
  }))

const toPhotos = (c: Category): Photo[] =>
  (importedPhotos[c.slug]?.photos ?? []).map((p, i) => ({
    src: mediaUrl(p.large.url),
    srcSet:
      p.small.url !== p.large.url
        ? `${mediaUrl(p.small.url)} ${p.small.width}w, ${mediaUrl(p.large.url)} ${p.large.width}w`
        : undefined,
    width: p.width,
    height: p.height,
    alt: `Ensaio de ${c.title.toLowerCase()} — foto ${i + 1} do portfólio RODS AUDIOVISUAL`,
  }))

/**
 * Trabalhos em vídeo por categoria. Para atualizar a partir do site antigo:
 * ajuste source/canva/sources.json e rode o workflow "Migrar mídias do site antigo".
 */
export const videoWorks: Record<string, VideoWork[]> = Object.fromEntries(
  videoCategories.map((c) => [c.slug, toVideos(c)]),
)

/**
 * Fotos adicionadas manualmente (arquivos em public/media/fotografia/<categoria>/),
 * exibidas depois das fotos importadas do site antigo.
 */
const extraPhotos: Record<string, Photo[]> = {}

/** Fotografias por categoria. */
export const photoWorks: Record<string, Photo[]> = Object.fromEntries(
  photoCategories.map((c) => [c.slug, [...toPhotos(c), ...(extraPhotos[c.slug] ?? [])]]),
)

export const allVideoWorks = videoCategories.flatMap((c) => videoWorks[c.slug] ?? [])

export const findVideoCategory = (slug?: string) => videoCategories.find((c) => c.slug === slug)
export const findPhotoCategory = (slug?: string) => photoCategories.find((c) => c.slug === slug)

export const coverFor = (c: Category): string | undefined =>
  c.kind === 'videos' ? videoWorks[c.slug]?.[0]?.poster : photoWorks[c.slug]?.[0]?.src

export const formatDuration = (s: number) => {
  const total = Math.round(s)
  const m = Math.floor(total / 60)
  const r = total % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export const aspectLabel = (w: Pick<VideoWork, 'orientation' | 'aspect'>) => {
  if (w.orientation === 'square') return 'Quadrado 1:1'
  if (w.orientation === 'vertical') return Math.abs(w.aspect - 9 / 16) < 0.02 ? 'Vertical 9:16' : 'Vertical'
  return Math.abs(w.aspect - 16 / 9) < 0.02 ? 'Horizontal 16:9' : 'Horizontal'
}
