import type { DocFormat, OutputTheme } from '../../shared/types'

export type Density = 'compact' | 'comfortable' | 'editorial'

export type ChartKind = 'line' | 'bar' | 'donut' | 'table' | 'timeline'

export interface DesignPalette {
  background: string
  surface: string
  text: string
  muted: string
  accent: string
  accentSoft: string
  border: string
  codeBackground: string
  codeText: string
}

export interface TypographyRule {
  headingFont: string
  bodyFont: string
  monoFont: string
  headingScale: string
  bodyScale: string
}

export interface ThemeRecipe {
  id: OutputTheme
  name: string
  description: string
  mood: string[]
  palette: DesignPalette
  typography: TypographyRule
  tokens: string
}

export interface DesignAdvice {
  themeId: OutputTheme
  themeName: string
  density: Density
  palette: DesignPalette
  typography: TypographyRule
  recommendedCharts: ChartKind[]
  avoidPatterns: string[]
}

export interface ContentSection {
  id: string
  level: number
  title: string
  body: string
}

export interface DataTable {
  title: string
  headers: string[]
  rows: string[][]
}

export interface MetricItem {
  label: string
  value: string
  unit?: string
  trend?: 'up' | 'down' | 'flat'
}

export interface NormalizedContent {
  title: string
  sourceFormat: DocFormat
  sections: ContentSection[]
  tables: DataTable[]
  metrics: MetricItem[]
  images: string[]
}

export interface ChartSpec {
  kind: ChartKind
  title: string
  labels: string[]
  values: number[]
  source: string
}

export interface Finding {
  title: string
  detail: string
}

export interface DocumentInsights {
  summary: string
  findings: Finding[]
  metrics: MetricItem[]
  charts: ChartSpec[]
  highlights: string[]
  risks: string[]
  actions: string[]
}
