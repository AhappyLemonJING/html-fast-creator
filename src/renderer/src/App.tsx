import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent, JSX } from 'react'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
  RefreshCw,
  Search,
  Smartphone,
  Sparkles,
  Tablet,
  Upload,
  X
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AiDesignConfig, ConversionOptions, ConversionResult, DocFormat } from '../../shared/types'

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

const initialAiDesign: AiDesignConfig = {
  enabled: true,
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  apiKey: '',
  styleHint: ''
}

const stylePresets: Array<{ label: string; prompt: string }> = [
  { label: '程序员代码风格', prompt: '程序员代码风格：深色终端配色、等宽字体、清晰代码块和简洁技术排版。' },
  { label: '森系少女风格', prompt: '森系少女风格：奶油白底色、鼠尾草绿和柔粉点缀，圆角自然感排版。' },
  { label: '极简杂志风', prompt: '极简杂志风：大量留白、衬线标题、克制的黑白灰配色。' },
  { label: '商务咨询报告', prompt: '商务咨询报告：权威克制、数据图表清晰、强调结论和行动建议。' },
  { label: '深色科技大屏', prompt: '深色科技大屏：深蓝黑底、霓虹点缀、高信息密度仪表盘布局。' },
  { label: '学术论文白皮书', prompt: '学术论文白皮书：纸面质感、严谨排版、脚注和引用清晰。' }
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
  const [sourceQuery, setSourceQuery] = useState('')
  const [sourceActiveIndex, setSourceActiveIndex] = useState(0)
  const [aiDraft, setAiDraft] = useState<AiDesignConfig>(initialAiDesign)
  const sourceEditorRef = useRef<HTMLTextAreaElement | null>(null)
  const sourceSearchRef = useRef<HTMLInputElement | null>(null)
  const [options, setOptions] = useState<ConversionOptions>({
    theme: 'auto',
    includeCover: true,
    includeToc: false,
    darkMode: false,
    aiDesign: initialAiDesign
  })

  useEffect(() => {
    let active = true

    window.api
      .getAiSettings()
      .then((saved) => {
        if (!active || !saved) return
        setAiDraft(saved)
        setOptions((current) => ({ ...current, aiDesign: saved }))
      })
      .catch(() => {
        if (active) setNotice('读取 AI 本地配置失败。')
      })

    return () => {
      active = false
    }
  }, [])

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
    setResult(null)
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

  const applyAiSettings = useCallback((nextDraft: AiDesignConfig, message = 'AI 设计设置已应用。'): boolean => {
    if (!nextDraft.apiKey.trim()) {
      setNotice('请先填写 API Key。')
      return false
    }
    setOptions((current) => ({ ...current, aiDesign: nextDraft }))
    setNotice(message)
    void window.api.saveAiSettings(nextDraft).catch(() => {
      setNotice('AI 设置已应用，但本地缓存保存失败。')
    })
    return true
  }, [])

  const applyAiDesign = (): void => {
    applyAiSettings(aiDraft)
  }

  const selectStylePreset = (preset: (typeof stylePresets)[number]): void => {
    const nextDraft = { ...aiDraft, styleHint: preset.prompt }
    setAiDraft(nextDraft)
    applyAiSettings(nextDraft, `已自动应用「${preset.label}」风格。`)
  }

  const deviceWidth = useMemo(() => {
    if (device === 'mobile') return 390
    if (device === 'tablet') return 768
    return undefined
  }, [device])

  const sourceMatches = useMemo(() => {
    if (view !== 'source' || !result || !sourceQuery) return []
    const needle = sourceQuery.toLocaleLowerCase()
    const haystack = result.html.toLocaleLowerCase()
    const matches: number[] = []
    let cursor = 0

    while (cursor < haystack.length) {
      const foundIndex = haystack.indexOf(needle, cursor)
      if (foundIndex === -1) break
      matches.push(foundIndex)
      cursor = foundIndex + Math.max(needle.length, 1)
    }

    return matches
  }, [result, sourceQuery, view])

  const sourceMatchIndex = sourceMatches.length > 0
    ? Math.min(sourceActiveIndex, sourceMatches.length - 1)
    : -1

  const sourceLocation = useMemo(() => {
    if (sourceMatchIndex < 0 || !result) return null
    const beforeMatch = result.html.slice(0, sourceMatches[sourceMatchIndex])
    const lines = beforeMatch.split('\n')
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    }
  }, [result, sourceMatchIndex, sourceMatches])

  const goToSourceMatch = useCallback((nextIndex: number) => {
    const textarea = sourceEditorRef.current
    if (!textarea || sourceMatches.length === 0) return

    const wrappedIndex = (nextIndex + sourceMatches.length) % sourceMatches.length
    const start = sourceMatches[wrappedIndex]
    setSourceActiveIndex(wrappedIndex)

    window.requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + sourceQuery.length)
    })
  }, [sourceMatches, sourceQuery.length])

  useEffect(() => {
    setSourceActiveIndex(0)
  }, [sourceQuery])

  useEffect(() => {
    if (view !== 'source') return
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        sourceSearchRef.current?.focus()
        sourceSearchRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view])

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

        <section className="panel ai-panel">
          <div className="panel-heading">
            <Bot size={15} />
            <span>AI 设计布局</span>
          </div>

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
              <div className="style-presets">
                {stylePresets.map((preset) => (
                  <button
                    key={preset.label}
                    className="style-preset"
                    type="button"
                    onClick={() => selectStylePreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="apply-button" onClick={applyAiDesign}>
              <RefreshCw size={13} />
              应用 AI 设置
            </button>
          </div>
        </section>

        <div className="sidebar-footer">AI 设计 · 内容将发送至兼容接口</div>
      </aside>

      <main className="workspace">
        <header className="toolbar">
          <div className="toolbar-title">
            <span className={`status-dot ${loading ? 'is-loading' : result ? 'is-ready' : ''}`} />
            {selectedFile ? selectedFile.name : '未选择文档'}
          </div>

          <div className="toolbar-actions">
            <button className="primary-button" disabled={!selectedFile || loading} onClick={() => void convert()}>
              {loading ? <Loader2 className="spin" size={15} /> : <Sparkles size={15} />}
              {loading ? '生成中...' : '生成 HTML'}
            </button>

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

            <button className="secondary-button" disabled={!result || loading} onClick={() => void saveHtml()}>
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
              {result.analysis ? ` · ${result.analysis.documentType} · ${result.analysis.audience}` : ''}
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
              <p>正在调用 AI 分析内容并生成差异化布局。</p>
            </div>
          ) : !result ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Sparkles size={30} strokeWidth={1.6} />
              </div>
              <div>{selectedFile ? '文档已就绪' : '选择或拖入一个文档'}</div>
              <p>{selectedFile ? '当前文档尚未生成 HTML。' : '转换后的 HTML 会显示在这里，可预览并导出。'}</p>
            </div>
          ) : view === 'preview' ? (
            <iframe
              key={`${selectedFile?.path}-${result.title}-${result.aiDesign?.templateName ?? 'ai'}`}
              className="preview-frame"
              style={{ width: deviceWidth ? `${deviceWidth}px` : '100%' }}
              srcDoc={result.html}
              title="HTML 预览"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="source-panel">
              <div className="source-searchbar">
                <Search size={15} />
                <input
                  ref={sourceSearchRef}
                  className="source-search-input"
                  value={sourceQuery}
                  onChange={(event) => setSourceQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      goToSourceMatch(sourceMatchIndex + 1)
                    }
                    if (event.key === 'Escape') {
                      setSourceQuery('')
                      sourceEditorRef.current?.focus()
                    }
                  }}
                  placeholder="搜索源码内容"
                  spellCheck={false}
                />
                <span className={`source-search-count ${sourceQuery && sourceMatches.length === 0 ? 'is-empty' : ''}`}>
                  {sourceQuery
                    ? sourceMatches.length > 0
                      ? `${sourceMatchIndex + 1} / ${sourceMatches.length}`
                      : '无结果'
                    : `${result.html.length.toLocaleString()} 字符`}
                </span>
                {sourceLocation && (
                  <span className="source-location">
                    {sourceLocation.line}:{sourceLocation.column}
                  </span>
                )}
                <button
                  className="source-search-button"
                  type="button"
                  title="上一个匹配"
                  aria-label="上一个匹配"
                  disabled={sourceMatches.length === 0}
                  onClick={() => goToSourceMatch(sourceMatchIndex - 1)}
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  className="source-search-button"
                  type="button"
                  title="下一个匹配"
                  aria-label="下一个匹配"
                  disabled={sourceMatches.length === 0}
                  onClick={() => goToSourceMatch(sourceMatchIndex + 1)}
                >
                  <ChevronDown size={15} />
                </button>
                <button
                  className="source-search-button clear-search"
                  type="button"
                  title="清空搜索"
                  aria-label="清空搜索"
                  disabled={!sourceQuery}
                  onClick={() => {
                    setSourceQuery('')
                    sourceEditorRef.current?.focus()
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              <textarea
                ref={sourceEditorRef}
                className="source-view"
                value={result.html}
                onChange={(event) => setResult((current) => current ? { ...current, html: event.target.value } : current)}
                spellCheck={false}
                aria-label="HTML 源码编辑器"
              />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
