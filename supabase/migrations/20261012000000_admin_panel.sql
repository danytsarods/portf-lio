-- Painel /admin: textos editáveis, trabalhos enviados e arquivos.
-- Já aplicado no projeto Supabase kebowxjbfvqqqixlvqpp.

-- Quem pode editar o site
create table public.admins (email text primary key);
alter table public.admins enable row level security;
insert into public.admins (email) values ('rodsaudiovisual@gmail.com');

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email'))
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.is_admin() from anon;

-- Textos editáveis (uma linha por seção, valor em JSON)
create table public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
create policy "site_content leitura pública" on public.site_content for select to anon, authenticated using (true);
create policy "site_content admin insere" on public.site_content for insert to authenticated with check (public.is_admin());
create policy "site_content admin altera" on public.site_content for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "site_content admin remove" on public.site_content for delete to authenticated using (public.is_admin());

-- Trabalhos enviados pelo painel
create table public.works (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('video', 'photo')),
  category text not null,
  title text,
  alt text,
  src text not null,
  small text,
  small_width int,
  poster text,
  width int not null check (width > 0),
  height int not null check (height > 0),
  duration_seconds numeric,
  storage_paths text[] not null default '{}',
  position double precision not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index works_kind_category_position on public.works (kind, category, position);
alter table public.works enable row level security;
create policy "works leitura pública" on public.works for select to anon, authenticated using (true);
create policy "works admin insere" on public.works for insert to authenticated with check (public.is_admin());
create policy "works admin altera" on public.works for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "works admin remove" on public.works for delete to authenticated using (public.is_admin());

-- Arquivos (leitura pública pela URL, escrita só para admins). 50 MB é o limite do plano gratuito.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']);

create policy "media admin insere" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media admin altera" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin remove" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin lista" on storage.objects for select to authenticated using (bucket_id = 'media' and public.is_admin());
