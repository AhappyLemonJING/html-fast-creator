import type { AiDesignConfig, ConversionOptions } from '../../shared/types'
import type { BeautifulTemplateRecipe, DocumentInsights, NormalizedContent } from './types'
import type { PreparedDesign } from './prepareDesign'
import { AI_HTML_DESIGNER_SYSTEM_PROMPT } from './aiPrompt'

export interface AiDesignRecipe {
  themeName: string
  templateName: string
  documentType: string
  audience: string
  density: string
  layoutClass: string
  tokens: string
  coverHtml: string
  contentHtml: string
  css: string
  notes: string
}

export interface AppliedAiDesign {
  template: BeautifulTemplateRecipe
  tokens: string
  recipe: AiDesignRecipe | null
}

interface AiDesignRequest {
  content: NormalizedContent
  design: PreparedDesign
  insights: DocumentInsights
  options: ConversionOptions
}

const allowedLayoutClasses = new Set([
  'layout-editorial',
  'layout-report',
  'layout-dashboard',
  'layout-print',
  'layout-magazine',
  'layout-bento'
])

function truncate(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1)}…`
}

function buildContext(request: AiDesignRequest): string {
  const { content, design, insights, options } = request
  const sectionRoles = new Map(design.analysis.sectionRoles.map((item) => [item.sectionId, item.role]))

  const context = {
    title: content.title,
    sourceFormat: content.sourceFormat,
    styleHint: options.aiDesign?.styleHint?.trim() || '根据内容自动判断',
    darkMode: options.darkMode,
    layoutContract: {
      contentMode: 'full',
      appendOriginalBody: false,
      preserveOriginalFacts: true,
      doNotDuplicateSections: true
    },
    localAnalysis: {
      documentType: design.analysis.documentType,
      documentTypeLabel: design.analysis.documentTypeLabel,
      audience: design.analysis.audience,
      audienceLabel: design.analysis.audienceLabel,
      coreFocus: design.analysis.coreFocus,
      summary: design.analysis.summary,
      keyThemes: design.analysis.keyThemes,
      recommendedTemplate: design.analysis.recommendedTemplate
    },
    sections: content.sections.map((section) => ({
      id: section.id,
      level: section.level,
      title: section.title,
      role: sectionRoles.get(section.id) ?? 'body',
      body: section.body
    })),
    tables: content.tables.map((table) => ({
      title: table.title,
      headers: table.headers,
      rowCount: table.rows.length,
      rows: content.sourceFormat === 'excel' ? table.rows.slice(0, 20) : table.rows
    })),
    insights: {
      summary: truncate(insights.summary, 500),
      metrics: insights.metrics,
      charts: insights.charts.map((chart) => ({
        kind: chart.kind,
        title: chart.title,
        labels: chart.labels.slice(0, 8),
        values: chart.values.slice(0, 8),
        source: chart.source
      })),
      findings: insights.findings.slice(0, 5),
      highlights: insights.highlights.slice(0, 10),
      risks: insights.risks.slice(0, 5),
      actions: insights.actions.slice(0, 5)
    }
  }

  return JSON.stringify(context, null, 2)
}

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return fenced[1].trim()

  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1)
  }

  return raw.trim()
}

function parseTokenObject(value: string): Record<string, string> {
  const tokens: Record<string, string> = {}
  const pattern = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g
  let match = pattern.exec(value)
  while (match) {
    tokens[match[1]] = match[2].trim()
    match = pattern.exec(value)
  }
  return tokens
}

function sanitizeTokenValue(value: unknown): string {
  return String(value)
    .replace(/[;{}<>]/g, '')
    .replace(/@import|expression\s*\(|url\s*\(/gi, '')
    .trim()
}

function tokensToCss(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ')
}

function mergeTokens(fallbackTokens: string, aiTokens: unknown): string {
  const merged = parseTokenObject(fallbackTokens)
  if (aiTokens && typeof aiTokens === 'object' && !Array.isArray(aiTokens)) {
    for (const [key, value] of Object.entries(aiTokens as Record<string, unknown>)) {
      if (key.startsWith('--') && value !== undefined && value !== null) {
        const sanitized = sanitizeTokenValue(value)
        if (sanitized) merged[key] = sanitized
      }
    }
  }
  return tokensToCss(merged)
}

function sanitizeCss(value: unknown): string {
  return String(value ?? '')
    .replace(/<\/style>/gi, '')
    .replace(/@import\s+[^;]+;/gi, '')
    .replace(/url\s*\([^)]*\)/gi, 'none')
    .replace(/expression\s*\(/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .trim()
}

function sanitizeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/?>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .trim()
}

function unwrapCoverHtml(value: string): string {
  let current = value.trim()
  let changed = true

  while (changed) {
    changed = false
    const match = current.match(
      /^<([a-zA-Z0-9]+)\b[^>]*\bclass\s*=\s*["'][^"']*\bdoc-cover\b[^"']*["'][^>]*>([\s\S]*)<\/\1>\s*$/i
    )
    if (match?.[2]) {
      current = match[2].trim()
      changed = true
    }
  }

  return current
}

function sanitizeClass(value: unknown, fallback: string): string {
  const candidate = String(value ?? '').trim().toLowerCase()
  return allowedLayoutClasses.has(candidate) ? candidate : fallback
}

function sanitizeDensity(value: unknown, fallback: string): string {
  const candidate = String(value ?? '').trim().toLowerCase()
  return ['compact', 'comfortable', 'editorial'].includes(candidate) ? candidate : fallback
}

function parseRecipe(
  raw: string,
  fallbackTokens: string,
  fallbackLayoutClass: string,
  fallbackDensity: string
): AiDesignRecipe {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(extractJson(raw)) as Record<string, unknown>
  } catch {
    throw new Error('AI 返回的内容不是有效 JSON，请换用非 reasoning 模型或增加输出长度后重试。')
  }

  const themeName = String(parsed.themeName || 'AI 智能设计').slice(0, 40)
  const templateName = String(parsed.templateName || 'AI Generated Layout').slice(0, 60)
  const documentType = String(parsed.documentType || 'report').slice(0, 30)
  const audience = String(parsed.audience || 'general').slice(0, 30)
  const density = sanitizeDensity(parsed.density, fallbackDensity)
  const notes = String(parsed.notes || 'AI 根据内容结构和数据密度生成了差异化布局。').slice(0, 300)

  return {
    themeName,
    templateName,
    documentType,
    audience,
    density,
    layoutClass: sanitizeClass(parsed.layoutClass, fallbackLayoutClass),
    tokens: mergeTokens(fallbackTokens, parsed.tokens),
    coverHtml: unwrapCoverHtml(sanitizeHtml(parsed.coverHtml)),
    contentHtml: sanitizeHtml(parsed.contentHtml),
    css: sanitizeCss(parsed.css),
    notes
  }
}

function resolveConfig(config: AiDesignConfig): Required<Pick<AiDesignConfig, 'baseUrl' | 'model' | 'apiKey'>> {
  const baseUrl = (
    config.baseUrl?.trim() ||
    process.env.OPENAI_BASE_URL ||
    'https://api.deepseek.com'
  ).replace(/\/+$/, '')
  const model = config.model?.trim() || process.env.OPENAI_MODEL || 'deepseek-chat'
  const apiKey = config.apiKey?.trim() || process.env.OPENAI_API_KEY || ''

  if (!apiKey) {
    throw new Error('AI 设计需要 API Key。请在左侧填写，或设置 OPENAI_API_KEY 环境变量。')
  }

  return { baseUrl, model, apiKey }
}

async function requestCompletion(
  baseUrl: string,
  model: string,
  apiKey: string,
  messages: Array<{ role: 'system' | 'user'; content: string }>
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 8000
      }),
      signal: controller.signal
    })

    const rawBody = await response.text()
    let payload: Record<string, unknown> = {}
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>
    } catch {
      payload = { rawBody }
    }

    if (!response.ok) {
      const apiError = payload.error as { message?: string } | undefined
      throw new Error(apiError?.message || `AI 请求失败：HTTP ${response.status}，${rawBody.slice(0, 300)}`)
    }

    const content = extractMessageContent(payload)
    if (!content) {
      throw new Error(
        `AI 没有返回最终设计内容。若使用的是 reasoning 模型，可能是输出 token 不足，已使用 max_tokens=8000。原始响应：${rawBody.slice(0, 500)}`
      )
    }

    return content
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI 设计请求超时，请检查网络或模型配置。')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function extractMessageContent(payload: Record<string, unknown>): string {
  const choices = Array.isArray(payload.choices) ? payload.choices : []
  const firstChoice = choices[0] as Record<string, unknown> | undefined
  if (!firstChoice) return ''

  const message = firstChoice.message as Record<string, unknown> | undefined
  const messageContent = message?.content
  if (typeof messageContent === 'string') return messageContent.trim()
  if (Array.isArray(messageContent)) {
    const text = messageContent
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object') {
          const record = part as Record<string, unknown>
          if (typeof record.text === 'string') return record.text
          if (typeof record.content === 'string') return record.content
          if (typeof record.output_text === 'string') return record.output_text
        }
        return ''
      })
      .join('')
      .trim()
    if (text) return text
  }

  if (typeof firstChoice.text === 'string') {
    const text = firstChoice.text.trim()
    if (text) return text
  }

  const delta = firstChoice.delta as Record<string, unknown> | undefined
  const deltaContent = delta?.content
  if (typeof deltaContent === 'string' && deltaContent.trim()) {
    return deltaContent.trim()
  }

  if (typeof payload.output_text === 'string') {
    const text = payload.output_text.trim()
    if (text) return text
  }

  return ''
}

export async function requestAiDesign(request: AiDesignRequest): Promise<AiDesignRecipe> {
  const config = request.options.aiDesign
  if (!config) {
    throw new Error('缺少 AI 设计配置。')
  }

  const resolved = resolveConfig(config)
  const raw = await requestCompletion(resolved.baseUrl, resolved.model, resolved.apiKey, [
    { role: 'system', content: AI_HTML_DESIGNER_SYSTEM_PROMPT },
    { role: 'user', content: buildContext(request) }
  ])

  return parseRecipe(
    raw,
    request.design.tokens,
    request.design.template.layoutClass,
    request.design.advice.density
  )
}

export async function applyAiDesign(
  request: AiDesignRequest
): Promise<AppliedAiDesign> {
  if (!request.options.aiDesign?.enabled) {
    return {
      template: request.design.template,
      tokens: request.design.tokens,
      recipe: null
    }
  }

  const recipe = await requestAiDesign(request)
  return {
    template: {
      ...request.design.template,
      name: recipe.templateName,
      layoutClass: recipe.layoutClass,
      tokens: recipe.tokens
    },
    tokens: recipe.tokens,
    recipe
  }
}
