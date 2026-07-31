import { getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { ResponseEntity } from '~/types/common'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {

  await requirePermission(event, 'app_role_delete')
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Role ID is required'
    })
  }

  const db = useDb()

  try {

    //delete from appRolePermission
    await db.delete(schema.rolePermission).where(eq(schema.rolePermission.appRole, BigInt(id)))

    await db.delete(schema.appRole).where(eq(schema.appRole.id, BigInt(id)))

    return {
      status: 200,
      message: 'Role deleted successfully',
    }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
