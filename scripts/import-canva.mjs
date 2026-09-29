#!/usr/bin/env node
/**
 * Importa um HTML exportado do site antigo (Canva Websites) e gera um inventário
 * estruturado das mídias em src/content/imported/<slug>.json.
 *
 * Uso: node scripts/import-canva.mjs <arquivo.html> <slug> [--origin https://rodsaudiovisual.com]
 *
 * O HTML do Canva não usa <video>/<img>: as mídias estão serializadas em
 * window['bootstrap'] = JSON.parse('...'). Cada vídeo aparece com 1 MP4 progressivo
 * (com áudio) + variantes DASH só de vídeo (180p/360p/720p/1080p) + faixa de áudio
 * .m4a + manifesto HLS + posterframe + sprites de timeline. Usamos o MP4 progressivo
 * para reprodução e o posterframe como capa; as variantes ficam registradas.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const [, , file, slug, ...rest] = process.argv
if (!file || !slug) {
  console.error('Uso: node scripts/import-canva.mjs <arquivo.html> <slug> [--origin URL]')
  process.exit(1)
}
const originIdx = rest.indexOf('--origin')
const origin = originIdx >= 0 ? rest[originIdx + 1] : 'https://rodsaudiovisual.com'

const html = readFileSync(file, 'utf8')
const baseHref = html.match(/<base href="([^"]+)"/)?.[1] ?? '/'
const pageBase = new URL(baseHref, origin).href
const abs = (p) => new URL(p, pageBase).href

const raw = html.match(/window\['bootstrap'\] = JSON\.parse\('([\s\S]*?)'\);/)?.[1]
if (!raw) throw new Error('bootstrap JSON não encontrado no HTML')
const data = JSON.parse(raw.replace(/\\'/g, "'"))
const page = data.page
const title = page.A?.D ?? slug

// Ordem de aparição das mídias nas seções da página + imagem de fundo de cada seção.
const order = []
const sectionBg = new Map()
const walk = (node, section) => {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, section))
  if (!node || typeof node !== 'object') return
  if (node['A?'] === 'I') {
    const a = node.a ?? {}
    if (a.I?.A) {
      const trim = a.I.E ? { start: a.I.E.A / 1e6, end: a.I.E.B / 1e6 } : null
      order.push({ id: a.I.A, section, trim })
    } else if (a.B?.A?.A && node.D >= 1000) {
      sectionBg.set(section, { id: a.B.A.A, overlayTransparency: node.F })
    }
  }
  Object.values(node).forEach((v) => walk(v, section))
}
let sectionIndex = 0
for (const p of page.A.A) for (const s of p.t ?? []) walk(s, sectionIndex++)

const images = new Map()
for (const img of page.I.B ?? []) {
  const list = images.get(img.id) ?? []
  for (const f of img.files)
    list.push({ quality: f.quality, width: f.width, height: f.height, url: abs(f.url), path: f.url })
  images.set(img.id, list)
}

const videos = (page.I.C ?? [])
  .map((v) => {
    const prog = v.files[0]
    const placement = order.find((o) => o.id === v.id)
    return {
      canvaId: v.id,
      section: placement?.section ?? null,
      sourceWidth: v.width,
      sourceHeight: v.height,
      orientation: v.height > v.width ? 'vertical' : v.height === v.width ? 'square' : 'horizontal',
      durationSeconds: Math.round(v.durationSeconds * 10) / 10,
      oldSiteTrim: placement?.trim ?? null,
      video: { url: abs(prog.url), path: prog.url, width: prog.width, height: prog.height },
      poster: { url: abs(v.posterframes[0].A), path: v.posterframes[0].A },
      variants: {
        dashVideo: v.dashVideoFiles.map((d) => ({
          url: abs(d['1']),
          width: d.A,
          height: d.B,
          bytes: d.x,
          codec: d.y,
          videoOnly: true,
        })),
        dashAudio: v.dashAudioFiles.map((d) => ({ url: abs(d['1']), bytes: d.x, codec: d.y })),
        hls: v.hlsManifestUrl ? abs(v.hlsManifestUrl) : null,
        timelineSprites: v.videoTimelines.map((t) => abs(t.F)),
      },
      background: sectionBg.has(placement?.section)
        ? { canvaId: sectionBg.get(placement.section).id, role: 'decorative-section-background' }
        : null,
    }
  })
  .sort((a, b) => (a.section ?? 99) - (b.section ?? 99))

const icons = [
  ...html.matchAll(/<link rel="(shortcut icon|icon|apple-touch-icon)" href="([^"]+)"(?: sizes="([^"]+)")?/g),
].map((m) => ({ rel: m[1], url: abs(m[2]), sizes: m[3] ?? null }))

const out = {
  source: {
    file: file.split('/').pop(),
    pageTitle: title,
    baseHref,
    pageBase,
    importedAt: new Date().toISOString().slice(0, 10),
  },
  videos,
  backgrounds: [...images].map(([id, files]) => ({ canvaId: id, role: 'decorative-section-background', files })),
  icons,
  stats: {
    videos: videos.length,
    distinctMp4: new Set(videos.flatMap((v) => [v.video.url, ...v.variants.dashVideo.map((d) => d.url)])).size,
    images: images.size,
  },
}
const dest = resolve('src/content/imported', `${slug}.json`)
mkdirSync(dirname(dest), { recursive: true })
writeFileSync(dest, JSON.stringify(out, null, 2) + '\n')
console.log(
  `✓ ${title}: ${out.stats.videos} vídeos, ${out.stats.distinctMp4} MP4 distintos, ${out.stats.images} imagens → ${dest}`,
)
