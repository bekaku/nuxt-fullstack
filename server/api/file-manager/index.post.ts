import fs from 'node:fs/promises'
import path from 'node:path'
import { ResponseEntity } from '~/types/common'
import mime from 'mime-types'
import { schema, useDb } from '~~/server/database/client'
import { eq } from 'drizzle-orm'
import { FileManager } from '~/types/models'
import { mapToFileManager } from '~~/server/utils/modelMapper'
import { getFileMimeType } from '~~/server/utils'

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

  const ext = path.extname(originalFilename)
  const uniqueFilename = `${auth.sub}_${uniqueId}${ext}`

  const uploadDir = path.join(process.cwd(), cdnDirectory)
  const tempDir = path.join(uploadDir, 'temp')

  await fs.mkdir(tempDir, { recursive: true })

  const tempFilePath = path.join(tempDir, `${uniqueFilename}.part-${chunkIndex}`)
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
    const finalFilePath = path.join(targetDir, uniqueFilename)

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
      throw createError({ statusCode: 500, message: 'Failed to insert file manager record' })
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
      message: 'Upload and merge complete',
      data: result
    }
  }


  return {
    status: 200,
  }
})
