/**
 * Configuração central do site. Tudo o que o cliente pode precisar atualizar
 * (contatos, textos institucionais, serviços) fica aqui.
 *
 * Contatos: nenhum dado de WhatsApp, Instagram ou e-mail foi encontrado nos
 * materiais recebidos. Os campos ficam `null` até serem confirmados pelo cliente;
 * o site esconde automaticamente os canais ainda não configurados.
 */
export type ContactConfig = {
  /** Número com DDI + DDD, apenas dígitos. Ex.: '5511999999999' */
  whatsapp: string | null
  /** Número como exibido no site */
  whatsappDisplay: string | null
  /** Mensagem inicial sugerida no WhatsApp */
  whatsappMessage: string
  /** Usuário sem @. Ex.: 'rodsaudiovisual' */
  instagram: string | null
  email: string | null
}

export const site = {
  name: 'RODS AUDIOVISUAL',
  shortName: 'RODS',
  url: 'https://rodsaudiovisual.com',
  locale: 'pt_BR',
  description:
    'Produção audiovisual, fotografia e conteúdo estratégico para marcas que querem ser lembradas. Vídeos institucionais, Reels, stop motion, drone e bastidores.',
  tagline: 'Histórias que ganham vida. Marcas que deixam sua marca.',
  credit: { label: 'Tecnologia desenvolvida pela PMG Code' },
}

export const contact: ContactConfig = {
  whatsapp: '554891336047',
  whatsappDisplay: '+55 48 9133-6047',
  whatsappMessage: 'Olá! Vim pelo site da RODS AUDIOVISUAL e quero conversar sobre um projeto.',
  instagram: null, // PENDENTE: confirmar com o cliente
  email: null, // PENDENTE: confirmar com o cliente
}

/** Link do WhatsApp com mensagem pronta (null se o número não estiver configurado). */
export function whatsappLink(message: string) {
  return contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}` : null
}

const buildContactLinks = () => ({
  whatsapp: contact.whatsapp ? whatsappLink(contact.whatsappMessage) : null,
  instagram: contact.instagram ? `https://instagram.com/${contact.instagram}` : null,
  email: contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent('Projeto audiovisual')}` : null,
})

export const contactLinks = buildContactLinks()

/** Recalcula os links depois que os contatos forem alterados pelo painel. */
export const refreshContactLinks = () => Object.assign(contactLinks, buildContactLinks())

/** Destino dos botões de orçamento: WhatsApp (com o assunto, se informado), e-mail ou a página de contato. */
export const budgetHref = (topic?: string) =>
  whatsappLink(
    topic
      ? `Olá! Vim pelo site da RODS AUDIOVISUAL e quero um orçamento de ${topic}.`
      : 'Olá! Vim pelo site da RODS AUDIOVISUAL e quero solicitar um orçamento.',
  ) ??
  contactLinks.email ??
  '/contato'

export const creator = {
  name: 'Danytsa',
  role: 'Creator & direção audiovisual',
  facts: [
    { value: 'Marketing', label: 'Formação' },
    { value: '8 anos', label: 'Na área comercial' },
    { value: '3 anos', label: 'No audiovisual' },
  ],
  intro:
    'Formada em Marketing, Danytsa construiu oito anos de experiência na área comercial antes de dedicar os últimos três ao audiovisual.',
  body: [
    'Essa trajetória define o jeito de trabalhar da RODS: cada projeto une estratégia, comunicação e produção de conteúdo para transformar marcas em referências no digital.',
    'O foco vai além da estética. As imagens são pensadas para fortalecer o posicionamento e o branding, criar conexão real com o público e impulsionar resultados.',
  ],
}

/**
 * Textos de chamada das páginas. `*palavra*` aparece na fonte serifada em itálico
 * (o destaque usado nos títulos do site).
 */
export const copy = {
  heroEyebrow: 'Produção audiovisual · Fotografia · Conteúdo estratégico',
  heroTitle: 'Histórias que ganham vida.',
  heroTitleMuted: 'Marcas que deixam *sua marca.*',
  heroText:
    'A RODS AUDIOVISUAL cria vídeos, fotografias e conteúdos estratégicos que traduzem a essência de cada marca em imagens feitas para serem lembradas.',
  aboutPillars: [
    'Estratégia',
    'Comunicação',
    'Produção de conteúdo',
    'Posicionamento e branding',
    'Conexão com o público',
  ],
  servicesTitle: 'O que a *RODS* entrega',
  servicesIntro:
    'Produção audiovisual e fotográfica completa, pensada para a comunicação da sua marca — em formatos para site, campanhas e redes sociais.',
  contactTitle: 'Vamos criar *juntos*.',
  contactText:
    'Conte o que você precisa — um vídeo institucional, conteúdos para Reels, um ensaio fotográfico ou a cobertura de um evento. A conversa começa direto com a gente.',
  ctaEyebrow: 'Próximo projeto',
  ctaTitle: 'Vamos contar a *sua* história?',
  ctaText:
    'Conte sobre a sua marca, o seu evento ou a ideia que você quer tirar do papel. A gente pensa junto o melhor formato.',
}

export type Service = { title: string; text: string }

export const services: Service[] = [
  {
    title: 'Vídeos institucionais',
    text: 'Filmes que apresentam a sua marca, seu espaço e sua equipe com clareza e personalidade — do roteiro à edição final.',
  },
  {
    title: 'Fotografia profissional',
    text: 'Ensaios e produções fotográficas para marcas, produtos, gastronomia e momentos pessoais, com direção e tratamento cuidadosos.',
  },
  {
    title: 'Conteúdos para Reels',
    text: 'Vídeos verticais pensados para o ritmo das redes: captação, edição e formatos prontos para publicar.',
  },
  {
    title: 'Stop motion e lifestyle',
    text: 'Produções criativas que dão movimento a produtos e mostram a marca inserida no dia a dia de quem consome.',
  },
  {
    title: 'Imagens com drone',
    text: 'Tomadas aéreas que ampliam a perspectiva de espaços, eventos e paisagens.',
  },
  {
    title: 'Making of e bastidores',
    text: 'O registro do processo por trás de cada produção, para aproximar o público da sua marca.',
  },
]
