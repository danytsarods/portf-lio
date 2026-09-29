#!/usr/bin/env node
/**
 * Migra as mídias do site antigo para /public/media e atualiza
 * src/content/media-manifest.json (URL original → caminho local).
 *
 * Uso: npm run media:fetch
 *
 * Para cada vídeo baixa: MP4 progressivo 720p (com áudio, usado no player),
 * posterframe (capa) e a variante 360p sem áudio (prévias silenciosas).
 * Também baixa os ícones (favicon) do site antigo. Cada arquivo é validado
 * (status HTTP, tipo e assinatura do arquivo) antes de entrar no manifesto.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join, basename } from 'node:path'

const IMPORTED = 'src/content/imported'
const MANIFEST = 'src/content/media-manifest.json'
const OUT = 'public/media'

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
const failures = []
let downloaded = 0
let skipped = 0

const signatureOk = (buf, kind) => {
  if (kind === 'video') return buf.subarray(4, 8).toString('latin1') === 'ftyp'
  if (kind === 'image') return (buf[0] === 0xff && buf[1] === 0xd8) || buf.subarray(1, 4).toString('latin1') === 'PNG'
  return true
}

async function fetchOne(url, slug, kind) {
  const file = join(OUT, slug, basename(new URL(url).pathname))
  const publicPath = '/' + file.replace(/^public\//, '')
  if (existsSync(file) && statSync(file).size > 0) {
    manifest[url] = publicPath
    skipped++
    return
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (!buf.length) throw new Error('arquivo vazio')
    if (!signatureOk(buf, kind)) throw new Error(`assinatura inválida (${res.headers.get('content-type')})`)
    mkdirSync(join(OUT, slug), { recursive: true })
    writeFileSync(file, buf)
    manifest[url] = publicPath
    downloaded++
    console.log(`  ✓ ${publicPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`)
  } catch (err) {
    failures.push({ url, slug, kind, error: String(err.message ?? err) })
    console.log(`  ✗ ${url} — ${err.message ?? err}`)
  }
}

for (const f of readdirSync(IMPORTED).filter((f) => f.endsWith('.json'))) {
  const slug = f.replace(/\.json$/, '')
  const data = JSON.parse(readFileSync(join(IMPORTED, f), 'utf8'))
  console.log(`\n${slug}: ${data.videos.length} vídeos`)
  for (const v of data.videos) {
    await fetchOne(v.video.url, slug, 'video')
    await fetchOne(v.poster.url, slug, 'image')
    const preview = v.variants.dashVideo.find((d) => d.height === 640 || d.width === 640)
    if (preview) await fetchOne(preview.url, slug, 'video')
  }
  for (const icon of data.icons ?? []) await fetchOne(icon.url, 'brand', 'image')
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\nBaixados: ${downloaded} · Já existentes: ${skipped} · Falhas: ${failures.length}`)
if (failures.length) {
  writeFileSync('media-failures.json', JSON.stringify(failures, null, 2))
  console.log('Lista de falhas em media-failures.json')
  process.exitCode = 1
}
