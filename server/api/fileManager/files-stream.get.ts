import { eq } from "drizzle-orm"
import { schema, useDb } from "~~/server/database/client"
import path from 'node:path'
import fs from 'node:fs'
import { stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { sendStream } from 'h3' // Utility ของ H3 สำหรับส่ง Stream

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id as string
  // Convert chunkSize to bytes (if the frontend sends in KB, multiply by 1024)
  // Normally 8192 bytes = 8KB, the default value for a Node.js stream is 64KB (65536)
  const chunkSize = query.chunkSize ? Number(query.chunkSize) : 65536

  const config = useRuntimeConfig()
  const cdnDirectory = config.cdnDirectory
  const db = useDb()

  let [record] = await db
    .select({
      filePath: schema.fileManager.filePath,
      fileName: schema.fileManager.fileName
    })
    .from(schema.fileManager)
    .where(eq(schema.fileManager.id, BigInt(id)))
    .limit(1)

  if (!record || !record.filePath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'File metadata not found in database'
    })
  }

  // Create the full path to reference files on disk
  // Use path.join to prevent slash overlap issues
  const fullFilePath = path.join(process.cwd(), cdnDirectory, record.filePath)

  // 1. Check if the file actually exists on the disk.
  if (!fs.existsSync(fullFilePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Physical file not found on server'
    })
  }

  // 2. Retrieve file size information (File Stats) to pass in the Content-Length header.
  // Very important: Frontend developers must use Content-Length to calculate the % Progress Bar.
  const fileStats = await stat(fullFilePath)
  // 3. Set HTTP Headers for downloading
  // Content-Type can be retrieved from the database if stored (e.g., application/pdf)
  setResponseHeader(event, 'Content-Length', fileStats.size)
  setResponseHeader(event, 'Content-Type', 'application/octet-stream')

  // Add a header to force download and name the file.
  // encodeURIComponent to support Thai filenames.
  const encodedFileName = encodeURIComponent(record.fileName || 'downloaded_file')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`)

// 4. Create a Readable Stream from the file
// highWaterMark is the size of the chunk to read from Disk into Memory in each iteration.
  const stream = createReadStream(fullFilePath, {
    highWaterMark: chunkSize
  })

// 5. Send the stream back to the client.
  return sendStream(event, stream)
})
