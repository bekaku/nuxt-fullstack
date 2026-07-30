import { getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { ResponseEntity } from '~/types/common'
import { AppRole } from '~/types/models'
import { validateID } from '~~/server/utils/validate'

export default defineEventHandler(async (event): Promise<ResponseEntity<AppRole>> => {

  await requirePermission(event, 'app_role_view')
  const id = validateID(event)

  const db = useDb()

  const rows = await db
      .select({
        roleId: schema.appRole.id,
        roleName: schema.appRole.name,
        roleActive: schema.appRole.active,
        permissionId: schema.rolePermission.permission,
      })
      .from(schema.appRole)
      .leftJoin(
        schema.rolePermission,
        eq(schema.appRole.id, schema.rolePermission.appRole)
      )
      .where(eq(schema.appRole.id, BigInt(id)))

    if (!rows || rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Role not found' })
    }

    const role = rows[0]
    if(!role) {
      throw createError({ statusCode: 404, statusMessage: 'Role not found' })
    }

    const selectedPermissions = rows
      .map(row => row.permissionId?.toString())
      .filter(Boolean) as string[]

    return {
      status: 200,
      data: {
        id: role.roleId,
        name: role.roleName,
        active: role.roleActive || false,
        selectdPermissions: selectedPermissions
      }
    }
})
