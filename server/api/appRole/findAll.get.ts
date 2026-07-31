import { schema, useDb } from '#server/database/client'
import { asc, eq } from 'drizzle-orm'
import { ResponseEntity } from '~/types/common'
import { AppRole } from '~/types/models'

export default defineEventHandler(async (event): Promise<ResponseEntity<AppRole[]>> => {
  await requireAnyPermission(event, ['app_role_list', 'app_user_add', 'app_user_edit'])

  const db = useDb()
  const dataQuery = await db
    .select({
      id: schema.appRole.id,
      name: schema.appRole.name,
      active: schema.appRole.active,
    })
    .from(schema.appRole)
    .where(eq(schema.appRole.active, true))
    .orderBy(asc(schema.appRole.name))

  const data = dataQuery.map((r) => ({
    id: r.id.toString(),
    name: r.name || '',
    active: r.active || false,
    selectdPermissions: []
  }))
  return {
    status: 200,
    data
  }
})
