#!/usr/bin/env node
/**
 * Gera folhas de contato (docs/contact-sheets/<kind>-<slug>.jpg) com todas as
 * fotos, capas de vídeo e fundos de cada página importada, numerados na ordem
 * do inventário. Serve para conferir categorias e a classificação de fundos.
 */
import sharp from 'sharp'
import { readdirSync, readFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const manifest = JSON.parse(readFileSync('src/content/media-manifest.json', 'utf8'))
const OUT = 'docs/contact-sheets'
mkdirSync(OUT, { recursive: true })
const TW = 180,
  TH = 240,
  PAD = 8,
  COLS = 8,
  LABEL = 22

const load = async (url) => {
  const local = manifest[url]
  if (local && existsSync('public' + local)) return readFileSync('public' + local)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
const tile = async (url, label) => {
  let img
  try {
    img = await sharp(await load(url))
      .resize(TW, TH, { fit: 'contain', background: '#1a1a1a' })
      .toBuffer()
  } catch {
    img = await sharp({ create: { width: TW, height: TH, channels: 3, background: '#400' } })
      .png()
      .toBuffer()
  }
  const text = Buffer.from(
    `<svg width="${TW}" height="${LABEL}"><rect width="100%" height="100%" fill="#000"/><text x="6" y="16" font-family="DejaVu Sans, sans-serif" font-size="13" fill="#fff">${label}</text></svg>`,
  )
  return sharp({ create: { width: TW, height: TH + LABEL, channels: 3, background: '#000' } })
    .composite([
      { input: img, top: 0, left: 0 },
      { input: text, top: TH, left: 0 },
    ])
    .png()
    .toBuffer()
}

for (const kind of ['videos', 'fotografia', 'review']) {
  const dir = join('src/content/imported', kind)
  if (!existsSync(dir)) continue
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(join(dir, f), 'utf8'))
    const items = [
      ...d.videos.map((v, i) => [v.poster.url, `V${i + 1} ${v.durationSeconds}s ${v.orientation[0]}`]),
      ...d.photos.map((p, i) => [p.small.url, `F${i + 1} ${p.width}x${p.height}`]),
      ...d.backgrounds.map((b, i) => [b.small.url, `BG${i + 1}`]),
    ]
    if (!items.length) continue
    const tiles = await Promise.all(items.map(([u, l]) => tile(u, l)))
    const rows = Math.ceil(tiles.length / COLS)
    const W = COLS * (TW + PAD) + PAD,
      H = rows * (TH + LABEL + PAD) + PAD
    const name = `${kind}-${f.replace(/\.json$/, '')}.jpg`
    await sharp({ create: { width: W, height: H, channels: 3, background: '#222' } })
      .composite(
        tiles.map((t, i) => ({
          input: t,
          left: PAD + (i % COLS) * (TW + PAD),
          top: PAD + Math.floor(i / COLS) * (TH + LABEL + PAD),
        })),
      )
      .jpeg({ quality: 78 })
      .toFile(join(OUT, name))
    console.log(`✓ ${name} (${items.length} itens)`)
  }
}
