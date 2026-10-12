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
  if (/email not confirmed/i.test(msg)) return 'Confirme o seu e-mail pelo link que enviamos antes de entrar.'
  if (/row-level security|violates row-level|unauthorized|not allowed/i.test(msg))
    return 'Este usuário não tem permissão para editar o site.'
  if (/exceeded the maximum allowed size|payload too large|413/i.test(msg))
    return 'Arquivo grande demais (máximo de 50 MB). Exporte o vídeo em 1080p ou 720p e tente de novo.'
  if (/already registered/i.test(msg)) return 'Este e-mail já tem acesso. Use “Entrar” ou “Esqueci a senha”.'
  if (/password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (/failed to fetch|network/i.test(msg)) return 'Sem conexão com o servidor. Verifique a internet e tente de novo.'
  return msg
}
