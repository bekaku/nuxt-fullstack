import { aliasedTable, count, eq } from 'drizzle-orm'
import { ApiResponse, ResponseEntity } from '~/types/common'
import { FileManager, Permission } from '~/types/models'
import { paginate } from '~~/server/utils/dbPaging'
import { schema, useDb } from '#server/database/client'
import { requirePermission } from '#server/utils/permission'

export default defineEventHandler(async (event): Promise<ResponseEntity<ApiResponse<FileManager>>> => {

  const db = useDb()
  const config = useRuntimeConfig()
  const cdnBase = config.public.cdnBase
  const thumbnailTable = aliasedTable(schema.fileManager, 'thumbnail_table')
  const dataQuery = db
    .select({
      id: schema.fileManager.id,
      createdDate: schema.fileManager.createdDate,
      fileName: schema.fileManager.fileName,
      filePath: schema.fileManager.filePath,
      fileSize: schema.fileManager.fileSize,
      fileMimeId: schema.fileManager.fileMimeId,
      filesDirectoryId: schema.fileManager.filesDirectoryId,
      description: schema.fileManager.description,
      duration: schema.fileManager.duration,
      title: schema.fileManager.title,
      thumbnailFile: schema.fileManager.thumbnailFile,
      updatedDate: schema.fileManager.updatedDate,
      fileMime: schema.fileMime.name,
      fileThumbnailPath: thumbnailTable.filePath
    })
    .from(schema.fileManager)
    .leftJoin(schema.fileMime, eq(schema.fileManager.fileMimeId, schema.fileMime.id))
    .leftJoin(thumbnailTable, eq(schema.fileManager.thumbnailFile, thumbnailTable.id))
    .$dynamic()

  const countQuery = db
    .select({ value: count() })
    .from(schema.fileManager)
    .leftJoin(schema.fileMime, eq(schema.fileManager.fileMimeId, schema.fileMime.id))
    .leftJoin(thumbnailTable, eq(schema.fileManager.thumbnailFile, thumbnailTable.id))
    .$dynamic()

  const data = await paginate(event, {
    dataQuery,
    countQuery,
    columns: {
      id: schema.fileManager.id,
      fileName: schema.fileManager.fileName,
    },
    defaultSort: schema.fileManager.fileName,
    transform: (item) => {
      const fileMimeType = item.fileMime;
      return mapToFileManager(item, {
        cdnBase: cdnBase,
        fileMime: fileMimeType,
        fileMimeType: getFileMimeType(fileMimeType),
      });
    }
  })
  return {
    status: 200,
    data
  }
})
