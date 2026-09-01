import fs from 'node:fs'
import path from 'node:path'
import { createError, defineEventHandler } from 'h3'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { ingestDocument } from '~~/server/services/ai/document-ingestion'
import type { ResponseEntity } from '~/types/common'
import type { IngestionResponse } from '~/types/models'

export default defineEventHandler(async (event): Promise<ResponseEntity<IngestionResponse>> => {
  await requirePermission(event, 'ai_document_meta_add')

  const auth = getAuthUser(event)
  const id = validateID(event)
  const db = useDb()
  const config = useRuntimeConfig()
  const cdnDirectory = config.cdnDirectory

  // 1. Load file metadata
  const [record] = await db
    .select({
      filePath: schema.fileManager.filePath,
      fileName: schema.fileManager.fileName,
      fileMimeId: schema.fileManager.fileMimeId,
    })
    .from(schema.fileManager)
    .where(eq(schema.fileManager.id, BigInt(id)))
    .limit(1)

  if (!record || !record.filePath || !record.fileName) {
    throw createError({
      statusCode: 404,
      statusMessage: 'File metadata not found in database',
    })
  }

  // 2. Get MIME type
  const [mimeRecord] = await db
    .select({ name: schema.fileMime.name })
    .from(schema.fileMime)
    .where(eq(schema.fileMime.id, record.fileMimeId!))
    .limit(1)

  const mimeType = mimeRecord?.name || 'text/plain'

  // 3. Resolve physical file
  const fullFilePath = path.join(process.cwd(), cdnDirectory, record.filePath)

  if (!fs.existsSync(fullFilePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Physical file not found on server',
    })
  }

  // 4. Read file
  const fileBuffer = await fs.promises.readFile(fullFilePath)

  // 5. Ingest document
  try {
    const result = await ingestDocument({
      fileBuffer,
      fileName: record.fileName,
      mimeType,
      fileId: id.toString(),
      fileMimeId: record.fileMimeId,
      db,
      config,
      createdUser: BigInt(auth.sub),
      updatedUser: BigInt(auth.sub),
    })

    return {
      status: 200,
      message: 'Document ingested successfully',
      data: result,
    }
  } catch (error: any) {
    console.error('Ingest Document Error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})
