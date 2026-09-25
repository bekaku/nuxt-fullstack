import type { ResponseEntity } from "~/types/common"
import { assertFileAccess, deleteFileManager } from "~~/server/utils/files"
import { assertNumericId } from "~~/server/utils/validate"
export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  getAuthUser(event)
  // 1. get Query String (?id=999)
  const id = assertNumericId(getQuery(event).id, 'File ID')

  // 2. Only the owner, or a user with file_manager_delete, may delete the file.
  await assertFileAccess(event, BigInt(id), 'delete')

  const record = await deleteFileManager(BigInt(id));
  return {
    status: 200,
    message: `Deleted file name: ${record?.fileName} successfully`,
  }
})
