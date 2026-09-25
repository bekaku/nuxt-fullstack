import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import type { ResponseEntity } from '~/types/common'
import type { Permission } from '~/types/models'
import { validateID } from '~~/server/utils/validate'

export default defineEventHandler(async (event): Promise<ResponseEntity<Permission>> => {

  await requirePermission(event, 'permission_view')

  const id = validateID(event)

  const db = useDb()

  const permission = await db.query.permission.findFirst({
    where: eq(schema.permission.id, BigInt(id)),
    columns: {
      id: true,
      code: true,
      description: true,
      module: true,
      operationType: true,
    }
  })

  if (!permission) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Permission not found'
    })
  }

  return {
    status: 200,
    data: {
      id: permission.id.toString(),
      code: permission.code,
      description: permission.description,
      module: permission.module,
      operationType: permission.operationType as any,
    }
  }
})
