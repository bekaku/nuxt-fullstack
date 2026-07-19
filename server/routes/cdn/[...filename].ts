import fs from 'node:fs'
import path from 'node:path'
import { sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')
  if (!filename) {
    throw createError({ statusCode: 400, message: 'Filename is required' })
  }
    const config = useRuntimeConfig()
  const uplodPath = config.cdnDirectory

  const filePath = path.join(process.cwd(), uplodPath, filename)

  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, message: 'File not found' })
  }

  const stream = fs.createReadStream(filePath)
  return sendStream(event, stream)
})
