import mammoth from 'mammoth'
import type { ConversionOptions, ConversionResult } from '../../shared/types'
import { getDesignAdvice } from '../design/designAdvisor'
import { buildRuleBasedInsights } from '../design/insights'
import { normalizeTextContent } from '../design/normalizers'
import { renderInsightsHtml } from '../design/renderers'
import { buildStandaloneHtml } from '../theme'
import { titleFromPath } from '../utils'

export async function convertWord(
  filePath: string,
  options: ConversionOptions
): Promise<ConversionResult> {
  const result = await mammoth.convertToHtml({ path: filePath })
  const rawText = await mammoth.extractRawText({ path: filePath })
  const title = titleFromPath(filePath)
  const content = normalizeTextContent(title, 'word', rawText.value)
  const advice = getDesignAdvice('word', options.theme)
  const insights = buildRuleBasedInsights(content)
  const insightHtml = renderInsightsHtml(insights, advice)
  const warnings = (result.messages ?? []).map((message) => ({
    type: message.type === 'warning' ? ('warning' as const) : ('info' as const),
    message: message.message
  }))

  return {
    html: buildStandaloneHtml({
      title,
      body: `${insightHtml}${result.value}`,
      options,
      format: 'Word'
    }),
    title,
    format: 'word',
    warnings
  }
}
