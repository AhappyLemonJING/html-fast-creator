import type { ConversionOptions, OutputTheme } from '../shared/types'
import { themeTokens } from './design/themeRecipes'
import type { BeautifulTemplateRecipe, DocumentAnalysis } from './design/types'
import { escapeHtml } from './utils'

function baseCss(): string {
  return `
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.72;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    .reading-progress {
      position: fixed;
      inset: 0 auto auto 0;
      height: 3px;
      width: 100%;
      transform-origin: left;
      background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 45%, white));
      z-index: 20;
    }
    .app-shell { max-width: 1180px; margin: 0 auto; padding: 72px 48px 96px; }
    .doc-cover {
      position: relative;
      margin: 8px 0 56px;
      padding: 56px 0 44px;
      border-bottom: 1px solid var(--border);
    }
    .doc-cover .eyebrow {
      color: var(--accent);
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin: 0 0 24px;
    }
    .doc-cover h1 {
      margin: 0;
      font-family: var(--font-heading);
      font-weight: 650;
      letter-spacing: -0.03em;
      line-height: 1.12;
      font-size: clamp(38px, 7vw, 76px);
      max-width: 960px;
    }
    .doc-cover .meta {
      margin-top: 26px;
      color: var(--muted);
      font-size: 14px;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 40px;
      align-items: start;
    }
    .layout.with-toc { grid-template-columns: 220px minmax(0, 1fr); }
    .toc {
      position: sticky;
      top: 32px;
      max-height: calc(100vh - 64px);
      overflow: auto;
      padding-right: 12px;
      color: var(--muted);
      font-size: 13px;
    }
    .toc a {
      display: block;
      padding: 7px 10px;
      border-left: 2px solid var(--border);
      color: inherit;
      text-decoration: none;
      transition: color .2s ease, border-color .2s ease;
    }
    .toc a:hover, .toc a.is-active { color: var(--accent); border-color: var(--accent); }
    .content { min-width: 0; }
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      line-height: 1.25;
      letter-spacing: -0.018em;
      scroll-margin-top: 28px;
    }
    h2 { margin: 2.4em 0 0.8em; font-size: 30px; }
    h3 { margin: 2em 0 0.65em; font-size: 22px; }
    p { margin: 1em 0; }
    a { color: var(--accent); text-underline-offset: 3px; }
    img { max-width: 100%; height: auto; border-radius: var(--radius); box-shadow: var(--shadow); }
    blockquote {
      margin: 2em 0;
      padding: 18px 24px;
      border-left: 3px solid var(--accent);
      background: var(--accent-soft);
      border-radius: 0 var(--radius) var(--radius) 0;
      color: color-mix(in srgb, var(--text) 80%, var(--accent));
    }
    pre {
      position: relative;
      margin: 2em 0;
      padding: 22px;
      overflow: auto;
      border-radius: var(--radius);
      background: var(--code-bg);
      color: var(--code-text);
      font-size: 14px;
      line-height: 1.65;
      box-shadow: var(--shadow);
    }
    pre code { font-family: "SFMono-Regular", "Cascadia Code", "JetBrains Mono", Consolas, monospace; }
    .code-copy {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 5px 9px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 6px;
      background: rgba(255,255,255,.08);
      color: var(--code-text);
      font-size: 12px;
      cursor: pointer;
      opacity: 0;
      transition: opacity .18s ease, background .18s ease;
    }
    pre:hover .code-copy { opacity: 1; }
    .code-copy:hover { background: rgba(255,255,255,.16); }
    .table-wrap {
      margin: 2em 0;
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: var(--shadow);
    }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 12px 14px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
    th {
      position: sticky;
      top: 0;
      background: var(--surface-2);
      font-weight: 650;
      white-space: nowrap;
    }
    tr:last-child td { border-bottom: 0; }
    tbody tr:hover td { background: var(--surface-2); }
    .page {
      margin: 0 0 36px;
      padding: 40px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .page-marker {
      margin: 0 0 24px;
      color: var(--muted);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .sheet-tabs {
      display: flex;
      gap: 8px;
      margin: 24px 0 0;
      padding-bottom: 8px;
      overflow-x: auto;
    }
    .sheet-tab {
      padding: 9px 14px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface);
      color: var(--muted);
      cursor: pointer;
      white-space: nowrap;
    }
    .sheet-tab.is-active { color: #fff; background: var(--accent); border-color: var(--accent); }
    .sheet-panel { display: none; }
    .sheet-panel.is-active { display: block; }
    .doc-footer {
      margin-top: 72px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 12px;
    }
    .hljs-comment, .hljs-quote { color: #8a97a8; font-style: italic; }
    .hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #f59e8b; }
    .hljs-string, .hljs-attr, .hljs-template-tag { color: #a7d5a1; }
    .hljs-number, .hljs-symbol { color: #f7c873; }
    .hljs-title, .hljs-function, .hljs-section { color: #8fb8f5; }
    .hljs-type, .hljs-built_in { color: #b6a5f2; }
    @media (max-width: 780px) {
      .app-shell { padding: 36px 20px 64px; }
      .layout.with-toc { grid-template-columns: 1fr; }
      .toc { position: static; max-height: none; margin-bottom: 20px; }
      .doc-cover { margin-top: 0; padding-top: 36px; }
      .page { padding: 24px 18px; }
    }
  `
}

