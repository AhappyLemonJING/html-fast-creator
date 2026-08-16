import { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } from 'electron'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AiDesignConfig, ConversionOptions } from '../shared/types'
import { convertDocument } from './converters'

const currentDir = dirname(fileURLToPath(import.meta.url))
const aiSettingsFileName = 'ai-settings.json'

interface StoredAiSettings {
  enabled?: boolean
  baseUrl?: string
  model?: string
  apiKey?: string
  styleHint?: string
}

function getAiSettingsPath(): string {
  return join(app.getPath('userData'), aiSettingsFileName)
}

function encodeApiKey(apiKey: string): string {
  if (!apiKey) return ''
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(apiKey).toString('base64')
  }

  return Buffer.from(apiKey, 'utf8').toString('base64')
}

function decodeApiKey(storedApiKey: string): string {
  if (!storedApiKey) return ''

  try {
    const encrypted = Buffer.from(storedApiKey, 'base64')
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(encrypted)
    }
    return encrypted.toString('utf8')
  } catch {
    return ''
  }
}

async function readAiSettings(): Promise<AiDesignConfig | null> {
  const settingsPath = getAiSettingsPath()
  if (!existsSync(settingsPath)) return null

  const raw = await readFile(settingsPath, 'utf8')
  const stored = JSON.parse(raw) as StoredAiSettings

  return {
    enabled: stored.enabled ?? true,
    baseUrl: typeof stored.baseUrl === 'string' ? stored.baseUrl : 'https://api.deepseek.com',
    model: typeof stored.model === 'string' ? stored.model : 'deepseek-chat',
    apiKey: decodeApiKey(typeof stored.apiKey === 'string' ? stored.apiKey : ''),
    styleHint: typeof stored.styleHint === 'string' ? stored.styleHint : ''
  }
}

async function writeAiSettings(settings: AiDesignConfig): Promise<void> {
  const settingsPath = getAiSettingsPath()
  await mkdir(dirname(settingsPath), { recursive: true })

  const stored: StoredAiSettings = {
    enabled: settings.enabled,
    baseUrl: settings.baseUrl,
    model: settings.model,
    apiKey: encodeApiKey(settings.apiKey),
    styleHint: settings.styleHint
  }

  await writeFile(settingsPath, JSON.stringify(stored, null, 2), 'utf8')
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    show: false,
    backgroundColor: '#f7f9fc',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(currentDir, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  window.once('ready-to-show', () => window.show())

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    window.loadFile(join(currentDir, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('convert:file', (_event, filePath: string, options: ConversionOptions) =>
    convertDocument(filePath, options)
  )

  ipcMain.handle('settings:get-ai', () => readAiSettings())

  ipcMain.handle('settings:save-ai', (_event, settings: AiDesignConfig) => writeAiSettings(settings))

  ipcMain.handle('dialog:open-file', async () => {
    const result = await dialog.showOpenDialog({
      title: '选择文档',
      properties: ['openFile'],
      filters: [
        { name: '支持的文档', extensions: ['md', 'markdown', 'docx', 'xlsx', 'xlsm', 'pdf'] },
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'Word', extensions: ['docx'] },
        { name: 'Excel', extensions: ['xlsx', 'xlsm'] },
        { name: 'PDF', extensions: ['pdf'] }
      ]
    })
    return result.canceled ? null : (result.filePaths[0] ?? null)
  })

  ipcMain.handle('dialog:save-html', async (_event, html: string, suggestedName: string) => {
    const result = await dialog.showSaveDialog({
      title: '导出 HTML',
      defaultPath: suggestedName,
      filters: [{ name: 'HTML 文档', extensions: ['html'] }]
    })
    if (result.canceled || !result.filePath) {
      return { canceled: true }
    }
    await writeFile(result.filePath, html, 'utf8')
    return { canceled: false, filePath: result.filePath }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
