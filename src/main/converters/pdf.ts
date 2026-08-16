import { readFile } from 'node:fs/promises'
import type { ConversionOptions, ConversionResult } from '../../shared/types'
import { buildSemanticInsights } from '../design/insights'
import { normalizeTextContent } from '../design/normalizers'
import { prepareDesign } from '../design/prepareDesign'
import { renderInsightsHtml } from '../design/renderers'
import { applyAiDesign } from '../design/aiDesigner'
import { buildStandaloneHtml } from '../theme'
import { escapeHtml, titleFromPath } from '../utils'

interface PdfTextItem {
  str: string
  transform: number[]
  hasEOL?: boolean
}

export async function convertPdf(
  filePath: string,
  options: ConversionOptions
): Promise<ConversionResult> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const data = new Uint8Array(await readFile(filePath))
  const document = await pdfjs.getDocument({ data, useSystemFonts: true }).promise
  const pages: string[] = []
  const extractedLines: string[] = []

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    const items = content.items as PdfTextItem[]
    const lines: string[] = []
    let currentLine = ''
    let lastY: number | null = null

    for (const item of items) {
      const y = item.transform[5]
      if (lastY !== null && Math.abs(y - lastY) > 1.5) {
        if (currentLine.trim()) lines.push(currentLine.trim())
        currentLine = ''
      }
      if (currentLine && !item.hasEOL) currentLine += ' '
      currentLine += item.str
      if (item.hasEOL) {
        if (currentLine.trim()) lines.push(currentLine.trim())
        currentLine = ''
      }
      lastY = y
    }
    if (currentLine.trim()) lines.push(currentLine.trim())
    extractedLines.push(...lines)

    const paragraphs = lines
      .filter((line) => line.length > 0)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join('')

    pages.push(`<section class="page">
      <div class="page-marker">第 ${pageNumber} 页</div>
      ${paragraphs || '<p>本页未找到可选择的文本。</p>'}
    </section>`)
  }

  const title = titleFromPath(filePath)
  const content = normalizeTextContent(title, 'pdf', extractedLines.join('\n'))
  const design = prepareDesign(content, options)
  const insights = buildSemanticInsights(content, design.analysis)
  const localInsightHtml = renderInsightsHtml(insights, design.advice, design.analysis, design.template)
  const aiDesign = await applyAiDesign({ content, design, insights, options })
  if (aiDesign.recipe && !aiDesign.recipe.contentHtml.trim()) {
    throw new Error('AI 没有返回完整正文布局，请重新生成或换用非 reasoning 模型。')
  }
  const bodyHtml = aiDesign.recipe?.contentHtml || `${localInsightHtml}${pages.join('')}`

  return {
    html: buildStandaloneHtml({
      title,
      body: bodyHtml,
      options: design.resolvedOptions,
      format: 'PDF',
      extraBodyClass: 'pdf-document',
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
    title,
    format: 'pdf',
    warnings: [
      {
        type: 'info',
        message: '当前使用 PDF 文本提取。扫描版页面将在后续版本中支持 OCR 或图片渲染。'
      }
    ],
    pageCount: document.numPages,
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
