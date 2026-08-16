import type { DocFormat } from '../../shared/types'
import type { ContentSection, DataTable, NormalizedContent } from './types'

function isMarkdownHeading(line: string): boolean {
  return /^#{1,6}\s+/.test(line)
}

function headingLevel(line: string): number {
  const match = line.match(/^(#{1,6})\s+/)
  return match ? match[1].length : 0
}

function extractMarkdownTables(lines: string[]): DataTable[] {
  const tables: DataTable[] = []
  let currentRows: string[][] | null = null

  for (const line of lines) {
    if (line.includes('|')) {
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim())
      if (cells.length === 0) continue

      if (!currentRows) currentRows = []
      currentRows.push(cells)
      continue
    }

    if (currentRows) {
      const rows = currentRows
      currentRows = null
      const filteredRows = rows.filter(
        (_row, index) => index !== 1 || !/^:?-+:?$/.test(rows[1]?.[0] ?? '')
      )
      const headers = filteredRows[0]?.map((cell) => cell || '未命名列') ?? []
      tables.push({
        title: headers.join(' / '),
        headers,
        rows: filteredRows.slice(1).map((row) => headers.map((_, columnIndex) => row[columnIndex] ?? ''))
      })
    }
  }

  if (currentRows) {
    const rows = currentRows
    const headers = rows[0]?.map((cell) => cell || '未命名列') ?? []
    tables.push({
      title: headers.join(' / '),
      headers,
      rows: rows.slice(1).map((row) => headers.map((_, columnIndex) => row[columnIndex] ?? ''))
    })
  }

  return tables
}

export function normalizeTextContent(
  title: string,
  sourceFormat: DocFormat,
  text: string
): NormalizedContent {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const sections: ContentSection[] = []
  let currentSection: ContentSection | null = null

  const pushCurrentSection = (): void => {
    if (currentSection && currentSection.body) sections.push(currentSection)
    currentSection = null
  }

  for (const line of lines) {
    const markdownHeading = sourceFormat === 'markdown' && isMarkdownHeading(line)
    const plainHeading = sourceFormat !== 'markdown' && /^[\p{L}\p{N}][\p{L}\p{N}\s、：:（）()_-]{2,40}$/u.test(line)

    if (markdownHeading || plainHeading) {
      pushCurrentSection()
      currentSection = {
        id: `section-${sections.length + 1}`,
        level: markdownHeading ? headingLevel(line) : 2,
        title: markdownHeading ? line.replace(/^#{1,6}\s+/, '') : line,
        body: ''
      }
      continue
    }

    if (!currentSection) {
      currentSection = {
        id: `section-${sections.length + 1}`,
        level: 2,
        title: title,
        body: ''
      }
    }

    currentSection.body += `${line}\n`
  }

  pushCurrentSection()

  if (sections.length === 0) {
    sections.push({
      id: 'section-1',
      level: 2,
      title,
      body: text.slice(0, 600)
    })
  }

  return {
    title,
    sourceFormat,
    sections,
    tables: sourceFormat === 'markdown' ? extractMarkdownTables(lines) : [],
    metrics: [],
    images: []
  }
}
