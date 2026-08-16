import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DragEvent, JSX } from 'react'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Code2,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  FileType2,
  Info,
  Loader2,
  Monitor,
  Moon,
  RefreshCw,
  Palette,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Upload,
  X
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AiDesignConfig, ConversionOptions, ConversionResult, DocFormat, OutputTheme } from '../../shared/types'

interface SelectedFile {
  path: string
  name: string
  size: number
  format: DocFormat
}

const formatMeta: Record<DocFormat, { label: string; icon: LucideIcon }> = {
  markdown: { label: 'Markdown', icon: FileType2 },
  word: { label: 'Word', icon: FileText },
  excel: { label: 'Excel', icon: FileSpreadsheet },
  pdf: { label: 'PDF', icon: File }
}

const themeMeta: Array<{ id: OutputTheme; label: string }> = [
  { id: 'auto', label: '智能匹配' },
  { id: 'editorial', label: '编辑风格' },
  { id: 'technical', label: '技术风格' },
  { id: 'business', label: '商务风格' },
  { id: 'print', label: '打印风格' },
  { id: 'editorial-forest', label: '森林编辑风' },
  { id: 'moyu-green', label: '摸鱼绿' },
  { id: 'zen-whitespace', label: '留白禅意风' },
  { id: 'red-white', label: '红白编辑风' },
  { id: 'neo-brutal', label: '新粗野风' },
  { id: 'terminal', label: '终端极客风' },
  { id: 'bento', label: 'Bento 卡片风' }
]

function detectFormat(name: string): DocFormat | null {
  const extension = name.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'md':
    case 'markdown':
      return 'markdown'
    case 'docx':
      return 'word'
    case 'xlsx':
    case 'xlsm':
      return 'excel'
    case 'pdf':
      return 'pdf'
    default:
      return null
  }
}

