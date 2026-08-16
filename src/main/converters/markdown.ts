import { readFile } from 'node:fs/promises'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import type { ConversionOptions, ConversionResult } from '../../shared/types'
import { buildSemanticInsights } from '../design/insights'
import { normalizeTextContent } from '../design/normalizers'
import { prepareDesign } from '../design/prepareDesign'
import { renderInsightsHtml } from '../design/renderers'
import { applyAiDesign } from '../design/aiDesigner'
import { buildStandaloneHtml } from '../theme'
import { escapeHtml, titleFromPath } from '../utils'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (code, language) => {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value
      } catch {
        return escapeHtml(code)
      }
    }
    return escapeHtml(code)
  }
})

export async function convertMarkdown(
  filePath: string,
  options: ConversionOptions
): Promise<ConversionResult> {
  const source = await readFile(filePath, 'utf8')
  const title = titleFromPath(filePath)
  const content = normalizeTextContent(title, 'markdown', source)
  const design = prepareDesign(content, options)
  const insights = buildSemanticInsights(content, design.analysis)
  const localInsightHtml = renderInsightsHtml(insights, design.advice, design.analysis, design.template)
  const body = markdown.render(source)
  const aiDesign = await applyAiDesign({ content, design, insights, options })
  if (aiDesign.recipe && !aiDesign.recipe.contentHtml.trim()) {
    throw new Error('AI 没有返回完整正文布局，请重新生成或换用非 reasoning 模型。')
  }
  const bodyHtml = aiDesign.recipe?.contentHtml || `${localInsightHtml}${body}`

  return {
    html: buildStandaloneHtml({
      title,
      body: bodyHtml,
      options: design.resolvedOptions,
      format: 'Markdown',
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
    format: 'markdown',
    warnings: [],
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