function darkCss(): string {
  return `
    :root {
      --bg: #0f131a;
      --surface: #171d26;
      --surface-2: #202936;
      --text: #e7edf5;
      --muted: #94a1b2;
      --border: #2c3644;
      --shadow: 0 16px 46px rgba(0, 0, 0, 0.28);
    }
  `
}

function refinedCss(): string {
  return `
    :root {
      --font-ui: "Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
      --font-serif: "Source Han Serif SC", "Songti SC", "Noto Serif CJK SC", Georgia, serif;
      --font-mono: "SFMono-Regular", "Cascadia Code", "JetBrains Mono", Consolas, monospace;
      --content-max: 880px;
      --hairline: color-mix(in srgb, var(--border) 62%, transparent);
      --shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.05);
    }

    body[data-theme="editorial"] {
      --font-heading: var(--font-serif);
      --content-max: 860px;
    }

    body[data-theme="technical"] {
      --font-heading: var(--font-ui);
      --content-max: 1040px;
    }

    body[data-theme="business"] {
      --font-heading: var(--font-ui);
      --content-max: 1080px;
    }

    body[data-theme="print"] {
      --font-heading: var(--font-serif);
      --content-max: 820px;
    }

    body[data-theme="editorial-forest"] {
      --font-heading: var(--font-serif);
      --content-max: 880px;
    }

    body[data-theme="moyu-green"] {
      --font-heading: var(--font-ui);
      --content-max: 1060px;
    }

    body[data-theme="zen-whitespace"] {
      --font-heading: var(--font-serif);
      --content-max: 820px;
    }

    body[data-theme="red-white"] {
      --font-heading: var(--font-serif);
      --content-max: 860px;
    }

    body[data-theme="neo-brutal"] {
      --font-heading: var(--font-ui);
      --content-max: 1080px;
    }

    body[data-theme="terminal"] {
      --font-heading: var(--font-mono);
      --content-max: 1040px;
    }

    body[data-theme="bento"] {
      --font-heading: var(--font-ui);
      --content-max: 1200px;
    }

    body {
      font-family: var(--font-ui);
      letter-spacing: 0;
    }

    .app-shell {
      max-width: 1240px;
      padding: 64px 44px 88px;
    }

    .doc-cover {
      margin: 0 0 58px;
      padding: 66px 0 42px;
      border-bottom: 1px solid var(--border);
    }

    .doc-cover::after {
      display: block;
      width: 58px;
      height: 3px;
      margin-top: 32px;
      background: var(--accent);
      content: "";
    }

    .doc-cover .eyebrow {
      margin-bottom: 22px;
      color: var(--accent);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .doc-cover h1 {
      max-width: 12em;
      margin: 0;
      font-family: var(--font-heading);
      font-size: clamp(44px, 7vw, 84px);
      font-weight: 650;
      letter-spacing: -0.045em;
      line-height: 0.98;
      text-wrap: balance;
    }

    .doc-cover .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 22px;
      margin-top: 28px;
      color: var(--muted);
      font-size: 12px;
    }

    .layout {
      gap: 48px;
    }

    .layout.with-toc {
      grid-template-columns: 230px minmax(0, 1fr);
      gap: 54px;
    }

    .toc {
      top: 38px;
      padding-right: 0;
      font-size: 12px;
    }

    .toc a {
      padding: 8px 12px;
      border-left: 1px solid var(--hairline);
      line-height: 1.45;
      text-decoration: none;
    }

    .toc a:hover,
    .toc a.is-active {
      background: var(--accent-soft);
      border-left-color: var(--accent);
    }

    .content {
      max-width: var(--content-max);
      margin: 0 auto;
      counter-reset: section;
    }

    .content.excel-document {
      max-width: 1280px;
    }

    .content > h2 {
      counter-increment: section;
      margin: 2.9em 0 0.7em;
      font-size: clamp(30px, 4vw, 42px);
      font-weight: 680;
      letter-spacing: -0.03em;
      line-height: 1.12;
    }

    .content > h2::before {
      display: block;
      margin-bottom: 10px;
      color: var(--accent);
      content: counter(section, decimal-leading-zero);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 650;
      letter-spacing: 0.08em;
    }

    .content > h3 {
      margin: 2.2em 0 0.6em;
      font-size: 24px;
      letter-spacing: -0.018em;
    }

    .content > p {
      max-width: 70ch;
      margin: 1.15em 0;
      color: color-mix(in srgb, var(--text) 88%, var(--muted));
      font-size: 17px;
    }

    .content > p:first-of-type {
      color: var(--text);
      font-size: 19px;
      line-height: 1.78;
    }

    blockquote {
      margin: 2.4em 0;
      padding: 28px 30px;
      border-left: 4px solid var(--accent);
      border-radius: 0 12px 12px 0;
      background: var(--accent-soft);
      font-size: 18px;
    }

    blockquote p {
      margin: 0;
    }

    pre {
      margin: 2.2em 0;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.17);
    }

    pre::before {
      display: block;
      margin: -20px -20px 16px;
      padding: 10px 16px;
      color: #8ea0b8;
      background: rgba(255, 255, 255, 0.06);
      content: attr(data-language);
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 650;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    pre code {
      font-size: 13px;
    }

    .code-copy {
      top: 14px;
      right: 14px;
    }

    .table-wrap {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-xs);
    }

    table {
      font-size: 13px;
    }

    th,
    td {
      padding: 14px 16px;
    }

    th {
      letter-spacing: 0.01em;
    }

    tbody tr {
      transition: background 0.15s ease;
    }

    .page {
      padding: 48px;
      border: 0;
      border-radius: 14px;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.1);
    }

    .page-marker {
      display: inline-flex;
      margin-bottom: 26px;
      padding: 6px 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-2);
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: none;
    }

    .sheet-tabs {
      gap: 6px;
      margin: 30px 0 18px;
    }

    .sheet-tab {
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 650;
    }

    .doc-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-top: 76px;
      padding-top: 22px;
    }

    .insight-layer {
      margin: 0 0 48px;
    }

    .summary-card,
    .kpi-card,
    .chart-card {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: var(--shadow-xs);
    }

    .summary-card {
      padding: 24px 28px;
    }

    .summary-card p {
      margin: 0;
      font-size: 18px;
      line-height: 1.8;
    }

    .block-kicker {
      margin-bottom: 14px;
      color: var(--accent);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 650;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 18px;
    }

    .kpi-card {
      padding: 18px;
    }

    .kpi-label {
      color: var(--muted);
      font-size: 12px;
    }

    .kpi-value {
      margin-top: 10px;
      color: var(--text);
      font-family: var(--font-mono);
      font-size: 30px;
      font-weight: 680;
      letter-spacing: -0.03em;
    }

    .kpi-value span {
      margin-left: 4px;
      color: var(--muted);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
    }

    .kpi-trend {
      display: inline-flex;
      margin-top: 10px;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 650;
    }

    .kpi-trend.is-up {
      color: #047857;
      background: #d1fae5;
    }

    .kpi-trend.is-down {
      color: #b91c1c;
      background: #fee2e2;
    }

    .kpi-trend.is-flat {
      color: var(--muted);
      background: var(--surface-2);
    }

    .chart-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .chart-card {
      padding: 22px;
    }

    .chart-title {
      color: var(--text);
      font-weight: 650;
    }

    .chart-source {
      margin: 4px 0 16px;
      color: var(--muted);
      font-size: 12px;
    }

    .chart-svg {
      display: block;
      width: 100%;
      height: auto;
      color: var(--text);
      font-size: 11px;
    }

    .chart-label {
      fill: var(--muted);
      font-family: var(--font-mono);
      font-size: 10px;
    }

    .chart-axis {
      stroke: var(--border);
      stroke-width: 1;
    }

    .donut-layout {
      display: grid;
      grid-template-columns: 240px minmax(0, 1fr);
      gap: 24px;
      align-items: center;
    }

    .chart-legend {
      display: grid;
      gap: 8px;
    }

    .chart-legend-row {
      display: grid;
      grid-template-columns: 10px minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
      color: var(--muted);
      font-size: 13px;
    }

    .chart-legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
    }

    .numeric-cell {
      font-family: var(--font-mono);
      text-align: right;
    }

    .timeline-list {
      display: grid;
      gap: 10px;
    }

    .timeline-list .timeline-item {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--hairline);
    }

    .timeline-index,
    .finding-index {
      color: var(--accent);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
    }

    .finding-section,
    .highlight-section,
    .insight-actions {
      margin-top: 26px;
    }

    .finding-list {
      display: grid;
      gap: 12px;
    }

    .finding-item {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 12px;
      padding: 18px 0;
      border-bottom: 1px solid var(--hairline);
    }

    .finding-item p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 14px;
    }

    .highlight-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .highlight-chip {
      padding: 7px 11px;
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--muted);
      background: var(--surface);
      font-size: 12px;
    }

    .insight-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }

    .risk-list,
    .action-list {
      margin: 0;
      padding-left: 18px;
      color: var(--muted);
      line-height: 1.8;
    }

    .action-list {
      padding-left: 0;
      list-style: none;
    }

    .action-list li {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .action-list li span {
      color: var(--accent);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
    }

    a {
      text-decoration-thickness: 1px;
    }

    ::selection {
      background: color-mix(in srgb, var(--accent) 20%, transparent);
    }

    @media print {
      .reading-progress,
      .code-copy,
      .toc {
        display: none;
      }

      .app-shell {
        max-width: none;
        padding: 0;
      }

      .doc-cover,
      .page,
      .table-wrap {
        box-shadow: none;
      }

      .page {
        break-inside: avoid;
      }
    }

    @media (max-width: 780px) {
      .app-shell {
        padding: 36px 20px 60px;
      }

      .doc-cover {
        padding-top: 38px;
      }

      .layout.with-toc {
        grid-template-columns: 1fr;
      }

      .content > p,
      .content > p:first-of-type {
        font-size: 16px;
      }

      .page {
        padding: 28px 20px;
      }

      .doc-footer {
        align-items: flex-start;
        flex-direction: column;
      }

      .donut-layout {
        grid-template-columns: 1fr;
      }

      .kpi-grid,
      .chart-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (min-width: 760px) and (max-width: 1099px) {
      .kpi-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .chart-grid,
      .finding-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1100px) {
      .kpi-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .chart-grid,
      .finding-list,
      .insight-actions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `
}