function formatBytes(bytes: number): string {
  if (!bytes) return '大小未知'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function App(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [view, setView] = useState<'preview' | 'source'>('preview')
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [aiDraft, setAiDraft] = useState<AiDesignConfig>({
    enabled: false,
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    apiKey: '',
    styleHint: ''
  })
  const [options, setOptions] = useState<ConversionOptions>({
    theme: 'auto',
    includeCover: true,
    includeToc: false,
    darkMode: false
  })

  const convert = useCallback(async (override?: ConversionOptions) => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const next = await window.api.convertFile(selectedFile.path, override ?? options)
      setResult(next)
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : '转换失败。')
    } finally {
      setLoading(false)
    }
  }, [options, selectedFile])

  useEffect(() => {
    if (selectedFile) void convert()
  }, [convert, selectedFile])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 2600)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const loadPath = useCallback((path: string, size = 0) => {
    const name = path.split(/[\\/]/).pop() ?? '文档'
    const format = detectFormat(name)
    if (!format) {
      setError(`不支持的文件：${name}`)
      setSelectedFile(null)
      return
    }
    setError(null)
    setSelectedFile({ path, name, size, format })
  }, [])

  const chooseFile = async (): Promise<void> => {
    const path = await window.api.chooseFile()
    if (path) loadPath(path)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files[0]
    if (!file) return
    loadPath(window.api.getPathForFile(file), file.size)
  }

  const saveHtml = async (): Promise<void> => {
    if (!result || !selectedFile) return
    const suggestedName = selectedFile.name.replace(/\.[^.]+$/, '') + '.html'
    const saveResult = await window.api.saveHtml(result.html, suggestedName)
    if (!saveResult.canceled && saveResult.filePath) {
      setNotice(`已导出到 ${saveResult.filePath}`)
    }
  }

  const toggleAiDesign = (): void => {
    const nextEnabled = !aiDraft.enabled
    setAiDraft((current) => ({ ...current, enabled: nextEnabled }))

    if (!nextEnabled) {
      setOptions((current) => ({
        ...current,
        aiDesign: current.aiDesign ? { ...current.aiDesign, enabled: false } : undefined
      }))
      return
    }

    if (!aiDraft.apiKey.trim()) {
      setNotice('请先填写 API Key，再点击“应用并重新生成”。')
      return
    }

    setOptions((current) => ({
      ...current,
      aiDesign: { ...aiDraft, enabled: true }
    }))
  }

  const applyAiDesign = (): void => {
    if (!aiDraft.apiKey.trim()) {
      setNotice('请先填写 API Key。')
      return
    }
    const nextOptions = { ...options, aiDesign: aiDraft }
    setOptions(nextOptions)
    void convert(nextOptions)
  }

  const deviceWidth = useMemo(() => {
    if (device === 'mobile') return 390
    if (device === 'tablet') return 768
    return undefined
  }, [device])

  const fileIcon = selectedFile ? formatMeta[selectedFile.format].icon : Upload
  const FileIcon = fileIcon

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="brand-name">HTML 快速生成器</div>
            <div className="brand-subtitle">文档转精美网页</div>
          </div>
        </div>

        <section className="panel">
          <div
            className={`drop-zone ${dragActive ? 'is-dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onClick={() => void chooseFile()}
            onDragEnter={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => handleDrop(event)}
          >
            {selectedFile ? (
              <>
                <div className="file-icon">
                  <FileIcon size={22} />
                </div>
                <div className="file-name">{selectedFile.name}</div>
                <div className="file-meta">
                  {formatMeta[selectedFile.format].label} · {formatBytes(selectedFile.size)}
                </div>
                <button
                  className="icon-button clear-file"
                  aria-label="清除文件"
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelectedFile(null)
                    setResult(null)
                    setError(null)
                  }}
                >
                  <X size={15} />
                </button>
              </>
            ) : (
              <>
                <FileIcon size={28} strokeWidth={1.6} />
                <div className="drop-title">将文档拖到这里</div>
                <div className="drop-subtitle">MD · DOCX · XLSX · PDF</div>
                <span className="choose-button">选择文件</span>
              </>
            )}
          </div>
        </section>

        <section className="panel options-panel">
          <div className="panel-heading">
            <Palette size={15} />
            <span>输出样式</span>
          </div>

          <div className="field">
            <label>主题</label>
            <div className="theme-grid">
              {themeMeta.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-option ${options.theme === theme.id ? 'is-active' : ''}`}
                  onClick={() => setOptions((current) => ({ ...current, theme: theme.id }))}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <div className="switch-row">
            <button
              className={`switch ${options.darkMode ? 'is-on' : ''}`}
              aria-label="切换深色模式"
              onClick={() => setOptions((current) => ({ ...current, darkMode: !current.darkMode }))}
            >
              <span />
            </button>
            <div>
              <div className="switch-label">深色模式</div>
              <div className="switch-desc">预览和导出使用深色主题</div>
            </div>
            {options.darkMode ? <Moon size={16} /> : <Sun size={16} />}
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={options.includeCover}
              onChange={(event) => setOptions((current) => ({ ...current, includeCover: event.target.checked }))}
            />
            <span>自动封面</span>
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={options.includeToc}
              onChange={(event) => setOptions((current) => ({ ...current, includeToc: event.target.checked }))}
            />
            <span>生成目录</span>
          </label>
        </section>

        <section className="panel ai-panel">
          <div className="panel-heading">
            <Bot size={15} />
            <span>AI 设计布局</span>
          </div>

          <div className="switch-row">
            <button
              className={`switch ${aiDraft.enabled ? 'is-on' : ''}`}
              aria-label="切换 AI 设计"
              onClick={toggleAiDesign}
            >
              <span />
            </button>
            <div>
              <div className="switch-label">AI 设计</div>
              <div className="switch-desc">{aiDraft.enabled ? '根据内容生成差异布局' : '使用本地模板和规则'}</div>
            </div>
            <Bot size={16} />
          </div>

          {aiDraft.enabled && (
            <div className="ai-settings">
              <div className="field">
                <label>接口地址</label>
                <input
                  className="text-input"
                  value={aiDraft.baseUrl}
                  onChange={(event) => setAiDraft((current) => ({ ...current, baseUrl: event.target.value }))}
                  placeholder="https://api.deepseek.com"
                />
              </div>

              <div className="field">
                <label>模型</label>
                <input
                  className="text-input"
                  value={aiDraft.model}
                  onChange={(event) => setAiDraft((current) => ({ ...current, model: event.target.value }))}
                  placeholder="deepseek-chat"
                />
              </div>

              <div className="field">
                <label>API Key</label>
                <input
                  className="text-input"
                  type="password"
                  value={aiDraft.apiKey}
                  onChange={(event) => setAiDraft((current) => ({ ...current, apiKey: event.target.value }))}
                  placeholder="sk-..."
                />
              </div>

              <div className="field">
                <label>风格提示</label>
                <input
                  className="text-input"
                  value={aiDraft.styleHint}
                  onChange={(event) => setAiDraft((current) => ({ ...current, styleHint: event.target.value }))}
                  placeholder="例如：权威咨询报告、留白杂志风"
                />
              </div>

              <button className="apply-button" onClick={applyAiDesign}>
                <RefreshCw size={13} />
                应用并重新生成
              </button>
            </div>
          )}
        </section>

        <div className="sidebar-footer">{aiDraft.enabled ? 'AI 设计开启 · 内容将发送至兼容接口' : '本地智能分析 · 不上传文件'}</div>
      </aside>

      <main className="workspace">
        <header className="toolbar">
          <div className="toolbar-title">
            <span className={`status-dot ${loading ? 'is-loading' : result ? 'is-ready' : ''}`} />
            {selectedFile ? selectedFile.name : '未选择文档'}
          </div>

          <div className="toolbar-actions">
            <div className="view-switch">
              <button className={view === 'preview' ? 'is-active' : ''} onClick={() => setView('preview')}>
                <Eye size={15} />
                预览
              </button>
              <button className={view === 'source' ? 'is-active' : ''} onClick={() => setView('source')}>
                <Code2 size={15} />
                源码
              </button>
            </div>

            <div className="device-switch">
              <button className={device === 'desktop' ? 'is-active' : ''} onClick={() => setDevice('desktop')} aria-label="桌面端">
                <Monitor size={15} />
              </button>
              <button className={device === 'tablet' ? 'is-active' : ''} onClick={() => setDevice('tablet')} aria-label="平板">
                <Tablet size={15} />
              </button>
              <button className={device === 'mobile' ? 'is-active' : ''} onClick={() => setDevice('mobile')} aria-label="移动端">
                <Smartphone size={15} />
              </button>
            </div>

            <button className="primary-button" disabled={!result || loading} onClick={() => void saveHtml()}>
              <Download size={15} />
              导出 HTML
            </button>
          </div>
        </header>

        {error && (
          <div className="status-banner error">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {notice && (
          <div className="status-banner success">
            <CheckCircle2 size={16} />
            {notice}
          </div>
        )}

        {result && (
          <div className="status-banner info">
            <Info size={16} />
            <span>
              {formatMeta[result.format].label}
              {result.pageCount ? ` · ${result.pageCount} 页` : ''}
              {result.sheetCount ? ` · ${result.sheetCount} 个工作表` : ''}
              {result.analysis ? ` · ${result.analysis.documentType} · ${result.analysis.templateName}` : ''}
            </span>
            {result.aiGenerated && (
              <span className="ai-badge">
                <Sparkles size={12} />
                AI 布局 · {result.aiDesign?.themeName}
              </span>
            )}
            {result.warnings.length > 0 && <span className="warning-count">{result.warnings.length} 条提示</span>}
          </div>
        )}

        <section className="preview-stage">
          {loading ? (
            <div className="empty-state">
              <Loader2 className="spin" size={28} />
              <div>正在转换文档...</div>
              <p>{aiDraft.enabled ? '正在调用 AI 分析内容并生成差异化布局。' : '正在解析内容并生成 HTML 主题。'}</p>
            </div>
          ) : !result ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Upload size={30} strokeWidth={1.6} />
              </div>
              <div>选择或拖入一个文档</div>
              <p>转换后的 HTML 会显示在这里，可预览并导出。</p>
            </div>
          ) : view === 'preview' ? (
            <iframe
              key={`${selectedFile?.path}-${result.title}-${options.theme}-${options.darkMode}-${aiDraft.enabled ? result.aiDesign?.templateName ?? 'ai' : 'local'}`}
              className="preview-frame"
              style={{ width: deviceWidth ? `${deviceWidth}px` : '100%' }}
              srcDoc={result.html}
              title="HTML 预览"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <textarea
              className="source-view"
              value={result.html}
              onChange={(event) => setResult((current) => current ? { ...current, html: event.target.value } : current)}
              spellCheck={false}
              aria-label="HTML 源码编辑器"
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
