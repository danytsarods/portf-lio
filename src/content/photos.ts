import generated from './photos.json'

/**
 * Fotos institucionais (originais em source/fotos, versões web geradas por
 * `npm run images`). `focus` define o ponto de enquadramento quando a foto
 * precisa preencher uma área de outra proporção — separado para celular e desktop,
 * sempre mantendo rosto e equipamento visíveis.
 */
export type SitePhoto = {
  base: string
  width: number
  height: number
  widths: number[]
  alt: string
  focus: { mobile: string; desktop: string }
}

type Key = keyof typeof generated

const meta: Record<Key, Pick<SitePhoto, 'alt' | 'focus'>> = {
  'creator-estudio-escuro': {
    alt: 'Danytsa em retrato de perfil, em estúdio escuro, segurando uma câmera com a lente iluminada',
    focus: { mobile: '42% 18%', desktop: '45% 30%' },
  },
  'creator-camera-sorriso': {
    alt: 'Danytsa de camisa branca, com uma câmera Sony na mão, olhando para trás e sorrindo em fundo claro',
    focus: { mobile: '62% 30%', desktop: '60% 35%' },
  },
  'creator-bastidores-tripe': {
    alt: 'Danytsa no set, olhando o celular ao lado de uma câmera no tripé e de um refletor de luz',
    focus: { mobile: '68% 40%', desktop: '65% 45%' },
  },
}

export const photos = Object.fromEntries(
  (Object.keys(generated) as Key[]).map((k) => [k, { ...generated[k], ...meta[k] }]),
) as Record<Key, SitePhoto>

export const photoSrc = (p: SitePhoto, ext: 'jpg' | 'webp' | 'avif' = 'jpg', w = p.widths[p.widths.length - 1]) =>
  `${p.base}-${w}.${ext}`