function templateCss(template: BeautifulTemplateRecipe, analysis: DocumentAnalysis): string {
  const contentMaxByLayout: Record<BeautifulTemplateRecipe['layoutClass'], string> = {
    'layout-editorial': '900px',
    'layout-report': '1180px',
    'layout-dashboard': '1240px',
    'layout-print': '880px'
  }

  return `
    body[data-template="${template.id}"] {
      --content-max: ${contentMaxByLayout[template.layoutClass] ?? '960px'};
      --font-heading: ${template.typography.headingFont};
      --font-mono: ${template.typography.monoFont};
    }

    body[data-document-type="data-report"] .content,
    body[data-document-type="report"] .content {
      max-width: 1240px;
    }

    .intel-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin: 0 0 14px;
      color: var(--muted);
      font-size: 12px;
    }

    .intel-strip span {
      padding: 5px 9px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface);
    }

    .intel-strip .intel-badge {
      color: var(--accent);
      border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
      background: var(--accent-soft);
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .core-summary {
      background: color-mix(in srgb, var(--surface) 92%, var(--accent));
      border-color: color-mix(in srgb, var(--accent) 32%, var(--border));
    }

    .core-summary p {
      font-family: var(--font-heading);
      font-size: clamp(21px, 3vw, 28px);
      font-weight: 650;
      letter-spacing: -0.025em;
      line-height: 1.38;
    }

    .summary-detail {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--hairline);
      color: var(--muted);
      font-size: 15px;
      line-height: 1.75;
    }

    .template-note {
      margin-top: 14px;
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 11px;
      line-height: 1.6;
    }

    .template-note a {
      color: inherit;
    }

    body[data-template="long-table"] .summary-card,
    body[data-template="long-table"] .kpi-card,
    body[data-template="long-table"] .chart-card {
      border-radius: 999px;
    }

    body[data-template="capsule"] .kpi-card {
      border-radius: 18px;
    }
  `
}

