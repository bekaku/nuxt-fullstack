import { getAuthUser } from '../../utils/permission'
import { eq, or } from 'drizzle-orm'
import { useDb, schema } from '../../database/client'
import { AppUser } from '~/types/models'
import { ResponseEntity } from '~/types/common'
export default defineEventHandler(async (event): Promise<ResponseEntity<AppUser>> => {
  const userAuth = getAuthUser(event)
  if (!userAuth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }

  const db = useDb()

  const [user] = await db
    .select()
    .from(schema.appUser)
    .where(eq(schema.appUser.id, userAuth.sub as any))
    .limit(1)

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found.' })
  }
  const { roles, permissions } = await loadUserPermissions(user.id)
  return {
    status: 200,
    data: {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      selectedRoles: roles,
      permissions,
    }
  }
})
