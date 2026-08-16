import type {
  Audience,
  BeautifulTemplateId,
  ContentRole,
  DocumentAnalysis,
  DocumentType,
  NormalizedContent,
  SectionAnalysis
} from './types'

const documentTypeLabels: Record<DocumentType, string> = {
  report: '综合报告',
  article: '深度文章',
  'data-report': '数据报告',
  tutorial: '教程指南',
  proposal: '方案提案',
  technical: '技术文档',
  news: '资讯通讯',
  deck: '演示内容'
}

const audienceLabels: Record<Audience, string> = {
  executive: '管理层',
  technical: '技术读者',
  general: '普通读者',
  academic: '学术读者'
}

const dataTerms = [
  '数据',
  '指标',
  '报表',
  '统计',
  '图表',
  '营收',
  '收入',
  '成本',
  '利润',
  '销售额',
  '同比',
  '环比',
  '预算',
  'KPI',
  '季度',
  '月度',
  '年度',
  '财务',
  '占比',
  '增长',
  '下降'
]

const technicalTerms = [
  'API',
  'SDK',
  '函数',
  '参数',
  '代码',
  '开发',
  '部署',
  '配置',
  '命令行',
  '架构',
  '数据库',
  'npm',
  'Git',
  'HTTP',
  '前端',
  '后端',
  '技术',
  '实现',
  '代码示例',
  '接口'
]

const tutorialTerms = [
  '教程',
  '步骤',
  '指南',
  '如何',
  '安装',
  '配置',
  '使用',
  '快速开始',
  '入门',
  '示例',
  '第一步',
  '接下来'
]

const proposalTerms = [
  '方案',
  '建议',
  '计划',
  '目标',
  '提案',
  '策略',
  '路线图',
  'Roadmap',
  '执行',
  '下一步',
  '行动',
  '愿景'
]

const riskTerms = [
  '风险',
  '问题',
  '挑战',
  '注意',
  '警告',
  '不能',
  '避免',
  '限制',
  '缺失',
  '失败',
  '隐患',
  '待解决'
]

const actionTerms = [
  '建议',
  '下一步',
  '行动',
  '需要',
  '应当',
  '必须',
  '确保',
  '计划',
  'TODO',
  '待办',
  '优先',
  '执行'
]

const topicDictionary: Array<{ label: string; terms: string[] }> = [
  { label: '数据表现', terms: dataTerms },
  { label: '技术实现', terms: technicalTerms },
  { label: '行动建议', terms: actionTerms },
  { label: '风险提示', terms: riskTerms },
  { label: '方案与计划', terms: proposalTerms }
]

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>|#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitSentences(value: string): string[] {
  return stripMarkdown(value)
    .split(/[。！？!?；;\n]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 8)
}

function countTerms(value: string, terms: string[]): number {
  const text = stripMarkdown(value)
  return terms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0)
}

function countNumericSignals(value: string): number {
  const numericMatches = value.match(/\d+(?:\.\d+)?\s*(?:%|万|亿|元|美元|人|个|条|次|家)/g) ?? []
  const keywordMatches = dataTerms.reduce((count, term) => count + (value.includes(term) ? 1 : 0), 0)
  return numericMatches.length + Math.floor(keywordMatches / 2)
}

function detectDocumentType(content: NormalizedContent): DocumentType {
  if (content.sourceFormat === 'excel') return 'data-report'

  const fullText = content.sections.map((section) => `${section.title}\n${section.body}`).join('\n')
  const headingText = content.sections.map((section) => section.title).join('\n')
  const numericSignals = countNumericSignals(fullText)
  const dataScore = content.tables.length * 2 + numericSignals + countTerms(headingText, dataTerms) * 2
  const technicalScore = countTerms(fullText, technicalTerms) + (fullText.includes('```') ? 3 : 0)
  const tutorialScore = countTerms(fullText, tutorialTerms)
  const proposalScore = countTerms(fullText, proposalTerms)

  if (dataScore >= 7) return 'data-report'
  if (technicalScore >= 5 && tutorialScore >= 2) return 'tutorial'
  if (proposalScore >= 5) return 'proposal'
  if (technicalScore >= 5) return 'technical'
  if (dataScore >= 4) return 'report'
  if (tutorialScore >= 4) return 'tutorial'
  if (/新闻|通讯|周报|日报|资讯|最新|动态/.test(fullText)) return 'news'
  if (content.sections.length >= 5) return 'article'
  return 'report'
}

function detectAudience(content: NormalizedContent): Audience {
  const fullText = content.sections.map((section) => `${section.title}\n${section.body}`).join('\n')
  const technicalScore = countTerms(fullText, technicalTerms) + (fullText.includes('```') ? 4 : 0)
  const academicScore = countTerms(fullText, [
    '研究',
    '论文',
    '实验',
    '文献',
    '结论',
    '假设',
    '理论',
    '学术',
    '方法论',
    '分析框架'
  ])
  const executiveScore = countTerms(fullText, [
    '董事会',
    '管理层',
    '汇报',
    '决策',
    '战略',
    '投资',
    '融资',
    '商业',
    '客户',
    '营收',
    '预算',
    'KPI'
  ])

  if (academicScore >= 4) return 'academic'
  if (executiveScore >= 4) return 'executive'
  if (technicalScore >= 6) return 'technical'
  return 'general'
}

