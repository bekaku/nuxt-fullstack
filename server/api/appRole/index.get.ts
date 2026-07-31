import { schema, useDb } from '#server/database/client'
import { requirePermission } from '#server/utils/permission'
import { count, eq } from 'drizzle-orm'
import { ApiResponse, ResponseEntity } from '~/types/common'
import { AppRole } from '~/types/models'
import { paginate } from '~~/server/utils/dbPaging'

export default defineEventHandler(async (event): Promise<ResponseEntity<ApiResponse<AppRole>>> => {
  await requirePermission(event, 'app_role_list')

  const db = useDb()
  const dataQuery = db
    .select({
      id: schema.appRole.id,
      name: schema.appRole.name,
      active: schema.appRole.active,
    })
    .from(schema.appRole)
    .$dynamic()

  const countQuery = db
    .select({ value: count() })
    .from(schema.appRole)
    .$dynamic()

  const data = await paginate(event, {
    dataQuery,
    countQuery,
    columns: {
      id: schema.appRole.id,
      name: schema.appRole.name,
      active: schema.appRole.active,
    },
    defaultSort: schema.appRole.name,
  })

  return {
    status: 200,
    data
  }
})
