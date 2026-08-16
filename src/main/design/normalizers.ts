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

function parseNumber(value: string): number | null {
  const normalized = value.replace(/[,%\s]/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100)
}

function firstRowText(table: DataTable): string {
  const row = table.rows[0]
  if (!row) return ''

  const cells = table.headers
    .map((header, columnIndex) => {
      const value = String(row[columnIndex] ?? '').replace(/\s+/g, ' ').trim()
      return value ? `${header} ${value}` : ''
    })
    .filter(Boolean)
    .slice(0, 6)

  return cells.join('，')
}

function numericColumnSummary(table: DataTable, columnIndex: number): string | null {
  const values = table.rows
    .map((row) => parseNumber(row[columnIndex]))
    .filter((value): value is number => value !== null)

  if (values.length === 0) return null

  const total = values.reduce((sum, value) => sum + value, 0)
  const average = total / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)
  const header = table.headers[columnIndex] || `第 ${columnIndex + 1} 列`

  return `${header}：共 ${values.length} 个数值，合计 ${formatNumber(total)}，均值 ${formatNumber(average)}，最高 ${formatNumber(max)}，最低 ${formatNumber(min)}`
}

function summarizeTable(table: DataTable): string {
  const numericSummaries = table.headers
    .map((_, columnIndex) => numericColumnSummary(table, columnIndex))
    .filter((summary): summary is string => Boolean(summary))
    .slice(0, 4)

  const lines = [
    `${table.title} 包含 ${table.rows.length} 行数据。`,
    `字段：${table.headers.join('、')}。`,
    ...numericSummaries
  ]

  const sample = firstRowText(table)
  if (sample) lines.push(`首行示例：${sample}。`)

  return lines.join('\n')
}

function summarizeWorkbook(title: string, tables: DataTable[]): string {
  const totalRows = tables.reduce((sum, table) => sum + table.rows.length, 0)
  const numericColumnCount = tables.reduce(
    (count, table) =>
      count +
      table.headers.filter((_, columnIndex) => table.rows.some((row) => parseNumber(row[columnIndex]) !== null)).length,
    0
  )

  const lines = [
    `${title} 包含 ${tables.length} 个工作表，共 ${totalRows} 行数据，其中 ${numericColumnCount} 个字段包含数值。`,
    ...tables.map((table, index) => `${index + 1}. ${table.title}：${table.headers.join('、')}`)
  ]

  return lines.join('\n')
}

export function normalizeExcelContent(title: string, tables: DataTable[]): NormalizedContent {
  const sections: ContentSection[] = [
    {
      id: 'excel-overview',
      level: 1,
      title: '数据概览',
      body: summarizeWorkbook(title, tables)
    },
    ...tables.map((table, index) => ({
      id: `excel-table-${index + 1}`,
      level: 2,
      title: table.title,
      body: summarizeTable(table)
    }))
  ]

  return {
    title,
    sourceFormat: 'excel',
    sections,
    tables,
    metrics: [],
    images: []
  }
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
