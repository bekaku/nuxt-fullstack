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

  // 1. Find existing document(s) with the same file name.
  // Re-ingesting a file with the same name intentionally REPLACES the old document,
  // but the old data is removed only after the new one is fully stored (step 9),
  // so a failure while parsing/embedding/storing keeps the previous version searchable.
  const existingDocs = await db
    .select({ id: schema.aiDocumentMeta.id })
    .from(schema.aiDocumentMeta)
    .where(eq(schema.aiDocumentMeta.fileName, fileName))

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
    model: config.ollamaEmbeddingModel || 'bge-m3'
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

  // 7. Insert into Qdrant (batched). If a later batch fails, remove the batches already written.
  try {
    await upsertVectors(qdrantConfig, points)
  } catch (qdrantError) {
    console.error('Qdrant upsert failed, removing partially written vectors...', qdrantError)
    await deleteVectors(qdrantConfig, vectorIds).catch((cleanupError) => {
      console.error('Failed to remove partially written vectors', cleanupError)
    })
    throw qdrantError
  }

  // 8. Save PostgreSQL metadata in one transaction; on failure remove the new Qdrant vectors.
  let documentId: bigint
  try {
    documentId = await db.transaction(async (tx) => {
      const [newMeta] = await tx
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

      // ไฟล์หน้าเยอะๆ มีหลายพัน vectors แบ่ง insert เป็น batch เพื่อเลี่ยง query ใหญ่เกิน
      const vectorBatchSize = 500
      for (let i = 0; i < vectorIds.length; i += vectorBatchSize) {
        const batch = vectorIds.slice(i, i + vectorBatchSize)

        await tx.insert(schema.aiDocumentVectorIds).values(
          batch.map((vectorId) => ({
            documentId: newMeta.id,
            vectorId
          }))
        )
      }

      await tx.insert(schema.aiDocumentMetadata).values([
        {
          documentId: newMeta.id,
          metaKey: 'ingestedAt',
          metaValue: new Date().toISOString(),
        },
        {
          documentId: newMeta.id,
          metaKey: 'chunkCount',
          metaValue: chunks.length.toString(),
        },
      ])

      return newMeta.id
    })
  } catch (dbError) {
    console.error('Metadata persistence failed, rolling back Qdrant vectors...', dbError)
    await deleteVectors(qdrantConfig, vectorIds).catch((cleanupError) => {
      console.error('Failed to roll back Qdrant vectors', cleanupError)
    })
    throw dbError
  }

  // 9. The new version is stored: now remove the previous version(s).
  // A failure here leaves a duplicate (old + new) instead of losing data; the next
  // ingest of the same file name removes every older copy again.
  for (const existingDoc of existingDocs) {
    try {
      await deleteIngestedDocument(existingDoc.id, { db, config })
    } catch (cleanupError) {
      console.error(`Failed to remove previous version ${existingDoc.id} of ${fileName}`, cleanupError)
    }
  }

  // 10. Return result
  return {
    id: documentId.toString(),
    fileName,
    fileMime: mimeType,
    chunkCount: chunks.length,
  }
}

/**
* Remove one ingested document: Qdrant vectors first, then all PostgreSQL rows in one
* transaction. Safe to retry — deleting already-missing Qdrant points is a no-op and the
* PostgreSQL rows (which hold the vector ids) are only removed after Qdrant succeeded.
* Returns false when the document does not exist.
*/
export async function deleteIngestedDocument(
  documentId: bigint,
  {
    db = useDb(),
    config = useRuntimeConfig(),
  }: {
    db?: ReturnType<typeof useDb>
    config?: ReturnType<typeof useRuntimeConfig>
  } = {},
): Promise<boolean> {
  const [doc] = await db
    .select({ id: schema.aiDocumentMeta.id })
    .from(schema.aiDocumentMeta)
    .where(eq(schema.aiDocumentMeta.id, documentId))
    .limit(1)

  if (!doc) {
    return false
  }

  const vectorRecords = await db
    .select({ vectorId: schema.aiDocumentVectorIds.vectorId })
    .from(schema.aiDocumentVectorIds)
    .where(eq(schema.aiDocumentVectorIds.documentId, documentId))

  await deleteVectors(
    {
      qdrantUrl: config.qdrantUrl,
      qdrantApiKey: config.qdrantApiKey,
      qdrantCollectionName: config.qdrantCollectionName,
    },
    vectorRecords.map((record) => record.vectorId),
  )

  await db.transaction(async (tx) => {
    await tx.delete(schema.aiDocumentMetadata).where(eq(schema.aiDocumentMetadata.documentId, documentId))
    await tx.delete(schema.aiDocumentVectorIds).where(eq(schema.aiDocumentVectorIds.documentId, documentId))
    await tx.delete(schema.aiDocumentMeta).where(eq(schema.aiDocumentMeta.id, documentId))
  })

  return true
}
