import { getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { ResponseEntity } from '~/types/common'
import { Permission } from '~/types/models'

export default defineEventHandler(async (event): Promise<ResponseEntity<Permission>> => {

  await requirePermission(event, 'permission_view')

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Permission ID is required'
    })
  }

  const db = useDb()

  try {
    const permission = await db.query.permission.findFirst({
      where: eq(schema.permission.id, BigInt(id)),
      columns: {
        id: true,
        code: true,
        description: true,
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
        operationType: permission.operationType as any,
      }
    }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
