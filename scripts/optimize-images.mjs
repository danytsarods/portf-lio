#!/usr/bin/env node
/**
 * Gera as versões web da marca e das fotos a partir dos originais em source/.
 * Os originais nunca são alterados.
 *
 * Uso: npm run images
 *
 * Marca (source/brand/rods-audiovisual-logo-original.png, branca sobre transparente):
 *   - só a margem transparente é aparada; desenho, cor e proporção são preservados
 *   - public/brand/logo-{240,480,960}.png  (cabeçalho, rodapé, menu)
 *   - favicon/ícones: palavra "RODS" recortada do próprio arquivo, sobre o preto do site
 * Fotos (source/fotos/*.jpg):
 *   - public/media/site/<nome>-<largura>.{avif,webp,jpg}, sem upscale
 *   - src/content/photos.json com dimensões e caminhos, usado pelo site
 */
import sharp from 'sharp'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join, parse } from 'node:path'

const INK = { r: 11, g: 11, b: 11, alpha: 1 }

// ---------- Marca ----------
const LOGO = 'source/brand/rods-audiovisual-logo-original.png'
mkdirSync('public/brand', { recursive: true })

// área útil: pixels com alpha > 8 (evita incluir ruído quase invisível)
const { data, info } = await sharp(LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const bbox = (yFrom = 0, yTo = info.height) => {
  let x0 = info.width,
    y0 = info.height,
    x1 = 0,
    y1 = 0
  for (let y = yFrom; y < yTo; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
  return { x0, y0, x1, y1 }
}
const full = bbox()
// linha vazia entre "RODS" e "AUDIOVISUAL"
let gap = full.y0
for (let y = full.y0; y < full.y1; y++) {
  let empty = true
  for (let x = full.x0; x <= full.x1 && empty; x++) if (data[(y * info.width + x) * 4 + 3] > 8) empty = false
  if (empty) {
    gap = y
    break
  }
}
const word = bbox(full.y0, gap)

const pad = 8
const trim = {
  left: full.x0 - pad,
  top: full.y0 - pad,
  width: full.x1 - full.x0 + 1 + pad * 2,
  height: full.y1 - full.y0 + 1 + pad * 2,
}
const logo = sharp(LOGO).extract(trim)
const trimmed = await logo.png().toBuffer()
for (const w of [240, 480, 960]) {
  await sharp(trimmed)
    .resize({ width: w, kernel: 'lanczos3' })
    .png({ compressionLevel: 9, palette: false })
    .toFile(`public/brand/logo-${w}.png`)
}

const wordBuf = await sharp(LOGO)
  .extract({ left: word.x0, top: word.y0, width: word.x1 - word.x0 + 1, height: word.y1 - word.y0 + 1 })
  .png()
  .toBuffer()
const icon = async (size, file, ratio = 0.78) => {
  const inner = await sharp(wordBuf)
    .resize({ width: Math.round(size * ratio), kernel: 'lanczos3' })
    .toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: INK } })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toFile(file)
}
await icon(32, 'public/favicon-32.png', 0.86)
await icon(180, 'public/apple-touch-icon.png')
await icon(512, 'public/icon-512.png')
console.log(
  `✓ marca: recorte ${trim.width}×${trim.height} (proporção ${(trim.width / trim.height).toFixed(3)}), ícones gerados`,
)

// ---------- Fotos ----------
const out = 'public/media/site'
mkdirSync(out, { recursive: true })
const widths = [640, 960, 1280, 1600, 2000]
const manifest = {}
for (const f of readdirSync('source/fotos').filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const name = parse(f).name
  const src = join('source/fotos', f)
  const meta = await sharp(src).metadata()
  const ws = widths.filter((w) => w <= meta.width)
  if (!ws.includes(meta.width) && meta.width < 2000) ws.push(meta.width)
  for (const w of ws) {
    const base = sharp(src).rotate().resize({ width: w, withoutEnlargement: true })
    await base.clone().avif({ quality: 58, effort: 6 }).toFile(`${out}/${name}-${w}.avif`)
    await base.clone().webp({ quality: 80 }).toFile(`${out}/${name}-${w}.webp`)
    await base.clone().jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(`${out}/${name}-${w}.jpg`)
  }
  manifest[name] = { width: meta.width, height: meta.height, widths: ws, base: `/media/site/${name}` }
  console.log(`✓ ${name}: ${meta.width}×${meta.height} → ${ws.join(', ')}`)
}
writeFileSync('src/content/photos.json', JSON.stringify(manifest, null, 2) + '\n')

// ---------- Imagem de compartilhamento (Open Graph 1200×630) ----------
{
  const W = 1200,
    H = 630
  const portrait = await sharp('source/fotos/creator-estudio-escuro.jpg').resize({ height: H }).toBuffer()
  const photoW = (await sharp(portrait).metadata()).width
  // esmaece só a borda esquerda da foto para fundir com o preto (o rosto fica intacto)
  const fade = Buffer.from(
    `<svg width="${photoW}" height="${H}"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".16" stop-color="#fff" stop-opacity="1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  )
  const faded = await sharp(portrait)
    .ensureAlpha()
    .composite([{ input: fade, blend: 'dest-in' }])
    .png()
    .toBuffer()
  const logoW = 470
  const logoBuf = await sharp(trimmed).resize({ width: logoW, kernel: 'lanczos3' }).toBuffer()
  const logoH = Math.round(logoW * (trim.height / trim.width))
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } })
    .composite([
      { input: faded, left: W - photoW - 40, top: 0 },
      { input: logoBuf, left: 90, top: Math.round((H - logoH) / 2) },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile('public/og-image.jpg')
  console.log('✓ og-image.jpg')
}
