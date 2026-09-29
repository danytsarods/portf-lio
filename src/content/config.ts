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
} as const

export const contact: ContactConfig = {
  whatsapp: null, // PENDENTE: confirmar com o cliente
  whatsappMessage: 'Olá! Vim pelo site da RODS AUDIOVISUAL e quero conversar sobre um projeto.',
  instagram: null, // PENDENTE: confirmar com o cliente
  email: null, // PENDENTE: confirmar com o cliente
}

export const contactLinks = {
  whatsapp: contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage)}`
    : null,
  instagram: contact.instagram ? `https://instagram.com/${contact.instagram}` : null,
  email: contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent('Projeto audiovisual')}` : null,
}

/** Destino principal dos botões de orçamento: WhatsApp se houver, senão a página de contato. */
export const primaryContactHref = contactLinks.whatsapp ?? contactLinks.email ?? '/contato'

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

export const services = [
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
] as const
