import XLSX from 'xlsx'
import type { ConversionOptions, ConversionResult } from '../../shared/types'
import { buildSemanticInsights } from '../design/insights'
import { prepareDesign } from '../design/prepareDesign'
import { renderInsightsHtml } from '../design/renderers'
import { applyAiDesign } from '../design/aiDesigner'
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

  const design = prepareDesign(content, options)
  const insights = buildSemanticInsights(content, design.analysis)
  const localInsightHtml = renderInsightsHtml(insights, design.advice, design.analysis, design.template)
  const aiDesign = await applyAiDesign({ content, design, insights, options })
  const insightHtml = localInsightHtml

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
      options: design.resolvedOptions,
      format: 'Excel',
      extraBodyClass: 'excel-document',
      tokens: aiDesign.tokens,
      template: aiDesign.template,
      analysis: design.analysis,
      resolvedTheme: design.resolvedTheme,
      aiDesign: aiDesign.recipe
        ? {
            css: aiDesign.recipe.css,
            layoutClass: aiDesign.recipe.layoutClass,
            coverHtml: aiDesign.recipe.coverHtml,
            themeName: aiDesign.recipe.themeName,
            templateName: aiDesign.recipe.templateName,
            documentType: aiDesign.recipe.documentType,
            audience: aiDesign.recipe.audience,
            notes: aiDesign.recipe.notes
          }
        : undefined
    }),
    title: titleFromPath(filePath),
    format: 'excel',
    warnings: [],
    sheetCount: sheetNames.length,
    aiGenerated: aiDesign.recipe !== null,
    aiDesign: aiDesign.recipe
      ? {
          themeName: aiDesign.recipe.themeName,
          templateName: aiDesign.recipe.templateName,
          layoutClass: aiDesign.recipe.layoutClass,
          notes: aiDesign.recipe.notes
        }
      : undefined,
    analysis: {
      documentType: design.analysis.documentTypeLabel,
      audience: design.analysis.audienceLabel,
      coreFocus: design.analysis.coreFocus,
      templateId: design.template.id,
      templateName: design.template.name
    }
  }
}
