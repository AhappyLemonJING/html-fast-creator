import { readFile } from 'node:fs/promises'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import type { ConversionOptions, ConversionResult } from '../../shared/types'
import { getDesignAdvice } from '../design/designAdvisor'
import { buildRuleBasedInsights } from '../design/insights'
import { normalizeTextContent } from '../design/normalizers'
import { renderInsightsHtml } from '../design/renderers'
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
  const advice = getDesignAdvice('markdown', options.theme)
  const insights = buildRuleBasedInsights(content)
  const insightHtml = renderInsightsHtml(insights, advice)
  const body = markdown.render(source)

  return {
    html: buildStandaloneHtml({
      title,
      body: `${insightHtml}${body}`,
      options,
      format: 'Markdown'
    }),
    title,
    format: 'markdown',
    warnings: []
  }
}
