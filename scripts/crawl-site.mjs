#!/usr/bin/env node
/**
 * Lê o site antigo publicado (Canva) e salva o HTML atual de cada página em
 * source/canva/live/<host>__<slug>.html, com relatório em docs/CRAWL.md.
 *
 * O site usa dois hosts: rodsaudiovisual.com e rodsaudiovisual.my.canva.site
 * (várias categorias só existem no segundo). Para cada página, o script testa
 * em qual endereço as mídias realmente respondem e grava isso no relatório e
 * em source/canva/live/pages.json (usado na importação).
 *
 * Uso: node scripts/crawl-site.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'

const HOSTS = ['rodsaudiovisual.com', 'rodsaudiovisual.my.canva.site']
const OUT = 'source/canva/live'
mkdirSync(OUT, { recursive: true })
const UA = { 'user-agent': 'Mozilla/5.0 (compatible; migracao-rods)' }

const get = async (url) => {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: UA })
    return { status: res.status, url: res.url, text: res.ok ? await res.text() : '' }
  } catch (e) {
    return { status: 0, url, text: '', error: String(e) }
  }
}
const head = async (url, extra = {}) => {
  try {
    const res = await fetch(url, { method: 'GET', headers: { ...UA, range: 'bytes=0-15', ...extra } })
    const buf = Buffer.from(await res.arrayBuffer())
    return {
      status: res.status,
      type: res.headers.get('content-type') ?? '',
      sig: buf.subarray(4, 8).toString('latin1'),
    }
  } catch (e) {
    return { status: 0, type: String(e), sig: '' }
  }
}

const links = (html, pageUrl) => {
  const out = new Set()
  const add = (raw) => {
    try {
      const u = new URL(raw.replace(/\\\//g, '/'), pageUrl)
      if (!HOSTS.includes(u.host)) return
      if (/\/_assets\/|\/_footer|\/_online|\.[a-z0-9]{2,5}$/i.test(u.pathname)) return
      out.add(`https://${u.host}${u.pathname.replace(/\/?$/, '/')}`)
    } catch {}
  }
  for (const m of html.matchAll(/href="([^"#]+)"/g)) add(m[1])
  for (const m of html.matchAll(/"(https?:\\?\/\\?\/[^"]+)"/gi)) add(m[1])
  return [...out]
}

const seen = new Map()
const queue = HOSTS.map((h) => `https://${h}/`)
// categorias conhecidas pelo briefing, caso não estejam linkadas
for (const s of [
  'gastronomia',
  'eventos',
  'estetica',
  'influencer',
  'gym',
  'moda',
  'restaurantes',
  'newborn',
  '15-anos',
  'gestante',
  'fotografia',
  'videos',
])
  for (const h of HOSTS) queue.push(`https://${h}/${s}/`)

while (queue.length && seen.size < 80) {
  const url = queue.shift()
  if (seen.has(url)) continue
  const page = await get(url)
  const u = new URL(url)
  const info = {
    url,
    status: page.status,
    title: page.text.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? '',
    base: page.text.match(/<base href="([^"]+)"/)?.[1] ?? null,
    mp4: new Set(page.text.match(/_assets\/video\/[0-9a-f]+\.mp4/g) ?? []).size,
    jpg: new Set(page.text.match(/_assets\/media\/[0-9a-f]+\.(?:jpe?g|png|webp)/g) ?? []).size,
    file: null,
    mediaBase: null,
  }
  seen.set(url, info)
  if (!page.text || !page.text.includes("window['bootstrap']")) continue
  const slug = u.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '__') || '_home'
  info.file = `${OUT}/${u.host}__${slug}.html`
  writeFileSync(info.file, page.text)
  for (const l of links(page.text, url)) if (!seen.has(l)) queue.push(l)

  // Em qual endereço as mídias desta página respondem?
  const asset = page.text.match(/_assets\/(?:video\/[0-9a-f]+\.mp4|media\/[0-9a-f]+\.jpg)/)?.[0]
  if (asset) {
    const candidates = []
    for (const h of HOSTS) {
      candidates.push(`https://${h}${info.base ?? u.pathname}`)
      candidates.push(`https://${h}/`)
    }
    info.tests = []
    for (const c of [...new Set(candidates)]) {
      const r = await head(new URL(asset, c).href, { referer: url })
      info.tests.push({ base: c, ...r })
      if (!info.mediaBase && (r.status === 200 || r.status === 206)) info.mediaBase = c
    }
  }
  console.log(
    `${info.status} ${url} “${info.title}” mp4=${info.mp4} img=${info.jpg} mídia→${info.mediaBase ?? 'não encontrada'}`,
  )
}

const pages = [...seen.values()].filter((p) => p.file)
writeFileSync(
  `${OUT}/pages.json`,
  JSON.stringify(
    pages.map(({ tests, ...p }) => p),
    null,
    2,
  ) + '\n',
)

const r = ['# Crawl do site antigo', '', `Executado em ${new Date().toISOString()}.`, '', '## Páginas com conteúdo', '']
r.push('| URL | Título | MP4 | Imagens | Mídias servidas em |', '|---|---|---|---|---|')
for (const p of pages) r.push(`| ${p.url} | ${p.title} | ${p.mp4} | ${p.jpg} | ${p.mediaBase ?? '—'} |`)
r.push('', '## Testes de acesso às mídias', '')
for (const p of pages)
  for (const t of p.tests ?? []) r.push(`- ${p.url} · base \`${t.base}\` → HTTP ${t.status} ${t.type} ${t.sig}`)
r.push('', '## Endereços sem página', '')
for (const p of seen.values()) if (!p.file) r.push(`- ${p.url} → HTTP ${p.status}`)
writeFileSync('docs/CRAWL.md', r.join('\n') + '\n')
