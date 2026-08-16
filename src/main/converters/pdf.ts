import { readFile } from 'node:fs/promises'
import type { ConversionOptions, ConversionResult } from '../../shared/types'
import { getDesignAdvice } from '../design/designAdvisor'
import { buildRuleBasedInsights } from '../design/insights'
import { normalizeTextContent } from '../design/normalizers'
import { renderInsightsHtml } from '../design/renderers'
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
  const advice = getDesignAdvice('pdf', options.theme)
  const insights = buildRuleBasedInsights(content)
  const insightHtml = renderInsightsHtml(insights, advice)

  return {
    html: buildStandaloneHtml({
      title,
      body: `${insightHtml}${pages.join('')}`,
      options,
      format: 'PDF',
      extraBodyClass: 'pdf-document'
    }),
    title,
    format: 'pdf',
    warnings: [
      {
        type: 'info',
        message: '当前使用 PDF 文本提取。扫描版页面将在后续版本中支持 OCR 或图片渲染。'
      }
    ],
    pageCount: document.numPages
  }
}
