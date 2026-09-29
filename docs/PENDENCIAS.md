# Pendências da migração

Situação em 29/09/2026. A migração **não** está concluída. O que falta:

## 1. Download das mídias (bloqueado no ambiente de desenvolvimento)

A política de rede do ambiente em que o projeto foi construído bloqueou o domínio `rodsaudiovisual.com`: a conexão foi recusada pelo proxy, com HTTP 403.
Por isso, nenhum arquivo foi baixado ou aberto aqui. `npm run media:check` confirmou 0 de 36 mídias acessíveis a partir desse ambiente.

- Os 12 vídeos de Gastronomia, as capas e as prévias estão mapeados com as URLs exatas (ver `INVENTARIO-MIDIAS.md`). O site já aponta para elas.
- **Ação:** em uma máquina com acesso ao domínio, rodar `npm run media:fetch` e depois `npm run media:check`. Em seguida, fazer commit de `public/media/` e `src/content/media-manifest.json`.
- **Não verificado:** se os MP4 progressivos (`files[0]` no Canva) têm faixa de áudio. As variantes DASH são só de vídeo e têm o áudio separado em `.m4a`. Se o MP4 progressivo estiver mudo, será preciso juntar a variante 1080p com o `.m4a` correspondente (ex.: `ffmpeg -i video.mp4 -i audio.m4a -c copy saida.mp4`).

## 2. Categorias sem conteúdo recuperado

Só o HTML de **Gastronomia** foi fornecido. As outras páginas do site antigo não puderam ser abertas pelo mesmo bloqueio de rede.
Os caminhos abaixo **não foram confirmados**:

| Categoria | Página nova | O que falta |
|---|---|---|
| Vídeos · Eventos | `/videos/eventos` | HTML da página antiga ou arquivos |
| Vídeos · Estética | `/videos/estetica` | HTML da página antiga ou arquivos |
| Vídeos · Influencer | `/videos/influencer` | HTML da página antiga ou arquivos |
| Vídeos · Gym | `/videos/gym` | HTML da página antiga ou arquivos |
| Vídeos · Moda | `/videos/moda` | HTML da página antiga ou arquivos |
| Fotografia · Moda | `/fotografia/moda` | Fotos |
| Fotografia · Restaurantes | `/fotografia/restaurantes` | Fotos |
| Fotografia · Newborn | `/fotografia/newborn` | Fotos |
| Fotografia · 15 anos | `/fotografia/15-anos` | Fotos |
| Fotografia · Gestante | `/fotografia/gestante` | Fotos |

Essas páginas já estão prontas (introdução, chamada para orçamento, galeria/player e navegação). Enquanto não recebem trabalhos, exibem o estado "em atualização".
Com o HTML de cada página, a importação leva poucos minutos (ver README → "Importar outra categoria").

## 3. Contatos

Nenhum dado de contato apareceu no HTML nem nas capturas. Preencher em `src/content/config.ts`:

- `whatsapp`: número com DDI e DDD, só dígitos.
- `instagram`: usuário, sem @.
- `email`

Enquanto estiverem vazios, a página `/contato` mostra um aviso neutro e os botões "Solicitar orçamento" levam para `/contato`.
Quando o WhatsApp for configurado, os botões abrem o WhatsApp direto, com mensagem pronta.

## 4. Marca e retrato

- **Favicon:** o site antigo tem três ícones (`_assets/images/2d0b56e7….png`, `e53c4bd8….png`, `725b756a….png`) que não puderam ser baixados. O favicon atual (`public/favicon.svg`) é provisório. `media:fetch` baixa os originais para `public/media/brand/`. Se forem a marca oficial, basta trocar os `<link rel="icon">` em `index.html`.
- **Retrato da creator:** o arquivo original não foi recuperado (a captura de tela não foi usada como imagem). Quando houver o arquivo, preencha `creator.portrait` em `config.ts`: a página Sobre passa a exibir o retrato automaticamente.
- **Imagens de fundo do site antigo:** as 12 imagens de `_assets/media` eram fundos de seção quase transparentes. Foram classificadas como decorativas e não são usadas. Vale confirmar se alguma é fotografia autoral do cliente.

## 5. Títulos dos trabalhos

O HTML não traz nomes de clientes ou projetos. Os vídeos aparecem como "Gastronomia 01…12".
Para usar nomes reais, altere a geração de títulos em `src/content/works.ts` ou crie um mapa por ID.
