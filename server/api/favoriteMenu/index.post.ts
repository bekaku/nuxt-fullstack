import { z } from 'zod'
import { useDb, schema } from '#server/database/client'
import { requirePermission } from '#server/utils/permission'
import { hashPassword } from '#server/utils/password'
import { nextId } from '#server/utils/snowflake'
import { AppUser, FavoriteMenu } from '~/types/models'
import { ResponseEntity } from '~/types/common'
import { eq, and } from 'drizzle-orm'

const bodySchema = z.object({
  url: z.string().trim().min(1),
})

export default defineEventHandler(async (event): Promise<ResponseEntity<FavoriteMenu>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  //find favorite menu by url
  const [favoriteMenu] = await db
    .select({
      url: schema.favoriteMenu.url,
    })
    .from(schema.favoriteMenu)
    .where(and(eq(schema.favoriteMenu.url, body.url), eq(schema.favoriteMenu.appUser, BigInt(auth.sub))))
    .limit(1)
  if (!favoriteMenu) {

    const [created] = await db
      .insert(schema.favoriteMenu)
      .values({
        id: nextId(),
        url: body.url,
        appUser: BigInt(auth.sub),
      })
      .returning({
        id: schema.favoriteMenu.id,
        url: schema.favoriteMenu.url,
        appUser: schema.favoriteMenu.appUser,
      })

    if (!created) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create favorite menu.' })
    }
    return {
      status: 200,
      data: {
        id: created.id.toString(),
        url: created.url,
        appUser: created.appUser,
      }
    }
  }
  return {
    status: 200,
  }
})
