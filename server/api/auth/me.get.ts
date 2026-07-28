import { getAuthUser } from '../../utils/permission'
import { aliasedTable, eq, or } from 'drizzle-orm'
import { useDb, schema } from '../../database/client'
import { AppUser } from '~/types/models'
import { ResponseEntity } from '~/types/common'
import { mapToAppUser } from '~~/server/utils/modelMapper'
export default defineEventHandler(async (event): Promise<ResponseEntity<AppUser>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }
  const { public: { cdnBase } } = useRuntimeConfig()
  const db = useDb()
  const avatarTable = aliasedTable(schema.fileManager, 'avatar_table')
  const coverTable = aliasedTable(schema.fileManager, 'cover_table')
  const [user] = await db
    .select({
      id: schema.appUser.id,
      email: schema.appUser.email,
      username: schema.appUser.username,
      active: schema.appUser.active,
      createdDate: schema.appUser.createdDate,
      avatar: avatarTable.filePath,
      cover: coverTable.filePath
    })
    .from(schema.appUser)
    .where(eq(schema.appUser.id, auth.sub as any))
    .leftJoin(avatarTable, eq(schema.appUser.avatarFileId, avatarTable.id))
    .leftJoin(coverTable, eq(schema.appUser.coverFileId, coverTable.id))
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

  const userData = mapToAppUser(user as any, {
    cdnBase: cdnBase,
    avatarPath: user.avatar || '',
    coverPath: user.cover ||''
  });
  return {
    status: 200,
    data: {
      ...userData,
      selectedRoles: roles,
      permissions,
      favoriteMenus
    }
  }
})
