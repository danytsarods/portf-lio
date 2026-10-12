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
  id: string
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
    id: `${c.slug}-foto-${pad(i + 1)}`,
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
 * Trabalhos em vídeo importados do site antigo, por categoria. Para atualizar:
 * ajuste source/canva/sources.json e rode o workflow "Migrar mídias do site antigo".
 */
export const importedVideoWorks: Record<string, VideoWork[]> = Object.fromEntries(
  videoCategories.map((c) => [c.slug, toVideos(c)]),
)

/**
 * Fotos adicionadas manualmente (arquivos em public/media/fotografia/<categoria>/),
 * exibidas depois das fotos importadas do site antigo.
 */
const extraPhotos: Record<string, Photo[]> = {}

/** Fotografias do projeto (importadas + extras), por categoria. */
export const importedPhotoWorks: Record<string, Photo[]> = Object.fromEntries(
  photoCategories.map((c) => [c.slug, [...toPhotos(c), ...(extraPhotos[c.slug] ?? [])]]),
)

/** Trabalho enviado pelo painel /admin (tabela `works` do Supabase). */
export type UploadedWork = {
  id: string
  kind: 'video' | 'photo'
  category: string
  title: string | null
  alt: string | null
  src: string
  small: string | null
  small_width: number | null
  poster: string | null
  width: number
  height: number
  duration_seconds: number | null
  storage_paths: string[]
  position: number
  hidden: boolean
}

/** Ajustes do painel nos trabalhos que vieram do projeto: ocultar e renomear. */
export type WorkOverrides = Record<string, { hidden?: boolean; title?: string }>

const orientationOf = (w: number, h: number): Orientation =>
  Math.abs(w - h) / Math.max(w, h) < 0.05 ? 'square' : w > h ? 'horizontal' : 'vertical'

export const uploadedToVideo = (u: UploadedWork, c: Category, index: number): VideoWork => ({
  id: u.id,
  category: c.slug,
  title: u.title?.trim() || `${c.title} ${pad(index)}`,
  index,
  orientation: orientationOf(u.width, u.height),
  aspect: u.width / u.height,
  durationSeconds: Number(u.duration_seconds ?? 0),
  src: u.src,
  poster: u.poster ?? '',
})

export const uploadedToPhoto = (u: UploadedWork, c: Category, index: number): Photo => ({
  id: u.id,
  src: u.src,
  srcSet: u.small && u.small_width ? `${u.small} ${u.small_width}w, ${u.src} ${u.width}w` : undefined,
  width: u.width,
  height: u.height,
  alt: u.alt?.trim() || `Ensaio de ${c.title.toLowerCase()} — foto ${index} do portfólio RODS AUDIOVISUAL`,
})

/** Trabalhos exibidos no site: os enviados pelo painel primeiro, depois os do projeto. */
export const videoWorks: Record<string, VideoWork[]> = {}
export const photoWorks: Record<string, Photo[]> = {}
export const allVideoWorks: VideoWork[] = []

export function buildWorks(uploaded: UploadedWork[] = [], overrides: WorkOverrides = {}) {
  const visible = uploaded.filter((u) => !u.hidden).sort((a, b) => a.position - b.position)
  for (const c of videoCategories) {
    const mine = visible.filter((u) => u.kind === 'video' && u.category === c.slug)
    const base = importedVideoWorks[c.slug].filter((w) => !overrides[w.id]?.hidden)
    // numeração refeita depois de juntar as listas ("Gastronomia 01", "Gastronomia 02"...)
    const merged = [
      ...mine.map((u) => ({ work: uploadedToVideo(u, c, 0), title: u.title?.trim() })),
      ...base.map((w) => ({ work: w, title: overrides[w.id]?.title?.trim() })),
    ]
    videoWorks[c.slug] = merged.map(({ work, title }, i) => ({
      ...work,
      index: i + 1,
      title: title || `${c.title} ${pad(i + 1)}`,
    }))
  }
  for (const c of photoCategories) {
    const mine = visible.filter((u) => u.kind === 'photo' && u.category === c.slug)
    const base = importedPhotoWorks[c.slug].filter((p) => !overrides[p.id]?.hidden)
    photoWorks[c.slug] = [...mine.map((u, i) => uploadedToPhoto(u, c, i + 1)), ...base]
  }
  allVideoWorks.splice(0, allVideoWorks.length, ...videoCategories.flatMap((c) => videoWorks[c.slug] ?? []))
}

buildWorks()

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
