import { getAuthUser } from '../../utils/permission'
import { eq, or } from 'drizzle-orm'
import { useDb, schema } from '../../database/client'
import { AppUser } from '~/types/models'
import { ResponseEntity } from '~/types/common'
export default defineEventHandler(async (event): Promise<ResponseEntity<AppUser>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }

  const db = useDb()

  const [user] = await db
    .select({
      id: schema.appUser.id,
      email: schema.appUser.email,
      username: schema.appUser.username
    })
    .from(schema.appUser)
    .where(eq(schema.appUser.id, auth.sub as any))
    .limit(1)

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found.' })
  }
  const { roles, permissions } = await loadUserPermissions(user.id)

  const favoriteMenus = await db
    .select({
      url: schema.favoriteMenu.url,
    })
    .from(schema.favoriteMenu)
    .where(eq(schema.favoriteMenu.appUser, BigInt(auth.sub)))
  return {
    status: 200,
    data: {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      selectedRoles: roles,
      permissions,
      favoriteMenus
    }
  }
})
