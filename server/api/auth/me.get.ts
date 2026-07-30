import { eq } from 'drizzle-orm'
import { ResponseEntity } from '~/types/common'
import { AppUser } from '~/types/models'
import { findUserById } from '~~/server/utils/user'
import { schema, useDb } from '../../database/client'
import { getAuthUser } from '../../utils/permission'
export default defineEventHandler(async (event): Promise<ResponseEntity<AppUser>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }
  const db = useDb()
  const user = await findUserById(BigInt(auth.sub))

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found.' })
  }
  const { roles, permissions } = await loadUserPermissions(BigInt(auth.sub))

  const favoriteMenus = await db
    .select({
      url: schema.favoriteMenu.url,
    })
    .from(schema.favoriteMenu)
    .where(eq(schema.favoriteMenu.appUser, BigInt(auth.sub)))

  return {
    status: 200,
    data: {
      ...user,
      selectedRoles: roles,
      permissions,
      favoriteMenus
    }
  }
})
