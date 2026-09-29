/**
 * Categorias do portfólio. Arquivo sem dependências para ser usado tanto pelo app
 * quanto pelo script de pré-renderização (scripts/prerender.mjs).
 */
export type CategoryKind = 'videos' | 'fotografia'

export type Category = {
  kind: CategoryKind
  slug: string
  title: string
  /** Frase curta usada em listas */
  kicker: string
  intro: string
  /** Caminho da página equivalente no site antigo, quando conhecido */
  legacyPath?: string
}

export const videoCategories: Category[] = [
  {
    kind: 'videos',
    slug: 'gastronomia',
    title: 'Gastronomia',
    kicker: 'Sabor em movimento',
    intro:
      'Pratos, preparo e ambiente filmados para despertar vontade. Vídeos verticais para restaurantes e marcas de alimentação apresentarem o que têm de melhor.',
    legacyPath: '/gastronomia/',
  },
  {
    kind: 'videos',
    slug: 'eventos',
    title: 'Eventos',
    kicker: 'O momento, do jeito que ele foi',
    intro:
      'Cobertura audiovisual de eventos com olhar para a atmosfera, as pessoas e os detalhes que fazem cada ocasião ser lembrada.',
  },
  {
    kind: 'videos',
    slug: 'estetica',
    title: 'Estética',
    kicker: 'Cuidado, técnica e confiança',
    intro:
      'Conteúdos para clínicas e profissionais de estética que mostram procedimentos, estrutura e atendimento com delicadeza e clareza.',
  },
  {
    kind: 'videos',
    slug: 'influencer',
    title: 'Influencer',
    kicker: 'Presença que conecta',
    intro:
      'Produção de conteúdo para criadores e personalidades digitais, com linguagem própria e ritmo pensado para as redes.',
  },
  {
    kind: 'videos',
    slug: 'gym',
    title: 'Gym',
    kicker: 'Energia em cada quadro',
    intro:
      'Vídeos para academias, estúdios e profissionais do treino, com movimento, intensidade e a identidade de cada espaço.',
  },
  {
    kind: 'videos',
    slug: 'moda',
    title: 'Moda',
    kicker: 'Atitude, textura e estilo',
    intro: 'Filmes e conteúdos para marcas de moda que valorizam peças, caimento e a personalidade de cada coleção.',
  },
]

export const photoCategories: Category[] = [
  {
    kind: 'fotografia',
    slug: 'moda',
    title: 'Moda',
    kicker: 'Editorial e campanha',
    intro: 'Ensaios de moda com direção de pose, luz e composição para destacar peças e personalidade.',
  },
  {
    kind: 'fotografia',
    slug: 'restaurantes',
    title: 'Restaurantes',
    kicker: 'Pratos que pedem para ser provados',
    intro:
      'Fotografia gastronômica para cardápios, redes sociais e divulgação, com luz e composição que valorizam cada prato.',
  },
  {
    kind: 'fotografia',
    slug: 'newborn',
    title: 'Newborn',
    kicker: 'Os primeiros dias',
    intro: 'Ensaios delicados e seguros dos primeiros dias de vida, com cenários acolhedores e muito cuidado.',
  },
  {
    kind: 'fotografia',
    slug: '15-anos',
    title: '15 anos',
    kicker: 'Uma fase para guardar',
    intro: 'Ensaios de 15 anos com leveza e personalidade, em cenários que combinam com quem está sendo fotografada.',
  },
  {
    kind: 'fotografia',
    slug: 'gestante',
    title: 'Gestante',
    kicker: 'A espera, em imagens',
    intro: 'Ensaios de gestante sensíveis e naturais, para registrar um dos momentos mais especiais da família.',
  },
]

export const categoryPath = (c: Pick<Category, 'kind' | 'slug'>) => `/${c.kind}/${c.slug}`
