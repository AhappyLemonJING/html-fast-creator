import { escapeHtml } from '../utils'
import type {
  BeautifulTemplateRecipe,
  ChartSpec,
  DesignAdvice,
  DocumentAnalysis,
  DocumentInsights,
  MetricItem
} from './types'

function renderMetricCard(metric: MetricItem): string {
  const trendLabel =
    metric.trend === 'up' ? '上升' : metric.trend === 'down' ? '下降' : metric.trend === 'flat' ? '平稳' : ''

  return `<div class="kpi-card">
    <div class="kpi-label">${escapeHtml(metric.label)}</div>
    <div class="kpi-value">${escapeHtml(metric.value)}${metric.unit ? `<span>${escapeHtml(metric.unit)}</span>` : ''}</div>
    ${trendLabel ? `<div class="kpi-trend is-${metric.trend ?? 'flat'}">${trendLabel}</div>` : ''}
  </div>`
}

function renderBarChart(spec: ChartSpec): string {
  const width = 640
  const height = 260
  const padding = 42
  const chartHeight = height - padding * 2
  const max = Math.max(...spec.values, 1)
  const step = spec.values.length > 1 ? (width - padding * 2) / spec.values.length : width - padding * 2
  const barWidth = Math.min(48, step * 0.58)

  const bars = spec.values
    .map((value, index) => {
      const x = padding + index * step + (step - barWidth) / 2
      const barHeight = (value / max) * chartHeight
      const y = padding + chartHeight - barHeight
      const label = spec.labels[index] ?? ''
      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="5" fill="var(--accent)" opacity="0.88"></rect>
        <text x="${x + barWidth / 2}" y="${height - 12}" text-anchor="middle" class="chart-label">${escapeHtml(label)}</text>`
    })
    .join('')

  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(spec.title)}">
    <line x1="${padding}" y1="${padding + chartHeight}" x2="${width - padding}" y2="${padding + chartHeight}" class="chart-axis"></line>
    ${bars}
  </svg>`
}

function renderLineChart(spec: ChartSpec): string {
  const width = 640
  const height = 260
  const padding = 42
  const chartHeight = height - padding * 2
  const max = Math.max(...spec.values, 1)
  const step = spec.values.length > 1 ? (width - padding * 2) / (spec.values.length - 1) : 0

  const points = spec.values
    .map((value, index) => {
      const x = padding + index * step
      const y = padding + chartHeight - (value / max) * chartHeight
      return `${x},${y}`
    })
    .join(' ')

  const dots = spec.values
    .map((value, index) => {
      const x = padding + index * step
      const y = padding + chartHeight - (value / max) * chartHeight
      return `<circle cx="${x}" cy="${y}" r="4" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"></circle>`
    })
    .join('')

  const labels = spec.labels
    .map((label, index) => {
      const x = padding + index * step
      return `<text x="${x}" y="${height - 12}" text-anchor="middle" class="chart-label">${escapeHtml(label)}</text>`
    })
    .join('')

  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(spec.title)}">
    <line x1="${padding}" y1="${padding + chartHeight}" x2="${width - padding}" y2="${padding + chartHeight}" class="chart-axis"></line>
    <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
    ${dots}
    ${labels}
  </svg>`
}

function renderDonutChart(spec: ChartSpec): string {
  const size = 240
  const radius = 80
  const total = spec.values.reduce((sum, value) => sum + Math.max(value, 0), 0) || 1
  let offset = 0

  const segments = spec.values
    .map((value, index) => {
      const percentage = (Math.max(value, 0) / total) * 100
      const segment = `<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--accent)" stroke-width="24" pathLength="100" stroke-dasharray="${percentage} ${100 - percentage}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${size / 2} ${size / 2})" opacity="${0.45 + index * 0.12}"></circle>`
      offset += percentage
      return segment
    })
    .join('')

  const legend = spec.labels
    .map(
      (label, index) =>
        `<div class="chart-legend-row"><span class="chart-legend-dot" style="opacity:${0.45 + index * 0.12}"></span><span>${escapeHtml(label)}</span><strong>${spec.values[index] ?? 0}</strong></div>`
    )
    .join('')

  return `<div class="donut-layout">
    <svg class="chart-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeHtml(spec.title)}">${segments}</svg>
    <div class="chart-legend">${legend}</div>
  </div>`
}

