export type DocFormat = 'markdown' | 'word' | 'excel' | 'pdf'

export type OutputTheme =
  | 'editorial'
  | 'technical'
  | 'business'
  | 'print'
  | 'editorial-forest'
  | 'moyu-green'
  | 'zen-whitespace'
  | 'red-white'
  | 'neo-brutal'
  | 'terminal'
  | 'bento'

export type ConversionMode = 'clean' | 'fidelity'

export interface ConversionOptions {
  theme: OutputTheme
  mode: ConversionMode
  includeCover: boolean
  includeToc: boolean
  darkMode: boolean
}

export interface ConversionWarning {
  type: 'info' | 'warning'
  message: string
}

export interface ConversionResult {
  html: string
  title: string
  format: DocFormat
  warnings: ConversionWarning[]
  pageCount?: number
  sheetCount?: number
}

export interface SaveResult {
  canceled: boolean
  filePath?: string
}

export interface WindowApi {
  convertFile: (filePath: string, options: ConversionOptions) => Promise<ConversionResult>
  chooseFile: () => Promise<string | null>
  saveHtml: (html: string, suggestedName: string) => Promise<SaveResult>
  getPathForFile: (file: File) => string
  platform: string
}
