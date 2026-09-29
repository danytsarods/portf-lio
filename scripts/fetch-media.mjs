#!/usr/bin/env node
/**
 * Migra as mídias do site antigo para /public/media e atualiza
 * src/content/media-manifest.json (URL original → caminho local).
 *
 * Uso: npm run media:fetch
 *
 * Lê src/content/imported/{videos,fotografia}/*.json (gerados por import-canva):
 *   vídeos → MP4 progressivo 720p (com áudio, usado no player), capa e prévia 360p sem áudio
 *   fotos  → versão grande (lightbox) e versão média (galeria)
 * Cada arquivo é validado (HTTP e assinatura do arquivo) antes de entrar no manifesto.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join, basename } from 'node:path'

const IMPORTED = 'src/content/imported'
const MANIFEST = 'src/content/media-manifest.json'
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
const failures = []
let downloaded = 0
let skipped = 0
let bytes = 0

const signatureOk = (buf, kind) => {
  if (kind === 'video') return buf.subarray(4, 8).toString('latin1') === 'ftyp'
  return (
    (buf[0] === 0xff && buf[1] === 0xd8) ||
    buf.subarray(1, 4).toString('latin1') === 'PNG' ||
    buf.subarray(0, 4).toString('latin1') === 'RIFF'
  )
}

async function fetchOne(url, dir, kind) {
  if (!url) return
  const file = join('public/media', dir, basename(new URL(url).pathname))
  const publicPath = '/' + file.replace(/^public\//, '')
  if (existsSync(file) && statSync(file).size > 0) {
    manifest[url] = publicPath
    skipped++
    return
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (migracao-rods)' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (!buf.length) throw new Error('arquivo vazio')
      if (!signatureOk(buf, kind)) throw new Error(`assinatura inválida (${res.headers.get('content-type')})`)
      mkdirSync(join('public/media', dir), { recursive: true })
      writeFileSync(file, buf)
      manifest[url] = publicPath
      downloaded++
      bytes += buf.length
      console.log(`  ✓ ${publicPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`)
      return
    } catch (err) {
      if (attempt === 3) {
        failures.push({ url, dir, kind, error: String(err.message ?? err) })
        console.log(`  ✗ ${url} — ${err.message ?? err}`)
      } else await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }
}

for (const kind of ['videos', 'fotografia']) {
  const dir = join(IMPORTED, kind)
  if (!existsSync(dir)) continue
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const slug = f.replace(/\.json$/, '')
    const data = JSON.parse(readFileSync(join(dir, f), 'utf8'))
    console.log(`\n${kind}/${slug}: ${data.videos.length} vídeos, ${data.photos.length} fotos`)
    for (const v of data.videos) {
      await fetchOne(v.video.url, `${kind}/${slug}`, 'video')
      await fetchOne(v.poster.url, `${kind}/${slug}`, 'image')
      await fetchOne(v.preview?.url, `${kind}/${slug}`, 'video')
    }
    for (const p of data.photos) {
      await fetchOne(p.large.url, `${kind}/${slug}`, 'image')
      if (p.small.url !== p.large.url) await fetchOne(p.small.url, `${kind}/${slug}`, 'image')
    }
  }
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(
  `\nBaixados: ${downloaded} (${(bytes / 1024 / 1024).toFixed(1)} MB) · Já existentes: ${skipped} · Falhas: ${failures.length}`,
)
if (failures.length) {
  writeFileSync('media-failures.json', JSON.stringify(failures, null, 2))
  process.exitCode = 1
}
