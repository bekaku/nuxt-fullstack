import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import type { ResponseEntity } from '~/types/common'
import { serverException } from '~~/server/utils/exception'
import { validateID } from '~~/server/utils/validate'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {

  await requirePermission(event, 'permission_delete')

  const id = validateID(event)

  const db = useDb()

  const [existing] = await db
    .select({ id: schema.permission.id })
    .from(schema.permission)
    .where(eq(schema.permission.id, BigInt(id)))
    .limit(1)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Permission not found' })
  }

  try {
    // Remove role_permission links first (FK), both writes succeed or fail together.
    await db.transaction(async (tx) => {
      await tx.delete(schema.rolePermission).where(eq(schema.rolePermission.permission, BigInt(id)))
      await tx.delete(schema.permission).where(eq(schema.permission.id, BigInt(id)))
    })
  } catch (error) {
    throw serverException(error)
  }

  return {
    status: 200,
    message: 'Permission deleted successfully',
  }
})
