# RODS AUDIOVISUAL — Portfólio

Nova versão do portfólio da RODS AUDIOVISUAL: produção audiovisual, fotografia e conteúdo estratégico.
Site estático em **React 19 + TypeScript + Tailwind CSS 4 + Vite**, sem backend, login ou banco de dados.

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

## Onde editar o conteúdo

Tudo fica em `src/content/`:

- `config.ts`: **contatos** (WhatsApp, Instagram, e-mail), textos da creator, serviços e dados do site. Um canal que continua `null` fica oculto no site.
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
