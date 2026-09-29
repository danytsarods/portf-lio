#!/usr/bin/env node
/**
 * Converte páginas do site antigo (Canva Websites) em inventários de mídia.
 *
 * O Canva não usa <video>/<img>: tudo fica serializado em
 * window['bootstrap'] = JSON.parse('...'), com chaves ofuscadas que mudam entre
 * versões. Por isso a detecção usa só campos nomeados e estáveis:
 *   - imagens: objetos { type: 'RASTER', id, files[] }
 *   - vídeos:  objetos { contentType: 'VIDEO', id, files[], dashVideoFiles[], posterframes[] }
 *   - posição: elementos { 'A?': 'I', D: largura, C: altura, F: transparência } que citam o id
 * Imagens em elementos de largura de página (≥ 1300) são fundos decorativos.
 *
 * Uso:
 *   node scripts/import-canva.mjs --all            (usa source/canva/sources.json + source/canva/live/)
 *   node scripts/import-canva.mjs <arquivo.html> <kind>/<slug> <url-da-página>
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

export function parseCanva(html, pageUrl) {
  const baseHref = html.match(/<base href="([^"]+)"/)?.[1] ?? new URL(pageUrl).pathname
  const pageBase = new URL(baseHref, pageUrl).href
  const abs = (p) => new URL(p, pageBase).href
  const raw = html.match(/window\['bootstrap'\] = JSON\.parse\('([\s\S]*?)'\);/)?.[1]
  if (!raw) throw new Error('bootstrap JSON não encontrado')
  const data = JSON.parse(raw.replace(/\\'/g, "'"))
  const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').trim()

  const rasters = new Map()
  const videos = new Map()
  const walkMedia = (o) => {
    if (Array.isArray(o)) return o.forEach(walkMedia)
    if (!o || typeof o !== 'object') return
    if (o.type === 'RASTER' && o.id && Array.isArray(o.files)) {
      const list = rasters.get(o.id) ?? []
      for (const f of o.files) if (!list.some((x) => x.url === f.url)) list.push(f)
      rasters.set(o.id, list)
    }
    if (o.contentType === 'VIDEO' && o.id && Array.isArray(o.files) && !videos.has(o.id)) videos.set(o.id, o)
    Object.values(o).forEach(walkMedia)
  }
  walkMedia(data)

  // Ordem de aparição e papel (fundo x conteúdo) a partir dos elementos posicionados
  const ids = new Set([...rasters.keys(), ...videos.keys()])
  const order = new Map()
  const bgIds = new Set()
  const trims = new Map()
  let seq = 0
  const refs = (o, out) => {
    if (typeof o === 'string') return ids.has(o) && out.add(o)
    if (Array.isArray(o)) return o.forEach((x) => refs(x, out))
    if (o && typeof o === 'object') Object.values(o).forEach((x) => refs(x, out))
  }
  const walkEls = (o) => {
    if (Array.isArray(o)) return o.forEach(walkEls)
    if (!o || typeof o !== 'object') return
    if (o['A?'] === 'I' && typeof o.D === 'number') {
      const found = new Set()
      refs(o, found)
      for (const id of found) {
        if (!order.has(id)) order.set(id, seq++)
        if (rasters.has(id) && o.D >= 1300 && o.C >= 600) bgIds.add(id)
      }
      const v = o.a?.I
      if (v?.A && v.E?.A != null) trims.set(v.A, { start: v.E.A / 1e6, end: v.E.B / 1e6 })
    }
    Object.values(o).forEach(walkEls)
  }
  walkEls(data.page?.A ?? data.page)
  const byOrder = (a, b) => (order.get(a) ?? 1e9) - (order.get(b) ?? 1e9)

  const outVideos = [...videos.keys()].sort(byOrder).map((id) => {
    const v = videos.get(id)
    const prog = v.files[0]
    const light = (v.dashVideoFiles ?? []).find((d) => Math.min(d.A, d.B) === 360)
    return {
      canvaId: id,
      sourceWidth: v.width,
      sourceHeight: v.height,
      orientation: v.height > v.width ? 'vertical' : v.height === v.width ? 'square' : 'horizontal',
      durationSeconds: Math.round(v.durationSeconds * 10) / 10,
      oldSiteTrim: trims.get(id) ?? null,
      video: { url: abs(prog.url), width: prog.width, height: prog.height },
      poster: { url: abs(v.posterframes[0].A) },
      preview: light ? { url: abs(light['1']), width: light.A, height: light.B } : null,
      variants: {
        dashVideo: (v.dashVideoFiles ?? []).map((d) => ({ url: abs(d['1']), width: d.A, height: d.B, bytes: d.x })),
        dashAudio: (v.dashAudioFiles ?? []).map((d) => ({ url: abs(d['1']), bytes: d.x })),
      },
    }
  })

  const img = (id) => {
    const files = [...rasters.get(id)].sort((a, b) => a.width - b.width)
    const large = files[files.length - 1]
    const small = files.find((f) => f.width >= 700) ?? large
    return {
      canvaId: id,
      width: large.width,
      height: large.height,
      large: { url: abs(large.url), width: large.width, height: large.height },
      small: { url: abs(small.url), width: small.width, height: small.height },
    }
  }
  const rasterIds = [...rasters.keys()].sort(byOrder)
  return {
    source: { pageUrl, pageTitle: title, baseHref, pageBase },
    videos: outVideos,
    photos: rasterIds.filter((id) => !bgIds.has(id)).map(img),
    backgrounds: rasterIds.filter((id) => bgIds.has(id)).map(img),
  }
}

const write = (dest, out) => {
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, JSON.stringify(out, null, 2) + '\n')
  console.log(
    `✓ ${dest}: ${out.videos.length} vídeos, ${out.photos.length} fotos, ${out.backgrounds.length} fundos — ${out.source.pageUrl}`,
  )
}

const fileFor = (url) => {
  const u = new URL(url)
  const slug = u.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '__') || '_home'
  return `source/canva/live/${u.host}__${slug}.html`
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  if (args[0] === '--all') {
    const sources = JSON.parse(readFileSync('source/canva/sources.json', 'utf8'))
    for (const kind of ['videos', 'fotografia', 'review'])
      for (const [slug, entry] of Object.entries(sources[kind] ?? {})) {
        const opts = typeof entry === 'string' ? { url: entry } : entry
        const url = opts.url
        const f = fileFor(url)
        if (!existsSync(f)) {
          console.log(`✗ ${kind}/${slug}: ${f} não encontrado (rode scripts/crawl-site.mjs)`)
          continue
        }
        const out = parseCanva(readFileSync(f, 'utf8'), url)
        if (opts.backgrounds === 'include') {
          // fundos de largura total que são fotos do próprio ensaio
          out.photos = [...out.photos, ...out.backgrounds]
          out.backgrounds = []
        }
        if (opts.only) {
          out.photos = out.photos.filter((p) => opts.only.includes(p.canvaId))
          out.videos = out.videos.filter((v) => opts.only.includes(v.canvaId))
          out.backgrounds = []
        }
        write(`src/content/imported/${kind}/${slug}.json`, out)
      }
  } else if (args.length === 3) {
    write(`src/content/imported/${args[1]}.json`, parseCanva(readFileSync(args[0], 'utf8'), args[2]))
  } else {
    console.error('Uso: import-canva.mjs --all | <arquivo.html> <kind>/<slug> <url>')
    process.exit(1)
  }
}
