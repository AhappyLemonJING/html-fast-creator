import type {
  ChartKind,
  ChartSpec,
  DataTable,
  DocumentAnalysis,
  DocumentInsights,
  Finding,
  MetricItem,
  NormalizedContent
} from './types'

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

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>|#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitSentences(value: string): string[] {
  return stripMarkdown(value)
    .split(/[。！？!?；;\n]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 8)
}

function countTerms(value: string, terms: string[]): number {
  const text = stripMarkdown(value)
  return terms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0)
}

function scoreSentence(sentence: string): number {
  const signalTerms = [
    '增长',
    '提升',
    '下降',
    '减少',
    '达到',
    '超过',
    '占比',
    '同比',
    '环比',
    '风险',
    '建议',
    '需要',
    '关键',
    '核心',
    '目标',
    '结论',
    '实现',
    '数据',
    '指标',
    '营收',
    '成本',
    '用户',
    '客户'
  ]
  const numericBonus = /\d+(?:\.\d+)?\s*(?:%|万|亿|元|美元|人|个|条|次|家)/.test(sentence) ? 3 : 0
  return countTerms(sentence, signalTerms) * 2 + numericBonus
}

function extractFindings(content: NormalizedContent, analysis: DocumentAnalysis): Finding[] {
  const sentences = content.sections.flatMap((section) =>
    splitSentences(section.body).map((sentence) => ({
      sectionTitle: section.title,
      sentence
    }))
  )

  const ranked = sentences
    .map((item) => ({ ...item, score: scoreSentence(item.sentence) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return ranked.map((item) => ({
    title: item.sectionTitle || analysis.keyThemes[0] || '关键发现',
    detail: item.sentence
  }))
}

function extractTermLines(content: NormalizedContent, terms: string[]): string[] {
  const lines: string[] = []

  for (const section of content.sections) {
    const sectionLines = splitSentences(section.body)
    const matches = sectionLines.filter((line) => countTerms(line, terms) > 0)
    if (matches.length > 0) {
      lines.push(...matches)
      continue
    }

    if (section.title && /风险|问题|挑战|注意|建议|行动|下一步|计划|待办/.test(section.title)) {
      lines.push(...sectionLines)
    }
  }

  return [...new Set(lines.map((line) => line.trim()))].slice(0, 6)
}

function tableChartSpec(table: DataTable): ChartSpec | null {
  const numericColumns = table.headers
    .map((header, columnIndex) => ({ header, columnIndex }))
    .filter(({ columnIndex }) => table.rows.some((row) => parseNumber(row[columnIndex]) !== null))

  if (numericColumns.length === 0 || table.rows.length === 0) return null
  const numericColumn = numericColumns[0].columnIndex
  const labels = table.rows.map((row) => row[0] ?? `第 ${table.rows.indexOf(row) + 1} 项`)
  const values = table.rows.map((row) => parseNumber(row[numericColumn]) ?? 0)

  return {
    kind: suggestChartKind(table),
    title: table.title,
    labels,
    values,
    source: table.title
  }
}

function buildCharts(content: NormalizedContent): ChartSpec[] {
  return content.tables
    .map(tableChartSpec)
    .filter((chart): chart is ChartSpec => chart !== null)
    .slice(0, 3)
}

export function buildSemanticInsights(content: NormalizedContent, analysis: DocumentAnalysis): DocumentInsights {
  const metrics = extractMetrics(content.tables)
  const charts = buildCharts(content)
  const findings = extractFindings(content, analysis)
  const risks = extractTermLines(content, [
    '风险',
    '问题',
    '挑战',
    '注意',
    '警告',
    '不能',
    '避免',
    '限制',
    '缺失',
    '失败',
    '隐患',
    '待解决'
  ])
  const actions = extractTermLines(content, [
    '建议',
    '下一步',
    '行动',
    '需要',
    '应当',
    '必须',
    '确保',
    '计划',
    'TODO',
    '待办',
    '优先',
    '执行'
  ])

  return {
    summary: analysis.summary,
    findings:
      findings.length > 0
        ? findings
        : metrics.slice(0, 3).map((metric) => ({
            title: metric.label,
            detail: `当前值为 ${metric.value}${metric.unit ?? ''}`
          })),
    metrics,
    charts,
    highlights: [...analysis.keyThemes, ...content.sections.slice(0, 5).map((section) => section.title)].slice(0, 8),
    risks,
    actions
  }
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
