import fs from 'node:fs/promises'
import path from 'node:path'
import { ResponseEntity } from '~/types/common'
import mime from 'mime-types'
import { schema, useDb } from '~~/server/database/client'
import { eq } from 'drizzle-orm'
import { FileManager } from '~/types/models'
import { mapToFileManager } from '~~/server/utils/modelMapper'
import { getFileMimeType } from '~~/server/utils'

const MAX_TOTAL_CHUNKS = 1000
const DEFAULT_MAX_FILE_SIZE_BYTES = 52428800

export default defineEventHandler(async (event): Promise<ResponseEntity<FileManager | void>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'Invalid form data' })
  }

  const db = useDb()
  const config = useRuntimeConfig()
  const cdnDirectory = config.cdnDirectory
  const cdnBase = config.public.cdnBase

  let fileChunk: Buffer | undefined
  let uniqueId = ''
  let originalFilename = ''
  let chunkIndex = 0
  let totalChunks = 0
  let duration = 0
  let title = null
  let description = null
  let thumbnailFileId: bigint | null = null
  let hidden: boolean = false

  for (const field of formData) {
    if (field.name === 'chunk') fileChunk = field.data
    if (field.name === 'filename') originalFilename = field.data.toString()
    if (field.name === 'uniqueId') uniqueId = field.data.toString()
    if (field.name === 'title') title = field.data.toString()
    if (field.name === 'description') description = field.data.toString()
    if (field.name === 'thumbnailFileId') thumbnailFileId = BigInt(field.data.toString())
    if (field.name === 'chunkIndex') chunkIndex = parseInt(field.data.toString())
    if (field.name === 'totalChunks') totalChunks = parseInt(field.data.toString())
    if (field.name === 'duration') duration = parseInt(field.data.toString())
    if (field.name === 'hidden') hidden = field.data.toString() == 'true'
  }

  if (!fileChunk || !originalFilename || !uniqueId) {
    throw createError({ statusCode: 400, message: 'Missing chunk, filename, or uploadId' })
  }

  // Sanitize client-controlled values to prevent path traversal (e.g. ../../)
  const sanitizedUniqueId = uniqueId.replace(/[^A-Za-z0-9._-]/g, '_').replace(/^\.+/, '')
  if (!sanitizedUniqueId) {
    throw createError({ statusCode: 400, message: 'Invalid uploadId' })
  }
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0
    || !Number.isInteger(totalChunks) || totalChunks < 1
    || totalChunks > MAX_TOTAL_CHUNKS || chunkIndex >= totalChunks) {
    throw createError({ statusCode: 400, message: 'Invalid chunk index or total chunks' })
  }
  const rawExt = path.extname(originalFilename).toLowerCase()
  const ext = /^[a-z0-9]{1,10}$/.test(rawExt.slice(1)) ? rawExt : ''
  const uniqueFilename = `${auth.sub}_${sanitizedUniqueId}${ext}`

  // Server-side MIME whitelist — client-side acceptFiles is advisory only.
  // Blocks executable/browser-interpretable types (.html -> text/html,
  // .svg -> image/svg+xml, etc.) that could be served inline from /cdn/.
  const acceptedMimes: string[] = config.public.acceptFiles ?? []
  const uploadMime = mime.lookup(uniqueFilename) || 'application/octet-stream'
  if (acceptedMimes.length > 0 && !acceptedMimes.includes(uploadMime)) {
    throw createError({ statusCode: 415, message: 'File type not allowed' })
  }

  // Server-side size limit (client-side limitFileUploadSize is advisory only)
  const maxFileSizeBytes = Number(config.public.limitFileUploadSize) || DEFAULT_MAX_FILE_SIZE_BYTES
  if (fileChunk.length > maxFileSizeBytes) {
    throw createError({ statusCode: 413, message: 'Chunk exceeds the maximum upload size' })
  }

  const uploadDir = path.resolve(path.join(process.cwd(), cdnDirectory))
  const tempDir = path.join(uploadDir, 'temp')

  const tempFilePath = path.resolve(path.join(tempDir, `${uniqueFilename}.part-${chunkIndex}`))
  if (!tempFilePath.startsWith(tempDir + path.sep)) {
    throw createError({ statusCode: 400, message: 'Invalid uploadId' })
  }

  await fs.mkdir(tempDir, { recursive: true })

  await fs.writeFile(tempFilePath, fileChunk)

  if (chunkIndex === totalChunks - 1) {

    const missingChunks: number[] = []
    for (let i = 0; i < totalChunks; i++) {
      const partPath = path.join(tempDir, `${uniqueFilename}.part-${i}`)
      try {
        await fs.access(partPath)
      } catch {
        missingChunks.push(i)
      }
    }

    if (missingChunks.length > 0) {
      return {
        status: 202,
        message: `Waiting for missing chunks: ${missingChunks.join(', ')}`
      }
    }

    const now = new Date()
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const targetDir = path.join(uploadDir, yearMonth)
    await fs.mkdir(targetDir, { recursive: true })
    const finalFilePath = path.resolve(path.join(targetDir, uniqueFilename))
    if (!finalFilePath.startsWith(uploadDir + path.sep)) {
      throw createError({ statusCode: 400, message: 'Invalid uploadId' })
    }

    // Improve I/O Performance: Enable File Handle only once.
    const fileHandle = await fs.open(finalFilePath, 'w')

    try {
      // Write to each part of the file sequentially, one after another.
      for (let i = 0; i < totalChunks; i++) {
        const partPath = path.join(tempDir, `${uniqueFilename}.part-${i}`)
        const partData = await fs.readFile(partPath)

        await fileHandle.appendFile(partData)

        // Delete the chunks when you're finished writing.
        await fs.unlink(partPath).catch(() => { })
      }
    } finally {
      // Very important: Ensure the file is closed even if an error occurs during the loop.
      await fileHandle.close()
    }

    const stats = await fs.stat(finalFilePath)
    const fileSizeBytes = stats.size

    if (fileSizeBytes > maxFileSizeBytes) {
      await fs.unlink(finalFilePath).catch(() => { })
      throw createError({ statusCode: 413, message: 'Uploaded file exceeds the maximum size' })
    }

    const fileMimeType = mime.lookup(finalFilePath) || 'application/octet-stream'

    let [fileMimeForSave] = await db
      .select()
      .from(schema.fileMime)
      .where(eq(schema.fileMime.name, fileMimeType))
      .limit(1)

    if (!fileMimeForSave) {
      ;[fileMimeForSave] = await db
        .insert(schema.fileMime)
        .values({ id: nextId(), name: fileMimeType })
        .returning()
    }

    const [record] = await db
      .insert(schema.fileManager)
      .values({
        id: nextId(),
        deleted: false,
        createdDate: new Date(),
        createdUser: BigInt(auth.sub),
        fileName: originalFilename,
        filePath: `${yearMonth}/${uniqueFilename}`,
        fileSize: BigInt(fileSizeBytes),
        hidden: hidden,
        duration: duration,
        locked: false,
        readable: true,
        writeable: true,
        fileMimeId: fileMimeForSave ? BigInt(fileMimeForSave.id) : null,
        filesDirectoryId: null,
        owner: BigInt(auth.sub),
        title: title,
        description: description,
        thumbnailFile: thumbnailFileId,
        updatedDate: new Date(),
        updatedUser: BigInt(auth.sub),
      })
      .returning()

    if (!record) {
      throw createError({ statusCode: 500, message: `Failed to insert file manager record for ${uniqueFilename}` })
    }

    const result: FileManager = mapToFileManager(record, {
      cdnBase: cdnBase,
      fileMime: fileMimeType,
      fileMimeType: getFileMimeType(fileMimeType),
    });

    // const result: FileManager = {
    //   ...mapToFileManager(record, {
    //     cdnBase: cdnBase,
    //     fileMime: fileMimeType,
    //     fileMimeType: getFileMimeType(fileMimeType),
    //   }),
    //   filePath: `${cdnBase}/${record.filePath}`
    // }
    //path.extname(uniqueFilename)
    // const result = await loadFilemanager(record.id)
    // if (!result) {
    //   throw createError({ statusCode: 404, message: 'File not found' })
    // }
    return {
      status: 200,
      message: `Upload and merge ${originalFilename} complete`,
      data: result
    }
  }


  return {
    status: 200,
  }
})
