import { AppUser } from "~/types/models";
import { schema, useDb } from "../database/client";
import { aliasedTable, eq, and } from "drizzle-orm";

export const findUserById = async (userId: bigint): Promise<AppUser | null> => {

  const db = useDb()
  const { public: { cdnBase } } = useRuntimeConfig()
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
    .where(and(eq(schema.appUser.id, userId), eq(schema.appUser.deleted, false)))
    .leftJoin(avatarTable, eq(schema.appUser.avatarFileId, avatarTable.id))
    .leftJoin(coverTable, eq(schema.appUser.coverFileId, coverTable.id))
    .limit(1)

  if (!user) {
    return null;
  }

  const userData = mapToAppUser(user as any, {
    cdnBase: cdnBase,
    avatarPath: user.avatar || '',
    coverPath: user.cover || ''
  });

  return userData
}
