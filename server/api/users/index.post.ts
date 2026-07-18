import { z } from 'zod'
import { useDb, schema } from '#server/database/client'
import { requirePermission } from '#server/utils/permission'
import { hashPassword } from '#server/utils/password'
import { nextId } from '#server/utils/snowflake'
import { AppUser } from '~/types/models'

const bodySchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(100),
  password: z.string().min(8),
})

export default defineEventHandler(async (event): Promise<AppUser> => {
  await requirePermission(event, 'app_user_add')

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const { hash } = await hashPassword(body.password)

  const [created] = await db
    .insert(schema.appUser)
    .values({
      id: nextId(),
      email: body.email,
      username: body.username,
      password: hash,
      active: true,
      deleted: false,
      createdDate: new Date(),
    })
    .returning({
      id: schema.appUser.id,
      email: schema.appUser.email,
      username: schema.appUser.username,
      active: schema.appUser.active,
    })

  if (!created) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create user.' })
  }
  setResponseStatus(event, 201)
  return {
    id: created.id.toString(),
    email: created.email,
    username: created.username,
    active: created.active,
  }
})
