import { count } from 'drizzle-orm'
import { ApiResponse } from '~/types/common'
import { Permission } from '~/types/models'
import { paginate } from '~~/server/utils/dbPaging'
import { schema, useDb } from '#server/database/client'
import { requirePermission } from '#server/utils/permission'

export default defineEventHandler(async (event): Promise<ApiResponse<Permission>> => {
  await requirePermission(event, 'permission_list')

  const db = useDb()
  const dataQuery = db
    .select({
      id: schema.permission.id,
      code: schema.permission.code,
      operationType: schema.permission.operationType,
      module: schema.permission.module,
      description: schema.permission.description,
    })
    .from(schema.permission)
    .$dynamic()

  const countQuery = db
    .select({ value: count() })
    .from(schema.permission)
    .$dynamic()

  return await paginate(event, {
    dataQuery,
    countQuery,
    columns: {
      code: schema.permission.code,
      module: schema.permission.module,
      operationType: schema.permission.operationType,
      description: schema.permission.description,
    },
    defaultSort: schema.permission.id,
    transform: (item) => ({
      ...item,
      id: item.id.toString(),
    })
  })
})
