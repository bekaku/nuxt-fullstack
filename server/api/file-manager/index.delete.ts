import { ResponseEntity } from "~/types/common"
import { schema, useDb } from "~~/server/database/client"
import { eq } from 'drizzle-orm'
import { deleteFileFromStorage } from "~~/server/utils/storage"
export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }

  // 1. ดึงค่าจาก Query String (?id=999)
  const query = getQuery(event)
  const id = query.id as string
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File ID is required'
    })
  }
  const db = useDb()
  try {
    // let [record] = await db
    //   .select({
    //     id: schema.fileManager.id,
    //     filePath: schema.fileManager.filePath,
    //     fileName: schema.fileManager.fileName,
    //     thumbnailFile: schema.fileManager.thumbnailFile,
    //   })
    //   .from(schema.fileManager)
    //   .where(eq(schema.fileManager.id, BigInt(id)))
    //   .limit(1)


    const record = await db.query.fileManager.findFirst({
      where: eq(schema.fileManager.id, BigInt(id)),
      columns: {
        id: true,
        filePath: true,
        fileName: true,
      },
      with: {
        thumbnail: {
          columns: { filePath: true, id: true }
        }
      }
    });

    console.log('record', record)
    if (!record || !record.filePath) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }
    //delete thumbnail if exists
    if (record.thumbnail && record.thumbnail.filePath) {
      await deleteFileFromStorage(record.thumbnail.filePath)
      await db
        .delete(schema.fileManager)
        .where(eq(schema.fileManager.id, BigInt(record.thumbnail.id)))
    }

    //delete file from storage
    await deleteFileFromStorage(record.filePath)

    //delete from db
    await db
      .delete(schema.fileManager)
      .where(eq(schema.fileManager.id, BigInt(id)))

    return {
      status: 200,
      message: `Deleted file name: ${record.fileName} successfully`,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete file'
    })
  }
})
