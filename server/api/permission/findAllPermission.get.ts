import { AnyColumn, count, asc } from 'drizzle-orm'
import { ApiResponse, ResponseEntity } from '~/types/common'
import { Permission } from '~/types/models'
import { paginate } from '~~/server/utils/dbPaging'
import { schema, useDb } from '#server/database/client'
import { requirePermission } from '#server/utils/permission'

export default defineEventHandler(async (event): Promise<ResponseEntity<Permission[]>> => {
  await requireAnyPermission(event, ['permission_list', 'app_role_add', 'app_role_edit'])

  const db = useDb()
  const dataQuery = await db
    .select({
      id: schema.permission.id,
      code: schema.permission.code,
      operationType: schema.permission.operationType,
      module: schema.permission.module,
      description: schema.permission.description,
    })
    .from(schema.permission)
    .orderBy(asc(schema.permission.code))

  return {
    status: 200,
    data: dataQuery
  }
})
