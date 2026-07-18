import { count } from 'drizzle-orm'
import { ApiResponse } from '~/types/common'
import { AppUser } from '~/types/models'
import { paginate } from '~~/server/utils/dbPaging'
import { schema, useDb } from '#server/database/client'
import { requirePermission } from '#server/utils/permission'

/**
* Example of a route protected by the "app_user_list" permission.
* Permission name structure: "<table name>_<action name>"
* http://localhost:3000/api/users?page=0&size=10&sort=email,asc&sort=id,asc&search=active=true,email:example.com,createdDate>=2026-07-18
*/
export default defineEventHandler(async (event): Promise<ApiResponse<AppUser>> => {
  await requirePermission(event, 'app_user_list')
  const db = useDb()

  const dataQuery = db
    .select({
      id: schema.appUser.id,
      email: schema.appUser.email,
      username: schema.appUser.username,
      active: schema.appUser.active,
      createdDate: schema.appUser.createdDate,
    })
    .from(schema.appUser)
    .$dynamic()

  const countQuery = db
    .select({ value: count() })
    .from(schema.appUser)
    .$dynamic()

  return await paginate(event, {
    dataQuery,
    countQuery,
    columns: {
      id: schema.appUser.id,
      email: schema.appUser.email,
      active: schema.appUser.active,
      createdDate: schema.appUser.createdDate,
    },
    defaultSort: schema.appUser.id,
    transform: (item) => ({
      ...item,
      id: item.id.toString(),
    })
  })
})
/** how to call paginate with join multiple table
import { eq, count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDb()

// 1. Create a base query to retrieve data (feel free to add joins)
// Remember to always put .$dynamic() at the end.
  const dataQuery = db
    .select({
      id: schema.appUser.id,
      email: schema.appUser.email,
      roleName: schema.appRole.name, // Retrieved from the Role table
    })
    .from(schema.appUser)
    .leftJoin(schema.appRole, eq(schema.appUser.roleId, schema.appRole.id))
    .$dynamic()

 // 2. Create a Base Query to count the number.
  const countQuery = db
    .select({ value: count() })
    .from(schema.appUser)
    .leftJoin(schema.appRole, eq(schema.appUser.roleId, schema.appRole.id))
    .$dynamic()

  return await paginate(event, {
    dataQuery,
    countQuery,

   // 3. Clearly bind field names to the table to prevent duplicate names during joins.
    columns: {
      id: schema.appUser.id,
      email: schema.appUser.email,
      roleName: schema.appRole.name, // If the client sends ?search=roleName:admin, it will look at this column.
    },
    defaultSort: schema.appUser.id,
   // You can use columns across tables.
   //Global Search: Suppose the client sends ?keyword=example.com. Create an ILIKE condition for all columns specified in searchColumns.
    searchColumns: [schema.appUser.email, schema.appRole.name],
    transform: (item) => ({
      ...item,
      id: item.id.toString(),
    })
  })
})
 */
