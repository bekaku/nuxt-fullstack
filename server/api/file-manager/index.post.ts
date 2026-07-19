import fs from 'node:fs/promises'
import path from 'node:path'
import { ResponseEntity } from '~/types/common'

export default defineEventHandler(async (event): Promise<ResponseEntity<any>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }
  // Read Multipart Form Data.
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'Invalid form data' })
  }

  const config = useRuntimeConfig()
  const cdnDirectory = config.cdnDirectory
  const cdnBase = config.public.cdnBase

  let fileChunk: Buffer | undefined
  let uniqueId = ''
  let originalFilename = ''
  let chunkIndex = 0
  let totalChunks = 0

  // Extract data from FormData.
  for (const field of formData) {
    if (field.name === 'chunk') fileChunk = field.data
    if (field.name === 'filename') originalFilename = field.data.toString()
    if (field.name === 'uniqueId') uniqueId = field.data.toString()
    if (field.name === 'chunkIndex') chunkIndex = parseInt(field.data.toString())
    if (field.name === 'totalChunks') totalChunks = parseInt(field.data.toString())
  }

  if (!fileChunk || !originalFilename || !uniqueId) {
    throw createError({ statusCode: 400, message: 'Missing chunk, filename, or uploadId' })
  }


  const ext = path.extname(originalFilename)
  const uniqueFilename = `${auth.sub}_${uniqueId}${ext}`


  //Prepare the folder.
  const uploadDir = path.join(process.cwd(), cdnDirectory)
  const tempDir = path.join(uploadDir, 'temp')

  await fs.mkdir(tempDir, { recursive: true }) // Create a folder if one doesn't already exist.

  // Save the chunk as separate files (e.g., myvideo.mp4.part-0)
  const tempFilePath = path.join(tempDir, `${uniqueFilename}.part-${chunkIndex}`)
  await fs.writeFile(tempFilePath, fileChunk)

  // Check if this is the last chunk.
  if (chunkIndex === totalChunks - 1) {
    const finalFilePath = path.join(uploadDir, uniqueFilename)

    // Create an empty file and prepare it.
    await fs.writeFile(finalFilePath, '')

    // Merge all chunks together.
    for (let i = 0; i < totalChunks; i++) {
      const partPath = path.join(tempDir, `${uniqueFilename}.part-${i}`)
      const partData = await fs.readFile(partPath)

      await fs.appendFile(finalFilePath, partData)
      await fs.unlink(partPath) // Delete the chunk once the connection is complete.
    }

    return {
      status: 200,
      message: 'Upload and merge complete',
      data: {
        url: `${cdnBase}/${uniqueFilename}`
      }
    }
  }

  return {
    status: 200,
  }
  /*
  return {
    status: 200,
    data: {}
  }
    */
})
