#!/usr/bin/env node
/**
 * Verifica se cada mídia usada pelo site está acessível (cópia local em /public
 * ou URL original). Uso: npm run media:check
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const manifest = JSON.parse(readFileSync('src/content/media-manifest.json', 'utf8'))
const rows = []
for (const f of readdirSync('src/content/imported').filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join('src/content/imported', f), 'utf8'))
  for (const v of data.videos) {
    const preview = v.variants.dashVideo.find((d) => d.height === 640 || d.width === 640)
    for (const [kind, url] of [
      ['vídeo', v.video.url],
      ['capa', v.poster.url],
      ['prévia', preview?.url],
    ]) {
      if (!url) continue
      const local = manifest[url]
      if (local) {
        const file = join('public', local)
        rows.push({ f, kind, url, ok: existsSync(file) && statSync(file).size > 0, where: 'local' })
        continue
      }
      try {
        const res = await fetch(url, { method: 'HEAD' })
        rows.push({ f, kind, url, ok: res.ok, where: `remoto ${res.status} ${res.headers.get('content-type') ?? ''}` })
      } catch (err) {
        rows.push({ f, kind, url, ok: false, where: `remoto — ${err.cause?.code ?? err.message}` })
      }
    }
  }
}
for (const r of rows) console.log(`${r.ok ? '✓' : '✗'} [${r.f}] ${r.kind.padEnd(6)} ${r.where.padEnd(28)} ${r.url}`)
const bad = rows.filter((r) => !r.ok).length
console.log(`\n${rows.length - bad}/${rows.length} mídias acessíveis`)
process.exitCode = bad ? 1 : 0
