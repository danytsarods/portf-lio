import gastronomia from './imported/gastronomia.json'
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

type Imported = typeof gastronomia

const fromImport = (category: string, data: Imported): VideoWork[] =>
  data.videos.map((v, i) => {
    const light = v.variants.dashVideo.find((d) => d.height === 640 || d.width === 640)
    return {
      id: `${category}-${String(i + 1).padStart(2, '0')}`,
      category,
      title: `${videoCategories.find((c) => c.slug === category)?.title ?? category} ${String(i + 1).padStart(2, '0')}`,
      index: i + 1,
      orientation: v.orientation as Orientation,
      aspect: v.sourceWidth / v.sourceHeight,
      durationSeconds: v.durationSeconds,
      src: mediaUrl(v.video.url),
      poster: mediaUrl(v.poster.url),
      preview: light ? mediaUrl(light.url) : undefined,
    }
  })

/**
 * Trabalhos em vídeo por categoria. Para adicionar uma categoria recuperada:
 *   1. salve o HTML da página antiga em source/canva/<slug>.html
 *   2. rode `npm run import:canva -- source/canva/<slug>.html <slug>`
 *   3. importe o JSON gerado aqui.
 */
export const videoWorks: Record<string, VideoWork[]> = {
  gastronomia: fromImport('gastronomia', gastronomia),
  eventos: [],
  estetica: [],
  influencer: [],
  gym: [],
  moda: [],
}

/** Fotografias por categoria (nenhum ensaio foi recuperado até o momento). */
export const photoWorks: Record<string, Photo[]> = {
  moda: [],
  restaurantes: [],
  newborn: [],
  '15-anos': [],
  gestante: [],
}

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
