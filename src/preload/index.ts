import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { ConversionOptions, ConversionResult, SaveResult } from '../shared/types'

const api = {
  convertFile: (filePath: string, options: ConversionOptions): Promise<ConversionResult> =>
    ipcRenderer.invoke('convert:file', filePath, options),
  chooseFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:open-file'),
  saveHtml: (html: string, suggestedName: string): Promise<SaveResult> =>
    ipcRenderer.invoke('dialog:save-html', html, suggestedName),
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),
  platform: process.platform
}

contextBridge.exposeInMainWorld('api', api)

export type WindowApi = typeof api
