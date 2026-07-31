import { createError } from 'h3'
import { ResponseEntity } from '~/types/common'
import { AppUser } from '~/types/models'
import { validateID } from '~~/server/utils/validate'

export default defineEventHandler(async (event): Promise<ResponseEntity<AppUser>> => {
  await requirePermission(event, 'app_user_view')
  const id = validateID(event)
  const data = await findUserById(BigInt(id))

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Data not found'
    })
  }
  const { roles } = await loadUserPermissions(BigInt(id))
  data.selectedRoles = roles||[]
  return {
    status: 200,
    data
  }
})
