import manifest from './media-manifest.json'

/**
 * Resolve a URL de uma mídia: se o arquivo já foi migrado para /public/media
 * (via `npm run media:fetch`), usa a cópia local; senão, usa a URL original.
 */
const local = manifest as Record<string, string>

export const mediaUrl = (originalUrl: string) => local[originalUrl] ?? originalUrl
export const isMigrated = (originalUrl: string) => originalUrl in local
