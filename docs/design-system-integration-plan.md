# Design System Integration Plan

目标：把下面三类外部设计能力沉淀到本项目的输出 HTML 渲染层，而不是把第三方 Skill 整包塞进 Electron。

| 来源 | 我们取什么 | 不取什么 |
| --- | --- | --- |
| `ui-ux-pro-max-skill` | 设计规则、配色、字体、图表决策、反模式清单 | 不引入其 CLI、Python 搜索程序和全量 gallery |
| `gzh-design-skill` | 主题配方结构、中文文章组件库、校验思路 | 不继承公众号平台限制，例如禁止 class/id/style 标签 |
| `beautiful-html-templates` | 高质量模板元数据、配色、字体、组件结构 | 不直接复制固定尺寸的 PPT 页面，也不引入截图资源 |

## 1. 新目录结构

建议在现有 `src/main/` 下增加一个独立设计系统层：

```text
src/main/design/
  tokens/
    coreTokens.ts
    themeTokens.ts
  rules/
    uiUxProMaxAdapter.ts
    designAdvisor.ts
    chartDecision.ts
  themes/
    editorial.ts
    technical.ts
    business.ts
    print.ts
    gzh/
      moyu-green.ts
      graphite-minimal.ts
      zen-whitespace.ts
      red-white.ts
  templates/
    doc/
      article.ts
      report.ts
    data/
      kpi.ts
      chart.ts
      table.ts
    slides/
      deck.ts
    beautiful/
      soft-editorial.ts
      editorial-forest.ts
      blue-professional.ts
  composer/
    contentModel.ts
    documentComposer.ts
    reportComposer.ts
    slideComposer.ts
  insight/
    insightTypes.ts
    insightGenerator.ts
    chartRenderer.ts
    highlightRenderer.ts
```

## 2. 先做内容模型

当前转换器直接返回一段 HTML。下一步应该把转换拆成两层：

```text
原始文档
  -> Converter
  -> NormalizedContent
  -> Design Composer
  -> Standalone HTML
```

`NormalizedContent` 至少包括：

```ts
interface NormalizedContent {
  title: string
  sourceFormat: DocFormat
  sections: ContentSection[]
  tables: DataTable[]
  images: ContentImage[]
  metrics: MetricItem[]
  timeline?: TimelineItem[]
  risks?: RiskItem[]
  actions?: ActionItem[]
}
```

这样 AI 分析、图表渲染和主题选择都基于同一份结构化数据，而不是继续解析 HTML 字符串。

## 3. 接入 UI UX Pro Max 的设计规则

仓库里的核心数据适合做成本地规则库：

```text
src/ui-ux-pro-max/data/
  colors.csv
  typography.csv
  charts.csv
  styles.csv
  products.csv
  ui-reasoning.csv
  ux-guidelines.csv
```

建议只提取当前需要的几类规则：

```text
src/main/design/rules/
  colors.json
  typography.json
  charts.json
  ui-guidelines.json
```

每个文件保留许可证和来源说明，不做全量复制。提取规则可以选择：

- 文档型主题：优先 editorial、minimal、technical。
- 数据报告主题：优先 dashboard、analytics、business。
- 演示型主题：优先 presentation、editorial deck。

`designAdvisor.ts` 根据 `sourceFormat + options.mode + template` 输出：

```ts
interface DesignAdvice {
  palette: DesignPalette
  typography: TypographyRule
  recommendedCharts: ChartRecommendation[]
  avoidPatterns: string[]
  density: 'compact' | 'comfortable' | 'editorial'
}
```

UI UX Pro Max 最重要的不是颜色，而是它的反模式清单。我们要把这部分固化进代码：

- 禁止紫色渐变。
- 禁止无意义 Hero。
- 禁止所有内容都塞进卡片。
- 禁止 emoji 当图标。
- 数据不能只靠颜色区分。
- 图表必须保留单位和来源。

## 4. 接入 gzh-design-skill 的主题组织方式

`gzh-design-skill` 最值得借鉴的是主题配方格式：

```text
设计变量
组件库
完整文章模板骨架
文章类型 -> 组件组合配方
Markdown -> 组件映射规则
```

我们不需要公众号的内联限制，但可以沿用这个结构：

