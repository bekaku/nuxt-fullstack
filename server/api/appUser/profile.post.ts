import { schema, useDb } from '#server/database/client'
import { requireAnyPermission } from '#server/utils/permission'
import { and, eq, ne, or } from 'drizzle-orm'
import { z } from 'zod'
import { ResponseEntity } from '~/types/common'
import { AppUser } from '~/types/models'
import { deleteFileManager } from '~~/server/utils/files'
import { findUserById } from '~~/server/utils/user'

const bodySchema = z.object({
  email: z.email().min(5),
  username: z.string().min(3).max(100),
  avatarFileId: z.string().nullish(),
  coverFileId: z.string().nullish(),
})

export default defineEventHandler(async (event): Promise<ResponseEntity<AppUser>> => {

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const auth = getAuthUser(event)
  if (!auth.sub) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' })
  }


  const duplicateCondition = or(
    eq(schema.appUser.email, body.email),
  )

  const checkCondition = auth.sub
    ? and(ne(schema.appUser.id, BigInt(auth.sub)), duplicateCondition)
    : duplicateCondition

  const [existingUser] = await db
    .select({ email: schema.appUser.email, username: schema.appUser.username })
    .from(schema.appUser)
    .where(checkCondition)
    .limit(1)

  if (existingUser) {
    if (existingUser.email === body.email) {
      throw createError({ statusCode: 409, statusMessage: 'This email address is already in use.' })
    }
    throw createError({ statusCode: 409, statusMessage: 'This username is already in use.' })
  }

  // check if the user exists
  const [existUser] = await db
    .select({
      id: schema.appUser.id,
      avatarFileId: schema.appUser.avatarFileId,
      coverFileId: schema.appUser.coverFileId,
    })
    .from(schema.appUser)
    .where(eq(schema.appUser.id, BigInt(auth.sub)))
    .limit(1)
  if (!existUser) {
    throw serverException({
      statusCode: 404,
      statusMessage: 'Data not found'
    })
  }


  const updateData: any = {
    email: body.email,
    username: body.username,
    updatedUser: BigInt(auth.sub)
  }

  if (body.avatarFileId) {
    updateData.avatarFileId = body.avatarFileId
  }
  if (body.coverFileId) {
    updateData.coverFileId = body.coverFileId
  }

  const [updated] = await db
    .update(schema.appUser)
    .set(updateData)
    .where(eq(schema.appUser.id, BigInt(auth.sub)))
    .returning({
      id: schema.appUser.id,
    })


  //delete old file if exist
  if (body.avatarFileId) {

    //delete old avatar if exist
    if (existUser.avatarFileId) {
      await deleteFileManager(existUser.avatarFileId);
    }
  }
  if (body.coverFileId) {
    //delete old cover if exist
    if (existUser.coverFileId) {
      await deleteFileManager(existUser.coverFileId);
    }
  }


  if (!updated) {
    throw createError({ statusCode: 500, statusMessage: 'Data saving failed.' })
  }

  const data = await findUserById(BigInt(updated.id))
  if (!data) {
    throw createError({ statusCode: 500, statusMessage: 'Data saving failed.' })
  }
  return {
    status: 200,
    data
  }
})
