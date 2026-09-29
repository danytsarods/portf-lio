#!/usr/bin/env node
/**
 * Lê o site antigo publicado (Canva) e salva o HTML atual de cada página em
 * source/canva/live/<slug>.html, além de um relatório em docs/CRAWL.md.
 * O Canva regenera os nomes dos arquivos a cada publicação, então as mídias
 * devem sempre ser extraídas do HTML publicado mais recente.
 *
 * Uso: node scripts/crawl-site.mjs [https://rodsaudiovisual.com]
 */
import { mkdirSync, writeFileSync } from 'node:fs'

const origin = (process.argv[2] ?? 'https://rodsaudiovisual.com').replace(/\/$/, '')
const host = new URL(origin).host
const OUT = 'source/canva/live'
mkdirSync(OUT, { recursive: true })
const report = [`# Crawl de ${origin}`, '', `Executado em ${new Date().toISOString()}.`, '']

const get = async (url) => {
  const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (migracao RODS)' } })
  return { status: res.status, url: res.url, type: res.headers.get('content-type') ?? '', text: res.ok ? await res.text() : '' }
}

/** Caminhos internos citados no HTML (href) e nos dados serializados do Canva. */
const internalPaths = (html, pageUrl) => {
  const out = new Set()
  const add = (raw) => {
    try {
      const u = new URL(raw.replace(/\\\//g, '/'), pageUrl)
      if (u.host !== host) return
      if (/\/_assets\/|\/_footer|\/_online|\.(js|css|png|jpe?g|mp4|webp|svg|json|ico|woff2?|otf|m3u|m4a)$/i.test(u.pathname)) return
      out.add(u.pathname.replace(/\/?$/, '/'))
    } catch {}
  }
  for (const m of html.matchAll(/href="([^"#]+)"/g)) add(m[1])
  for (const m of html.matchAll(/"(https?:\\?\/\\?\/[^"]+|\/[a-z0-9][a-z0-9\-_/]*)"/gi)) add(m[1])
  return [...out]
}

const seen = new Map()
const queue = ['/']
while (queue.length && seen.size < 40) {
  const path = queue.shift()
  if (seen.has(path)) continue
  const page = await get(origin + path).catch((e) => ({ status: 0, url: origin + path, type: '', text: '', error: String(e) }))
  const isCanva = page.text.includes("window['bootstrap']")
  const base = page.text.match(/<base href="([^"]+)"/)?.[1] ?? null
  const title = page.text.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
  const videos = (page.text.match(/_assets\/video\/[0-9a-f]+\.mp4/g) ?? []).length
  seen.set(path, { ...page, isCanva, base, title, videos })
  if (page.text) {
    const slug = path === '/' ? '_home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '__')
    writeFileSync(`${OUT}/${slug}.html`, page.text)
    for (const p of internalPaths(page.text, page.url)) if (!seen.has(p)) queue.push(p)
  }
  console.log(`${page.status} ${path} ${title ? `“${title}”` : ''} base=${base} canva=${isCanva} mp4refs=${videos}`)
}

report.push('| Caminho | HTTP | Título | `<base>` | Referências MP4 |', '|---|---|---|---|---|')
for (const [p, r] of seen) report.push(`| \`${p}\` | ${r.status} | ${r.title} | ${r.base ?? ''} | ${r.videos} |`)

// Teste: a primeira mídia de cada página realmente responde?
report.push('', '## Teste de acesso a uma mídia por página', '')
for (const [p, r] of seen) {
  const asset = r.text.match(/_assets\/video\/[0-9a-f]+\.mp4/)?.[0]
  if (!asset) continue
  const url = new URL(asset, new URL(r.base ?? p, origin)).href
  const res = await fetch(url, { method: 'HEAD' }).catch(() => null)
  report.push(`- \`${p}\` → ${url} → HTTP ${res?.status ?? 'erro'} ${res?.headers.get('content-type') ?? ''}`)
}
writeFileSync('docs/CRAWL.md', report.join('\n') + '\n')
console.log(report.join('\n'))
