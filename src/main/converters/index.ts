import { extname } from 'node:path'
import type { ConversionOptions, ConversionResult, DocFormat } from '../../shared/types'
import { convertExcel } from './excel'
import { convertMarkdown } from './markdown'
import { convertPdf } from './pdf'
import { convertWord } from './word'

const converters: Record<DocFormat, (filePath: string, options: ConversionOptions) => Promise<ConversionResult>> = {
  markdown: convertMarkdown,
  word: convertWord,
  excel: convertExcel,
  pdf: convertPdf
}

export function detectFormat(filePath: string): DocFormat | null {
  const extension = extname(filePath).toLowerCase()
  switch (extension) {
    case '.md':
    case '.markdown':
      return 'markdown'
    case '.docx':
      return 'word'
    case '.xlsx':
    case '.xlsm':
      return 'excel'
    case '.pdf':
      return 'pdf'
    default:
      return null
  }
}

export async function convertDocument(filePath: string, options: ConversionOptions): Promise<ConversionResult> {
  const format = detectFormat(filePath)
  if (!format) {
    throw new Error('不支持的文件格式。')
  }
  return converters[format](filePath, options)
}
