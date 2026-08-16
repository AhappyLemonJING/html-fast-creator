import type { ChartKind, DataTable, DocumentInsights, MetricItem, NormalizedContent } from './types'

function parseNumber(value: string): number | null {
  const normalized = value.replace(/[,%\s]/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function suggestChartKind(table: DataTable): ChartKind {
  const numericColumns = table.headers.filter((_, columnIndex) => {
    const hasNumericValue = table.rows.some((row) => parseNumber(row[columnIndex]) !== null)
    return hasNumericValue
  })

  if (numericColumns.length === 0) return 'table'
  if (table.rows.length <= 2) return 'donut'
  if (table.headers.some((header) => /日期|时间|月份|季度|年份|week|month|date|year/i.test(header))) {
    return 'line'
  }
  return 'bar'
}

function extractMetrics(tables: DataTable[]): MetricItem[] {
  const metrics: MetricItem[] = []
  for (const table of tables) {
    const numericColumns = table.headers
      .map((header, columnIndex) => ({ header, columnIndex }))
      .filter(({ columnIndex }) => table.rows.some((row) => parseNumber(row[columnIndex]) !== null))

    if (numericColumns.length === 0) continue
    const firstNumericColumn = numericColumns[0]
    const values = table.rows
      .map((row) => parseNumber(row[firstNumericColumn.columnIndex]))
      .filter((value): value is number => value !== null)

    if (values.length === 0) continue
    const total = values.reduce((sum, value) => sum + value, 0)
    const average = total / values.length
    metrics.push({
      label: firstNumericColumn.header,
      value: String(Math.round(total * 100) / 100),
      trend: values.length > 1 && values[values.length - 1] > values[0] ? 'up' : values[values.length - 1] < values[0] ? 'down' : 'flat'
    })
    metrics.push({
      label: `${firstNumericColumn.header} 均值`,
      value: String(Math.round(average * 100) / 100),
      trend: 'flat'
    })
  }
  return metrics.slice(0, 6)
}

export function buildRuleBasedInsights(content: NormalizedContent): DocumentInsights {
  const metrics = extractMetrics(content.tables)
  const numericTable = content.tables.find((table) => suggestChartKind(table) !== 'table')
  const charts = numericTable
    ? [
        {
          kind: suggestChartKind(numericTable),
          title: numericTable.title,
          labels: numericTable.rows.map((row) => row[0] ?? ''),
          values: numericTable.rows
            .map((row) => {
              const numericColumn = numericTable.headers.findIndex((_, index) =>
                numericTable.rows.some((candidate) => parseNumber(candidate[index]) !== null)
              )
              return parseNumber(row[numericColumn]) ?? 0
            }),
          source: numericTable.title
        }
      ]
    : []

  return {
    summary: content.sections[0]?.body.slice(0, 120) || '未生成摘要',
    findings: metrics.slice(0, 3).map((metric) => ({
      title: metric.label,
      detail: `当前值为 ${metric.value}${metric.unit ?? ''}`
    })),
    metrics,
    charts,
    highlights: content.sections.slice(0, 5).map((section) => section.title),
    risks: [],
    actions: []
  }
}
