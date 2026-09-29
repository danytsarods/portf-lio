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
- `works.ts`: associa cada categoria aos seus vídeos e fotos.
- `imported/<categoria>.json`: inventário gerado automaticamente a partir do HTML do site antigo.
- `media-manifest.json`: mapa "URL original → cópia local", preenchido por `npm run media:fetch`.

### Adicionar fotos a uma categoria

Coloque os arquivos em `public/media/fotografia/<categoria>/` e liste-os em `photoWorks` (`src/content/works.ts`):

```ts
newborn: [
  { src: '/media/fotografia/newborn/01.jpg', width: 1600, height: 2400, alt: 'Recém-nascido dormindo em manta clara' },
],
```

`width` e `height` guardam a proporção real da foto. A galeria não recorta nenhuma imagem.

### Importar outra categoria de vídeo do site antigo

O site antigo foi feito no Canva. As mídias não aparecem em `<video>` ou `<img>`: elas ficam serializadas em `window['bootstrap']`.

1. Salve o HTML da página (ex.: `https://rodsaudiovisual.com/eventos/`) em `source/canva/eventos.html`.
2. Rode `npm run import:canva -- source/canva/eventos.html eventos`.
3. Em `src/content/works.ts`, importe `./imported/eventos.json` e troque `eventos: []` por `fromImport('eventos', eventos)`.
4. Rode `npm run media:fetch` para copiar os arquivos para o projeto.

## Marca e fotos institucionais

- Originais preservados em `source/brand/` e `source/fotos/`, nunca editados.
- `npm run images` gera:
  - as versões da logo (`public/brand/logo-{240,480,960}.png`)
  - favicon, `apple-touch-icon` e `icon-512`
  - as fotos em AVIF/WebP/JPEG (`public/media/site/`)
  - `public/og-image.jpg`
  - `src/content/photos.json`
- O enquadramento de cada foto para celular e desktop fica em `src/content/photos.ts` (`focus`). Onde a foto aparece na proporção original, nada é cortado.
- Para trocar ou adicionar uma foto: coloque o arquivo em `source/fotos/`, rode `npm run images` e registre o texto alternativo e o foco em `photos.ts`.

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
Até a migração rodar, o site usa as URLs originais de `rodsaudiovisual.com`.
Tamanho estimado para Gastronomia: cerca de 30–60 MB, dentro dos limites de hospedagens estáticas como Vercel e Netlify.

## Hospedagem

`npm run build` gera `dist/<rota>/index.html` para cada rota, com título, descrição, canonical e Open Graph próprios. Também gera `404.html`, `sitemap.xml` e `robots.txt`.
Com isso, as URLs diretas funcionam ao atualizar a página em qualquer hospedagem estática.
Netlify: `netlify.toml` já define build (`npm run build`), pasta `dist`, Node 22 e cabeçalhos de cache; rotas inexistentes recebem o `404.html` com status 404. Vercel: `vercel.json`.

## Documentos

- [`docs/INVENTARIO-MIDIAS.md`](docs/INVENTARIO-MIDIAS.md): inventário completo das mídias encontradas no HTML de Gastronomia.
- [`docs/PENDENCIAS.md`](docs/PENDENCIAS.md): o que falta para concluir a migração.
