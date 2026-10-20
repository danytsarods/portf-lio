# RODS AUDIOVISUAL — Portfólio

Nova versão do portfólio da RODS AUDIOVISUAL: produção audiovisual, fotografia e conteúdo estratégico.
Site estático em **React 19 + TypeScript + Tailwind CSS 4 + Vite**, com um painel em `/admin` (Supabase) para a RODS atualizar trabalhos, textos e contatos sem mexer no código.

Tecnologia desenvolvida pela PMG Code.

## Como rodar

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # typecheck + build + pré-renderização das rotas → dist/
npm run preview    # serve o build localmente
```

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Hero com trabalhos reais, destaques, creator, serviços, categorias e chamada para contato |
| `/sobre` | Apresentação da creator (Danytsa) |
| `/servicos` | Os seis serviços |
| `/videos` | Todos os vídeos, com filtro por categoria (`?categoria=`) |
| `/videos/:categoria` | gastronomia, eventos, estetica, influencer, gym, moda |
| `/fotografia` | Índice das categorias de fotografia |
| `/fotografia/:categoria` | moda, restaurantes, newborn, 15-anos, gestante |
| `/contato` | Canais diretos (WhatsApp, Instagram, e-mail) |
| qualquer outra | Página 404 com links de navegação |

Cada vídeo pode ser aberto por link direto: `/videos/gastronomia?assistir=gastronomia-03`.

## Painel de edição (`/admin`)

Em `rodsaudiovisual.com/admin` a RODS entra com e-mail e senha e pode:

- **Trabalhos:** enviar vídeos (MP4 até 1 GB, em partes e com retomada automática) e fotos para qualquer categoria, dar título, trocar a capa, reordenar, ocultar ou excluir. Os trabalhos que vieram do site antigo podem ser ocultados ou receber um título.
- **Textos:** chamada da página inicial, creator, pilares do Sobre, serviços, categorias, página de contato, chamada final e descrição para o Google.
- **Contato:** WhatsApp, mensagem pronta, Instagram e e-mail.

As alterações aparecem no site ao recarregar a página, sem novo deploy.

**Acesso:** login único `rodsaudiovisual@gmail.com`, criado direto no Supabase (Authentication → Users). Para trocar a senha, use “Reset password” ou edite o usuário no painel do Supabase.

### Como funciona

- Projeto Supabase `kebowxjbfvqqqixlvqpp` (conta rodsaudiovisual@gmail.com). Estrutura em `supabase/migrations/`.
- `site_content`: textos salvos pelo painel (uma linha por seção). `works`: trabalhos enviados. Bucket `media`: arquivos.
- Leitura pública; escrita só para e-mails da tabela `admins` (RLS). Para dar acesso a outra pessoa: `insert into public.admins (email) values ('pessoa@exemplo.com');` no SQL Editor do Supabase.
- O site busca o conteúdo do painel antes da primeira renderização (`src/content/remote.ts`). Se o Supabase não responder em 3,5 s, o site abre com o conteúdo do código, que continua sendo a base.
- Fotos são redimensionadas no navegador (2400 px e 1200 px, JPEG) e a capa do vídeo é capturada do próprio arquivo.
- URL e chave publicável ficam em `src/lib/supabase-config.ts` (ou `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY`).

### Arquivos grandes (até 1 GB)

Arquivos acima de 6 MB são enviados em partes de 6 MB (protocolo TUS do Supabase, `src/admin/upload.ts`), com barra de progresso e retomada se a conexão cair. O bucket `media` aceita até 1 GB por arquivo.

O plano gratuito do Supabase limita **qualquer** arquivo a 50 MB e o armazenamento total a 1 GB. Para vídeos de até 1 GB:

1. Assinar o plano **Pro** (US$ 25/mês: 100 GB de armazenamento e 250 GB de tráfego por mês) em Supabase → Organization → Billing.
2. Em Storage → Settings, mudar **Upload file size limit** para `1 GB`.

Cada visita que assiste a um vídeo de 1 GB consome até 1 GB de tráfego. Se o tráfego apertar, vale subir uma versão mais leve para o site (1080p com bitrate moderado).

## Onde editar o conteúdo no código

Tudo fica em `src/content/`:

- `config.ts`: **contatos** (WhatsApp, Instagram, e-mail), textos da creator, chamadas das páginas (`copy`), serviços e dados do site. Um canal que continua `null` fica oculto no site. São os valores padrão: o que for salvo no painel tem prioridade.
- `categories.ts`: títulos, chamadas e introduções de cada categoria.
- `works.ts`: monta os vídeos e fotos de cada categoria a partir dos inventários (e de `extraPhotos`).
- `imported/{videos,fotografia}/<categoria>.json`: inventários gerados automaticamente a partir do site antigo.
- `media-manifest.json`: mapa "URL original → cópia local", preenchido por `npm run media:fetch`.

### Adicionar fotos manualmente a uma categoria

Coloque os arquivos em `public/media/fotografia/<categoria>/` e liste-os em `extraPhotos` (`src/content/works.ts`):

```ts
const extraPhotos = {
  newborn: [
    { src: '/media/fotografia/newborn/01.jpg', width: 1600, height: 2400, alt: 'Recém-nascido dormindo em manta clara' },
  ],
}
```

`width` e `height` guardam a proporção real da foto. A galeria não recorta nenhuma imagem.

### Mídias do site antigo

O workflow `.github/workflows/migrate-media.yml` (GitHub → Actions → "Migrar mídias do site antigo") executa, em ordem:

1. `scripts/crawl-site.mjs`: lê o site publicado nos dois hosts e salva o HTML atual em `source/canva/live/`
2. `scripts/import-canva.mjs --all`: gera `src/content/imported/{videos,fotografia}/<categoria>.json` a partir de `source/canva/sources.json`
3. `npm run media:fetch`: baixa e valida os arquivos em `public/media/`
4. `scripts/contact-sheets.mjs`: gera as folhas de contato para conferência em `docs/contact-sheets/`
5. Faz o commit do resultado

Para ligar uma página antiga a uma categoria, edite `source/canva/sources.json`.

## Mídias: estratégia de carregamento

- **Capas:** posterframe original, com carregamento sob demanda (`loading="lazy"`), shimmer enquanto carrega e aviso discreto se falhar.
- **Prévia no hover (desktop):** variante 360p sem áudio (~0,5–0,9 MB). Ela só carrega quando o mouse passa sobre a capa e fica desativada com "movimento reduzido".
- **Player:** MP4 progressivo 720p com áudio, `preload="metadata"`, controles nativos, tela cheia e navegação entre trabalhos (setas do teclado ou botões). Se o arquivo falhar, aparece uma mensagem com link direto.
- **Um vídeo por vez:** `src/lib/playback.ts` pausa todos os outros quando um vídeo começa. Fechar o modal, trocar de trabalho ou mudar de página pausa a reprodução.
- **Proporção:** vem do arquivo original (9:16 para todos os vídeos de Gastronomia). Um vídeo horizontal aparece em 16:9 automaticamente.

### Migrar os arquivos para o projeto

```bash
npm run media:fetch   # baixa vídeo 720p, capa e prévia 360p de cada trabalho + ícones → public/media/
npm run media:check   # confere se cada mídia abre (local ou remota)
```

Cada arquivo é validado (status HTTP e assinatura MP4/JPEG/PNG) antes de entrar no manifesto. As falhas vão para `media-failures.json`.
Tamanho estimado para Gastronomia: cerca de 30–60 MB, dentro dos limites de hospedagens estáticas como Vercel e Netlify.

## Hospedagem

`npm run build` gera `dist/<rota>/index.html` para cada rota, com título, descrição, canonical e Open Graph próprios. Também gera `404.html`, `sitemap.xml` e `robots.txt`.
Com isso, as URLs diretas funcionam ao atualizar a página em qualquer hospedagem estática.
Netlify: `netlify.toml` já define build (`npm run build`), pasta `dist`, Node 22 e cabeçalhos de cache; rotas inexistentes recebem o `404.html` com status 404. Vercel: `vercel.json`.

## Documentos

- [`docs/INVENTARIO-MIDIAS.md`](docs/INVENTARIO-MIDIAS.md): inventário completo das mídias encontradas no HTML de Gastronomia.
- [`docs/PENDENCIAS.md`](docs/PENDENCIAS.md): o que falta para concluir a migração.
