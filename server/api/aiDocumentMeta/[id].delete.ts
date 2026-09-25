import type { ResponseEntity } from '~/types/common'
import { deleteIngestedDocument } from '~~/server/services/ai/document-ingestion'
import { serverException } from '~~/server/utils/exception'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  await requirePermission(event, 'ai_document_meta_delete')

  const id = validateID(event)

  let deleted: boolean
  try {
    // Qdrant vectors first, then PostgreSQL rows in one transaction (retry-safe).
    deleted = await deleteIngestedDocument(BigInt(id))
  } catch (error) {
    throw serverException(error)
  }

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Data not found' })
  }

  return {
    status: 200,
    message: 'DocumentMeta deleted successfully',
  }
})
