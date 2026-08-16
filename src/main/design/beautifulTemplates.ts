import type { OutputTheme } from '../../shared/types'
import type { BeautifulTemplateId, BeautifulTemplateRecipe, DesignPalette, TypographyRule } from './types'

const fontUi = '"Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
const fontSerif = '"Source Han Serif SC", "Songti SC", "Noto Serif CJK SC", Georgia, serif'
const fontMono = '"SFMono-Regular", "Cascadia Code", "JetBrains Mono", Consolas, monospace'

function recipe(
  id: BeautifulTemplateId,
  name: string,
  description: string,
  mood: string[],
  bestFor: string[],
  palette: DesignPalette,
  typography: TypographyRule,
  layoutClass: string,
  extraTokens = ''
): BeautifulTemplateRecipe {
  const tokens = `
    --bg: ${palette.background};
    --surface: ${palette.surface};
    --surface-2: ${palette.accentSoft};
    --text: ${palette.text};
    --muted: ${palette.muted};
    --accent: ${palette.accent};
    --accent-soft: ${palette.accentSoft};
    --border: ${palette.border};
    --code-bg: ${palette.codeBackground};
    --code-text: ${palette.codeText};
    --radius: 12px;
    --shadow: 0 18px 48px rgba(31, 31, 27, 0.08);
    --font-body: ${fontUi};
    --font-heading: ${typography.headingFont};
    --font-mono: ${fontMono};
    ${extraTokens}
  `

  return {
    id,
    name,
    description,
    source: `https://github.com/zarazhangrui/beautiful-html-templates/tree/main/templates/${id}`,
    mood,
    bestFor,
    palette,
    typography,
    tokens,
    layoutClass
  }
}

const uiTypography = (): TypographyRule => ({
  headingFont: fontUi,
  bodyFont: fontUi,
  monoFont: fontMono,
  headingScale: 'clamp(30px, 4vw, 42px)',
  bodyScale: '16px'
})

const serifTypography = (): TypographyRule => ({
  headingFont: fontSerif,
  bodyFont: fontUi,
  monoFont: fontMono,
  headingScale: 'clamp(32px, 4.2vw, 46px)',
  bodyScale: '17px'
})

