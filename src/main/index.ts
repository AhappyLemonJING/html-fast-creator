import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ConversionOptions } from '../shared/types'
import { convertDocument } from './converters'

const currentDir = dirname(fileURLToPath(import.meta.url))

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
