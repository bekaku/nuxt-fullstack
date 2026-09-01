import fs from 'node:fs'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import officeParser from 'officeparser'
import { PDFParse } from 'pdf-parse'

export async function parseDocument(
  fileBuffer: Buffer,
  mimeType: string,
): Promise<string> {

  let extractedText = ''

  if (mimeType === 'application/pdf') {
    const parser = new PDFParse({
      data: fileBuffer,
    })

    try {
      const pdfData = await parser.getText()
      extractedText = pdfData.text
    } finally {
      await parser.destroy()
    }
  }

  else if (
    mimeType.includes('wordprocessingml') ||
    mimeType === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({
      buffer: fileBuffer,
    })

    extractedText = result.value
  }

  else if (
    mimeType.includes('spreadsheetml') ||
    mimeType === 'application/vnd.ms-excel'
  ) {
    const workbook = XLSX.read(fileBuffer, {
      type: 'buffer',
    })

    extractedText = workbook.SheetNames
      .map((sheetName) => {
        const sheet = workbook.Sheets[sheetName]

        if (!sheet) {
          return ''
        }

        return [
          `--- Sheet: ${sheetName} ---`,
          XLSX.utils.sheet_to_csv(sheet),
        ].join('\n')
      })
      .filter(Boolean)
      .join('\n\n')
  }

  else if (
    mimeType.includes('presentationml') ||
    mimeType === 'application/vnd.ms-powerpoint'
  ) {
    extractedText = await (officeParser as any).parseOfficeAsync(fileBuffer)
  }

  else if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType.includes('xml') ||
    mimeType.includes('csv')
  ) {
    extractedText = fileBuffer.toString('utf-8')
  }

  else {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported or skipped document type: ${mimeType}`,
    })
  }

  if (!extractedText.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File is empty or could not be parsed',
    })
  }

  return extractedText
}
