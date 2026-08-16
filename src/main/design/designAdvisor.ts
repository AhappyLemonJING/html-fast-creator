import type { DocFormat, OutputTheme } from '../../shared/types'
import { getThemeRecipe } from './themeRecipes'
import type { ChartKind, Density, DesignAdvice } from './types'

const formatDensity: Record<DocFormat, Density> = {
  markdown: 'comfortable',
  word: 'editorial',
  excel: 'compact',
  pdf: 'editorial'
}

const formatCharts: Record<DocFormat, ChartKind[]> = {
  markdown: ['table', 'timeline'],
  word: ['table', 'bar', 'line'],
  excel: ['bar', 'line', 'donut', 'table'],
  pdf: ['table', 'bar', 'line']
}

const avoidPatterns = [
  '避免整页使用紫色渐变或粉紫渐变',
  '避免把每个内容块都做成卡片',
  '避免使用 emoji 代替图标',
  '避免仅靠颜色区分数据含义',
  '避免无意义的超大 Hero 区域',
  '避免生成无法离线打开的外部字体或 CDN 依赖'
]

export function getDesignAdvice(format: DocFormat, theme: OutputTheme): DesignAdvice {
  const recipe = getThemeRecipe(theme)
  return {
    themeId: theme,
    themeName: recipe.name,
    density: formatDensity[format],
    palette: recipe.palette,
    typography: recipe.typography,
    recommendedCharts: formatCharts[format],
    avoidPatterns
  }
}
