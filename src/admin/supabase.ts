import { createClient } from '@supabase/supabase-js'
import { MEDIA_BUCKET, SUPABASE_KEY, SUPABASE_URL } from '../lib/supabase-config'
import type { ContentKey, ContentValues } from '../content/remote'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const media = () => supabase.storage.from(MEDIA_BUCKET)

export async function saveContent<K extends ContentKey>(key: K, value: ContentValues[K]) {
  const { error } = await supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function loadContent(): Promise<Partial<ContentValues>> {
  const { data, error } = await supabase.from('site_content').select('key,value')
  if (error) throw error
  return Object.fromEntries(data.map((r) => [r.key, r.value]))
}

/** Mensagem legível para os erros mais comuns do Supabase. */
export function errorMessage(err: unknown): string {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err && 'message' in err
        ? String(err.message)
        : String(err)
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.'
  if (/row-level security|violates row-level|unauthorized|not allowed/i.test(msg))
    return 'Este usuário não tem permissão para editar o site.'
  if (/exceeded the maximum allowed size|payload too large|413/i.test(msg))
    return 'Arquivo grande demais para o limite atual do armazenamento.'
  if (/failed to fetch|network/i.test(msg)) return 'Sem conexão com o servidor. Verifique a internet e tente de novo.'
  return msg
}
