import { useEffect } from 'react'
import { site } from '../content/config'

type Meta = { title?: string; description?: string; path: string; image?: string; noindex?: boolean }

const setMeta = (attr: 'name' | 'property', key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

export const pageTitle = (title?: string) =>
  title ? `${title} — ${site.name}` : `${site.name} — Produção audiovisual e fotografia`

/** Atualiza título, descrição, canonical e Open Graph da página atual. */
export function usePageMeta({ title, description = site.description, path, image, noindex }: Meta) {
  useEffect(() => {
    const fullTitle = pageTitle(title)
    const url = new URL(path, site.url).href
    const img = image ? new URL(image, site.url).href : `${site.url}/og-image.jpg`
    document.title = fullTitle
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('name', 'robots', noindex ? 'noindex' : 'index,follow')
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [title, description, path, image, noindex])
}
