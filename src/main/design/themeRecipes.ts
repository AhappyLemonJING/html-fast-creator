import type { OutputTheme } from '../../shared/types'
import type { ThemeRecipe } from './types'

const fontUi = '"Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
const fontSerif = '"Source Han Serif SC", "Songti SC", "Noto Serif CJK SC", Georgia, serif'
const fontMono = '"SFMono-Regular", "Cascadia Code", "JetBrains Mono", Consolas, monospace'

const recipes: Record<OutputTheme, ThemeRecipe> = {
  editorial: {
    id: 'editorial',
    name: '编辑风格',
    description: '温暖纸感、高对比衬线标题，适合长文和正式报告。',
    mood: ['editorial', 'warm', 'literary'],
    palette: {
      background: '#f7f5f0',
      surface: '#fffdf9',
      text: '#242a2f',
      muted: '#6f767d',
      accent: '#a8492d',
      accentSoft: '#f1ded5',
      border: '#ded8cf',
      codeBackground: '#22282d',
      codeText: '#f4f1ea'
    },
    typography: {
      headingFont: fontSerif,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(30px, 4vw, 42px)',
      bodyScale: '17px'
    },
    tokens: `
      --bg: #f7f5f0;
      --surface: #fffdf9;
      --surface-2: #efebe3;
      --text: #242a2f;
      --muted: #6f767d;
      --accent: #a8492d;
      --accent-soft: #f1ded5;
      --border: #ded8cf;
      --code-bg: #22282d;
      --code-text: #f4f1ea;
      --radius: 12px;
      --shadow: 0 18px 45px rgba(45, 39, 31, 0.08);
      --font-body: ${fontUi};
      --font-heading: ${fontSerif};
    `
  },
  technical: {
    id: 'technical',
    name: '技术风格',
    description: '清晰、高信息密度，适合技术文档和 API 说明。',
    mood: ['technical', 'clean', 'structured'],
    palette: {
      background: '#f7f9fc',
      surface: '#ffffff',
      text: '#172033',
      muted: '#64748b',
      accent: '#2563eb',
      accentSoft: '#dbeafe',
      border: '#dce3ec',
      codeBackground: '#101826',
      codeText: '#e5edf8'
    },
    typography: {
      headingFont: fontUi,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(28px, 3.4vw, 36px)',
      bodyScale: '16px'
    },
    tokens: `
      --bg: #f7f9fc;
      --surface: #ffffff;
      --surface-2: #edf2f7;
      --text: #172033;
      --muted: #64748b;
      --accent: #2563eb;
      --accent-soft: #dbeafe;
      --border: #dce3ec;
      --code-bg: #101826;
      --code-text: #e5edf8;
      --radius: 10px;
      --shadow: 0 14px 38px rgba(15, 23, 42, 0.08);
      --font-body: ${fontUi};
      --font-heading: ${fontUi};
    `
  },
  business: {
    id: 'business',
    name: '商务风格',
    description: '克制、可信，适合数据简报和咨询交付物。',
    mood: ['business', 'trustworthy', 'data'],
    palette: {
      background: '#f6f8fa',
      surface: '#ffffff',
      text: '#1e293b',
      muted: '#64748b',
      accent: '#0f766e',
      accentSoft: '#ccfbf1',
      border: '#dbe3ec',
      codeBackground: '#0f172a',
      codeText: '#e2e8f0'
    },
    typography: {
      headingFont: fontUi,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(28px, 3.5vw, 38px)',
      bodyScale: '16px'
    },
    tokens: `
      --bg: #f6f8fa;
      --surface: #ffffff;
      --surface-2: #eef2f6;
      --text: #1e293b;
      --muted: #64748b;
      --accent: #0f766e;
      --accent-soft: #ccfbf1;
      --border: #dbe3ec;
      --code-bg: #0f172a;
      --code-text: #e2e8f0;
      --radius: 8px;
      --shadow: 0 10px 30px rgba(15, 23, 42, 0.07);
      --font-body: ${fontUi};
      --font-heading: ${fontUi};
    `
  },
  print: {
    id: 'print',
    name: '打印风格',
    description: '接近纸张、无阴影，适合合同和论文。',
    mood: ['print', 'paper', 'formal'],
    palette: {
      background: '#ffffff',
      surface: '#ffffff',
      text: '#111111',
      muted: '#555555',
      accent: '#111111',
      accentSoft: '#e6e6e6',
      border: '#cccccc',
      codeBackground: '#f5f5f5',
      codeText: '#111111'
    },
    typography: {
      headingFont: fontSerif,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(28px, 3.4vw, 36px)',
      bodyScale: '16px'
    },
    tokens: `
      --bg: #ffffff;
      --surface: #ffffff;
      --surface-2: #f5f5f5;
      --text: #111111;
      --muted: #555555;
      --accent: #111111;
      --accent-soft: #e6e6e6;
      --border: #cccccc;
      --code-bg: #f5f5f5;
      --code-text: #111111;
      --radius: 0;
      --shadow: none;
      --font-body: ${fontUi};
      --font-heading: ${fontSerif};
    `
  },
  'editorial-forest': {
    id: 'editorial-forest',
    name: '森林编辑风',
    description: '深色森林绿、暖白正文，适合文化评论与深度报道。',
    mood: ['editorial', 'nature', 'serious'],
    palette: {
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
    typography: {
      headingFont: fontSerif,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(32px, 4vw, 46px)',
      bodyScale: '17px'
    },
    tokens: `
      --bg: #10231f;
      --surface: #19352f;
      --surface-2: #1d3b34;
      --text: #edf2ec;
      --muted: #a3b5ad;
      --accent: #d0a24c;
      --accent-soft: #263e37;
      --border: #2b4a41;
      --code-bg: #0b1715;
      --code-text: #e5efe9;
      --radius: 10px;
      --shadow: 0 22px 58px rgba(0, 0, 0, 0.24);
      --font-body: ${fontUi};
      --font-heading: ${fontSerif};
    `
  },
  'moyu-green': {
    id: 'moyu-green',
    name: '摸鱼绿',
    description: '高信息密度、卡片丰富，适合教程和工具盘点。',
    mood: ['fresh', 'practical', 'high-density'],
    palette: {
      background: '#f5fbf8',
      surface: '#ffffff',
      text: '#15332a',
      muted: '#5e756c',
      accent: '#059669',
      accentSoft: '#ccf7e5',
      border: '#d8ebe3',
      codeBackground: '#0f1f1a',
      codeText: '#dff7ec'
    },
    typography: {
      headingFont: fontUi,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(28px, 3.5vw, 38px)',
      bodyScale: '16px'
    },
    tokens: `
      --bg: #f5fbf8;
      --surface: #ffffff;
      --surface-2: #e7f7f0;
      --text: #15332a;
      --muted: #5e756c;
      --accent: #059669;
      --accent-soft: #ccf7e5;
      --border: #d8ebe3;
      --code-bg: #0f1f1a;
      --code-text: #dff7ec;
      --radius: 10px;
      --shadow: 0 12px 34px rgba(5, 150, 105, 0.08);
      --font-body: ${fontUi};
      --font-heading: ${fontUi};
    `
  },
  'zen-whitespace': {
    id: 'zen-whitespace',
    name: '留白禅意风',
    description: '呼吸感强、低密度，适合随笔和深度思考。',
    mood: ['zen', 'airy', 'minimal'],
    palette: {
      background: '#fbfcf9',
      surface: '#ffffff',
      text: '#24302a',
      muted: '#7a867f',
      accent: '#4a5d52',
      accentSoft: '#e3ece6',
      border: '#dce3de',
      codeBackground: '#26302b',
      codeText: '#f2f7f3'
    },
    typography: {
      headingFont: fontSerif,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(32px, 4vw, 46px)',
      bodyScale: '17px'
    },
    tokens: `
      --bg: #fbfcf9;
      --surface: #ffffff;
      --surface-2: #edf3ef;
      --text: #24302a;
      --muted: #7a867f;
      --accent: #4a5d52;
      --accent-soft: #e3ece6;
      --border: #dce3de;
      --code-bg: #26302b;
      --code-text: #f2f7f3;
      --radius: 8px;
      --shadow: none;
      --font-body: ${fontUi};
      --font-heading: ${fontSerif};
    `
  },
  'red-white': {
    id: 'red-white',
    name: '红白编辑风',
    description: '红色克制点睛，适合观点、分析和正式文章。',
    mood: ['editorial', 'strong', 'opinion'],
    palette: {
      background: '#fefbfb',
      surface: '#ffffff',
      text: '#1f1f1f',
      muted: '#6f6f6f',
      accent: '#dc2626',
      accentSoft: '#fee2e2',
      border: '#ebdbdb',
      codeBackground: '#251818',
      codeText: '#fdeaea'
    },
    typography: {
      headingFont: fontSerif,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(32px, 4vw, 46px)',
      bodyScale: '17px'
    },
    tokens: `
      --bg: #fefbfb;
      --surface: #ffffff;
      --surface-2: #fbecec;
      --text: #1f1f1f;
      --muted: #6f6f6f;
      --accent: #dc2626;
      --accent-soft: #fee2e2;
      --border: #ebdbdb;
      --code-bg: #251818;
      --code-text: #fdeaea;
      --radius: 8px;
      --shadow: 0 14px 36px rgba(31, 31, 31, 0.08);
      --font-body: ${fontUi};
      --font-heading: ${fontSerif};
    `
  },
  'neo-brutal': {
    id: 'neo-brutal',
    name: '新粗野风',
    description: '粗黑描边、硬阴影和橙色强调，适合宣言、创意提案与强观点内容。',
    mood: ['brutal', 'graphic', 'bold'],
    palette: {
      background: '#f2efe6',
      surface: '#fffdf4',
      text: '#111111',
      muted: '#555555',
      accent: '#ff4d00',
      accentSoft: '#ffd9c7',
      border: '#111111',
      codeBackground: '#111111',
      codeText: '#ffffff'
    },
    typography: {
      headingFont: fontUi,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(34px, 4.4vw, 50px)',
      bodyScale: '17px'
    },
    tokens: `
      --bg: #f2efe6;
      --surface: #fffdf4;
      --surface-2: #e9e3d5;
      --text: #111111;
      --muted: #555555;
      --accent: #ff4d00;
      --accent-soft: #ffd9c7;
      --border: #111111;
      --code-bg: #111111;
      --code-text: #ffffff;
      --radius: 4px;
      --shadow: 4px 4px 0 #111111;
      --font-body: ${fontUi};
      --font-heading: ${fontUi};
    `
  },
  terminal: {
    id: 'terminal',
    name: '终端极客风',
    description: '深黑背景、荧光绿和等宽字体，适合技术复盘、命令行与开发者内容。',
    mood: ['terminal', 'geek', 'dark'],
    palette: {
      background: '#0b0f0c',
      surface: '#121a15',
      text: '#d8f3d9',
      muted: '#7f9b7f',
      accent: '#5bf59a',
      accentSoft: '#183723',
      border: '#27432f',
      codeBackground: '#050805',
      codeText: '#b6ffcb'
    },
    typography: {
      headingFont: fontMono,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(30px, 3.8vw, 42px)',
      bodyScale: '16px'
    },
    tokens: `
      --bg: #0b0f0c;
      --surface: #121a15;
      --surface-2: #17251c;
      --text: #d8f3d9;
      --muted: #7f9b7f;
      --accent: #5bf59a;
      --accent-soft: #183723;
      --border: #27432f;
      --code-bg: #050805;
      --code-text: #b6ffcb;
      --radius: 6px;
      --shadow: none;
      --font-body: ${fontUi};
      --font-heading: ${fontMono};
    `
  },
  bento: {
    id: 'bento',
    name: 'Bento 卡片风',
    description: '高圆角模块卡片、珊瑚色强调，适合产品介绍、数据看板和创意简报。',
    mood: ['bento', 'modular', 'modern'],
    palette: {
      background: '#f7f8fc',
      surface: '#ffffff',
      text: '#1d2939',
      muted: '#667085',
      accent: '#ff6b6b',
      accentSoft: '#ffe0d9',
      border: '#e4e7ec',
      codeBackground: '#101828',
      codeText: '#e2e8f0'
    },
    typography: {
      headingFont: fontUi,
      bodyFont: fontUi,
      monoFont: fontMono,
      headingScale: 'clamp(30px, 3.8vw, 42px)',
      bodyScale: '16px'
    },
    tokens: `
      --bg: #f7f8fc;
      --surface: #ffffff;
      --surface-2: #eef2f7;
      --text: #1d2939;
      --muted: #667085;
      --accent: #ff6b6b;
      --accent-soft: #ffe0d9;
      --border: #e4e7ec;
      --code-bg: #101828;
      --code-text: #e2e8f0;
      --radius: 18px;
      --shadow: 0 18px 42px rgba(29, 41, 57, 0.08);
      --font-body: ${fontUi};
      --font-heading: ${fontUi};
    `
  }
}

export const themeRecipes = recipes

export const themeTokens: Record<OutputTheme, string> = Object.fromEntries(
  Object.entries(recipes).map(([key, recipe]) => [key, recipe.tokens])
) as Record<OutputTheme, string>

export function getThemeRecipe(theme: OutputTheme): ThemeRecipe {
  return recipes[theme]
}
