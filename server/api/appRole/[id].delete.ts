import { count, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import type { ResponseEntity } from '~/types/common'
import { serverException } from '~~/server/utils/exception'
import { validateID } from '~~/server/utils/validate'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {

  await requirePermission(event, 'app_role_delete')
  const id = validateID(event)

  const db = useDb()

  const [role] = await db
    .select({ id: schema.appRole.id })
    .from(schema.appRole)
    .where(eq(schema.appRole.id, BigInt(id)))
    .limit(1)

  if (!role) {
    throw createError({ statusCode: 404, statusMessage: 'Role not found' })
  }

  // app_user_role references app_role: refuse instead of failing with an FK error.
  const [assigned] = await db
    .select({ value: count() })
    .from(schema.appUserRole)
    .where(eq(schema.appUserRole.appRole, BigInt(id)))

  if (assigned && assigned.value > 0) {
    throw createError({ statusCode: 409, statusMessage: 'This role is assigned to users. Remove it from users first.' })
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(schema.rolePermission).where(eq(schema.rolePermission.appRole, BigInt(id)))
      await tx.delete(schema.appRole).where(eq(schema.appRole.id, BigInt(id)))
    })
  } catch (error) {
    throw serverException(error)
  }

  return {
    status: 200,
    message: 'Role deleted successfully',
  }
})
