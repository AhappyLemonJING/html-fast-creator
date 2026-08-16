import mammoth from 'mammoth'
import type { ConversionOptions, ConversionResult } from '../../shared/types'
import { buildSemanticInsights } from '../design/insights'
import { normalizeTextContent } from '../design/normalizers'
import { prepareDesign } from '../design/prepareDesign'
import { applyAiDesign } from '../design/aiDesigner'
import { buildStandaloneHtml } from '../theme'
import { titleFromPath } from '../utils'

export async function convertWord(
  filePath: string,
  options: ConversionOptions
): Promise<ConversionResult> {
  const rawText = await mammoth.extractRawText({ path: filePath })
  const title = titleFromPath(filePath)
  const content = normalizeTextContent(title, 'word', rawText.value)
  const design = prepareDesign(content, options)
  const insights = buildSemanticInsights(content, design.analysis)
  const aiDesign = await applyAiDesign({ content, design, insights, options })
  if (!aiDesign.recipe.contentHtml.trim()) {
    throw new Error('AI 没有返回完整正文布局，请重新生成或换用非 reasoning 模型。')
  }
  const bodyHtml = aiDesign.recipe.contentHtml
  return {
    html: buildStandaloneHtml({
      title,
      body: bodyHtml,
      options: design.resolvedOptions,
      format: 'Word',
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
    title,
    format: 'word',
    warnings: [],
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
