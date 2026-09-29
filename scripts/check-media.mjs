#!/usr/bin/env node
/**
 * Confere se cada mídia usada pelo site está acessível: cópia local em /public
 * (via manifesto) ou, na falta dela, a URL original. Uso: npm run media:check
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const manifest = JSON.parse(readFileSync('src/content/media-manifest.json', 'utf8'))
let ok = 0
const bad = []
for (const kind of ['videos', 'fotografia']) {
  const dir = join('src/content/imported', kind)
  if (!existsSync(dir)) continue
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(join(dir, f), 'utf8'))
    const urls = [
      ...d.videos.flatMap((v) => [v.video.url, v.poster.url, v.preview?.url]),
      ...d.photos.flatMap((p) => [p.large.url, p.small.url]),
    ].filter(Boolean)
    for (const url of new Set(urls)) {
      const local = manifest[url]
      if (local && existsSync('public' + local) && statSync('public' + local).size > 0) {
        ok++
        continue
      }
      const res = await fetch(url, { method: 'HEAD' }).catch(() => null)
      if (res?.ok) ok++
      else bad.push(`${kind}/${f} ${url} → ${local ? 'arquivo local ausente' : `remoto ${res?.status ?? 'erro'}`}`)
    }
  }
}
bad.forEach((b) => console.log('✗ ' + b))
console.log(`${ok}/${ok + bad.length} mídias acessíveis`)
process.exitCode = bad.length ? 1 : 0