export const beautifulTemplateRecipes: Record<BeautifulTemplateId, BeautifulTemplateRecipe> = {
  'blue-professional': recipe(
    'blue-professional',
    'Blue Professional',
    '奶油纸面与电光蓝强调，适合商务报告、咨询交付和数据简报。',
    ['professional', 'modern', 'calm', 'trustworthy'],
    ['B2B 报告', '咨询交付', '内部复盘', '数据看板'],
    {
      background: '#fdfae7',
      surface: '#fffdf6',
      text: '#111111',
      muted: '#6b6b6b',
      accent: '#1e2bfa',
      accentSoft: '#e5e8ff',
      border: '#d9d8cc',
      codeBackground: '#111111',
      codeText: '#f5f3e8'
    },
    uiTypography(),
    'layout-report',
    '--radius: 10px; --shadow: 0 16px 44px rgba(30, 43, 250, 0.08);'
  ),
  'soft-editorial': recipe(
    'soft-editorial',
    'Soft Editorial',
    '暖纸、深墨和低饱和粉彩，适合长文、品牌故事与杂志式阅读。',
    ['literary', 'elegant', 'quiet', 'warm-classical'],
    ['深度文章', '品牌故事', '文化内容', '研究报告'],
    {
      background: '#f2eedf',
      surface: '#fbf8ef',
      text: '#2a241b',
      muted: '#6b6356',
      accent: '#2a241b',
      accentSoft: '#e8c9b6',
      border: '#ddd6c5',
      codeBackground: '#262019',
      codeText: '#f7f1e7'
    },
    serifTypography(),
    'layout-editorial',
    '--radius: 6px; --shadow: 0 22px 60px rgba(42, 36, 27, 0.08);'
  ),
  'editorial-forest': recipe(
    'editorial-forest',
    'Editorial Forest',
    '森林绿、灰粉与暖奶油组成安静而有分量的编辑视觉。',
    ['editorial', 'quiet', 'considered', 'warm', 'intentional'],
    ['季度复盘', '研究回顾', '团队总结', '创意提案'],
    {
      background: '#10231f',
      surface: '#19352f',
      text: '#edf2ec',
      muted: '#a3b5ad',
      accent: '#d0a24c',
      accentSoft: '#263e37',
      border: '#2b4a41',
      codeBackground: '#0b1715',
      codeText: '#e5efe9'
    },
    serifTypography(),
    'layout-editorial',
    '--radius: 10px; --shadow: 0 22px 58px rgba(0, 0, 0, 0.24);'
  ),
  monochrome: recipe(
    'monochrome',
    'Monochrome',
    '近乎全墨色的账本文档感，适合白皮书、学术和政策简报。',
    ['restrained', 'literary', 'archival', 'ledger'],
    ['白皮书', '学术报告', '政策简报', '研究综合'],
    {
      background: '#fafadf',
      surface: '#f5f0e4',
      text: '#1a1a16',
      muted: '#5e5e54',
      accent: '#1a1a16',
      accentSoft: '#ebe6d6',
      border: '#d8d4c6',
      codeBackground: '#20201c',
      codeText: '#f5f0e4'
    },
    serifTypography(),
    'layout-print',
    '--radius: 0; --shadow: none;'
  ),
  signal: recipe(
    'signal',
    'Signal',
    '深海军蓝、骨白和暗金，适合权威、高密度的报告与董事会材料。',
    ['institutional', 'trustworthy', 'considered', 'weighty'],
    ['投资者报告', '董事会材料', '咨询交付', '政策研究'],
    {
      background: '#1c2644',
      surface: '#232f55',
      text: '#e2dcd0',
      muted: '#8a96a8',
      accent: '#c8a870',
      accentSoft: '#2e3d5c',
      border: '#2e3d5c',
      codeBackground: '#0b101d',
      codeText: '#e2dcd0'
    },
    serifTypography(),
    'layout-report',
    '--radius: 8px; --shadow: 0 20px 54px rgba(0, 0, 0, 0.24);'
  ),
  grove: recipe(
    'grove',
    'Grove',
    '深森林绿、奶油字和单一锈红，适合自然、研究与顾问类内容。',
    ['organic', 'considered', 'warm', 'literary', 'natural'],
    ['可持续发展', '品牌研究', '文化项目', '顾问交付'],
    {
      background: '#192b1b',
      surface: '#1e3221',
      text: '#d4cfbf',
      muted: '#8ba28f',
      accent: '#c8524a',
      accentSoft: '#2d4631',
      border: '#3a5640',
      codeBackground: '#0d1710',
      codeText: '#d4cfbf'
    },
    serifTypography(),
    'layout-editorial',
    '--radius: 8px; --shadow: 0 20px 52px rgba(0, 0, 0, 0.22);'
  ),
  vellum: recipe(
    'vellum',
    'Vellum',
    '深蓝、暖黄和少量暗青，安静、学者气，适合研究与长报告。',
    ['scholarly', 'literary', 'considered', 'quiet', 'intellectual'],
    ['研究综合', '白皮书', '学术报告', '深度分析'],
    {
      background: '#2a3870',
      surface: '#343f80',
      text: '#f1e77e',
      muted: '#b9b585',
      accent: '#3a7878',
      accentSoft: '#3b4789',
      border: '#4a5794',
      codeBackground: '#1a254f',
      codeText: '#f1e77e'
    },
    serifTypography(),
    'layout-editorial',
    '--radius: 8px; --shadow: 0 22px 60px rgba(0, 0, 0, 0.26);'
  ),
  'long-table': recipe(
    'long-table',
    'Long Table',
    '奶油纸、锈红和现代编辑字型，适合社区、活动与人文内容。',
    ['warm', 'intimate', 'modern', 'friendly', 'small-batch'],
    ['社区活动', '品牌故事', '会员计划', '生活方式'],
    {
      background: '#faf1e2',
      surface: '#f7e9d5',
      text: '#422019',
      muted: '#9a6b60',
      accent: '#b53d2a',
      accentSoft: '#f2e5cf',
      border: '#e8d7b6',
      codeBackground: '#2b1510',
      codeText: '#f7e9d5'
    },
    serifTypography(),
    'layout-editorial',
    '--radius: 999px; --shadow: 0 18px 46px rgba(181, 61, 42, 0.09);'
  ),
  capsule: recipe(
    'capsule',
    'Capsule',
    '暖骨色和粉彩胶囊模块，适合产品介绍、创意简报与轻松教程。',
    ['playful', 'modern', 'warm', 'fresh', 'fun'],
    ['产品介绍', '创意简报', '教程', '生活品牌'],
    {
      background: '#f5f5f0',
      surface: '#ffffff',
      text: '#1a1a1a',
      muted: '#6f6f6a',
      accent: '#e85d4e',
      accentSoft: '#f9d9d2',
      border: '#e2e2dc',
      codeBackground: '#1a1a1a',
      codeText: '#f5f5f0'
    },
    uiTypography(),
    'layout-dashboard',
    '--radius: 18px; --shadow: 0 18px 42px rgba(29, 41, 57, 0.08);'
  )
}

export function getBeautifulTemplate(id: BeautifulTemplateId): BeautifulTemplateRecipe {
  return beautifulTemplateRecipes[id]
}

export function templateToTheme(id: BeautifulTemplateId): OutputTheme {
  switch (id) {
    case 'blue-professional':
      return 'business'
    case 'soft-editorial':
      return 'editorial'
    case 'editorial-forest':
      return 'editorial-forest'
    case 'monochrome':
      return 'print'
    case 'signal':
      return 'technical'
    case 'grove':
    case 'vellum':
      return 'editorial-forest'
    case 'long-table':
      return 'editorial'
    case 'capsule':
      return 'bento'
  }
}

export function themeToTemplate(theme: OutputTheme): BeautifulTemplateId {
  switch (theme) {
    case 'business':
      return 'blue-professional'
    case 'technical':
      return 'signal'
    case 'print':
      return 'monochrome'
    case 'editorial-forest':
      return 'editorial-forest'
    case 'moyu-green':
    case 'zen-whitespace':
    case 'red-white':
      return 'long-table'
    case 'neo-brutal':
    case 'bento':
      return 'capsule'
    case 'terminal':
      return 'signal'
    case 'auto':
    case 'editorial':
    default:
      return 'soft-editorial'
  }
}
