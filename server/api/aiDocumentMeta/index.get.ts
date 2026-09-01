import { AnyColumn, count, inArray, eq } from 'drizzle-orm'
import { ApiResponse, ResponseEntity } from '~/types/common'
import { AiDocumentMeta } from '~/types/models'
import { paginate } from '~~/server/utils/dbPaging'
import { schema, useDb } from '#server/database/client'
import { requirePermission } from '#server/utils/permission'

export default defineEventHandler(async (event): Promise<ResponseEntity<ApiResponse<AiDocumentMeta>>> => {
  await requirePermission(event, 'ai_document_meta_list')

  const db = useDb()

  // 1. นำตาราง fileMime มา Join และ select ฟิลด์ name
  const dataQuery = db
    .select({
      id: schema.aiDocumentMeta.id,
      fileName: schema.aiDocumentMeta.fileName,
      active: schema.aiDocumentMeta.active,
      fileMime: schema.fileMime.name,
    })
    .from(schema.aiDocumentMeta)
    .leftJoin(
      schema.fileMime,
      eq(schema.aiDocumentMeta.fileMime, schema.fileMime.id)
    )
    .$dynamic()

  // ต้อง Join ใน countQuery ด้วย หากมีการค้นหา (Search) ผ่านคอลัมน์ของ fileMime
  const countQuery = db
    .select({ value: count() })
    .from(schema.aiDocumentMeta)
    .leftJoin(
      schema.fileMime,
      eq(schema.aiDocumentMeta.fileMime, schema.fileMime.id)
    )
    .$dynamic()

  const data = await paginate(event, {
    dataQuery,
    countQuery,
    columns: {
      id: schema.aiDocumentMeta.id,
      fileName: schema.aiDocumentMeta.fileName,
      active: schema.aiDocumentMeta.active,
      fileMime: schema.fileMime.name,
    },
    searchColumns: [schema.aiDocumentMeta.fileName],
    defaultSort: schema.aiDocumentMeta.fileName,
    defaultSortDirection: 'asc'
  })

  if (data.dataList && data.dataList.length > 0) {
    const documentIds = data.dataList.map((item: any) => item.id)

    const metadataRecords = await db
      .select({
        documentId: schema.aiDocumentMetadata.documentId,
        metaKey: schema.aiDocumentMetadata.metaKey,
        metaValue: schema.aiDocumentMetadata.metaValue,
      })
      .from(schema.aiDocumentMetadata)
      .where(inArray(schema.aiDocumentMetadata.documentId, documentIds))

    const metadataMap: Record<string, Record<string, string>> = {}
    metadataRecords.forEach(record => {
      const docId = record.documentId.toString()
      if (!metadataMap[docId]) metadataMap[docId] = {}
      if (record.metaKey && record.metaValue) {
        metadataMap[docId][record.metaKey] = record.metaValue
      }
    })

    data.dataList = data.dataList.map((item: any) => ({
      id: item.id.toString(),
      fileName: item.fileName || '',
      active: item.active,
      fileMime: item.fileMime || '',
      metadata: metadataMap[item.id.toString()] || {}
    }))
  }

  return {
    status: 200,
    data: data as any
  }
})
