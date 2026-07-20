import fs from 'node:fs'
import path from 'node:path'
import { sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')
  if (!filename) {
    throw createError({ statusCode: 400, message: 'Filename is required' })
  }
  const { cdnDirectory } = useRuntimeConfig()
  // const uplodPath = config.cdnDirectory

  const uploadsDir = path.join(process.cwd(), cdnDirectory)
  // const filePath = path.join(process.cwd(), uplodPath, filename)
  const filePath = path.normalize(path.join(uploadsDir, filename))

  // Security Check (Very Important!)
  // Prevent directory traversal, e.g., someone calling /cdn/../../etc/passwd
  if (!filePath.startsWith(uploadsDir)) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, message: `File not found. Looking at: ${filePath}` })
  }

  const stream = fs.createReadStream(filePath)
  return sendStream(event, stream)
})
