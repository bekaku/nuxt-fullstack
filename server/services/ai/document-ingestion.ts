import crypto from 'node:crypto'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { parseDocument } from './document-parser'
import { splitTextIntoChunks } from './document-chunker'
import { generateEmbeddings } from './embedding'
import { deleteVectors, upsertVectors } from '~~/server/utils/ai/qdrant'

interface IngestDocumentOptions {
  fileBuffer: Buffer
  fileName: string
  mimeType: string
  fileId: string
  fileMimeId?: bigint | number | string | null
  db?: ReturnType<typeof useDb>
  config?: ReturnType<typeof useRuntimeConfig>
  createdUser: bigint
  updatedUser?: bigint
  chunkSize?: number
  chunkOverlap?: number
}

export async function ingestDocument({
  fileBuffer,
  fileName,
  mimeType,
  fileMimeId,
  db = useDb(),
  config = useRuntimeConfig(),
  createdUser,
  updatedUser = createdUser,
  chunkSize = 1000,
  chunkOverlap = 200,
}: IngestDocumentOptions) {
  const qdrantConfig = {
    qdrantUrl: config.qdrantUrl,
    qdrantApiKey: config.qdrantApiKey,
    qdrantCollectionName: config.qdrantCollectionName,
  }

  // 1. Find existing document
  const existingDocs = await db
    .select({ id: schema.aiDocumentMeta.id })
    .from(schema.aiDocumentMeta)
    .where(eq(schema.aiDocumentMeta.fileName, fileName))

  // 2. Delete old document + vectors
  if (existingDocs.length > 0) {
    console.log(`Found existing document(s) for ${fileName}. Deleting old data...`)

    for (const existingDoc of existingDocs) {
      const existingDocId = existingDoc.id

      const oldVectorRecords = await db
        .select({ vectorId: schema.aiDocumentVectorIds.vectorId })
        .from(schema.aiDocumentVectorIds)
        .where(eq(schema.aiDocumentVectorIds.documentId, existingDocId))

      const oldVectorIds = oldVectorRecords.map((item) => item.vectorId)

      // Delete from Qdrant
      if (oldVectorIds.length > 0) {
        await deleteVectors(qdrantConfig, oldVectorIds)
      }

      // Delete child & main tables
      await db.delete(schema.aiDocumentMetadata).where(eq(schema.aiDocumentMetadata.documentId, existingDocId))
      await db.delete(schema.aiDocumentVectorIds).where(eq(schema.aiDocumentVectorIds.documentId, existingDocId))
      await db.delete(schema.aiDocumentMeta).where(eq(schema.aiDocumentMeta.id, existingDocId))
    }

    console.log(`Successfully deleted old data for ${fileName}`)
  }

  // 3. Parse document
  const extractedText = await parseDocument(fileBuffer, mimeType)

  // 4. Split into chunks
  const chunks = splitTextIntoChunks(extractedText, chunkSize, chunkOverlap)
  if (!chunks.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No chunks generated from document',
    })
  }

  // 5. Generate embeddings
  const embeddings = await generateEmbeddings({
    chunks,
    baseURL: config.ollamaBaseUrl || 'http://localhost:11434/api',
    model: config.embeddingModel || 'bge-m3',
  })

  // 6. Build Qdrant points
  const vectorIds: string[] = []
  const points = chunks.map((chunk, index) => {
    const vectorId = crypto.randomUUID()
    vectorIds.push(vectorId)

    const embedding = embeddings[index]
    if (!embedding) {
      throw createError({
        statusCode: 500,
        statusMessage: `Missing embedding for chunk ${index}`,
      })
    }

    return {
      id: vectorId,
      vector: embedding,
      payload: {
        doc_content: chunk,
        fileName,
        chunk_index: index,
        documentType: mimeType,
        ingestedAt: new Date().toISOString(),
      },
    }
  })

  // 7. Insert into Qdrant
  await upsertVectors(qdrantConfig, points)

  // 8. Save PostgreSQL metadata with rollback
  let documentId: bigint
  try {
    const [newMeta] = await db
      .insert(schema.aiDocumentMeta)
      .values({
        fileName,
        active: true,
        fileMime: fileMimeId ? BigInt(fileMimeId) : null,
        createdUser,
        updatedUser,
      })
      .returning({ id: schema.aiDocumentMeta.id })

    if (!newMeta) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to insert document metadata',
      })
    }

    documentId = newMeta.id

    if (vectorIds.length > 0) {
      await db.insert(schema.aiDocumentVectorIds).values(
        vectorIds.map((vectorId) => ({
          documentId,
          vectorId,
        })),
      )
    }

    await db.insert(schema.aiDocumentMetadata).values([
      {
        documentId,
        metaKey: 'ingestedAt',
        metaValue: new Date().toISOString(),
      },
      {
        documentId,
        metaKey: 'chunkCount',
        metaValue: chunks.length.toString(),
      },
    ])
  } catch (dbError) {
    console.error('Metadata persistence failed, rolling back Qdrant vectors...', dbError)
    await deleteVectors(qdrantConfig, vectorIds)
    throw dbError
  }

  // 9. Return result
  return {
    id: documentId.toString(),
    fileName,
    fileMime: mimeType,
    chunkCount: chunks.length,
  }
}
