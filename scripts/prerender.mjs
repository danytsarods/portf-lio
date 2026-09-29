#!/usr/bin/env node
/**
 * Pós-build: gera dist/<rota>/index.html para cada rota do site com título,
 * descrição, canonical e Open Graph próprios. Assim as URLs diretas funcionam
 * em qualquer hospedagem estática e os links compartilhados exibem a prévia certa.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { videoCategories, photoCategories } from '../src/content/categories.ts'

const SITE = 'https://rodsaudiovisual.com'
const NAME = 'RODS AUDIOVISUAL'
const DEFAULT_DESC =
  'Produção audiovisual, fotografia e conteúdo estratégico para marcas que querem ser lembradas. Vídeos institucionais, Reels, stop motion, drone e bastidores.'

const routes = [
  {
    path: '/sobre',
    title: 'Sobre',
    desc: 'Danytsa: formação em Marketing, 8 anos na área comercial e 3 anos no audiovisual. Estratégia, comunicação e produção de conteúdo.',
  },
  {
    path: '/servicos',
    title: 'Serviços',
    desc: 'Vídeos institucionais, fotografia profissional, conteúdos para Reels, stop motion e lifestyle, imagens com drone, making of e bastidores.',
  },
  {
    path: '/videos',
    title: 'Vídeos',
    desc: 'Portfólio de vídeos da RODS AUDIOVISUAL: gastronomia, eventos, estética, influencer, gym e moda.',
  },
  {
    path: '/fotografia',
    title: 'Fotografia',
    desc: 'Fotografia profissional da RODS AUDIOVISUAL: moda, restaurantes, newborn, 15 anos e gestante.',
  },
  {
    path: '/contato',
    title: 'Contato',
    desc: 'Fale com a RODS AUDIOVISUAL sobre o seu projeto de vídeo, fotografia ou conteúdo para redes.',
  },
  ...videoCategories.map((c) => ({ path: `/videos/${c.slug}`, title: `${c.title} · Vídeos`, desc: c.intro })),
  ...photoCategories.map((c) => ({ path: `/fotografia/${c.slug}`, title: `${c.title} · Fotografia`, desc: c.intro })),
]

const dist = 'dist'
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const render = ({ path, title, desc = DEFAULT_DESC, noindex }) => {
  const fullTitle = `${title} — ${NAME}`
  const url = SITE + path
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(fullTitle)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
  if (noindex) html = html.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>')
  return html
}

for (const r of routes) {
  const dir = join(dist, r.path)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), render(r))
}
writeFileSync(join(dist, '404.html'), render({ path: '/404', title: 'Página não encontrada', noindex: true }))

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', ...routes.map((r) => r.path)].map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)
console.log(`✓ pré-renderizadas ${routes.length} rotas + 404.html + sitemap.xml`)