function renderTableChart(spec: ChartSpec): string {
  const rows = spec.labels
    .map(
      (label, index) =>
        `<tr><td>${escapeHtml(label)}</td><td class="numeric-cell">${escapeHtml(String(spec.values[index] ?? ''))}</td></tr>`
    )
    .join('')

  return `<div class="table-wrap"><table>
    <thead><tr><th>项目</th><th>数值</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`
}

function renderTimelineChart(spec: ChartSpec): string {
  const items = spec.labels
    .map(
      (label, index) => `<div class="timeline-item">
        <span class="timeline-index">${String(index + 1).padStart(2, '0')}</span>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(spec.values[index] ?? ''))}</strong>
      </div>`
    )
    .join('')

  return `<div class="timeline-list">${items}</div>`
}

function renderChart(spec: ChartSpec): string {
  const body =
    spec.kind === 'line'
      ? renderLineChart(spec)
      : spec.kind === 'donut'
        ? renderDonutChart(spec)
        : spec.kind === 'table'
          ? renderTableChart(spec)
          : spec.kind === 'timeline'
            ? renderTimelineChart(spec)
            : renderBarChart(spec)

  return `<div class="chart-card">
    <div class="chart-title">${escapeHtml(spec.title)}</div>
    <div class="chart-source">来源：${escapeHtml(spec.source)}</div>
    ${body}
  </div>`
}

function renderFindings(insights: DocumentInsights): string {
  if (insights.findings.length === 0) return ''
  const items = insights.findings
    .map(
      (finding, index) => `<div class="finding-item">
        <span class="finding-index">${String(index + 1).padStart(2, '0')}</span>
        <div><strong>${escapeHtml(finding.title)}</strong><p>${escapeHtml(finding.detail)}</p></div>
      </div>`
    )
    .join('')

  return `<section class="finding-section"><div class="block-kicker">关键发现</div><div class="finding-list">${items}</div></section>`
}

function renderHighlights(insights: DocumentInsights): string {
  if (insights.highlights.length === 0) return ''
  const items = insights.highlights.map((item) => `<span class="highlight-chip">${escapeHtml(item)}</span>`).join('')
  return `<section class="highlight-section"><div class="block-kicker">内容重点</div><div class="highlight-list">${items}</div></section>`
}

function renderRiskAndActions(insights: DocumentInsights): string {
  if (insights.risks.length === 0 && insights.actions.length === 0) return ''

  const risks = insights.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const actions = insights.actions.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(item)}</li>`).join('')

  return `<section class="insight-actions">
    ${insights.risks.length ? `<div class="action-column"><div class="block-kicker">风险提示</div><ul class="risk-list">${risks}</ul></div>` : ''}
    ${insights.actions.length ? `<div class="action-column"><div class="block-kicker">行动建议</div><ol class="action-list">${actions}</ol></div>` : ''}
  </section>`
}

export function renderInsightsHtml(
  insights: DocumentInsights,
  advice: DesignAdvice,
  analysis?: DocumentAnalysis,
  template?: BeautifulTemplateRecipe
): string {
  const metricGrid = insights.metrics.length
    ? `<div class="kpi-grid">${insights.metrics.map(renderMetricCard).join('')}</div>`
    : ''
  const chartGrid = insights.charts.length
    ? `<div class="chart-grid">${insights.charts.map(renderChart).join('')}</div>`
    : ''

  const analysisChips = analysis
    ? `<div class="intel-strip">
        <span class="intel-badge">智能分析</span>
        <span>${escapeHtml(analysis.documentTypeLabel)}</span>
        <span>${escapeHtml(analysis.audienceLabel)}</span>
        <span>置信度 ${Math.round(analysis.confidence * 100)}%</span>
      </div>`
    : ''

  const coreFocus = analysis?.coreFocus || insights.summary
  const templateNote = template
    ? `<div class="template-note">模板参考：${escapeHtml(template.name)} · <a href="${escapeHtml(template.source)}" target="_blank" rel="noreferrer">${escapeHtml(template.source)}</a></div>`
    : ''

  return `<section class="insight-layer density-${advice.density}">
    ${analysisChips}
    <div class="summary-card core-summary">
      <div class="block-kicker">核心结论</div>
      <p>${escapeHtml(coreFocus)}</p>
      ${insights.summary && insights.summary !== coreFocus ? `<div class="summary-detail">${escapeHtml(insights.summary)}</div>` : ''}
      ${templateNote}
    </div>
    ${metricGrid}
    ${chartGrid}
    ${renderFindings(insights)}
    ${renderHighlights(insights)}
    ${renderRiskAndActions(insights)}
  </section>`
}