function extractCoreFocus(content: NormalizedContent): string {
  if (content.sourceFormat === 'excel') {
    const numericTables = content.tables
      .filter((table) => table.rows.some((row) => row.some((cell) => /\d/.test(cell))))
      .map((table) => table.title)
      .slice(0, 3)

    return numericTables.length > 0
      ? `工作簿包含 ${content.tables.length} 个工作表，数据重点为 ${numericTables.join('、')}。`
      : `工作簿包含 ${content.tables.length} 个工作表，适合以表格和指标方式快速浏览。`
  }

  const explicitSection = content.sections.find((section) =>
    /(摘要|总结|结论|核心|概述|TL;DR|Executive Summary|Summary|Conclusion|核心观点|主要结论|要点)/i.test(
      section.title
    )
  )
  const sourceSection = explicitSection ?? content.sections[0]
  if (!sourceSection) return '已从文档中提取主要内容。'

  const sentences = splitSentences(sourceSection.body).slice(0, 2)
  if (sentences.length === 0 && content.sections[1]) {
    sentences.push(...splitSentences(content.sections[1].body).slice(0, 2))
  }

  const focus = sentences.join('。').slice(0, 180)
  return focus || content.title
}

function extractSummary(content: NormalizedContent): string {
  const sentences = content.sections
    .slice(0, 3)
    .flatMap((section) => splitSentences(section.body))
    .slice(0, 4)

  return sentences.join('。').slice(0, 360) || content.sections[0]?.body.slice(0, 240) || content.title
}

function extractKeyThemes(content: NormalizedContent): string[] {
  const fullText = content.sections.map((section) => `${section.title}\n${section.body}`).join('\n')
  const themes = topicDictionary
    .map((topic) => ({ label: topic.label, score: countTerms(fullText, topic.terms) }))
    .filter((topic) => topic.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((topic) => topic.label)

  const sectionTitles = content.sections
    .slice(0, 6)
    .map((section) => section.title)
    .filter((title) => title.length > 2 && title.length < 30)

  return [...new Set([...themes, ...sectionTitles])].slice(0, 6)
}

function roleForSection(title: string, body: string): { role: ContentRole; label: string } {
  const text = `${title}\n${body}`
  if (/(摘要|总结|结论|核心|概述|导读|核心观点|TL;DR|Executive Summary|Summary)/i.test(title)) {
    return { role: 'lead', label: '核心结论' }
  }
  if (countTerms(text, riskTerms) > 0 || /(风险|问题|挑战|注意|警告|风险提示|注意事项)/.test(title)) {
    return { role: 'risk', label: '风险提示' }
  }
  if (countTerms(text, actionTerms) > 0 || /(建议|行动|下一步|计划|待办|TODO|Roadmap|路线|执行|方案)/i.test(title)) {
    return { role: 'action', label: '行动建议' }
  }
  if (/(数据|指标|表格|统计|图表|财务|营收|趋势|对比)/.test(title)) {
    return { role: 'data', label: '数据证据' }
  }
  if (/(背景|现状|概述|介绍|环境|市场|背景|why|background)/i.test(title)) {
    return { role: 'context', label: '背景信息' }
  }
  if (/(附录|参考|资料|附注|引用|来源)/.test(title)) {
    return { role: 'appendix', label: '附录' }
  }
  return { role: 'body', label: '正文' }
}

function recommendTemplate(content: NormalizedContent, documentType: DocumentType, audience: Audience, darkMode: boolean): BeautifulTemplateId {
  if (documentType === 'data-report') return audience === 'academic' ? 'monochrome' : 'blue-professional'
  if (documentType === 'technical' || documentType === 'tutorial') return darkMode ? 'signal' : 'blue-professional'
  if (documentType === 'proposal') return audience === 'executive' ? 'blue-professional' : 'editorial-forest'
  if (audience === 'academic') return darkMode ? 'vellum' : 'monochrome'
  if (audience === 'executive') return darkMode ? 'signal' : 'blue-professional'
  if (documentType === 'article') return darkMode ? 'grove' : 'soft-editorial'
  if (content.tables.length > 0 || countNumericSignals(content.sections.map((section) => section.body).join('\n')) >= 3) {
    return 'blue-professional'
  }
  return darkMode ? 'editorial-forest' : 'soft-editorial'
}

function analyzeSections(content: NormalizedContent): SectionAnalysis[] {
  return content.sections.map((section, index) => {
    const role = roleForSection(section.title, section.body)
    return {
      sectionId: section.id,
      role: role.role,
      priority: index,
      label: role.label
    }
  })
}

export function analyzeDocument(content: NormalizedContent, darkMode = false): DocumentAnalysis {
  const fullText = content.sections.map((section) => `${section.title}\n${section.body}`).join('\n')
  const documentType = detectDocumentType(content)
  const audience = detectAudience(content)
  const coreFocus = extractCoreFocus(content)
  const sectionRoles = analyzeSections(content)
  const riskSignals = countTerms(fullText, riskTerms)
  const actionSignals = countTerms(fullText, actionTerms)
  const technicalSignals = countTerms(fullText, technicalTerms)

  const tone = [
    documentType === 'data-report' ? 'data-driven' : '',
    riskSignals > 0 ? 'risk-aware' : '',
    actionSignals > 0 ? 'action-oriented' : '',
    technicalSignals > 0 ? 'technical' : '',
    audience === 'executive' ? 'concise' : 'explanatory'
  ].filter(Boolean)

  return {
    documentType,
    documentTypeLabel: documentTypeLabels[documentType],
    audience,
    audienceLabel: audienceLabels[audience],
    coreFocus,
    summary: extractSummary(content),
    keyThemes: extractKeyThemes(content),
    sectionRoles,
    tone,
    recommendedTemplate: recommendTemplate(content, documentType, audience, darkMode),
    recommendedDensity: documentType === 'data-report' ? 'compact' : documentType === 'article' ? 'editorial' : 'comfortable',
    confidence: Math.min(0.96, 0.58 + content.tables.length * 0.06 + content.sections.length * 0.02)
  }
}
