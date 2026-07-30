import { ResponseEntity } from "~/types/common"
import { deleteFileManager } from "~~/server/utils/files"
export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }
  // 1. get Query String (?id=999)
  const query = getQuery(event)
  const id = query.id as string
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File ID is required'
    })
  }
  const record = await deleteFileManager(BigInt(id));
  return {
    status: 200,
    message: `Deleted file name: ${record?.fileName} successfully`,
  }
})
