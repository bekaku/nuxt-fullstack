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

  const uploadsDir = path.resolve(path.join(process.cwd(), cdnDirectory))
  const filePath = path.resolve(path.join(uploadsDir, filename))

  // Security Check (Very Important!)
  // Prevent directory traversal, e.g., someone calling /cdn/../../etc/passwd
  // The trailing separator prevents sibling-directory escapes (e.g. /app/cdn-backup/...)
  if (filePath !== uploadsDir && !filePath.startsWith(uploadsDir + path.sep)) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  // Block hidden files/directories and internal upload temp chunks
  const relativePath = path.relative(uploadsDir, filePath)
  if (relativePath.split(path.sep).some((segment) => segment.startsWith('.') || segment === 'temp')) {
    throw createError({ statusCode: 404, message: 'File not found' })
  }

  let stats
  try {
    stats = await fs.promises.stat(filePath)
  } catch {
    throw createError({ statusCode: 404, message: 'File not found' })
  }
  if (!stats.isFile()) {
    throw createError({ statusCode: 404, message: 'File not found' })
  }

  const stream = fs.createReadStream(filePath)
  // Prevent browsers from MIME-sniffing responses into executable content (XSS)
  setResponseHeader(event, 'x-content-type-options', 'nosniff')
  return sendStream(event, stream)
})
