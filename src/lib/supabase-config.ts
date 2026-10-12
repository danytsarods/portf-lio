/**
 * Projeto Supabase usado pelo painel /admin. A chave publicável é pública por
 * definição (as permissões ficam nas políticas RLS do banco); pode ser trocada
 * pelas variáveis VITE_SUPABASE_URL e VITE_SUPABASE_KEY.
 */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? 'https://kebowxjbfvqqqixlvqpp.supabase.co'
export const SUPABASE_KEY: string =
  import.meta.env.VITE_SUPABASE_KEY ?? 'sb_publishable_nb1iv7v9Mbcu7AApDqVzVw_dHihniqp'

export const MEDIA_BUCKET = 'media'
