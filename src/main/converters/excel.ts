import XLSX from 'xlsx'
import type { ConversionOptions, ConversionResult } from '../../shared/types'
import { buildSemanticInsights } from '../design/insights'
import { prepareDesign } from '../design/prepareDesign'
import { applyAiDesign } from '../design/aiDesigner'
import type { DataTable, NormalizedContent } from '../design/types'
import { buildStandaloneHtml } from '../theme'
import { titleFromPath } from '../utils'

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
  const aiDesign = await applyAiDesign({ content, design, insights, options })
  if (!aiDesign.recipe.contentHtml.trim()) {
    throw new Error('AI 没有返回完整正文布局，请重新生成或换用非 reasoning 模型。')
  }

  return {
    html: buildStandaloneHtml({
      title: titleFromPath(filePath),
      body: aiDesign.recipe.contentHtml,
      options: design.resolvedOptions,
      format: 'Excel',
      extraBodyClass: 'excel-document',
      tokens: aiDesign.tokens,
      template: aiDesign.template,
      analysis: design.analysis,
      resolvedTheme: design.resolvedTheme,
      aiDesign: {
        css: aiDesign.recipe.css,
        layoutClass: aiDesign.recipe.layoutClass,
        coverHtml: aiDesign.recipe.coverHtml,
        themeName: aiDesign.recipe.themeName,
        templateName: aiDesign.recipe.templateName,
        documentType: aiDesign.recipe.documentType,
        audience: aiDesign.recipe.audience,
        notes: aiDesign.recipe.notes
      }
    }),
    title: titleFromPath(filePath),
    format: 'excel',
    warnings: [],
    sheetCount: sheetNames.length,
    aiGenerated: true,
    aiDesign: {
      themeName: aiDesign.recipe.themeName,
      templateName: aiDesign.recipe.templateName,
      layoutClass: aiDesign.recipe.layoutClass,
      notes: aiDesign.recipe.notes
    },
    analysis: {
      documentType: design.analysis.documentTypeLabel,
      audience: design.analysis.audienceLabel,
      coreFocus: design.analysis.coreFocus,
      templateId: design.template.id,
      templateName: design.template.name
    }
  }
}
