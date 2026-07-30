import { schema, useDb } from '#server/database/client'
import { hashPassword } from '#server/utils/password'
import { requireAnyPermission } from '#server/utils/permission'
import { and, eq, ne, or } from 'drizzle-orm'
import { z } from 'zod'
import { ResponseEntity } from '~/types/common'
import { AppUser } from '~/types/models'
import { deleteFileManager } from '~~/server/utils/files'
import { findUserById } from '~~/server/utils/user'

const bodySchema = z.object({
  id: z.string().nullish(),
  email: z.email().min(5),
  username: z.string().min(3).max(100),
  password: z.string().min(8).optional().or(z.literal('')),
  active: z.boolean().nullish(),
  avatarFileId: z.string().nullish(),
  coverFileId: z.string().nullish(),
  selectedRoles: z.array(z.string()).nullish(),
})

export default defineEventHandler(async (event): Promise<ResponseEntity<AppUser>> => {
  await requireAnyPermission(event, ['app_user_add', 'app_user_edit'])

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const auth = getAuthUser(event)

  const duplicateCondition = or(
    eq(schema.appUser.email, body.email),
    eq(schema.appUser.username, body.username)
  )

  const checkCondition = body.id
    ? and(ne(schema.appUser.id, BigInt(body.id)), duplicateCondition)
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

  let resultUser;

  //update mode
  if (body.id) {

    // check if the user exists
    const [existUser] = await db
      .select({
        id: schema.appUser.id,
        avatarFileId: schema.appUser.avatarFileId,
        coverFileId: schema.appUser.coverFileId,
      })
      .from(schema.appUser)
      .where(eq(schema.appUser.id, BigInt(body.id)))
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
      active: body.active,
      updatedUser: BigInt(auth.sub)
    }

    if (body.password) {
      const { hash } = await hashPassword(body.password)
      updateData.password = hash
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
      .where(eq(schema.appUser.id, BigInt(body.id)))
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

    resultUser = updated
  } else {
    // create mode
    if (!body.password) {
      throw createError({ statusCode: 400, statusMessage: 'A password is required to create a new user.' })
    }

    const { hash } = await hashPassword(body.password)

    const [created] = await db
      .insert(schema.appUser)
      .values({
        email: body.email,
        username: body.username,
        password: hash,
        active: body.active || true,
        avatarFileId: body.avatarFileId ? BigInt(body.avatarFileId) : null,
        coverFileId: body.coverFileId ? BigInt(body.coverFileId) : null,
        createdUser: BigInt(auth.sub),
        updatedUser: BigInt(auth.sub)
      })
      .returning({
        id: schema.appUser.id,
      })

    resultUser = created
    setResponseStatus(event, 201)
  }

  if (!resultUser) {
    throw createError({ statusCode: 500, statusMessage: 'Data saving failed.' })
  }

  const result = await db.transaction(async (tx) => {
    // Clear all existing permissions first to prepare for installing new ones.
    const currentUserId = BigInt(resultUser.id);
    await tx
      .delete(schema.appUserRole)
      .where(eq(schema.appUserRole.appUser, currentUserId));

    if (body.selectedRoles && (body.selectedRoles.length > 0)) {

      // Format the data as an array of objects for bulk insertion.
      const useRoleData = body.selectedRoles.map((permissionId: string) => ({
        appUser: currentUserId,
        appRole: BigInt(permissionId)
      }));

      await tx.insert(schema.appUserRole).values(useRoleData);
    }
  })

  const data = await findUserById(BigInt(resultUser.id))
  if (!data) {
    throw createError({ statusCode: 500, statusMessage: 'Data saving failed.' })
  }
  return {
    status: 200,
    data
  }
})
