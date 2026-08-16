import type { ConversionOptions, OutputTheme } from '../../shared/types'
import { analyzeDocument } from './documentAnalyzer'
import { getDesignAdvice } from './designAdvisor'
import { getBeautifulTemplate, templateToTheme, themeToTemplate } from './beautifulTemplates'
import { themeTokens } from './themeRecipes'
import type { BeautifulTemplateRecipe, DesignAdvice, DocumentAnalysis, NormalizedContent } from './types'

export interface PreparedDesign {
  analysis: DocumentAnalysis
  advice: DesignAdvice
  template: BeautifulTemplateRecipe
  resolvedTheme: OutputTheme
  resolvedOptions: ConversionOptions
  tokens: string
}

export function prepareDesign(content: NormalizedContent, options: ConversionOptions): PreparedDesign {
  const analysis = analyzeDocument(content, options.darkMode)
  const templateId = options.theme === 'auto' ? analysis.recommendedTemplate : themeToTemplate(options.theme)
  const template = getBeautifulTemplate(templateId)
  const resolvedTheme = options.theme === 'auto' ? templateToTheme(template.id) : options.theme
  const advice = getDesignAdvice(content.sourceFormat, resolvedTheme)
  const tokens = options.theme === 'auto' ? template.tokens : themeTokens[resolvedTheme]

  return {
    analysis,
    advice,
    template,
    resolvedTheme,
    resolvedOptions: {
      ...options,
      theme: resolvedTheme
    },
    tokens
  }
}
