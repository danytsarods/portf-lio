import { SUPABASE_KEY, SUPABASE_URL } from '../lib/supabase-config'
import { photoCategories, videoCategories, type Category } from './categories'
import { contact, copy, creator, refreshContactLinks, services, site, type ContactConfig, type Service } from './config'
import { buildWorks, type UploadedWork, type WorkOverrides } from './works'

/** Conteúdo salvo pelo painel /admin (tabela `site_content`, uma linha por chave). */
export type ContentValues = {
  site: Pick<typeof site, 'description' | 'tagline'>
  copy: typeof copy
  contact: ContactConfig
  creator: typeof creator
  services: Service[]
  categories: Record<string, Pick<Category, 'title' | 'kicker' | 'intro'>>
  work_overrides: WorkOverrides
}
export type ContentKey = keyof ContentValues
export type RemoteContent = { content: Partial<ContentValues>; works: UploadedWork[] }

export const categoryKey = (c: Pick<Category, 'kind' | 'slug'>) => `${c.kind}/${c.slug}`

const rest = (path: string, signal: AbortSignal) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    signal,
  }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  })

/** Busca o conteúdo do painel. Em caso de erro ou demora, devolve null e o site usa o conteúdo do projeto. */
export async function fetchRemoteContent(timeoutMs = 3500): Promise<RemoteContent | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const [rows, works] = await Promise.all([
      rest('site_content?select=key,value', ctrl.signal) as Promise<{ key: ContentKey; value: unknown }[]>,
      rest('works?select=*&order=position.asc', ctrl.signal) as Promise<UploadedWork[]>,
    ])
    return { content: Object.fromEntries(rows.map((r) => [r.key, r.value])), works }
  } catch (err) {
    console.warn('Conteúdo do painel indisponível; usando o conteúdo do projeto.', err)
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Valores originais (do código), usados como base para cada alteração do painel. */
const defaults = structuredClone({
  site: { description: site.description, tagline: site.tagline },
  copy,
  contact,
  creator,
  services,
  categories: Object.fromEntries(
    [...videoCategories, ...photoCategories].map((c) => [
      categoryKey(c),
      { title: c.title, kicker: c.kicker, intro: c.intro },
    ]),
  ),
}) satisfies Omit<ContentValues, 'work_overrides'>

export const defaultContent = () => structuredClone(defaults)

const replace = <T extends object>(target: T, value: T) => {
  for (const k of Object.keys(target)) delete (target as Record<string, unknown>)[k]
  Object.assign(target, value)
}

/** Aplica o conteúdo do painel sobre os módulos de conteúdo (antes de renderizar o app). */
export function applyRemoteContent({ content: c, works }: RemoteContent) {
  Object.assign(site, defaults.site, c.site)
  replace(copy, { ...defaults.copy, ...c.copy })
  replace(contact, { ...defaults.contact, ...c.contact })
  refreshContactLinks()
  replace(creator, { ...defaults.creator, ...c.creator })
  services.splice(0, services.length, ...(c.services?.length ? c.services : defaults.services))
  for (const cat of [...videoCategories, ...photoCategories]) {
    const key = categoryKey(cat)
    Object.assign(cat, defaults.categories[key], c.categories?.[key])
  }
  buildWorks(works, c.work_overrides)
}
