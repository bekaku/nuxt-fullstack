import { aliasedTable, count, eq } from 'drizzle-orm'
import type { ApiResponse, ResponseEntity } from '~/types/common'
import type { FileManager } from '~/types/models'
import { paginate } from '~~/server/utils/dbPaging'
import { schema, useDb } from '#server/database/client'
import { canAccessAllFiles } from '~~/server/utils/files'

export default defineEventHandler(async (event): Promise<ResponseEntity<ApiResponse<FileManager>>> => {
  // Login required. Users see their own files; file_manager_list grants the full list.
  const auth = getAuthUser(event)
  const canListAll = await canAccessAllFiles(event, 'list')

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
    where: canListAll ? undefined : eq(schema.fileManager.owner, BigInt(auth.sub)),
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
