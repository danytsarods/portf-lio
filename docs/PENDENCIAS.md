# Pendências

Situação em 29/09/2026.

## Concluído

- **Mídias do site antigo migradas para o projeto** (`public/media/`), com o workflow `.github/workflows/migrate-media.yml`, que roda nos servidores do GitHub:
  - 33 vídeos em 6 categorias e 47 fotos em 5 categorias. O resumo está em `INVENTARIO-MIDIAS.md`.
  - Cada arquivo foi validado (HTTP e assinatura). Os MP4 do player têm áudio AAC (ver `RELATORIO-MIDIAS.md`).
  - O site não depende mais do Canva: todas as 193 mídias são servidas do próprio projeto.
- **Descoberta durante a migração:** o site antigo usava dois hosts (`rodsaudiovisual.com` e `rodsaudiovisual.my.canva.site`), e o Canva renomeia os arquivos a cada publicação. Por isso, o HTML enviado no início não servia mais para baixar as mídias.
- **WhatsApp** +55 48 9133-6047 configurado. Todos os botões de orçamento abrem o WhatsApp com mensagem pronta, e as páginas de categoria já citam o tipo de trabalho.
- Logo oficial, favicon e fotos da creator aplicados.

## Pendente

1. **Instagram e e-mail:** não informados. Preencher em `src/content/config.ts` (`instagram`, `email`).
2. **Newborn:** o site antigo não tinha página dessa categoria. A galeria usa a única foto publicada (a capa da categoria na home). Enviar mais fotos, se houver.
3. **Moda (vídeo):** só um vídeo de 10 s estava publicado.
4. **Página não linkada** `my.canva.site/eventos/` ("Cópia de 01"): tem 9 vídeos e 37 fotos que não foram publicados no site novo. Confirmar com o cliente se algum deve entrar (por exemplo, casamentos em Eventos).
5. **Títulos dos trabalhos:** o Canva não traz nomes de clientes ou projetos. Os vídeos aparecem como "Eventos 01", "Gym 02" etc.
6. **Recortes do site antigo:** três vídeos de Gastronomia apareciam recortados no Canva. O site novo exibe os vídeos completos.
7. **Peso do deploy:** cerca de 520 MB de mídia (485 MB de vídeo). Conferir o limite do plano de hospedagem. Se for preciso reduzir, é possível remover as prévias 360p (~100 MB) ou recomprimir os vídeos.

## Atualizar a partir do site antigo no futuro

Se o cliente republicar o site no Canva, rode o workflow "Migrar mídias do site antigo" em GitHub → Actions → Run workflow. Ele lê o site de novo, reimporta as categorias de `source/canva/sources.json`, baixa só os arquivos novos e faz o commit.
