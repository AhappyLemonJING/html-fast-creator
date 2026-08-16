<div align="center">
  <h1>HTML 快速生成器</h1>
  <p>
    把 Markdown、Word、Excel 和 PDF 文档，一键转换为结构清晰、视觉完整、离线可用的独立 HTML 页面。
  </p>
  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-2563eb?style=flat-square" />
    <img alt="License" src="https://img.shields.io/badge/license-MIT-10b981?style=flat-square" />
    <img alt="Electron" src="https://img.shields.io/badge/Electron-43-47848f?style=flat-square&logo=electron&logoColor=white" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-ready-3178c6?style=flat-square&logo=typescript&logoColor=white" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white" />
  </p>
</div>

## 目录

- [这是什么](#这是什么)
- [功能](#功能)
- [快速开始](#快速开始)
- [AI 配置](#ai-配置)
- [使用流程](#使用流程)
- [AI 设计流程](#ai-设计流程)
- [项目结构](#项目结构)
- [示例](#示例)
- [已知限制](#已知限制)
- [许可证](#许可证)

<a id="这是什么"></a>
## 这是什么

`HTML 快速生成器` 是一个桌面端文档排版工具。它不直接生成千篇一律的网页，而是先解析文档内容，再用本地分析结果和 AI 设计协议，为不同类型的内容选择布局、配色、字体和信息层级。

最终产物是一个单文件 HTML：

- 不需要服务器或数据库
- 不依赖 CDN、在线字体或外部脚本
- 双击即可打开
- 可以继续导出为 PDF

当前版本采用 AI 驱动布局作为核心路径，因此生成前需要配置一个兼容 OpenAI Chat Completions 协议的接口和 API Key。

<a id="功能"></a>
## 功能

| 能力 | 说明 |
| --- | --- |
| 文档导入 | 支持拖拽或文件选择，自动识别文档类型 |
| 格式兼容 | Markdown、Word、Excel、PDF |
| 内容分析 | 识别文档类型、目标受众、核心结论、章节角色和数据信号 |
| AI 布局 | 通过结构化 JSON 生成差异化的配色、排版、封面和正文布局 |
| 响应式预览 | 支持桌面、平板、移动端宽度切换 |
| 源码检查 | 可在源码视图内搜索、跳转和定位匹配项 |
| HTML 导出 | 输出单文件、离线可用的独立 HTML |
| PDF 导出 | 将生成页面输出为 PDF 文件 |

### 支持的文档格式

| 格式 | 扩展名 | 本地处理方式 |
| --- | --- | --- |
| Markdown | `.md`、`.markdown` | 识别标题层级和表格结构 |
| Word | `.docx` | 使用 `mammoth` 提取正文文本 |
| Excel | `.xlsx`、`.xlsm` | 使用 `xlsx` 读取多个工作表并转换为表格 |
| PDF | `.pdf` | 使用 `pdfjs-dist` 提取文本并保留页码信息 |

### 生成页面能力

- 阅读进度条
- 封面和文档元信息
- 代码块语言标签与一键复制
- Excel 工作表标签切换
- 可选目录和滚动监听
- 数据指标、图表建议、风险与行动项
- `375px`、`768px`、`1024px`、`1440px` 响应式适配

<a id="快速开始"></a>
## 快速开始

建议使用 Node.js 20 或更高版本。

```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev

# 类型检查
npm run typecheck

# 构建生产版本
npm run build

# 打包 macOS 安装包（输出 zip 和 dmg）
npm run dist:mac

# 打包 Windows 安装包（输出便携 exe 和 zip）
npm run dist:win

# 预览构建结果
npm start
```

构建产物默认输出到 `out/`。
安装包产物默认输出到 `release/`。

> `dist:mac` 建议在 macOS 上执行；`dist:win` 可在 macOS 或 Windows 上执行。
> 当前安装包未配置 Apple Developer ID / Windows 代码签名，首次运行时 macOS 和 Windows 可能会显示安全提示。

<a id="ai-配置"></a>
## AI 配置

在应用左侧的 `AI 设计布局` 面板中填写以下信息：

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| 接口地址 | `https://api.deepseek.com` | 兼容 OpenAI Chat Completions 协议的基础地址 |
| 模型 | `deepseek-chat` | 使用的模型名称 |
| API Key | 空 | 调用接口所需的密钥 |
| 风格提示 | 空 | 可输入自然语言风格描述 |

也可以使用预设风格快速开始，例如程序员代码风格、极简杂志风、商务咨询报告或深色科技大屏。

API Key 会保存在 Electron 用户数据目录下。系统支持安全加密时使用 `safeStorage` 加密，不支持时使用 Base64 回退。

环境变量同样可以提供默认配置：

```bash
export OPENAI_BASE_URL="https://api.deepseek.com"
export OPENAI_MODEL="deepseek-chat"
export OPENAI_API_KEY="sk-..."
```

> 注意：当前生成流程依赖 AI 接口返回设计 JSON。未配置 API Key 时无法生成 HTML；生成完成后的 HTML 文件本身完全离线可用。

<a id="使用流程"></a>
## 使用流程

1. 启动应用，将文档拖入左侧区域，或点击选择文件。
2. 在 `AI 设计布局` 中填写接口地址、模型和 API Key。
3. 输入风格提示或选择预设风格。
4. 点击 `应用 AI 设置`。
5. 点击 `生成 HTML`。
6. 在预览或源码视图检查结果。
7. 点击 `导出 HTML` 或 `导出为 PDF` 保存文件。

<a id="ai-设计流程"></a>
## AI 设计流程

工具不会把原始 HTML 或整个页面直接交给模型生成。主进程会先统一内容结构，再把可控的设计上下文发送给模型。

```mermaid
flowchart LR
  A[导入文档] --> B[格式归一化]
  B --> C[内容分析]
  C --> D[构建结构化上下文]
  D --> E[调用兼容 AI 接口]
  E --> F[解析与清洗设计 JSON]
  F --> G[合并设计变量与正文]
  G --> H[组装独立 HTML]
  H --> I[预览或导出]
```

模型返回严格 JSON，字段包括：

- `themeName`：设计主题名称
- `templateName`：设计参考方向
- `documentType`、`audience`、`density`
- `layoutClass`：布局类型
- `tokens`：CSS 设计变量
- `coverHtml`：封面内部 HTML
- `contentHtml`：完整正文 HTML
- `css`：针对正文的额外样式
- `notes`：设计说明

返回内容会经过 JSON 解析、CSS 变量合并、HTML/CSS 清洗，并最终由 `buildStandaloneHtml` 封装为完整页面。运行时的模型输出协议位于 [`src/main/design/aiPrompt.ts`](./src/main/design/aiPrompt.ts)。

<a id="项目结构"></a>
## 项目结构

```text
.
├── electron.vite.config.ts        # electron-vite 构建配置
├── electron-builder.yml           # 双平台安装包配置
├── package.json
├── scripts/
│   └── create-mac-dmg.mjs         # 用本机 hdiutil 生成 macOS dmg
├── examples/                      # 已生成的 HTML/PDF 示例
└── src/
    ├── main/
    │   ├── index.ts               # Electron 主进程、IPC、文件与导出逻辑
    │   ├── theme.ts               # 独立 HTML 外壳与运行时脚本
    │   ├── utils.ts
    │   ├── converters/            # Markdown、Word、Excel、PDF 转换入口
    │   └── design/                # 文档分析、模板、主题和 AI 设计协议
    ├── preload/
    │   └── index.ts               # 安全暴露给渲染进程的 API
    ├── renderer/
    │   ├── index.html
    │   └── src/
    │       ├── App.tsx            # 主界面
    │       ├── main.tsx
    │       └── styles.css
    └── shared/
        └── types.ts               # 主进程、预加载和渲染层共享类型
```

<a id="示例"></a>
## 示例

仓库中提供了一些生成结果示例，可下载后查看：

| 示例 | 类型 |
| --- | --- |
| [`fund-manager-md-to-html.html`](./examples/fund-manager-md-to-html.html) | Markdown 转 HTML |
| [`resume-docx-to-html.html`](./examples/resume-docx-to-html.html) | Word 转 HTML |
| [`resume-pdf-to-html.html`](./examples/resume-pdf-to-html.html) | PDF 转 HTML |
| [`excel-to-html-1.html`](./examples/excel-to-html-1.html) | Excel 转 HTML |
| [`excel-to-hutm-2.html`](./examples/excel-to-hutm-2.html) | Excel 转 HTML |
| [`resume-word-to-html转pdf.pdf`](./examples/resume-word-to-html转pdf.pdf) | HTML 转 PDF |

<a id="已知限制"></a>
## 已知限制

- Word 转换当前提取的是正文文本，不保留原始 Word 样式、嵌入图片或分栏版式。
- Excel 转换会重建为更适合网页浏览的表格与数据看板，不逐像素复刻 Excel 原生样式。
- PDF 转换基于文本提取，扫描版 PDF 暂不支持 OCR 或按图片渲染。
- 当前 PDF 导出按渲染文档尺寸生成页面，长文档可能得到尺寸较大的 PDF 页。
- `ConversionOptions` 已包含主题、封面、目录和暗色模式字段，当前界面主要暴露 AI 设计配置。

<a id="许可证"></a>
## 许可证

MIT
