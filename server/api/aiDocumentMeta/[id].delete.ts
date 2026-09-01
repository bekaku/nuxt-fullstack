import { getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { ResponseEntity } from '~/types/common'
import { QdrantClient } from '@qdrant/js-client-rest'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  await requirePermission(event, 'ai_document_meta_delete')

  const id = validateID(event)
  const db = useDb()
  const config = useRuntimeConfig()

  const qdrant = new QdrantClient({
    url: config.qdrantUrl,
    apiKey: config.qdrantApiKey,
    checkCompatibility: false,
  })

  try {
   // 1. Delete Metadata (child table)
    await db.delete(schema.aiDocumentMetadata)
      .where(eq(schema.aiDocumentMetadata.documentId, BigInt(id)))

    // 2. Retrieve all Vector IDs associated with this Document.
    const vectorRecords = await db
      .select({ vectorId: schema.aiDocumentVectorIds.vectorId })
      .from(schema.aiDocumentVectorIds)
      .where(eq(schema.aiDocumentVectorIds.documentId, BigInt(id)))

    const vectorIds = vectorRecords.map(record => record.vectorId)

   // 3. Remove Vectors from Qdrant
    if (vectorIds.length > 0) {
      await qdrant.delete(config.qdrantCollectionName, {
        wait: true, // Set to true to ensure deletion is complete before proceeding to the next step.
        points: vectorIds
      })
    }

   // 4. Remove Vector Mapping from the DB.
    await db.delete(schema.aiDocumentVectorIds)
      .where(eq(schema.aiDocumentVectorIds.documentId, BigInt(id)))

   // 5. Delete the main document.
    await db.delete(schema.aiDocumentMeta)
      .where(eq(schema.aiDocumentMeta.id, BigInt(id)))

    return {
      status: 200,
      message: 'DocumentMeta deleted successfully',
    }

  } catch (error) {
    console.error('Delete Document Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