```ts
interface ThemeRecipe {
  id: string
  name: string
  description: string
  tokens: Record<string, string>
  components: ComponentRecipe[]
  articleTemplate: ArticleTemplate
  articleTypes: ArticleTypeRecipe[]
  markdownMapping: MarkdownMappingRule[]
}
```

建议先吸收四个主题：

- 摸鱼绿：教程、清单、工具测评。
- 石墨极简：技术评论、专业文档。
- 留白禅意：随笔、深度内容。
- 红白编辑：观点、分析、正式文章。

这些主题会进入当前 App 的主题选择器，和现有 Editorial、Technical、Business、Print 并列。

## 5. 接入 beautiful-html-templates 的成品模板

`beautiful-html-templates` 每个模板都由三部分组成：

```text
templates/{slug}/
  design.md
  template.html
  template.json
```

其中 `template.json` 最适合作为模板元数据来源：

```json
{
  "slug": "soft-editorial",
  "mood": ["literary", "elegant"],
  "occasion": ["editorial feature"],
  "palette": {},
  "typography": {},
  "scheme": "light"
}
```

建议先做这几个成品模板：

- `soft-editorial`：文学性报告、深度文章。
- `blue-professional`：商务报告、咨询交付物。
- `editorial-forest`：技术评论、编辑风内容。
- `monochrome`：极简文档、打印稿。

这些模板不是直接搬 HTML 文件，而是抽取成：

```ts
interface BeautifulTemplateRecipe {
  slug: string
  tokens: Record<string, string>
  cover: TemplateComponent
  section: TemplateComponent
  card: TemplateComponent
  chart: TemplateComponent
  footer: TemplateComponent
}
```

这样它们可以和我们的 Markdown、Word、Excel 内容模型对接，而不是只能做 PPT。

## 6. AI 分析层

用户要的“自动识别数据、生成报表图、分析重点并标注”，建议放在 `insight/` 层。

调用流程：

```text
NormalizedContent
  -> InsightGenerator
  -> DocumentInsights
  -> ReportComposer
  -> HTML
```

`DocumentInsights` 输出：

```ts
interface DocumentInsights {
  summary: string
  keyFindings: Finding[]
  metrics: MetricCard[]
  charts: ChartSpec[]
  highlights: HighlightSpan[]
  risks: RiskCallout[]
  actions: ActionStep[]
}
```

图表先使用零依赖内联 SVG：

- 趋势：折线图。
- 对比：横向条形图。
- 占比：环形图。
- 排名：条形列表。
- 流程：时间轴。

之后可以逐步加入交互式 Canvas 图表，但第一版保持单文件 HTML 和离线可用。

## 7. 与现有代码的连接点

现有 `theme.ts` 会继续存在，但逐步变为：

```ts
buildStandaloneHtml(input)
  -> documentComposer(
       content,
       themeRecipe,
       designAdvice,
       insights
     )
```

转换器改动：

```ts
export async function convertDocument(filePath, options) {
  const content = await extractNormalizedContent(filePath, options)
  const insights = await generateInsights(content, options)
  const theme = selectTheme(options)
  const advice = getDesignAdvice(content.sourceFormat, theme)
  const html = composeStandaloneHtml(content, insights, theme, advice)
  return html
}
```

这样 UI 层不需要知道 Word、Excel 或 PDF 的差异，只需要拿到最终 HTML。

## 8. 落地顺序

建议按下面顺序实施：

1. 抽取 `NormalizedContent`，让现有四个转换器先输出结构化内容。
2. 新建 `designAdvisor`，接入 UI UX Pro Max 的配色、字体、图表规则。
3. 新建 `ThemeRecipe`，把 gzh-design 的四个主题转成项目主题。
4. 接入 beautiful-html-templates 的 4 个模板元数据。
5. 新建 `InsightGenerator`，先支持 Excel 和 Word/PDF 的摘要、重点、图表。
6. 新建 `ReportComposer`，输出 KPI、图表、重点标注。
7. 最后替换当前 `buildStandaloneHtml`，并保留现有主题作为兼容回退。

## 9. 许可证

三个仓库来源不同，接入前需要保留：

- 原始仓库地址。
- 许可证文件。
- 被提取文件的路径。
- 修改说明。

不要把整个仓库提交进本项目，只保留项目实际使用的数据、规则和模板片段。
