export type Maturity = 'seed' | 'budding' | 'evergreen'

export interface BacklinkEntry {
  slug: string
  title: string
  context: string
}

export interface PublicThought {
  slug: string
  title: string
  backlinks: BacklinkEntry[]
  maturity: Maturity
}

export type ThoughtGraph = Record<string, PublicThought>

export interface ThoughtEdge {
  source: string
  target: string
}

export interface ThoughtGraphFile {
  thoughts: ThoughtGraph
  edges: ThoughtEdge[]
}

export interface ThoughtApiResponse {
  slug: string
  title: string
  html: string
  backlinks: BacklinkEntry[]
  maturity: Maturity
}