function runtimeScript(options: ConversionOptions): string {
  return `
    (() => {
      const progress = document.querySelector('.reading-progress');
      if (progress) {
        const update = () => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
        };
        addEventListener('scroll', update, { passive: true });
        update();
      }

      document.querySelectorAll('pre').forEach((block) => {
        const code = block.querySelector('code');
        const language = [...(code?.classList || [])]
          .find((className) => className.startsWith('language-'))
          ?.replace('language-', '');
        block.dataset.language = language || '代码';
        const button = document.createElement('button');
        button.className = 'code-copy';
        button.textContent = '复制';
        button.addEventListener('click', async () => {
          const code = block.querySelector('code')?.innerText || block.innerText;
          await navigator.clipboard.writeText(code);
          button.textContent = '已复制';
          setTimeout(() => { button.textContent = '复制'; }, 1400);
        });
        block.appendChild(button);
      });

      document.querySelectorAll('.sheet-tabs').forEach((tabs) => {
        tabs.addEventListener('click', (event) => {
          const tab = event.target.closest('.sheet-tab');
          if (!tab) return;
          const id = tab.dataset.target;
          tabs.querySelectorAll('.sheet-tab').forEach((item) => item.classList.toggle('is-active', item === tab));
          document.querySelectorAll('.sheet-panel').forEach((panel) => panel.classList.toggle('is-active', panel.id === id));
        });
      });

      const toc = document.getElementById('toc');
      const content = document.querySelector('.content');
      if (toc && content) {
        const headings = content.querySelectorAll('h1, h2, h3');
        const items = [...headings].map((heading, index) => {
          const id = heading.id || 'heading-' + index;
          heading.id = id;
          const link = document.createElement('a');
          link.href = '#' + id;
          link.textContent = heading.textContent;
          link.dataset.target = id;
          return link;
        });
        items.forEach((link) => toc.appendChild(link));
        const links = [...toc.querySelectorAll('a')];
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              links.forEach((link) => link.classList.toggle('is-active', link.dataset.target === entry.target.id));
            }
          });
        }, { rootMargin: '0px 0px -72% 0px' });
        headings.forEach((heading) => observer.observe(heading));
      }
    })();
  `
}

