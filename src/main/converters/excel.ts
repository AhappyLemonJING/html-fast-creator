import XLSX from 'xlsx'
import type { ConversionOptions, ConversionResult } from '../../shared/types'
import { getDesignAdvice } from '../design/designAdvisor'
import { buildRuleBasedInsights } from '../design/insights'
import { renderInsightsHtml } from '../design/renderers'
import type { DataTable, NormalizedContent } from '../design/types'
import { buildStandaloneHtml } from '../theme'
import { escapeHtml, titleFromPath } from '../utils'

export async function convertExcel(
  filePath: string,
  options: ConversionOptions
): Promise<ConversionResult> {
  const workbook = XLSX.readFile(filePath, { cellStyles: true })
  const sheetNames = workbook.SheetNames

  const tables: DataTable[] = sheetNames.map((name) => {
    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], {
      header: 1,
      defval: ''
    })
    const rows = rawRows
      .map((row) => row.map((cell) => String(cell ?? '').trim()))
      .filter((row) => row.some((cell) => cell.length > 0))

    const headers = rows[0]?.map((cell) => cell || '未命名列') ?? []
    const dataRows = rows.slice(1).map((row) => headers.map((_, columnIndex) => row[columnIndex] ?? ''))

    return {
      title: name,
      headers,
      rows: dataRows
    }
  })

  const content: NormalizedContent = {
    title: titleFromPath(filePath),
    sourceFormat: 'excel',
    sections: sheetNames.map((name, index) => ({
      id: `sheet-${index}`,
      level: 1,
      title: name,
      body: `工作表 ${name}`
    })),
    tables,
    metrics: [],
    images: []
  }

  const advice = getDesignAdvice('excel', options.theme)
  const insights = buildRuleBasedInsights(content)
  const insightHtml = renderInsightsHtml(insights, advice)

  const tabs = sheetNames
    .map(
      (name, index) =>
        `<button class="sheet-tab ${index === 0 ? 'is-active' : ''}" data-target="sheet-${index}">${escapeHtml(name)}</button>`
    )
    .join('')

  const panels = sheetNames
    .map((name, index) => {
      const table = XLSX.utils.sheet_to_html(workbook.Sheets[name], {
        id: `sheet-table-${index}`,
        editable: false
      })
      return `<section class="sheet-panel ${index === 0 ? 'is-active' : ''}" id="sheet-${index}">
        <div class="table-wrap">${table}</div>
      </section>`
    })
    .join('')

  return {
    html: buildStandaloneHtml({
      title: titleFromPath(filePath),
      body: `${insightHtml}<div class="sheet-tabs">${tabs}</div>${panels}`,
      options,
      format: 'Excel',
      extraBodyClass: 'excel-document'
    }),
    title: titleFromPath(filePath),
    format: 'excel',
    warnings: [],
    sheetCount: sheetNames.length
  }
}