export interface BuildDocumentInput {
  title: string
  body: string
  options: ConversionOptions
  format: string
  extraBodyClass?: string
  tokens?: string
  template?: BeautifulTemplateRecipe
  analysis?: DocumentAnalysis
  resolvedTheme?: OutputTheme
  aiDesign?: {
    css: string
    layoutClass: string
    coverHtml: string
    themeName: string
    templateName: string
    documentType: string
    audience: string
    notes: string
  }
}

export function buildStandaloneHtml(input: BuildDocumentInput): string {
  const {
    title,
    body,
    options,
    format,
    extraBodyClass = '',
    tokens: inputTokens,
    template,
    analysis,
    resolvedTheme,
    aiDesign
  } = input
  const activeTheme = resolvedTheme ?? (options.theme === 'auto' ? 'editorial' : options.theme)
  const tokens = inputTokens ?? themeTokens[activeTheme]
  const rootTokens = aiDesign ? themeTokens[activeTheme] : tokens
  const defaultCoverInner = `<p class="eyebrow">${escapeHtml(format)} 文档</p>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">
      ${analysis ? `<span>${escapeHtml(analysis.documentTypeLabel)}</span><span>${escapeHtml(analysis.audienceLabel)}</span>` : ''}
      ${template ? `<span>模板参考 · ${escapeHtml(template.name)}</span>` : ''}
    </div>`
  const cover = options.includeCover
    ? `<header class="doc-cover">${aiDesign?.coverHtml || defaultCoverInner}</header>`
    : ''
  const toc = options.includeToc ? '<nav class="toc" id="toc"></nav>' : ''
  const layoutClass = options.includeToc ? 'layout with-toc' : 'layout'

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { ${rootTokens} }
    ${options.darkMode && !aiDesign ? darkCss() : ''}
    ${baseCss()}
    ${refinedCss()}
    ${template && analysis ? templateCss(template, analysis) : ''}
    ${aiDesign ? `body[data-ai-designed="true"] { ${tokens} }` : ''}
    ${aiDesign?.css || ''}
  </style>
</head>
<body data-theme="${activeTheme}" data-template="${template?.id ?? ''}" data-document-type="${escapeHtml(aiDesign?.documentType || analysis?.documentType || '')}" data-format="${format.toLowerCase()}" data-ai-layout="${escapeHtml(aiDesign?.layoutClass || '')}" data-ai-designed="${aiDesign ? 'true' : 'false'}">
  <div class="reading-progress"></div>
  <main class="app-shell">
    ${cover}
    <div class="${layoutClass}">
      ${toc}
      <article class="content ${extraBodyClass}">
        ${body}
      </article>
    </div>
    <footer class="doc-footer">HTML 快速生成器 · ${escapeHtml(format)}${aiDesign ? ` · ${escapeHtml(aiDesign.themeName)}` : ''} · ${new Date().toLocaleDateString()}</footer>
  </main>
  <script>${runtimeScript(options)}</script>
</body>
</html>`
}
